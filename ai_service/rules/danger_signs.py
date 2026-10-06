"""
AarogyaVaani Medical Danger-Sign & Red-Flag Rule Engine
Evaluates patient answers for emergency symptoms (Maternal ANC & General Adult).
"""

MATERNAL_DANGER_RULES = [
    {
        "id": "severe_headache",
        "question_id": "anc_headache",
        "triggers": ["severe", "খুব বেশি", "হাঁ", "হ্যাঁ", "yes"],
        "severity": "CRITICAL",
        "alert": "Possible severe preeclampsia indicator."
    },
    {
        "id": "vaginal_bleeding",
        "question_id": "anc_bleeding",
        "triggers": ["bleeding", "রক্তপাত", "হাঁ", "হ্যাঁ", "yes"],
        "severity": "EMERGENCY",
        "alert": "Obstetric hemorrhage risk. Immediate clinical evaluation required."
    },
    {
        "id": "reduced_fetal_movement",
        "question_id": "anc_movement",
        "triggers": ["no movement", "কম নড়াচড়া", "না", "no"],
        "severity": "HIGH",
        "alert": "Decreased fetal movement reported."
    }
]

def evaluate_danger_signs(answers: dict) -> list:
    detected_flags = []
    for rule in MATERNAL_DANGER_RULES:
        user_val = str(answers.get(rule["question_id"], "")).lower()
        if any(trigger in user_val for trigger in rule["triggers"]):
            detected_flags.append({
                "rule_id": rule["id"],
                "severity": rule["severity"],
                "alert_message": rule["alert"]
            })
    return detected_flags
