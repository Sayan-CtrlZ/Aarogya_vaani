from typing import Dict, Any, List, Optional, Tuple
from app.schemas.clinical import (
    PatientInfo,
    ProviderInfo,
    Diagnosis,
    Medication,
    Investigation,
    Procedure,
    MedicalHistoryItem,
    Allergy,
    ImportantFinding,
    DocumentWarning
)
from app.schemas.responses import (
    PerDocumentResult,
    CombinedClinicalRecord
)
from app.services.validation_service import validate_and_enrich_investigations, generate_important_findings
from app.services.summary_service import generate_clinical_summary


def parse_raw_ai_extraction(
    raw_ai_dict: Dict[str, Any],
    user_doc_type: Optional[str] = None
) -> Dict[str, Any]:
    """
    Parses raw AI JSON into validated domain dictionary for a single document.
    """
    doc_type = raw_ai_dict.get("document_type") or user_doc_type or "auto"
    doc_conf = float(raw_ai_dict.get("document_type_confidence", 1.0))
    doc_date = raw_ai_dict.get("document_date")

    raw_patient = raw_ai_dict.get("patient") or {}
    patient = PatientInfo(
        name=raw_patient.get("name"),
        age=raw_patient.get("age"),
        sex=raw_patient.get("sex"),
        patient_id=raw_patient.get("patient_id")
    )

    raw_provider = raw_ai_dict.get("provider") or {}
    provider = ProviderInfo(
        doctor_name=raw_provider.get("doctor_name"),
        hospital=raw_provider.get("hospital"),
        department=raw_provider.get("department")
    )

    diagnoses: List[Diagnosis] = []
    for d in raw_ai_dict.get("diagnoses") or []:
        if isinstance(d, dict) and d.get("name"):
            diagnoses.append(Diagnosis(
                name=str(d.get("name")),
                status=d.get("status"),
                notes=d.get("notes")
            ))

    medications: List[Medication] = []
    for m in raw_ai_dict.get("medications") or []:
        if isinstance(m, dict) and (m.get("name") or m.get("uncertain")):
            medications.append(Medication(
                name=m.get("name"),
                strength=m.get("strength"),
                dose=m.get("dose"),
                frequency=m.get("frequency"),
                route=m.get("route"),
                duration=m.get("duration"),
                instructions=m.get("instructions"),
                confidence=float(m.get("confidence", 1.0)),
                uncertain=bool(m.get("uncertain", False))
            ))

    raw_investigations = raw_ai_dict.get("investigations") or []
    validated_investigations = validate_and_enrich_investigations(raw_investigations)

    procedures: List[Procedure] = []
    for p in raw_ai_dict.get("procedures") or []:
        if isinstance(p, dict) and p.get("name"):
            procedures.append(Procedure(
                name=str(p.get("name")),
                date=p.get("date"),
                notes=p.get("notes")
            ))

    history_items: List[MedicalHistoryItem] = []
    for h in raw_ai_dict.get("medical_history") or []:
        if isinstance(h, dict) and h.get("condition"):
            history_items.append(MedicalHistoryItem(
                condition=str(h.get("condition")),
                duration=h.get("duration"),
                notes=h.get("notes")
            ))

    allergies: List[Allergy] = []
    for a in raw_ai_dict.get("allergies") or []:
        if isinstance(a, dict) and a.get("allergen"):
            allergies.append(Allergy(
                allergen=str(a.get("allergen")),
                reaction=a.get("reaction"),
                severity=a.get("severity")
            ))

    warnings: List[DocumentWarning] = []
    for w in raw_ai_dict.get("warnings") or []:
        if isinstance(w, dict) and w.get("message"):
            warnings.append(DocumentWarning(
                code=str(w.get("code", "WARNING")),
                message=str(w.get("message")),
                details=w.get("details")
            ))

    important_findings = generate_important_findings(
        investigations=validated_investigations,
        medications=medications,
        diagnoses=diagnoses,
        warnings=warnings
    )

    return {
        "document_type": doc_type,
        "confidence": doc_conf,
        "document_date": doc_date,
        "patient": patient,
        "provider": provider,
        "diagnoses": diagnoses,
        "medications": medications,
        "investigations": validated_investigations,
        "procedures": procedures,
        "medical_history": history_items,
        "allergies": allergies,
        "important_findings": important_findings,
        "warnings": warnings
    }


def aggregate_multi_document_extractions(
    doc_results: List[PerDocumentResult],
    generate_summary: bool = True,
    language: Optional[str] = "English"
) -> Tuple[CombinedClinicalRecord, str, List[DocumentWarning]]:
    """
    Combines extracted medical entities across all documents with cross-document deduplication.
    Generates a unified clinical summary.
    """
    merged_patient = PatientInfo()
    merged_provider = ProviderInfo()

    merged_diagnoses: List[Diagnosis] = []
    merged_medications: List[Medication] = []
    merged_investigations: List[Investigation] = []
    merged_procedures: List[Procedure] = []
    merged_history: List[MedicalHistoryItem] = []
    merged_allergies: List[Allergy] = []
    merged_findings: List[ImportantFinding] = []
    merged_warnings: List[DocumentWarning] = []

    seen_diag_names = set()
    seen_med_keys = set()
    seen_lab_keys = set()

    for doc in doc_results:
        if doc.status != "completed" or not doc.extracted_data:
            continue

        data = doc.extracted_data

        # Patient Info (fill first non-null values)
        p = data.get("patient")
        if isinstance(p, PatientInfo) or isinstance(p, dict):
            p_dict = p.model_dump() if isinstance(p, PatientInfo) else p
            if not merged_patient.name and p_dict.get("name"):
                merged_patient.name = p_dict["name"]
            if not merged_patient.age and p_dict.get("age"):
                merged_patient.age = p_dict["age"]
            if not merged_patient.sex and p_dict.get("sex"):
                merged_patient.sex = p_dict["sex"]
            if not merged_patient.patient_id and p_dict.get("patient_id"):
                merged_patient.patient_id = p_dict["patient_id"]

        # Provider Info
        prov = data.get("provider")
        if isinstance(prov, ProviderInfo) or isinstance(prov, dict):
            prov_dict = prov.model_dump() if isinstance(prov, ProviderInfo) else prov
            if not merged_provider.doctor_name and prov_dict.get("doctor_name"):
                merged_provider.doctor_name = prov_dict["doctor_name"]
            if not merged_provider.hospital and prov_dict.get("hospital"):
                merged_provider.hospital = prov_dict["hospital"]
            if not merged_provider.department and prov_dict.get("department"):
                merged_provider.department = prov_dict["department"]

        # Diagnoses Deduplication
        for d in data.get("diagnoses") or []:
            diag_obj = d if isinstance(d, Diagnosis) else Diagnosis(**d)
            key = diag_obj.name.strip().lower()
            if key not in seen_diag_names:
                seen_diag_names.add(key)
                merged_diagnoses.append(diag_obj)

        # Medications Deduplication
        for m in data.get("medications") or []:
            med_obj = m if isinstance(m, Medication) else Medication(**m)
            med_name = (med_obj.name or "").strip().lower()
            med_str = (med_obj.strength or "").strip().lower()
            key = f"{med_name}_{med_str}"
            if key not in seen_med_keys:
                seen_med_keys.add(key)
                merged_medications.append(med_obj)

        # Investigations Deduplication
        for inv in data.get("investigations") or []:
            inv_obj = inv if isinstance(inv, Investigation) else Investigation(**inv)
            key = f"{inv_obj.name.strip().lower()}_{inv_obj.value}"
            if key not in seen_lab_keys:
                seen_lab_keys.add(key)
                merged_investigations.append(inv_obj)

        # Procedures
        for proc in data.get("procedures") or []:
            proc_obj = proc if isinstance(proc, Procedure) else Procedure(**proc)
            merged_procedures.append(proc_obj)

        # History
        for h in data.get("medical_history") or []:
            h_obj = h if isinstance(h, MedicalHistoryItem) else MedicalHistoryItem(**h)
            merged_history.append(h_obj)

        # Allergies
        for a in data.get("allergies") or []:
            a_obj = a if isinstance(a, Allergy) else Allergy(**a)
            merged_allergies.append(a_obj)

        # Findings & Warnings
        for f in data.get("important_findings") or []:
            f_obj = f if isinstance(f, ImportantFinding) else ImportantFinding(**f)
            merged_findings.append(f_obj)

        for w in data.get("warnings") or []:
            w_obj = w if isinstance(w, DocumentWarning) else DocumentWarning(**w)
            merged_warnings.append(w_obj)

    combined_record = CombinedClinicalRecord(
        patient=merged_patient,
        provider=merged_provider,
        diagnoses=merged_diagnoses,
        medications=merged_medications,
        investigations=merged_investigations,
        procedures=merged_procedures,
        medical_history=merged_history,
        allergies=merged_allergies,
        important_findings=merged_findings,
        timeline=[]
    )

    unified_summary = ""
    if generate_summary:
        unified_summary = generate_clinical_summary(
            document_type="multi_document_batch",
            document_date=None,
            patient=merged_patient,
            provider=merged_provider,
            diagnoses=merged_diagnoses,
            medications=merged_medications,
            investigations=merged_investigations,
            warnings=merged_warnings
        )

    return combined_record, unified_summary, merged_warnings
