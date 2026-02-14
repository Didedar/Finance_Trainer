"""API routes for gamification features: Duels, Budget Simulator, Traps, Habits."""
import json
from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import Optional, List

from ..database import get_db
from ..models.user import User
from ..models.gamification import Duel, BudgetScenario, TrapScenario, HabitTracker
from ..api.auth import get_current_user

router = APIRouter()

# ─────────────── Schemas ────────────────────────────────────────────

class DuelCreate(BaseModel):
    level: int = Field(1, ge=1, le=5)

class DuelJoin(BaseModel):
    invite_code: str

class DuelAnswer(BaseModel):
    duel_id: int
    score: int = Field(..., ge=0)

class DuelOut(BaseModel):
    id: int
    invite_code: str
    challenger_id: int
    challenger_name: Optional[str] = None
    opponent_id: Optional[int] = None
    opponent_name: Optional[str] = None
    level: int
    status: str
    winner_id: Optional[int] = None
    challenger_score: int
    opponent_score: int
    questions_json: Optional[str] = None
    created_at: datetime

class BudgetCreate(BaseModel):
    monthly_income: float = Field(..., gt=0)

class BudgetAllocate(BaseModel):
    scenario_id: int
    allocations: dict  # { "rent": 1200, "food": 400, ... }

class TrapStart(BaseModel):
    scenario_type: str  # scam | pyramid | impulse | bad_loan

class TrapChoice(BaseModel):
    scenario_id: int
    choice_index: int

class HabitCreate(BaseModel):
    habit_name: str = Field(..., min_length=1, max_length=200)
    habit_emoji: Optional[str] = None

class HabitOut(BaseModel):
    id: int
    habit_name: str
    habit_emoji: Optional[str]
    target_days: int
    streak_current: int
    streak_best: int
    completions: List[str]
    is_active: bool

# ─────────────── DUELS ──────────────────────────────────────────────

DUEL_QUESTIONS = {
    1: [
        {"q": "What does the 50/30/20 rule refer to?", "options": ["Investing", "Budgeting", "Tax brackets", "Interest rates"], "answer": 1},
        {"q": "What is inflation?", "options": ["Stock growth", "Decrease in money's value", "Bank fee", "Loan interest"], "answer": 1},
        {"q": "An emergency fund should cover…", "options": ["1 week", "1 month", "3-6 months", "2 years"], "answer": 2},
        {"q": "What is an asset?", "options": ["A debt you owe", "Something that loses value", "Something that generates income", "A monthly expense"], "answer": 2},
        {"q": "Which is a 'pay yourself first' habit?", "options": ["Pay bills first", "Save before spending", "Invest everything", "Borrow to save"], "answer": 1},
    ],
    2: [
        {"q": "APR stands for…", "options": ["Annual Profit Return", "Annual Percentage Rate", "Average Payment Ratio", "Asset Performance Report"], "answer": 1},
        {"q": "Snowball method pays off debt by…", "options": ["Highest balance first", "Smallest balance first", "Highest interest first", "Random order"], "answer": 1},
        {"q": "Good debt is used to…", "options": ["Buy luxury items", "Build assets or income", "Pay other debts", "Cover daily expenses"], "answer": 1},
        {"q": "A pyramid scheme…", "options": ["Is a safe investment", "Pays old investors with new money", "Is regulated by banks", "Guarantees returns"], "answer": 1},
        {"q": "Insurance helps you…", "options": ["Make money", "Transfer financial risk", "Avoid taxes", "Increase salary"], "answer": 1},
    ],
    3: [
        {"q": "Compound interest is often called…", "options": ["The 6th wonder", "The 8th wonder", "A myth", "A scam"], "answer": 1},
        {"q": "ETF stands for…", "options": ["Electronic Transfer Fee", "Exchange-Traded Fund", "Earnings Tax Form", "Equity Trading Formula"], "answer": 1},
        {"q": "Diversification means…", "options": ["All in one stock", "Spreading investments", "Borrowing more", "Selling everything"], "answer": 1},
        {"q": "Lifestyle inflation is when…", "options": ["Prices go up", "Spending rises with income", "You get a raise", "You invest more"], "answer": 1},
        {"q": "What drives impulse buying?", "options": ["Logic", "Emotions", "Research", "Planning"], "answer": 1},
    ],
}

@router.post("/duels/create", response_model=DuelOut)
async def create_duel(
    body: DuelCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    level = min(body.level, 3)
    questions = json.dumps(DUEL_QUESTIONS.get(level, DUEL_QUESTIONS[1]))
    duel = Duel(
        challenger_id=current_user.id,
        level=level,
        questions_json=questions,
    )
    db.add(duel)
    db.commit()
    db.refresh(duel)
    return _duel_out(duel, db)


@router.post("/duels/join", response_model=DuelOut)
async def join_duel(
    body: DuelJoin,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    duel = db.query(Duel).filter(Duel.invite_code == body.invite_code.upper()).first()
    if not duel:
        raise HTTPException(404, "Duel not found")
    if duel.status != "pending":
        raise HTTPException(400, "Duel already started or finished")
    if duel.challenger_id == current_user.id:
        raise HTTPException(400, "You can't join your own duel")
    duel.opponent_id = current_user.id
    duel.status = "active"
    db.commit()
    db.refresh(duel)
    return _duel_out(duel, db)


@router.post("/duels/{duel_id}/submit")
async def submit_duel_score(
    duel_id: int,
    body: DuelAnswer,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    duel = db.query(Duel).filter(Duel.id == duel_id).first()
    if not duel:
        raise HTTPException(404, "Duel not found")
    
    if current_user.id == duel.challenger_id:
        duel.challenger_score = body.score
    elif current_user.id == duel.opponent_id:
        duel.opponent_score = body.score
    else:
        raise HTTPException(403, "You are not part of this duel")
    
    # Check if both have submitted
    if duel.challenger_score > 0 and duel.opponent_score > 0:
        duel.status = "finished"
        duel.finished_at = datetime.utcnow()
        if duel.challenger_score > duel.opponent_score:
            duel.winner_id = duel.challenger_id
        elif duel.opponent_score > duel.challenger_score:
            duel.winner_id = duel.opponent_id
    
    db.commit()
    db.refresh(duel)
    return _duel_out(duel, db)


@router.get("/duels/my", response_model=List[DuelOut])
async def my_duels(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    duels = db.query(Duel).filter(
        (Duel.challenger_id == current_user.id) | (Duel.opponent_id == current_user.id)
    ).order_by(Duel.created_at.desc()).limit(20).all()
    return [_duel_out(d, db) for d in duels]


def _duel_out(duel: Duel, db: Session) -> DuelOut:
    c = db.query(User).get(duel.challenger_id) if duel.challenger_id else None
    o = db.query(User).get(duel.opponent_id) if duel.opponent_id else None
    return DuelOut(
        id=duel.id, invite_code=duel.invite_code or "",
        challenger_id=duel.challenger_id, challenger_name=c.name if c else None,
        opponent_id=duel.opponent_id, opponent_name=o.name if o else None,
        level=duel.level, status=duel.status or "pending",
        winner_id=duel.winner_id,
        challenger_score=duel.challenger_score or 0,
        opponent_score=duel.opponent_score or 0,
        questions_json=duel.questions_json, created_at=duel.created_at,
    )

# ─────────────── BUDGET SIMULATOR ──────────────────────────────────

SCENARIOS = [
    "You're a recent graduate earning ${income}/month. You just moved to a new city. "
    "Allocate your budget across: Rent, Food, Transport, Savings, Entertainment, Utilities, Clothing.",
    "You got a 20% raise! Your new income is ${income}/month. But your landlord raised rent by $200. "
    "Re-allocate wisely across: Rent, Food, Transport, Savings, Entertainment, Utilities, Insurance.",
    "Unexpected expense! Your car broke down. Repair costs $800. With ${income}/month income, "
    "plan your budget: Rent, Food, Transport, Savings, Emergency, Utilities, Debt Repayment.",
]

BUDGET_CATEGORIES = ["Rent", "Food", "Transport", "Savings", "Entertainment", "Utilities", "Other"]

@router.post("/budget/start")
async def start_budget(
    body: BudgetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    import random
    scenario_text = random.choice(SCENARIOS).replace("${income}", f"{body.monthly_income:,.0f}")
    scenario = BudgetScenario(
        user_id=current_user.id,
        monthly_income=body.monthly_income,
        scenario_text=scenario_text,
    )
    db.add(scenario)
    db.commit()
    db.refresh(scenario)
    return {
        "id": scenario.id,
        "scenario_text": scenario.scenario_text,
        "monthly_income": scenario.monthly_income,
        "categories": BUDGET_CATEGORIES,
    }


@router.post("/budget/{scenario_id}/submit")
async def submit_budget(
    scenario_id: int,
    body: BudgetAllocate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    scenario = db.query(BudgetScenario).filter(
        BudgetScenario.id == scenario_id,
        BudgetScenario.user_id == current_user.id,
    ).first()
    if not scenario:
        raise HTTPException(404, "Scenario not found")
    
    total_allocated = sum(body.allocations.values())
    scenario.allocations_json = json.dumps(body.allocations)
    
    # Score the allocation
    savings_pct = body.allocations.get("Savings", 0) / scenario.monthly_income * 100
    rent_pct = body.allocations.get("Rent", 0) / scenario.monthly_income * 100
    
    score = 50  # base
    if 15 <= savings_pct <= 30: score += 20
    elif 10 <= savings_pct < 15: score += 10
    elif savings_pct < 5: score -= 10
    
    if rent_pct <= 30: score += 15
    elif rent_pct <= 40: score += 5
    else: score -= 10
    
    if abs(total_allocated - scenario.monthly_income) <= scenario.monthly_income * 0.02:
        score += 15  # budget balances
    else:
        score -= 20
    
    score = max(0, min(100, score))
    scenario.score = score
    
    feedback_parts = []
    if savings_pct >= 20:
        feedback_parts.append("Great savings rate! You're building a solid financial cushion. 💪")
    elif savings_pct < 10:
        feedback_parts.append("Consider saving at least 10-20% of income for future security. 💡")
    if rent_pct > 40:
        feedback_parts.append("Rent is over 40% of income — look for ways to reduce housing costs. 🏠")
    if abs(total_allocated - scenario.monthly_income) > scenario.monthly_income * 0.05:
        feedback_parts.append("Your budget doesn't balance! Make sure allocations match your income. ⚖️")
    else:
        feedback_parts.append("Budget balances well — every dollar has a job! ✅")
    
    scenario.feedback = " ".join(feedback_parts)
    db.commit()
    
    return {
        "score": score,
        "feedback": scenario.feedback,
        "allocations": body.allocations,
        "savings_percent": round(savings_pct, 1),
        "rent_percent": round(rent_pct, 1),
    }

# ─────────────── FINANCIAL TRAPS ──────────────────────────────────

TRAP_SCENARIOS_DATA = {
    "scam": {
        "title": "🎭 The Investment Opportunity",
        "intro": "A friend tells you about an 'amazing investment' that guarantees 50% monthly returns.",
        "steps": [
            {"text": "Your friend says: 'I've already made $5,000 in 2 months! Just invest $1,000 to start.'",
             "choices": ["Invest $1,000 right away", "Ask for more details first", "Decline politely"],
             "safe": [1, 2], "trap": [0]},
            {"text": "They show you a fancy website with testimonials and a 'Bloomberg featured' badge.",
             "choices": ["Sign up immediately", "Check if Bloomberg actually featured them", "Ask: 'Where does the money come from?'"],
             "safe": [1, 2], "trap": [0]},
            {"text": "They pressure you: 'The offer closes tonight! Don't miss out!'",
             "choices": ["Rush to invest before deadline", "Recognize this as a pressure tactic", "Say you need to sleep on it"],
             "safe": [1, 2], "trap": [0]},
        ],
    },
    "impulse": {
        "title": "🛍️ The Flash Sale Trap",
        "intro": "Your favorite store announces a '70% OFF — TODAY ONLY!' sale.",
        "steps": [
            {"text": "The sale page shows items you've been wanting. A jacket for $200 → $60!",
             "choices": ["Add everything to cart immediately", "Check if you actually need these items", "Compare prices on other sites first"],
             "safe": [1, 2], "trap": [0]},
            {"text": "Cart total: $340. The site says: 'Spend $400 to get FREE shipping ($30 value)!'",
             "choices": ["Add more items to reach $400", "Calculate if free shipping is actually worth $60 more", "Stick with what you need"],
             "safe": [1, 2], "trap": [0]},
            {"text": "At checkout: 'Apply for our credit card and get extra 15% off!'",
             "choices": ["Apply for the credit card", "Realize store cards have high APR (25%+)", "Pay with your debit card"],
             "safe": [1, 2], "trap": [0]},
        ],
    },
    "pyramid": {
        "title": "🔺 The MLM Opportunity",
        "intro": "A colleague invites you to a 'business opportunity' seminar.",
        "steps": [
            {"text": "At the seminar, they talk about 'financial freedom' and show luxury cars.",
             "choices": ["Sign up to become a 'distributor'", "Ask: 'What product do you actually sell?'", "Notice the focus is on recruiting, not products"],
             "safe": [1, 2], "trap": [0]},
            {"text": "The starter kit costs $500. They say: 'Think of it as an investment in yourself!'",
             "choices": ["Pay $500 for the starter kit", "Ask about the return policy", "Research the company's income disclosure"],
             "safe": [1, 2], "trap": [0]},
            {"text": "They say: 'The real money is in building your team. Recruit 5 people!'",
             "choices": ["Start recruiting friends and family", "Realize this is a pyramid structure", "Ask what percentage of members actually profit"],
             "safe": [1, 2], "trap": [0]},
        ],
    },
    "bad_loan": {
        "title": "💸 The Easy Loan Trap",
        "intro": "You need $2,000 urgently. A payday lender offers 'instant approval, no credit check!'",
        "steps": [
            {"text": "The payday lender says: 'Just $50 fee per $500 borrowed. Pay back in 2 weeks!'",
             "choices": ["Take the loan — only $200 in fees!", "Calculate the actual APR (260%!)", "Explore alternatives first"],
             "safe": [1, 2], "trap": [0]},
            {"text": "You can't pay back in 2 weeks. They offer to 'roll over' for another $200 fee.",
             "choices": ["Roll over the loan", "Borrow from another lender to pay this one", "Ask about a payment plan or seek credit counseling"],
             "safe": [2], "trap": [0, 1]},
            {"text": "After 3 roll-overs, you owe $2,800 on a $2,000 loan.",
             "choices": ["Take another payday loan from a different lender", "Contact a credit counselor for help", "Set up a strict repayment plan"],
             "safe": [1, 2], "trap": [0]},
        ],
    },
}


@router.post("/traps/start")
async def start_trap(
    body: TrapStart,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if body.scenario_type not in TRAP_SCENARIOS_DATA:
        raise HTTPException(400, f"Invalid type. Choose: {list(TRAP_SCENARIOS_DATA.keys())}")
    
    scenario_data = TRAP_SCENARIOS_DATA[body.scenario_type]
    trap = TrapScenario(
        user_id=current_user.id,
        scenario_type=body.scenario_type,
        scenario_json=json.dumps(scenario_data),
        user_choices="[]",
    )
    db.add(trap)
    db.commit()
    db.refresh(trap)
    return {
        "id": trap.id,
        "title": scenario_data["title"],
        "intro": scenario_data["intro"],
        "first_step": scenario_data["steps"][0],
        "total_steps": len(scenario_data["steps"]),
    }


@router.post("/traps/{trap_id}/choose")
async def choose_trap(
    trap_id: int,
    body: TrapChoice,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    trap = db.query(TrapScenario).filter(
        TrapScenario.id == trap_id,
        TrapScenario.user_id == current_user.id,
    ).first()
    if not trap:
        raise HTTPException(404, "Scenario not found")
    
    scenario_data = json.loads(trap.scenario_json)
    choices = json.loads(trap.user_choices or "[]")
    step_idx = len(choices)
    
    if step_idx >= len(scenario_data["steps"]):
        raise HTTPException(400, "Scenario already complete")
    
    step = scenario_data["steps"][step_idx]
    is_safe = body.choice_index in step["safe"]
    choices.append({"step": step_idx, "choice": body.choice_index, "safe": is_safe})
    trap.user_choices = json.dumps(choices)
    
    # Check if scenario is done
    next_step_idx = step_idx + 1
    if next_step_idx >= len(scenario_data["steps"]):
        all_safe = all(c["safe"] for c in choices)
        trap.outcome = "survived" if all_safe else "trapped"
        trap.xp_earned = 30 if all_safe else 10
        db.commit()
        return {
            "finished": True,
            "outcome": trap.outcome,
            "xp_earned": trap.xp_earned,
            "is_safe": is_safe,
            "choices_summary": choices,
        }
    
    db.commit()
    next_step = scenario_data["steps"][next_step_idx]
    return {
        "finished": False,
        "is_safe": is_safe,
        "next_step": next_step,
        "step_number": next_step_idx + 1,
        "total_steps": len(scenario_data["steps"]),
    }


@router.get("/traps/types")
async def trap_types(current_user: User = Depends(get_current_user)):
    return [
        {"type": k, "title": v["title"], "intro": v["intro"]}
        for k, v in TRAP_SCENARIOS_DATA.items()
    ]

# ─────────────── HABIT TRACKER ─────────────────────────────────────

PRESET_HABITS = [
    {"name": "Track every expense", "emoji": "FileText"},
    {"name": "No impulse purchases", "emoji": "StopCircle"},
    {"name": "Review budget daily", "emoji": "BarChart2"},
    {"name": "Save spare change", "emoji": "PiggyBank"},
    {"name": "Read financial news", "emoji": "Newspaper"},
    {"name": "Pack lunch instead of buying", "emoji": "Utensils"},
]


@router.get("/habits")
async def get_habits(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    habits = db.query(HabitTracker).filter(
        HabitTracker.user_id == current_user.id,
    ).order_by(HabitTracker.created_at.desc()).all()
    return {
        "habits": [_habit_out(h) for h in habits],
        "presets": PRESET_HABITS,
    }


@router.post("/habits")
async def create_habit(
    body: HabitCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    active_count = db.query(HabitTracker).filter(
        HabitTracker.user_id == current_user.id,
        HabitTracker.is_active == True,
    ).count()
    if active_count >= 5:
        raise HTTPException(400, "Maximum 5 active habits. Complete or remove one first.")
    
    habit = HabitTracker(
        user_id=current_user.id,
        habit_name=body.habit_name,
        habit_emoji=body.habit_emoji,
        completions_json="[]",
    )
    db.add(habit)
    db.commit()
    db.refresh(habit)
    return _habit_out(habit)


@router.post("/habits/{habit_id}/check")
async def check_habit(
    habit_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    habit = db.query(HabitTracker).filter(
        HabitTracker.id == habit_id,
        HabitTracker.user_id == current_user.id,
    ).first()
    if not habit:
        raise HTTPException(404, "Habit not found")
    
    completions = json.loads(habit.completions_json or "[]")
    today = date.today().isoformat()
    
    if today in completions:
        raise HTTPException(400, "Already checked in today")
    
    completions.append(today)
    habit.completions_json = json.dumps(completions)
    
    # Calculate streak
    sorted_dates = sorted(completions)
    streak = 1
    for i in range(len(sorted_dates) - 1, 0, -1):
        d1 = date.fromisoformat(sorted_dates[i])
        d2 = date.fromisoformat(sorted_dates[i - 1])
        if (d1 - d2).days == 1:
            streak += 1
        else:
            break
    
    habit.streak_current = streak
    if streak > (habit.streak_best or 0):
        habit.streak_best = streak
    
    db.commit()
    db.refresh(habit)
    return _habit_out(habit)


@router.delete("/habits/{habit_id}")
async def delete_habit(
    habit_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    habit = db.query(HabitTracker).filter(
        HabitTracker.id == habit_id,
        HabitTracker.user_id == current_user.id,
    ).first()
    if not habit:
        raise HTTPException(404, "Habit not found")
    db.delete(habit)
    db.commit()
    return {"ok": True}


def _habit_out(h: HabitTracker) -> dict:
    completions = json.loads(h.completions_json or "[]")
    return {
        "id": h.id,
        "habit_name": h.habit_name,
        "habit_emoji": h.habit_emoji,
        "target_days": h.target_days or 21,
        "streak_current": h.streak_current or 0,
        "streak_best": h.streak_best or 0,
        "completions": completions,
        "is_active": h.is_active,
        "progress_percent": min(100, (len(completions) / (h.target_days or 21)) * 100),
    }
