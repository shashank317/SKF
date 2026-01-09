from pydantic_settings import BaseSettings
from pathlib import Path

class Settings(BaseSettings):
    PROJECT_NAME: str = "SKF CAD Configurator API"
    VERSION: str = "1.0.0"


    DATABASE_URL: str = "sqlite:///./skf_configurator.db"
    BACKEND_CORS_ORIGINS: list = ["http://localhost:5173"]

    MODELS_DIR: Path = Path("public/models")
    EXPORTS_DIR: Path = Path("exports")

settings = Settings()