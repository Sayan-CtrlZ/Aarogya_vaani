from app.schemas.clinical import Medication, Investigation, PatientInfo
from app.schemas.responses import DocumentAnalysisResponse, PerDocumentResult, ProcessingBatchMeta


def test_medication_schema():
    med = Medication(
        name="Amoxicillin",
        strength="500 mg",
        frequency="TDS",
        confidence=0.95,
        uncertain=False
    )
    assert med.name == "Amoxicillin"
    assert med.strength == "500 mg"
    assert med.confidence == 0.95


def test_document_analysis_response_schema():
    resp = DocumentAnalysisResponse(
        request_id="req-12345",
        processing=ProcessingBatchMeta(
            status="completed",
            documents_received=1,
            documents_processed=1,
            documents_failed=0,
            processing_time_ms=150
        ),
        documents=[
            PerDocumentResult(
                document_id="doc-123",
                filename="prescription.png",
                document_type="prescription",
                confidence=0.95,
                status="completed"
            )
        ]
    )
    assert resp.success is True
    assert resp.request_id == "req-12345"
    assert resp.processing.documents_processed == 1
    assert resp.documents[0].filename == "prescription.png"
