import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ShieldCheck,
  Volume2,
  Languages,
  Mic,
} from "lucide-react";
import "./Consent.css";

const languages = [
  {
    id: "english",
    name: "English",
    native: "English",
    speechCode: "en-IN",
  },
  {
    id: "bengali",
    name: "Bengali",
    native: "বাংলা",
    speechCode: "bn-IN",
  },
  {
    id: "hindi",
    name: "Hindi",
    native: "हिन्दी",
    speechCode: "hi-IN",
  },
  {
    id: "kokborok",
    name: "Kokborok",
    native: "Kokborok",
    speechCode: "kok-IN",
  },
];

function Consent() {
  const [language, setLanguage] = useState("english");
  const [audioConsent, setAudioConsent] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const patientData = JSON.parse(
    localStorage.getItem("aarogyaVaaniCurrentPatient") || "{}"
  );

  const patientType = patientData.patientType || "maternal";

  const selectedLanguage = languages.find(
    (item) => item.id === language
  );

  const goBack = () => {
    window.location.href = "/new-patient";
  };

  const handleContinue = () => {
    if (!audioConsent || !privacyAccepted) {
      alert(
        "Please provide audio consent and accept the privacy notice before continuing."
      );
      return;
    }

    localStorage.setItem(
      "aarogyaVaaniConsent",
      JSON.stringify({
        language,
        languageName: selectedLanguage.name,
        speechCode: selectedLanguage.speechCode,
        audioConsent: true,
        consentGiven: true,
        consentAt: new Date().toISOString(),
      })
    );

    window.location.href = "/interview";
  };

  return (
    <div className="consent-page">
      <div className="consent-overlay"></div>

      <header className="consent-header">
        <div className="av-brand-text">
          <div className="av-brand-name">AarogyaVaani</div>
          <div className="av-brand-subtitle">Tripura Health</div>
        </div>

        <div className="consent-header-right">
          <span className="secure-badge">
            <ShieldCheck size={17} />
            Privacy First
          </span>
        </div>
      </header>

      <main className="consent-main">
        <div className="consent-breadcrumb">
          <span onClick={goBack}>Patient Information</span>
          <ArrowRight size={15} />
          <strong>Language & Consent</strong>
        </div>

        <div className="consent-progress">
          <div className="progress-step completed">
            <span>
              <Check size={15} />
            </span>
            Patient
          </div>

          <div className="progress-line active"></div>

          <div className="progress-step active">
            <span>2</span>
            Consent
          </div>

          <div className="progress-line"></div>

          <div className="progress-step">
            <span>3</span>
            Interview
          </div>

          <div className="progress-line"></div>

          <div className="progress-step">
            <span>4</span>
            Summary
          </div>
        </div>

        <section className="consent-hero">
          <div className="consent-hero-icon">
            <Languages size={30} />
          </div>

          <div>
            <p className="section-kicker">STEP 2 OF 4</p>
            <h1>Language & Consent</h1>

            <p>
              Choose the language the patient is most comfortable speaking.
              AarogyaVaani will use this choice throughout the interview.
            </p>
          </div>
        </section>

        <section className="patient-context-card">
          <div>
            <span>Patient</span>
            <strong>
              {patientData.patient?.name || "Patient"}
            </strong>
          </div>

          <div>
            <span>Intake Type</span>
            <strong>
              {patientType === "maternal"
                ? "Maternal Care"
                : "General Patient Intake"}
            </strong>
          </div>
        </section>

        <section className="consent-card">
          <div className="card-heading">
            <div>
              <p className="section-kicker">PATIENT LANGUAGE</p>
              <h2>Which language would you like to use?</h2>
            </div>

            <Languages size={24} />
          </div>

          <div className="language-grid">
            {languages.map((item) => (
              <button
                key={item.id}
                className={`language-option ${
                  language === item.id ? "selected" : ""
                }`}
                onClick={() => setLanguage(item.id)}
              >
                <div className="language-check">
                  {language === item.id && <Check size={17} />}
                </div>

                <div className="language-content">
                  <strong>{item.name}</strong>
                  <span>{item.native}</span>
                </div>

                <div className="language-mic">
                  <Mic size={18} />
                </div>
              </button>
            ))}
          </div>

          <div className="voice-info">
            <Volume2 size={20} />

            <div>
              <strong>Voice-first support</strong>
              <p>
                The selected language will also be used when voice input is
                available on the device.
              </p>
            </div>
          </div>
        </section>

        <section className="consent-card">
          <div className="card-heading">
            <div>
              <p className="section-kicker">AUDIO CONSENT</p>
              <h2>May we use voice input?</h2>
            </div>

            <Mic size={24} />
          </div>

          <p className="card-description">
            AarogyaVaani can use the device microphone to understand the
            patient's spoken answers. Audio is not stored as part of this
            demo workflow.
          </p>

          <button
            className={`consent-toggle ${
              audioConsent ? "enabled" : ""
            }`}
            onClick={() => setAudioConsent(!audioConsent)}
          >
            <div className="toggle-circle">
              {audioConsent && <Check size={16} />}
            </div>

            <div>
              <strong>
                {audioConsent
                  ? "Audio consent given"
                  : "Allow voice input"}
              </strong>

              <span>
                {audioConsent
                  ? "The patient has agreed to continue."
                  : "Tap to provide consent."}
              </span>
            </div>
          </button>
        </section>

        <section className="privacy-box">
          <div className="privacy-icon">
            <ShieldCheck size={23} />
          </div>

          <div>
            <h3>Patient privacy comes first</h3>

            <p>
              The patient can refuse voice input or stop the interview at any
              time. AarogyaVaani does not provide a diagnosis. Final clinical
              review remains with the healthcare professional.
            </p>

            <label className="privacy-check">
              <input
                type="checkbox"
                checked={privacyAccepted}
                onChange={(e) =>
                  setPrivacyAccepted(e.target.checked)
                }
              />

              <span>
                I understand the privacy notice and the patient has agreed
                to continue.
              </span>
            </label>
          </div>
        </section>

        <div className="consent-actions">
          <button className="secondary-btn" onClick={goBack}>
            <ArrowLeft size={18} />
            Back
          </button>

          <button
            className="primary-btn"
            onClick={handleContinue}
            disabled={!audioConsent || !privacyAccepted}
          >
            Continue to Interview
            <ArrowRight size={18} />
          </button>
        </div>
      </main>
    </div>
  );
}

export default Consent;