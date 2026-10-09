import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  Stethoscope,
  CheckCircle2,
  AlertTriangle,
  Volume2,
  VolumeX,
  Printer,
  User,
  Heart,
  FileText,
  Clock,
  ArrowRight,
  ShieldCheck,
  Send,
  Pill,
} from "lucide-react";
import GovHeader from "../../components/GovHeader";
import BottomNav from "../../components/BottomNav";
import { useLanguage } from "../../context/LanguageContext";
import {
  getAllPatients,
  getPatientById,
  updatePatientReview,
} from "../../utils/patientStore";

export default function DoctorReview() {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();

  const searchParams = new URLSearchParams(location.search);
  const paramId = searchParams.get("id");

  const [patientsList, setPatientsList] = useState(() => getAllPatients());
  const [searchQuery, setSearchQuery] = useState(paramId || "");
  const [selectedPatientId, setSelectedPatientId] = useState(
    paramId || (patientsList[0] ? patientsList[0].id : "AV-8921")
  );

  const [doctorNotes, setDoctorNotes] = useState("");
  const [prescription, setPrescription] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Reload patients list on mount
  useEffect(() => {
    const list = getAllPatients();
    setPatientsList(list);
    if (paramId) {
      setSelectedPatientId(paramId);
      setSearchQuery(paramId);
    }
  }, [paramId]);

  // Selected Patient Record
  const currentPatient = useMemo(() => {
    return getPatientById(selectedPatientId) || patientsList[0] || null;
  }, [selectedPatientId, patientsList]);

  // Populate doctor inputs if patient was already reviewed
  useEffect(() => {
    if (currentPatient) {
      if (currentPatient.doctorReview) {
        setDoctorNotes(currentPatient.doctorReview.notes || "");
        setPrescription(currentPatient.doctorReview.prescription || "");
      } else {
        // Pre-fill smart doctor defaults based on symptoms
        if (currentPatient.triage === "Critical Red Flag") {
          setDoctorNotes("High suspicion of preeclampsia. Immediate BP monitoring, USG scan, and urgent obstetrician consultation.");
          setPrescription("Tab Methyldopa 250mg TDS (if BP > 150/100), Inj Labetalol SOS. Repeat BP in 30 mins.");
        } else if (currentPatient.triage === "Moderate") {
          setDoctorNotes("Acute febrile illness. Order RDT Malaria and Complete Blood Count (CBC). Advise bed rest and oral fluids.");
          setPrescription("Tab Paracetamol 650mg SOS for fever, ORS sachets x 2 packets.");
        } else {
          setDoctorNotes("Routine antenatal checkup. Fetal heart rate and movements normal. Advise balanced nutrition.");
          setPrescription("Tab Iron Folic Acid (IFA) 1 tab daily, Tab Calcium 500mg twice daily x 30 days.");
        }
      }
    }
  }, [currentPatient]);

  // Search handler by Patient ID
  const handleSearch = (e) => {
    e?.preventDefault();
    const query = searchQuery.trim().toUpperCase();
    if (!query) return;

    const match = getPatientById(query);
    if (match) {
      setSelectedPatientId(match.id);
      setToastMessage(`Patient ${match.id} loaded.`);
      setTimeout(() => setToastMessage(""), 2500);
    } else {
      alert(`No patient found with ID: "${searchQuery}". Please check the ID.`);
    }
  };

  // Audio summary read-back to the doctor
  const toggleDoctorAudio = () => {
    if (!("speechSynthesis" in window) || !currentPatient) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const assistedDetail = currentPatient.assistedMode
      ? `Intake recorded by ASHA Worker Kalpana Reang as patient was unable to use the app directly. Reason: ${currentPatient.assistedReason || "Assisted intake"}.`
      : "Direct patient intake.";

    const brief = `Patient ID: ${currentPatient.id}. Name: ${currentPatient.name}, ${currentPatient.age} years old. ${assistedDetail} Chief complaint: ${currentPatient.chiefComplaint}. AI Triage level: ${currentPatient.triage}. ${currentPatient.clinicalSummary}`;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(brief);
    utterance.lang = "en-IN";
    utterance.rate = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Save Doctor's review and prescription
  const handleSaveReview = () => {
    if (!currentPatient) return;

    updatePatientReview(currentPatient.id, {
      doctorName: "Dr. S. Roy (Medical Officer)",
      notes: doctorNotes,
      prescription: prescription,
    });

    const refreshed = getAllPatients();
    setPatientsList(refreshed);

    setToastMessage(`Prescription & Review saved for ${currentPatient.name} (${currentPatient.id}) ✓`);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const isUrgent =
    currentPatient?.triage === "Critical Red Flag" ||
    currentPatient?.status === "Urgent";

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50/50 pb-10">
      <GovHeader
        title="Doctor's Clinical Dashboard"
        showBack={true}
        backPath="/dashboard"
      />

      <main className="flex-1 w-full max-w-md sm:max-w-lg mx-auto p-4 space-y-4 pb-24">
        {toastMessage && (
          <div className="glass-card-emerald px-4 py-3 rounded-2xl flex items-center gap-2 animate-fade-in text-emerald-950 font-bold text-xs shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* 1. Patient ID Search Bar */}
        <div className="glass-panel p-4 rounded-3xl shadow-sm border border-emerald-500/30">
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            Lookup Patient by ID:
          </label>
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter Patient ID (e.g. AV-8921, AV-9012)"
                className="w-full pl-9 pr-3 py-2.5 bg-white/90 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
            <button
              type="submit"
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-xs shrink-0"
            >
              Search
            </button>
          </form>

          {/* Quick Patient Pills */}
          <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-[10px] text-slate-400 font-bold shrink-0">Recent:</span>
            {patientsList.slice(0, 4).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setSelectedPatientId(p.id);
                  setSearchQuery(p.id);
                }}
                className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold transition-all cursor-pointer shrink-0 ${
                  selectedPatientId === p.id
                    ? "bg-emerald-700 text-white shadow-2xs"
                    : p.triage === "Critical Red Flag"
                    ? "bg-rose-100 text-rose-800 border border-rose-200"
                    : "glass-card text-slate-700 hover:bg-white"
                }`}
              >
                {p.id}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Patient Clinical Summary Card */}
        {currentPatient ? (
          <div className="space-y-4">
            {/* Patient Header Card */}
            <div className="glass-panel p-4.5 rounded-3xl shadow-sm border border-white/80">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg shrink-0">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                        {currentPatient.id}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          isUrgent
                            ? "bg-rose-100 text-rose-800 border border-rose-200"
                            : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        }`}
                      >
                        {isUrgent ? "Critical Red Flag" : "Stable"}
                      </span>
                    </div>
                    <h2 className="text-lg font-black text-slate-900 mt-1">
                      {currentPatient.name}
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">
                      {currentPatient.age} yrs • {currentPatient.gender} • {currentPatient.village}
                    </p>
                    <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-extrabold uppercase text-emerald-900 bg-emerald-100/90 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <span>👩‍⚕️</span>
                        <span>{currentPatient.assistedMode ? (currentPatient.assistedBy || "ASHA Assisted") : "Direct Intake"}</span>
                      </span>
                      <span className="text-[10px] font-medium text-slate-500 truncate max-w-[220px]">
                        {currentPatient.assistedReason || (currentPatient.assistedMode ? "Field Proxy (Patient unable to use app)" : "Direct Patient")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 20-sec Audio Brief button */}
                <button
                  type="button"
                  onClick={toggleDoctorAudio}
                  className={`p-2.5 rounded-xl transition-all cursor-pointer shadow-xs ${
                    isSpeaking
                      ? "bg-rose-600 text-white animate-pulse"
                      : "glass-card hover:bg-white text-emerald-800"
                  }`}
                  title="Audio Summary"
                >
                  {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>

              {/* Vitals Bar */}
              {currentPatient.vitals && (
                <div className="grid grid-cols-3 gap-2 mt-3.5 pt-3 border-t border-slate-100 text-center">
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">BP</span>
                    <strong
                      className={`text-xs font-black block mt-0.5 ${
                        currentPatient.vitals.bp?.includes("15") ? "text-rose-600 font-bold" : "text-slate-800"
                      }`}
                    >
                      {currentPatient.vitals.bp}
                    </strong>
                  </div>

                  <div className="bg-slate-50 p-2 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Weight / Hb</span>
                    <strong className="text-xs font-black text-slate-800 block mt-0.5">
                      {currentPatient.vitals.weight || "—"} • {currentPatient.vitals.hb || "—"}
                    </strong>
                  </div>

                  <div className="bg-slate-50 p-2 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Fetal Rate</span>
                    <strong className="text-xs font-black text-emerald-800 block mt-0.5">
                      {currentPatient.vitals.fetalHeartRate || "Normal"}
                    </strong>
                  </div>
                </div>
              )}
            </div>

            {/* Chief Complaint & AI Assessment */}
            <div className="glass-panel p-4.5 rounded-3xl shadow-sm space-y-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                  Reported Chief Complaint:
                </span>
                <p className="text-xs font-bold text-slate-900 bg-white/80 p-3 rounded-xl border border-slate-100 italic leading-relaxed">
                  "{currentPatient.chiefComplaint}"
                </p>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                  AI Clinical Impression (Summary):
                </span>
                <p className="text-xs font-medium text-slate-700 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100 leading-relaxed">
                  {currentPatient.clinicalSummary}
                </p>
              </div>

              {/* Q&A Assessment Details */}
              {currentPatient.assessmentHistory && currentPatient.assessmentHistory.length > 0 && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1.5">
                    Patient Answers to Doctor Questions:
                  </span>
                  <div className="space-y-1.5">
                    {currentPatient.assessmentHistory.map((item, idx) => (
                      <div key={idx} className="bg-slate-50 p-2.5 rounded-xl text-[11px]">
                        <p className="font-semibold text-slate-600">
                          {idx + 1}. {item.question}
                        </p>
                        <p className="font-black text-slate-900 mt-0.5 pl-3">
                          ↳ {item.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 3. Doctor Action Panel (Clinical Notes & Rx) */}
            <div className="glass-panel p-4.5 rounded-3xl shadow-md border border-emerald-500/30 space-y-3.5">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <Stethoscope className="w-4 h-4 text-emerald-700" />
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Doctor's Plan & Prescription
                </h3>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Clinical Advice / Orders:
                </label>
                <textarea
                  rows={2}
                  value={doctorNotes}
                  onChange={(e) => setDoctorNotes(e.target.value)}
                  placeholder="Doctor's clinical advice, diet, lab tests..."
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 resize-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Pill className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Prescription (Rx):</span>
                </label>
                <textarea
                  rows={2}
                  value={prescription}
                  onChange={(e) => setPrescription(e.target.value)}
                  placeholder="e.g. Tab IFA 1 OD x 30 days, Tab Calcium 500mg BD..."
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 resize-none font-mono"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleSaveReview}
                  className="w-full bg-[#0b6651] hover:bg-[#074738] text-white font-extrabold text-xs py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:shadow-lg"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve Summary & Issue Prescription</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-full glass-card hover:bg-white text-slate-700 font-bold text-xs py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-4 h-4 text-slate-600" />
                  <span>Print Doctor Prescription Slip</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-panel p-8 text-center rounded-3xl">
            <p className="text-slate-500 font-bold text-sm">No patient selected.</p>
          </div>
        )}

        {/* 4. Complete Patient Queue */}
        <div className="glass-panel p-4 rounded-3xl shadow-sm">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 px-1">
            All Registered Patients ({patientsList.length})
          </h3>
          <div className="space-y-2">
            {patientsList.map((p) => (
              <div
                key={p.id}
                onClick={() => {
                  setSelectedPatientId(p.id);
                  setSearchQuery(p.id);
                }}
                className={`p-3 rounded-2xl transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  selectedPatientId === p.id
                    ? "bg-emerald-50 border border-emerald-300 shadow-2xs"
                    : "glass-card hover:bg-white"
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-emerald-800">
                      {p.id}
                    </span>
                    <h4 className="font-bold text-slate-900 text-xs truncate">
                      {p.name}
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {p.chiefComplaint || p.category}
                  </p>
                </div>

                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0 ${
                    p.triage === "Critical Red Flag"
                      ? "bg-rose-100 text-rose-800"
                      : p.status === "Reviewed"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {p.status === "Reviewed" ? "Reviewed ✓" : p.triage || "Pending"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Docked Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}