from app.database import SessionLocal, engine, Base
from app.models.lesson import LessonContent
from sqlalchemy import text


def clear_content():
    db = SessionLocal()
    try:
        deleted = db.query(LessonContent).delete()
        db.commit()
        try:
            pass
        except:
            pass
        print(f"Successfully deleted {deleted} generated lesson content records.")
    except Exception as e:
        print(f"Error deleting content: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    clear_content()
