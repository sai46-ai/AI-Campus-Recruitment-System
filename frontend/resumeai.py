# =====================================================
# AI Campus Recruitment Resume Analyzer (Industry-grade)
# =====================================================

import fitz  # PyMuPDF
import spacy
import language_tool_python
from transformers import pipeline
from sentence_transformers import SentenceTransformer, util
from collections import Counter
import numpy as np

# -------------------------------
# Load Models (Heavy but Accurate)
# -------------------------------
nlp = spacy.load("en_core_web_sm")
grammar_tool = language_tool_python.LanguageTool("en-US")

summarizer = pipeline(
    "summarization",
    model="facebook/bart-large-cnn"
)

zero_shot = pipeline(
    "zero-shot-classification",
    model="facebook/bart-large-mnli"
)

embedder = SentenceTransformer("all-mpnet-base-v2")  # VERY strong semantic model

# -------------------------------
# PDF Text Extraction
# -------------------------------
def extract_text_from_pdf(pdf_path):
    doc = fitz.open(pdf_path)
    text = ""
    for page in doc:
        text += page.get_text()
    return text.strip()

# -------------------------------
# Semantic Skill Extraction
# -------------------------------
def extract_skills(text):
    doc = nlp(text)
    skills = []

    for ent in doc.ents:
        if ent.label_ in ["ORG", "PRODUCT", "WORK_OF_ART"]:
            skills.append(ent.text.lower())

    for chunk in doc.noun_chunks:
        if len(chunk.text.split()) <= 4:
            skills.append(chunk.text.lower())

    return Counter(skills).most_common(20)

# -------------------------------
# Resume Section Detection
# -------------------------------
def detect_sections(text):
    sections = [
        "education",
        "experience",
        "skills",
        "projects",
        "internship",
        "certifications",
        "summary"
    ]
    found = [s for s in sections if s in text.lower()]
    missing = list(set(sections) - set(found))
    return found, missing

# -------------------------------
# Grammar & Clarity Penalty
# -------------------------------
def grammar_penalty(text):
    errors = grammar_tool.check(text)
    return len(errors)

# -------------------------------
# Resume ↔ Job Description Matching
# -------------------------------
def jd_resume_match(resume_text, jd_text):
    embeddings = embedder.encode(
        [resume_text, jd_text],
        convert_to_tensor=True
    )
    similarity = util.cos_sim(embeddings[0], embeddings[1])
    return round(float(similarity) * 100, 2)

# -------------------------------
# Role Fit Classification (AI)
# -------------------------------
def role_fit(text):
    roles = [
        "Software Engineer",
        "Data Scientist",
        "Machine Learning Engineer",
        "Web Developer",
        "Backend Engineer",
        "AI Engineer",
        "Database Engineer"
    ]
    result = zero_shot(text[:1200], roles)
    return dict(zip(result["labels"], result["scores"]))

# -------------------------------
# Resume Quality Score (ATS logic)
# -------------------------------
def quality_score(text, grammar_errors, missing_sections, jd_match):
    score = 100

    score += jd_match * 0.4      # JD relevance (big factor)
    score -= grammar_errors * 0.6
    score -= len(missing_sections) * 7

    if len(text.split()) < 350:
        score -= 12  # weak resume

    return round(max(min(score, 100), 0), 2)

# -------------------------------
# AI Resume Summary
# -------------------------------
def resume_summary(text):
    return summarizer(
        text[:1024],
        max_length=140,
        min_length=70,
        do_sample=False
    )[0]["summary_text"]

# -------------------------------
# MASTER ANALYSIS FUNCTION
# -------------------------------
def analyze_resume(pdf_path, job_description):
    resume_text = extract_text_from_pdf(pdf_path)

    skills = extract_skills(resume_text)
    found, missing = detect_sections(resume_text)
    grammar_errors = grammar_penalty(resume_text)
    jd_score = jd_resume_match(resume_text, job_description)
    roles = role_fit(resume_text)
    quality = quality_score(
        resume_text,
        grammar_errors,
        missing,
        jd_score
    )
    summary = resume_summary(resume_text)

    return {
        "Final ATS Score": quality,
        "JD Match (%)": jd_score,
        "Top Role Matches": roles,
        "Extracted Skills (AI)": skills,
        "Found Sections": found,
        "Missing Sections": missing,
        "Grammar Issues": grammar_errors,
        "AI Resume Summary": summary
    }

# -------------------------------
# RUN (Campus System Entry Point)
# -------------------------------
if __name__ == "__main__":
    RESUME_PDF = "resume.pdf"

    JOB_DESCRIPTION = """
    We are looking for a Software Engineer with strong skills in
    Python, Java, Data Structures, SQL, and Machine Learning.
    Experience with projects, internships, and teamwork is required.
    """

    report = analyze_resume(RESUME_PDF, JOB_DESCRIPTION)

    print("\n===== CAMPUS RECRUITMENT AI REPORT =====\n")
    for key, value in report.items():
        print(f"{key}:")
        print(value)
        print("-" * 60)
