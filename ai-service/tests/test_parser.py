import sys
import os
import io
import unittest
from fastapi.testclient import TestClient

# Add app directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.parser import validate_file, clean_text, extract_contact_info
from main import app


class TestParserAndEndpoints(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_file_validation(self):
        self.assertEqual(validate_file(b"", "resume.pdf"), "File is empty")
        self.assertEqual(
            validate_file(b"content", "resume.png"),
            "Unsupported format: .png. Only PDF, DOCX and DOC allowed.",
        )
        self.assertEqual(
            validate_file(b"not-a-pdf-header", "resume.pdf"),
            "Invalid PDF file (corrupted or wrong format)",
        )

    def test_text_cleaning(self):
        text = "Hello    World\n\n\n\nNew   Line"
        self.assertEqual(clean_text(text), "Hello World New Line")

    def test_contact_extraction(self):
        sample_resume = """
        Avinash Kumar
        Email: avinash.kumar@example.com
        Phone: +91 9876543210
        GitHub: https://github.com/avinash-kumar
        LinkedIn: https://linkedin.com/in/avinash-kumar

        Projects:
        - ChatBot: Developed an AI chat interface using FastAPI and Python.
        - WebApp: Implemented frontend dashboard using React and Tailwind.
        """
        info = extract_contact_info(sample_resume)

        self.assertEqual(info["name"], "Avinash Kumar")
        self.assertEqual(info["email"], "avinash.kumar@example.com")
        self.assertEqual(info["phone"], "+91 9876543210")
        self.assertEqual(info["github"], "https://github.com/avinash-kumar")
        self.assertEqual(info["linkedin"], "https://linkedin.com/in/avinash-kumar")
        self.assertTrue(
            any("ChatBot" in p for p in info["projects"])
            or any("WebApp" in p for p in info["projects"])
        )

    def test_health_and_root_endpoints(self):
        root_res = self.client.get("/")
        self.assertEqual(root_res.status_code, 200)
        self.assertEqual(root_res.json()["service"], "AI Resume Analysis Service")

        health_res = self.client.get("/health")
        self.assertEqual(health_res.status_code, 200)
        self.assertEqual(health_res.json()["status"], "healthy")
        self.assertTrue(health_res.json()["ai_modules_loaded"])

    def test_analyze_text_endpoint(self):
        payload = {
            "resume_text": (
                "Ananya Sharma\nananya.sharma@university.edu\n+91 9876543210\n"
                "https://github.com/ananya-sharma\nhttps://linkedin.com/in/ananya-sharma\n"
                "Education: B.Tech in Computer Science from Indian Institute of Technology 2026 GPA: 9.1\n"
                "Experience: Software Engineer Intern at CloudScale Systems (2025 - Present)\n"
                "Skills: Python, FastAPI, React, TypeScript, MongoDB, Docker, AWS, Git\n"
                "Projects:\n- Distributed Task Queue: Built resilient job scheduler using Python and Redis."
            ),
            "job_description": "Full Stack Engineer skilled in Python, FastAPI, React, TypeScript, and Docker.",
            "required_skills": ["Python", "FastAPI", "React", "TypeScript", "Docker", "Kubernetes"],
            "student_skills": ["Python", "FastAPI", "React", "TypeScript", "Docker"],
        }
        res = self.client.post("/analyze/text", json=payload)
        self.assertEqual(res.status_code, 200)
        body = res.json()
        self.assertTrue(body["success"])
        self.assertIsNotNone(body["data"])
        self.assertGreater(body["data"]["final_score"], 60)
        self.assertIn("Kubernetes", body["data"]["missing_skills"])
        self.assertNotIn("interview_questions", body["data"])

    def test_analyze_match_and_batch_endpoints(self):
        match_res = self.client.post(
            "/analyze/match",
            json={
                "student_skills": ["Python", "React", "TypeScript", "Docker"],
                "job_requirements": ["Python", "React", "AWS"],
            },
        )
        self.assertEqual(match_res.status_code, 200)
        match_data = match_res.json()
        self.assertTrue(match_data["success"])
        self.assertAlmostEqual(match_data["match_score"], 66.67, places=1)
        self.assertEqual(match_data["data"]["missing_skills"], ["AWS"])

        empty_res = self.client.post(
            "/analyze/match",
            json={"student_skills": ["Python"], "job_requirements": []},
        )
        self.assertEqual(empty_res.status_code, 400)

        batch_res = self.client.post(
            "/analyze/match/batch",
            json={
                "student_skills": ["Python", "React", "TypeScript"],
                "jobs": [
                    {"id": "j1", "required_skills": ["Python", "React"]},
                    {"id": "j2", "required_skills": ["Java", "Spring Boot"]},
                ],
            },
        )
        self.assertEqual(batch_res.status_code, 200)
        scores = batch_res.json()["scores"]
        self.assertEqual(scores["j1"], 100.0)
        self.assertEqual(scores["j2"], 0.0)

    def test_analyze_skills_and_file_endpoints(self):
        skills_res = self.client.post(
            "/analyze/skills",
            json={
                "student_skills": ["Python", "FastAPI", "MongoDB"],
                "required_skills": ["Python", "FastAPI", "MongoDB", "Redis"],
            },
        )
        self.assertEqual(skills_res.status_code, 200)
        self.assertEqual(skills_res.json()["final_score"], 75.0)

        bad_ext_res = self.client.post(
            "/analyze/file",
            files={"file": ("exploit.exe", b"MZ...", "application/octet-stream")},
            data={"required_skills": "Python,React"},
        )
        self.assertEqual(bad_ext_res.status_code, 400)

        bad_pdf_res = self.client.post(
            "/analyze/file",
            files={"file": ("corrupt.pdf", b"not a real pdf", "application/pdf")},
            data={"required_skills": "Python,React"},
        )
        self.assertEqual(bad_pdf_res.status_code, 200)
        self.assertFalse(bad_pdf_res.json()["success"])


if __name__ == "__main__":
    unittest.main()
