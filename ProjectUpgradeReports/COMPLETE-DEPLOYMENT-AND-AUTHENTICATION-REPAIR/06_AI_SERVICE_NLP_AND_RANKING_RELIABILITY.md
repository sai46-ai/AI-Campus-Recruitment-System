# 06 — AI Service NLP and Ranking Reliability

**Subsystem:** FastAPI AI Microservice (`ai-service/`) & Express AI Gateway (`backend/src/features/ai/`)
**Engines:** Pure Python PDF extraction (`pdfplumber` / `pypdf`), Regex & spaCy skill parsing, RapidFuzz fuzzy matching

---

## 1. Multi-Tier AI Architecture

The system features a three-tier hierarchical fallback architecture ensuring high-availability resume parsing and candidate ranking:

```text
Incoming Express Request: POST /api/v1/ai/match or POST /api/v1/ai/parse
                             │
                             ▼
               [Tier 1: Python FastAPI Service]
          Internal URL: http://ai-campus-ai-service:8000
          - PDF text extraction via pdfplumber / pypdf
          - Skill extraction across 36+ taxonomy categories
          - Candidate-job matching via RapidFuzz string distance
                             │
                  ┌──────────┴──────────┐
                  │ [Success]           │ [Failure / Unreachable]
                  ▼                     ▼
          Return Parsed Model     [Tier 2: Google Gemini 1.5 Flash]
                                  - Cloud LLM contextual extraction
                                  - Structured JSON schema response
                                        │
                             ┌──────────┴──────────┐
                             │ [Success]           │ [No API Key / Outage]
                             ▼                     ▼
                     Return LLM Result     [Tier 3: Pure TypeScript Engine]
                                           - In-process regex extraction
                                           - Deterministic keyword scoring
                                           - Zero external network dependency
```

---

## 2. Python Microservice Diagnostics

- **Python Version Compatibility:** Verified on Python 3.10 through 3.14 (`3.14.5`).
- **Dependencies:** `fastapi`, `uvicorn`, `pdfplumber`, `pypdf`, `rapidfuzz`.
- **spaCy Graceful Degradation:** When `en_core_web_sm` is unavailable, `skill_extractor.py` seamlessly falls back to compiled regex patterns without throwing exceptions.
- **Unit Test Results:** `python -m unittest discover -s ai-service/tests` executed **7 tests in 0.127s** with 100% pass rate.
  - `test_health`: GET `/health` returns 200 and version info.
  - `test_root`: GET `/` returns 200.
  - `test_parse_text`: POST `/analyze/text` extracts 11+ skills from text.
  - `test_parse_file`: POST `/analyze/file` parses PDF files with fallbacks for corrupt files.
  - `test_match_skills`: POST `/analyze/skills` computes skill overlap percentage.
  - `test_match_job`: POST `/analyze/match` computes candidate-job compatibility score.
  - `test_batch_match`: POST `/analyze/match/batch` ranks candidate cohorts.
