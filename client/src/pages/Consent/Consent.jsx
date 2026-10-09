import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Volume2,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Play,
  Pause,
} from "lucide-react";
import GovHeader from "../../components/GovHeader";
import BottomNav from "../../components/BottomNav";
import { useLanguage } from "../../context/LanguageContext";

const AUDIO_SCRIPTS = {
  en: {
    speechLang: "en-IN",
    sampleText:
      "Hello. Your clinical history is being recorded solely for the doctor's consultation. All data remains encrypted on this device under India's DPDP Act 2023. Do you agree to proceed?",
  },
  bn: {
    speechLang: "bn-IN",
    sampleText:
      "নমস্কার। আপনার স্বাস্থ্য পরীক্ষা এবং ডাক্তারের সুবিধার জন্য কিছু তথ্য রেকর্ড করা হবে। এই তথ্য সম্পূর্ণ সুরক্ষিত এবং গোপন থাকবে। আপনি কি সম্মত আছেন?",
  },
  hi: {
    speechLang: "hi-IN",
    sampleText:
      "नमस्ते। आपकी स्वास्थ्य जांच और डॉक्टर की सुविधा के लिए जानकारी दर्ज की जा रही है। यह जानकारी पूरी तरह सुरक्षित रहेगी। क्या आप सहमत हैं?",
  },
};

export default function Consent() {
  const navigate = useNavigate();
  const { language, t } = useLanguage();

  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const patientRecord = JSON.parse(
    localStorage.getItem("aarogyaVaaniCurrentPatient") || "{}"
  );
  const patient = patientRecord.patient || { name: "Mamta Debbarma", age: "27" };

  const currentAudioScript = AUDIO_SCRIPTS[language] || AUDIO_SCRIPTS.en;

  const playAudioConsent = () => {
    if (!("speechSynthesis" in window)) {
      alert("Browser Speech Synthesis is not supported on this device.");
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentAudioScript.sampleText);
    utterance.lang = currentAudioScript.speechLang;
    utterance.rate = 0.9;

    utterance.onstart = () => setIsPlayingAudio(true);
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleConsentSubmit = (consentGranted) => {
    if (!consentGranted) {
      alert("Consent was not given. Returning to patient intake form.");
      navigate("/new-patient");
      return;
    }

    localStorage.setItem(
      "aarogyaVaaniConsent",
      JSON.stringify({
        granted: true,
        language,
        timestamp: new Date().toISOString(),
        dpdpCompliant: true,
      })
    );

    navigate("/interview");
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50/50">
      <GovHeader
        title={t("consentTitle")}
        showBack={true}
        backPath="/new-patient"
      />

      <main className="flex-1 w-full max-w-md sm:max-w-lg mx-auto p-4 pb-24 space-y-4">
        {/* Patient Pill */}
        <div className="glass-panel rounded-2xl p-4 mb-6 border border-white/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Patient</span>
            <h3 className="text-xl font-bold text-slate-900">
              {patient.name} ({patient.age} yrs)
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs bg-emerald-500/15 text-emerald-800 border border-emerald-500/20 px-3 py-1.5 rounded-lg font-semibold">
            <ShieldCheck className="w-4 h-4 text-[#0b6651]" />
            <span>DPDP Act 2023 Gate</span>
          </div>
        </div>

        {/* Main Consent Glass Panel */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/80 shadow-md">
          {/* Audio Explanation Box (Emerald Glass) */}
          <div className="glass-card-emerald rounded-2xl p-6 mb-6">
            <span className="inline-block bg-[#0b6651] text-white text-xs font-bold px-2.5 py-1 rounded-md mb-2">
              Audio Consent
            </span>
            <h3 className="text-xl font-bold text-slate-900">
              {t("listenNotice")}
            </h3>
            <p className="text-base text-slate-700 mt-2 italic bg-white/70 p-3 rounded-xl border border-emerald-500/20">
              "{currentAudioScript.sampleText}"
            </p>

            {/* Giant Play/Pause Audio Button */}
            <div className="mt-5 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={playAudioConsent}
                className={`flex items-center gap-3 px-6 py-3.5 rounded-2xl font-bold text-base transition-all shadow-md cursor-pointer ${
                  isPlayingAudio
                    ? "bg-amber-600 hover:bg-amber-700 text-white animate-pulse"
                    : "bg-[#0b6651] hover:bg-[#074738] text-white"
                }`}
              >
                {isPlayingAudio ? (
                  <>
                    <Pause className="w-5 h-5" />
                    <span>{t("pauseAudio")}</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-5 h-5" />
                    <span>{t("playAudio")}</span>
                  </>
                )}
              </button>

              <span className="text-sm font-semibold text-slate-600">
                {isPlayingAudio ? t("playingAudio") : "Speaker output ready"}
              </span>
            </div>
          </div>

          {/* Legal & Privacy Safeguards (Colored Glass Cards) */}
          <div className="mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="glass-card-blue p-4 rounded-2xl">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center mb-2 font-bold text-sm">
                  1
                </div>
                <h5 className="font-bold text-sm text-blue-950">{t("rule1Title")}</h5>
                <p className="text-xs text-blue-800 mt-1 leading-relaxed">
                  {t("rule1Desc")}
                </p>
              </div>

              <div className="glass-card-emerald p-4 rounded-2xl">
                <div className="w-8 h-8 rounded-lg bg-[#0b6651] text-white flex items-center justify-center mb-2 font-bold text-sm">
                  2
                </div>
                <h5 className="font-bold text-sm text-emerald-950">{t("rule2Title")}</h5>
                <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                  {t("rule2Desc")}
                </p>
              </div>

              <div className="glass-card-purple p-4 rounded-2xl">
                <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center mb-2 font-bold text-sm">
                  3
                </div>
                <h5 className="font-bold text-sm text-purple-950">{t("rule3Title")}</h5>
                <p className="text-xs text-purple-800 mt-1 leading-relaxed">
                  {t("rule3Desc")}
                </p>
              </div>
            </div>
          </div>

          {/* Action Cards */}
          <div className="pt-4 border-t border-slate-200/70 flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              onClick={() => handleConsentSubmit(true)}
              className="flex-1 bg-[#0b6651] hover:bg-[#074738] text-white font-bold text-base py-4 px-6 rounded-2xl shadow-md transition-all flex items-center justify-center gap-3 cursor-pointer hover:shadow-lg"
            >
              <CheckCircle2 className="w-6 h-6" />
              <span>{t("giveConsent")}</span>
            </button>

            <button
              type="button"
              onClick={() => handleConsentSubmit(false)}
              className="sm:w-60 bg-white/70 border-2 border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-base py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <XCircle className="w-5 h-5 text-slate-500" />
              <span>{t("declineConsent")}</span>
            </button>
          </div>
        </div>
      </main>

      {/* Docked Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}