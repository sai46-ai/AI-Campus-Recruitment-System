import logging
from typing import Optional, List, Dict, Any

# Configure logging
logger = logging.getLogger(__name__)

# Safe imports with fallbacks
try:
    from .parser import parse_document, clean_text, get_word_count, validate_file
except ImportError as e:
    logger.error(f"[ANALYZER] Parser module failed: {e}")
    raise

try:
    from .skill_extractor import (
        extract_skills_from_text,
        detect_sections,
        extract_experience,
        extract_education,
        extract_certifications,
        calculate_resume_quality_score,
    )
except ImportError as e:
    logger.error(f"[ANALYZER] Skill extractor failed: {e}")
    raise

try:
    from .skill_matcher import (
        match_skills,
        calculate_skill_coverage,
        get_missing_skills,
        calculate_experience_score,
        calculate_education_score,
        generate_recommendations,
        generate_summary,
    )
except ImportError as e:
    logger.error(f"[ANALYZER] Skill matcher failed: {e}")
    raise

# Models are required for the Student-Pro architecture
try:
    from .models import (
        AIAnalysisResult,
        ScoreBreakdown,
        ExtractedSkill,
        SkillMatchResult,
        ResumeSection,
        ExperienceEntry,
        EducationEntry,
    )
    MODELS_AVAILABLE = True
except ImportError:
    logger.error("[ANALYZER] Critical models missing. Cannot complete startup.")
    MODELS_AVAILABLE = False


def analyze_text_only(
    resume_text: str, 
    required_skills: List[str], 
    student_skills: Optional[List[str]] = None
) -> Dict[str, Any]:
    """
    NEW: Analyzes raw text for skill matching. 
    Required to fix the 'cannot import name analyze_text_only' startup error.
    """
    try:
        # Use provided skills or extract from text if empty
        skills_to_use = student_skills if student_skills else [s["skill"] for s in extract_skills_from_text(resume_text)]
        
        match_results_raw = match_skills(skills_to_use, required_skills)
        matched_count, total_req, coverage = calculate_skill_coverage(match_results_raw)
        missing = get_missing_skills(match_results_raw)

        # Baseline breakdown for text-only
        breakdown = ScoreBreakdown(
            skill_coverage_score=coverage,
            experience_score=50.0,
            education_score=50.0,
            resume_quality_score=70.0
        )

        return {
            "success": True,
            "data": {
                "final_score": round(breakdown.weighted_total, 2),
                "skill_coverage_percent": coverage,
                "missing_skills": missing,
                "matched_skills_count": matched_count,
                "total_required_skills": total_req
            }
        }
    except Exception as e:
        logger.error(f"Text-only analysis failed: {e}")
        return {"success": False, "error": str(e)}


def analyze_resume(
    file_bytes: bytes,
    filename: str,
    required_skills: List[str],
    job_description: Optional[str] = None,
    max_file_size_mb: int = 5
) -> Dict[str, Any]:
    """
    Complete resume analysis pipeline optimized for student profiles (75% Skills Weight).
    """
    logger.info(f"[ANALYZER] Starting analysis for: {filename}")
    
    validation_error = validate_file(file_bytes, filename, max_file_size_mb)
    if validation_error:
        return {"success": False, "message": "File validation failed", "error": validation_error}
    
    raw_text, parse_error = parse_document(file_bytes, filename)
    if parse_error:
        return {"success": False, "message": "Document parsing failed", "error": parse_error}
    
    text = clean_text(raw_text)
    word_count = get_word_count(text)
    
    if word_count < 20:
        return {"success": False, "message": "Insufficient content", "error": "Resume has too little content."}
    
    # Extract skills
    extracted_skills_raw = extract_skills_from_text(text)
    extracted_skills = [
        ExtractedSkill(skill=s["skill"], confidence=s["confidence"], category=s.get("category"))
        for s in extracted_skills_raw
    ]
    extracted_skill_names = [s["skill"] for s in extracted_skills_raw]
    
    # Detect sections
    sections_dict = detect_sections(text)
    detected_sections = [ResumeSection(name=name, present=present) for name, present in sections_dict.items()]
    missing_sections = [name for name, present in sections_dict.items() if not present]
    
    # Extract structured data
    experiences_raw = extract_experience(text)
    experiences = [ExperienceEntry(**e) for e in experiences_raw]
    education_raw = extract_education(text)
    education = [EducationEntry(**e) for e in education_raw]
    certifications = extract_certifications(text)
    
    # Match skills with normalization
    match_results_raw = match_skills(extracted_skill_names, required_skills)
    skill_matches = [
        SkillMatchResult(
            required_skill=m["required_skill"],
            matched=m["matched"],
            matched_to=m.get("matched_to"),
            similarity_score=m["similarity_score"]
        )
        for m in match_results_raw
    ]
    
    matched_count, total_required, skill_coverage = calculate_skill_coverage(match_results_raw)
    missing_skills = get_missing_skills(match_results_raw)
    
    # Component scores
    skill_coverage_score = skill_coverage
    experience_score = calculate_experience_score(experiences_raw)
    education_score = calculate_education_score(education_raw)
    resume_quality_score = calculate_resume_quality_score(text, sections_dict)
    
    # --- STUDENT-PRO WEIGHTS (75% Skills) ---
    score_breakdown = ScoreBreakdown(
        skill_coverage_score=skill_coverage_score,
        experience_score=experience_score,
        education_score=education_score,
        resume_quality_score=resume_quality_score
    )
    
    # Final score using the internal property
    final_score = round(score_breakdown.weighted_total, 2)
    
    # Feedback
    recommendations = generate_recommendations(missing_skills, missing_sections, skill_coverage, resume_quality_score)
    summary = generate_summary(final_score, skill_coverage, matched_count, total_required, bool(experiences_raw), bool(education_raw))
    
    result = AIAnalysisResult(
        final_score=final_score,
        score_breakdown=score_breakdown,
        extracted_skills=extracted_skills,
        skill_matches=skill_matches,
        matched_skills_count=matched_count,
        total_required_skills=total_required,
        skill_coverage_percent=skill_coverage,
        missing_skills=missing_skills,
        detected_sections=detected_sections,
        missing_sections=missing_sections,
        experience=experiences,
        education=education,
        certifications=certifications,
        recommendations=recommendations,
        summary=summary,
        resume_word_count=word_count
    )
    
    return {"success": True, "message": "Analysis successful", "data": result}