# AarogyaVaani Backend Server

FastAPI backend server handling patient session API endpoints, database persistence, offline synchronization queue, and ABDM FHIR interoperability.

## Directory Structure

- `app/api/`: REST API route controllers
- `app/core/`: Configuration, logging, & security settings
- `app/db/`: Database connection models (PostgreSQL / SQLite)
- `app/services/`: External integrations (ABDM / ABHA FHIR gateway)
- `main.py`: Application entry point

## Getting Started

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
