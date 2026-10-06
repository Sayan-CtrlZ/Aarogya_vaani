import { useMemo } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Activity,
  HeartPulse,
} from "lucide-react";
import "./DangerCheck.css";

export default function DangerCheck() {
  const patientData = useMemo(() => {
    return JSON.parse(
      localStorage.getItem("aarogyaVaaniCurrentPatient") || "{}"
    );
  }, []);

  const interviewData = useMemo(() => {
    return JSON.parse(
      localStorage.getItem("aarogyaVaaniInterview") || "{}"
    );
  }, []);

  const patientType = patientData.patientType || "maternal";

  const answers = interviewData.answers || {};

  const dangerSigns = [];

  if (patientType === "maternal") {
    if (answers.bleeding === "Yes") {
      dangerSigns.push({
        id: "bleeding",
        title: "Vaginal bleeding reported",
        description:
          "The patient reported bleeding during pregnancy.",
      });
    }

    if (answers.abdominalPain === "Yes") {
      dangerSigns.push({
        id: "abdominalPain",
        title: "Severe abdominal pain reported",
        description:
          "The patient reported severe abdominal pain.",
      });
    }

    if (answers.headacheVision === "Yes") {
      dangerSigns.push({
        id: "headacheVision",
        title: "Severe headache or blurred vision",
        description:
          "The patient reported severe headache or changes in vision.",
      });
    }

    if (answers.fever === "Yes") {
      dangerSigns.push({
        id: "fever",
        title: "Fever or feeling very unwell",
        description:
          "The patient reported fever or feeling seriously unwell.",
      });
    }

    if (answers.babyMovement === "No") {
      dangerSigns.push({
        id: "babyMovement",
        title: "Reduced or absent baby movement",
        description:
          "The patient reported that the baby's movement is less than usual.",
      });
    }
  }

  if (patientType === "general") {
    if (answers.breathing === "Yes") {
      dangerSigns.push({
        id: "breathing",
        title: "Difficulty breathing reported",
        description:
          "The patient reported difficulty breathing.",
      });
    }

    if (answers.fainting === "Yes") {
      dangerSigns.push({
        id: "fainting",
        title: "Fainting or severe dizziness reported",
        description:
          "The patient reported fainting or severe dizziness.",
      });
    }
  }

  const isUrgent = dangerSigns.length > 0;

  const saveDangerResult = () => {
    localStorage.setItem(
      "aarogyaVaaniDangerCheck",
      JSON.stringify({
        checkedAt: new Date().toISOString(),
        urgent: isUrgent,
        dangerSigns,
      })
    );

    window.location.href = "/summary";
  };

  const patientName =
    patientData.patient?.name || "Patient";

  return (
    <div className="danger-page">
      <header className="danger-header">
        <div className="danger-brand">
          <h1>AarogyaVaani</h1>
          <span>Tripura Health</span>
        </div>

        <div className="danger-header-label">
          <ShieldAlert size={18} />
          Safety Check
        </div>
      </header>

      <main className="danger-main">
        <div className="danger-progress">
          <span>Safety Check</span>
          <div className="progress-track">
            <div className="progress-fill"></div>
          </div>
          <span>05 / 06</span>
        </div>

        <section
          className={`danger-result ${
            isUrgent ? "urgent" : "safe"
          }`}
        >
          <div className="danger-main-icon">
            {isUrgent ? (
              <AlertTriangle size={45} />
            ) : (
              <CheckCircle2 size={45} />
            )}
          </div>

          <div className="danger-result-text">
            <p className="danger-eyebrow">
              AUTOMATED SAFETY CHECK
            </p>

            <h2>
              {isUrgent
                ? "Urgent signs detected"
                : "No danger signs detected"}
            </h2>

            <p>
              {isUrgent
                ? `AarogyaVaani identified ${dangerSigns.length} reported danger sign${
                    dangerSigns.length > 1 ? "s" : ""
                  } for ${patientName}. A health professional should review this immediately.`
                : `No configured danger signs were reported by ${patientName} during this intake.`}
            </p>
          </div>
        </section>

        {isUrgent ? (
          <section className="danger-alert">
            <div className="alert-heading">
              <AlertTriangle size={23} />
              <div>
                <strong>Health worker attention required</strong>
                <p>
                  This is a rule-based safety flag, not a diagnosis.
                </p>
              </div>
            </div>

            <div className="danger-list">
              {dangerSigns.map((sign) => (
                <div className="danger-item" key={sign.id}>
                  <div className="danger-item-icon">
                    <Activity size={20} />
                  </div>

                  <div>
                    <strong>{sign.title}</strong>
                    <p>{sign.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <section className="no-danger-card">
            <HeartPulse size={38} />

            <div>
              <h3>Screening completed</h3>

              <p>
                No configured red-flag response was found in the
                current intake. The complete history still needs
                review by the doctor.
              </p>
            </div>
          </section>
        )}

        <section className="danger-disclaimer">
          <ShieldAlert size={20} />

          <div>
            <strong>Important</strong>

            <p>
              AarogyaVaani does not diagnose medical conditions.
              This screen only checks predefined safety rules from
              the patient's answers. A doctor or qualified health
              professional must make clinical decisions.
            </p>
          </div>
        </section>

        <div className="danger-action">
          <button
            onClick={saveDangerResult}
            className="danger-continue"
          >
            Continue to Patient Summary
            <ArrowRight size={20} />
          </button>
        </div>
      </main>
    </div>
  );
}