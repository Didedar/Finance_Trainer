from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from .config import get_settings
from .database import engine, Base
from .api import api_router
from .models import User, Lesson, LessonContent, UserProgress, UserStats

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

settings = get_settings()

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Finance Trainer API",
    description="API for Financial Literacy Training Application",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")


@app.get("/")
async def root():
    return {"status": "ok", "message": "Finance Trainer API is running"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
