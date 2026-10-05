import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  Save,
  UserRound,
  FileText,
} from "lucide-react";
import "./DoctorReview.css";

function getAnswerValue(answers, key) {
  return answers?.[key] || "";
}

export default function DoctorReview() {
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

  const dangerData = useMemo(() => {
    return JSON.parse(
      localStorage.getItem("aarogyaVaaniDangerCheck") || "{}"
    );
  }, []);

  const reports = useMemo(() => {
    return JSON.parse(
      localStorage.getItem("aarogyaVaaniReports") || "[]"
    );
  }, []);

  const answers = interviewData.answers || {};

  const patient = patientData.patient || {};

  const patientType =
    patientData.patientType || "maternal";

  const [summary, setSummary] = useState({
    mainComplaint: "",
    history: "",
    medicalConditions: "",
    medicines: "",
    allergies: "",
    additionalNotes: "",
  });

  const [approved, setApproved] = useState(false);

  useEffect(() => {
    const savedSummary = JSON.parse(
      localStorage.getItem("aarogyaVaaniDoctorSummary") || "null"
    );

    if (savedSummary) {
      setSummary(savedSummary);
      setApproved(Boolean(savedSummary.approved));
    } else {
      const mainComplaint =
        patientType === "maternal"
          ? "Antenatal / pregnancy intake"
          : getAnswerValue(answers, "mainProblem");

      const medicalConditions =
        getAnswerValue(answers, "medicalConditions") ||
        getAnswerValue(answers, "conditions");

      const medicines =
        getAnswerValue(answers, "medicines");

      const allergies =
        getAnswerValue(answers, "allergies");

      setSummary({
        mainComplaint,
        history:
          patientType === "maternal"
            ? `Pregnancy duration: ${
                getAnswerValue(answers, "pregnancyMonths") ||
                "Not recorded"
              } months.`
            : `Duration: ${
                getAnswerValue(answers, "duration") ||
                "Not recorded"
              }.`,
        medicalConditions,
        medicines,
        allergies,
        additionalNotes: "",
      });
    }
  }, [answers, patientType]);

  const handleChange = (field, value) => {
    setSummary((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleApprove = () => {
    const approvedSummary = {
      ...summary,
      approved: true,
      approvedAt: new Date().toISOString(),
      patientName: patient.name || "Patient",
      patientType,
      dangerSigns: dangerData.dangerSigns || [],
      reports,
    };

    localStorage.setItem(
      "aarogyaVaaniDoctorSummary",
      JSON.stringify(approvedSummary)
    );

    setSummary(approvedSummary);
    setApproved(true);
  };

  const handleBack = () => {
    window.location.href = "/summary";
  };

  return (
    <div className="doctor-review-page">
      <header className="doctor-review-header">
        <div className="doctor-brand">
          <h1>AarogyaVaani</h1>
          <span>Tripura Health</span>
        </div>

        <div className="doctor-role">
          <UserRound size={17} />
          Doctor Review
        </div>
      </header>

      <main className="doctor-review-main">
        <div className="doctor-breadcrumb">
          Summary <span>/</span> <strong>Doctor Review</strong>
        </div>

        <section className="doctor-title">
          <div>
            <p>FINAL CLINICAL REVIEW</p>
            <h2>Review & Approve Summary</h2>
            <span>
              The doctor can correct the generated history before
              approving it.
            </span>
          </div>

          {approved && (
            <div className="approved-badge">
              <CheckCircle2 size={18} />
              Approved
            </div>
          )}
        </section>

        <section className="patient-overview">
          <div className="patient-avatar">
            <UserRound size={28} />
          </div>

          <div>
            <small>Patient</small>
            <h3>{patient.name || "Patient"}</h3>

            <p>
              {patient.age ? `${patient.age} years` : "Age not recorded"}
              {patient.gender
                ? ` • ${patient.gender}`
                : ""}
              {patientType === "maternal"
                ? " • Maternal / Antenatal"
                : " • General Intake"}
            </p>
          </div>
        </section>

        {dangerData.urgent && (
          <section className="doctor-danger">
            <AlertTriangle size={23} />

            <div>
              <strong>Safety flag requires attention</strong>

              <p>
                {dangerData.dangerSigns?.length || 0} danger
                sign(s) were detected during the fixed-rule
                screening.
              </p>
            </div>
          </section>
        )}

        <section className="review-card">
          <div className="review-card-heading">
            <FileText size={20} />
            <div>
              <h3>Structured Patient History</h3>
              <p>Edit any field before approval.</p>
            </div>
          </div>

          <div className="review-grid">
            <div className="review-field review-full">
              <label>Main complaint / reason for visit</label>

              <textarea
                value={summary.mainComplaint}
                onChange={(event) =>
                  handleChange(
                    "mainComplaint",
                    event.target.value
                  )
                }
              />
            </div>

            <div className="review-field review-full">
              <label>History of present problem</label>

              <textarea
                value={summary.history}
                onChange={(event) =>
                  handleChange(
                    "history",
                    event.target.value
                  )
                }
              />
            </div>

            <div className="review-field">
              <label>Medical conditions</label>

              <textarea
                value={summary.medicalConditions}
                onChange={(event) =>
                  handleChange(
                    "medicalConditions",
                    event.target.value
                  )
                }
              />
            </div>

            <div className="review-field">
              <label>Medicines / supplements</label>

              <textarea
                value={summary.medicines}
                onChange={(event) =>
                  handleChange(
                    "medicines",
                    event.target.value
                  )
                }
              />
            </div>

            <div className="review-field">
              <label>Allergies</label>

              <textarea
                value={summary.allergies}
                onChange={(event) =>
                  handleChange(
                    "allergies",
                    event.target.value
                  )
                }
              />
            </div>

            <div className="review-field">
              <label>Doctor's additional notes</label>

              <textarea
                value={summary.additionalNotes}
                onChange={(event) =>
                  handleChange(
                    "additionalNotes",
                    event.target.value
                  )
                }
                placeholder="Add any correction or note..."
              />
            </div>
          </div>
        </section>

        <section className="doctor-evidence">
          <div>
            <h3>Safety findings</h3>

            {dangerData.dangerSigns?.length ? (
              <ul>
                {dangerData.dangerSigns.map((item) => (
                  <li key={item.id}>{item.title}</li>
                ))}
              </ul>
            ) : (
              <p>No configured danger signs detected.</p>
            )}
          </div>

          <div>
            <h3>Previous reports</h3>

            <p>
              {reports.length
                ? `${reports.length} report(s) attached for review.`
                : "No previous reports attached."}
            </p>
          </div>
        </section>

        <section className="doctor-safeguard">
          <ShieldCheck size={22} />

          <div>
            <strong>Doctor approval required</strong>

            <p>
              AarogyaVaani does not make a diagnosis. This summary
              must be checked and approved by a qualified doctor.
            </p>
          </div>
        </section>

        <div className="doctor-actions">
          <button
            className="doctor-back"
            onClick={handleBack}
          >
            <ArrowLeft size={18} />
            Back to Summary
          </button>

          <button
            className="doctor-approve"
            onClick={handleApprove}
          >
            {approved ? (
              <>
                <CheckCircle2 size={19} />
                Approved
              </>
            ) : (
              <>
                <Save size={19} />
                Approve Summary
              </>
            )}
          </button>
        </div>

        {approved && (
          <div className="approval-success">
            <CheckCircle2 size={22} />

            <div>
              <strong>Summary approved successfully</strong>
              <p>
                The reviewed summary has been saved on this device.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}