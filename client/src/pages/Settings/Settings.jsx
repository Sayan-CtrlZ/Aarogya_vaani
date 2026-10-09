import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Settings as SettingsIcon,
  Globe,
  Eye,
  ShieldCheck,
  Save,
  CheckCircle2,
  Trash2,
  Volume2,
} from "lucide-react";
import GovHeader from "../../components/GovHeader";
import BottomNav from "../../components/BottomNav";
import { useLanguage } from "../../context/LanguageContext";

const LANGUAGE_OPTIONS = [
  { id: "en", name: "English" },
  { id: "bn", name: "বাংলা (Bengali)" },
  { id: "hi", name: "हिन्दी (Hindi)" },
];

export default function Settings() {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();

  const [settings, setSettings] = useState({
    voiceAssistant: true,
    offlineMode: true,
    autoSync: true,
    speechRate: "0.9",
    largeText: true,
    highContrast: false,
    audioGuidance: true,
  });

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedSettings = localStorage.getItem("aarogyaVaaniSettings");
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error("Unable to load settings:", e);
      }
    }
  }, []);

  const updateSetting = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleSaveChanges = () => {
    localStorage.setItem("aarogyaVaaniSettings", JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const clearLocalData = () => {
    if (window.confirm("Clear locally stored temporary cache and patient drafts?")) {
      localStorage.removeItem("aarogyaVaaniCurrentPatient");
      localStorage.removeItem("aarogyaVaaniInterview");
      localStorage.removeItem("aarogyaVaaniDangerCheck");
      localStorage.removeItem("aarogyaVaaniReports");
      alert("Local cache cleared.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans pb-24">
      <GovHeader
        title={t("settingsTitle")}
        subtitle={t("settingsSubtitle")}
        showBack={true}
        backPath="/dashboard"
      />

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Banner */}
        <div className="glass-panel p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center shrink-0 shadow-md">
              <SettingsIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900">
                {t("settingsTitle")}
              </h2>
              <p className="text-sm text-slate-600 mt-1 font-medium">
                {t("settingsSubtitle")}
              </p>
            </div>
          </div>
        </div>

        {/* Section 1: Language & Speech */}
        <div className="glass-panel p-6 sm:p-8 space-y-6">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 border-b border-emerald-900/10 pb-3">
            <Globe className="w-5 h-5 text-emerald-700" />
            <span>Language & Audio Settings</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2">
                Active Interface Language:
              </label>
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="w-full bg-white/80 backdrop-blur-md border border-slate-300 rounded-xl p-3.5 text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner"
              >
                {LANGUAGE_OPTIONS.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2">
                {t("voiceSpeed")}:
              </label>
              <select
                value={settings.speechRate}
                onChange={(e) => updateSetting("speechRate", e.target.value)}
                className="w-full bg-white/80 backdrop-blur-md border border-slate-300 rounded-xl p-3.5 text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner"
              >
                <option value="0.8">0.8x (Slow - Clear for Elderly / Rural)</option>
                <option value="0.9">0.9x (Recommended Normal)</option>
                <option value="1.0">1.0x (Standard)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between p-4.5 glass-card">
            <div>
              <h4 className="text-base font-bold text-slate-900">Audio Prompt Read-Out</h4>
              <p className="text-xs text-slate-600 mt-0.5 font-medium">
                Automatically speaks interview questions aloud for low-literacy patients.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.audioGuidance}
                onChange={(e) => updateSetting("audioGuidance", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-12 h-6.5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5.5 after:w-5.5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>
        </div>

        {/* Section 2: Accessibility & Display */}
        <div className="glass-panel p-6 sm:p-8 space-y-6">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 border-b border-emerald-900/10 pb-3">
            <Eye className="w-5 h-5 text-emerald-700" />
            <span>Accessibility & Visuals</span>
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4.5 glass-card">
              <div>
                <h4 className="text-base font-bold text-slate-900">{t("largeText")}</h4>
                <p className="text-xs text-slate-600 mt-0.5 font-medium">
                  Optimizes base typography and touch targets for clear outdoor reading on tablets.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.largeText}
                  onChange={(e) => updateSetting("largeText", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-12 h-6.5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5.5 after:w-5.5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4.5 glass-card">
              <div>
                <h4 className="text-base font-bold text-slate-900">{t("highContrast")}</h4>
                <p className="text-xs text-slate-600 mt-0.5 font-medium">
                  Enhances borders and badges for high sunlight conditions in rural field clinics.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.highContrast}
                  onChange={(e) => updateSetting("highContrast", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-12 h-6.5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5.5 after:w-5.5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Section 3: Data Protection & Cleanup */}
        <div className="glass-panel p-6 sm:p-8 space-y-6">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 border-b border-emerald-900/10 pb-3">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
            <span>DPDP Act 2023 Compliance & Maintenance</span>
          </h3>

          <div className="glass-card-red p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-base font-extrabold text-red-950">
                {t("clearCache")}
              </h4>
              <p className="text-xs text-red-900/80 mt-0.5 font-medium">
                Safely purges cached temporary audio and draft intakes according to DPDP retention rules.
              </p>
            </div>
            <button
              onClick={clearLocalData}
              className="bg-white hover:bg-red-50 text-red-800 border border-red-300 font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap shadow-xs"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
              <span>{t("clearCache")}</span>
            </button>
          </div>
        </div>

        {/* Save Bar */}
        <div className="sticky bottom-6 glass-panel p-4 flex items-center justify-between gap-4 shadow-lg">
          <span className="text-sm font-semibold text-slate-700">
            {saved ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-5 h-5" />
                Settings updated successfully!
              </span>
            ) : (
              "Configure settings and click Save."
            )}
          </span>

          <button
            onClick={handleSaveChanges}
            className="bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold text-base px-7 py-3 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-5 h-5" />
            <span>{t("saveSettings")}</span>
          </button>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}