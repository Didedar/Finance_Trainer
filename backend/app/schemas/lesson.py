from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List


class FlashcardSchema(BaseModel):
    question: str
    answer: str


class QuizQuestionSchema(BaseModel):
    question: str
    options: List[str] = Field(..., min_length=4, max_length=4)
    correct_index: int = Field(..., ge=0, le=3)
    explanation: str


class GeneratedContentSchema(BaseModel):
    lesson_text: str
    flashcards: List[FlashcardSchema]
    quiz: List[QuizQuestionSchema]


class LessonResponse(BaseModel):
    id: int
    level: int
    module: int
    lesson_number: int
    title: str
    topic_key: str
    has_content: bool = False
    is_completed: bool = False
    
    class Config:
        from_attributes = True


class ModuleResponse(BaseModel):
    module_number: int
    module_title: str
    lessons: List[LessonResponse]


class LevelResponse(BaseModel):
    level_number: int
    level_title: str
    modules: List[ModuleResponse]
    is_locked: bool = False


class LessonListResponse(BaseModel):
    levels: List[LevelResponse]


class LessonContentResponse(BaseModel):
    lesson_id: int
    lesson_text: str
    flashcards: List[FlashcardSchema]
    quiz: List[QuizQuestionSchema]
    created_at: datetime
