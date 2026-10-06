# AarogyaVaani AI Service Specification & Feature Documentation

> **AI Engine Documentation for AarogyaVaani**  
> Multilingual Voice Processing, Adaptive Clinical Dialogue, Medical Red-Flag Classifier, Document OCR, & Clinical History Summarization.

---

## 1. Overview & Architecture

The **AarogyaVaani AI Service** handles all intelligent data processing, clinical history elicitation, safety evaluation, document digitizing, and summarization for primary healthcare kiosks in Tripura.

```
                                  ┌─────────────────────────────────────────┐
                                  │      AarogyaVaani AI Service Engine     │
                                  └────────────────────┬────────────────────┘
                                                       │
         ┌───────────────────────┬─────────────────────┼─────────────────────┬──────────────────────┐
         │                       │                     │                     │                      │
┌────────▼────────┐    ┌─────────▼─────────┐  ┌────────▼────────┐  ┌──────────▼──────────┐  ┌────────▼────────┐
│ Multilingual    │    │ Adaptive Clinical │  │ Red-Flag Danger │  │ Medical Document    │  │ Structured      │
│ ASR & TTS       │    │ Dialogue Engine   │  │ Sign Classifier │  │ OCR & Extraction    │  │ Clinical        │
│ (Bengali,       │    │ (SOCRATES, ANC,   │  │ (Maternal &     │  │ (Prescriptions,     │  │ Summarizer      │
│ Kokborok,       │    │ AYUSH Protocols)  │  │ Emergency)      │  │ Lab Reports)        │  │ (Doctor Report) │
│ Hindi, English) │    │                   │  │                 │  │                     │  │                 │
└─────────────────┘    └───────────────────┘  └─────────────────┘  └─────────────────────┘  └─────────────────┘
```

---

## 2. Core AI Modules & Features

### 2.1 Multilingual ASR & TTS Speech Pipeline
- **Supported Languages:** Bengali (`bn-IN`), Kokborok (`kok-IN`), Hindi (`hi-IN`), English (`en-IN`).
- **Primary Mechanism:** Browser Web Speech API (`SpeechRecognition` & `SpeechSynthesis`).
- **Fallback Engine:** **Bhashini / AI4Bharat IndicWhisper API** for regional Tripura dialects (Kokborok) where native browser speech recognition is limited.
- **Audio Prompts:** Plays out-loud audio instructions for non-literate and elderly patients before every intake step.

---

### 2.2 Adaptive Clinical Dialogue Manager
The AI dynamically selects follow-up questions based on the patient's chief complaint, implementing standard medical intake protocols:

1. **Pain Assessment (SOCRATES Framework):**
   - **S**ite (Where is the pain?)
   - **O**nset (When did it start?)
   - **C**haracter (Sharp, dull, burning?)
   - **R**adiation (Does it move anywhere?)
   - **A**ssociated symptoms (Nausea, sweating?)
   - **T**iming (Constant or comes and goes?)
   - **E**xacerbating/Relieving factors (What makes it better/worse?)
   - **S**everity (Scale of 1–10 / visual icon scale)

2. **Maternal & Antenatal Care (ANC) Protocol:**
   - Trimester tracking & Gestational Age.
   - Danger sign screening (Headaches, visual disturbance, swelling, reduced fetal movement).
   - Tetanus toxoid vaccination status & prior pregnancy history.

3. **AYUSH & Ayurvedic Intake Mode (*Dashavidha Pariksha*):**
   - *Prakriti* (Body constitution assessment).
   - *Vikriti* (Current physiological imbalance).
   - *Agni* (Digestive capacity), *Koshtha* (Bowel habits), & *Ahara-Vihara* (Dietary/lifestyle factors).

---

### 2.3 Medical Red-Flag & Danger Sign Classifier
A real-time safety pipeline that evaluates patient speech and icon selections for life-threatening emergency symptoms.

#### Emergency Rule Catalog
```json
[
  {
    "id": "maternal_preeclampsia",
    "category": "Maternal ANC",
    "triggers": ["severe headache", "blurry vision", "ঝাপসা দেখা", "খুব মাথা ব্যথা"],
    "severity": "CRITICAL",
    "action": "Trigger immediate high-priority alert on Nurse Triage screen"
  },
  {
    "id": "obstetric_hemorrhage",
    "category": "Maternal ANC",
    "triggers": ["bleeding", "রক্তপাত", "blood"],
    "severity": "EMERGENCY",
    "action": "Bypass routine queue; direct to emergency evaluation"
  },
  {
    "id": "acute_cardiac",
    "category": "General Adult",
    "triggers": ["chest pain", "বুকে ব্যথা", "shortness of breath"],
    "severity": "CRITICAL",
    "action": "Immediate ECG & Triage nurse dispatch"
  }
]
```

---

### 2.4 Medical Document OCR & Entity Extraction
A pipeline that processes camera scans of prior paper prescriptions and diagnostic lab reports:
- **Printed & Handwritten OCR:** Uses LayoutLM / Tesseract / Vision models to parse handwritten notes.
- **Clinical Entity Extraction:**
  - **Diagnoses:** Active and past medical conditions.
  - **Medications:** Drug names, dosages, frequencies, and duration.
  - **Lab Metric Extraction:** Hemoglobin, Blood Pressure, Blood Glucose, Urine Protein with out-of-range flag highlights.
- **Timeline Generator:** Automatically sorts physical documents chronologically into a digital patient timeline.

---

### 2.5 Structured Clinical History Summarizer (LLM Prompt Pipeline)
Synthesizes raw conversational voice transcripts and OCR-extracted paper notes into a single-page doctor draft.

#### LLM Prompt Template Structure
```
SYSTEM PROMPT:
You are an expert clinical documentation AI. Synthesize the provided raw patient voice answers and scanned paper record data into a concise, structured medical summary for the doctor.

OUTPUT SCHEMA (JSON):
{
  "chief_complaint": "String",
  "history_present_illness": "String (SOCRATES format)",
  "past_medical_surgical": ["List of conditions"],
  "current_medications": [{"drug": "Name", "dosage": "Value"}],
  "allergies": ["List of allergies"],
  "red_flags_detected": [{"rule_id": "ID", "severity": "Level"}],
  "doctor_notes_draft": "Formatted Markdown for EMR"
}
```

---

### 2.6 Privacy, Consent & DPDP 2023 AI Guardrails
- **Audio Consent:** Plays local language audio explanations of data collection before session start.
- **Transient Data Purging:** Deletes raw audio recordings immediately after speech transcription is complete.
- **Doctor Verification Gate:** The summary is presented as an **editable draft**—the doctor retains 100% control to accept, edit, or reject the record.

---

## 3. Directory Layout inside `ai_service/`

```
ai_service/
├── docs/
│   └── AI_SERVICE_SPECIFICATION.md   # Full specification & feature reference
├── models/
│   ├── speech_config.json            # ASR / TTS language mappings
│   └── prompt_templates.json         # LLM clinical summarization prompts
├── pipeline/
│   ├── summarizer.py                 # LLM clinical summary generator
│   ├── ocr_extractor.py              # Medical document OCR & entity parser
│   └── speech_adapter.py             # Web Speech & Bhashini API wrapper
├── rules/
│   └── danger_signs.py               # Emergency red-flag safety classifier
├── main.py                           # Microservice entry point
└── requirements.txt                  # Python AI dependencies
```
