import React, { useEffect, useState } from "react";

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
    <div className={`w-full max-w-[1180px] mx-auto px-[34px] py-[32px] pb-[120px] max-[900px]:px-[22px] max-[900px]:py-[25px] max-[900px]:pb-[110px] max-[620px]:px-[14px] max-[620px]:py-[20px] max-[620px]:pb-[100px] ${settings.highContrast ? "text-[#102d24]" : "text-[#173c32]"}`}>

      {/* PAGE HEADER */}
      <div className="flex justify-between items-start gap-[30px] mb-[28px] max-[900px]:flex-col max-[900px]:gap-[16px]">
        <div>
          <span className="inline-block mb-[8px] text-[11px] font-extrabold tracking-[1.4px] text-[#258a68]">APPLICATION SETTINGS</span>

          <h1 className="m-0 text-[32px] leading-[1.2] font-extrabold text-[#173c32] max-[620px]:text-[27px]">Settings</h1>

          <p className="mt-[9px] max-w-[650px] text-[#6d7f78] text-[14px] leading-[1.6] m-0 max-[620px]:text-[13px]">
            Manage language, interview, offline and accessibility
            preferences for AarogyaVaani.
          </p>
        </div>

        <div className="flex items-center gap-[8px] px-[14px] py-[10px] border border-[#dcebe5] rounded-[12px] bg-[#f8fcfa] text-[#60766e] text-[12px] whitespace-nowrap max-[900px]:w-fit max-[620px]:w-full max-[620px]:whitespace-normal">
          <span className="w-[8px] h-[8px] rounded-full bg-[#2caf76]"></span>
          Settings are stored on this device
        </div>
      </div>

      {/* LANGUAGE & INTERVIEW */}
      <section className={`mb-[20px] p-[24px] bg-white border ${settings.highContrast ? "border-[#b9ccc4]" : "border-[#e4eee9]"} rounded-[18px] shadow-[0_5px_18px_rgba(26,76,59,0.04)] max-[620px]:p-[18px] max-[620px]:rounded-[15px]`}>

        <div className="flex items-start gap-[15px] max-[620px]:gap-[11px]">
          <div className="w-[44px] h-[44px] shrink-0 basis-[44px] flex justify-center items-center rounded-[13px] bg-[#e9f7f1] text-[20px] max-[620px]:w-[38px] max-[620px]:h-[38px] max-[620px]:basis-[38px] max-[620px]:rounded-[10px] max-[620px]:text-[17px]">
            🌐
          </div>

          <div>
            <h2 className="my-[1px] mb-[5px] text-[17px] font-extrabold text-[#193e33] m-0 max-[620px]:text-[15px]">Language & Interview</h2>
            <p className={`m-0 text-[#788983] ${settings.largeText ? "text-[14px]" : "text-[13px]"} leading-[1.5]`}>
              Select the language that should be used during the
              patient interview.
            </p>
          </div>
        </div>

        <div className="h-[1px] mt-[22px] bg-[#edf2ef]"></div>

        <div className="min-h-[76px] flex justify-between gap-[30px] py-[19px] border-b border-[#edf2ef] last:border-b-0 max-[900px]:gap-[20px] max-[620px]:flex-col max-[620px]:gap-[13px] max-[620px]:py-[17px] items-center max-[620px]:items-start">

          <div className="flex-1">
            <h3 className={`m-0 mb-[6px] ${settings.largeText ? "text-[16px]" : "text-[14px]"} font-[750] text-[#24483d]`}>Interview Language</h3>

            <p className={`max-w-[690px] m-0 ${settings.highContrast ? "text-[#4e625b]" : "text-[#7a8984]"} ${settings.largeText ? "text-[14px]" : "text-[12.5px]"} leading-[1.55]`}>
              Interview questions and voice interaction will use
              your selected language.
            </p>
          </div>

          <select
            className="w-[230px] px-[13px] py-[11px] border border-[#cfe2da] rounded-[10px] bg-[#fbfefd] text-[#234a3f] text-[13px] font-[650] outline-none cursor-pointer transition-[0.2s_ease] hover:border-[#83bea8] focus:border-[#319a73] focus:shadow-[0_0_0_3px_rgba(49,154,115,0.1)] max-[620px]:w-full"
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

        <div className="mt-[18px] px-[17px] py-[15px] rounded-[13px] border border-[#dcece5] bg-[#f7fcfa]">

          <div className="mb-[10px] text-[#7b8c86] text-[10px] font-extrabold tracking-[0.8px] uppercase">
            Selected interview language
          </div>

          <div className="flex items-center gap-[12px]">
            <span className="flex justify-center items-center w-[42px] h-[42px] rounded-[11px] bg-[#dff3e9] text-[#207b57] text-[12px] font-black">
              {selectedLanguage?.code.toUpperCase()}
            </span>

            <div>
              <strong className="text-[#234b40] text-[14px]">
                {selectedLanguage?.nativeName}
              </strong>

              <p className="mt-[3px] text-[#7a8984] text-[11.5px] m-0">
                Patient interview questions and voice interaction
                will use this language.
              </p>
            </div>
          </div>
        </div>

        {/* VOICE ASSISTANT */}
        <div className="min-h-[76px] flex items-center justify-between gap-[30px] py-[19px] border-b border-[#edf2ef] last:border-b-0 max-[900px]:gap-[20px] max-[620px]:items-start max-[620px]:flex-col max-[620px]:gap-[13px] max-[620px]:py-[17px]">

          <div className="flex-1">
            <h3 className={`m-0 mb-[6px] ${settings.largeText ? "text-[16px]" : "text-[14px]"} font-[750] text-[#24483d]`}>Voice Assistant</h3>

            <p className={`max-w-[690px] m-0 ${settings.highContrast ? "text-[#4e625b]" : "text-[#7a8984]"} ${settings.largeText ? "text-[14px]" : "text-[12.5px]"} leading-[1.55]`}>
              Allow AarogyaVaani to listen to patient responses
              during the interview.
            </p>
          </div>

          <label className="relative inline-block w-[46px] h-[26px] shrink-0 basis-[46px] cursor-pointer max-[620px]:self-end group">
            <input
              type="checkbox"
              className="w-0 h-0 opacity-0 peer"
              checked={settings.voiceAssistant}
              onChange={(event) =>
                updateSetting(
                  "voiceAssistant",
                  event.target.checked
                )
              }
            />

            <span className="absolute inset-0 rounded-[50px] bg-[#d6e1dd] transition-[0.25s_ease] peer-checked:bg-[#29966e] before:absolute before:w-[20px] before:h-[20px] before:left-[3px] before:top-[3px] before:rounded-full before:bg-white before:shadow-[0_2px_5px_rgba(0,0,0,0.15)] before:transition-[0.25s_ease] peer-checked:before:translate-x-[20px]"></span>
          </label>
        </div>

      </section>


      {/* OFFLINE & SYNC */}
      <section className={`mb-[20px] p-[24px] bg-white border ${settings.highContrast ? "border-[#b9ccc4]" : "border-[#e4eee9]"} rounded-[18px] shadow-[0_5px_18px_rgba(26,76,59,0.04)] max-[620px]:p-[18px] max-[620px]:rounded-[15px]`}>

        <div className="flex items-start gap-[15px] max-[620px]:gap-[11px]">
          <div className="w-[44px] h-[44px] shrink-0 basis-[44px] flex justify-center items-center rounded-[13px] bg-[#eef8f5] text-[20px] max-[620px]:w-[38px] max-[620px]:h-[38px] max-[620px]:basis-[38px] max-[620px]:rounded-[10px] max-[620px]:text-[17px]">
            ☁
          </div>

          <div>
            <h2 className="my-[1px] mb-[5px] text-[17px] font-extrabold text-[#193e33] m-0 max-[620px]:text-[15px]">Offline & Sync</h2>

            <p className={`m-0 text-[#788983] ${settings.largeText ? "text-[14px]" : "text-[13px]"} leading-[1.5]`}>
              Configure how AarogyaVaani behaves when internet
              connectivity is unavailable.
            </p>
          </div>
        </div>

        <div className="h-[1px] mt-[22px] bg-[#edf2ef]"></div>

        {/* OFFLINE MODE */}
        <div className="min-h-[76px] flex items-center justify-between gap-[30px] py-[19px] border-b border-[#edf2ef] last:border-b-0 max-[900px]:gap-[20px] max-[620px]:items-start max-[620px]:flex-col max-[620px]:gap-[13px] max-[620px]:py-[17px]">

          <div className="flex-1">

            <div className="flex items-center flex-wrap gap-[9px] mb-[6px]">
              <h3 className={`mb-0 m-0 ${settings.largeText ? "text-[16px]" : "text-[14px]"} font-[750] text-[#24483d]`}>Enable Offline Mode</h3>

              <span className="inline-flex items-center px-[8px] py-[4px] rounded-[20px] bg-[#e8f7ef] text-[#218259] text-[10px] font-extrabold">
                Recommended
              </span>
            </div>

            <p className={`max-w-[690px] m-0 ${settings.highContrast ? "text-[#4e625b]" : "text-[#7a8984]"} ${settings.largeText ? "text-[14px]" : "text-[12.5px]"} leading-[1.55]`}>
              Continue patient interviews even when the internet
              connection is unavailable.
            </p>

          </div>

          <label className="relative inline-block w-[46px] h-[26px] shrink-0 basis-[46px] cursor-pointer max-[620px]:self-end group">

            <input
              type="checkbox"
              className="w-0 h-0 opacity-0 peer"
              checked={settings.offlineMode}
              onChange={(event) =>
                updateSetting(
                  "offlineMode",
                  event.target.checked
                )
              }
            />

            <span className="absolute inset-0 rounded-[50px] bg-[#d6e1dd] transition-[0.25s_ease] peer-checked:bg-[#29966e] before:absolute before:w-[20px] before:h-[20px] before:left-[3px] before:top-[3px] before:rounded-full before:bg-white before:shadow-[0_2px_5px_rgba(0,0,0,0.15)] before:transition-[0.25s_ease] peer-checked:before:translate-x-[20px]"></span>

          </label>

        </div>


        {/* AUTO SYNC */}
        <div className="min-h-[76px] flex items-center justify-between gap-[30px] py-[19px] border-b border-[#edf2ef] last:border-b-0 max-[900px]:gap-[20px] max-[620px]:items-start max-[620px]:flex-col max-[620px]:gap-[13px] max-[620px]:py-[17px]">

          <div className="flex-1">

            <h3 className={`m-0 mb-[6px] ${settings.largeText ? "text-[16px]" : "text-[14px]"} font-[750] text-[#24483d]`}>Auto-sync on Network</h3>

            <p className={`max-w-[690px] m-0 ${settings.highContrast ? "text-[#4e625b]" : "text-[#7a8984]"} ${settings.largeText ? "text-[14px]" : "text-[12.5px]"} leading-[1.55]`}>
              Automatically synchronize locally stored records
              when a network connection becomes available.
            </p>

          </div>

          <label className="relative inline-block w-[46px] h-[26px] shrink-0 basis-[46px] cursor-pointer max-[620px]:self-end group">

            <input
              type="checkbox"
              className="w-0 h-0 opacity-0 peer"
              checked={settings.autoSync}
              onChange={(event) =>
                updateSetting(
                  "autoSync",
                  event.target.checked
                )
              }
            />

            <span className="absolute inset-0 rounded-[50px] bg-[#d6e1dd] transition-[0.25s_ease] peer-checked:bg-[#29966e] before:absolute before:w-[20px] before:h-[20px] before:left-[3px] before:top-[3px] before:rounded-full before:bg-white before:shadow-[0_2px_5px_rgba(0,0,0,0.15)] before:transition-[0.25s_ease] peer-checked:before:translate-x-[20px]"></span>

          </label>

        </div>


        {/* AUTO SAVE */}
        <div className="min-h-[76px] flex items-center justify-between gap-[30px] py-[19px] border-b border-[#edf2ef] last:border-b-0 max-[900px]:gap-[20px] max-[620px]:items-start max-[620px]:flex-col max-[620px]:gap-[13px] max-[620px]:py-[17px]">

          <div className="flex-1">

            <h3 className={`m-0 mb-[6px] ${settings.largeText ? "text-[16px]" : "text-[14px]"} font-[750] text-[#24483d]`}>Automatically Save Interview Progress</h3>

            <p className={`max-w-[690px] m-0 ${settings.highContrast ? "text-[#4e625b]" : "text-[#7a8984]"} ${settings.largeText ? "text-[14px]" : "text-[12.5px]"} leading-[1.55]`}>
              Save the patient's progress during an interview so
              the session can be recovered if interrupted.
            </p>

          </div>

          <label className="relative inline-block w-[46px] h-[26px] shrink-0 basis-[46px] cursor-pointer max-[620px]:self-end group">

            <input
              type="checkbox"
              className="w-0 h-0 opacity-0 peer"
              checked={settings.autoSave}
              onChange={(event) =>
                updateSetting(
                  "autoSave",
                  event.target.checked
                )
              }
            />

            <span className="absolute inset-0 rounded-[50px] bg-[#d6e1dd] transition-[0.25s_ease] peer-checked:bg-[#29966e] before:absolute before:w-[20px] before:h-[20px] before:left-[3px] before:top-[3px] before:rounded-full before:bg-white before:shadow-[0_2px_5px_rgba(0,0,0,0.15)] before:transition-[0.25s_ease] peer-checked:before:translate-x-[20px]"></span>

          </label>

        </div>

      </section>


      {/* ACCESSIBILITY */}
      <section className={`mb-[20px] p-[24px] bg-white border ${settings.highContrast ? "border-[#b9ccc4]" : "border-[#e4eee9]"} rounded-[18px] shadow-[0_5px_18px_rgba(26,76,59,0.04)] max-[620px]:p-[18px] max-[620px]:rounded-[15px]`}>

        <div className="flex items-start gap-[15px] max-[620px]:gap-[11px]">

          <div className="w-[44px] h-[44px] shrink-0 basis-[44px] flex justify-center items-center rounded-[13px] bg-[#f0f7f5] text-[20px] max-[620px]:w-[38px] max-[620px]:h-[38px] max-[620px]:basis-[38px] max-[620px]:rounded-[10px] max-[620px]:text-[17px]">
            ♿
          </div>

          <div>

            <h2 className="my-[1px] mb-[5px] text-[17px] font-extrabold text-[#193e33] m-0 max-[620px]:text-[15px]">Accessibility</h2>

            <p className={`m-0 text-[#788983] ${settings.largeText ? "text-[14px]" : "text-[13px]"} leading-[1.5]`}>
              Make AarogyaVaani easier to use for different users
              and environments.
            </p>

          </div>

        </div>

        <div className="h-[1px] mt-[22px] bg-[#edf2ef]"></div>


        {/* LARGE TEXT */}
        <div className="min-h-[76px] flex items-center justify-between gap-[30px] py-[19px] border-b border-[#edf2ef] last:border-b-0 max-[900px]:gap-[20px] max-[620px]:items-start max-[620px]:flex-col max-[620px]:gap-[13px] max-[620px]:py-[17px]">

          <div className="flex-1">

            <h3 className={`m-0 mb-[6px] ${settings.largeText ? "text-[16px]" : "text-[14px]"} font-[750] text-[#24483d]`}>Large Text</h3>

            <p className={`max-w-[690px] m-0 ${settings.highContrast ? "text-[#4e625b]" : "text-[#7a8984]"} ${settings.largeText ? "text-[14px]" : "text-[12.5px]"} leading-[1.55]`}>
              Increase text size across important interface
              elements.
            </p>

          </div>

          <label className="relative inline-block w-[46px] h-[26px] shrink-0 basis-[46px] cursor-pointer max-[620px]:self-end group">

            <input
              type="checkbox"
              className="w-0 h-0 opacity-0 peer"
              checked={settings.largeText}
              onChange={(event) =>
                updateSetting(
                  "largeText",
                  event.target.checked
                )
              }
            />

            <span className="absolute inset-0 rounded-[50px] bg-[#d6e1dd] transition-[0.25s_ease] peer-checked:bg-[#29966e] before:absolute before:w-[20px] before:h-[20px] before:left-[3px] before:top-[3px] before:rounded-full before:bg-white before:shadow-[0_2px_5px_rgba(0,0,0,0.15)] before:transition-[0.25s_ease] peer-checked:before:translate-x-[20px]"></span>

          </label>

        </div>


        {/* HIGH CONTRAST */}
        <div className="min-h-[76px] flex items-center justify-between gap-[30px] py-[19px] border-b border-[#edf2ef] last:border-b-0 max-[900px]:gap-[20px] max-[620px]:items-start max-[620px]:flex-col max-[620px]:gap-[13px] max-[620px]:py-[17px]">

          <div className="flex-1">

            <h3 className={`m-0 mb-[6px] ${settings.largeText ? "text-[16px]" : "text-[14px]"} font-[750] text-[#24483d]`}>High Contrast</h3>

            <p className={`max-w-[690px] m-0 ${settings.highContrast ? "text-[#4e625b]" : "text-[#7a8984]"} ${settings.largeText ? "text-[14px]" : "text-[12.5px]"} leading-[1.55]`}>
              Improve visual contrast for better readability.
            </p>

          </div>

          <label className="relative inline-block w-[46px] h-[26px] shrink-0 basis-[46px] cursor-pointer max-[620px]:self-end group">

            <input
              type="checkbox"
              className="w-0 h-0 opacity-0 peer"
              checked={settings.highContrast}
              onChange={(event) =>
                updateSetting(
                  "highContrast",
                  event.target.checked
                )
              }
            />

            <span className="absolute inset-0 rounded-[50px] bg-[#d6e1dd] transition-[0.25s_ease] peer-checked:bg-[#29966e] before:absolute before:w-[20px] before:h-[20px] before:left-[3px] before:top-[3px] before:rounded-full before:bg-white before:shadow-[0_2px_5px_rgba(0,0,0,0.15)] before:transition-[0.25s_ease] peer-checked:before:translate-x-[20px]"></span>

          </label>

        </div>


        {/* VOICE GUIDANCE */}
        <div className="min-h-[76px] flex items-center justify-between gap-[30px] py-[19px] border-b border-[#edf2ef] last:border-b-0 max-[900px]:gap-[20px] max-[620px]:items-start max-[620px]:flex-col max-[620px]:gap-[13px] max-[620px]:py-[17px]">

          <div className="flex-1">

            <h3 className={`m-0 mb-[6px] ${settings.largeText ? "text-[16px]" : "text-[14px]"} font-[750] text-[#24483d]`}>Voice Guidance</h3>

            <p className={`max-w-[690px] m-0 ${settings.highContrast ? "text-[#4e625b]" : "text-[#7a8984]"} ${settings.largeText ? "text-[14px]" : "text-[12.5px]"} leading-[1.55]`}>
              Provide spoken guidance for important interview
              actions.
            </p>

          </div>

          <label className="relative inline-block w-[46px] h-[26px] shrink-0 basis-[46px] cursor-pointer max-[620px]:self-end group">

            <input
              type="checkbox"
              className="w-0 h-0 opacity-0 peer"
              checked={settings.voiceGuidance}
              onChange={(event) =>
                updateSetting(
                  "voiceGuidance",
                  event.target.checked
                )
              }
            />

            <span className="absolute inset-0 rounded-[50px] bg-[#d6e1dd] transition-[0.25s_ease] peer-checked:bg-[#29966e] before:absolute before:w-[20px] before:h-[20px] before:left-[3px] before:top-[3px] before:rounded-full before:bg-white before:shadow-[0_2px_5px_rgba(0,0,0,0.15)] before:transition-[0.25s_ease] peer-checked:before:translate-x-[20px]"></span>

          </label>

        </div>

      </section>


      {/* PRIVACY */}
      <section className={`mb-[20px] p-[24px] bg-white border ${settings.highContrast ? "border-[#b9ccc4]" : "border-[#e4eee9]"} rounded-[18px] shadow-[0_5px_18px_rgba(26,76,59,0.04)] max-[620px]:p-[18px] max-[620px]:rounded-[15px]`}>

        <div className="flex items-start gap-[15px] max-[620px]:gap-[11px]">

          <div className="w-[44px] h-[44px] shrink-0 basis-[44px] flex justify-center items-center rounded-[13px] bg-[#eef7f2] text-[20px] max-[620px]:w-[38px] max-[620px]:h-[38px] max-[620px]:basis-[38px] max-[620px]:rounded-[10px] max-[620px]:text-[17px]">
            🔒
          </div>

          <div>

            <h2 className="my-[1px] mb-[5px] text-[17px] font-extrabold text-[#193e33] m-0 max-[620px]:text-[15px]">Privacy & Local Data</h2>

            <p className={`m-0 text-[#788983] ${settings.largeText ? "text-[14px]" : "text-[13px]"} leading-[1.5]`}>
              Manage information temporarily stored on this
              device.
            </p>

          </div>

        </div>

        <div className="h-[1px] mt-[22px] bg-[#edf2ef]"></div>

        <div className="flex items-start gap-[12px] mt-[20px] p-[15px] rounded-[12px] bg-[#f8fbfa]">

          <div className="flex justify-center items-center w-[25px] h-[25px] shrink-0 basis-[25px] rounded-full bg-[#dff3e8] text-[#23825a] text-[13px] font-black">
            ✓
          </div>

          <div>
            <strong className="text-[#244a3f] text-[13px]">Consent-first workflow</strong>

            <p className="mt-[4px] text-[#788983] text-[12px] leading-[1.5] m-0">
              Patient information should only be collected after
              the required consent step.
            </p>
          </div>

        </div>

        <button
          type="button"
          className="mt-[17px] px-[14px] py-[10px] border border-[#e2cfcf] rounded-[9px] bg-white text-[#a14d4d] text-[12px] font-bold cursor-pointer transition-[0.2s_ease] hover:bg-[#fff7f7] hover:border-[#dcaeae]"
          onClick={clearLocalData}
        >
          Clear Local Interview Data
        </button>

      </section>


      {/* SAVE BAR */}
      <div className="sticky bottom-[18px] z-20 flex items-center justify-between gap-[20px] mt-[24px] px-[16px] py-[14px] border border-[#dceae4] rounded-[15px] bg-[rgba(255,255,255,0.94)] shadow-[0_8px_25px_rgba(25,74,57,0.09)] backdrop-blur-[12px] text-[#788983] text-[12px] max-[620px]:items-stretch max-[620px]:flex-col max-[620px]:gap-[12px]">

        <div>

          {saved ? (
            <div className="text-[#218259] font-bold">
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
          className="min-w-[135px] px-[18px] py-[11px] border-none rounded-[9px] bg-[#278f68] text-white text-[12.5px] font-extrabold cursor-pointer transition-[0.2s_ease] hover:bg-[#217b59] hover:-translate-y-[1px] max-[620px]:w-full"
          onClick={handleSaveChanges}
        >
          Save Changes
        </button>

      </div>

    </div>
  );
}

export default Settings;