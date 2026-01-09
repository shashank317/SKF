from sqlalchemy.orm import Session
from app.core.database import SessionLocal

def get_db():
    """
    Dependency that provides a database session.

    usage in routes:
        @app.get("/users")
        def get_users(db: Session = Depends(get_db)):
            #db is now a database session
            users = db.query(User).all()
            return users    
    
    
    """

    db = SessionLocal()
    try:
        yield db #pauses the function until the db session is used
    finally:
        db.close()

    