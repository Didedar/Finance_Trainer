from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, func
from sqlalchemy.orm import relationship
from ..database import Base

class BossBattle(Base):
    """Boss Fight session against AI logic."""
    __tablename__ = "boss_battles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    boss_name = Column(String(100), nullable=False)  # e.g., "Inflation Dragon", "Debt Golem"
    boss_level = Column(Integer, default=1)
    status = Column(String(20), default="active")  # active | won | lost
    
    player_hp = Column(Integer, default=100)
    boss_hp = Column(Integer, default=100)
    
    # Log of the battle: [{turn: 1, action: "attack", question_id: 5, correct: true, damage: 20}]
    battle_log_json = Column(Text, nullable=True, default="[]")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    finished_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User", back_populates="boss_battles")

# Add back-populate to User if needed, or just keep it one-way for now.
# We'll add the relationship to User model in a separate step if strictly necessary for ORM, 
# but foreign key is enough for basic queries.
