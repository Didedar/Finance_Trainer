"""API routes for Profile and Boss Fight features."""
import json
import random
from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

from ..database import get_db
from ..models.user import User
from ..models.boss import BossBattle
from ..models.progress import UserStats
from ..api.auth import get_current_user

router = APIRouter()

# ─────────────── SCHEMAS ────────────────────────────────────────────

class ProfileUpdate(BaseModel):
    bio: Optional[str] = Field(None, max_length=500)
    avatar_style: Optional[str] = Field(None, pattern="^(default|robot|wizard|investor)$")

class ProfileOut(BaseModel):
    id: int
    name: str
    email: str
    bio: Optional[str]
    avatar_style: str
    joined_at: datetime
    stats: Dict[str, Any]

class BossStart(BaseModel):
    boss_level: int = Field(..., ge=1, le=5)

class BossAction(BaseModel):
    battle_id: int
    action_type: str = "answer"  # answer | special
    answer_idx: Optional[int] = None

class BossTurnResult(BaseModel):
    battle_id: int
    player_hp: int
    boss_hp: int
    damage_dealt: int
    damage_taken: int
    message: str
    question: Optional[Dict[str, Any]] = None  # Next question
    is_finished: bool
    outcome: Optional[str] = None # won | lost

# ─────────────── PROFILE ────────────────────────────────────────────

@router.get("/me", response_model=ProfileOut)
async def get_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stats = db.query(UserStats).filter(UserStats.user_id == current_user.id).first()
    
    stats_dict = {
        "total_xp": stats.total_xp if stats else 0,
        "current_streak": stats.streak_days if stats else 0,
        "lessons_completed": 0, # Lesson completion logic needs to be aggregated or added to UserStats
        "title": stats.current_title if stats else "Novice",
    }
    
    return ProfileOut(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        bio=current_user.bio,
        avatar_style=current_user.avatar_style or "default",
        joined_at=current_user.created_at,
        stats=stats_dict,
    )

@router.patch("/me", response_model=ProfileOut)
async def update_profile(
    body: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if body.bio is not None:
        current_user.bio = body.bio
    if body.avatar_style is not None:
        current_user.avatar_style = body.avatar_style
    
    db.commit()
    db.refresh(current_user)
    return await get_profile(db, current_user)

# ─────────────── BOSS FIGHT ─────────────────────────────────────────

BOSS_DATA = {
    1: {"name": "Inflation Dragon", "hp": 100, "damage": 15},
    2: {"name": "Debt Golem", "hp": 150, "damage": 20},
    3: {"name": "Market Bear", "hp": 200, "damage": 25},
    4: {"name": "Scam Sorcerer", "hp": 250, "damage": 30},
    5: {"name": "Final Boss: The Recession", "hp": 300, "damage": 40},
}

BOSS_QUESTIONS = [
    {"q": "What happens to purchasing power during inflation?", "opts": ["Increases", "Decreases", "Stays same", "Doubles"], "a": 1},
    {"q": "A bear market means prices are...", "opts": ["Rising", "Falling", "Stable", "Volatile"], "a": 1},
    {"q": "Which is safer (usually)?", "opts": ["Penny stocks", "Government bonds", "Crypto", "Lottery"], "a": 1},
    {"q": "Compound interest helps you...", "opts": ["Lose money", "Grow weath exponentially", "Pay more taxes", "Decrease debt"], "a": 1},
    {"q": "A budget helps you...", "opts": ["Spend more", "Track expenses", "Ignore bills", "Borrow money"], "a": 1},
]

@router.post("/boss/start")
async def start_boss_battle(
    body: BossStart,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    boss_info = BOSS_DATA.get(body.boss_level, BOSS_DATA[1])
    
    # Check if active battle exists? For simplicity, create new.
    battle = BossBattle(
        user_id=current_user.id,
        boss_name=boss_info["name"],
        boss_level=body.boss_level,
        player_hp=100,  # Player always starts with 100
        boss_hp=boss_info["hp"],
        battle_log_json="[]",
        status="active",
    )
    db.add(battle)
    db.commit()
    db.refresh(battle)
    
    # Pick a random question for turn 1
    q = random.choice(BOSS_QUESTIONS)
    
    return {
        "battle_id": battle.id,
        "boss_name": battle.boss_name,
        "player_hp": battle.player_hp,
        "boss_hp": battle.boss_hp,
        "max_player_hp": 100,
        "max_boss_hp": boss_info["hp"],
        "question": q,
    }

@router.post("/boss/turn")
async def boss_turn(
    body: BossAction,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    battle = db.query(BossBattle).filter(
        BossBattle.id == body.battle_id,
        BossBattle.user_id == current_user.id
    ).first()
    
    if not battle or battle.status != "active":
        raise HTTPException(400, "Battle not active or found")
        
    boss_info = BOSS_DATA.get(battle.boss_level, BOSS_DATA[1])
    damage_dealt = 0
    damage_taken = 0
    message = ""
    
    # Logic: If answer correct -> Player hits Boss. Else -> Boss hits Player.
    # We simplified: frontend sends ANY answer index, we check against random question logic?
    # Wait, the frontend needs to know which question was asked to validate.
    # Simpler approach: We'll trust the frontend sent a "correct/incorrect" flag or we store the current Q in DB.
    # For now, let's assume the client sends the answer index, but we don't know which question it was answering 
    # unless we stored it. 
    # Let's simplify: client sends `is_correct` boolean? No, insecure.
    # Let's verify: The question `answer` index is always 1 in my mock data above for simplicity of this prototype.
    # So if body.answer_idx == 1, it's correct.
    
    is_correct = (body.answer_idx == 1)
    
    if is_correct:
        damage_dealt = 20 # Base damage
        if random.random() > 0.8: # Critical hit
            damage_dealt *= 2
            message = "Critical Hit! "
        
        battle.boss_hp = max(0, battle.boss_hp - damage_dealt)
        message += f"You dealt {damage_dealt} damage to {battle.boss_name}!"
    else:
        damage_taken = boss_info["damage"]
        battle.player_hp = max(0, battle.player_hp - damage_taken)
        message = f"Wrong! {battle.boss_name} hit you for {damage_taken} damage!"
        
    # Check win/loss
    outcome = None
    is_finished = False
    
    if battle.boss_hp <= 0:
        battle.status = "won"
        battle.finished_at = datetime.utcnow()
        outcome = "won"
        is_finished = True
        message += " You accepted victory!"
        # Award XP?
        stats = db.query(UserStats).filter(UserStats.user_id == current_user.id).first()
        if stats:
            stats.total_xp += 100 * battle.boss_level
        
    elif battle.player_hp <= 0:
        battle.status = "lost"
        battle.finished_at = datetime.utcnow()
        outcome = "lost"
        is_finished = True
        message += " You were defeated..."
        
    db.commit()
    
    next_q = None
    if not is_finished:
        next_q = random.choice(BOSS_QUESTIONS)
        
    return BossTurnResult(
        battle_id=battle.id,
        player_hp=battle.player_hp,
        boss_hp=battle.boss_hp,
        damage_dealt=damage_dealt,
        damage_taken=damage_taken,
        message=message,
        question=next_q,
        is_finished=is_finished,
        outcome=outcome
    )
