import React, { useEffect, useState } from "react";
import "./Settings.css";

const LANGUAGE_OPTIONS = [
  {
    id: "english",
    name: "English",
    nativeName: "English",
    code: "en",
  },
  {
    id: "bengali",
    name: "Bengali",
    nativeName: "বাংলা",
    code: "bn",
  },
  {
    id: "hindi",
    name: "Hindi",
    nativeName: "हिन्दी",
    code: "hi",
  },
  {
    id: "kokborok",
    name: "Kokborok",
    nativeName: "Kokborok",
    code: "kok",
  },
];

function Settings() {
  const [settings, setSettings] = useState({
    language: "english",
    voiceAssistant: true,
    offlineMode: true,
    autoSync: true,
    autoSave: true,
    largeText: false,
    highContrast: false,
    voiceGuidance: false,
  });

  const [saved, setSaved] = useState(false);

  // Load previously saved settings
  useEffect(() => {
    const savedSettings = localStorage.getItem("aarogyavaaniSettings");

    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error("Unable to load settings:", error);
      }
    }
  }, []);

  const updateSetting = (key, value) => {
    setSettings((previous) => ({
      ...previous,
      [key]: value,
    }));

    setSaved(false);
  };

  const handleSaveChanges = () => {
    localStorage.setItem(
      "aarogyavaaniSettings",
      JSON.stringify(settings)
    );

    // Store the interview language separately
    localStorage.setItem(
      "aarogyavaaniInterviewLanguage",
      settings.language
    );

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  const selectedLanguage = LANGUAGE_OPTIONS.find(
    (language) => language.id === settings.language
  );

  const clearLocalData = () => {
    const confirmed = window.confirm(
      "Are you sure you want to clear locally stored interview data? Unsaved data may be lost."
    );

    if (!confirmed) return;

    localStorage.removeItem("aarogyavaaniInterviewData");

    alert("Local interview data has been cleared.");
  };

  return (
    <div className="settings-page">

      {/* PAGE HEADER */}
      <div className="settings-header">
        <div>
          <span className="settings-eyebrow">APPLICATION SETTINGS</span>

          <h1>Settings</h1>

          <p>
            Manage language, interview, offline and accessibility
            preferences for AarogyaVaani.
          </p>
        </div>

        <div className="settings-status">
          <span className="status-dot"></span>
          Settings are stored on this device
        </div>
      </div>

      {/* LANGUAGE & INTERVIEW */}
      <section className="settings-card">

        <div className="settings-card-header">
          <div className="settings-section-icon language-icon">
            🌐
          </div>

          <div>
            <h2>Language & Interview</h2>
            <p>
              Select the language that should be used during the
              patient interview.
            </p>
          </div>
        </div>

        <div className="settings-divider"></div>

        <div className="setting-row language-row">

          <div className="setting-information">
            <h3>Interview Language</h3>

            <p>
              Interview questions and voice interaction will use
              your selected language.
            </p>
          </div>

          <select
            className="language-select"
            value={settings.language}
            onChange={(event) =>
              updateSetting("language", event.target.value)
            }
          >
            {LANGUAGE_OPTIONS.map((language) => (
              <option key={language.id} value={language.id}>
                {language.nativeName} — {language.name}
              </option>
            ))}
          </select>
        </div>

        <div className="language-preview">

          <div className="preview-label">
            Selected interview language
          </div>

          <div className="preview-content">
            <span className="preview-language-code">
              {selectedLanguage?.code.toUpperCase()}
            </span>

            <div>
              <strong>
                {selectedLanguage?.nativeName}
              </strong>

              <p>
                Patient interview questions and voice interaction
                will use this language.
              </p>
            </div>
          </div>
        </div>

        {/* VOICE ASSISTANT */}
        <div className="setting-row">

          <div className="setting-information">
            <h3>Voice Assistant</h3>

            <p>
              Allow AarogyaVaani to listen to patient responses
              during the interview.
            </p>
          </div>

          <label className="toggle">
            <input
              type="checkbox"
              checked={settings.voiceAssistant}
              onChange={(event) =>
                updateSetting(
                  "voiceAssistant",
                  event.target.checked
                )
              }
            />

            <span className="toggle-slider"></span>
          </label>
        </div>

      </section>


      {/* OFFLINE & SYNC */}
      <section className="settings-card">

        <div className="settings-card-header">
          <div className="settings-section-icon offline-icon">
            ☁
          </div>

          <div>
            <h2>Offline & Sync</h2>

            <p>
              Configure how AarogyaVaani behaves when internet
              connectivity is unavailable.
            </p>
          </div>
        </div>

        <div className="settings-divider"></div>

        {/* OFFLINE MODE */}
        <div className="setting-row">

          <div className="setting-information">

            <div className="setting-title-line">
              <h3>Enable Offline Mode</h3>

              <span className="recommended-badge">
                Recommended
              </span>
            </div>

            <p>
              Continue patient interviews even when the internet
              connection is unavailable.
            </p>

          </div>

          <label className="toggle">

            <input
              type="checkbox"
              checked={settings.offlineMode}
              onChange={(event) =>
                updateSetting(
                  "offlineMode",
                  event.target.checked
                )
              }
            />

            <span className="toggle-slider"></span>

          </label>

        </div>


        {/* AUTO SYNC */}
        <div className="setting-row">

          <div className="setting-information">

            <h3>Auto-sync on Network</h3>

            <p>
              Automatically synchronize locally stored records
              when a network connection becomes available.
            </p>

          </div>

          <label className="toggle">

            <input
              type="checkbox"
              checked={settings.autoSync}
              onChange={(event) =>
                updateSetting(
                  "autoSync",
                  event.target.checked
                )
              }
            />

            <span className="toggle-slider"></span>

          </label>

        </div>


        {/* AUTO SAVE */}
        <div className="setting-row">

          <div className="setting-information">

            <h3>Automatically Save Interview Progress</h3>

            <p>
              Save the patient's progress during an interview so
              the session can be recovered if interrupted.
            </p>

          </div>

          <label className="toggle">

            <input
              type="checkbox"
              checked={settings.autoSave}
              onChange={(event) =>
                updateSetting(
                  "autoSave",
                  event.target.checked
                )
              }
            />

            <span className="toggle-slider"></span>

          </label>

        </div>

      </section>


      {/* ACCESSIBILITY */}
      <section className="settings-card">

        <div className="settings-card-header">

          <div className="settings-section-icon accessibility-icon">
            ♿
          </div>

          <div>

            <h2>Accessibility</h2>

            <p>
              Make AarogyaVaani easier to use for different users
              and environments.
            </p>

          </div>

        </div>

        <div className="settings-divider"></div>


        {/* LARGE TEXT */}
        <div className="setting-row">

          <div className="setting-information">

            <h3>Large Text</h3>

            <p>
              Increase text size across important interface
              elements.
            </p>

          </div>

          <label className="toggle">

            <input
              type="checkbox"
              checked={settings.largeText}
              onChange={(event) =>
                updateSetting(
                  "largeText",
                  event.target.checked
                )
              }
            />

            <span className="toggle-slider"></span>

          </label>

        </div>


        {/* HIGH CONTRAST */}
        <div className="setting-row">

          <div className="setting-information">

            <h3>High Contrast</h3>

            <p>
              Improve visual contrast for better readability.
            </p>

          </div>

          <label className="toggle">

            <input
              type="checkbox"
              checked={settings.highContrast}
              onChange={(event) =>
                updateSetting(
                  "highContrast",
                  event.target.checked
                )
              }
            />

            <span className="toggle-slider"></span>

          </label>

        </div>


        {/* VOICE GUIDANCE */}
        <div className="setting-row">

          <div className="setting-information">

            <h3>Voice Guidance</h3>

            <p>
              Provide spoken guidance for important interview
              actions.
            </p>

          </div>

          <label className="toggle">

            <input
              type="checkbox"
              checked={settings.voiceGuidance}
              onChange={(event) =>
                updateSetting(
                  "voiceGuidance",
                  event.target.checked
                )
              }
            />

            <span className="toggle-slider"></span>

          </label>

        </div>

      </section>


      {/* PRIVACY */}
      <section className="settings-card privacy-card">

        <div className="settings-card-header">

          <div className="settings-section-icon privacy-icon">
            🔒
          </div>

          <div>

            <h2>Privacy & Local Data</h2>

            <p>
              Manage information temporarily stored on this
              device.
            </p>

          </div>

        </div>

        <div className="settings-divider"></div>

        <div className="privacy-information">

          <div className="privacy-check">
            ✓
          </div>

          <div>
            <strong>Consent-first workflow</strong>

            <p>
              Patient information should only be collected after
              the required consent step.
            </p>
          </div>

        </div>

        <button
          type="button"
          className="clear-data-button"
          onClick={clearLocalData}
        >
          Clear Local Interview Data
        </button>

      </section>


      {/* SAVE BAR */}
      <div className="settings-save-bar">

        <div>

          {saved ? (
            <div className="save-success">
              ✓ Changes saved successfully
            </div>
          ) : (
            <span>
              Remember to save your changes.
            </span>
          )}

        </div>

        <button
          type="button"
          className="save-settings-button"
          onClick={handleSaveChanges}
        >
          Save Changes
        </button>

      </div>

    </div>
  );
}

export default Settings;