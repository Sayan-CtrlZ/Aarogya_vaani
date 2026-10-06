import {
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import "./SignupStatus.css";

function SignupStatus() {
  const role =
    sessionStorage.getItem("aarogyaVaaniRole") || "health-worker";

  const userName =
    sessionStorage.getItem("aarogyaVaaniUserName") ||
    (role === "doctor" ? "Dr. Aarogya" : "Health Worker");

  return (
    <div className="signup-status-page">
      <header className="signup-status-header">
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

      <main className="signup-status-content">
        <div className="signup-breadcrumb">
          Dashboard <span>›</span> Signup Status
        </div>

        <section className="signup-status-card">
          <div className="signup-status-icon">
            <CheckCircle2 size={28} />
          </div>

          <div>
            <span>ACCOUNT STATUS</span>
            <h2>Profile setup complete</h2>
            <p>
              This device has an active AarogyaVaani workspace.
            </p>
          </div>
        </section>

        <section className="signup-details-card">
          <div className="signup-user">
            <div className="signup-avatar">
              <UserRound size={22} />
            </div>

            <div>
              <span>Registered user</span>
              <strong>{userName}</strong>
            </div>
          </div>

          <div className="signup-status-row">
            <ShieldCheck size={18} />

            <div>
              <span>Workspace</span>
              <strong>
                {role === "doctor"
                  ? "Doctor Workspace"
                  : "Health Worker Workspace"}
              </strong>
            </div>

            <b>Active</b>
          </div>

          <div className="signup-status-row">
            <CheckCircle2 size={18} />

            <div>
              <span>Local profile</span>
              <strong>Available on this device</strong>
            </div>

            <b>Ready</b>
          </div>
        </section>
      </main>
    </div>
  );
}

export default SignupStatus;