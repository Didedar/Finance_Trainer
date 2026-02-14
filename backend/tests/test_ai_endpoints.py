"""
Integration tests for AI API endpoints.
"""
import json
import pytest
from unittest.mock import patch


class TestCoachEndpoint:
    """Test POST /ai/coach endpoint."""

    def test_requires_auth(self, test_client):
        response = test_client.post("/api/ai/coach", json={
            "lesson_id": 1,
            "user_message": "Hello",
        })
        assert response.status_code in [401, 403]

    @patch("app.services.ai_service._call_gemini")
    def test_coach_success(self, mock_gemini, test_client, auth_headers, test_lesson):
        mock_gemini.return_value = "Let me explain budgeting simply..."

        response = test_client.post("/api/ai/coach", json={
            "lesson_id": test_lesson.id,
            "user_message": "What is budgeting?",
            "user_level": 1,
            "recent_quiz_errors": [],
        }, headers=auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert "reply" in data
        assert "history" in data
        assert len(data["history"]) >= 2

    def test_coach_invalid_lesson(self, test_client, auth_headers):
        response = test_client.post("/api/ai/coach", json={
            "lesson_id": 99999,
            "user_message": "Hello",
        }, headers=auth_headers)
        assert response.status_code in [400, 500]

    def test_coach_empty_message(self, test_client, auth_headers, test_lesson):
        response = test_client.post("/api/ai/coach", json={
            "lesson_id": test_lesson.id,
            "user_message": "",
        }, headers=auth_headers)
        assert response.status_code == 422  # Pydantic validation


class TestRegenerateEndpoint:
    """Test POST /ai/lesson-regenerate endpoint."""

    def test_requires_auth(self, test_client):
        response = test_client.post("/api/ai/lesson-regenerate", json={
            "lesson_id": 1,
        })
        assert response.status_code in [401, 403]

    @patch("app.services.ai_service._call_gemini")
    def test_regenerate_success(self, mock_gemini, test_client, auth_headers, test_lesson):
        mock_gemini.return_value = json.dumps({
            "lesson_text": "# Simplified Budgeting\n\nBudgeting made easy...",
            "flashcards": [{"question": "Q?", "answer": "A."}],
            "quiz": [{"question": "Q?", "options": ["A", "B", "C", "D"], "correct_index": 0, "explanation": "E."}],
        })

        response = test_client.post("/api/ai/lesson-regenerate", json={
            "lesson_id": test_lesson.id,
            "params": {
                "difficulty": "easier",
                "length": "shorter",
                "more_examples": True,
            },
        }, headers=auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert "lesson_text" in data
        assert "flashcards" in data
        assert "quiz" in data


class TestLifeExampleEndpoint:
    """Test POST /ai/life-example endpoint."""

    def test_requires_auth(self, test_client):
        response = test_client.post("/api/ai/life-example", json={
            "income_type": "salary",
            "amount": 2000,
        })
        assert response.status_code in [401, 403]

    @patch("app.services.ai_service._call_gemini")
    def test_life_example_success(self, mock_gemini, test_client, auth_headers):
        mock_gemini.return_value = json.dumps({
            "example_text": "With a $2000 monthly salary...",
            "explanation": "Budget allocation matters because...",
            "practice_questions": [
                {"question": "Q?", "options": ["A", "B", "C", "D"], "correct_index": 0, "explanation": "E."}
            ],
        })

        response = test_client.post("/api/ai/life-example", json={
            "income_type": "salary",
            "amount": 2000,
            "frequency": "monthly",
            "goals": ["save", "invest"],
        }, headers=auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert "example_text" in data
        assert "practice_questions" in data
        assert len(data["practice_questions"]) >= 1

    def test_life_example_invalid_amount(self, test_client, auth_headers):
        response = test_client.post("/api/ai/life-example", json={
            "income_type": "salary",
            "amount": -100,
        }, headers=auth_headers)
        assert response.status_code == 422


class TestDictionaryEndpoint:
    """Test POST /ai/dictionary endpoint."""

    def test_requires_auth(self, test_client):
        response = test_client.post("/api/ai/dictionary", json={
            "term": "budget",
        })
        assert response.status_code in [401, 403]

    @patch("app.services.ai_service._call_gemini")
    def test_dictionary_success(self, mock_gemini, test_client, auth_headers, test_lesson):
        mock_gemini.return_value = json.dumps({
            "definition": "A budget is a financial plan",
            "example": "Creating a monthly spending plan",
            "mini_test": [
                {"question": "What is a budget?", "options": ["A plan", "A tax", "A loan", "A stock"], "correct_index": 0}
            ],
        })

        response = test_client.post("/api/ai/dictionary", json={
            "term": "budget",
            "lesson_id": test_lesson.id,
            "user_level": 1,
        }, headers=auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert data["term"] == "budget"
        assert "definition" in data
        assert "mini_test" in data

    def test_dictionary_empty_term(self, test_client, auth_headers):
        response = test_client.post("/api/ai/dictionary", json={
            "term": "",
        }, headers=auth_headers)
        assert response.status_code == 422
