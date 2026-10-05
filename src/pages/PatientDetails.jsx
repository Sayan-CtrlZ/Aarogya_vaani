import { useMemo } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  Languages,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import "./PatientDetails.css";

const patients = {
  "patient-1": {
    name: "Mamta Debbarma",
    age: "27",
    gender: "Female",
    type: "Maternal & Antenatal",
    language: "Bengali",
    status: "Completed",
    details: "Routine antenatal check",
    answers: {
      "Age": "27",
      "Pregnancy": "18 weeks",
      "First pregnancy": "Yes",
      "Previous complications": "No",
      "Vaginal bleeding": "No",
      "Severe abdominal pain": "No",
      "Severe headache / blurred vision": "No",
      "Fever / feeling unwell": "No",
      "Swelling": "No",
      "Baby movement": "Normal",
    },
  },

  "patient-2": {
    name: "Rani Tripura",
    age: "24",
    gender: "Female",
    type: "Maternal & Antenatal",
    language: "Hindi",
    status: "In Progress",
    details: "20 weeks pregnancy",
    answers: {
      "Age": "24",
      "Pregnancy": "20 weeks",
      "First pregnancy": "Yes",
      "Previous complications": "No",
      "Current concern": "Routine check",
    },
  },

  "patient-3": {
    name: "Sukanta Das",
    age: "42",
    gender: "Male",
    type: "General Patient",
    language: "Bengali",
    status: "Awaiting Review",
    details: "Fever reported",
    answers: {
      "Age": "42",
      "Main problem": "Fever",
      "Duration": "2 days",
      "Fever": "Yes",
      "Breathing difficulty": "No",
      "Vomiting": "No",
    },
  },

  "patient-4": {
    name: "Bimala Reang",
    age: "31",
    gender: "Female",
    type: "Maternal & Antenatal",
    language: "Bengali",
    status: "Urgent",
    details: "Severe headache detected",
    dangerSigns: ["Severe headache / blurred vision"],
    answers: {
      "Age": "31",
      "Pregnancy": "28 weeks",
      "First pregnancy": "No",
      "Vaginal bleeding": "No",
      "Severe abdominal pain": "No",
      "Severe headache / blurred vision": "Yes",
      "Fever": "No",
      "Baby movement": "Normal",
    },
  },
};

function PatientDetails() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  const currentPatient = useMemo(() => {
    if (id === "current-patient") {
      try {
        const patientData = JSON.parse(
          localStorage.getItem("aarogyaVaaniCurrentPatient") ||
            "null"
        );

        const interviewData = JSON.parse(
          localStorage.getItem("aarogyaVaaniInterview") ||
            "null"
        );

        const consentData = JSON.parse(
          localStorage.getItem("aarogyaVaaniConsent") ||
            "null"
        );

        if (!patientData?.patient) {
          return null;
        }

        return {
          name: patientData.patient.name || "Current Patient",
          age: patientData.patient.age || "—",
          gender: patientData.patient.gender || "—",
          type:
            patientData.patientType === "maternal"
              ? "Maternal & Antenatal"
              : "General Patient",
          language: consentData?.languageName || "English",
          status: "Current Session",
          details: "Current AarogyaVaani intake session",
          answers: interviewData?.answers || {},
          dangerSigns: interviewData?.dangerSigns || [],
        };
      } catch {
        return null;
      }
    }

    return patients[id] || null;
  }, [id]);

  if (!currentPatient) {
    return (
      <div className="patient-details-page">
        <div className="details-empty">
          <UserRound size={40} />
          <h2>Patient not found</h2>
          <p>The requested patient record could not be opened.</p>

          <button
            onClick={() => {
              window.location.href = "/patients";
            }}
          >
            Back to Patients
          </button>
        </div>
      </div>
    );
  }

  const dangerSigns = currentPatient.dangerSigns || [];
  const urgent = dangerSigns.length > 0;

  return (
    <div className="patient-details-page">
      <header className="details-header">
        <div>
          <h1>AarogyaVaani</h1>
          <span>Tripura Health</span>
        </div>

        <button
          onClick={() => {
            window.location.href = "/patients";
          }}
        >
          <ArrowLeft size={17} />
          Patients
        </button>
      </header>

      <main className="details-content">
        <div className="details-breadcrumb">
          Patients <span>›</span> Patient Details
        </div>

        <section className="patient-profile-card">
          <div className="large-patient-avatar">
            <UserRound size={30} />
          </div>

          <div className="patient-profile-main">
            <span className="profile-label">PATIENT RECORD</span>
            <h2>{currentPatient.name}</h2>

            <p>
              {currentPatient.age} years • {currentPatient.gender}
            </p>
          </div>

          <div className="patient-profile-meta">
            <div>
              <span>Intake type</span>
              <strong>{currentPatient.type}</strong>
            </div>

            <div>
              <span>Language</span>
              <strong>{currentPatient.language}</strong>
            </div>
          </div>
        </section>

        <section
          className={`details-safety-card ${
            urgent ? "urgent" : "safe"
          }`}
        >
          {urgent ? (
            <AlertTriangle size={24} />
          ) : (
            <CheckCircle2 size={24} />
          )}

          <div>
            <strong>
              {urgent
                ? "Urgent safety flag"
                : "No danger sign flagged"}
            </strong>

            <p>
              {urgent
                ? "A predefined safety rule requires health-worker or doctor attention."
                : "No predefined danger sign was identified in the available record."}
            </p>
          </div>
        </section>

        {urgent && (
          <section className="details-card danger-details">
            <div className="details-card-title">
              <AlertTriangle size={18} />
              <h3>Danger Signs</h3>
            </div>

            {dangerSigns.map((sign) => (
              <div className="danger-detail-row" key={sign}>
                <AlertTriangle size={15} />
                {sign}
              </div>
            ))}
          </section>
        )}

        <section className="details-card">
          <div className="details-card-title">
            <ClipboardList size={18} />
            <h3>Structured Interview</h3>
          </div>

          <div className="answer-grid">
            {Object.entries(currentPatient.answers || {}).map(
              ([question, answer]) => (
                <div className="answer-item" key={question}>
                  <span>{question}</span>
                  <strong>{String(answer)}</strong>
                </div>
              )
            )}
          </div>
        </section>

        <section className="details-info-grid">
          <div className="details-info-card">
            <Languages size={20} />
            <div>
              <span>Interview language</span>
              <strong>{currentPatient.language}</strong>
            </div>
          </div>

          <div className="details-info-card">
            <ShieldCheck size={20} />
            <div>
              <span>Safety model</span>
              <strong>Fixed rule-based check</strong>
            </div>
          </div>
        </section>

        <section className="details-disclaimer">
          <ShieldCheck size={18} />

          <p>
            This record contains information provided during
            patient intake. AarogyaVaani does not make a diagnosis.
            A doctor must review, edit and approve the clinical
            summary.
          </p>
        </section>
      </main>
    </div>
  );
}

export default PatientDetails;