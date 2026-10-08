import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Mic,
  PauseCircle,
  UserRound,
} from "lucide-react";
import "./ActiveSessions.css";

function ActiveSessions() {
  const currentPatient = JSON.parse(
    localStorage.getItem("aarogyaVaaniCurrentPatient") || "null"
  );

  const hasSession = Boolean(currentPatient?.patient);

  return (
    <div className="sessions-page">
      <header className="sessions-header">
        <div>
          <h1>AarogyaVaani</h1>
          <span>Tripura Health</span>
        </div>

        <button
          onClick={() => {
            window.location.href = "/dashboard";
          }}
        >
          <ArrowLeft size={17} />
          Dashboard
        </button>
      </header>

      <main className="sessions-content">
        <div className="sessions-breadcrumb">
          Dashboard <span>›</span> Active Sessions
        </div>

        <section className="sessions-hero">
          <Activity size={25} />

          <div>
            <h2>Active Sessions</h2>
            <p>
              Patient interviews currently stored or active on this
              device.
            </p>
          </div>
        </section>

        {hasSession ? (
          <section className="session-card">
            <div className="session-status">
              <span className="live-dot" />
              ACTIVE
            </div>

            <div className="session-main">
              <div className="session-avatar">
                <UserRound size={24} />
              </div>

              <div>
                <span>Current Patient</span>
                <h3>{currentPatient.patient.name}</h3>
                <p>
                  {currentPatient.patientType === "maternal"
                    ? "Maternal & Antenatal"
                    : "General Patient"}
                </p>
              </div>
            </div>

            <div className="session-actions">
              <button
                className="resume-button"
                onClick={() => {
                  window.location.href = "/interview";
                }}
              >
                <Mic size={17} />
                Resume Intake
                <ArrowRight size={15} />
              </button>

              <button
                className="pause-button"
                onClick={() => {
                  alert(
                    "This session remains safely stored on the device."
                  );
                }}
              >
                <PauseCircle size={17} />
                Keep Session Saved
              </button>
            </div>
          </section>
        ) : (
          <div className="no-session">
            <Activity size={38} />
            <h3>No active session</h3>
            <p>Start a new patient intake to begin a session.</p>

            <button
              onClick={() => {
                window.location.href = "/new-patient";
              }}
            >
              Start New Intake
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default ActiveSessions;