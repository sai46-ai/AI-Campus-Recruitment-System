"""
AI Resume Analysis Service - Configuration
Loads environment variables and provides application settings.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)


class Settings:
    """Application settings loaded from environment."""
    
    # Server
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", 8000))
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    
    # CORS
    ALLOWED_ORIGINS: list = os.getenv(
        "ALLOWED_ORIGINS", 
        "http://localhost:5000,http://localhost:3000"
    ).split(",")
    
    # NLP Models
    SPACY_MODEL: str = os.getenv("SPACY_MODEL", "en_core_web_sm")
    USE_GPU: bool = os.getenv("USE_GPU", "false").lower() == "true"
    
    # File limits
    MAX_FILE_SIZE_MB: int = 5
    ALLOWED_EXTENSIONS: set = {".pdf", ".docx"}
    
    # Skill matching thresholds
    MIN_MATCH_SCORE: float = 0.3  # Minimum semantic similarity for skill match
    EXCELLENT_MATCH_THRESHOLD: int = 80
    GOOD_MATCH_THRESHOLD: int = 60
    FAIR_MATCH_THRESHOLD: int = 40


settings = Settings()
