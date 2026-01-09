from fastapi import FastAPI 
from app.core.database import engine, Base
from app.db import models

# Create tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Welcome to SKF CAD Configurator API"}