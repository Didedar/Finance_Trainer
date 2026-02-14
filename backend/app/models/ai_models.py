from sqlalchemy import Column, Integer, String, Text, DateTime, Float, ForeignKey, func
from sqlalchemy.orm import relationship
from ..database import Base


class ChatMessage(Base):
    """Stores AI coach chat history per user per lesson."""
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=False, index=True)
    role = Column(String(20), nullable=False)  # 'user' or 'assistant'
    content = Column(Text, nullable=False)
    prompt_version = Column(String(20), default="v1")
    tokens_used = Column(Integer, default=0)
    latency_ms = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", backref="chat_messages")
    lesson = relationship("Lesson", backref="chat_messages")

    def __repr__(self):
        return f"<ChatMessage(id={self.id}, user={self.user_id}, lesson={self.lesson_id}, role='{self.role}')>"


class RegeneratedContent(Base):
    """Caches regenerated lesson variants keyed by params hash."""
    __tablename__ = "regenerated_content"

    id = Column(Integer, primary_key=True, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=False, index=True)
    user_level = Column(Integer, nullable=False)
    params_hash = Column(String(64), nullable=False, index=True)
    content_json = Column(Text, nullable=False)
    prompt_version = Column(String(20), default="v1")
    tokens_used = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    lesson = relationship("Lesson", backref="regenerated_content")

    def __repr__(self):
        return f"<RegeneratedContent(lesson={self.lesson_id}, hash='{self.params_hash}')>"


class DictionaryCache(Base):
    """Caches AI-generated finance term definitions."""
    __tablename__ = "dictionary_cache"

    id = Column(Integer, primary_key=True, index=True)
    term = Column(String(200), nullable=False, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=True)
    user_level = Column(Integer, nullable=False, default=1)
    definition = Column(Text, nullable=False)
    example = Column(Text, nullable=False)
    mini_test_json = Column(Text, nullable=False, default="[]")
    prompt_version = Column(String(20), default="v1")
    tokens_used = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    lesson = relationship("Lesson", backref="dictionary_entries")

    def __repr__(self):
        return f"<DictionaryCache(term='{self.term}', level={self.user_level})>"
