import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Camera,
  CheckCircle2,
  ArrowRight,
  Pill,
  Activity,
  Layers,
  Sparkles,
} from "lucide-react";
import GovHeader from "../../components/GovHeader";
import BottomNav from "../../components/BottomNav";
import { useLanguage } from "../../context/LanguageContext";

const DEMO_PRESETS = [
  {
    id: "mcp-card",
    title: "Tripura Mother & Child Protection (MCP) Card",
    fileName: "MCP_Tripura_Card_Scanned.jpg",
    date: "14-Jul-2026",
    facility: "Bishalgarh Community Health Centre",
    medicines: [
      { name: "Iron & Folic Acid (IFA)", dose: "1 tablet daily", duration: "100 days" },
      { name: "Calcium Carbonate", dose: "500 mg twice daily", duration: "Ongoing" },
      { name: "Albendazole", dose: "400 mg single dose (Deworming)", duration: "Completed" },
    ],
    labs: [
      { test: "Hemoglobin (Hb)", value: "9.4 g/dL", status: "MODERATE_ANAEMIA" },
      { test: "Blood Pressure (BP)", value: "136/86 mmHg", status: "BORDERLINE_HIGH" },
      { test: "Urine Albumin", value: "Negative (Nil)", status: "NORMAL" },
      { test: "Blood Group", value: "B Positive (Rh+)", status: "RECORDED" },
    ],
    notes: "Tetanus Toxoid TT-1 administered on 14-Jul-2026. Next TT-2 booster scheduled for 18-Aug-2026.",
  },
  {
    id: "prescription-slip",
    title: "District Hospital OPD Prescription Slip",
    fileName: "District_Hospital_Prescription_2026.pdf",
    date: "02-Aug-2026",
    facility: "Udaipur District Hospital, Gomati",
    medicines: [
      { name: "Paracetamol", dose: "650 mg as needed for fever", duration: "3 days" },
      { name: "Cetirizine", dose: "10 mg at night", duration: "5 days" },
    ],
    labs: [
      { test: "Malaria Rapid Test (RDT)", value: "Negative", status: "NORMAL" },
      { test: "Random Blood Sugar", value: "104 mg/dL", status: "NORMAL" },
    ],
    notes: "Patient advised adequate hydration and rest.",
  },
];

export default function Reports() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const fileInputRef = useRef(null);

  const [activePreset, setActivePreset] = useState(DEMO_PRESETS[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrSuccess, setOcrSuccess] = useState(true);
  const [customFileName, setCustomFileName] = useState("");

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCustomFileName(file.name);
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setOcrSuccess(true);
    }, 1200);
  };

  const handleAttachToHistory = () => {
    const savedDocs = JSON.parse(localStorage.getItem("aarogyaVaaniDocuments") || "[]");
    savedDocs.unshift(activePreset);
    localStorage.setItem("aarogyaVaaniDocuments", JSON.stringify(savedDocs));

    alert("Document OCR attached to patient chart.");
    navigate("/doctor/review");
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50/50">
      <GovHeader
        title={t("reportsTitle")}
        showBack={true}
        backPath="/dashboard"
      />

      <main className="flex-1 w-full max-w-md sm:max-w-lg mx-auto p-4 space-y-4 pb-24">
        {/* Banner Card */}
        <div className="glass-panel p-5 rounded-3xl shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="glass-card-emerald text-emerald-950 text-[10px] font-bold px-2.5 py-0.5 uppercase tracking-wider">
                Document OCR
              </span>
              <h2 className="text-xl font-black text-slate-900 mt-1">
                {t("reportsTitle")}
              </h2>
              <p className="text-xs text-slate-600 mt-1 font-medium">
                Digitize handwritten prescriptions and MCP cards for auto-extraction.
              </p>
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
            >
              <Camera className="w-4 h-4" />
              <span>{t("scanButton")}</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>

        {/* Demo Preset Selector Cards */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-slate-800">
            Sample Clinical Documents:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {DEMO_PRESETS.map((p) => (
              <div
                key={p.id}
                onClick={() => setActivePreset(p)}
                className={`cursor-pointer p-4.5 rounded-2xl transition-all flex items-start gap-3.5 ${
                  activePreset.id === p.id
                    ? "glass-card-emerald ring-2 ring-emerald-500 shadow-md"
                    : "glass-card hover:bg-white"
                }`}
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
                    activePreset.id === p.id
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-base">{p.title}</h4>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {p.fileName} • {p.date}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Processing State */}
        {isProcessing && (
          <div className="glass-panel p-8 text-center animate-fade-in">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">
              Digitizing Clinical Document...
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-medium">Extracting medications, test results, and dates...</p>
          </div>
        )}

        {/* OCR Extracted Results Cards */}
        {ocrSuccess && !isProcessing && (
          <div className="space-y-6">
            <div className="glass-panel p-6 sm:p-8 border-l-8 border-l-emerald-600">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-900/10 pb-4 mb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="glass-card-emerald text-emerald-950 text-xs px-2.5 py-0.5 font-bold">
                      ✓ OCR Extracted Successfully
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">{activePreset.date}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1">{activePreset.title}</h3>
                  <p className="text-xs text-slate-600 font-medium">🏥 {activePreset.facility}</p>
                </div>

                <div className="glass-card px-3 py-1.5 text-xs font-mono font-bold text-slate-700">
                  {customFileName || activePreset.fileName}
                </div>
              </div>

              {/* Extracted Medicines */}
              <div className="mb-6">
                <h4 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Pill className="w-5 h-5 text-emerald-700" />
                  <span>{t("extractedMeds")}</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {activePreset.medicines.map((m, idx) => (
                    <div key={idx} className="glass-card p-4">
                      <strong className="text-base text-slate-900 font-extrabold block">{m.name}</strong>
                      <div className="text-xs text-slate-600 font-medium mt-1">Dose: {m.dose}</div>
                      <div className="text-xs text-emerald-800 font-bold mt-0.5">Duration: {m.duration}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Extracted Labs */}
              <div className="mb-6">
                <h4 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-700" />
                  <span>{t("extractedLabs")}</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  {activePreset.labs.map((l, idx) => (
                    <div key={idx} className="glass-card p-4">
                      <span className="text-xs font-bold text-slate-500 uppercase">{l.test}</span>
                      <strong className="text-lg text-slate-900 font-black block mt-1">{l.value}</strong>
                      <span
                        className={`inline-block text-[11px] px-2 py-0.5 rounded-full font-bold mt-2 ${
                          l.status === "MODERATE_ANAEMIA"
                            ? "glass-card-amber text-amber-900"
                            : l.status === "BORDERLINE_HIGH"
                            ? "glass-card-red text-red-900"
                            : "glass-card-emerald text-emerald-900"
                        }`}
                      >
                        {l.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="glass-card-amber p-4 mb-6">
                <strong className="text-xs font-extrabold text-amber-950 uppercase tracking-wider">
                  Vaccines & Instructions:
                </strong>
                <p className="text-sm text-amber-950/90 mt-1 font-medium">{activePreset.notes}</p>
              </div>

              {/* Attach Button */}
              <div className="pt-3 border-t border-emerald-900/10 flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={() => navigate("/dashboard")}
                  className="glass-card hover:bg-white text-slate-700 font-bold text-sm px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-xs"
                >
                  {t("back")}
                </button>

                <button
                  onClick={handleAttachToHistory}
                  className="bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold text-base px-6 py-3 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{t("attachToChart")}</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Docked Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}