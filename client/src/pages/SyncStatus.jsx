import {
  ArrowLeft,
  CheckCircle2,
  CloudOff,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import "./SyncStatus.css";

function SyncStatus() {
  return (
    <div className="sync-status-page">
      <header className="sync-header">
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

      <main className="sync-content">
        <div className="sync-breadcrumb">
          Dashboard <span>›</span> Sync Status
        </div>

        <section className="sync-hero">
          <CloudOff size={27} />

          <div>
            <h2>Offline & Sync Status</h2>
            <p>
              AarogyaVaani is designed to keep patient intake
              available even without internet.
            </p>
          </div>
        </section>

        <section className="sync-grid">
          <div className="sync-card">
            <CheckCircle2 size={21} />

            <span>Local storage</span>
            <strong>Ready</strong>
            <p>Patient data remains on this device.</p>
          </div>

          <div className="sync-card">
            <RefreshCw size={21} />

            <span>Records waiting</span>
            <strong>03</strong>
            <p>These records can be synced later.</p>
          </div>

          <div className="sync-card">
            <ShieldCheck size={21} />

            <span>Privacy</span>
            <strong>Protected</strong>
            <p>Consent-first local data handling.</p>
          </div>
        </section>

        <button
          className="refresh-sync-button"
          onClick={() => {
            alert(
              "Sync check complete. The application remains ready for offline operation."
            );
          }}
        >
          <RefreshCw size={17} />
          Check Again
        </button>
      </main>
    </div>
  );
}

export default SyncStatus;