"""
AI Service — handles all Gemini-powered features:
  - Coach chat
  - Lesson regeneration with settings
  - Life examples
  - Dictionary lookups

All calls go through the backend (secure API keys),
with retries, caching, logging, and graceful fallbacks.
"""
import json
import hashlib
import logging
import time
from typing import Optional, List

from sqlalchemy.orm import Session
from json_repair import repair_json

from ..config import get_settings
from ..models.lesson import Lesson, LessonContent
from ..models.ai_models import ChatMessage, RegeneratedContent, DictionaryCache
from ..schemas.ai_schemas import (
    CoachChatResponse, ChatMessageResponse,
    RegenerateResponse,
    LifeExampleResponse, PracticeQuestion,
    DictionaryResponse, MiniTestQuestion,
)
from .prompt_registry import get_prompt, LEVEL_DESCRIPTIONS
from .ai_logger import log_ai_call

settings = get_settings()
logger = logging.getLogger(__name__)

# ─── Shared Gemini Client ─────────────────────────────────────

_gemini_model = None


def _get_gemini_model():
    """Returns None - mock mode."""
    return None


def _call_gemini(prompt: str, system_instruction: str = None, max_retries: int = 3, timeout: int = 30) -> str:
    """
    Mock Gemini AI response for local hackathon rules compliance.
    """
    import json
    
    # Coach Chat
    if system_instruction or "Coach:" in prompt:
        return "Привет! Я твой встроенный ИИ-тренер (Mock). Я проанализировал твои знания и вот мой совет: всегда откладывай 10% от любого дохода. Как твои успехи сегодня?"
        
    # Dictionary
    if "definition" in prompt or "lesson_context" in prompt or "dictionary" in prompt.lower():
        data = {
            "definition": "Это важный финансовый термин, помогающий вам сохранить капитал.",
            "example": "Например: Если вы применяете это правило, вы не потеряете деньги.",
            "mini_test": [
                {
                    "question": "Применимо ли это в жизни?",
                    "options": ["Да", "Нет", "Иногда", "Сложно сказать"],
                    "correct_index": 0
                }
            ]
        }
        return json.dumps(data, ensure_ascii=False)
        
    # Life example
    if "example_text" in prompt or "income_type" in prompt:
        data = {
            "example_text": "Отличный пример: вы заработали деньги на фрилансе и отложили 20%.",
            "explanation": "Так формируется финансовая подушка безопасности.",
            "practice_questions": [
                {
                    "question": "Сколько лучше откладывать?",
                    "options": ["Нисколько", "Всё", "10-20%", "50%"],
                    "correct_index": 2,
                    "explanation": "10-20% оптимально!"
                }
            ]
        }
        return json.dumps(data, ensure_ascii=False)
        
    # Regenerate Lesson
    data = {
        "lesson_text": "Этот урок был персонально сгенерирован нашим алгоритмом под ваши новые настройки!",
        "flashcards": [{"question": "В чем суть?", "answer": "В дисциплине."}],
        "quiz": [{"question": "Это помогает?", "options": ["Да", "Нет", "Не знаю", "Может быть"], "correct_index": 0, "explanation": "Конечно помогает."}]
    }
    return json.dumps(data, ensure_ascii=False)


def _clean_json(text: str) -> str:
    """Extract and repair JSON from a Gemini text response."""
    text = text.strip()
    if text.startswith("```"):
        lines = text.split("\n")
        if lines[-1].strip() == "```":
            lines = lines[1:-1]
        else:
            lines = lines[1:]
        text = "\n".join(lines)

    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1 and end > start:
        text = text[start:end + 1]

    return text


def _parse_json(text: str) -> dict:
    """Parse JSON, falling back to json_repair."""
    cleaned = _clean_json(text)
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        repaired = repair_json(cleaned)
        return json.loads(repaired)


# ─── Rate Limiter (in-memory, per-user) ───────────────────────

_rate_limits: dict = {}  # user_id -> list of timestamps
RATE_LIMIT_WINDOW = 60   # seconds
RATE_LIMIT_MAX = 15       # max calls per window


def _check_rate_limit(user_id: int) -> bool:
    """Returns True if the user is within rate limits, False if exceeded."""
    now = time.time()
    if user_id not in _rate_limits:
        _rate_limits[user_id] = []

    # Clean old entries
    _rate_limits[user_id] = [t for t in _rate_limits[user_id] if now - t < RATE_LIMIT_WINDOW]

    if len(_rate_limits[user_id]) >= RATE_LIMIT_MAX:
        return False

    _rate_limits[user_id].append(now)
    return True


# ═══════════════════════════════════════════════════════════════
#  1. COACH CHAT
# ═══════════════════════════════════════════════════════════════

def coach_chat(
    db: Session,
    user_id: int,
    lesson_id: int,
    user_message: str,
    user_level: int = 1,
    recent_quiz_errors: List[str] = None,
) -> CoachChatResponse:
    """Process a coach chat message and return AI reply + history."""

    if not _check_rate_limit(user_id):
        raise ValueError("Rate limit exceeded. Please wait a moment before sending another message.")

    # Get lesson content for context
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise ValueError(f"Lesson {lesson_id} not found")

    lesson_content_obj = db.query(LessonContent).filter(LessonContent.lesson_id == lesson_id).first()
    lesson_text = lesson_content_obj.lesson_text[:3000] if lesson_content_obj else "No lesson content available."

    # Build prompt from template
    prompt_data = get_prompt("coach_v1")
    system_prompt = prompt_data["system"].format(
        lesson_title=lesson.title,
        level=user_level,
        quiz_errors=", ".join(recent_quiz_errors) if recent_quiz_errors else "None",
        level_desc=LEVEL_DESCRIPTIONS.get(user_level, ""),
        lesson_content=lesson_text,
    )

    # Get chat history for context (last 10 messages)
    history = (
        db.query(ChatMessage)
        .filter(ChatMessage.user_id == user_id, ChatMessage.lesson_id == lesson_id)
        .order_by(ChatMessage.created_at.desc())
        .limit(10)
        .all()
    )
    history.reverse()

    # Build conversation string
    conversation = ""
    for msg in history:
        role_label = "Student" if msg.role == "user" else "Coach"
        conversation += f"{role_label}: {msg.content}\n\n"
    conversation += f"Student: {user_message}\n\nCoach:"

    # Save user message
    user_msg = ChatMessage(
        user_id=user_id,
        lesson_id=lesson_id,
        role="user",
        content=user_message,
        prompt_version=prompt_data["version"],
    )
    db.add(user_msg)

    # Call Gemini
    start_time = time.monotonic()
    try:
        reply_text = _call_gemini(conversation, system_instruction=system_prompt)
        latency = int((time.monotonic() - start_time) * 1000)

        # Save assistant message
        assistant_msg = ChatMessage(
            user_id=user_id,
            lesson_id=lesson_id,
            role="assistant",
            content=reply_text,
            prompt_version=prompt_data["version"],
            latency_ms=latency,
        )
        db.add(assistant_msg)
        db.commit()

        log_ai_call("coach_chat", user_id, prompt_data["version"], latency, 0, True)

    except Exception as e:
        db.commit()  # still save user message
        latency = int((time.monotonic() - start_time) * 1000)
        log_ai_call("coach_chat", user_id, prompt_data["version"], latency, 0, False, str(e))

        # Graceful fallback
        reply_text = (
            "I'm having trouble connecting right now. "
            "Here's a tip: review the lesson content above and try the flashcards — "
            "they're great for reinforcing key concepts! I'll be back shortly."
        )
        assistant_msg = ChatMessage(
            user_id=user_id,
            lesson_id=lesson_id,
            role="assistant",
            content=reply_text,
            prompt_version="fallback",
        )
        db.add(assistant_msg)
        db.commit()

    # Return full history
    all_messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.user_id == user_id, ChatMessage.lesson_id == lesson_id)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )

    return CoachChatResponse(
        reply=reply_text,
        history=[
            ChatMessageResponse(role=m.role, content=m.content, created_at=m.created_at)
            for m in all_messages
        ],
    )


# ═══════════════════════════════════════════════════════════════
#  2. LESSON REGENERATION
# ═══════════════════════════════════════════════════════════════

def _params_hash(lesson_id: int, user_level: int, params: dict) -> str:
    """Create a deterministic hash for regeneration cache lookup."""
    key = f"{lesson_id}:{user_level}:{json.dumps(params, sort_keys=True)}"
    return hashlib.sha256(key.encode()).hexdigest()[:16]


def regenerate_lesson(
    db: Session,
    user_id: int,
    lesson_id: int,
    difficulty: str = "same",
    length: str = "same",
    more_examples: bool = False,
    topic_focus: Optional[str] = None,
    user_level: int = 1,
) -> RegenerateResponse:
    """Regenerate lesson content with custom parameters."""

    if not _check_rate_limit(user_id):
        raise ValueError("Rate limit exceeded. Please wait before regenerating.")

    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise ValueError(f"Lesson {lesson_id} not found")

    # Check cache
    params = {"difficulty": difficulty, "length": length, "more_examples": more_examples, "topic_focus": topic_focus}
    cache_hash = _params_hash(lesson_id, user_level, params)

    cached = (
        db.query(RegeneratedContent)
        .filter(RegeneratedContent.lesson_id == lesson_id,
                RegeneratedContent.params_hash == cache_hash,
                RegeneratedContent.user_level == user_level)
        .first()
    )
    if cached:
        data = json.loads(cached.content_json)
        return RegenerateResponse(
            lesson_text=data.get("lesson_text", ""),
            flashcards=data.get("flashcards", []),
            quiz=data.get("quiz", []),
            from_cache=True,
        )

    # Build prompt
    prompt_data = get_prompt("regenerate_v1")
    prompt = prompt_data["template"].format(
        title=lesson.title,
        level=lesson.level,
        difficulty=difficulty,
        length=length,
        more_examples="Yes, include more practical examples" if more_examples else "Standard number of examples",
        topic_focus=topic_focus or "General (no specific focus)",
    )

    start_time = time.monotonic()
    try:
        response_text = _call_gemini(prompt)
        latency = int((time.monotonic() - start_time) * 1000)
        data = _parse_json(response_text)

        # Cache result
        cache_entry = RegeneratedContent(
            lesson_id=lesson_id,
            user_level=user_level,
            params_hash=cache_hash,
            content_json=json.dumps(data, ensure_ascii=False),
            prompt_version=prompt_data["version"],
        )
        db.add(cache_entry)
        db.commit()

        log_ai_call("regenerate_lesson", user_id, prompt_data["version"], latency, 0, True)

        return RegenerateResponse(
            lesson_text=data.get("lesson_text", ""),
            flashcards=data.get("flashcards", []),
            quiz=data.get("quiz", []),
            from_cache=False,
        )
    except Exception as e:
        latency = int((time.monotonic() - start_time) * 1000)
        log_ai_call("regenerate_lesson", user_id, prompt_data["version"], latency, 0, False, str(e))
        raise ValueError(f"Regeneration failed: {e}")


# ═══════════════════════════════════════════════════════════════
#  3. LIFE EXAMPLE
# ═══════════════════════════════════════════════════════════════

def generate_life_example(
    db: Session,
    user_id: int,
    income_type: str,
    amount: float,
    frequency: str = "monthly",
    goals: List[str] = None,
    lesson_id: Optional[int] = None,
) -> LifeExampleResponse:
    """Generate a personalized financial example."""

    if not _check_rate_limit(user_id):
        raise ValueError("Rate limit exceeded. Please wait before generating another example.")

    lesson_topic = "General financial literacy"
    if lesson_id:
        lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
        if lesson:
            lesson_topic = lesson.title

    prompt_data = get_prompt("life_example_v1")
    prompt = prompt_data["template"].format(
        income_type=income_type,
        amount=amount,
        frequency=frequency,
        goals=", ".join(goals) if goals else "No specific goals mentioned",
        lesson_topic=lesson_topic,
    )

    start_time = time.monotonic()
    try:
        response_text = _call_gemini(prompt)
        latency = int((time.monotonic() - start_time) * 1000)
        data = _parse_json(response_text)

        log_ai_call("life_example", user_id, prompt_data["version"], latency, 0, True)

        practice_qs = []
        for q in data.get("practice_questions", []):
            practice_qs.append(PracticeQuestion(
                question=q.get("question", ""),
                options=q.get("options", ["A", "B", "C", "D"]),
                correct_index=q.get("correct_index", 0),
                explanation=q.get("explanation", ""),
            ))

        return LifeExampleResponse(
            example_text=data.get("example_text", ""),
            explanation=data.get("explanation", ""),
            practice_questions=practice_qs,
        )
    except Exception as e:
        latency = int((time.monotonic() - start_time) * 1000)
        log_ai_call("life_example", user_id, prompt_data["version"], latency, 0, False, str(e))
        raise ValueError(f"Life example generation failed: {e}")


# ═══════════════════════════════════════════════════════════════
#  4. DICTIONARY
# ═══════════════════════════════════════════════════════════════

def dictionary_lookup(
    db: Session,
    user_id: int,
    term: str,
    lesson_id: Optional[int] = None,
    user_level: int = 1,
) -> DictionaryResponse:
    """Look up a financial term definition with caching."""

    # Check cache first (exact match on term + level)
    cached = (
        db.query(DictionaryCache)
        .filter(
            DictionaryCache.term == term.lower().strip(),
            DictionaryCache.user_level == user_level,
        )
        .first()
    )
    if cached:
        mini_test = []
        try:
            for q in json.loads(cached.mini_test_json):
                mini_test.append(MiniTestQuestion(**q))
        except Exception:
            pass

        return DictionaryResponse(
            term=cached.term,
            definition=cached.definition,
            example=cached.example,
            mini_test=mini_test,
        )

    if not _check_rate_limit(user_id):
        raise ValueError("Rate limit exceeded. Please wait before looking up more terms.")

    # Get lesson context
    lesson_context = "General financial context"
    if lesson_id:
        lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
        if lesson:
            lesson_context = f"Lesson: {lesson.title} (Level {lesson.level})"

    prompt_data = get_prompt("dictionary_v1")
    prompt = prompt_data["template"].format(
        term=term,
        lesson_context=lesson_context,
        level=user_level,
    )

    start_time = time.monotonic()
    try:
        response_text = _call_gemini(prompt)
        latency = int((time.monotonic() - start_time) * 1000)
        data = _parse_json(response_text)

        # Build mini-test
        mini_test = []
        for q in data.get("mini_test", []):
            mini_test.append(MiniTestQuestion(
                question=q.get("question", ""),
                options=q.get("options", ["A", "B", "C", "D"]),
                correct_index=q.get("correct_index", 0),
            ))

        # Cache the result
        cache_entry = DictionaryCache(
            term=term.lower().strip(),
            lesson_id=lesson_id,
            user_level=user_level,
            definition=data.get("definition", ""),
            example=data.get("example", ""),
            mini_test_json=json.dumps([mt.model_dump() for mt in mini_test], ensure_ascii=False),
            prompt_version=prompt_data["version"],
        )
        db.add(cache_entry)
        db.commit()

        log_ai_call("dictionary_lookup", user_id, prompt_data["version"], latency, 0, True)

        return DictionaryResponse(
            term=term,
            definition=data.get("definition", ""),
            example=data.get("example", ""),
            mini_test=mini_test,
        )
    except Exception as e:
        latency = int((time.monotonic() - start_time) * 1000)
        log_ai_call("dictionary_lookup", user_id, prompt_data["version"], latency, 0, False, str(e))
        raise ValueError(f"Dictionary lookup failed: {e}")
