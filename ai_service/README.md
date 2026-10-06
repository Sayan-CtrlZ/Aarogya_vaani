# AarogyaVaani AI Service

AI Processing microservice handling speech recognition, clinical history summarization, red-flag emergency classification, and medical document OCR.

> **Full Specification:** See [docs/AI_SERVICE_SPECIFICATION.md](docs/AI_SERVICE_SPECIFICATION.md) for detailed features, AI architecture, and clinical rule catalogs.

## AI Engine Features
- **Multilingual Speech ASR & TTS:** Bengali (`bn-IN`), Kokborok (`kok-IN`), Hindi (`hi-IN`), English (`en-IN`).
- **Adaptive Dialogue Manager:** Pain (SOCRATES), Maternal ANC, & AYUSH (*Dashavidha Pariksha*).
- **Red-Flag Classifier:** Real-time emergency symptom triage (`rules/danger_signs.py`).
- **Medical Document OCR:** Prescription & diagnostic lab report entity extraction.
- **Clinical Summarizer:** Structured single-page draft report for doctor review.

## Directory Structure
- `docs/`: Full AI specification documentation
- `models/`: Speech & LLM model configurations
- `pipeline/`: Clinical summarization & OCR pipelines
- `rules/`: Deterministic medical safety rules
- `main.py`: AI service entry point
