import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Settings,
  Volume2,
  Globe,
  Bell,
  Shield,
  Smartphone,
  Eye,
  CheckCircle2,
  RotateCcw,
  Sliders,
  Radio,
  Lock,
  MessageSquare,
  ShieldCheck,
  WifiOff,
  Sparkles,
  ChevronRight,
  Info,
} from "lucide-react";
import PatientSidebar from "../../components/PatientSidebar";
import PatientHeader from "../../components/PatientHeader";
import { useLanguage } from "../../context/LanguageContext";
import { getCurrentPatient } from "../../utils/patientStore";

const SETTINGS_STORAGE_KEY = "aarogyaVaaniPatientSettings";

const DEFAULT_SETTINGS = {
  // 1. Spoken Voice & Vernacular Language
  primaryLanguage: "en",
  voiceNarration: true,
  voiceSpeed: "1.0",
  voiceInputSensitivity: "high",

  // 2. Notifications & OPD Alerts
  whatsappAlerts: true,
  smsReminders: true,
  doctorReviewAlert: true,

  // 3. ABDM & DPDP Consent Privacy
  defaultAccessDuration: "24h",
  emergencyCasualtyAccess: true,
  shareWithAbdmRegistry: true,

  // 4. Accessibility & Rural Connectivity
  highContrastMode: false,
  largeTextMode: false,
  lowBandwidthMode: false,

  // 5. Account Security
  quickPinEnabled: false,
  quickPin: "",
};

export default function PatientSettingsPage() {
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();
  const patient = getCurrentPatient() || {};

  // Sidebar drag & resize state
  const [leftWidth, setLeftWidth] = useState(240);
  const [isDraggingLeft, setIsDraggingLeft] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem("aarogya_sidebar_collapsed") === "true";
    } catch {
      return false;
    }
  });

  // Settings state
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch {
      // fallback
    }
    return DEFAULT_SETTINGS;
  });

  // Active Category Section
  const [activeTab, setActiveTab] = useState("voice");
  const [toastMessage, setToastMessage] = useState("");
  const [showClearCacheModal, setShowClearCacheModal] = useState(false);

  // Handle window mouse events for sidebar dragging
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDraggingLeft) {
        const newWidth = Math.min(420, Math.max(180, e.clientX));
        setLeftWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      if (isDraggingLeft) {
        setIsDraggingLeft(false);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      }
    };

    if (isDraggingLeft) {
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingLeft]);

  // Persist settings changes
  const updateSetting = (key, value) => {
    setSettings((prev) => {
      const updated = { ...prev, [key]: value };
      try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error("Failed to save settings:", err);
      }
      return updated;
    });

    // If changing language, synchronize with global LanguageContext
    if (key === "primaryLanguage") {
      setLanguage(value);
    }

    showToast("Setting updated");
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 2400);
  };

  const handleResetDefaults = () => {
    setSettings(DEFAULT_SETTINGS);
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
      setLanguage("en");
    } catch (err) {
      console.error(err);
    }
    showToast("Settings reset to defaults");
  };

  const handleClearCache = () => {
    try {
      sessionStorage.clear();
      showToast("Offline voice cache cleared successfully");
      setShowClearCacheModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const tabs = [
    { id: "voice", label: "Voice & Language", icon: Volume2, desc: "Audio guidance, read-aloud & dialect" },
    { id: "notifications", label: "Notifications & Alerts", icon: Bell, desc: "WhatsApp OPD tokens & SMS" },
    { id: "privacy", label: "ABDM & Data Privacy", icon: Shield, desc: "DPDP consent, doctor passcodes & emergency access" },
    { id: "accessibility", label: "Display & Network", icon: Eye, desc: "Contrast, large text & 2G data saver" },
    { id: "security", label: "Security & Sessions", icon: Smartphone, desc: "Quick PIN & active devices" },
  ];

  return (
    <div className="h-screen w-screen bg-[#f8fafc] dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex flex-col overflow-hidden font-sans antialiased select-none">
      {/* 1. UNIVERSAL TOP HEADER */}
      <PatientHeader />

      {/* 2. BODY CONTAINER */}
      <div className="flex-1 flex flex-row min-h-0 overflow-hidden gap-0">
        {/* UNIVERSAL LEFT SIDEBAR */}
        <PatientSidebar
          activeNav="settings"
          width={leftWidth}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />

        {/* Resizer Handle */}
        {!isCollapsed && (
          <div
            onMouseDown={() => setIsDraggingLeft(true)}
            onDoubleClick={() => setLeftWidth(240)}
            className="w-1 cursor-col-resize hover:w-1.5 hover:bg-emerald-500/25 transition-all relative z-20 select-none"
            title="Drag to resize sidebar (Double-click to reset)"
          />
        )}

        {/* ============================================================================== */}
        {/* 2. SETTINGS CONSOLE MAIN VIEW                                                  */}
        {/* ============================================================================== */}
        <main className="flex-1 h-full bg-white dark:bg-slate-900 overflow-hidden flex flex-col min-w-0">
          {/* Header Bar */}
          <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-slate-100 text-slate-700">
                  Patient Preferences
                </span>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs text-slate-500">AarogyaVaani Portal</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1">
                Account & System Settings
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure voice feedback, OPD notification channels, ABDM data consent, and network modes.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleResetDefaults}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs font-semibold transition cursor-pointer"
                title="Reset all settings to factory default"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Defaults</span>
              </button>
            </div>
          </div>

          {/* Toast Notification */}
          {toastMessage && (
            <div className="bg-emerald-50 border-b border-emerald-100 px-4 py-2 text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Settings Body: 2-Column Desktop Layout */}
          <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
            {/* Left Nav List */}
            <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-100 p-3 space-y-1 overflow-y-auto shrink-0 bg-slate-50/50">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition cursor-pointer ${
                      isActive
                        ? "bg-white text-slate-900 shadow-2xs border border-slate-200/80 font-bold"
                        : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
                    }`}
                  >
                    <div
                      className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                        isActive ? "bg-[#e8f8f0] text-[#059669]" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-xs leading-tight ${isActive ? "font-bold text-slate-900" : "font-medium"}`}>
                        {tab.label}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5 leading-tight truncate">
                        {tab.desc}
                      </p>
                    </div>
                  </button>
                );
              })}

              <div className="pt-4 mt-4 border-t border-slate-200/70 px-2.5">
                <div className="bg-white rounded-xl border border-slate-200 p-2.5 text-[11px] text-slate-600">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#059669]" />
                    <span>DPDP Act 2023</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                    You have full right to revoke doctor consent, download data logs, or purge local voice caches anytime.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Content Pane */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6">
              {/* ============================================================== */}
              {/* TAB 1: VOICE & VERNACULAR LANGUAGE                             */}
              {/* ============================================================== */}
              {activeTab === "voice" && (
                <div className="space-y-6 max-w-2xl">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Voice & Spoken Language Preferences</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Designed for hands-free and voice-guided rural healthcare delivery.
                    </p>
                  </div>

                  {/* Primary Language */}
                  <div className="bg-slate-50/70 rounded-2xl border border-slate-200/80 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xs font-bold text-slate-800">Application Language</h3>
                        <p className="text-[11px] text-slate-500">Interface and voice prompt dialect</p>
                      </div>
                      <Globe className="w-4 h-4 text-slate-400" />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { code: "en", label: "English", sub: "Standard Indian" },
                        { code: "bn", label: "বাংলা (Bengali)", sub: "ত্রিপুরা ও বাংলা" },
                        { code: "hi", label: "हिंदी (Hindi)", sub: "राष्ट्रीय भाषा" },
                      ].map((item) => (
                        <button
                          key={item.code}
                          onClick={() => updateSetting("primaryLanguage", item.code)}
                          className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                            settings.primaryLanguage === item.code
                              ? "bg-white border-[#059669] ring-2 ring-[#059669]/10 text-slate-900 font-bold"
                              : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                          }`}
                        >
                          <p className="text-xs">{item.label}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5 font-normal">{item.sub}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Audio Narration Toggle */}
                  <div className="bg-slate-50/70 rounded-2xl border border-slate-200/80 p-4 flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xs font-bold text-slate-800">Spoken Prescription & Advice Narration</h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Automatically speak out doctor advice and dosage schedules in your chosen language when opened.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={settings.voiceNarration}
                        onChange={(e) => updateSetting("voiceNarration", e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:width-5 after:transition-all peer-checked:bg-[#059669]"></div>
                    </label>
                  </div>

                  {/* Voice Speed Selection */}
                  <div className="bg-slate-50/70 rounded-2xl border border-slate-200/80 p-4 space-y-3">
                    <h3 className="text-xs font-bold text-slate-800">Voice Narration Speed</h3>
                    <p className="text-[11px] text-slate-500">
                      Slower speeds are recommended for elderly citizens or medical instructions.
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { val: "0.8", label: "0.8x Slower", desc: "Clear & distinct" },
                        { val: "1.0", label: "1.0x Normal", desc: "Standard speech" },
                        { val: "1.2", label: "1.2x Faster", desc: "Quick playback" },
                      ].map((s) => (
                        <button
                          key={s.val}
                          onClick={() => updateSetting("voiceSpeed", s.val)}
                          className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                            settings.voiceSpeed === s.val
                              ? "bg-white border-[#059669] text-[#059669] font-bold"
                              : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                          }`}
                        >
                          <span className="text-xs">{s.label}</span>
                          <span className="block text-[10px] text-slate-400 font-normal">{s.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Microphone Input Sensitivity */}
                  <div className="bg-slate-50/70 rounded-2xl border border-slate-200/80 p-4 flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xs font-bold text-slate-800">Microphone Background Noise Suppression</h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        High filtering cleans ambient marketplace or village noise during AI doctor voice check-ins.
                      </p>
                    </div>
                    <select
                      value={settings.voiceInputSensitivity}
                      onChange={(e) => updateSetting("voiceInputSensitivity", e.target.value)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 outline-none focus:border-[#059669] cursor-pointer"
                    >
                      <option value="high">High Filtering (Outdoor/Rural)</option>
                      <option value="normal">Standard (Quiet Room)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* ============================================================== */}
              {/* TAB 2: NOTIFICATIONS & ALERTS                                  */}
              {/* ============================================================== */}
              {activeTab === "notifications" && (
                <div className="space-y-6 max-w-2xl">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Notifications & Clinical Alerts</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Direct delivery channels to your phone ({patient.phone || "+91 98621 00000"}).
                    </p>
                  </div>

                  {/* WhatsApp Alerts */}
                  <div className="bg-slate-50/70 rounded-2xl border border-slate-200/80 p-4 flex items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-slate-800">WhatsApp OPD Token & Prescription Slips</h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Receive official OPD queue slips (e.g., OPD-42) and doctor summary cards directly on WhatsApp.
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={settings.whatsappAlerts}
                        onChange={(e) => updateSetting("whatsappAlerts", e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:width-5 after:transition-all peer-checked:bg-[#059669]"></div>
                    </label>
                  </div>

                  {/* SMS Medication Reminders */}
                  <div className="bg-slate-50/70 rounded-2xl border border-slate-200/80 p-4 flex items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Bell className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-slate-800">Daily Medication SMS Reminders</h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Sends short SMS alerts for scheduled daily doses (e.g., morning IFA or BP medication).
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={settings.smsReminders}
                        onChange={(e) => updateSetting("smsReminders", e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:width-5 after:transition-all peer-checked:bg-[#059669]"></div>
                    </label>
                  </div>

                  {/* Doctor Review Notification */}
                  <div className="bg-slate-50/70 rounded-2xl border border-slate-200/80 p-4 flex items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-slate-800">Doctor Clinical Review Notification</h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Get notified as soon as a government Medical Officer approves and signs your intake note.
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={settings.doctorReviewAlert}
                        onChange={(e) => updateSetting("doctorReviewAlert", e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:width-5 after:transition-all peer-checked:bg-[#059669]"></div>
                    </label>
                  </div>
                </div>
              )}

              {/* ============================================================== */}
              {/* TAB 3: ABDM & DATA PRIVACY                                     */}
              {/* ============================================================== */}
              {activeTab === "privacy" && (
                <div className="space-y-6 max-w-2xl">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">ABDM & Data Privacy Governance</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Compliant with India's Digital Personal Data Protection (DPDP) Act 2023.
                    </p>
                  </div>

                  {/* Default Access Window */}
                  <div className="bg-slate-50/70 rounded-2xl border border-slate-200/80 p-4 space-y-3">
                    <h3 className="text-xs font-bold text-slate-800">Default Doctor Passcode Validity</h3>
                    <p className="text-[11px] text-slate-500">
                      When generating a 6-digit Doctor Passcode on the Share page, automatically expire access after:
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { val: "1h", label: "1 Hour", desc: "Short clinic desk visit" },
                        { val: "24h", label: "24 Hours", desc: "Full-day OPD review" },
                        { val: "7d", label: "7 Days", desc: "Weekly inpatient follow-up" },
                      ].map((item) => (
                        <button
                          key={item.val}
                          onClick={() => updateSetting("defaultAccessDuration", item.val)}
                          className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                            settings.defaultAccessDuration === item.val
                              ? "bg-white border-[#059669] text-[#059669] font-bold"
                              : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                          }`}
                        >
                          <span className="text-xs">{item.label}</span>
                          <span className="block text-[10px] text-slate-400 font-normal">{item.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Emergency Casualty Access */}
                  <div className="bg-slate-50/70 rounded-2xl border border-slate-200/80 p-4 flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-xs font-bold text-slate-800">Emergency Casualty Doctor Access</h3>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800">
                          Recommended
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Permit verified government casualty doctors (CHC/PHC) to view critical allergies & blood group in life-threatening trauma without passcode.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={settings.emergencyCasualtyAccess}
                        onChange={(e) => updateSetting("emergencyCasualtyAccess", e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:width-5 after:transition-all peer-checked:bg-[#059669]"></div>
                    </label>
                  </div>

                  {/* ABDM Registry Link */}
                  <div className="bg-slate-50/70 rounded-2xl border border-slate-200/80 p-4 flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xs font-bold text-slate-800">Ayushman Bharat ABDM Registry Synchronization</h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Synchronizes authenticated health records with ABHA Address <span className="font-mono text-slate-700">91-4820-9182-3810</span>.
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Linked</span>
                    </div>
                  </div>

                  {/* Clear Offline Cache */}
                  <div className="border border-red-200/80 rounded-2xl p-4 bg-red-50/30 flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xs font-bold text-red-900">Clear Local Offline Voice Cache</h3>
                      <p className="text-[11px] text-red-700 mt-0.5">
                        Purges locally stored temporary audio recordings from browser memory to free phone storage.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowClearCacheModal(true)}
                      className="px-3 py-1.5 rounded-xl border border-red-300 bg-white hover:bg-red-50 text-red-700 text-xs font-bold transition shrink-0 cursor-pointer"
                    >
                      Clear Cache
                    </button>
                  </div>
                </div>
              )}

              {/* ============================================================== */}
              {/* TAB 4: DISPLAY & RURAL CONNECTIVITY                            */}
              {/* ============================================================== */}
              {activeTab === "accessibility" && (
                <div className="space-y-6 max-w-2xl">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Display & Rural Connectivity</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Optimizations for outdoor mobile screens and weak 2G/3G network conditions in Tripura.
                    </p>
                  </div>

                  {/* Low Bandwidth Mode */}
                  <div className="bg-slate-50/70 rounded-2xl border border-slate-200/80 p-4 flex items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#059669] flex items-center justify-center shrink-0 mt-0.5">
                        <WifiOff className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-xs font-bold text-slate-800">2G / 3G Rural Low Bandwidth Mode</h3>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">
                            Recommended
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Disables heavy asset preloading and compresses clinical report images for fast loading on poor connections.
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={settings.lowBandwidthMode}
                        onChange={(e) => updateSetting("lowBandwidthMode", e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:width-5 after:transition-all peer-checked:bg-[#059669]"></div>
                    </label>
                  </div>

                  {/* High Contrast Mode */}
                  <div className="bg-slate-50/70 rounded-2xl border border-slate-200/80 p-4 flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xs font-bold text-slate-800">High Contrast Sunlight Mode</h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Increases text contrast and border definitions for clear visibility under direct outdoor sunlight in rural areas.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={settings.highContrastMode}
                        onChange={(e) => updateSetting("highContrastMode", e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:width-5 after:transition-all peer-checked:bg-[#059669]"></div>
                    </label>
                  </div>

                  {/* Large Text Mode */}
                  <div className="bg-slate-50/70 rounded-2xl border border-slate-200/80 p-4 flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xs font-bold text-slate-800">Enhanced Font Size (Senior Citizen Mode)</h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Scales typography up across doctor advice, dosage amounts, and token numbers for easy reading.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={settings.largeTextMode}
                        onChange={(e) => updateSetting("largeTextMode", e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:width-5 after:transition-all peer-checked:bg-[#059669]"></div>
                    </label>
                  </div>
                </div>
              )}

              {/* ============================================================== */}
              {/* TAB 5: SECURITY & ACTIVE SESSIONS                              */}
              {/* ============================================================== */}
              {activeTab === "security" && (
                <div className="space-y-6 max-w-2xl">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Security & Active Sessions</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Device security when mobile phones are shared among household family members.
                    </p>
                  </div>

                  {/* 4-Digit Quick PIN */}
                  <div className="bg-slate-50/70 rounded-2xl border border-slate-200/80 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xs font-bold text-slate-800">4-Digit App Passcode Lock</h3>
                        <p className="text-[11px] text-slate-500">
                          Requires a 4-digit PIN to open personal medical records and test reports.
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={settings.quickPinEnabled}
                          onChange={(e) => updateSetting("quickPinEnabled", e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:width-5 after:transition-all peer-checked:bg-[#059669]"></div>
                      </label>
                    </div>

                    {settings.quickPinEnabled && (
                      <div className="pt-2 border-t border-slate-200/70 flex items-center gap-3">
                        <Lock className="w-4 h-4 text-slate-400" />
                        <input
                          type="password"
                          maxLength={4}
                          value={settings.quickPin}
                          onChange={(e) => updateSetting("quickPin", e.target.value.replace(/\D/g, ""))}
                          placeholder="Set 4-digit PIN (e.g. 1234)"
                          className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-mono tracking-widest outline-none focus:border-[#059669]"
                        />
                        <span className="text-[10px] text-slate-400">4 numbers only</span>
                      </div>
                    )}
                  </div>

                  {/* Active Devices */}
                  <div className="bg-slate-50/70 rounded-2xl border border-slate-200/80 p-4 space-y-3">
                    <h3 className="text-xs font-bold text-slate-800">Active Login Sessions</h3>
                    <div className="bg-white rounded-xl border border-slate-200 p-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#059669] flex items-center justify-center font-bold text-xs">
                          <Smartphone className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">Current Web Session · Tripura, IN</p>
                          <p className="text-[10px] text-slate-400">Encrypted ABHA Gateway · Active now</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        This Device
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Clear Cache Confirmation Modal */}
      {showClearCacheModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 max-w-sm w-full space-y-4 shadow-xl animate-in fade-in">
            <h3 className="text-sm font-bold text-slate-900">Clear Offline Audio Cache?</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              This will remove temporary audio recordings cached in this browser. Your medical records, prescriptions, and ABHA ID are stored safely and will NOT be deleted.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowClearCacheModal(false)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleClearCache}
                className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Confirm Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
