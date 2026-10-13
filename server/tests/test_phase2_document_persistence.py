"""Phase 2 Automated Test: Gemini Document Persistence & Medical Drive on Supabase."""

import os
from pathlib import Path
from fastapi.testclient import TestClient

from app.main import app
from app.db.supabase_client import (
    get_supabase_client,
    VAULT_BUCKET_NAME,
)

client = TestClient(app)
SAMPLE_DIR = Path(__file__).parent / "samples"
TEST_PATIENT_REF = "AV-2026-8921"


def test_upload_and_persist_prescription_to_supabase():
    """Test full document pipeline: Upload -> Gemini OCR -> Supabase Storage & PostgreSQL."""
    sample_path = SAMPLE_DIR / "sample_prescription.jpg"
    assert sample_path.exists(), f"Sample prescription missing at {sample_path}"

    with open(sample_path, "rb") as f:
        response = client.post(
            "/api/documents/analyze",
            files={"file": ("sample_prescription.jpg", f, "image/jpeg")},
            data={
                "patient_id": TEST_PATIENT_REF,
                "category": "Prescription",
                "title": "ANC Prenatal Doctor Prescription",
                "facility": "Bishalgarh Community Health Centre",
            },
        )

    assert response.status_code == 201, f"Expected 201 Created, got {response.status_code}: {response.text}"
    doc = response.json()

    doc_id = doc["id"]
    assert doc_id.startswith("doc_")
    assert doc["patient_id"] == TEST_PATIENT_REF
    assert doc["category"] == "Prescription"
    assert "file_url" in doc and doc["file_url"].startswith("http")
    assert "patient_summary" in doc
    assert isinstance(doc["patient_summary"], dict)

    # 1. Verify row in Supabase PostgreSQL medical_records table
    supabase = get_supabase_client()
    db_res = supabase.table("medical_records").select("*").eq("id", doc_id).execute()
    assert db_res.data and len(db_res.data) == 1, f"Record {doc_id} not found in Supabase medical_records"
    db_row = db_res.data[0]
    assert db_row["title"] == "ANC Prenatal Doctor Prescription"
    assert db_row["storage_path"] != ""

    # 2. Verify file in Supabase Storage private bucket
    storage_path = db_row["storage_path"]
    folder_prefix = "/".join(storage_path.split("/")[:-1])
    file_name = storage_path.split("/")[-1]
    bucket_files = supabase.storage.from_(VAULT_BUCKET_NAME).list(folder_prefix)
    found = any(f["name"] == file_name for f in bucket_files)
    assert found, f"File {file_name} not found in storage bucket under {folder_prefix}"

    # 3. Test Medical Drive Search & Filter API
    search_res = client.get(
        f"/api/documents/patient/{TEST_PATIENT_REF}?search=Prenatal"
    )
    assert search_res.status_code == 200
    search_docs = search_res.json()
    assert len(search_docs) >= 1
    assert any(d["id"] == doc_id for d in search_docs)

    # 4. Test Single Document Retrieval
    get_res = client.get(f"/api/documents/{doc_id}")
    assert get_res.status_code == 200
    single_doc = get_res.json()
    assert single_doc["id"] == doc_id
    assert single_doc["title"] == "ANC Prenatal Doctor Prescription"

    # 5. Test Patient Clinical Context Synthesis from Supabase
    context_res = client.get(f"/api/patients/{TEST_PATIENT_REF}/context")
    assert context_res.status_code == 200
    context = context_res.json()
    assert context["total_records"] >= 1
    assert "synthesized_voice_briefing" in context

    print(f"\n[PASS] Document {doc_id} persisted to Supabase and verified in Medical Drive!")
    print(f"  - Storage Path: {storage_path}")
    print(f"  - Signed URL preview generated successfully.")
    print(f"  - Synthesis: {context['synthesized_voice_briefing'][:100]}...")

    # Clean up test artifact from DB and Storage
    try:
        supabase.table("medical_records").delete().eq("id", doc_id).execute()
        supabase.storage.from_(VAULT_BUCKET_NAME).remove([storage_path])
        print(f"  - Cleaned up test document {doc_id} from Supabase.")
    except Exception as e:
        print(f"  ! Cleanup notice: {e}")
