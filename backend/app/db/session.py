"""
Database session dependency
Path: app/db/session.py
"""
from app.core.database import SessionLocal

def get_db():
    """
    Dependency that provides a database session.
    Automatically closes the session after request is complete.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()