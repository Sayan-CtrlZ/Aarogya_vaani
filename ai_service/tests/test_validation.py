from app.services.validation_service import evaluate_lab_value, parse_reference_range


def test_evaluate_lab_value_low():
    status = evaluate_lab_value(10.2, "12.0 - 16.0")
    assert status == "low"


def test_evaluate_lab_value_normal():
    status = evaluate_lab_value(14.0, "12.0 - 16.0")
    assert status == "normal"


def test_evaluate_lab_value_high():
    status = evaluate_lab_value(18.5, "12.0 - 16.0")
    assert status == "high"


def test_evaluate_lab_value_no_ref_range():
    status = evaluate_lab_value(10.2, None)
    assert status == "unknown"


def test_parse_reference_range():
    low, high = parse_reference_range("12.0 - 16.0 g/dL")
    assert low == 12.0
    assert high == 16.0

    low2, high2 = parse_reference_range("< 5.0")
    assert low2 == 0.0
    assert high2 == 5.0
