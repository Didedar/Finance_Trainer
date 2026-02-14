from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Float, func
from sqlalchemy.orm import relationship
from ..database import Base
import uuid


def gen_code():
    return uuid.uuid4().hex[:8].upper()


class Duel(Base):
    """1-on-1 quiz duel between two users."""
    __tablename__ = "duels"

    id = Column(Integer, primary_key=True, index=True)
    invite_code = Column(String(16), unique=True, index=True, default=gen_code)
    challenger_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    opponent_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # null until accepted
    level = Column(Integer, nullable=False, default=1)
    status = Column(String(20), nullable=False, default="pending")  # pending | active | finished
    winner_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    challenger_score = Column(Integer, default=0)
    opponent_score = Column(Integer, default=0)
    questions_json = Column(Text, nullable=True)  # stored when duel starts
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    finished_at = Column(DateTime(timezone=True), nullable=True)

    challenger = relationship("User", foreign_keys=[challenger_id])
    opponent = relationship("User", foreign_keys=[opponent_id])


class BudgetScenario(Base):
    """AI budget simulation scenario."""
    __tablename__ = "budget_scenarios"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    monthly_income = Column(Float, nullable=False)
    scenario_text = Column(Text, nullable=True)  # AI-generated scenario
    allocations_json = Column(Text, nullable=True)  # user's allocation { category: amount }
    score = Column(Integer, nullable=True)  # AI grading 0-100
    feedback = Column(Text, nullable=True)  # AI feedback
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class TrapScenario(Base):
    """Financial trap branching scenario."""
    __tablename__ = "trap_scenarios"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    scenario_type = Column(String(50), nullable=False)  # scam | pyramid | impulse | bad_loan
    scenario_json = Column(Text, nullable=True)  # full scenario tree
    user_choices = Column(Text, nullable=True)  # JSON array of choices
    outcome = Column(String(20), nullable=True)  # survived | trapped
    xp_earned = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class HabitTracker(Base):
    """21-day financial habit tracker."""
    __tablename__ = "habit_trackers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    habit_name = Column(String(200), nullable=False)
    habit_emoji = Column(String(8), nullable=True)
    target_days = Column(Integer, default=21)
    streak_current = Column(Integer, default=0)
    streak_best = Column(Integer, default=0)
    completions_json = Column(Text, nullable=True)  # JSON array of ISO dates
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
