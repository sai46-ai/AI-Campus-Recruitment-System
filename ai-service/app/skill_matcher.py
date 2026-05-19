"""
AI Resume Analysis Service - Skill Matcher
Python 3.14 Compatible - Optimized for Student-Pro Matching Logic

Matching Modes:
- Uses Aggressive Normalization + Fuzzy String Matching
- Optimized Synonyms for AI & Data Science Profiles
"""

import re
import sys
import logging
from typing import List, Dict, Tuple, Optional
from difflib import SequenceMatcher

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ============================================================================
# Semantic Embedder Detection - Safe loading with fallback
# ============================================================================

_embedder = None
EMBEDDER_AVAILABLE = False
MATCHER_ENGINE = "string"  # Default to string matching
EMBEDDER_ERROR = None


def _try_load_embedder() -> bool:
    """
    Attempt to load sentence transformer. Returns True if successful.
    Does NOT crash if unavailable.
    """
    global _embedder, EMBEDDER_AVAILABLE, MATCHER_ENGINE, EMBEDDER_ERROR
    
    try:
        from sentence_transformers import SentenceTransformer
        logger.info("[MATCH] Loading sentence transformer model...")
        
        # Use a lightweight model for faster inference
        _embedder = SentenceTransformer('all-MiniLM-L6-v2')
        EMBEDDER_AVAILABLE = True
        MATCHER_ENGINE = "semantic"
        logger.info("[MATCH] Using semantic similarity (sentence-transformers)")
        return True
        
    except ImportError as e:
        EMBEDDER_ERROR = f"sentence-transformers not available: {e}"
        logger.warning(f"[MATCH] {EMBEDDER_ERROR}")
        logger.info("[MATCH] Using fuzzy string similarity (RapidFuzz fallback)")
        return False
    except Exception as e:
        EMBEDDER_ERROR = f"Unexpected embedder error: {e}"
        logger.error(f"[MATCH] {EMBEDDER_ERROR}")
        return False


# Try to load embedder on module import
if sys.version_info < (3, 13):
    _try_load_embedder()
else:
    logger.info("[MATCH] Python 3.13+ detected - prioritizing fuzzy string matching")


def get_embedder():
    return _embedder


def get_matcher_info() -> dict:
    return {
        "engine": MATCHER_ENGINE,
        "semantic_available": EMBEDDER_AVAILABLE,
        "embedder_loaded": _embedder is not None,
        "error": EMBEDDER_ERROR
    }


def normalize_skill(skill: str) -> str:
    """
    Aggressive normalization to fix 'Scikit-Learn' vs 'scikitlearn'.
    """
    if not skill:
        return ""
    
    # Remove all non-alphanumeric characters and lowercase
    normalized = re.sub(r'[^a-z0-9]', '', skill.lower().strip())
    
    # Enhanced industry synonym mapping for student stack
    replacements = {
        "js": "javascript",
        "nodejs": "nodejs",
        "reactjs": "react",
        "scikitlearn": "sklearn",
        "amazonwebservices": "aws",
        "googlecloudplatform": "gcp",
        "machinelearning": "ml",
        "artificialintelligence": "ai",
        "mongodb": "mongo",
        "postgresql": "postgres",
        "deeplearning": "dl"
    }
    return replacements.get(normalized, normalized)


def string_similarity(s1: str, s2: str) -> float:
    if not s1 or not s2:
        return 0.0
    return SequenceMatcher(None, s1.lower(), s2.lower()).ratio()


def rapidfuzz_similarity(s1: str, s2: str) -> float:
    """
    Uses token_sort_ratio to ignore word order and punctuation.
    """
    try:
        from rapidfuzz import fuzz
        return fuzz.token_sort_ratio(s1.lower(), s2.lower()) / 100.0
    except ImportError:
        return string_similarity(s1, s2)


def semantic_similarity(text1: str, text2: str) -> float:
    embedder = get_embedder()
    if embedder is None:
        return rapidfuzz_similarity(text1, text2)
    
    try:
        from sentence_transformers import util
        embeddings = embedder.encode([text1, text2], convert_to_tensor=True)
        similarity = util.cos_sim(embeddings[0], embeddings[1])
        return float(similarity[0][0])
    except Exception as e:
        return rapidfuzz_similarity(text1, text2)


def match_skills(
    extracted_skills: List[str],
    required_skills: List[str],
    min_similarity: float = 0.75 # Standardized for student-pro results
) -> List[Dict]:
    """
    Matches skills using normalized strings and fuzzy logic.
    """
    results = []
    matched_extracted = set()
    
    for required in required_skills:
        if not required:
            continue
            
        required_norm = normalize_skill(required)
        best_match = None
        best_score = 0.0
        
        for extracted in extracted_skills:
            if not extracted:
                continue
                
            extracted_norm = normalize_skill(extracted)
            
            if extracted_norm in matched_extracted:
                continue
            
            # 1. Exact match check (after aggressive normalization)
            if required_norm == extracted_norm:
                best_match = extracted
                best_score = 1.0
                break
            
            # 2. Substring check
            if required_norm in extracted_norm or extracted_norm in required_norm:
                score = 0.95
                if score > best_score:
                    best_match = extracted
                    best_score = score
                continue
            
            # 3. Fuzzy similarity fallback
            score = rapidfuzz_similarity(required, extracted)
            if score > best_score:
                best_score = score
                best_match = extracted
            
            # 4. Semantic check for close string matches
            if score >= 0.4 and EMBEDDER_AVAILABLE:
                sem_sim = semantic_similarity(required, extracted)
                if sem_sim > best_score:
                    best_score = sem_sim
                    best_match = extracted
        
        matched = best_score >= min_similarity
        
        if matched and best_match:
            matched_extracted.add(normalize_skill(best_match))
        
        results.append({
            "required_skill": required,
            "matched": matched,
            "matched_to": best_match if matched else None,
            "similarity_score": round(best_score, 3)
        })
    
    return results


def calculate_skill_coverage(match_results: List[Dict]) -> Tuple[int, int, float]:
    if not match_results:
        return 0, 0, 0.0
    
    total = len(match_results)
    matched = sum(1 for r in match_results if r.get("matched", False))
    coverage = (matched / total * 100) if total > 0 else 0.0
    
    return matched, total, round(coverage, 2)


def get_missing_skills(match_results: List[Dict]) -> List[str]:
    return [
        r["required_skill"]
        for r in match_results
        if not r.get("matched", False)
    ]


def calculate_experience_score(experiences: List[Dict], required_experience: str = "Fresher") -> float:
    if not experiences:
        if required_experience.lower() in ["fresher", "0 years", "entry level"]:
            return 80.0 # Higher base for student profiles
        return 30.0
    
    exp_count = len(experiences)
    if exp_count >= 3: return 100.0
    elif exp_count >= 2: return 90.0
    elif exp_count >= 1: return 75.0
    return 40.0


def calculate_education_score(education: List[Dict]) -> float:
    if not education:
        return 30.0
    
    score = 60.0 # Higher base for students
    degree_bonuses = {
        "phd": 40, "master": 35, "m.tech": 35, "bachelor": 30, "b.tech": 30
    }
    
    for edu in education:
        degree = (edu.get("degree") or "").lower()
        for key, bonus in degree_bonuses.items():
            if key in degree:
                score = max(score, 60 + bonus)
                break
    
    if education[0].get("gpa"):
        try:
            gpa = float(education[0]["gpa"])
            if gpa >= 8.5 or gpa >= 3.5:
                score = min(100.0, score + 10.0)
        except:
            pass
    
    return min(100.0, score)


def generate_recommendations(
    missing_skills: List[str],
    sections_missing: List[str],
    skill_coverage: float,
    resume_quality: float
) -> List[str]:
    recommendations = []
    if missing_skills:
        skills_str = ", ".join(missing_skills[:3])
        recommendations.append(f"Add the following key skills: {skills_str}.")
    
    if skill_coverage < 75:
        recommendations.append("Your skill alignment is moderate. Tailor your projects section to match job keywords.")
    
    if "projects" in sections_missing:
        recommendations.append("Add a Projects section to showcase hands-on application of your AI skills.")
    
    return recommendations[:5]


def generate_summary(
    final_score: float,
    skill_coverage: float,
    matched_count: int,
    total_required: int,
    has_experience: bool,
    has_education: bool
) -> str:
    if final_score >= 80: strength = "excellent"
    elif final_score >= 60: strength = "strong"
    else: strength = "developing"
    
    return (f"Candidate shows {strength} alignment. "
            f"Matched {matched_count}/{total_required} required skills ({skill_coverage:.0f}% coverage). "
            f"Educational background is documented and relevant.")