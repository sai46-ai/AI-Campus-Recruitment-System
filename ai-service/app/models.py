"""
AI Resume Analysis Service - Pydantic Models
Defines request/response schemas for API validation.
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


# ============================================================================
# Request Models
# ============================================================================

class SkillMatchRequest(BaseModel):
    """Request for skill matching analysis."""
    resume_text: str = Field(..., min_length=10, description="Extracted resume text")
    job_description: str = Field(..., min_length=10, description="Job description text")
    required_skills: List[str] = Field(..., min_items=1, description="List of required skills")
    student_skills: Optional[List[str]] = Field(default=[], description="Pre-extracted student skills")


class ResumeParseRequest(BaseModel):
    """Request metadata for resume parsing."""
    job_description: Optional[str] = Field(default=None, description="Job description for matching")
    required_skills: Optional[List[str]] = Field(default=None, description="Required skills list")


# ============================================================================
# Response Models
# ============================================================================

class ExtractedSkill(BaseModel):
    """A single extracted skill with confidence."""
    skill: str
    confidence: float = Field(ge=0, le=1)
    category: Optional[str] = None  # technical, soft, tool, language, etc.


class SkillMatchResult(BaseModel):
    """Result of matching a single skill."""
    required_skill: str
    matched: bool
    matched_to: Optional[str] = None  # The student skill it matched to
    similarity_score: float = Field(ge=0, le=1)


class ResumeSection(BaseModel):
    """Detected section in resume."""
    name: str
    present: bool
    content_preview: Optional[str] = None


class ExperienceEntry(BaseModel):
    """Extracted work experience entry."""
    title: Optional[str] = None
    company: Optional[str] = None
    duration: Optional[str] = None
    description: Optional[str] = None


class EducationEntry(BaseModel):
    """Extracted education entry."""
    degree: Optional[str] = None
    institution: Optional[str] = None
    year: Optional[str] = None
    gpa: Optional[str] = None


class ScoreBreakdown(BaseModel):
    """
    Detailed score breakdown for transparency.
    Weights updated for Student-Pro logic (75% Skills).
    """
    skill_coverage_score: float = Field(ge=0, le=100)
    skill_coverage_weight: float = 0.75  # INCREASED: Focus on technical ability
    experience_score: float = Field(ge=0, le=100)
    experience_weight: float = 0.10      # REDUCED: Fair for student profiles
    education_score: float = Field(ge=0, le=100)
    education_weight: float = 0.10       # Standardized
    resume_quality_score: float = Field(ge=0, le=100)
    resume_quality_weight: float = 0.05  # MINIMIZED: Less impact from layout
    
    @property
    def weighted_total(self) -> float:
        """Calculates final score based on Student-Pro weights."""
        return (
            self.skill_coverage_score * self.skill_coverage_weight +
            self.experience_score * self.experience_weight +
            self.education_score * self.education_weight +
            self.resume_quality_score * self.resume_quality_weight
        )


class AIAnalysisResult(BaseModel):
    """Complete AI analysis result payload."""
    # Overall score
    final_score: float = Field(ge=0, le=100)
    score_breakdown: ScoreBreakdown
    
    # Skills analysis
    extracted_skills: List[ExtractedSkill]
    skill_matches: List[SkillMatchResult]
    matched_skills_count: int
    total_required_skills: int
    skill_coverage_percent: float
    
    # Missing skills for improvement feedback
    missing_skills: List[str]
    
    # Resume sections
    detected_sections: List[ResumeSection]
    missing_sections: List[str]
    
    # Parsed entities
    experience: List[ExperienceEntry]
    education: List[EducationEntry]
    certifications: List[str]
    
    # AI-generated feedback
    recommendations: List[str]
    summary: str
    
    # Metadata
    resume_word_count: int
    analysis_model: str = "skill-match-student-pro-v1"


class ResumeParseResponse(BaseModel):
    """Standard response for resume parsing."""
    success: bool
    message: str
    data: Optional[AIAnalysisResult] = None
    error: Optional[str] = None


class HealthResponse(BaseModel):
    """Health check status response."""
    status: str
    version: str
    models_loaded: bool
    spacy_model: str


class ErrorResponse(BaseModel):
    """Standardized error response."""
    success: bool = False
    message: str
    error: str
    details: Optional[Dict[str, Any]] = None