import logging
from typing import Optional, List, Dict, Any

# Configure logging
logger = logging.getLogger(__name__)

# Safe imports with fallbacks
try:
    from .parser import parse_document, clean_text, get_word_count, validate_file, extract_contact_info
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


def _build_analysis_result(
    text: str,
    required_skills: List[str],
    override_skills: Optional[List[str]] = None,
) -> AIAnalysisResult:
    word_count = get_word_count(text)
    extracted_skills_raw = extract_skills_from_text(text)

    if override_skills:
        existing_lower = {s["skill"].lower() for s in extracted_skills_raw}
        for sk in override_skills:
            if sk.strip() and sk.strip().lower() not in existing_lower:
                extracted_skills_raw.append({
                    "skill": sk.strip(),
                    "confidence": 0.95,
                    "category": "technical",
                })

    extracted_skills = [
        ExtractedSkill(skill=s["skill"], confidence=s["confidence"], category=s.get("category"))
        for s in extracted_skills_raw
    ]
    extracted_skill_names = [s["skill"] for s in extracted_skills_raw]

    sections_dict = detect_sections(text)
    detected_sections = [ResumeSection(name=name, present=present) for name, present in sections_dict.items()]
    missing_sections = [name for name, present in sections_dict.items() if not present]

    experiences_raw = extract_experience(text)
    experiences = [ExperienceEntry(**e) for e in experiences_raw]
    education_raw = extract_education(text)
    education = [EducationEntry(**e) for e in education_raw]
    certifications = extract_certifications(text)

    match_results_raw = match_skills(extracted_skill_names, required_skills)
    skill_matches = [
        SkillMatchResult(
            required_skill=m["required_skill"],
            matched=m["matched"],
            matched_to=m.get("matched_to"),
            similarity_score=m["similarity_score"],
        )
        for m in match_results_raw
    ]

    matched_count, total_required, skill_coverage = calculate_skill_coverage(match_results_raw)
    missing_skills = get_missing_skills(match_results_raw)

    skill_coverage_score = skill_coverage
    experience_score = calculate_experience_score(experiences_raw)
    education_score = calculate_education_score(education_raw)
    resume_quality_score = calculate_resume_quality_score(text, sections_dict)

    score_breakdown = ScoreBreakdown(
        skill_coverage_score=skill_coverage_score,
        experience_score=experience_score,
        education_score=education_score,
        resume_quality_score=resume_quality_score,
    )

    final_score = round(score_breakdown.weighted_total, 2)

    recommendations = generate_recommendations(missing_skills, missing_sections, skill_coverage, resume_quality_score)
    summary = generate_summary(final_score, skill_coverage, matched_count, total_required, bool(experiences_raw), bool(education_raw))

    contact_info = extract_contact_info(text)

    career_suggs = []
    student_skills_lower = [s.lower() for s in extracted_skill_names]
    if any(s in student_skills_lower for s in ["react", "angular", "vue", "javascript", "typescript", "html", "css"]):
        career_suggs.append("Frontend Developer")
    if any(s in student_skills_lower for s in ["python", "node.js", "nodejs", "express", "django", "fastapi", "java", "spring"]):
        career_suggs.append("Backend Developer")
    if any(s in student_skills_lower for s in ["machine learning", "deep learning", "tensorflow", "pytorch", "scikit-learn", "nlp", "llm"]):
        career_suggs.append("AI/ML Engineer")
    if any(s in student_skills_lower for s in ["aws", "azure", "docker", "kubernetes", "devops", "ci/cd"]):
        career_suggs.append("Cloud DevOps Engineer")
    if not career_suggs:
        career_suggs.append("Software Engineer (Generalist)")
        career_suggs.append("Associate IT Consultant")

    roadmap = []
    if missing_skills:
        for ms in missing_skills[:4]:
            roadmap.append(f"Master {ms}: Complete hands-on modules, build 2 portfolio projects, and document architectural trade-offs.")
    else:
        roadmap.append("Strong skill coverage! Deepen expertise in System Design principles and Software Architecture patterns.")
        roadmap.append("Explore Cloud Native deployment models with Docker, Kubernetes, and automated CI/CD pipelines.")

    insights = []
    soft_skills_found = [s["skill"] for s in extracted_skills_raw if s.get("category") == "soft"]
    if soft_skills_found:
        insights.append(f"Demonstrates strong capability in {', '.join(soft_skills_found[:3])}.")
    insights.append("Results-driven engineering profile with a clear focus on structured execution.")
    insights.append("Adaptable contributor prepared for modern software delivery workflows.")

    improvements = []
    if not contact_info["linkedin"]:
        improvements.append("Add your LinkedIn profile link to the header section for recruiter visibility.")
    if not contact_info["github"]:
        improvements.append("Include a link to your GitHub profile containing verified code repositories.")
    if len(experiences) == 0:
        improvements.append("Expand on your academic projects or internship roles with measurable outcomes.")
    if len(extracted_skill_names) < 8:
        improvements.append("Group your technical skills into clear subcategories (e.g., Languages, Frameworks, Databases).")
    if not improvements:
        improvements.append("Ensure all experience and project bullet points begin with strong action verbs and quantified impact.")

    return AIAnalysisResult(
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
        name=contact_info["name"],
        email=contact_info["email"],
        phone=contact_info["phone"],
        github=contact_info["github"],
        linkedin=contact_info["linkedin"],
        portfolio=contact_info["portfolio"],
        links=contact_info["links"],
        projects=contact_info["projects"],
        recommendations=recommendations,
        summary=summary,
        career_suggestions=career_suggs,
        learning_roadmap=roadmap,
        personality_insights=insights,
        resume_improvements=improvements,
        resume_word_count=word_count,
    )


def analyze_text_only(
    resume_text: str,
    required_skills: List[str],
    student_skills: Optional[List[str]] = None,
) -> Dict[str, Any]:
    """
    Analyzes raw resume text and returns a complete AIAnalysisResult payload.
    """
    try:
        text = clean_text(resume_text)
        result = _build_analysis_result(text, required_skills, student_skills)
        return {
            "success": True,
            "message": "Text analysis completed successfully",
            "data": result,
        }
    except Exception as e:
        logger.error(f"Text-only analysis failed: {e}")
        return {"success": False, "message": "Text analysis failed", "error": str(e)}


def analyze_resume(
    file_bytes: bytes,
    filename: str,
    required_skills: List[str],
    job_description: Optional[str] = None,
    max_file_size_mb: int = 5,
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

    result = _build_analysis_result(text, required_skills)
    return {"success": True, "message": "Analysis successful", "data": result}