from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.user import User
from ..services.auth import get_current_user
from ..services import ai_service
from ..schemas.ai_schemas import (
    CoachChatRequest, CoachChatResponse,
    RegenerateRequest, RegenerateResponse,
    LifeExampleRequest, LifeExampleResponse,
    DictionaryRequest, DictionaryResponse,
)

router = APIRouter()


@router.post("/coach", response_model=CoachChatResponse)
async def coach_chat(
    request: CoachChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """AI Financial Coach — contextual chat during lessons."""
    try:
        return ai_service.coach_chat(
            db=db,
            user_id=current_user.id,
            lesson_id=request.lesson_id,
            user_message=request.user_message,
            user_level=request.user_level,
            recent_quiz_errors=request.recent_quiz_errors,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS if "Rate limit" in str(e) else status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Coach chat error: {str(e)}")


@router.post("/lesson-regenerate", response_model=RegenerateResponse)
async def regenerate_lesson(
    request: RegenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Regenerate lesson content with custom difficulty/length/focus settings."""
    try:
        return ai_service.regenerate_lesson(
            db=db,
            user_id=current_user.id,
            lesson_id=request.lesson_id,
            difficulty=request.params.difficulty,
            length=request.params.length,
            more_examples=request.params.more_examples,
            topic_focus=request.params.topic_focus,
            user_level=1,  # TODO: inject from user profile once M5 is done
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS if "Rate limit" in str(e) else status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Regeneration error: {str(e)}")


@router.post("/life-example", response_model=LifeExampleResponse)
async def life_example(
    request: LifeExampleRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate a personalized financial example based on user's situation."""
    try:
        return ai_service.generate_life_example(
            db=db,
            user_id=current_user.id,
            income_type=request.income_type,
            amount=request.amount,
            frequency=request.frequency,
            goals=request.goals,
            lesson_id=request.lesson_id,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS if "Rate limit" in str(e) else status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Life example error: {str(e)}")


@router.post("/dictionary", response_model=DictionaryResponse)
async def dictionary_lookup(
    request: DictionaryRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Look up a financial term definition with example and mini-quiz."""
    try:
        return ai_service.dictionary_lookup(
            db=db,
            user_id=current_user.id,
            term=request.term,
            lesson_id=request.lesson_id,
            user_level=request.user_level,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS if "Rate limit" in str(e) else status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Dictionary error: {str(e)}")
