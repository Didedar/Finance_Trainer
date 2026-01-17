from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..database import get_db
from ..models.user import User
from ..models.lesson import Lesson
from ..models.progress import UserProgress, UserStats, get_title_for_xp, get_xp_for_level, TITLE_THRESHOLDS
from ..schemas.progress import ProgressResponse, DashboardSummary, LevelProgress, RecentActivity
from ..services.auth import get_current_user

router = APIRouter()

LEVEL_TITLES = {
    1: "Beginner",
    2: "Intermediate", 
    3: "Advanced",
    4: "Expert",
    5: "Master",
}


@router.post("/{lesson_id}/complete", response_model=ProgressResponse)
async def complete_lesson(
    lesson_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    existing = db.query(UserProgress).filter(
        UserProgress.user_id == current_user.id,
        UserProgress.lesson_id == lesson_id
    ).first()
    
    if existing and existing.completed:
        return ProgressResponse(
            lesson_id=lesson_id,
            completed=True,
            completed_at=existing.completed_at,
            xp_earned=existing.xp_earned
        )
    
    xp_earned = get_xp_for_level(lesson.level)
    now = datetime.utcnow()
    
    if existing:
        existing.completed = True
        existing.completed_at = now
        existing.xp_earned = xp_earned
        progress = existing
    else:
        progress = UserProgress(
            user_id=current_user.id,
            lesson_id=lesson_id,
            completed=True,
            completed_at=now,
            xp_earned=xp_earned
        )
        db.add(progress)
    
    stats = db.query(UserStats).filter(UserStats.user_id == current_user.id).first()
    if not stats:
        stats = UserStats(user_id=current_user.id)
        db.add(stats)
    
    stats.total_xp += xp_earned
    stats.current_title = get_title_for_xp(stats.total_xp)
    
    today = date.today()
    if stats.last_activity_at:
        last_date = stats.last_activity_at.date() if isinstance(stats.last_activity_at, datetime) else stats.last_activity_at
        if last_date == today:
            pass
        elif (today - last_date).days == 1:
            stats.streak_days += 1
        else:
            stats.streak_days = 1
    else:
        stats.streak_days = 1
    
    stats.last_activity_at = now
    
    db.commit()
    db.refresh(progress)
    
    return ProgressResponse(
        lesson_id=lesson_id,
        completed=True,
        completed_at=progress.completed_at,
        xp_earned=xp_earned
    )


@router.get("/summary", response_model=DashboardSummary)
async def get_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stats = db.query(UserStats).filter(UserStats.user_id == current_user.id).first()
    if not stats:
        stats = UserStats(user_id=current_user.id)
        db.add(stats)
        db.commit()
        db.refresh(stats)
    
    completed_lessons = db.query(UserProgress).filter(
        UserProgress.user_id == current_user.id,
        UserProgress.completed == True
    ).count()
    
    level_progress = []
    for level in range(1, 6):
        total = db.query(Lesson).filter(Lesson.level == level).count()
        completed = db.query(UserProgress).join(Lesson).filter(
            UserProgress.user_id == current_user.id,
            UserProgress.completed == True,
            Lesson.level == level
        ).count()
        
        is_locked = False
        if level > 1:
            prev_level_progress = level_progress[level - 2]
            if prev_level_progress.progress_percent < 100:
                is_locked = True
        
        level_progress.append(LevelProgress(
            level=level,
            level_title=LEVEL_TITLES.get(level, f"Level {level}"),
            total_lessons=total,
            completed_lessons=completed,
            progress_percent=round((completed / total * 100) if total > 0 else 0, 1),
            is_locked=is_locked
        ))
    
    modules_completed = 0
    levels_completed = 0
    for lp in level_progress:
        if lp.progress_percent == 100:
            levels_completed += 1
        for module in range(1, 4):
            total_in_module = db.query(Lesson).filter(
                Lesson.level == lp.level,
                Lesson.module == module
            ).count()
            completed_in_module = db.query(UserProgress).join(Lesson).filter(
                UserProgress.user_id == current_user.id,
                UserProgress.completed == True,
                Lesson.level == lp.level,
                Lesson.module == module
            ).count()
            if total_in_module > 0 and completed_in_module == total_in_module:
                modules_completed += 1
    
    recent = db.query(UserProgress, Lesson).join(Lesson).filter(
        UserProgress.user_id == current_user.id,
        UserProgress.completed == True
    ).order_by(UserProgress.completed_at.desc()).limit(5).all()
    
    recent_activity = [
        RecentActivity(
            lesson_id=p.lesson_id,
            lesson_title=l.title,
            completed_at=p.completed_at,
            xp_earned=p.xp_earned
        ) for p, l in recent
    ]
    
    next_title = None
    xp_for_next = None
    for threshold, title in TITLE_THRESHOLDS:
        if stats.total_xp < threshold:
            next_title = title
            xp_for_next = threshold - stats.total_xp
            break
    
    return DashboardSummary(
        total_xp=stats.total_xp,
        current_title=stats.current_title,
        next_title=next_title,
        xp_for_next_title=xp_for_next,
        streak_days=stats.streak_days,
        lessons_completed=completed_lessons,
        modules_completed=modules_completed,
        levels_completed=levels_completed,
        level_progress=level_progress,
        recent_activity=recent_activity
    )
