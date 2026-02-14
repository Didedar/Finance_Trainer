"""
Tests for the AI service layer — prompt construction, caching, rate limiting.
"""
import json
import pytest
from unittest.mock import patch, MagicMock

from app.services.ai_service import (
    _params_hash,
    _clean_json,
    _parse_json,
    _check_rate_limit,
    _rate_limits,
    RATE_LIMIT_MAX,
    coach_chat,
    regenerate_lesson,
    generate_life_example,
    dictionary_lookup,
)
from app.services.prompt_registry import get_prompt, PROMPTS, LEVEL_DESCRIPTIONS
from app.models.ai_models import DictionaryCache


class TestPromptRegistry:
    """Test prompt template retrieval and formatting."""

    def test_get_prompt_coach(self):
        prompt = get_prompt("coach_v1")
        assert prompt["version"] == "coach_v1"
        assert "system" in prompt
        assert "{lesson_title}" in prompt["system"]

    def test_get_prompt_regenerate(self):
        prompt = get_prompt("regenerate_v1")
        assert prompt["version"] == "regenerate_v1"
        assert "template" in prompt
        assert "{difficulty}" in prompt["template"]

    def test_get_prompt_life_example(self):
        prompt = get_prompt("life_example_v1")
        assert "{income_type}" in prompt["template"]
        assert "{amount}" in prompt["template"]

    def test_get_prompt_dictionary(self):
        prompt = get_prompt("dictionary_v1")
        assert "{term}" in prompt["template"]
        assert "{level}" in prompt["template"]

    def test_get_prompt_missing_key(self):
        with pytest.raises(KeyError):
            get_prompt("nonexistent_prompt")

    def test_level_descriptions_complete(self):
        for level in range(1, 6):
            assert level in LEVEL_DESCRIPTIONS
            assert len(LEVEL_DESCRIPTIONS[level]) > 0


class TestJsonParsing:
    """Test JSON cleaning and parsing from Gemini responses."""

    def test_clean_json_plain(self):
        result = _clean_json('{"key": "value"}')
        assert result == '{"key": "value"}'

    def test_clean_json_with_markdown_fence(self):
        text = '```json\n{"key": "value"}\n```'
        result = _clean_json(text)
        assert result == '{"key": "value"}'

    def test_clean_json_with_surrounding_text(self):
        text = 'Here is the result:\n{"key": "value"}\nThat was the output.'
        result = _clean_json(text)
        assert result == '{"key": "value"}'

    def test_parse_json_valid(self):
        result = _parse_json('{"lesson_text": "Hello", "flashcards": []}')
        assert result["lesson_text"] == "Hello"
        assert result["flashcards"] == []

    def test_parse_json_with_fence(self):
        result = _parse_json('```json\n{"answer": 42}\n```')
        assert result["answer"] == 42


class TestCacheHashing:
    """Test deterministic hash generation for regeneration cache."""

    def test_same_params_same_hash(self):
        h1 = _params_hash(1, 1, {"difficulty": "easier", "length": "shorter"})
        h2 = _params_hash(1, 1, {"difficulty": "easier", "length": "shorter"})
        assert h1 == h2

    def test_different_params_different_hash(self):
        h1 = _params_hash(1, 1, {"difficulty": "easier"})
        h2 = _params_hash(1, 1, {"difficulty": "harder"})
        assert h1 != h2

    def test_different_lesson_different_hash(self):
        h1 = _params_hash(1, 1, {"difficulty": "easier"})
        h2 = _params_hash(2, 1, {"difficulty": "easier"})
        assert h1 != h2


class TestRateLimiter:
    """Test rate limiting behavior."""

    def setup_method(self):
        """Clear rate limit state before each test."""
        _rate_limits.clear()

    def test_allows_first_call(self):
        assert _check_rate_limit(user_id=999) is True

    def test_allows_multiple_under_limit(self):
        for _ in range(RATE_LIMIT_MAX - 1):
            assert _check_rate_limit(user_id=998) is True

    def test_blocks_when_exceeded(self):
        for _ in range(RATE_LIMIT_MAX):
            _check_rate_limit(user_id=997)
        assert _check_rate_limit(user_id=997) is False

    def test_different_users_independent(self):
        for _ in range(RATE_LIMIT_MAX):
            _check_rate_limit(user_id=996)
        assert _check_rate_limit(user_id=996) is False
        assert _check_rate_limit(user_id=995) is True  # different user


class TestCoachChat:
    """Test coach chat service with mocked Gemini."""

    @patch("app.services.ai_service._call_gemini")
    def test_coach_chat_success(self, mock_gemini, db_session, test_user, test_lesson):
        mock_gemini.return_value = "Great question! Budgeting helps you track where your money goes."
        _rate_limits.clear()

        user, _ = test_user
        result = coach_chat(
            db=db_session,
            user_id=user.id,
            lesson_id=test_lesson.id,
            user_message="What is budgeting?",
            user_level=1,
            recent_quiz_errors=[],
        )

        assert result.reply == "Great question! Budgeting helps you track where your money goes."
        assert len(result.history) >= 2  # user msg + assistant msg
        assert result.history[-2].role == "user"
        assert result.history[-1].role == "assistant"

    @patch("app.services.ai_service._call_gemini")
    def test_coach_chat_fallback_on_error(self, mock_gemini, db_session, test_user, test_lesson):
        mock_gemini.side_effect = RuntimeError("API DOWN")
        _rate_limits.clear()

        user, _ = test_user
        result = coach_chat(
            db=db_session,
            user_id=user.id,
            lesson_id=test_lesson.id,
            user_message="Help me",
            user_level=1,
        )

        # Should return graceful fallback, not raise
        assert "trouble connecting" in result.reply.lower() or len(result.reply) > 0

    def test_coach_chat_invalid_lesson(self, db_session, test_user):
        _rate_limits.clear()
        user, _ = test_user
        with pytest.raises(ValueError, match="not found"):
            coach_chat(
                db=db_session,
                user_id=user.id,
                lesson_id=99999,
                user_message="Hi",
            )


class TestDictionaryLookup:
    """Test dictionary lookup with caching."""

    @patch("app.services.ai_service._call_gemini")
    def test_dictionary_caches_result(self, mock_gemini, db_session, test_user, test_lesson):
        mock_gemini.return_value = json.dumps({
            "definition": "A budget is a financial plan",
            "example": "Making a monthly plan for income and expenses",
            "mini_test": [
                {"question": "What is a budget?", "options": ["A plan", "A tax", "A loan", "A stock"], "correct_index": 0}
            ],
        })
        _rate_limits.clear()

        user, _ = test_user
        result = dictionary_lookup(
            db=db_session,
            user_id=user.id,
            term="budget",
            lesson_id=test_lesson.id,
            user_level=1,
        )

        assert result.term == "budget"
        assert "plan" in result.definition.lower()
        assert len(result.mini_test) == 1

        # Second call should use cache (not call Gemini)
        mock_gemini.reset_mock()
        result2 = dictionary_lookup(
            db=db_session,
            user_id=user.id,
            term="budget",
            lesson_id=test_lesson.id,
            user_level=1,
        )
        mock_gemini.assert_not_called()
        assert result2.definition == result.definition
