# MediKiosk Module B — Medical Document Digitization & Intelligence REST API

Production-quality FastAPI REST API for **MediKiosk Module B: Medical Document Digitization and Intelligence**.

Processes handwritten prescriptions, printed prescriptions, laboratory reports, discharge summaries, and medical PDFs/images using **Claude API (Vision + Text)**, Pydantic v2 validation, and deterministic Python lab range evaluation.

---

## 🌟 Key Features

- **Multi-Format Processing:** Supports `.pdf`, `.jpg`, `.jpeg`, `.png`, `.webp` files up to 20MB.
- **PyMuPDF PDF Engine:** Extracts embedded text for digital PDFs or renders 200 DPI images for scanned PDFs.
- **Pillow Image Engine:** Validates image integrity, handles EXIF orientation correction, and prepares high-resolution RGB images.
- **Claude Vision Integration:** Powered by Claude API with Vision to accurately read handwritten prescriptions, medical shorthand, and lab tables.
- **Deterministic Lab Validation:** Parses numeric lab values and compares them against source reference ranges (Flags LOW / HIGH / CRITICAL / NORMAL).
- **Source Grounded Summarization:** Generates concise physician summaries with explicit safety disclaimers.
- **Mock AI Mode:** Set `ENABLE_MOCK_AI=true` for testing without consuming API credits.

---

## 🏗️ Architecture

```text
Client / Kiosk / Doctor UI
           │
  multipart/form-data
           │
           ▼
┌─────────────────────┐
│   FastAPI REST API  │
└──────────┬──────────┘
           │
   File Validation (Size, Extension, MIME)
           │
     ┌─────┴─────┐
     ▼           ▼
  PyMuPDF     Pillow
 (PDF Text/  (Image RGB/
  Images)     Resizing)
     │           │
     └─────┬─────┘
           │
           ▼
     Claude API (Vision & Structured JSON)
           │
           ▼
    Pydantic v2 Schema Validation
           │
           ▼
   Deterministic Lab Rule Engine
           │
           ▼
   Physician Summary Generator
           │
           ▼
    REST API Response JSON
```

---

## 🚀 Quick Start & Installation

### 1. Prerequisites
- Python 3.11+
- Virtual environment (`venv`)

### 2. Setup Virtual Environment & Install Dependencies
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 3. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Configure `.env`:
```env
ANTHROPIC_API_KEY=sk-ant-usr-...
CLAUDE_MODEL=claude-haiku-4-5-20251001
MAX_FILE_SIZE_MB=20
MAX_PDF_PAGES=10
ENABLE_MOCK_AI=false
LOG_LEVEL=INFO
```

### 4. Run the API Server
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Access Interactive API Documentation:
- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`

---

## 🧪 Running Tests

```bash
pytest -v
```

---

## 🐳 Docker Deployment

Build Docker image:
```bash
docker build -t medikiosk-document-api .
```

Run container:
```bash
docker run --env-file .env -p 8000:8000 medikiosk-document-api
```

---

## 📡 API Endpoints

### 1. `POST /api/v1/documents/analyze`
Uploads and analyzes a medical document or image.

**Example cURL Request:**
```bash
curl -X POST \
  http://localhost:8000/api/v1/documents/analyze \
  -F "file=@sample_prescription.jpg" \
  -F "document_type=prescription" \
  -F "patient_id=PAT-9012"
```

**Example JSON Response:**
```json
{
  "success": true,
  "document_id": "8f3b2a1e-4c7d-4e9f-9a1b-2c3d4e5f6a7b",
  "processing": {
    "status": "completed",
    "processing_time_ms": 1420
  },
  "document": {
    "filename": "sample_prescription.jpg",
    "document_type": "prescription",
    "confidence": 0.96,
    "document_date": "2026-10-08",
    "language": "English"
  },
  "patient": {
    "name": "Jane Doe",
    "age": 34,
    "sex": "Female",
    "patient_id": "PAT-9012"
  },
  "provider": {
    "doctor_name": "Dr. A. K. Sharma",
    "hospital": "Tripura State Hospital",
    "department": "Internal Medicine"
  },
  "diagnoses": [
    {
      "name": "Acute Upper Respiratory Infection",
      "status": "active",
      "notes": null
    }
  ],
  "medications": [
    {
      "name": "Amoxicillin",
      "strength": "500 mg",
      "dose": "1 capsule",
      "frequency": "three times daily",
      "route": "oral",
      "duration": "5 days",
      "instructions": "after food",
      "confidence": 0.95,
      "uncertain": false
    }
  ],
  "investigations": [],
  "important_findings": [],
  "summary": "Clinical Summary for Prescription dated 2026-10-08:\n...",
  "extraction_confidence": 0.94
}
```

### 2. `GET /health`
Returns system health status (`{"status": "healthy"}`).

### 3. `GET /api/v1/documents/{document_id}`
Retrieves stored analysis by document ID.

### 4. `GET /api/v1/documents/{document_id}/summary`
Retrieves physician clinical summary.

### 5. `GET /api/v1/documents/{document_id}/highlights`
Retrieves important findings & warnings.
