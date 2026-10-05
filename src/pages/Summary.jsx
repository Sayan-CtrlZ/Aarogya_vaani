import { useEffect, useState } from "react";
import {
  ArrowRight,
  ClipboardList,
  AlertTriangle,
  UserRound,
  Languages,
  ShieldCheck,
  FileText,
} from "lucide-react";
import "./Summary.css";

function Summary() {
  const [patientData, setPatientData] = useState(null);
  const [interviewData, setInterviewData] = useState(null);
  const [dangerData, setDangerData] = useState(null);
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const patient = JSON.parse(
      localStorage.getItem("aarogyaVaaniCurrentPatient") || "null"
    );

    const interview = JSON.parse(
      localStorage.getItem("aarogyaVaaniInterview") || "null"
    );

    const danger = JSON.parse(
      localStorage.getItem("aarogyaVaaniDangerCheck") || "null"
    );

    const savedReports = JSON.parse(
      localStorage.getItem("aarogyaVaaniReports") || "[]"
    );

    setPatientData(patient);
    setInterviewData(interview);
    setDangerData(danger);
    setReports(Array.isArray(savedReports) ? savedReports : []);
  }, []);

  // --------------------------------------------------
  // SAFETY CHECK
  // --------------------------------------------------

  if (!patientData || !interviewData) {
    return (
      <div className="summary-page">
        <div className="summary-empty">
          <ClipboardList size={42} />

          <h2>Summary not available</h2>

          <p>
            Please complete the patient interview first.
          </p>

          <button
            onClick={() => {
              window.location.href = "/new-patient";
            }}
          >
            Start New Patient
          </button>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // DATA
  // --------------------------------------------------

  const answers = interviewData.answers || {};

  const patient = patientData.patient || {};

  const dangerSigns =
    dangerData?.dangerSigns ||
    interviewData.dangerSigns ||
    [];

  const urgent =
    dangerData?.urgent ||
    dangerSigns.length > 0;

  const languageName =
    interviewData.languageName || "English";

  const answerEntries = Object.entries(answers);

  // --------------------------------------------------
  // DOCTOR REVIEW HANDLER
  // --------------------------------------------------

  const handleDoctorReview = () => {
    const summary = {
      patient,
      patientType: patientData.patientType || "general",

      language:
        interviewData.language || "english",

      languageName,

      answers,

      bodyPain: interviewData.bodyPain || {
        hasPain: false,
        locations: [],
        otherLocation: "",
      },

      visitHistory:
        interviewData.visitHistory || "",

      dangerSigns,

      urgent,

      reports,

      generatedAt: new Date().toISOString(),

      doctorStatus: "pending-review",
    };

    // Save complete structured summary
    localStorage.setItem(
      "aarogyaVaaniSummary",
      JSON.stringify(summary)
    );

    // Move to Doctor Review
    window.location.href = "/doctor-review";
  };

  return (
    <div className="summary-page">

      {/* ==================================================
          HEADER
      ================================================== */}

      <header className="summary-header">
        <div>
          <h1>AarogyaVaani</h1>
          <span>Tripura Health</span>
        </div>

        <div className="summary-header-label">
          <ClipboardList size={18} />
          Patient Summary
        </div>
      </header>

      {/* ==================================================
          MAIN CONTENT
      ================================================== */}

      <main className="summary-content">

        {/* Breadcrumb */}

        <div className="summary-breadcrumb">
          Interview <span>›</span> Danger Check{" "}
          <span>›</span> Summary
        </div>

        {/* ==================================================
            TITLE
        ================================================== */}

        <div className="summary-title-row">

          <div>
            <p className="eyebrow">
              STRUCTURED HISTORY
            </p>

            <h2>
              Patient Summary
            </h2>

            <p>
              Review of the information collected during
              the patient interview.
            </p>
          </div>

          <div className="summary-language">
            <Languages size={18} />
            {languageName}
          </div>

        </div>

        {/* ==================================================
            PATIENT INFORMATION
        ================================================== */}

        <section className="summary-patient-card">

          <div className="summary-patient-icon">
            <UserRound size={25} />
          </div>

          <div>
            <span>Patient</span>

            <strong>
              {patient.name || "Unnamed Patient"}
            </strong>
          </div>

          <div>
            <span>Age</span>

            <strong>
              {patient.age || "—"}
            </strong>
          </div>

          <div>
            <span>Intake type</span>

            <strong>
              {patientData.patientType === "maternal"
                ? "Maternal & Antenatal"
                : "General Patient"}
            </strong>
          </div>

        </section>

        {/* ==================================================
            SAFETY STATUS
        ================================================== */}

        <section
          className={`summary-alert ${
            urgent ? "urgent" : "normal"
          }`}
        >

          {urgent ? (
            <AlertTriangle size={22} />
          ) : (
            <ShieldCheck size={22} />
          )}

          <div>

            <strong>
              {urgent
                ? "Urgent safety flag present"
                : "No danger sign flagged"}
            </strong>

            <p>
              {urgent
                ? "The following predefined danger signs require health-worker or doctor review."
                : "The interview safety rules did not flag a danger sign."}
            </p>

          </div>

        </section>

        {/* ==================================================
            DANGER SIGNS
        ================================================== */}

        {urgent && (
          <section className="summary-card">

            <div className="summary-section-title">
              <AlertTriangle size={20} />

              <h3>
                Danger Signs
              </h3>
            </div>

            <div className="danger-summary-list">

              {dangerSigns.map((sign, index) => (
                <div
                  className="danger-summary-item"
                  key={`${sign}-${index}`}
                >
                  <AlertTriangle size={17} />

                  {sign}
                </div>
              ))}

            </div>

          </section>
        )}

        {/* ==================================================
            INTERVIEW RESPONSES
        ================================================== */}

        <section className="summary-card">

          <div className="summary-section-title">
            <ClipboardList size={20} />

            <h3>
              Interview Responses
            </h3>
          </div>

          {answerEntries.length === 0 ? (

            <p className="empty-response">
              No interview responses were saved.
            </p>

          ) : (

            <div className="response-list">

              {answerEntries.map(
                ([questionNumber, answer]) => (

                  <div
                    className="response-row"
                    key={questionNumber}
                  >

                    <div className="response-number">
                      {questionNumber}
                    </div>

                    <div className="response-answer">

                      <span>
                        Question {questionNumber}
                      </span>

                      <strong>
                        {String(answer)}
                      </strong>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </section>

        {/* ==================================================
            PREVIOUS REPORTS
        ================================================== */}

        {reports.length > 0 && (
          <section className="summary-card">

            <div className="summary-section-title">

              <FileText size={20} />

              <h3>
                Previous Reports
              </h3>

            </div>

            <div className="response-list">

              {reports.map((report, index) => (

                <div
                  className="response-row"
                  key={report.id || index}
                >

                  <div className="response-number">
                    <FileText size={17} />
                  </div>

                  <div className="response-answer">

                    <span>
                      {report.reportName ||
                        "Medical Report"}
                    </span>

                    <strong>
                      {report.fileName ||
                        "Uploaded report"}
                    </strong>

                  </div>

                </div>

              ))}

            </div>

          </section>
        )}

        {/* ==================================================
            CLINICAL SAFETY NOTE
        ================================================== */}

        <section className="summary-safety-note">

          <ShieldCheck size={21} />

          <div>

            <strong>
              Clinical safety
            </strong>

            <p>
              This summary records information provided
              during the interview. AarogyaVaani does not
              make a diagnosis. The doctor must review,
              edit and approve the summary.
            </p>

          </div>

        </section>

        {/* ==================================================
            ACTION BUTTONS
        ================================================== */}

        <div className="summary-actions">

          <button
            className="summary-back"
            onClick={() => {
              window.location.href =
                "/danger-check";
            }}
          >
            Back
          </button>

          <button
            className="summary-next"
            onClick={handleDoctorReview}
          >
            Send to Doctor Review

            <ArrowRight size={19} />
          </button>

        </div>

      </main>
    </div>
  );
}

export default Summary;