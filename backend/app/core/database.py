from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import settings

# 1. CREATE ENGINE
# connect_args only needed for sqlite (allows multiple threads)
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False}

)

# 2. CREATE SESSION FACTORY
# autocommit=False means you control when to save
# autoflush=False means manual flushing
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# 3. CREATE BASE CLASS
# all your models will inherit from this
Base = declarative_base()
