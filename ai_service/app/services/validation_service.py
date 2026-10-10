import re
from typing import Tuple, Optional, List, Dict, Any
from app.schemas.clinical import Investigation, ImportantFinding, DocumentWarning


def parse_numeric_val(val_str: Any) -> Optional[float]:
    """Attempts to extract a float from a string or numeric value."""
    if val_str is None:
        return None
    if isinstance(val_str, (int, float)):
        return float(val_str)

    # Search for numeric patterns e.g. "10.2", "12,500" -> 12500
    cleaned = str(val_str).replace(',', '')
    match = re.search(r'[-+]?\d*\.?\d+', cleaned)
    if match:
        try:
            return float(match.group(0))
        except ValueError:
            return None
    return None


def parse_reference_range(range_str: Optional[str]) -> Tuple[Optional[float], Optional[float]]:
    """
    Parses range string e.g. "12.0 - 16.0", "12-16 g/dL", "< 5", "> 100", "70 - 110"
    Returns (low_bound, high_bound).
    """
    if not range_str or not isinstance(range_str, str):
        return None, None

    cleaned = range_str.lower().strip()

    # Pattern: "< 5.0" or "less than 5"
    less_than_match = re.search(r'(?:<|less than)\s*([0-9.]+)', cleaned)
    if less_than_match:
        try:
            high_val = float(less_than_match.group(1))
            return 0.0, high_val
        except ValueError:
            pass

    # Pattern: "> 100" or "greater than 100"
    greater_than_match = re.search(r'(?:>|greater than)\s*([0-9.]+)', cleaned)
    if greater_than_match:
        try:
            low_val = float(greater_than_match.group(1))
            return low_val, float('inf')
        except ValueError:
            pass

    # Pattern: "12.0 - 16.0" or "12 to 16"
    range_match = re.search(r'([0-9.]+)\s*(?:-|to|\–)\s*([0-9.]+)', cleaned)
    if range_match:
        try:
            low_val = float(range_match.group(1))
            high_val = float(range_match.group(2))
            return low_val, high_val
        except ValueError:
            pass

    return None, None


def evaluate_lab_value(value: Any, reference_range: Optional[str]) -> str:
    """
    Deterministically evaluates a lab result against its reference range.
    Returns: 'normal' | 'high' | 'low' | 'critical' | 'unknown'
    Rule: Never invent reference ranges if missing!
    """
    num_val = parse_numeric_val(value)
    if num_val is None:
        return "unknown"

    low_bound, high_bound = parse_reference_range(reference_range)
    if low_bound is None and high_bound is None:
        return "unknown"

    if low_bound is not None and num_val < low_bound:
        # Check if severely low (>30% below lower bound)
        if low_bound > 0 and (low_bound - num_val) / low_bound > 0.3:
            return "critical"
        return "low"

    if high_bound is not None and num_val > high_bound:
        # Check if severely high (>50% above upper bound)
        if high_bound != float('inf') and (num_val - high_bound) / high_bound > 0.5:
            return "critical"
        return "high"

    return "normal"


def validate_and_enrich_investigations(investigations: List[dict]) -> List[Investigation]:
    """Runs deterministic Python validation on all lab investigation items."""
    validated: List[Investigation] = []
    for item in investigations:
        raw_val = item.get("value")
        ref_range = item.get("reference_range")
        calc_status = evaluate_lab_value(raw_val, ref_range)

        # If LLM gave status, but rule engine derived a specific status, prioritize rule engine
        final_status = item.get("status", "unknown").lower()
        if calc_status != "unknown":
            final_status = calc_status

        validated.append(
            Investigation(
                name=str(item.get("name", "Unknown Test")),
                value=raw_val if raw_val is not None else "N/A",
                unit=item.get("unit"),
                reference_range=ref_range,
                status=final_status,
                confidence=float(item.get("confidence", 1.0))
            )
        )
    return validated


def generate_important_findings(
    investigations: List[Investigation],
    medications: List[Any],
    diagnoses: List[Any],
    warnings: List[DocumentWarning]
) -> List[ImportantFinding]:
    """
    Generates non-diagnostic, source-grounded important findings.
    """
    findings: List[ImportantFinding] = []

    # 1. Abnormal or critical lab findings
    for lab in investigations:
        if lab.status in ("low", "high", "critical"):
            sev = "critical" if lab.status == "critical" else "high" if lab.status in ("low", "high") else "moderate"
            ref_str = f" (Reference: {lab.reference_range})" if lab.reference_range else ""
            unit_str = f" {lab.unit}" if lab.unit else ""
            desc = f"{lab.name} ({lab.value}{unit_str}) is below the reference range provided in the report{ref_str}." if lab.status == "low" else f"{lab.name} ({lab.value}{unit_str}) is above the reference range provided in the report{ref_str}."

            findings.append(
                ImportantFinding(
                    type="critical_lab" if lab.status == "critical" else "abnormal_lab",
                    severity=sev,
                    title=f"Abnormal {lab.name} Result",
                    description=desc,
                    source=f"Lab Test: {lab.name}"
                )
            )

    # 2. Document warnings
    for warn in warnings:
        findings.append(
            ImportantFinding(
                type="document_warning",
                severity="moderate",
                title=f"Warning: {warn.code}",
                description=warn.message,
                source="Document Quality Check"
            )
        )

    return findings
