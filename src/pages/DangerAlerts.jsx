import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  ShieldAlert,
  UserRound,
} from "lucide-react";
import "./DangerAlerts.css";

const alerts = [
  {
    id: "patient-4",
    name: "Bimala Reang",
    age: "31",
    type: "Maternal & Antenatal",
    sign: "Severe headache / blurred vision",
    time: "09:21 AM",
  },
];

function DangerAlerts() {
  return (
    <div className="danger-alerts-page">
      <header className="danger-alerts-header">
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

      <main className="danger-alerts-content">
        <div className="danger-breadcrumb">
          Dashboard <span>›</span> Danger Alerts
        </div>

        <section className="danger-page-hero">
          <ShieldAlert size={26} />

          <div>
            <h2>Danger Alerts</h2>
            <p>
              Predefined safety rules that require health-worker or
              doctor attention.
            </p>
          </div>
        </section>

        <div className="danger-warning">
          <AlertTriangle size={20} />

          <div>
            <strong>Safety flags are not diagnoses.</strong>
            <p>
              AarogyaVaani only highlights predefined danger signs
              collected during patient intake.
            </p>
          </div>
        </div>

        <section className="danger-list">
          {alerts.map((alert) => (
            <article className="danger-alert-item" key={alert.id}>
              <div className="danger-alert-person">
                <div className="danger-alert-avatar">
                  <UserRound size={20} />
                </div>

                <div>
                  <strong>{alert.name}</strong>
                  <span>
                    {alert.age} years • {alert.type}
                  </span>
                </div>
              </div>

              <div className="danger-alert-sign">
                <AlertTriangle size={17} />
                <span>{alert.sign}</span>
              </div>

              <div className="danger-alert-time">
                {alert.time}
              </div>

              <button
                onClick={() => {
                  window.location.href = `/patient-details?id=${alert.id}`;
                }}
              >
                Review
                <ArrowRight size={15} />
              </button>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}

export default DangerAlerts;