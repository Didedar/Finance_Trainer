from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from ..database import Base


class Lesson(Base):
    __tablename__ = "lessons"
    
    id = Column(Integer, primary_key=True, index=True)
    level = Column(Integer, nullable=False, index=True)
    module = Column(Integer, nullable=False)
    lesson_number = Column(Integer, nullable=False)
    title = Column(String(255), nullable=False)
    topic_key = Column(String(100), unique=True, index=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    content = relationship("LessonContent", back_populates="lesson", uselist=False, cascade="all, delete-orphan")
    progress = relationship("UserProgress", back_populates="lesson", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Lesson(id={self.id}, level={self.level}, title='{self.title}')>"


class LessonContent(Base):
    __tablename__ = "lesson_content"
    
    id = Column(Integer, primary_key=True, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), unique=True, nullable=False)
    lesson_text = Column(Text, nullable=False)
    flashcards_json = Column(Text, nullable=False)
    quiz_json = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    lesson = relationship("Lesson", back_populates="content")
    
    def __repr__(self):
        return f"<LessonContent(lesson_id={self.lesson_id})>"
