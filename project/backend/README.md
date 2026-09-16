# CertGuard AI — FastAPI + MongoDB Backend

AI-based academic certificate forgery detection system backend.

## Prerequisites

1. **Python 3.10+** — [Download](https://www.python.org/downloads/)
2. **MongoDB** — running locally on `127.0.0.1:27017`
   - Install: https://www.mongodb.com/try/download/community
   - Or use Docker: `docker run -d -p 27017:27017 --name certguard-mongo mongo:7`
3. **Tesseract OCR** (optional, for text extraction from images)
   - Ubuntu/Debian: `sudo apt install tesseract-ocr`
   - macOS: `brew install tesseract`
   - Windows: https://github.com/UB-Mannheim/tesseract/wiki
4. **Poppler** (optional, for PDF rendering)
   - Ubuntu/Debian: `sudo apt install poppler-utils`
   - macOS: `brew install poppler`
   - Windows: https://github.com/oschwartz10612/poppler-windows

## Setup

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate        # Linux/macOS
# venv\Scripts\activate         # Windows

# Install dependencies
pip install -r requirements.txt

# Copy and configure environment
cp .env.example .env
# Edit .env if your MongoDB URL is different

# Start the server
python main.py
```

The API will be available at http://127.0.0.1:8000

Interactive API docs: http://127.0.0.1:8000/docs

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/signup` | Register a new user (username, password, role) |
| POST | `/api/v1/login` | Authenticate and get user context |
| POST | `/api/v1/verify?user_id={id}` | Upload a document for forgery detection |
| GET | `/api/v1/dashboard-stats?user_id={id}&role={role}` | Get verification stats and history |
| GET | `/api/v1/health` | Health check |

## How Forgery Detection Works

1. **Error Level Analysis (ELA)** — Re-saves the image at a specific JPEG quality and computes pixel-level differences. Regions that were edited or pasted in show different compression artifacts than the rest of the image.

2. **OCR Text Extraction** — Uses Tesseract to extract text from the document. The presence and quality of extracted text helps validate the document's authenticity.

3. **Verdict Classification** — Combines the ELA anomaly score and OCR results to classify the document as:
   - **Genuine** (anomaly < 25, text present) — high confidence
   - **Suspicious** (anomaly 25-60) — medium confidence
   - **Fake** (anomaly > 60) — high confidence

## MongoDB Collections

- **users** — `{ _id, username, password (hashed), role, created_at }`
- **verifications** — `{ _id, filename, verdict, confidence_score, created_at, user_id, username, details }`

## Running with Docker MongoDB

```bash
docker run -d -p 27017:27017 --name certguard-mongo mongo:7
python main.py
```
