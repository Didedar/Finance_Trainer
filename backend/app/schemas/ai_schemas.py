from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List


# ─── Coach Chat ───────────────────────────────────────────────

class CoachChatRequest(BaseModel):
    lesson_id: int
    user_message: str = Field(..., min_length=1, max_length=2000)
    user_level: int = Field(default=1, ge=1, le=5)
    recent_quiz_errors: List[str] = Field(default_factory=list)


class ChatMessageResponse(BaseModel):
    role: str
    content: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class CoachChatResponse(BaseModel):
    reply: str
    history: List[ChatMessageResponse]


# ─── Lesson Regeneration ─────────────────────────────────────

class RegenerateParams(BaseModel):
    difficulty: str = Field(default="same", pattern="^(easier|same|harder)$")
    length: str = Field(default="same", pattern="^(shorter|same|longer)$")
    more_examples: bool = False
    topic_focus: Optional[str] = Field(default=None, max_length=100)


class RegenerateRequest(BaseModel):
    lesson_id: int
    params: RegenerateParams = Field(default_factory=RegenerateParams)


class RegenerateResponse(BaseModel):
    lesson_text: str
    flashcards: list
    quiz: list
    from_cache: bool = False


# ─── Life Example ─────────────────────────────────────────────

class LifeExampleRequest(BaseModel):
    income_type: str = Field(..., pattern="^(scholarship|allowance|salary|freelance|other)$")
    amount: float = Field(..., gt=0)
    frequency: str = Field(default="monthly", pattern="^(weekly|biweekly|monthly|yearly)$")
    goals: List[str] = Field(default_factory=list, max_length=5)
    lesson_id: Optional[int] = None


class PracticeQuestion(BaseModel):
    question: str
    options: List[str]
    correct_index: int
    explanation: str


class LifeExampleResponse(BaseModel):
    example_text: str
    explanation: str
    practice_questions: List[PracticeQuestion]


# ─── Dictionary ───────────────────────────────────────────────

class DictionaryRequest(BaseModel):
    term: str = Field(..., min_length=1, max_length=200)
    lesson_id: Optional[int] = None
    user_level: int = Field(default=1, ge=1, le=5)


class MiniTestQuestion(BaseModel):
    question: str
    options: List[str]
    correct_index: int


class DictionaryResponse(BaseModel):
    term: str
    definition: str
    example: str
    mini_test: List[MiniTestQuestion]
