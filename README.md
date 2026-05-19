# AI Campus Recruitment System

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19+-61DAFB.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688.svg)](https://fastapi.tiangolo.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248.svg)](https://www.mongodb.com/)

A research-grade, AI-driven campus recruitment platform providing automated resume parsing, semantic skill extraction, and transparent candidate scoring. This repository contains three coordinated services: a React frontend, an Express backend, and a Python AI microservice.

## Table of contents
- Overview
- Motivation
- Key features
- Architecture
- Project structure
- Setup & Installation
- Development & Running
- Configuration (env)
- Testing
- Deployment
- Contribution & License
- Academic information & Citation

## Overview

This project automates candidate screening by combining deterministic heuristics with modern NLP:
- Document parsing (PDF/DOCX)
- Named-entity & skill extraction (spaCy + custom taxonomy)
- Semantic matching (sentence-transformers)
- Transparent scoring (skills, experience, education, resume quality)

Use cases: campus hiring drives, academic research on resume analysis, and recruiter tooling for small to medium enterprises.

## Motivation

Recruitment at scale is time-consuming and subjective. This system provides reproducible, explainable candidate rankings to reduce bias and speed up shortlisting.

## Key features
- Resume parsing: PDF and DOCX support
- Skill extraction: curated taxonomy + semantic matching
- Candidate scoring: deterministic, auditable formula
- Role-based app: student, recruiter, admin
- File validation and secure uploads
- Extensible AI microservice for research experiments

## Architecture

Three services communicate over HTTP; MongoDB stores application data.

```
Frontend (React)  <-->  Backend (Node/Express)  <-->  AI Service (Python/FastAPI)
          \                                  /
           \                                /
            \-->  MongoDB Atlas (data store) <--/
```

Services run on ports 3000 (frontend), 5000 (backend) and 8000 (AI service) by default when using the included scripts.

## Project structure

- [ai-service](ai-service) — Python FastAPI microservice for NLP and resume analysis
  - `main.py`, `app/` (models, parser, analyzer, skill_extractor, skill_matcher)
- [backend](backend) — Node.js Express API and job/application logic
  - `server.js`, `controllers/`, `models/`, `routes/`, `services/`
- [frontend](frontend) — React SPA with 3D UI components and job application flows
  - `src/`, `public/`, `build/`
- Scripts and docs at repo root: `start-all.ps1`, `stop-all.ps1`, `DEPLOYMENT-GUIDE.md`, `TESTING-GUIDE.md`

See the code for implementation details: [ai-service/main.py](ai-service/main.py), [backend/server.js](backend/server.js), [frontend/src/index.js](frontend/src/index.js).

## Requirements
- Python 3.8+
- Node.js 18+
- npm or yarn
- MongoDB (Atlas recommended)

## Setup & Installation (local development)

1. Clone the repository and open the workspace.

2. AI service (Python)

```powershell
cd ai-service
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

3. Backend (Node.js)

## Project structure

Below is a high-level, developer-friendly listing of folders and key files. Use this as a map to the implementation.

- Root
  - `check-prerequisites.ps1` — environment checks for Windows
  - `start-all.ps1`, `stop-all.ps1` — helper scripts to start/stop services
  - `DEPLOYMENT-GUIDE.md`, `TESTING-GUIDE.md`, `SYSTEM-STATUS.md`, `CONNECTION_STATUS.md`, `FINAL-DELIVERY.md`
  - `README.md` (this file)

- `ai-service/`
  - `main.py` — FastAPI entrypoint
  - `requirements.txt` — Python dependencies
  - `app/`
    - `__init__.py`
    - `analyzer.py` — orchestration for analysis pipelines
    - `config.py` — configuration loader
    - `models.py` — Pydantic/data models
    - `parser.py` — PDF/DOCX parsing utilities
    - `skill_extractor.py` — spaCy-based extraction logic
    - `skill_matcher.py` — semantic matching utilities (sentence-transformers)

- `backend/`
  - `package.json` — backend npm metadata & scripts
  - `server.js` — Express app bootstrap
  - `config/`
    - `constants.js` — env variable defaults and constants
    - `db.js` — MongoDB connection
  - `controllers/`
    - `adminController.js`
    - `applicationController.js`
    - `authController.js`
    - `interviewController.js`
    - `jobController.js`
    - `notificationController.js`
    - `resumeController.js`
  - `middleware/`
    - `authMiddleware.js`
    - `errorHandler.js`
    - `rateLimitMiddleware.js`
    - `uploadMiddleware.js`
  - `models/`
    - `Application.js`, `Interview.js`, `Job.js`, `Notification.js`, `Resume.js`, `User.js`
  - `resume/`
    - `controllers/resumeController.js`
    - `models/Resume.js`
    - `routes/resumeRoutes.js`
  - `routes/`
    - `adminRoutes.js`, `applicationRoutes.js`, `authRoutes.js`, `interviewRoutes.js`, `jobRoutes.js`, `notificationRoutes.js`, `resumeRoutes.js`
  - `services/`
    - `aiService.js` — client to AI microservice
    - `auditService.js`, `mailService.js`
  - `uploads/`
    - `resumes/` — stored resume files (uploads)
  - `utils/`
    - `fileValidation.js`, `helpers.js`

- `frontend/`
  - `package.json` — frontend npm metadata & scripts
  - `README.md` — frontend-specific notes
  - `resumeai.py` — helper script (non-standard placement)
  - `build/`
    - `asset-manifest.json`, `index.html`, `manifest.json`, `robots.txt`, `static/` (css/js/media)
  - `public/`
    - `index.html`, `manifest.json`, `robots.txt`
  - `src/`
    - `App.js`, `App.css`, `index.js`, `index.css`
    - `assets/` — static assets used by the app
    - `components/` — UI components (3D scenes, navbar, cards, buttons)
      - `AIResumeAnalyzer.jsx`, `Button3D.js`, `Card3D.js`, `DashboardTopBar.js`, `DynamicNavbar3D.js`, `Floating3DElements.js`, `GlobalSceneManager.js`, `Hero3DScene.js`, `LoadingSpinner3D.js`, `Navbar.js`, ...
    - `pages/` — route pages (jobs, dashboard, auth, application flows)
    - `services/`
      - `api.js` — HTTP client to backend
    - `utils/` — frontend utility helpers

This listing highlights the folders you will typically edit when developing features: `ai-service/app` for NLP logic, `backend/controllers` and `backend/services` for API behavior, and `frontend/src` for UI. For implementation entry points, see:

- `ai-service/main.py` (AI microservice)
- `backend/server.js` (backend API)
- `frontend/src/index.js` (frontend app)

> AI Campus Recruitment System — repository, VVIT campus recruitment project, 2026.

Include authors, contributors and supervisor names in your citation entry as appropriate.

## License

This project is released under the ISC License.
