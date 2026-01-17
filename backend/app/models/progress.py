from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from ..database import Base


class UserProgress(Base):
    __tablename__ = "user_progress"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=False, index=True)
    completed = Column(Boolean, default=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    xp_earned = Column(Integer, default=0)
    
    user = relationship("User", back_populates="progress")
    lesson = relationship("Lesson", back_populates="progress")
    
    def __repr__(self):
        return f"<UserProgress(user_id={self.user_id}, lesson_id={self.lesson_id}, completed={self.completed})>"


class UserStats(Base):
    __tablename__ = "user_stats"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    total_xp = Column(Integer, default=0)
    current_title = Column(String(50), default="Beginner")
    streak_days = Column(Integer, default=0)
    last_activity_at = Column(DateTime(timezone=True), nullable=True)
    
    user = relationship("User", back_populates="stats")
    
    def __repr__(self):
        return f"<UserStats(user_id={self.user_id}, xp={self.total_xp}, title='{self.current_title}')>"


TITLE_THRESHOLDS = [
    (0, "Beginner"),
    (200, "Confident"),
    (500, "Strategist"),
    (900, "Investor"),
    (1400, "Master"),
]


def get_title_for_xp(xp: int) -> str:
    current_title = "Beginner"
    for threshold, title in TITLE_THRESHOLDS:
        if xp >= threshold:
            current_title = title
    return current_title


XP_PER_LEVEL = {
    1: 20,
    2: 30,
    3: 40,
    4: 45,
    5: 50,
}


def get_xp_for_level(level: int) -> int:
    return XP_PER_LEVEL.get(level, 20)
