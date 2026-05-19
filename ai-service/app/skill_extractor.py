"""
AI Resume Analysis Service - Skill Extractor
Python 3.14 Compatible - Falls back to regex if spaCy unavailable

NLP Mode:
- If spaCy available: Uses NLP for enhanced extraction
- If spaCy unavailable: Uses regex + keyword matching (still effective)

CRITICAL: System works WITHOUT spaCy - it's a nice-to-have enhancement
"""

import re
import sys
import logging
from typing import List, Dict, Set, Tuple, Optional
from collections import Counter

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ============================================================================
# NLP Engine Detection - Safe loading with fallback
# ============================================================================

_nlp = None
NLP_AVAILABLE = False
NLP_ENGINE = "regex"  # Default to regex mode
NLP_ERROR = None


def _try_load_spacy() -> bool:
    """
    Attempt to load spaCy. Returns True if successful.
    Does NOT crash if spaCy unavailable.
    """
    global _nlp, NLP_AVAILABLE, NLP_ENGINE, NLP_ERROR
    
    try:
        import spacy
        logger.info(f"[NLP] spaCy v{spacy.__version__} found, loading model...")
        
        try:
            _nlp = spacy.load("en_core_web_sm")
            NLP_AVAILABLE = True
            NLP_ENGINE = "spacy"
            logger.info("[NLP] Using spaCy with en_core_web_sm model")
            return True
        except OSError as e:
            # Model not installed
            NLP_ERROR = f"spaCy model not installed: {e}"
            logger.warning(f"[NLP] {NLP_ERROR}")
            logger.info("[NLP] Falling back to regex-based extraction")
            return False
            
    except ImportError as e:
        # spaCy not installed (common on Python 3.14)
        NLP_ERROR = f"spaCy not available: {e}"
        logger.warning(f"[NLP] {NLP_ERROR}")
        logger.info("[NLP] Using regex-based extraction (works well for resumes)")
        return False
    except Exception as e:
        NLP_ERROR = f"Unexpected NLP error: {e}"
        logger.error(f"[NLP] {NLP_ERROR}")
        return False


# Try to load spaCy on module import (but don't fail if unavailable)
_try_load_spacy()


def get_nlp():
    """
    Get NLP engine if available.
    Returns None if spaCy is not available (caller should handle this).
    """
    return _nlp


def get_nlp_info() -> dict:
    """Return information about NLP engine status."""
    return {
        "engine": NLP_ENGINE,
        "available": NLP_AVAILABLE,
        "spacy_loaded": _nlp is not None,
        "error": NLP_ERROR
    }


# ============================================================================
# Skill Taxonomy - Comprehensive list of technical and soft skills
# ============================================================================

TECHNICAL_SKILLS = {
    # Programming Languages
    "python", "java", "javascript", "typescript", "c++", "c#", "ruby", "go", "golang",
    "rust", "swift", "kotlin", "scala", "php", "perl", "r", "matlab", "julia",
    "objective-c", "dart", "elixir", "clojure", "haskell", "lua", "shell", "bash",
    "powershell", "sql", "plsql", "tsql", "nosql",
    
    # Web Development
    "html", "css", "sass", "scss", "less", "react", "reactjs", "react.js", "angular",
    "angularjs", "vue", "vuejs", "vue.js", "svelte", "next.js", "nextjs", "nuxt",
    "gatsby", "redux", "mobx", "webpack", "vite", "parcel", "rollup", "babel",
    "jquery", "bootstrap", "tailwind", "tailwindcss", "material-ui", "chakra",
    "styled-components", "emotion", "graphql", "rest", "restful", "api",
    
    # Backend & Server
    "node.js", "nodejs", "express", "express.js", "fastapi", "flask", "django",
    "spring", "spring boot", "springboot", "asp.net", ".net", "dotnet", "rails",
    "ruby on rails", "laravel", "symfony", "gin", "echo", "fiber", "fastify",
    "nest.js", "nestjs", "koa", "hapi",
    
    # Databases
    "mysql", "postgresql", "postgres", "mongodb", "redis", "elasticsearch",
    "cassandra", "dynamodb", "sqlite", "oracle", "sql server", "mariadb",
    "couchdb", "neo4j", "influxdb", "firebase", "supabase", "prisma",
    "sequelize", "mongoose", "typeorm", "knex", "drizzle",
    
    # Cloud & DevOps
    "aws", "amazon web services", "azure", "gcp", "google cloud", "docker",
    "kubernetes", "k8s", "jenkins", "gitlab ci", "github actions", "circleci",
    "travis ci", "terraform", "ansible", "puppet", "chef", "vagrant",
    "nginx", "apache", "linux", "unix", "windows server", "serverless",
    "lambda", "cloudformation", "ecs", "eks", "fargate", "heroku", "vercel",
    "netlify", "digitalocean", "linode",
    
    # Data Science & ML
    "machine learning", "deep learning", "neural networks", "tensorflow",
    "pytorch", "keras", "scikit-learn", "sklearn", "pandas", "numpy",
    "scipy", "matplotlib", "seaborn", "plotly", "jupyter", "anaconda",
    "nlp", "natural language processing", "computer vision", "opencv",
    "spacy", "nltk", "transformers", "hugging face", "bert", "gpt",
    "llm", "large language models", "data analysis", "data visualization",
    "statistical analysis", "regression", "classification", "clustering",
    
    # Mobile Development
    "react native", "flutter", "android", "ios", "swift", "xcode",
    "android studio", "kotlin", "jetpack compose", "swiftui",
    
    # Testing
    "jest", "mocha", "chai", "pytest", "unittest", "junit", "selenium",
    "cypress", "playwright", "puppeteer", "testing library", "enzyme",
    "karma", "jasmine", "rspec", "cucumber", "postman", "insomnia",
    
    # Tools & Version Control
    "git", "github", "gitlab", "bitbucket", "svn", "mercurial",
    "jira", "confluence", "trello", "asana", "slack", "notion",
    "figma", "sketch", "adobe xd", "photoshop", "illustrator",
    
    # Other Technical
    "microservices", "soa", "event-driven", "rabbitmq", "kafka",
    "mqtt", "websocket", "socket.io", "grpc", "protobuf", "oauth",
    "jwt", "saml", "ldap", "sso", "encryption", "ssl", "tls",
    "ci/cd", "agile", "scrum", "kanban", "devops", "sre",
    "monitoring", "logging", "prometheus", "grafana", "datadog",
    "splunk", "elk", "new relic",
}

SOFT_SKILLS = {
    "communication", "teamwork", "leadership", "problem solving", "problem-solving",
    "critical thinking", "analytical", "creativity", "adaptability", "flexibility",
    "time management", "organization", "attention to detail", "multitasking",
    "decision making", "project management", "conflict resolution", "negotiation",
    "presentation", "public speaking", "writing", "collaboration", "mentoring",
    "coaching", "emotional intelligence", "empathy", "active listening",
    "customer service", "client relations", "stakeholder management",
    "strategic thinking", "innovation", "initiative", "self-motivated",
    "work ethic", "reliability", "accountability", "professionalism",
}

# Section headers typically found in resumes
SECTION_PATTERNS = {
    "education": r"(?i)(education|academic|qualification|degree|university|college)",
    "experience": r"(?i)(experience|employment|work history|professional|career)",
    "skills": r"(?i)(skills|technical skills|competenc|expertise|proficienc)",
    "projects": r"(?i)(projects|portfolio|work samples)",
    "certifications": r"(?i)(certif|license|accredit)",
    "summary": r"(?i)(summary|objective|profile|about|introduction)",
    "awards": r"(?i)(awards|honors|achievements|recognition)",
    "publications": r"(?i)(publications|papers|research)",
    "languages": r"(?i)(language|fluent|proficient in)",
    "interests": r"(?i)(interests|hobbies|activities)",
}


def extract_skills_from_text(text: str) -> List[Dict]:
    """
    Extract skills from resume text using pattern matching.
    Uses NLP (spaCy) if available, otherwise pure regex (still effective).
    Returns list of skills with confidence and category.
    """
    if not text:
        return []
    
    text_lower = text.lower()
    found_skills = []
    skill_set = set()  # Avoid duplicates
    
    # Pattern-based extraction for technical skills (ALWAYS works)
    for skill in TECHNICAL_SKILLS:
        # Create flexible pattern with word boundaries
        pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(pattern, text_lower):
            if skill not in skill_set:
                skill_set.add(skill)
                found_skills.append({
                    "skill": skill.title() if len(skill) > 3 else skill.upper(),
                    "confidence": 0.95,
                    "category": "technical"
                })
    
    # Pattern-based extraction for soft skills (ALWAYS works)
    for skill in SOFT_SKILLS:
        pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(pattern, text_lower):
            if skill not in skill_set:
                skill_set.add(skill)
                found_skills.append({
                    "skill": skill.title(),
                    "confidence": 0.85,
                    "category": "soft"
                })
    
    # NLP-based extraction - ONLY if spaCy is available
    nlp = get_nlp()
    if nlp is not None:
        try:
            doc = nlp(text[:50000])  # Limit to avoid memory issues
            
            # Extract noun chunks that might be skills
            for chunk in doc.noun_chunks:
                chunk_text = chunk.text.lower().strip()
                if (
                    len(chunk_text) > 2 and
                    len(chunk_text.split()) <= 4 and
                    chunk_text not in skill_set and
                    not any(char.isdigit() for char in chunk_text)
                ):
                    # Check if it looks like a skill (contains known keywords)
                    if any(tech in chunk_text for tech in ["developer", "engineer", "analyst", "design"]):
                        skill_set.add(chunk_text)
                        found_skills.append({
                            "skill": chunk_text.title(),
                            "confidence": 0.70,
                            "category": "inferred"
                        })
            logger.debug("[NLP] spaCy extraction completed")
        except Exception as e:
            logger.warning(f"[NLP] spaCy extraction failed (continuing with regex): {e}")
    else:
        # Fallback: Use additional regex patterns for common skill phrases
        # This provides reasonable extraction even without spaCy
        logger.debug("[NLP] Using regex-only extraction (spaCy unavailable)")
        
        # Additional patterns for common skill phrases
        skill_phrase_patterns = [
            r'\b(proficient in|expert in|skilled in|knowledge of|experience with)\s+([a-zA-Z0-9\+\#\.]+)',
            r'\b([a-zA-Z0-9\+\#\.]+)\s+(developer|engineer|specialist)',
        ]
        
        for pattern in skill_phrase_patterns:
            matches = re.findall(pattern, text_lower)
            for match in matches:
                # Get the skill part (varies by pattern)
                potential_skill = match[1] if match[0].endswith("in") or match[0].endswith("of") or match[0].endswith("with") else match[0]
                potential_skill = potential_skill.strip()
                
                if len(potential_skill) > 2 and potential_skill not in skill_set:
                    skill_set.add(potential_skill)
                    found_skills.append({
                        "skill": potential_skill.title(),
                        "confidence": 0.65,
                        "category": "inferred"
                    })
    
    # Sort by confidence
    found_skills.sort(key=lambda x: x["confidence"], reverse=True)
    
    logger.info(f"[SKILLS] Extracted {len(found_skills)} skills (engine: {NLP_ENGINE})")
    return found_skills[:50]  # Return top 50 skills


def detect_sections(text: str) -> Dict[str, bool]:
    """
    Detect which sections are present in the resume.
    Returns dict with section name -> present boolean.
    """
    results = {}
    
    for section_name, pattern in SECTION_PATTERNS.items():
        results[section_name] = bool(re.search(pattern, text))
    
    return results


def extract_experience(text: str) -> List[Dict]:
    """
    Extract work experience entries from resume.
    """
    experiences = []
    
    # Common patterns for experience entries
    # Pattern: Company Name | Title | Date Range
    experience_patterns = [
        # Pattern: Title at Company (Date - Date)
        r"(?P<title>[A-Z][a-zA-Z\s]+(?:Developer|Engineer|Manager|Analyst|Designer|Intern|Lead|Director|Specialist))\s+(?:at|@|,)\s+(?P<company>[A-Z][a-zA-Z0-9\s&.,]+)\s*[(\[]?\s*(?P<duration>\d{4}\s*[-–]\s*(?:\d{4}|Present|Current))",
        
        # Pattern: Company - Title (Date)
        r"(?P<company>[A-Z][a-zA-Z0-9\s&.,]+)\s*[-–]\s*(?P<title>[A-Z][a-zA-Z\s]+(?:Developer|Engineer|Manager|Analyst|Designer|Intern|Lead|Director|Specialist))\s*[(\[]?\s*(?P<duration>\d{4}\s*[-–]\s*(?:\d{4}|Present|Current))",
    ]
    
    for pattern in experience_patterns:
        matches = re.finditer(pattern, text, re.IGNORECASE | re.MULTILINE)
        for match in matches:
            experiences.append({
                "title": match.group("title").strip() if "title" in match.groupdict() else None,
                "company": match.group("company").strip() if "company" in match.groupdict() else None,
                "duration": match.group("duration").strip() if "duration" in match.groupdict() else None,
                "description": None
            })
    
    # Deduplicate and return
    seen = set()
    unique_experiences = []
    for exp in experiences:
        key = (exp.get("title", ""), exp.get("company", ""))
        if key not in seen:
            seen.add(key)
            unique_experiences.append(exp)
    
    return unique_experiences[:10]  # Return max 10


def extract_education(text: str) -> List[Dict]:
    """
    Extract education entries from resume.
    """
    education = []
    
    # Common degree patterns
    degree_patterns = [
        r"(?P<degree>(?:Bachelor|Master|PhD|Ph\.D|B\.S|B\.A|M\.S|M\.A|B\.Tech|M\.Tech|B\.E|M\.E|MBA|BBA|BCA|MCA)['\s]*(?:of|in)?['\s]*(?:Science|Arts|Technology|Engineering|Business|Computer)?[a-zA-Z\s]*)\s*(?:from|at|,)?\s*(?P<institution>[A-Z][a-zA-Z\s]+(?:University|College|Institute|School))",
        r"(?P<institution>[A-Z][a-zA-Z\s]+(?:University|College|Institute|School))\s*[-–,]\s*(?P<degree>(?:Bachelor|Master|PhD|B\.S|B\.A|M\.S|M\.A|B\.Tech|M\.Tech|B\.E|M\.E|MBA)[a-zA-Z\s.]*)",
    ]
    
    for pattern in degree_patterns:
        matches = re.finditer(pattern, text, re.IGNORECASE)
        for match in matches:
            education.append({
                "degree": match.group("degree").strip() if "degree" in match.groupdict() else None,
                "institution": match.group("institution").strip() if "institution" in match.groupdict() else None,
                "year": None,
                "gpa": None
            })
    
    # Extract years near education
    year_pattern = r"(?:20|19)\d{2}"
    year_matches = re.findall(year_pattern, text)
    
    # Try to associate years with education entries
    for i, edu in enumerate(education):
        if i < len(year_matches):
            edu["year"] = year_matches[i]
    
    # Extract GPA
    gpa_pattern = r"(?:GPA|CGPA|Grade)[:\s]*(\d+\.?\d*)[/\s]*(?:4|10)?"
    gpa_match = re.search(gpa_pattern, text, re.IGNORECASE)
    if gpa_match and education:
        education[0]["gpa"] = gpa_match.group(1)
    
    return education[:5]  # Return max 5


def extract_certifications(text: str) -> List[str]:
    """
    Extract certifications from resume.
    """
    certifications = []
    
    # Common certification patterns
    cert_keywords = [
        "AWS Certified", "Azure Certified", "Google Cloud Certified",
        "Certified Kubernetes", "CCNA", "CCNP", "CompTIA", "PMP",
        "Scrum Master", "CISSP", "CEH", "Oracle Certified",
        "Microsoft Certified", "Salesforce Certified", "HubSpot",
        "Google Analytics", "Facebook Blueprint", "Certified Developer",
        "Certified Professional", "Certified Associate", "Certification in",
    ]
    
    for keyword in cert_keywords:
        pattern = rf"({re.escape(keyword)}[a-zA-Z0-9\s\-–]*)"
        matches = re.findall(pattern, text, re.IGNORECASE)
        for match in matches:
            clean_cert = match.strip()
            if len(clean_cert) > 5 and clean_cert not in certifications:
                certifications.append(clean_cert)
    
    return certifications[:10]  # Return max 10


def calculate_resume_quality_score(text: str, sections: Dict[str, bool]) -> float:
    """
    Calculate a quality score for the resume based on completeness and structure.
    Returns score 0-100.
    """
    score = 0.0
    
    # Word count scoring (0-25 points)
    word_count = len(text.split())
    if word_count >= 300:
        score += 25
    elif word_count >= 200:
        score += 20
    elif word_count >= 100:
        score += 10
    
    # Essential sections (0-40 points)
    essential = ["education", "experience", "skills"]
    for section in essential:
        if sections.get(section, False):
            score += 13.33
    
    # Good-to-have sections (0-20 points)
    optional = ["summary", "projects", "certifications"]
    for section in optional:
        if sections.get(section, False):
            score += 6.67
    
    # Contact info check (0-15 points)
    has_email = bool(re.search(r'\b[\w.-]+@[\w.-]+\.\w+\b', text))
    has_phone = bool(re.search(r'\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b', text))
    has_linkedin = bool(re.search(r'linkedin\.com', text, re.IGNORECASE))
    
    if has_email:
        score += 5
    if has_phone:
        score += 5
    if has_linkedin:
        score += 5
    
    return min(100, score)
