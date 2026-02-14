# API package
from fastapi import APIRouter
from .auth import router as auth_router
from .lessons import router as lessons_router
from .progress import router as progress_router
from .ai import router as ai_router
from .gamification import router as game_router
from .profile import router as profile_router

api_router = APIRouter()
api_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
api_router.include_router(lessons_router, prefix="/lessons", tags=["Lessons"])
api_router.include_router(progress_router, prefix="/progress", tags=["Progress"])
api_router.include_router(ai_router, prefix="/ai", tags=["AI Features"])
api_router.include_router(game_router, prefix="/game", tags=["Gamification"])
api_router.include_router(profile_router, prefix="/social", tags=["Profile & Boss"])
