"""Medical Function Tools for AarogyaVaani LiveKit Voice Agent.

Queries verified Supabase records stored in the patient's clinical dossier:
- Active medications, exact dosages, frequencies, and instructions.
- Radiology (X-Ray / Ultrasound) impressions and findings.
- Pathology / Lab test metrics and flagged abnormalities.
"""

from __future__ import annotations

import logging
from typing import Any

logger = logging.getLogger(__name__)


def query_prescription_medicines(
    dossier: dict[str, Any] | None,
    medicine_query: str = "",
    language_code: str = "bn-IN",
) -> str:
    """Query verified active medications from patient dossier."""
    if not dossier:
        return "No clinical records currently loaded for this patient."

    active_meds = dossier.get("active_medications") or []
    patient_name = dossier.get("patient", {}).get("name") or "Patient"

    if not active_meds:
        if language_code.startswith("bn"):
            return f"{patient_name}-এর জন্য বর্তমানে কোনো সক্রিয় প্রেসক্রিপশন পাওয়া যায়নি। ডাক্তারের সাথে পরামর্শ করুন।"
        elif language_code.startswith("hi"):
            return f"{patient_name} के लिए वर्तमान में कोई सक्रिय नुस्खा नहीं मिला। कृपया डॉक्टर से परामर्श लें।"
        return f"No active verified prescriptions on file for {patient_name}. Advise consulting the attending physician."

    query_lower = medicine_query.strip().lower()
    matched_meds = []
    for m in active_meds:
        m_name = m.get("name", "").lower()
        m_purpose = m.get("purpose", "").lower()
        if not query_lower or query_lower in m_name or query_lower in m_purpose or m_name in query_lower:
            matched_meds.append(m)

    if not matched_meds and query_lower:
        all_names = ", ".join(m.get("name", "") for m in active_meds)
        if language_code.startswith("bn"):
            return f"প্রেসক্রিপশনে '{medicine_query}' পাওয়া যায়নি। তবে নিবন্ধিত অনুমোদিত ওষুধগুলো হলো: {all_names}।"
        elif language_code.startswith("hi"):
            return f"नुस्खे में '{medicine_query}' नहीं मिली। हालांकि पंजीकृत दवाइयां हैं: {all_names}।"
        return f"Medicine '{medicine_query}' not found in active records. Registered medicines are: {all_names}."

    results = matched_meds if matched_meds else active_meds
    formatted_items = []
    for m in results:
        m_str = (
            f"• {m.get('name')}: Dosage: {m.get('dosage') or 'As directed'}, "
            f"Frequency: {m.get('frequency') or 'Once daily'}, "
            f"Instructions: {m.get('instructions') or 'Take after food'}. "
            f"Prescribed by: {m.get('prescribing_doctor') or 'Attending Doctor'}."
        )
        formatted_items.append(m_str)

    header = f"Verified Prescriptions for {patient_name} from Supabase Vault:\n"
    return header + "\n".join(formatted_items)


def query_xray_findings(
    dossier: dict[str, Any] | None,
    language_code: str = "bn-IN",
) -> str:
    """Query radiology and imaging impressions from patient dossier."""
    if not dossier:
        return "No clinical records currently loaded."

    findings = dossier.get("diagnostic_findings") or []
    patient_name = dossier.get("patient", {}).get("name") or "Patient"

    if not findings:
        if language_code.startswith("bn"):
            return f"{patient_name}-এর জন্য কোনো এক্স-রে বা রেডিওলজি রিপোর্ট নেই।"
        elif language_code.startswith("hi"):
            return f"{patient_name} के लिए कोई एक्स-रे रिपोर्ट उपलब्ध नहीं है।"
        return f"No imaging or radiology reports on file for {patient_name}."

    items = []
    for f in findings:
        summary = (
            f.get(f"summary_{language_code[:2]}")
            or f.get("summary_en")
            or f.get("impression")
            or "Normal examination"
        )
        items.append(
            f"• {f.get('title')} ({f.get('visit_date')}): {summary} (Urgency: {f.get('urgency', 'NORMAL')})"
        )

    return f"Verified Imaging / X-Ray Findings for {patient_name}:\n" + "\n".join(items)


def query_lab_results(
    dossier: dict[str, Any] | None,
    test_query: str = "",
    language_code: str = "bn-IN",
) -> str:
    """Query pathology laboratory test metrics from patient dossier."""
    if not dossier:
        return "No clinical records currently loaded."

    labs = dossier.get("lab_metrics") or []
    patient_name = dossier.get("patient", {}).get("name") or "Patient"

    if not labs:
        if language_code.startswith("bn"):
            return f"{patient_name}-এর জন্য কোনো ল্যাবরেটরি টেস্ট রিপোর্ট নেই।"
        elif language_code.startswith("hi"):
            return f"{patient_name} के लिए कोई प्रयोगशाला रिपोर्ट नहीं मिली।"
        return f"No lab test reports on file for {patient_name}."

    items = []
    q_lower = test_query.strip().lower()
    for l in labs:
        title = l.get("title") or "Blood Panel"
        summary = l.get(f"summary_{language_code[:2]}") or l.get("summary_en") or ""
        tests = l.get("tests") or []
        matched_tests = []
        for t in tests:
            tname = str(t.get("test_name", "")).lower()
            if not q_lower or q_lower in tname:
                matched_tests.append(
                    f"{t.get('test_name')}: {t.get('value')} {t.get('unit', '')} (Ref: {t.get('reference_range', 'Normal')})"
                )

        if matched_tests:
            items.append(f"• {title}: " + ", ".join(matched_tests))
        elif summary:
            items.append(f"• {title}: {summary}")

    if not items:
        return f"No matching lab test '{test_query}' found in reports for {patient_name}."

    return f"Verified Laboratory Results for {patient_name}:\n" + "\n".join(items)
