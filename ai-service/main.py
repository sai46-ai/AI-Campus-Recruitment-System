"""
AI Resume Analysis Service - FastAPI Application
Python 3.14 Compatible - Robust startup with graceful degradation

Integrated with:
- POST /analyze/match: Optimized for Student-Pro dynamic matching
"""

import os
import sys
import logging
from typing import Optional, List

# Configure logging FIRST
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s'
)
logger = logging.getLogger(__name__)

# Log Python version immediately for debugging
logger.info(f"[STARTUP] Python version: {sys.version}")
logger.info(f"[STARTUP] Python executable: {sys.executable}")

# ============================================================================
# Safe FastAPI Import (CRITICAL)
# ============================================================================
try:
    from fastapi import FastAPI, UploadFile, File, Form, HTTPException
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.responses import JSONResponse
    logger.info("[STARTUP] FastAPI loaded successfully")
except ImportError as e:
    logger.critical(f"[STARTUP] FastAPI not installed: {e}")
    logger.critical("[STARTUP] Install with: pip install fastapi uvicorn")
    sys.exit(1)

# Add app directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# ============================================================================
# Safe Module Imports with Fallbacks
# ============================================================================

MODULE_STATUS = {
    "config": False,
    "analyzer": False,
    "models": False,
    "parser": False,
    "skill_extractor": False,
    "skill_matcher": False,
}

# Config module
try:
    from app.config import settings
    MODULE_STATUS["config"] = True
    logger.info("[STARTUP] Config module loaded")
except ImportError as e:
    logger.warning(f"[STARTUP] Config module failed: {e}")
    class FallbackSettings:
        HOST = "0.0.0.0"
        PORT = 8000
        DEBUG = True
        ALLOWED_ORIGINS = ["http://localhost:3000", "http://localhost:5000", "http://localhost:5173"]
        SPACY_MODEL = "en_core_web_sm"
    settings = FallbackSettings()

# Analyzer module
try:
    from app.analyzer import analyze_resume, analyze_text_only
    MODULE_STATUS["analyzer"] = True
    logger.info("[STARTUP] Analyzer module loaded")
except ImportError as e:
    logger.warning(f"[STARTUP] Analyzer module failed: {e}")

# Models module
try:
    from app.models import (
        SkillMatchRequest,
        ResumeParseResponse,
        HealthResponse,
        ErrorResponse,
    )
    MODULE_STATUS["models"] = True
    logger.info("[STARTUP] Models module loaded")
except ImportError as e:
    logger.warning(f"[STARTUP] Models module failed: {e}")

# Parser module
try:
    from app.parser import get_pdf_engine_info
    MODULE_STATUS["parser"] = True
    PDF_INFO = get_pdf_engine_info()
    logger.info(f"[STARTUP] Parser module loaded (PDF engine: {PDF_INFO.get('engine', 'unknown')})")
except ImportError as e:
    logger.warning(f"[STARTUP] Parser module failed: {e}")
    PDF_INFO = {"engine": "none", "available": False, "error": str(e)}

# Skill extractor module
try:
    from app.skill_extractor import get_nlp_info
    MODULE_STATUS["skill_extractor"] = True
    NLP_INFO = get_nlp_info()
    logger.info(f"[STARTUP] Skill extractor loaded (NLP engine: {NLP_INFO.get('engine', 'unknown')})")
except ImportError as e:
    logger.warning(f"[STARTUP] Skill extractor failed: {e}")
    NLP_INFO = {"engine": "regex", "available": False, "error": str(e)}

# Skill matcher module
try:
    from app.skill_matcher import get_matcher_info
    MODULE_STATUS["skill_matcher"] = True
    MATCHER_INFO = get_matcher_info()
    logger.info(f"[STARTUP] Skill matcher loaded (engine: {MATCHER_INFO.get('engine', 'unknown')})")
except ImportError as e:
    logger.warning(f"[STARTUP] Skill matcher failed: {e}")
    MATCHER_INFO = {"engine": "string", "available": False, "error": str(e)}

# ============================================================================
# FastAPI Application Setup
# ============================================================================

app = FastAPI(
    title="AI Resume Analysis Service",
    description="Python 3.14 compatible resume parsing and skill matching",
    version="2.1.0",
)

app.add_middleware(
    CORSMiddleware,
    # Updated to ensure React development environments work
    allow_origins=settings.ALLOWED_ORIGINS + ["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

models_loaded = MODULE_STATUS["analyzer"] and MODULE_STATUS["parser"]

@app.on_event("startup")
async def startup_event():
    global models_loaded
    logger.info("=" * 60)
    logger.info("AI RESUME ANALYSIS SERVICE - STARTING")
    logger.info("=" * 60)
    all_loaded = all(MODULE_STATUS.values())
    models_loaded = all_loaded or (MODULE_STATUS["parser"] and MODULE_STATUS["analyzer"])
    logger.info(f"[STARTUP] Service Readiness: {'READY' if models_loaded else 'CRITICAL FAILURE'}")
    logger.info("=" * 60)

# ============================================================================
# API Endpoints
# ============================================================================

@app.get("/health", tags=["System"])
async def health_check():
    return {
        "status": "healthy" if models_loaded else "degraded",
        "version": "2.1.0",
        "python_version": sys.version,
        "ai_modules_loaded": models_loaded,
        "pdf_engine": PDF_INFO,
        "nlp_engine": NLP_INFO,
        "matcher_engine": MATCHER_INFO,
        "modules": MODULE_STATUS
    }

@app.get("/", tags=["System"])
async def root():
    return {"service": "AI Resume Analysis Service", "version": "1.0.0"}

@app.post("/analyze/file", response_model=ResumeParseResponse, tags=["Analysis"])
async def analyze_file(
    file: UploadFile = File(...),
    required_skills: str = Form(...),
    job_description: Optional[str] = Form(None)
):
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in {".pdf", ".docx"}:
        raise HTTPException(status_code=400, detail="Only PDF and DOCX allowed")
    
    file_bytes = await file.read()
    skills_list = [s.strip() for s in required_skills.split(",") if s.strip()]
    
    result = analyze_resume(
        file_bytes=file_bytes,
        filename=file.filename,
        required_skills=skills_list,
        job_description=job_description
    )
    
    return ResumeParseResponse(
        success=result.get("success", False),
        message=result.get("message", "Completed"),
        data=result.get("data")
    )

@app.post("/analyze/text", response_model=ResumeParseResponse, tags=["Analysis"])
async def analyze_text(request: SkillMatchRequest):
    result = analyze_text_only(
        resume_text=request.resume_text,
        required_skills=request.required_skills,
        student_skills=request.student_skills
    )
    return ResumeParseResponse(success=True, data=result.get("data"))

# --- OPTIMIZED JOB-SPECIFIC MATCHING ENDPOINT ---
@app.post("/analyze/match", tags=["Analysis"])
async def analyze_job_match(request: dict):
    """
    Compares a student's extracted skills against a job's specific requirements.
    Updated to match new skill_matcher.py key names.
    """
    try:
        student_skills = request.get("student_skills", [])
        job_requirements = request.get("job_requirements", [])

        if not job_requirements:
            raise HTTPException(status_code=400, detail="Job requirements are empty")

        from app.skill_matcher import match_skills, calculate_skill_coverage, get_missing_skills
        
        # Execute matching logic
        match_results = match_skills(student_skills, job_requirements)
        matched_count, total_required, coverage = calculate_skill_coverage(match_results)
        missing = get_missing_skills(match_results)
        
        return {
            "success": True,
            "match_score": round(coverage, 2),
            "data": {
                # FIX: Corrected key to 'matched' to align with skill_matcher.py
                "matched_skills": [m['required_skill'] for m in match_results if m['matched']],
                "missing_skills": missing,
                "total_required": total_required
            }
        }
    except Exception as e:
        logger.error(f"Job matching failed: {e}")
        return {"success": False, "match_score": 0, "error": str(e)}

@app.post("/analyze/skills", tags=["Analysis"])
async def analyze_skills_only(student_skills: List[str], required_skills: List[str]):
    from app.skill_matcher import match_skills, calculate_skill_coverage
    match_results = match_skills(student_skills, required_skills)
    _, _, coverage = calculate_skill_coverage(match_results)
    return {"success": True, "final_score": round(coverage, 2)}

# ============================================================================
# Main Entry Point
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    # Use config-based settings for host and port
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)