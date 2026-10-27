from typing import List
from app.schemas.clinical import (
    PatientInfo,
    ProviderInfo,
    Diagnosis,
    Medication,
    Investigation,
    DocumentWarning
)

DISCLAIMER = "Note: This is an AI-assisted information extraction draft based solely on the source document. It is NOT an autonomous medical diagnosis or prescription. Requires review and verification by a qualified physician."


def generate_clinical_summary(
    document_type: str,
    document_date: str = None,
    patient: PatientInfo = None,
    provider: ProviderInfo = None,
    diagnoses: List[Diagnosis] = None,
    medications: List[Medication] = None,
    investigations: List[Investigation] = None,
    warnings: List[DocumentWarning] = None
) -> str:
    """
    Generates a clear, factual, source-grounded clinical summary for physician review.
    """
    lines = []
    doc_type_title = document_type.replace('_', ' ').title() if document_type else "Medical Document"
    date_str = f" dated {document_date}" if document_date else ""
    lines.append(f"Clinical Summary for {doc_type_title}{date_str}:")
    lines.append("")

    # Patient & Provider Details
    meta_parts = []
    if patient and patient.name:
        meta_parts.append(f"Patient: {patient.name}")
    if patient and patient.age:
        meta_parts.append(f"Age: {patient.age}")
    if patient and patient.sex:
        meta_parts.append(f"Sex: {patient.sex}")
    if provider and provider.doctor_name:
        meta_parts.append(f"Provider: {provider.doctor_name}")
    if provider and provider.hospital:
        meta_parts.append(f"Facility: {provider.hospital}")

    if meta_parts:
        lines.append("Demographics & Provider: " + " | ".join(meta_parts))
        lines.append("")

    # Diagnoses
    if diagnoses and len(diagnoses) > 0:
        lines.append("Documented Diagnoses / Conditions:")
        for diag in diagnoses:
            status_str = f" ({diag.status})" if diag.status else ""
            lines.append(f" • {diag.name}{status_str}")
        lines.append("")
    else:
        lines.append("Diagnoses: No explicit diagnoses documented in source.")
        lines.append("")

    # Medications
    if medications and len(medications) > 0:
        lines.append("Extracted Medications:")
        for med in medications:
            med_name = med.name or "Unspecified Medicine"
            details = []
            if med.strength:
                details.append(med.strength)
            if med.dose:
                details.append(f"Dose: {med.dose}")
            if med.frequency:
                details.append(f"Freq: {med.frequency}")
            if med.duration:
                details.append(f"Duration: {med.duration}")
            if med.instructions:
                details.append(f"Notes: {med.instructions}")

            detail_str = f" ({', '.join(details)})" if details else ""
            uncert_str = " [Uncertain Reading]" if med.uncertain else ""
            lines.append(f" • {med_name}{detail_str}{uncert_str}")
        lines.append("")

    # Laboratory / Investigations
    if investigations and len(investigations) > 0:
        lines.append("Laboratory / Diagnostic Results:")
        for lab in investigations:
            unit_str = f" {lab.unit}" if lab.unit else ""
            ref_str = f" [Ref: {lab.reference_range}]" if lab.reference_range else " [No ref range]"
            flag_str = ""
            if lab.status == "low":
                flag_str = " -> BELOW REFERENCE RANGE"
            elif lab.status == "high":
                flag_str = " -> ABOVE REFERENCE RANGE"
            elif lab.status == "critical":
                flag_str = " -> CRITICAL OUT OF RANGE"

            lines.append(f" • {lab.name}: {lab.value}{unit_str}{ref_str}{flag_str}")
        lines.append("")

    # Document Warnings
    if warnings and len(warnings) > 0:
        lines.append("Document Quality Warnings:")
        for warn in warnings:
            lines.append(f" ⚠️ {warn.message}")
        lines.append("")

    lines.append(DISCLAIMER)

    return "\n".join(lines)
