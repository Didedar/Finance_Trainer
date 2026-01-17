from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


class ProgressResponse(BaseModel):
    lesson_id: int
    completed: bool
    completed_at: Optional[datetime] = None
    xp_earned: int
    
    class Config:
        from_attributes = True


class RecentActivity(BaseModel):
    lesson_id: int
    lesson_title: str
    completed_at: datetime
    xp_earned: int


class LevelProgress(BaseModel):
    level: int
    level_title: str
    total_lessons: int
    completed_lessons: int
    progress_percent: float
    is_locked: bool = False


class DashboardSummary(BaseModel):
    total_xp: int
    current_title: str
    next_title: Optional[str] = None
    xp_for_next_title: Optional[int] = None
    streak_days: int
    lessons_completed: int
    modules_completed: int
    levels_completed: int
    level_progress: List[LevelProgress]
    recent_activity: List[RecentActivity]


class TitleInfo(BaseModel):
    title: str
    xp_required: int
    is_current: bool
    is_achieved: bool
