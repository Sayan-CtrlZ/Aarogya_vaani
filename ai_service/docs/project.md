# AarogyaVaani — Project Description

**An AI-powered healthcare companion with patient-controlled health records and secure doctor collaboration.**

## 1. Project Overview

AarogyaVaani is an AI-powered healthcare platform designed to help people communicate their health concerns, organize their medical information, prepare for consultations, and share relevant health records securely with doctors.

The platform combines a multilingual AI health assistant, a patient portal, and a doctor portal into one connected healthcare experience. Its primary goal is to make healthcare information more accessible and help patients communicate their symptoms and medical history more effectively.

AarogyaVaani is intended to support patients throughout their healthcare journey rather than serve only as a hospital registration system or a symptom-checking chatbot.

The AI assistant collects patient-reported information through natural conversation, asks relevant follow-up questions, identifies predefined danger signs using deterministic rules, and prepares structured summaries for clinical review. Patients can eventually maintain their health records and authorize doctors to access selected information through temporary, controlled permissions.

**Core principle:** AarogyaVaani assists patients and healthcare professionals. It does not replace qualified clinicians or independently make definitive diagnoses or prescribe treatment.

## 2. Problem Statement

Patients often struggle to explain their symptoms clearly, remember their medical history, organize prescriptions and reports, and communicate relevant information during consultations.

Healthcare professionals may also need to spend valuable consultation time collecting basic patient history before they can focus on clinical assessment.

Existing healthcare experiences can be fragmented, particularly when patients have medical information scattered across paper prescriptions, laboratory reports, discharge summaries, and separate healthcare providers.

AarogyaVaani aims to address these challenges by:

- Providing a conversational interface for collecting patient-reported health information.
- Asking relevant follow-up questions based on the patient's responses.
- Organizing consultation information into structured, readable summaries.
- Helping patients maintain a consolidated personal health record.
- Enabling patients to share selected records with authorized doctors.
- Supporting clinician review while maintaining a clear distinction between AI-generated information and doctor-authored clinical decisions.

## 3. Product Vision

AarogyaVaani consists of three connected components.

### 3.1 Patient Platform

The patient platform provides a central place to interact with the AI assistant and manage personal health information.

Planned capabilities include:

- Patient registration, login, and profile management.
- Voice-based and text-based health conversations.
- Multilingual communication.
- Adaptive symptom follow-up questions.
- Personal health records and consultation history.
- Uploading prescriptions, laboratory reports, discharge summaries, and other medical documents.
- Reviewing AI-generated consultation summaries.
- Sharing selected records with doctors through temporary access permissions.
- Managing consent, active sharing permissions, and privacy settings.

### 3.2 Doctor Platform

The doctor platform is a clinical workspace for reviewing patient-authorized information and documenting professional assessments.

Planned capabilities include:

- Verified doctor accounts.
- Accessing records through patient-authorized sharing.
- Reviewing patient-reported symptoms and consultation summaries.
- Viewing relevant medical history and uploaded documents.
- Reviewing safety alerts.
- Recording clinical notes and assessments.
- Creating and approving doctor-authored prescriptions.
- Managing consultations and documenting follow-up instructions.
- Accessing only the information authorized for the relevant patient and consultation.

AI-generated summaries must remain distinguishable from a doctor's assessment, approved prescription, and other clinician-authored records.

### 3.3 AI Health Assistant

The AI assistant is the conversational intelligence layer of AarogyaVaani.

Its responsibilities include:

- Understanding the patient's stated health concern.
- Asking context-dependent follow-up questions.
- Recording the patient's original answers.
- Identifying missing information without inventing facts.
- Running predefined, deterministic safety checks.
- Preparing factual, structured consultation summaries.
- Communicating limitations and recommending appropriate medical attention when required.
- Helping patients prepare information for review by a healthcare professional.

The assistant must not present itself as a human or a doctor. It must not independently diagnose a disease, prescribe medication, or claim that a patient is safe simply because no configured danger-sign rule was triggered.

## 4. AI Voice Assistant

The voice assistant is a central part of AarogyaVaani.

It uses a real-time voice pipeline to receive patient speech, process the conversation through an AI model, and respond with synthesized speech.

### Voice pipeline

1. **Speech input:** Capture the patient's spoken response.
2. **Speech-to-text:** Convert speech into text using the configured speech recognition provider.
3. **Conversation processing:** Interpret the patient's concern and determine an appropriate next question.
4. **Safety evaluation:** Run the applicable deterministic danger-sign checks.
5. **State and record management:** Preserve the conversation's progress and recorded answers.
6. **Text-to-speech:** Convert the assistant's response into spoken output.
7. **Summary and persistence:** Generate and save a structured consultation record when the workflow permits it.

### Current provider configuration

| Component                      | Technology                          |
| ------------------------------ | ----------------------------------- |
| Real-time voice infrastructure | LiveKit Agents                      |
| Speech-to-text (STT)           | AssemblyAI                          |
| Large language model (LLM)     | Anthropic                           |
| Text-to-speech (TTS)           | Cartesia                            |
| Voice activity detection (VAD) | Silero                              |
| Turn detection                 | LiveKit multilingual turn detection |
| Local session persistence      | JSON snapshots and JSONL event logs |
| Workflow models                | Pydantic                            |

The existing provider configuration should be preserved unless a specific technical issue justifies a change.

Actual language availability and quality depend on the configured provider models and their supported features. Hindi, English, Bengali, and code-switching must be validated through testing rather than assumed to work reliably.

### Conversation requirements

The assistant should:

- Speak naturally, warmly, and concisely.
- Ask one question at a time.
- Adapt subsequent questions to the patient's answers.
- Avoid repetitive or unnecessary questions.
- Allow patients to repeat a question, request slower speech, correct an answer, change language where supported, or stop the conversation.
- Preserve the original patient responses for later review.
- Avoid fabricating information when an answer is unclear or missing.
- Explain urgent safety instructions clearly without creating unnecessary panic.

## 5. Patient Intake Workflow

The intake process is designed as an explicit state machine rather than an unrestricted conversation.

### Intended workflow

`Session creation → Consent → Intake → Safety evaluation → Summary → Submission`

The application controls the session state and determines which operations are permitted.

| State                      | Purpose                                                                                     |
| -------------------------- | ------------------------------------------------------------------------------------------- |
| `awaiting_consent`         | The assistant explains the interaction and requests consent.                                |
| `in_progress`              | The patient has consented and the intake is underway.                                       |
| `urgent_review`            | A configured danger-sign rule has triggered; routine questioning stops.                     |
| `submitted`                | The completed intake and its summary have been successfully saved.                          |
| Refused or cancelled state | The patient declines consent or stops the process, as represented by the implemented model. |

The exact enum values and permitted transitions must follow the actual implementation in `workflow/models.py`.

### Core workflow operations

- `begin_intake`: Creates a new intake session.
- `record_consent`: Records explicit consent or refusal.
- `record_answer`: Validates and saves an individual question-answer pair.
- `submit_intake`: Validates submission requirements, generates a structured summary, and persists the final state.

These operations must enforce the application's state transitions. The language model must not be allowed to invent session identifiers, override consent, or arbitrarily change application state.

If persistence fails, the assistant must not claim that the record was successfully saved.

## 6. Clinical Safety

Clinical safety is a core architectural requirement.

AarogyaVaani uses deterministic application-level rules to identify predefined danger signs independently of the language model's free-form reasoning.

The existing implementation in `rules/danger_signs.py` contains maternal-health danger-sign checks, including supported English and Bengali keyword triggers. These rules must be reused and integrated according to their actual function signature and intended behavior.

### Safety requirements

- Preserve the existing rules unless a change is explicitly reviewed and justified.
- Evaluate relevant patient answers using deterministic checks.
- Persist the triggering answer and the resulting safety flag.
- Stop routine intake when a rule requires urgent review.
- Communicate appropriate safety guidance based on the applicable rule.
- Never interpret the absence of a triggered rule as proof that the patient is medically safe.
- Do not generate diagnoses or prescriptions.
- Preserve uncertainty and missing information in the summary.
- Keep safety flags separate from clinician-confirmed diagnoses.
- Require qualified clinical review of safety rules before real-world deployment.

The current maternal-health rules must not be represented as a complete medical triage system for every health condition.

## 7. Consultation Summary

AarogyaVaani generates a structured summary from information explicitly collected during the interaction.

Depending on the information available, the summary may include:

- Session identifier and selected language.
- Patient's primary concern.
- Original questions and patient answers.
- Symptom timing and severity, when explicitly provided.
- Relevant medical history, when explicitly collected.
- Triggered safety flags.
- Missing or unknown information.
- AI-generated summary status.
- Clinician-review status.
- Submission timestamp, when applicable.

The summary must remain faithful to the original answers. It must not invent symptoms, medication use, medical history, or other patient details.

The AI-generated summary is a draft for review, not a confirmed clinical diagnosis or a substitute for a clinician's assessment.

## 8. Local Persistence and Data Integrity

During the initial AI-service development phase, consultation data is stored locally rather than in a cloud database.

### Current persistence approach

**JSON snapshots**

Each session has a structured snapshot representing its current state, answers, safety flags, and available summary information.

**JSONL event log**

An append-only event log records session events to support inspection of workflow history and future recovery improvements.

**Atomic snapshot writes**

The current persistence implementation uses temporary files and `os.replace` to reduce the risk of partially written JSON snapshots.

**Asynchronous file operations**

File operations are delegated through `asyncio.to_thread` to avoid unnecessarily blocking the asynchronous event loop.

**Validation**

Persistence operations validate session identifiers and explicitly handle filesystem errors.

The current tests cover snapshot saving and reloading, event appending and reading, missing records, invalid identifiers, and simulated filesystem failures.

Local JSON and JSONL files do not provide distributed transactions or automatically guarantee consistency between the two files. Recovery, file permissions, concurrent access, and production-grade security require additional validation.

Patient records are sensitive data. Local storage does not mean the complete voice interaction stays local because the configured STT, LLM, and TTS providers may process information through external services.

Development must use synthetic patient data.

## 9. Doctor Access and Patient-Controlled Sharing

The planned platform uses explicit, limited patient authorization rather than unrestricted access to patient records.

### Intended sharing workflow

1. The patient signs in and selects the information to share.
2. The application creates a temporary access code or equivalent secure authorization mechanism.
3. The doctor signs in through a verified professional account.
4. The doctor redeems the code and receives only the authorized information.
5. The application enforces the permission scope and expiry.
6. The patient can review or revoke future access.
7. Important access and sharing events are recorded in an audit trail.

Security requirements include cryptographically random tokens, expiry, rate limiting, backend authorization, private document storage, and audit logging.

The code must not expose patient identity or provide unrestricted, permanent access.

This functionality belongs to the broader platform roadmap and must not be described as operational until its backend and authorization controls have actually been implemented and tested.

## 10. System Architecture

AarogyaVaani is intended to use a modular architecture with clear boundaries between the frontend, backend, AI service, persistence layer, and clinical workflow.

### Planned architecture

**Frontend — React and Vite**

Provides the patient and doctor portals, consultation interfaces, document management, summaries, and permission controls.

**Backend — FastAPI**

Will provide authenticated application endpoints, session management, record access, document workflows, and authorization checks.

**AI service — LiveKit Agents and configured AI providers**

Handles real-time voice interaction, conversation management, patient intake, safety-rule evaluation, and summary generation.

**Data layer — Planned cloud database and private storage**

Will eventually support persistent patient profiles, consultations, health records, documents, sharing permissions, and audit events.

Supabase/PostgreSQL and private object storage are potential components of the planned cloud implementation. They are not part of the current local-persistence phase.

### Repository structure

The repository currently separates the frontend, backend, and AI service:

```text
Aarogya_vaani/
├── ai_service/
│   ├── agent.py
│   ├── rules/
│   │   └── danger_signs.py
│   ├── workflow/
│   │   ├── __init__.py
│   │   └── models.py
│   ├── persistence/
│   │   ├── __init__.py
│   │   └── local_store.py
│   ├── tests/
│   │   ├── __init__.py
│   │   └── test_persistence.py
│   ├── docs/
│   │   └── AI_SERVICE_SPECIFICATION.md
│   ├── pyproject.toml
│   └── uv.lock
├── server/
├── client/
└── PROJECT_DESCRIPTION.md
```

This is a conceptual snapshot of the repository structure. The actual directory contents may evolve as development progresses.

## 11. Current Development Scope

The project is being developed incrementally, beginning with the AI service.

### Completed according to the current development report

- Existing LiveKit voice-agent setup and provider configuration.
- Existing maternal-health danger-sign rules.
- Typed session models in `workflow/models.py`.
- Local JSON snapshot persistence.
- Append-only JSONL event persistence.
- Initial persistence unit tests.
- Eight reported passing persistence tests.

### Current focus

Implement and validate the intake workflow independently before connecting it to the live voice agent.

The immediate work includes:

- Enforcing state transitions.
- Handling consent and refusal.
- Recording individual patient answers.
- Integrating the existing deterministic safety rules.
- Generating factual summaries.
- Handling persistence failures without false success messages.
- Testing urgent-review behavior and invalid transitions.

### Planned next steps

1. Complete and test the intake state machine.
2. Integrate workflow operations into the existing LiveKit agent.
3. Validate terminal-based voice interaction.
4. Test supported languages, transcription quality, corrections, and interruption behavior.
5. Connect the AI service to the FastAPI backend.
6. Implement authenticated patient records and secure doctor sharing.
7. Add private document storage and audit capabilities.
8. Conduct security, clinical-safety, and usability validation before public deployment.

The frontend, backend, cloud persistence, and doctor-sharing features should be treated as separate development stages until their functionality is verified.

## 12. Privacy, Security, and Responsible Use

AarogyaVaani handles potentially sensitive health information, so privacy and security must influence the design from the beginning.

Core principles include:

- Private records by default.
- Explicit consent for the AI intake workflow.
- Separate authorization for sharing records with individual doctors.
- Verified doctor access.
- Backend-enforced access controls.
- Minimum necessary data exposure to external AI providers.
- Secure handling of API credentials and environment variables.
- Restricted file permissions and appropriate encryption.
- No patient information or API secrets in ordinary application logs.
- Clear separation between patient-reported information, AI-generated summaries, and clinician-authored decisions.
- Transparent communication of the AI assistant's limitations.

Before a real public launch in India, the implementation must be assessed against applicable data-protection and healthcare requirements.

## 13. Development Principles

All future development should follow these principles:

1. **Incremental implementation:** Complete and test one layer before connecting the next.
2. **Preserve working integrations:** Do not replace functioning LiveKit providers or alter dependency versions without a concrete reason.
3. **Reuse existing logic:** Extend existing models, persistence, and safety rules instead of creating duplicate implementations.
4. **Testable business logic:** Keep workflow and safety logic testable without a microphone or external API credentials.
5. **Explicit state management:** Application code controls consent, session state, safety flags, and submission.
6. **Grounded summaries:** Use only collected information and preserve unknowns.
7. **Fail safely:** Never claim successful persistence, sharing, or clinician notification unless the relevant operation actually succeeded.
8. **Privacy by design:** Use synthetic data during development and minimize sensitive data exposure.
9. **No premature infrastructure:** Do not introduce databases, microservices, or cloud integrations before the current phase requires them.
10. **Evidence-based completion:** Report actual commands, test results, limitations, and unverified behavior.

## 14. Project Goal

The long-term goal is to build a reliable, accessible, multilingual healthcare companion that helps patients organize their health information and communicate effectively with healthcare professionals.

The initial milestone is narrower: a working, testable AI intake service that obtains consent, records patient answers, applies existing deterministic safety rules, creates factual consultation summaries, and persists session data reliably.

The broader platform will be developed around that foundation, with patient privacy, clinical oversight, and secure sharing treated as essential requirements rather than optional additions.

**AarogyaVaani: Better health conversations, organized records, and patient-controlled collaboration with healthcare professionals.**
