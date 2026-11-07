"""
AI Resume Analysis Service - Document Parser
Python 3.14 Compatible - Pure Python PDF parsing (NO C extensions)

PDF Engines (in order of preference):
1. pdfplumber - Best text extraction, pure Python
2. pypdf - Fallback, pure Python

CRITICAL: Do NOT use PyMuPDF (fitz) - requires C compilation
"""

import io
import re
import sys
import logging
from pathlib import Path
from typing import Optional, Tuple

# Configure logging for visibility
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Track which PDF engine is available
PDF_ENGINE = "none"
PDF_ENGINE_ERROR = None


def _detect_pdf_engine() -> str:
    """
    Detect which PDF engine is available.
    Returns: engine name or "none"
    """
    global PDF_ENGINE, PDF_ENGINE_ERROR
    
    # Try pdfplumber first (best extraction quality)
    try:
        import pdfplumber
        PDF_ENGINE = "pdfplumber"
        logger.info(f"[PDF] Using pdfplumber v{pdfplumber.__version__}")
        return PDF_ENGINE
    except ImportError as e:
        logger.warning(f"[PDF] pdfplumber not available: {e}")
    
    # Try pypdf as fallback
    try:
        import pypdf
        PDF_ENGINE = "pypdf"
        logger.info(f"[PDF] Using pypdf v{pypdf.__version__}")
        return PDF_ENGINE
    except ImportError as e:
        logger.warning(f"[PDF] pypdf not available: {e}")
    
    # No PDF engine available
    PDF_ENGINE = "none"
    PDF_ENGINE_ERROR = "No PDF parsing library available. Install: pip install pdfplumber pypdf"
    logger.error(f"[PDF] {PDF_ENGINE_ERROR}")
    return PDF_ENGINE


# Detect engine on module load
_detect_pdf_engine()


def get_pdf_engine_info() -> dict:
    """Return information about the PDF engine being used."""
    return {
        "engine": PDF_ENGINE,
        "available": PDF_ENGINE != "none",
        "error": PDF_ENGINE_ERROR
    }


def extract_text_from_pdf_pdfplumber(file_bytes: bytes) -> Tuple[str, Optional[str]]:
    """
    Extract text using pdfplumber (preferred engine).
    Pure Python, excellent text extraction.
    """
    try:
        import pdfplumber
        
        text_parts = []
        
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            if len(pdf.pages) == 0:
                return "", "PDF has no pages"
            
            for page_num, page in enumerate(pdf.pages):
                try:
                    text = page.extract_text()
                    if text and text.strip():
                        text_parts.append(text)
                except Exception as e:
                    logger.warning(f"[PDF] Failed to extract page {page_num}: {e}")
                    continue
        
        full_text = "\n\n".join(text_parts).strip()
        
        if not full_text:
            return "", "Could not extract text from PDF (may be scanned/image-based)"
        
        logger.info(f"[PDF] Extracted {len(full_text)} chars using pdfplumber")
        return full_text, None
        
    except Exception as e:
        logger.error(f"[PDF] pdfplumber error: {e}")
        return "", f"PDF parsing error (pdfplumber): {str(e)}"


def extract_text_from_pdf_pypdf(file_bytes: bytes) -> Tuple[str, Optional[str]]:
    """
    Extract text using pypdf (fallback engine).
    Pure Python, reliable but simpler extraction.
    """
    try:
        from pypdf import PdfReader
        
        reader = PdfReader(io.BytesIO(file_bytes))
        
        if len(reader.pages) == 0:
            return "", "PDF has no pages"
        
        text_parts = []
        
        for page_num, page in enumerate(reader.pages):
            try:
                text = page.extract_text()
                if text and text.strip():
                    text_parts.append(text)
            except Exception as e:
                logger.warning(f"[PDF] Failed to extract page {page_num}: {e}")
                continue
        
        full_text = "\n\n".join(text_parts).strip()
        
        if not full_text:
            return "", "Could not extract text from PDF (may be scanned/image-based)"
        
        logger.info(f"[PDF] Extracted {len(full_text)} chars using pypdf")
        return full_text, None
        
    except Exception as e:
        logger.error(f"[PDF] pypdf error: {e}")
        return "", f"PDF parsing error (pypdf): {str(e)}"


def extract_text_from_pdf(file_bytes: bytes) -> Tuple[str, Optional[str]]:
    """
    Extract text from PDF file bytes.
    Automatically uses the best available engine.
    Returns: (text, error_message)
    """
    if PDF_ENGINE == "pdfplumber":
        return extract_text_from_pdf_pdfplumber(file_bytes)
    elif PDF_ENGINE == "pypdf":
        return extract_text_from_pdf_pypdf(file_bytes)
    else:
        return "", PDF_ENGINE_ERROR or "No PDF engine available"


def extract_text_from_docx(file_bytes: bytes) -> Tuple[str, Optional[str]]:
    """
    Extract text from DOCX file bytes.
    Returns: (text, error_message)
    """
    try:
        from docx import Document
        
        doc = Document(io.BytesIO(file_bytes))
        
        text_parts = []
        
        # Extract paragraphs
        for para in doc.paragraphs:
            if para.text.strip():
                text_parts.append(para.text)
        
        # Extract text from tables
        for table in doc.tables:
            for row in table.rows:
                row_text = []
                for cell in row.cells:
                    if cell.text.strip():
                        row_text.append(cell.text.strip())
                if row_text:
                    text_parts.append(" | ".join(row_text))
        
        full_text = "\n".join(text_parts).strip()
        
        if not full_text:
            return "", "Could not extract text from DOCX (empty document)"
        
        return full_text, None
        
    except Exception as e:
        return "", f"DOCX parsing error: {str(e)}"


def extract_text_from_doc(file_bytes: bytes) -> Tuple[str, Optional[str]]:
    """
    Extract plain text from legacy .doc files using a robust raw binary scanner.
    Since .doc files contain text embedded in binary structures, scanning for blocks
    of printable ASCII/Unicode sequences extracts the text successfully.
    """
    try:
        # Try using olefile if it can be imported
        try:
            import olefile
            if olefile.isOleFile(io.BytesIO(file_bytes)):
                with olefile.OleFileIO(io.BytesIO(file_bytes)) as ole:
                    if ole.exists('WordDocument'):
                        doc_stream = ole.openstream('WordDocument')
                        data = doc_stream.read()
                        # WordDocument stream contains text in UTF-16 or ASCII
                        text = data.decode('utf-16le', errors='ignore')
                        # Clean up common binary control characters
                        text = re.sub(r'[\x00-\x08\x0b-\x0c\x0e-\x1f]', '', text)
                        cleaned = []
                        for line in text.split('\n'):
                            printable_count = sum(1 for c in line if c.isprintable() or c.isspace())
                            if len(line) > 0 and (printable_count / len(line)) > 0.85:
                                cleaned.append(line)
                        full_text = "\n".join(cleaned).strip()
                        if len(full_text) > 50:
                            logger.info("[PDF/DOC] Successfully parsed .doc using olefile")
                            return full_text, None
        except Exception as e:
            logger.debug(f"olefile .doc parsing failed: {e}")

        # Raw binary scanning fallback
        text_runs = []
        raw_str = file_bytes.decode('utf-16le', errors='ignore')
        utf16_runs = re.findall(r'[\x20-\x7E\x0A\x0D\x09]{4,}', raw_str)
        if utf16_runs:
            text_runs.append(" ".join(utf16_runs))

        ascii_runs = re.findall(r'[\x20-\x7E\x0A\x0D\x09]{4,}', file_bytes.decode('ascii', errors='ignore'))
        if ascii_runs:
            text_runs.append(" ".join(ascii_runs))

        full_text = "\n\n".join(text_runs).strip()
        full_text = re.sub(r'\s+', ' ', full_text)
        if len(full_text) > 50:
            logger.info("[PDF/DOC] Parsed .doc using raw text scanner fallback")
            return full_text, None
        
        return "", "Failed to extract readable text from legacy .doc file"
    except Exception as e:
        return "", f"DOC parsing error: {str(e)}"


def extract_contact_info(text: str) -> dict:
    """
    Extract contact details from resume text: Name, Email, Phone, Links, Portfolio, GitHub, LinkedIn, Projects.
    """
    info = {
        "name": None,
        "email": None,
        "phone": None,
        "github": None,
        "linkedin": None,
        "portfolio": None,
        "links": [],
        "projects": []
    }
    
    if not text:
        return info
        
    # 1. Email extraction
    email_match = re.search(r'\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b', text)
    if email_match:
        info["email"] = email_match.group(0)
        
    # 2. Phone extraction
    phone_patterns = [
        r'\+?\b(?:\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b',
        r'\+?\b(?:91[-.\s]?)?[789]\d{9}\b',
        r'\b\d{5}\s?\d{5}\b'
    ]
    for pattern in phone_patterns:
        phone_match = re.search(pattern, text)
        if phone_match:
            info["phone"] = phone_match.group(0).strip()
            break
            
    # 3. Links and Portfolio / GitHub / LinkedIn
    urls = re.findall(r'https?://[^\s/$.?#].[^\s]*', text)
    for url in urls:
        url_clean = url.rstrip('.,;:)("')
        info["links"].append(url_clean)
        
        if "github.com" in url_clean.lower() and not info["github"]:
            info["github"] = url_clean
        elif "linkedin.com" in url_clean.lower() and not info["linkedin"]:
            info["linkedin"] = url_clean
        elif not info["portfolio"] and not any(domain in url_clean.lower() for domain in ["github.com", "linkedin.com", "google.com", "facebook.com", "twitter.com"]):
            info["portfolio"] = url_clean
            
    info["links"] = list(set(info["links"]))
    
    # 4. Name extraction
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    name_found = False
    for line in lines[:5]:
        words = line.split()
        if (2 <= len(words) <= 4 and 
            all(w[0].isupper() if w[0].isalpha() else True for w in words) and
            not any(label in line.lower() for label in ["curriculum", "resume", "cv", "page", "email", "phone", "profile", "contact", "experience"])):
            info["name"] = line
            name_found = True
            break
    
    if not name_found and info["email"]:
        email_part = info["email"].split('@')[0]
        info["name"] = " ".join([w.capitalize() for w in re.split(r'[-._]', email_part)])
        
    # 5. Projects extraction
    project_section = re.split(r'(?i)projects|academic projects|key projects', text)
    if len(project_section) > 1:
        proj_text = project_section[1]
        next_headers = ["experience", "employment", "education", "skills", "certifications", "interests"]
        for header in next_headers:
            proj_text = re.split(rf'(?i){header}', proj_text)[0]
        
        proj_lines = [line.strip() for line in proj_text.split('\n') if line.strip()]
        for line in proj_lines[:15]:
            if len(line) < 100 and (line.startswith(('•', '-', '*', '▪')) or sum(1 for c in line if c.isupper()) > 3):
                clean_line = re.sub(r'^[•\-\*▪\s]+', '', line).strip()
                if clean_line and len(clean_line) > 3:
                    info["projects"].append(clean_line)
                    
    if not info["projects"]:
        keywords = ["developed", "implemented", "created", "designed", "built"]
        for line in lines:
            if any(k in line.lower() for k in keywords) and len(line) < 120:
                clean_line = re.sub(r'^[•\-\*▪\s]+', '', line).strip()
                if len(clean_line) > 10:
                    info["projects"].append(clean_line)
                    if len(info["projects"]) >= 3:
                        break
                         
    info["projects"] = list(set(info["projects"]))[:5]
    return info


def parse_document(file_bytes: bytes, filename: str) -> Tuple[str, Optional[str]]:
    """
    Parse document based on file extension.
    Returns: (extracted_text, error_message)
    """
    if not file_bytes:
        return "", "Empty file"
    
    ext = Path(filename).suffix.lower()
    
    if ext == ".pdf":
        return extract_text_from_pdf(file_bytes)
    elif ext in (".docx", ".doc"):
        if ext == ".doc":
            return extract_text_from_doc(file_bytes)
        return extract_text_from_docx(file_bytes)
    else:
        return "", f"Unsupported file format: {ext}"


def clean_text(text: str) -> str:
    """Clean and normalize extracted text."""
    if not text:
        return ""
    
    # Remove excessive whitespace
    text = re.sub(r'\s+', ' ', text)
    
    # Remove non-printable characters (except newlines)
    text = ''.join(char for char in text if char.isprintable() or char in '\n\t')
    
    # Normalize line breaks
    text = re.sub(r'\n{3,}', '\n\n', text)
    
    return text.strip()


def get_word_count(text: str) -> int:
    """Get word count from text."""
    if not text:
        return 0
    return len(text.split())


def validate_file(file_bytes: bytes, filename: str, max_size_mb: int = 5) -> Optional[str]:
    """
    Validate file before processing.
    Returns error message if invalid, None if valid.
    """
    if not file_bytes:
        return "File is empty"
    
    # Check size
    size_mb = len(file_bytes) / (1024 * 1024)
    if size_mb > max_size_mb:
        return f"File too large ({size_mb:.1f}MB). Maximum allowed: {max_size_mb}MB"
    
    # Check extension
    ext = Path(filename).suffix.lower()
    if ext not in {".pdf", ".docx", ".doc"}:
        return f"Unsupported format: {ext}. Only PDF, DOCX and DOC allowed."
    
    # Basic magic number validation for PDF
    if ext == ".pdf" and not file_bytes[:4] == b'%PDF':
        return "Invalid PDF file (corrupted or wrong format)"
    
    # Basic validation for DOCX (ZIP format)
    if ext == ".docx" and not file_bytes[:2] == b'PK':
        return "Invalid DOCX file (corrupted or wrong format)"
        
    # Basic validation for DOC (OLE compound file format starts with D0 CF 11 E0 A1 B1 1A E1)
    if ext == ".doc" and not file_bytes[:8] == b'\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1':
        return "Invalid DOC file (corrupted or wrong format)"
    
    return None
