# Supplementary Report 06: Test Results and End-to-End Verification

**Project:** AI Campus Recruitment System  
**Repository:** `C:\Projects\AI-CAMPUS-RECRUITMENT-SYSTEM01`  
**Focus:** Automated Test Execution, Build Verification, Hash Integrity  
**Audit Date:** November 9, 2026  
**Status:** 100% PASS RATE (ZERO FAILURES)

---

## 1. Test Summary Overview

| Test Domain | Target | Suites | Total Tests | Passed | Failed | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **Backend API & Security** | Node.js / Jest | 13 | 152 | 152 | 0 | **PASS** |
| **AI NLP Microservice** | Python / Unittest | 1 | 7 | 7 | 0 | **PASS** |
| **Frontend Production Build** | Vite / TypeScript | 1 | 2,052 modules | Clean | 0 | **PASS** |
| **Backend TypeScript Build** | `tsc` | 1 | All src files | Clean | 0 | **PASS** |
| **3D Background Integrity** | SHA-256 Baseline | 17 files | 17 hashes | 17 | 0 | **PASS** |

---

## 2. Backend Automated Test Breakdown

The complete backend test suite was executed using:
`npm --prefix backend test`

### Detailed Suite Results

```
PASS tests/render_production_readiness.test.ts (8.681 s)
  √ sets SameSite=None and Secure=true when isSecure is true for refresh tokens (8 ms)
  √ sets SameSite=Lax and Secure=false when isSecure is false for local development (1 ms)
  √ clears refresh token cookies with matching SameSite and Secure flags (1 ms)
  √ issues pre-auth CSRF cookie with SameSite=None when X-Forwarded-Proto is https (122 ms)
  √ prepends http:// to raw host:port provided by Render private service discovery (1 ms)
  √ preserves existing http:// prefix (1 ms)
  √ preserves existing https:// prefix (1 ms)
  √ handles empty or unset AI_SERVICE_URL safely (1 ms)

PASS tests/ai_architecture_logging.test.ts (12.363 s)
  √ parses resume text and produces structured ATS evaluation
  √ computes skill match between candidate and required skills
  √ respects isPythonEngineConfigured check
  √ gracefully falls back when Python engine is offline
  √ parses resume using cascaded engine selection
  √ performs candidate-job matching via cascaded providers
  √ exposes health and diagnostics
  √ POST /api/v1/ai/parse-resume returns 401 for unauthenticated requests
  √ POST /api/v1/ai/parse-resume parses resume text for authenticated student
  √ POST /api/v1/ai/parse-resume validates request payload
  √ POST /api/v1/ai/match-candidate matches candidate skills against required skills
  √ GET /api/v1/ai/diagnostics returns operational telemetry

PASS tests/security_subphase31_foundations.test.ts (6.224 s)
PASS tests/security_subphase32_session_refresh.test.ts (5.568 s)
PASS tests/security_subphase33_csrf_crypto.test.ts (4.891 s)
PASS tests/security_subphase34_routes_auth.test.ts (7.327 s)
PASS tests/security.regression.test.ts (8.112 s)
PASS tests/api_integration.test.ts (9.421 s)
PASS tests/phase05_backend_engineering.test.ts (7.892 s)
PASS tests/placement_csv_stats.test.ts (5.334 s)
PASS tests/resume_persistence.test.ts (6.115 s)
PASS tests/role_workflows.test.ts (8.902 s)
PASS tests/wave2_recruiter_authorization.test.ts (7.450 s)

Test Suites: 13 passed, 13 total
Tests:       152 passed, 152 total
Snapshots:   0 total
Time:        55.75 s
```

---

## 3. Python AI Microservice Test Execution

The FastAPI microservice test suite was executed using:
`python -m unittest discover -s ai-service/tests`

```
INFO:app.parser:[PDF] Using pdfplumber v0.11.9
INFO:app.skill_extractor:[NLP] Falling back to regex-based extraction
INFO:app.skill_matcher:[MATCH] Python 3.13+ detected - prioritizing fuzzy string matching
POST /analyze/match 200 (49.05ms)
POST /analyze/match 400 (0.85ms)
POST /analyze/match/batch 200 (0.92ms)
POST /analyze/skills 200 (0.88ms)
POST /analyze/file 400 (1.6ms)
POST /analyze/file 200 (1.1ms)
POST /analyze/text 200 (26.57ms)
GET / 200
GET /health 200

Ran 7 tests in 0.119s
OK
```

---

## 4. Frontend Production Build Verification

The React frontend was built with:
`cd frontend; npm run build`

```
> ai-campus-recruitment-frontend@2.0.0 build
> tsc && vite build

vite v5.4.21 building for production...
transforming...
✓ 2052 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                               1.40 kB │ gzip:   0.65 kB
dist/assets/index-CAGno_yh.css               65.33 kB │ gzip:  11.41 kB
dist/assets/StatCard-n6cblX-0.js              1.76 kB │ gzip:   0.81 kB
dist/assets/Modal-B0BfZKM6.js                 2.76 kB │ gzip:   1.29 kB
dist/assets/Notifications-CeMWmNJb.js         2.91 kB │ gzip:   1.17 kB
dist/assets/TermsOfService-Bim_OBo8.js        3.05 kB │ gzip:   1.19 kB
dist/assets/PrivacyPolicy-6E8pfPbN.js         3.39 kB │ gzip:   1.31 kB
dist/assets/MyJobs-DQT4uOlD.js                6.78 kB │ gzip:   2.35 kB
dist/assets/MyApplications-C2bMews3.js        6.93 kB │ gzip:   2.48 kB
dist/assets/Profile-BGnusnvg.js               7.81 kB │ gzip:   2.49 kB
dist/assets/AdminDashboard-CZ_F6LoV.js        8.91 kB │ gzip:   2.48 kB
dist/assets/PostJob-BMMeJ6bu.js               9.18 kB │ gzip:   3.05 kB
dist/assets/ViewApplicants-isH8BzT5.js        9.33 kB │ gzip:   3.07 kB
dist/assets/RecruiterDashboard-4Ud9jZzl.js   12.21 kB │ gzip:   3.60 kB
dist/assets/PlacementDashboard-CEBjf4i0.js   13.06 kB │ gzip:   3.63 kB
dist/assets/ViewJobs-BfWljrN1.js             15.64 kB │ gzip:   4.78 kB
dist/assets/StudentDashboard-CZk7duwk.js     38.00 kB │ gzip:   8.36 kB
dist/assets/ResumeBuilder-BVfqE1_z.js        48.26 kB │ gzip:   9.78 kB
dist/assets/vendor-data-CIwbuHBj.js          80.99 kB │ gzip:  28.29 kB
dist/assets/vendor-ui-BeQOP7nt.js           134.78 kB │ gzip:  41.46 kB
dist/assets/vendor-react-8lstkI6c.js        162.89 kB │ gzip:  53.20 kB
dist/assets/index-DkJ6AOXp.js               295.84 kB │ gzip:  83.53 kB
dist/assets/vendor-three-CeOg3j7n.js        559.57 kB │ gzip: 139.60 kB
✓ built in 7.92s
```

---

## 5. 3D Background File Integrity Verification

All 17 procedural Three.js background files were checked against `.phase07_3d_baseline.json`:

```
Verified 17 3D files. All match baseline: true
```

| File Name | Baseline SHA-256 Checksum | Verified Status |
| :--- | :--- | :---: |
| `AnimationController.ts` | `6F5C6EFD63EE02FF8D808EFB6BB6706BF1239A1565432F38D51EE5EB3558C4E0` | **MATCH** |
| `AtmosphericBackground.tsx` | `95D50871E5634DE5E227E0CD1221D87436A3ECD4A4F6D1311B4630163C587537` | **MATCH** |
| `CameraController.ts` | `00E00A709C60BCBF52E1437854288C7BC1B98BD0B0F1AB2F85FA51E9D02F5ABE` | **MATCH** |
| `InteractionController.ts` | `9F5FB42EECBEC86918023A6BCE5C4592822605A28173BFB9470DB82FE750106C` | **MATCH** |
| `NavigationController.ts` | `99196951D1F4727A3CD788BDD597D7E226E29792D2E1E15BB14BE438268109AA` | **MATCH** |
| `cameraSpline.ts` | `933EA3A792901E391079167472B5E43109B5B0F8EA9E85024130231E9E357CE0` | **MATCH** |
| `careerWorldScene.ts` | `9695239955B5C50800EC4DF7591FD41EFD0DC7C096A4A40EC9B21BACDCEA815A` | **MATCH** |
| `forestGeometry.ts` | `DF84BDE2EB1605BDD4FAA8640DBCE8E394967A2E4726EB4701170810C0DEB460` | **MATCH** |
| `materials.ts` | `596A00262F7B4B01384D7E396F1CEE429D52B7C8E967BB86E938A37D411BEEB2` | **MATCH** |
| `mountainGeometry.ts` | `8022773B96B7E9734F92ABFFA4429F17B6B7F7FF13E8EE14FEAB34CBDE0891E2` | **MATCH** |
| `riverGeometry.ts` | `58D5A50528DF304FD190DD34FA80C1BCCC36EDDFDA00D022BA37189A2B648EBF` | **MATCH** |
| `sceneConfig.ts` | `A9E3504CDC0A0CFE5DAB5E1B7FB70C5DE072C71469996CAE6A99DBC04CC50400` | **MATCH** |
| `shaders.ts` | `62128AAAEB4F383B424042D50555C30DB415E90A998CEE1FD05C830BF1EDB49C` | **MATCH** |
| `skyGeometry.ts` | `9997A0EE0D46329BF365024E1B42C983F4CB3069CF18D8431019995FEE44B771` | **MATCH** |
| `terraceGeometry.ts` | `9BB4ED6FD8E441DBB55EBAF2E5F320148C32E85B4B81FBC1F5AA3C21E0031FA0` | **MATCH** |
| `terrainGeometry.ts` | `C707FE40DC29852767E5D49F55C627838E71AE5F4514C79F5F393E5B8051BC40` | **MATCH** |
| `types.ts` | `6C554AD704EBCE31B55BE6E3601F42752D8092D1F03B1C86A66ADC4EDBE1140E` | **MATCH** |

