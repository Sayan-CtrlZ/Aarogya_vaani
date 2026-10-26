# AarogyaVaani (आरोग्यवाणी / আরোগ্যবাণী)

> **Voice-First Vernacular Clinical Intake & Offline Healthcare Triage Portal for Primary Health Centres (PHCs) in Tripura**  
> *Built for Hack for Social Good 2026 • Powered by LiveKit, Sarvam AI, Google Gemini, Groq, and Supabase Cloud*

---

## 📖 Complete Technical Documentation

- 📘 **[Complete System Architecture & API Reference Manual](docs/SYSTEM_ARCHITECTURE_AND_API_REFERENCE.md)**  
  *Detailed guide covering all 18+ REST endpoints, WebRTC Voice Agent internals, Frontend wiring maps, and teammate quick-start instructions.*
- 🔑 **[Credentials, Environment Variables & Git Push Guide](docs/CREDENTIALS_AND_PUSH_GUIDE.md)**  
  *Full reference for all API keys, `.env.example` setup, security ignore rules, and step-by-step GitHub push instructions.*

---

## ⚡ Quick Start (Launch All 3 Services)

### On Windows (PowerShell or Command Prompt):
Run either script from the root directory:
```powershell
.\start_all.ps1
```
*(or double-click `start_all.bat`)*

### On Linux / macOS / Git Bash:
```bash
chmod +x start_all.sh
./start_all.sh
```

This single command boots up:
1. **FastAPI Backend Server** (`http://localhost:8001`) • Interactive API Docs at `http://localhost:8001/docs`
2. **LiveKit Voice Agent Worker** (`ai_service`) • Real-time Indic speech (Bengali, Hindi, English) with Sarvam AI & Groq
3. **React Vite Frontend** (`http://localhost:5173`) • Vernacular clinical intake, Medical Drive, and Doctor Dashboard

---

## 🏗️ Architecture Overview

```
                      ┌────────────────────────────────────────┐
                      │          React Vite Frontend           │
                      │         (http://localhost:5173)        │
                      └──────────────┬──────────────────┬──────┘
                                     │                  │
                         HTTP REST   │                  │ WebRTC Stream &
                         Requests    │                  │ Data Channel
                                     ▼                  ▼
┌────────────────────────────────────────┐          ┌────────────────────────────────────────┐
│             FastAPI Server             │          │       LiveKit AI Voice Agent           │
│        (http://localhost:8001)         │          │              (ai_service)              │
│                                        │          │                                        │
│ • Phone + PIN Auth (/api/auth)         │          │ • Silero Voice Activity Detection      │
│ • Medical Drive Vault (/api/documents) │          │ • Sarvam AI STT (Saarika v2.5)         │
│ • Gemini Flash Vision Analyzers        │◄─────────┤ • Groq Fast Clinical LLM               │
│ • LiveKit Token & Agent Dispatch       │   Sync   │ • Sarvam AI TTS (Bulbul v3)            │
│ • Doctor EMR Review & Approval         │  Turns   │ • Supabase Clinical Tools & EMR Sync   │
└───────────────────┬────────────────────┘          └───────────────────┬────────────────────┘
                    │                                                   │
                    └─────────────────────┬─────────────────────────────┘
                                          │
                                          ▼
                      ┌────────────────────────────────────────┐
                      │             Supabase Cloud             │
                      │  • PostgreSQL: patients, records,      │
                      │                consultations           │
                      │  • Storage: private 'medical-vault'    │
                      └────────────────────────────────────────┘
```

---

## 🧪 Running Automated Tests

- **Backend Clinical & Medical Routes:**
  ```bash
  cd server && PYTHONPATH=. .venv/bin/pytest -v
  ```
- **Voice Agent Intake & Language Locking:**
  ```bash
  cd ai_service && uv run pytest -v
  ```
- **Frontend Production Build:**
  ```bash
  cd client && npm run build
  ```
