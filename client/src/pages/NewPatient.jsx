import React, { useState } from "react";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileText,
  HeartPulse,
  Home,
  Languages,
  Mic,
  ShieldCheck,
  UserRound,
  UsersRound,
  WifiOff,
} from "lucide-react";

import "./NewPatient.css";

const TRIPURA_MAP_URL =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Tripura_in_India.svg/800px-Tripura_in_India.svg.png";

function NewPatient() {
  const [patientType, setPatientType] = useState("maternal");

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    phone: "",
    village: "",
  });

  const userName =
    sessionStorage.getItem("aarogyaVaaniUsername") || "Health Worker";

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const goToDashboard = () => {
    window.location.href = "/dashboard";
  };

  const handleContinue = () => {
    if (!formData.name.trim()) {
      alert("Please enter the patient's name.");
      return;
    }

    if (!formData.age.trim()) {
      alert("Please enter the patient's age.");
      return;
    }

    const patientRecord = {
      patient: formData,
      patientType,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(
      "aarogyaVaaniCurrentPatient",
      JSON.stringify(patientRecord)
    );

    window.location.href = "/consent";
  };

  return (
    <div className="np-page">

      {/* =====================================================
          TRIPURA BACKGROUND
          ===================================================== */}

      <div className="np-map-background">
        <img
          src={TRIPURA_MAP_URL}
          alt=""
          aria-hidden="true"
        />
      </div>

      <div className="np-map-overlay"></div>

      {/* =====================================================
          TOP NAVIGATION
          ===================================================== */}

      <header className="np-topbar">

        <div className="np-brand">
          <div className="np-brand-name">
            AarogyaVaani
          </div>

          <div className="np-brand-subtitle">
            Tripura Health
          </div>
        </div>

        <div className="np-topbar-right">

          <div className="np-offline-status">
            <span className="np-status-dot"></span>
            <WifiOff size={14} />
            <span>Offline Ready</span>
          </div>

          <div className="np-user">
            <div className="np-user-avatar">
              <UserRound size={17} />
            </div>

            <div className="np-user-details">
              <strong>{userName}</strong>
              <span>Health Worker</span>
            </div>
          </div>

        </div>
      </header>

      {/* =====================================================
          MAIN CONTENT
          ===================================================== */}

      <main className="np-main">

        {/* BACK BUTTON */}

        <button
          className="np-back-button"
          onClick={goToDashboard}
        >
          <ArrowLeft size={17} />
          <span>Back to Dashboard</span>
        </button>

        {/* BREADCRUMB */}

        <div className="np-breadcrumb">
          <span>Dashboard</span>
          <span>/</span>
          <strong>New Patient Intake</strong>
        </div>

        {/* ===================================================
            HERO
            =================================================== */}

        <section className="np-hero">

          <div className="np-hero-content">

            <div className="np-eyebrow">
              <Activity size={14} />
              <span>PRIMARY HEALTH CENTRE</span>
            </div>

            <h1>
              Start a New
              <span> Patient Record</span>
            </h1>

            <p>
              Begin a simple, voice-first and offline-ready
              health intake for a patient at your health centre.
            </p>

          </div>

          <div className="np-hero-badge">
            <div className="np-hero-badge-icon">
              <ShieldCheck size={21} />
            </div>

            <div>
              <strong>Consent First</strong>
              <span>
                Patient permission is required before recording.
              </span>
            </div>
          </div>

        </section>

        {/* ===================================================
            PROGRESS
            =================================================== */}

        <section className="np-progress-card">

          <div className="np-progress-step np-active">
            <div className="np-step-circle">01</div>

            <div>
              <strong>Patient Details</strong>
              <span>Basic information</span>
            </div>
          </div>

          <div className="np-progress-line"></div>

          <div className="np-progress-step">
            <div className="np-step-circle">02</div>

            <div>
              <strong>Language & Consent</strong>
              <span>Permission & language</span>
            </div>
          </div>

          <div className="np-progress-line"></div>

          <div className="np-progress-step">
            <div className="np-step-circle">03</div>

            <div>
              <strong>Health Interview</strong>
              <span>Voice or touch intake</span>
            </div>
          </div>

        </section>

        {/* ===================================================
            PATIENT RECORD
            =================================================== */}

        <section className="np-record-card">

          {/* CARD HEADER */}

          <div className="np-record-header">

            <div className="np-record-title-area">

              <div className="np-record-icon">
                <FileText size={22} />
              </div>

              <div>
                <h2>Patient Information</h2>

                <p>
                  Enter a few details to create the patient's
                  local health record.
                </p>
              </div>

            </div>

            <div className="np-record-tag">
              <CheckCircle2 size={14} />
              <span>Secure Local Record</span>
            </div>

          </div>

          {/* FORM */}

          <div className="np-form">

            <div className="np-form-heading">
              <span>01</span>

              <div>
                <h3>Basic Patient Details</h3>
                <p>
                  These details help identify the patient during
                  the health interview.
                </p>
              </div>
            </div>

            <div className="np-form-grid">

              {/* NAME */}

              <div className="np-field np-field-large">

                <label>
                  Patient Full Name
                  <span>*</span>
                </label>

                <div className="np-input-wrapper">

                  <UserRound size={18} />

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter patient's full name"
                    autoComplete="off"
                  />

                </div>

                <small>
                  Use the patient's preferred name.
                </small>

              </div>

              {/* AGE */}

              <div className="np-field">

                <label>
                  Age
                  <span>*</span>
                </label>

                <div className="np-input-wrapper">

                  <Activity size={18} />

                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    placeholder="Age in years"
                    min="0"
                    max="120"
                  />

                </div>

                <small>
                  Enter age in completed years.
                </small>

              </div>

              {/* PHONE */}

              <div className="np-field">

                <label>
                  Mobile Number
                  <em>Optional</em>
                </label>

                <div className="np-input-wrapper">

                  <span className="np-phone-code">
                    +91
                  </span>

                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter mobile number"
                    maxLength="10"
                  />

                </div>

                <small>
                  Optional contact information.
                </small>

              </div>

              {/* VILLAGE */}

              <div className="np-field">

                <label>
                  Village / Locality
                  <em>Optional</em>
                </label>

                <div className="np-input-wrapper">

                  <Home size={18} />

                  <input
                    type="text"
                    name="village"
                    value={formData.village}
                    onChange={handleChange}
                    placeholder="Enter village or locality"
                  />

                </div>

                <small>
                  Helpful for local health-worker follow-up.
                </small>

              </div>

            </div>

            {/* =================================================
                INTAKE TYPE
                ================================================= */}

            <div className="np-intake-section">

              <div className="np-form-heading">

                <span>02</span>

                <div>
                  <h3>Choose Intake Type</h3>

                  <p>
                    Select the health interview you want to start.
                  </p>
                </div>

              </div>

              <div className="np-intake-grid">

                {/* MATERNAL */}

                <button
                  type="button"
                  className={`np-intake-card ${
                    patientType === "maternal"
                      ? "np-intake-selected"
                      : ""
                  }`}
                  onClick={() => setPatientType("maternal")}
                >

                  <div className="np-intake-top">

                    <div className="np-intake-icon maternal">
                      <HeartPulse size={23} />
                    </div>

                    <div
                      className={`np-radio ${
                        patientType === "maternal"
                          ? "checked"
                          : ""
                      }`}
                    >
                      {patientType === "maternal" && (
                        <span></span>
                      )}
                    </div>

                  </div>

                  <div className="np-intake-content">

                    <h4>
                      Maternal & Antenatal Care
                    </h4>

                    <p>
                      Pregnancy and antenatal questions,
                      danger-sign checks and maternal health
                      information.
                    </p>

                  </div>

                  <div className="np-intake-footer">
                    <span>Recommended MVP flow</span>
                    <ArrowRight size={15} />
                  </div>

                </button>

                {/* GENERAL */}

                <button
                  type="button"
                  className={`np-intake-card ${
                    patientType === "general"
                      ? "np-intake-selected"
                      : ""
                  }`}
                  onClick={() => setPatientType("general")}
                >

                  <div className="np-intake-top">

                    <div className="np-intake-icon general">
                      <UsersRound size={23} />
                    </div>

                    <div
                      className={`np-radio ${
                        patientType === "general"
                          ? "checked"
                          : ""
                      }`}
                    >
                      {patientType === "general" && (
                        <span></span>
                      )}
                    </div>

                  </div>

                  <div className="np-intake-content">

                    <h4>
                      General Patient Intake
                    </h4>

                    <p>
                      Basic health interview for patients
                      outside the maternal care workflow.
                    </p>

                  </div>

                  <div className="np-intake-footer">
                    <span>General health workflow</span>
                    <ArrowRight size={15} />
                  </div>

                </button>

              </div>

            </div>

            {/* =================================================
                CONSENT NOTICE
                ================================================= */}

            <div className="np-consent-box">

              <div className="np-consent-icon">
                <ShieldCheck size={21} />
              </div>

              <div className="np-consent-content">

                <h4>
                  Privacy & Consent Protection
                </h4>

                <p>
                  No voice recording will begin on this screen.
                  Before any audio is captured, the patient will
                  be shown a clear consent step and can choose
                  whether to continue.
                </p>

                <div className="np-consent-points">

                  <span>
                    <CheckCircle2 size={13} />
                    Consent required
                  </span>

                  <span>
                    <CheckCircle2 size={13} />
                    Offline storage
                  </span>

                  <span>
                    <CheckCircle2 size={13} />
                    Patient can refuse
                  </span>

                </div>

              </div>

            </div>

            {/* =================================================
                ACTIONS
                ================================================= */}

            <div className="np-action-bar">

              <button
                type="button"
                className="np-cancel-button"
                onClick={goToDashboard}
              >
                Cancel
              </button>

              <button
                type="button"
                className="np-continue-button"
                onClick={handleContinue}
              >
                <span>Continue to Consent</span>
                <ArrowRight size={17} />
              </button>

            </div>

          </div>

        </section>

        {/* ===================================================
            BOTTOM INFORMATION
            =================================================== */}

        <section className="np-bottom-info">

          <div className="np-info-item">
            <div>
              <Mic size={16} />
            </div>

            <span>
              Voice-first interview
            </span>
          </div>

          <div className="np-info-item">
            <div>
              <Languages size={16} />
            </div>

            <span>
              Bengali & Hindi ready
            </span>
          </div>

          <div className="np-info-item">
            <div>
              <WifiOff size={16} />
            </div>

            <span>
              Works without internet
            </span>
          </div>

        </section>

        <footer className="np-footer">
          <span>
            AarogyaVaani • Tripura Health
          </span>

          <span>
            Patient-first • Consent-first • Offline-ready
          </span>
        </footer>

      </main>
    </div>
  );
}

export default NewPatient;