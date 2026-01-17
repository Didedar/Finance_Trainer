# API package
from fastapi import APIRouter
from .auth import router as auth_router
from .lessons import router as lessons_router
from .progress import router as progress_router

api_router = APIRouter()
api_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
api_router.include_router(lessons_router, prefix="/lessons", tags=["Lessons"])
api_router.include_router(progress_router, prefix="/progress", tags=["Progress"])
