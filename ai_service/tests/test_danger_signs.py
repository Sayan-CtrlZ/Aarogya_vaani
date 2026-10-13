"""Unit tests for AarogyaVaani Medical Danger-Sign Rule Engine."""

import sys
import os

# Add rules directory to sys.path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from rules.danger_signs import (
    evaluate_danger_signs,
    get_triage_decision,
    get_emergency_guidance,
)


def test_no_false_positive_on_generic_yes():
    """Verify that innocuous sentences containing 'yes' or 'না' do NOT trigger false alarms."""
    innocuous_texts = [
        "Yes, I took my vitamins and had lunch.",
        "হ্যাঁ, আমি কাল ওষুধ খেয়েছি।",
        "हाँ, मैंने कल खाना खाया था।",
        "No, I don't feel tired today.",
        "I have a mild common cold since yesterday.",
    ]
    for text in innocuous_texts:
        flags = evaluate_danger_signs(free_text=text)
        assert len(flags) == 0, f"False positive triggered for harmless text: '{text}' -> {flags}"
        decision = get_triage_decision(flags)
        assert decision == "ROUTINE", f"Expected ROUTINE but got {decision}"


def test_maternal_vaginal_bleeding_emergency():
    """Verify maternal obstetric bleeding triggers immediate EMERGENCY and ESCALATE."""
    test_cases = [
        "Doctor, I am experiencing heavy vaginal bleeding.",
        "আমার খুব রক্তপাত হচ্ছে এবং পেটে ব্যথা।",
        "मुझे तेज ब्लीडिंग हो रही है।",
    ]
    for text in test_cases:
        flags = evaluate_danger_signs(free_text=text)
        assert len(flags) > 0, f"Failed to detect bleeding in: '{text}'"
        assert any(f["rule_id"] == "vaginal_bleeding" for f in flags)
        decision = get_triage_decision(flags)
        assert decision == "ESCALATE", f"Expected ESCALATE, got {decision}"


def test_maternal_severe_headache_critical():
    """Verify severe preeclampsia headache triggers CRITICAL -> ESCALATE."""
    text = "মাথা খুব বেশি ব্যথা করছে এবং চোখে ঝাপসা দেখছি।"
    flags = evaluate_danger_signs(free_text=text)
    assert any(f["rule_id"] == "severe_headache_preeclampsia" for f in flags)
    assert get_triage_decision(flags) == "ESCALATE"


def test_general_chest_pain_emergency():
    """Verify adult acute chest pain triggers EMERGENCY -> ESCALATE."""
    text = "I have sudden crushing chest pain radiating to left arm."
    flags = evaluate_danger_signs(free_text=text)
    assert any(f["rule_id"] == "acute_chest_pain" for f in flags)
    assert get_triage_decision(flags) == "ESCALATE"


def test_general_breathing_distress_emergency():
    """Verify respiratory distress triggers EMERGENCY -> ESCALATE."""
    text = "আমি শ্বাস নিতে পারছি না, খুব কষ্ট হচ্ছে।"
    flags = evaluate_danger_signs(free_text=text)
    assert any(f["rule_id"] == "severe_respiratory_distress" for f in flags)
    assert get_triage_decision(flags) == "ESCALATE"


def test_high_fever_monitor():
    """Verify high fever >103 triggers HIGH -> MONITOR."""
    text = "I have 104 fever for the past 2 days."
    flags = evaluate_danger_signs(free_text=text)
    assert any(f["rule_id"] == "critical_high_fever" for f in flags)
    assert get_triage_decision(flags) == "MONITOR"


def test_emergency_guidance_multilingual():
    """Verify emergency guidance is returned in Bengali, Hindi, and English."""
    flags = [{"rule_id": "acute_chest_pain", "severity": "EMERGENCY"}]
    bn_guide = get_emergency_guidance(flags, "bn-IN")
    hi_guide = get_emergency_guidance(flags, "hi-IN")
    en_guide = get_emergency_guidance(flags, "en-IN")

    assert "জরুরী" in bn_guide or "হাসপাতাল" in bn_guide
    assert "आपातकालीन" in hi_guide or "अस्पताल" in hi_guide
    assert "emergency" in en_guide.lower()


if __name__ == "__main__":
    test_no_false_positive_on_generic_yes()
    test_maternal_vaginal_bleeding_emergency()
    test_maternal_severe_headache_critical()
    test_general_chest_pain_emergency()
    test_general_breathing_distress_emergency()
    test_high_fever_monitor()
    test_emergency_guidance_multilingual()
    print("ALL DANGER SIGN TESTS PASSED SUCCESSFULLY!")
