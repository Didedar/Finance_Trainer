"""
Test configuration — fixtures for backend tests.
"""
import sys
import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add backend directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.database import Base, get_db
from app.main import app
from app.models import User
from app.services.auth import AuthService


# In-memory SQLite for tests
SQLALCHEMY_TEST_URL = "sqlite:///./test_finance.db"

engine = create_engine(SQLALCHEMY_TEST_URL, connect_args={"check_same_thread": False})
TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session():
    """Create a fresh database for each test."""
    Base.metadata.create_all(bind=engine)
    session = TestSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def test_client(db_session):
    """FastAPI test client with overridden DB dependency."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


@pytest.fixture
def test_user(db_session):
    """Create a test user and return (user, token)."""
    auth_service = AuthService()
    user = User(
        name="Test User",
        email="test@example.com",
        password_hash=auth_service.hash_password("testpassword123"),
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    token = auth_service.create_access_token({"sub": str(user.id)})
    return user, token


@pytest.fixture
def auth_headers(test_user):
    """Auth headers for authenticated requests."""
    _, token = test_user
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def test_lesson(db_session):
    """Create a test lesson with content."""
    from app.models import Lesson, LessonContent

    lesson = Lesson(
        level=1,
        module=1,
        lesson_number=1,
        title="Introduction to Budgeting",
        topic_key="budgeting_intro",
    )
    db_session.add(lesson)
    db_session.commit()
    db_session.refresh(lesson)

    content = LessonContent(
        lesson_id=lesson.id,
        lesson_text="# Budgeting Basics\n\nBudgeting is the process of creating a plan to spend your money. This spending plan is called a budget. By creating this plan, you can determine in advance whether you will have enough money to do the things you need to do or would like to do.",
        flashcards_json='[{"question": "What is a budget?", "answer": "A spending plan for your money"}]',
        quiz_json='[{"question": "What is budgeting?", "options": ["Spending all money", "Planning spending", "Saving only", "Investing"], "correct_index": 1, "explanation": "Budgeting is creating a spending plan."}]',
    )
    db_session.add(content)
    db_session.commit()

    return lesson
