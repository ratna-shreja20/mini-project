"""
AI-based forgery detection service.

Performs Error Level Analysis (ELA) on images and OCR text extraction
on documents to determine whether an academic certificate is genuine,
suspicious, or fake.
"""

import io
import numpy as np
from PIL import Image, ImageChops

try:
    import pytesseract
    TESSERACT_AVAILABLE = True
except Exception:
    TESSERACT_AVAILABLE = False


def perform_ela(image: Image.Image, quality: int = 90) -> float:
    """
    Error Level Analysis: re-saves the image at a given JPEG quality,
    then computes the difference. High differences indicate potential
    tampering in localized regions.

    Returns an anomaly score from 0 to 100 (higher = more suspicious).
    """
    # Convert to RGB if needed
    if image.mode != "RGB":
        image = image.convert("RGB")

    # Save original at the given quality
    original_buffer = io.BytesIO()
    image.save(original_buffer, format="JPEG", quality=quality)
    original_buffer.seek(0)

    # Re-open the re-saved image
    resaved = Image.open(original_buffer)

    # Compute pixel-level difference
    diff = ImageChops.difference(image, resaved)
    diff_array = np.array(diff, dtype=np.float32)

    # Normalize to 0-100 scale
    # Mean of absolute differences across channels
    mean_diff = float(np.mean(diff_array))
    # Scale: typical genuine images have mean_diff < 2-3, tampered > 5-8
    anomaly_score = min(mean_diff * 10.0, 100.0)

    return round(anomaly_score, 1)


def extract_text(image: Image.Image) -> list[str]:
    """
    Runs OCR on the image and returns a list of non-empty text lines.
    Falls back to a heuristic mock if tesseract is not installed.
    """
    if TESSERACT_AVAILABLE:
        try:
            text = pytesseract.image_to_string(image)
            lines = [
                line.strip()
                for line in text.strip().split("\n")
                if line.strip()
            ]
            if lines:
                return lines
        except Exception:
            pass

    # Fallback: return empty list; the caller will handle it
    return []


def classify_verdict(anomaly_score: float, extracted_lines: list[str]) -> tuple[str, float]:
    """
    Combines ELA anomaly score and OCR text quality to produce a verdict
    and confidence score.

    Returns (verdict, confidence_score) where verdict is one of:
    "Genuine", "Suspicious", "Fake"
    """
    has_text = len(extracted_lines) > 0

    if anomaly_score < 25 and has_text:
        verdict = "Genuine"
        confidence = 85.0 + (25 - anomaly_score) * 0.6
    elif anomaly_score < 25 and not has_text:
        verdict = "Suspicious"
        confidence = 55.0 + (25 - anomaly_score) * 0.5
    elif anomaly_score < 60:
        verdict = "Suspicious"
        confidence = 50.0 + (60 - anomaly_score) * 0.3
    else:
        verdict = "Fake"
        confidence = 75.0 + min(anomaly_score - 60, 20) * 0.5

    confidence = min(max(confidence, 0.0), 99.9)
    return verdict, round(confidence, 1)


def analyze_image(file_bytes: bytes) -> dict:
    """
    Full analysis pipeline for an image file (PNG, JPG, JPEG).
    Returns a dict with ela_analysis, extracted_text_count, extracted_lines.
    """
    image = Image.open(io.BytesIO(file_bytes))

    anomaly_score = perform_ela(image)
    lines = extract_text(image)

    return {
        "ela_analysis": {
            "anomaly_score": anomaly_score,
            "is_tampered": anomaly_score >= 40,
        },
        "extracted_text_count": sum(len(l) for l in lines),
        "extracted_lines": lines,
    }


def analyze_pdf(file_bytes: bytes) -> dict:
    """
    Analysis pipeline for a PDF file.
    Since PDFs need a rendering step (e.g. pdf2image/poppler), we use a
    heuristic approach: check file structure and metadata for anomalies.
    Falls back to a mock if rendering tools aren't available.
    """
    # Heuristic: analyze raw byte patterns for signs of editing
    # (multiple PDF creation dates, inconsistent xref tables, etc.)
    raw = file_bytes.decode("latin-1", errors="ignore")

    # Count occurrences of "/ModDate" — multiple modification dates can
    # indicate editing
    mod_count = raw.count("/ModDate")
    creation_count = raw.count("/CreationDate")

    # Base anomaly on metadata inconsistency
    base_anomaly = 10.0
    if mod_count > 2:
        base_anomaly += (mod_count - 2) * 8
    if abs(mod_count - creation_count) > 2:
        base_anomaly += 15

    # Check for known editing software signatures
    editing_signatures = ["Illustrator", "Photoshop", "InDesign", "Acrobat"]
    for sig in editing_signatures:
        if sig in raw:
            base_anomaly += 10

    anomaly_score = min(base_anomaly, 100.0)

    # Try to extract text from the PDF using pytesseract if available
    lines: list[str] = []
    if TESSERACT_AVAILABLE:
        try:
            # Try converting first page to image via pdf2image if available
            from pdf2image import convert_from_bytes

            images = convert_from_bytes(file_bytes, dpi=200, first_page=1, last_page=1)
            if images:
                lines = extract_text(images[0])
        except ImportError:
            pass
        except Exception:
            pass

    if not lines:
        # Fallback: try to extract raw text patterns from the PDF
        import re
        text_patterns = re.findall(r"\(([^)]{5,})\)", raw)
        lines = [
            p.strip()
            for p in text_patterns
            if p.strip() and not p.strip().startswith("<<")
        ][:10]

    return {
        "ela_analysis": {
            "anomaly_score": round(anomaly_score, 1),
            "is_tampered": anomaly_score >= 40,
        },
        "extracted_text_count": sum(len(l) for l in lines),
        "extracted_lines": lines,
    }
