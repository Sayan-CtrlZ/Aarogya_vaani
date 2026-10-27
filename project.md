# Patient Case-Taking Software for Tripura

## Background

### 1.1 The Clinical History-Taking Bottleneck in Indian Hospitals

History taking — the structured elicitation of a patient's presenting complaints, history of present illness, past medical and surgical history, drug and allergy history, family and personal history, and a review of systems — is one of the most important diagnostic activities in clinical medicine.

Classical teaching holds that a well-conducted history can contribute substantially to reaching the correct diagnosis, even before examination or investigation. Yet in India's overburdened public hospital outpatient departments (OPDs), the time available for this critical interaction has become extremely limited.

India operates one of the most patient-dense healthcare systems in the world. Tertiary government hospitals and apex institutions routinely register thousands of OPD patients per day, with doctor-patient consultation times often limited to only a few minutes. Within this short window, the physician must simultaneously elicit history, examine the patient, review prior records, formulate a diagnosis, counsel the patient, and prescribe treatment.

The result can be incomplete history-taking, missed comorbidities, repeated questioning across visits, and increased risk of diagnostic errors.

AYUSH institutions face an additional layer of complexity. Ayurvedic history taking, including Trividha, Ashtavidha, and Dashavidha Pariksha, requires detailed assessment of Prakriti, Vikriti, Agni, Koshtha, Ahara-Vihara, Nidana, Samprapti, and other parameters. Capturing this depth manually within OPD time constraints can be difficult, forcing practitioners to abbreviate the assessment required for personalized Ayurvedic care.

### 1.2 The Documentation and Records Fragmentation Problem

Compounding the time problem is the fragmentation of patient records.

Patients in India typically carry physical paper prescriptions, laboratory reports, discharge summaries, and imaging records from multiple healthcare providers. During consultation, the physician must manually review these unstructured documents, which may be handwritten, written in different languages, and arranged without chronological order.

This consumes a significant portion of the already limited consultation time.

There is a need for a point-of-entry mechanism that can digitize, structure, and chronologically organize a patient's previous medical documents before the patient reaches the consultation room.

The Ayushman Bharat Digital Mission (ABDM) has established national digital health infrastructure, including ABHA IDs, Health Information Exchange, and FHIR-based interoperability standards. However, the first-mile problem remains: there is a need for an efficient, patient-facing software platform that captures structured medical history and digitizes documents into the ABDM ecosystem before the clinical encounter begins.

### 1.3 The Opportunity: AI-Powered Digital Clinical Intake Platform

Self-service kiosks have transformed high-throughput service industries such as banking, aviation, and retail by allowing users to complete structured data-entry tasks themselves.

In healthcare, patient check-in kiosks are increasingly used, but these systems are generally limited to administrative activities such as registration and appointment management.

A more advanced platform can use AI to perform multimodal clinical history acquisition and medical document digitization.

The convergence of technologies such as:

- Automatic Speech Recognition (ASR) for Indian languages and accents
- Large Language Models (LLMs)
- Medical document OCR
- Natural Language Processing (NLP)
- ABDM and FHIR interoperability

makes it possible to develop an AI-powered clinical history and patient-intake platform.

---

# Description

## 2.1 The Problem in Precise Terms

There is a need for a purpose-built, patient-facing software platform that enables patients to independently and comprehensively record their medical history through natural spoken conversation and guided touchscreen interaction.

The platform should also allow patients to digitize their existing physical medical documents and generate a structured, physician-ready clinical history summary.

The system should be capable of integrating with the hospital information system and the ABDM ecosystem before the patient enters the consultation room.

## 2.2 Why Existing Solutions Fall Short

### Existing hospital registration systems

Hospital registration systems generally capture demographic and appointment information such as:

- Name
- Age
- Department
- Token number
- Appointment details

They generally do not collect comprehensive clinical history or process previous medical documents.

### Mobile health applications

Mobile health apps and tele-triage chatbots may require:

- Smartphone literacy
- Stable internet connectivity
- Prior patient enrolment

This can exclude elderly, rural, low-literacy, and first-time patients who may form a significant portion of public hospital OPD populations.

### Manual history and triage desks

Manual nurse-led triage or history desks are limited by available human resources. They may not scale effectively for high-volume hospitals and can reproduce the same time and transcription bottlenecks the proposed system is intended to reduce.

### Generic document scanners

Traditional document scanners can digitize images, but they generally do not:

- Extract clinical information
- Structure medical data
- Organize records chronologically
- Connect extracted information with patient history
- Link the information to an ABHA record

## 2.3 Specific Challenges a Solution Must Overcome

### Multilingual voice capture

The system should support multilingual and multi-accent voice interaction in noisy hospital environments, including Hindi, English, Bengali, and other relevant regional languages.

### Accessibility

The platform should be usable by:

- Elderly patients
- Low-literacy users
- First-time digital users
- Patients unfamiliar with technology

The interface should use intuitive icons, audio prompts, voice interaction, and simple conversational guidance.

### Clinical history structuring

The system should convert free-form patient narration into a standardized, physician-readable history containing:

- Chief complaint
- History of Present Illness (HPI)
- Past medical history
- Past surgical history
- Drug history
- Allergy history
- Family history
- Personal history
- Review of Systems (ROS)
- Previous investigations

For AYUSH settings, the system should also support relevant Dashavidha Pariksha parameters.

### Medical document digitization

The system should support OCR for handwritten and printed:

- Prescriptions
- Laboratory reports
- Discharge summaries
- Other relevant medical documents

The extracted information should include:

- Diagnoses
- Medications
- Dosages
- Investigation results
- Relevant medical history

### Privacy and security

The system should follow appropriate privacy, consent, and data-security practices for sensitive health information and support the ABDM consent framework.

---

# Expected Solution

## 3.1 Solution Overview — MediKiosk

The proposed solution, tentatively named **MediKiosk**, is an AI-powered clinical history and patient-intake platform.

MediKiosk allows patients to:

1. Record their medical history through natural voice conversation.
2. Answer questions through a guided touchscreen interface.
3. Scan and digitize previous medical documents.
4. Automatically organize medical information.
5. Generate a structured, physician-ready clinical summary.
6. Provide the summary to the hospital information system.
7. Support integration with the patient's ABHA record.

The entire process is designed to be completed before the patient begins the consultation, with minimal staff assistance.

---

# 3.2 Software and AI Stack

### Frontend

- React / React Native
- Responsive and accessible UI
- Voice and touch interaction
- Offline-first functionality

### Backend

- FastAPI
- PostgreSQL
- Secure REST APIs

### AI Layer

- Automatic Speech Recognition
- Natural Language Processing
- Large Language Model
- Medical information extraction
- Clinical summarization
- Red-flag detection

### Document Intelligence

- OCR
- Handwriting recognition
- Medical entity extraction
- Document classification
- Medical timeline generation

### Healthcare Integration

- ABHA / ABDM integration
- FHIR-based interoperability
- Hospital Information System integration

### GIS and Service Discovery

- Healthcare facility mapping
- Nearby hospital/service discovery
- Location-based referral support

---

# Module A — Conversational Multimodal History Engine

A conversational AI engine conducts a structured clinical history interview through voice and touch.

The patient can speak naturally in their preferred language. The system asks intelligent follow-up questions based on the patient's responses.

For example, if a patient reports chest pain, the system can ask about:

- Onset
- Character
- Location
- Radiation
- Duration
- Aggravating factors
- Relieving factors

The system can use a structured clinical history framework such as the SOCRATES approach.

### Key Features

**Adaptive Questioning**

The system dynamically changes its questions based on the patient's chief complaint and previous answers.

**Dual-Mode Input**

Every question can be answered either by:

- Speaking
- Touching/selecting an option

**AYUSH History Mode**

For Ayurvedic OPDs, the system can support an extended history covering Dashavidha Pariksha and Ahara-Vihara assessment.

**Red-Flag Detection**

The system can identify potentially urgent symptoms and notify triage staff for priority assessment.

The system does not independently diagnose the patient.

---

# Module B — Medical Document Digitization and Intelligence

Patients can scan or upload previous:

- Prescriptions
- Laboratory reports
- Discharge summaries
- Medical documents

The system uses OCR and document intelligence to extract relevant clinical information.

### Intelligent Extraction

The system extracts:

- Diagnoses
- Prescribed medications
- Dosages
- Investigation results
- Reference ranges
- Procedures
- Surgery history

### Chronological Organization

The system automatically dates and organizes documents into a coherent medical timeline.

### Abnormal-Value Highlighting

The system can highlight potentially abnormal laboratory values and identify information requiring physician attention.

---

# Module C — Structured History Summary Generator

An AI summarization engine combines:

- Conversational patient history
- Previous medical documents
- Extracted clinical information

and creates a concise, physician-ready clinical summary.

### Standard Clinical Format

The summary can include:

- Chief Complaint
- History of Present Illness
- Past Medical History
- Past Surgical History
- Drug History
- Allergy History
- Family History
- Personal History
- Review of Systems
- Previous Investigations

### Editable and Verifiable

The physician remains in complete control.

The AI-generated summary is a **draft** that the physician can:

- Review
- Edit
- Confirm
- Reject

It is not an autonomous diagnosis.

### Bilingual Output

Patient-facing information can be provided in the patient's preferred local language.

The physician-facing summary can be generated in English or Hindi.

---

# Module D — Consent, Privacy and ABDM Integration

The platform includes a dedicated consent and security layer.

### Key Features

- Patient consent
- Secure authentication
- Role-based access
- Secure data processing
- Consent management
- Audit logging
- ABDM integration
- FHIR-based interoperability

### Consent-First Design

Patients should be clearly informed about:

- What information is being collected
- Why it is being collected
- Where it will be used
- Who can access it

For low-literacy users, consent information can be provided through audio guidance.

---

# Module E — Offline-First Mode

MediKiosk should continue working even when internet connectivity is unavailable.

This is particularly important for rural and underserved areas.

### Offline Workflow

```text
Patient
   ↓
MediKiosk
   ↓
No Internet
   ↓
Secure Local Storage
   ↓
Patient History + Documents
   ↓
Sync Queue
   ↓
Internet Restored
   ↓
Automatic Synchronization
   ↓
Hospital Server
```

### Offline Capabilities

The system should allow patients to:

- Register
- Select language
- Provide basic information
- Record symptoms
- Answer history questions
- Capture medical documents
- Provide consent
- Save the session securely

When internet connectivity returns, the system automatically synchronizes the stored information with the backend.

### Offline Status

The interface should clearly display:

**Offline Mode — Data will synchronize when connectivity is restored.**

After successful synchronization:

**Synced Successfully**

Sensitive information should be encrypted while stored locally and during transmission.

---

# Module F — Tripura Healthcare GIS

The platform can include a healthcare facility map for Tripura.

The system can display relevant healthcare facilities based on location and service requirements.

Possible information includes:

- Healthcare facility location
- Facility type
- Available services
- Distance
- Referral information
- Emergency service information

This can help patients and healthcare workers identify appropriate nearby healthcare services.

---

# Module G — Accessibility Mode

MediKiosk should provide dedicated accessibility features.

### Elderly Mode

- Large buttons
- Large text
- Audio instructions
- Simple navigation

### Low-Literacy Mode

- Voice-first interaction
- Icons
- Minimal typing
- Audio guidance

### Visual Accessibility

- Screen-reader support
- Voice navigation
- High-contrast interface

### Hearing Accessibility

- Text-based interaction
- Visual instructions

---

# Module H — Maternal Healthcare Mode

The platform can include a dedicated maternal-care workflow.

It can collect structured information such as:

- Pregnancy-related history
- Current symptoms
- Previous pregnancy history
- Relevant medical history
- Current medications
- Previous investigation reports

The system can organize this information into a structured summary for healthcare professionals.

---

# Module I — Elderly Care Mode

For elderly patients, the platform can simplify:

- Medical history collection
- Medication information
- Previous reports
- Appointment/service information
- Healthcare navigation

The system can convert existing prescriptions into a simple, easy-to-understand medication schedule for review by the patient or caregiver.

---

# Module J — Doctor Dashboard

Doctors receive a simple dashboard showing patients who have completed the MediKiosk process.

Example:

```text
Today's Patients

Patient       Status        Action
-----------------------------------------
P001          Ready         View Summary
P002          Priority      Review
P003          Ready         View Summary
P004          Ready         View Summary
```

The doctor can open a patient and view:

- AI-generated summary
- Medical timeline
- Previous documents
- Current symptoms
- Red-flag alerts
- Extracted investigation results

The physician can then edit and confirm the information.

---

# Module K — Hospital Administration Dashboard

Hospital administrators can view aggregated service-level information such as:

- Number of patients processed
- Number of completed AI intakes
- Average intake time
- Number of priority cases
- Number of digitized documents
- Common service requirements
- Department-level workload

This can help hospitals identify operational bottlenecks and improve service delivery.

---

# End-to-End Patient Journey

### Step 1 — Identify

The patient:

- Logs into MediKiosk
- Scans/provides ABHA information or registers as a new patient
- Selects their preferred language
- Provides consent

### Step 2 — Converse

The AI conducts an adaptive voice and touch-based history interview.

The system records:

- Chief complaint
- History of Present Illness
- Medical history
- Medication history
- Allergy information
- Other relevant clinical information

Potential red flags are highlighted for triage staff.

### Step 3 — Scan

The patient scans previous:

- Prescriptions
- Laboratory reports
- Discharge summaries

The system digitizes and structures the information.

### Step 4 — Summarize and Route

The AI generates a structured clinical summary.

The information can then be synchronized with the hospital system and, where supported, connected with the patient's ABDM record.

### Step 5 — Consult

The physician reviews the generated summary, edits or confirms it, and then proceeds with:

- Clinical examination
- Medical reasoning
- Diagnosis
- Treatment
- Counselling

---

# Core Value Proposition

### For Patients

- Less repetitive questioning
- Easier healthcare access
- Regional-language interaction
- Voice-based assistance
- Better accessibility
- Reduced paperwork

### For Doctors

- Faster access to patient history
- Organized previous medical records
- Structured clinical summary
- Reduced documentation burden
- Better visibility of relevant information

### For Hospitals

- Faster patient intake
- Better OPD workflow
- Digital records
- Improved service delivery
- Operational insights

### For Tripura's Underserved Communities

- Multilingual access
- Offline-first operation
- Elderly-friendly interface
- Low-literacy support
- Better access to healthcare services
- Reduced dependence on continuous internet connectivity

---

# Core Workflow

```text
Patient
   ↓
Language Selection
   ↓
Consent
   ↓
Voice / Touch History
   ↓
Medical Document Scanning
   ↓
AI + OCR + NLP
   ↓
Clinical Timeline
   ↓
Red-Flag Screening
   ↓
Structured Clinical Summary
   ↓
Doctor Review
   ↓
Consultation
   ↓
Secure Digital Record
```

# Final Concept

> **MediKiosk is a multilingual, AI-powered, offline-first clinical intake and healthcare access platform designed for Tripura's public and underserved healthcare settings. It reduces the burden of manual history-taking and fragmented medical records by allowing patients to communicate their medical history through voice or touch, digitize previous medical documents, receive appropriate service guidance, and provide doctors with a structured, verifiable clinical summary before consultation.**
