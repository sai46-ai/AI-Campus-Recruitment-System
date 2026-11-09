"""
AI Resume Analysis Service - FastAPI Application
Python 3.14 Compatible - Robust startup with graceful degradation

Integrated with:
- POST /analyze/match: Optimized for Student-Pro dynamic matching
"""

import os
import sys
import logging
from typing import Optional, List, Dict, Any

# Configure logging FIRST
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s'
)
logger = logging.getLogger(__name__)

logger.info(f"[STARTUP] Python version: {sys.version}")
logger.info(f"[STARTUP] Python executable: {sys.executable}")

# ============================================================================
# Safe FastAPI Import (CRITICAL)
# ============================================================================
try:
    from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Body
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
    allow_origins=list(set(settings.ALLOWED_ORIGINS + ["http://localhost:5173"])),
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "Accept", "X-Correlation-ID", "X-Request-ID"],
    expose_headers=["X-Correlation-ID"],
)

@app.middleware("http")
async def correlation_and_logging_middleware(request, call_next):
    corr_id = request.headers.get("x-correlation-id") or request.headers.get("x-request-id")
    if not corr_id:
        import uuid
        corr_id = str(uuid.uuid4())
    import time
    start_time = time.time()
    response = await call_next(request)
    duration_ms = round((time.time() - start_time) * 1000, 2)
    response.headers["X-Correlation-ID"] = corr_id
    if request.url.path not in ["/health", "/"]:
        logger.info(f"[{corr_id}] {request.method} {request.url.path} {response.status_code} ({duration_ms}ms)")
    return response

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
        "modules": MODULE_STATUS,
    }

@app.get("/", tags=["System"])
async def root():
    return {"service": "AI Resume Analysis Service", "version": "2.1.0"}

@app.post("/analyze/file", response_model=ResumeParseResponse, tags=["Analysis"])
async def analyze_file(
    file: UploadFile = File(...),
    required_skills: str = Form(""),
    job_description: Optional[str] = Form(None),
):
    filename = file.filename or "resume.pdf"
    ext = os.path.splitext(filename)[1].lower()
    if ext not in {".pdf", ".docx", ".doc"}:
        raise HTTPException(status_code=400, detail="Only PDF, DOCX, and DOC files are allowed")

    file_bytes = await file.read()
    skills_list = [s.strip() for s in required_skills.split(",") if s.strip()]

    result = analyze_resume(
        file_bytes=file_bytes,
        filename=filename,
        required_skills=skills_list,
        job_description=job_description,
    )

    if not result.get("success", False):
        return ResumeParseResponse(
            success=False,
            message=result.get("message", "Analysis failed"),
            error=result.get("error"),
            data=None,
        )

    return ResumeParseResponse(
        success=True,
        message=result.get("message", "Completed"),
        data=result.get("data"),
    )

@app.post("/analyze/text", response_model=ResumeParseResponse, tags=["Analysis"])
async def analyze_text(request: SkillMatchRequest):
    result = analyze_text_only(
        resume_text=request.resume_text,
        required_skills=request.required_skills,
        student_skills=request.student_skills,
    )
    if not result.get("success", False):
        return ResumeParseResponse(
            success=False,
            message=result.get("message", "Text analysis failed"),
            error=result.get("error"),
            data=None,
        )
    return ResumeParseResponse(
        success=True,
        message=result.get("message", "Completed"),
        data=result.get("data"),
    )

@app.post("/analyze/match", tags=["Analysis"])
async def analyze_job_match(request: Dict[str, Any] = Body(...)):
    """
    Compares a student's extracted skills against a job's specific requirements.
    """
    student_skills = request.get("student_skills", [])
    job_requirements = request.get("job_requirements", [])

    if not job_requirements:
        raise HTTPException(status_code=400, detail="Job requirements are empty")

    try:
        from app.skill_matcher import match_skills, calculate_skill_coverage, get_missing_skills

        match_results = match_skills(student_skills, job_requirements)
        matched_count, total_required, coverage = calculate_skill_coverage(match_results)
        missing = get_missing_skills(match_results)

        return {
            "success": True,
            "match_score": round(coverage, 2),
            "data": {
                "matched_skills": [m["required_skill"] for m in match_results if m["matched"]],
                "missing_skills": missing,
                "matched_count": matched_count,
                "total_required": total_required,
            },
        }
    except Exception as e:
        logger.error(f"Job matching failed: {e}")
        raise HTTPException(status_code=500, detail=f"Job matching failed: {str(e)}")

@app.post("/analyze/match/batch", tags=["Analysis"])
async def analyze_job_match_batch(request: Dict[str, Any] = Body(...)):
    """
    Compares a student's extracted skills against multiple jobs' requirements in one batch request.
    """
    try:
        student_skills = request.get("student_skills", [])
        jobs = request.get("jobs", [])

        if not jobs:
            return {"success": True, "scores": {}}

        from app.skill_matcher import match_skills, calculate_skill_coverage

        scores = {}
        for job in jobs:
            job_id = job.get("id")
            job_requirements = job.get("required_skills", [])

            if not job_requirements:
                scores[job_id] = 0.0
                continue

            match_results = match_skills(student_skills, job_requirements)
            _, _, coverage = calculate_skill_coverage(match_results)
            scores[job_id] = round(coverage, 2)

        return {
            "success": True,
            "scores": scores,
        }
    except Exception as e:
        logger.error(f"Batch job matching failed: {e}")
        return {"success": False, "scores": {}, "error": str(e)}

@app.post("/analyze/skills", tags=["Analysis"])
async def analyze_skills_only(
    student_skills: List[str] = Body(default=[]),
    required_skills: List[str] = Body(default=[]),
):
    from app.skill_matcher import match_skills, calculate_skill_coverage, get_missing_skills
    match_results = match_skills(student_skills, required_skills)
    matched_count, total_req, coverage = calculate_skill_coverage(match_results)
    missing = get_missing_skills(match_results)
    return {
        "success": True,
        "final_score": round(coverage, 2),
        "matched_count": matched_count,
        "total_required": total_req,
        "missing_skills": missing,
    }

# ============================================================================
# Main Entry Point
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)