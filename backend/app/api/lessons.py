import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models.lesson import Lesson, LessonContent
from ..models.user import User
from ..models.progress import UserProgress
from ..schemas.lesson import (
    LessonResponse, LessonListResponse, LessonContentResponse,
    LevelResponse, ModuleResponse, FlashcardSchema, QuizQuestionSchema
)
from ..services.auth import get_current_user
from ..services.gemini import GeminiService

router = APIRouter()

LEVEL_TITLES = {
    1: "Beginner",
    2: "Intermediate",
    3: "Advanced",
    4: "Expert",
    5: "Master",
}

MODULE_TITLES = {
    1: {
        1: "Money & Basic Rules",
        2: "Budgeting & Expense Control",
        3: "Banks & Financial Security",
    },
    2: {
        1: "Debts & Credits",
        2: "Savings & Financial Goals",
        3: "Risks & Insurance",
    },
    3: {
        1: "Investments — Basics",
        2: "Taxes & Legal Aspects",
        3: "Financial Psychology & Habits",
    },
    4: {
        1: "Income, Career & Business Logic",
        2: "Automated Financial Systems",
        3: "Real Estate & Major Decisions",
    },
    5: {
        1: "Portfolio & Long-term Strategy",
        2: "Financial Freedom & Life Plan",
        3: "High-Level Financial Mindset",
    },
}


@router.get("", response_model=LessonListResponse)
async def get_lessons(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    lessons = db.query(Lesson).order_by(Lesson.level, Lesson.module, Lesson.lesson_number).all()
    
    progress_map = {}
    user_progress = db.query(UserProgress).filter(
        UserProgress.user_id == current_user.id,
        UserProgress.completed == True
    ).all()
    for p in user_progress:
        progress_map[p.lesson_id] = True
    
    content_ids = set(
        row[0] for row in db.query(LessonContent.lesson_id).all()
    )
    
    levels_dict = {}
    for lesson in lessons:
        if lesson.level not in levels_dict:
            levels_dict[lesson.level] = {}
        if lesson.module not in levels_dict[lesson.level]:
            levels_dict[lesson.level][lesson.module] = []
        
        levels_dict[lesson.level][lesson.module].append(
            LessonResponse(
                id=lesson.id,
                level=lesson.level,
                module=lesson.module,
                lesson_number=lesson.lesson_number,
                title=lesson.title,
                topic_key=lesson.topic_key,
                has_content=lesson.id in content_ids,
                is_completed=progress_map.get(lesson.id, False)
            )
        )
    
    levels = []
    for level_num in sorted(levels_dict.keys()):
        modules = []
        for module_num in sorted(levels_dict[level_num].keys()):
            modules.append(ModuleResponse(
                module_number=module_num,
                module_title=MODULE_TITLES.get(level_num, {}).get(module_num, f"Module {module_num}"),
                lessons=levels_dict[level_num][module_num]
            ))
        
        is_locked = False
        if level_num > 1:
            prev_level_lessons = db.query(Lesson).filter(Lesson.level == level_num - 1).count()
            prev_level_completed = db.query(UserProgress).join(Lesson).filter(
                UserProgress.user_id == current_user.id,
                UserProgress.completed == True,
                Lesson.level == level_num - 1
            ).count()
            
            if prev_level_lessons > 0 and prev_level_completed < prev_level_lessons:
                is_locked = True
        
        levels.append(LevelResponse(
            level_number=level_num,
            level_title=LEVEL_TITLES.get(level_num, f"Level {level_num}"),
            modules=modules,
            is_locked=is_locked
        ))
    
    return LessonListResponse(levels=levels)


@router.get("/{lesson_id}", response_model=LessonResponse)
async def get_lesson(
    lesson_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    if lesson.level > 1:
        prev_level_lessons = db.query(Lesson).filter(Lesson.level == lesson.level - 1).count()
        prev_level_completed = db.query(UserProgress).join(Lesson).filter(
            UserProgress.user_id == current_user.id,
            UserProgress.completed == True,
            Lesson.level == lesson.level - 1
        ).count()
        
        if prev_level_lessons > 0 and prev_level_completed < prev_level_lessons:
            is_lesson_completed = db.query(UserProgress).filter(
                UserProgress.user_id == current_user.id,
                UserProgress.lesson_id == lesson_id,
                UserProgress.completed == True
            ).first() is not None
            
            if not is_lesson_completed:
                raise HTTPException(
                    status_code=403, 
                    detail=f"Content locked. Please complete Level {lesson.level - 1} first."
                )
    
    has_content = db.query(LessonContent).filter(LessonContent.lesson_id == lesson_id).first() is not None
    is_completed = db.query(UserProgress).filter(
        UserProgress.user_id == current_user.id,
        UserProgress.lesson_id == lesson_id,
        UserProgress.completed == True
    ).first() is not None
    
    return LessonResponse(
        id=lesson.id,
        level=lesson.level,
        module=lesson.module,
        lesson_number=lesson.lesson_number,
        title=lesson.title,
        topic_key=lesson.topic_key,
        has_content=has_content,
        is_completed=is_completed
    )


@router.post("/{lesson_id}/generate", response_model=LessonContentResponse)
async def generate_lesson_content(
    lesson_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    gemini_service = GeminiService()
    existing_content = gemini_service.get_content(db, lesson_id)
    
    if existing_content:
        flashcards = [FlashcardSchema(**fc) for fc in json.loads(existing_content.flashcards_json)]
        quiz = [QuizQuestionSchema(**q) for q in json.loads(existing_content.quiz_json)]
        return LessonContentResponse(
            lesson_id=lesson_id,
            lesson_text=existing_content.lesson_text,
            flashcards=flashcards,
            quiz=quiz,
            created_at=existing_content.created_at
        )
    
    generated = gemini_service.generate_content(lesson)
    content = gemini_service.save_content(db, lesson, generated)
    
    return LessonContentResponse(
        lesson_id=lesson_id,
        lesson_text=content.lesson_text,
        flashcards=generated.flashcards,
        quiz=generated.quiz,
        created_at=content.created_at
    )


@router.get("/{lesson_id}/content", response_model=LessonContentResponse)
async def get_lesson_content(
    lesson_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    content = db.query(LessonContent).filter(LessonContent.lesson_id == lesson_id).first()
    if not content:
        raise HTTPException(
            status_code=404, 
            detail="Content not generated yet. Call POST /lessons/{id}/generate first."
        )
    
    flashcards = [FlashcardSchema(**fc) for fc in json.loads(content.flashcards_json)]
    quiz = [QuizQuestionSchema(**q) for q in json.loads(content.quiz_json)]
    
    return LessonContentResponse(
        lesson_id=lesson_id,
        lesson_text=content.lesson_text,
        flashcards=flashcards,
        quiz=quiz,
        created_at=content.created_at
    )


@router.delete("/{lesson_id}/content")
async def delete_lesson_content(
    lesson_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    content = db.query(LessonContent).filter(LessonContent.lesson_id == lesson_id).first()
    if content:
        db.delete(content)
        db.commit()
        return {"message": "Content deleted successfully"}
    return {"message": "No content to delete"}


@router.post("/{lesson_id}/regenerate", response_model=LessonContentResponse)
async def regenerate_lesson_content(
    lesson_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    existing = db.query(LessonContent).filter(LessonContent.lesson_id == lesson_id).first()
    if existing:
        db.delete(existing)
        db.commit()
    
    gemini_service = GeminiService()
    generated = gemini_service.generate_content(lesson)
    content = gemini_service.save_content(db, lesson, generated)
    
    return LessonContentResponse(
        lesson_id=lesson_id,
        lesson_text=content.lesson_text,
        flashcards=generated.flashcards,
        quiz=generated.quiz,
        created_at=content.created_at
    )
