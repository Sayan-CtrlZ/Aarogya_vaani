import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
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
  Pill,
} from "lucide-react";
import {
  getAllPatients,
  getPatientById,
  updatePatientReview,
} from "../../utils/patientStore";

const QUICK_MEDS = [
  "Tab Paracetamol 650mg SOS",
  "Tab IFA 1 OD x 30 days",
  "Tab Calcium 500mg BD x 30 days",
  "ORS Sachet x 2 packets",
  "Tab Methyldopa 250mg TDS",
  "Tab Amoxicillin 500mg TDS x 5 days",
];

export default function DoctorReviewTab() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
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

  // Sync with searchParams
  useEffect(() => {
    const list = getAllPatients();
    setPatientsList(list);
    if (paramId) {
      setSelectedPatientId(paramId);
      setSearchQuery(paramId);
    }
  }, [paramId]);

  const currentPatient = useMemo(() => {
    return getPatientById(selectedPatientId) || patientsList[0] || null;
  }, [selectedPatientId, patientsList]);

  // Pre-fill doctor notes & Rx
  useEffect(() => {
    if (currentPatient) {
      if (currentPatient.doctorReview) {
        setDoctorNotes(currentPatient.doctorReview.notes || "");
        setPrescription(currentPatient.doctorReview.prescription || "");
      } else {
        if (currentPatient.triage === "Critical Red Flag") {
          setDoctorNotes(
            "High suspicion of preeclampsia. Immediate BP monitoring, USG scan, and urgent obstetrician consultation."
          );
          setPrescription(
            "Tab Methyldopa 250mg TDS (if BP > 150/100), Inj Labetalol SOS. Repeat BP in 30 mins."
          );
        } else if (currentPatient.triage === "Moderate") {
          setDoctorNotes(
            "Acute febrile illness. Order RDT Malaria and Complete Blood Count (CBC). Advise bed rest and oral fluids."
          );
          setPrescription(
            "Tab Paracetamol 650mg SOS for fever, ORS sachets x 2 packets."
          );
        } else {
          setDoctorNotes(
            "Routine antenatal checkup. Fetal heart rate and movements normal. Advise balanced nutrition."
          );
          setPrescription(
            "Tab Iron Folic Acid (IFA) 1 tab daily, Tab Calcium 500mg twice daily x 30 days."
          );
        }
      }
    }
  }, [currentPatient]);

  const handleSelectPatient = (id) => {
    setSelectedPatientId(id);
    setSearchQuery(id);
    setSearchParams({ id });
  };

  const handleAddMed = (medText) => {
    setPrescription((prev) => (prev ? `${prev}, ${medText}` : medText));
  };

  const toggleDoctorAudio = () => {
    if (!("speechSynthesis" in window) || !currentPatient) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const assistedDetail = currentPatient.assistedMode
      ? `Intake recorded by ASHA Worker ${currentPatient.assistedBy || "Kalpana Reang"}.`
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

  const handleSaveReview = () => {
    if (!currentPatient) return;

    updatePatientReview(currentPatient.id, {
      doctorName: "Dr. S. Roy (Medical Officer)",
      notes: doctorNotes,
      prescription: prescription,
    });

    const refreshed = getAllPatients();
    setPatientsList(refreshed);

    setToastMessage(`Prescription & Review saved for ${currentPatient.name} (${currentPatient.id})`);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const isUrgent =
    currentPatient?.triage === "Critical Red Flag" ||
    currentPatient?.status === "Urgent";

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-2xl font-bold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Quick Patient Selector Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">
            Select Patient:
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs w-full sm:w-auto">
            {patientsList.map((p) => {
              const isSelected = currentPatient?.id === p.id;
              const isFlagged = p.triage === "Critical Red Flag";
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectPatient(p.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-blue-700 text-white shadow-xs font-black"
                      : isFlagged
                      ? "bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100"
                      : p.status === "Reviewed"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200/80 hover:bg-emerald-100"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}
                >
                  {isFlagged && <AlertTriangle className="w-3 h-3 text-rose-500" />}
                  <span>{p.name}</span>
                  <span className="text-[10px] opacity-75 font-mono">({p.id})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Patient Lookup Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const match = getPatientById(searchQuery.trim().toUpperCase());
                if (match) {
                  handleSelectPatient(match.id);
                  setToastMessage(`Loaded patient ${match.id}`);
                  setTimeout(() => setToastMessage(""), 2500);
                }
              }
            }}
            placeholder="Jump to Patient ID (e.g. AV-9012)"
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* 2-Column Clinical Desk Layout */}
      {currentPatient ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (7 cols): Patient Case Data */}
          <div className="lg:col-span-7 space-y-5">
            {/* Patient Profile Card */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-900 flex items-center justify-center font-bold text-lg shrink-0">
                    <User className="w-6 h-6 text-blue-800" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-blue-800 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/50">
                        {currentPatient.id}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                          isUrgent
                            ? "bg-rose-100 text-rose-800 border border-rose-200"
                            : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        }`}
                      >
                        {isUrgent ? "Critical Red Flag" : "Stable Case"}
                      </span>
                    </div>
                    <h2 className="text-xl font-black text-slate-900 mt-1">
                      {currentPatient.name}
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">
                      {currentPatient.age} yrs • {currentPatient.gender} • {currentPatient.village}
                    </p>
                  </div>
                </div>

                {/* 20-Sec Audio Summary Player */}
                <button
                  type="button"
                  onClick={toggleDoctorAudio}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs ${
                    isSpeaking
                      ? "bg-rose-600 text-white animate-pulse"
                      : "bg-slate-100 hover:bg-blue-50 hover:text-blue-800 text-slate-700 border border-slate-200"
                  }`}
                  title="Listen to clinical summary audio"
                >
                  {isSpeaking ? (
                    <>
                      <VolumeX className="w-4 h-4" />
                      <span>Stop Audio</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4 text-blue-700" />
                      <span>Listen Summary</span>
                    </>
                  )}
                </button>
              </div>

              {/* Vitals Summary Strip */}
              {currentPatient.vitals && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-slate-100">
                  <div className="bg-slate-50 p-2.5 rounded-2xl text-center">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">
                      Blood Pressure
                    </span>
                    <strong
                      className={`text-xs font-black block mt-0.5 ${
                        currentPatient.vitals.bp?.includes("15") ||
                        currentPatient.vitals.bp?.includes("16")
                          ? "text-rose-600"
                          : "text-slate-800"
                      }`}
                    >
                      {currentPatient.vitals.bp || "120/80 mmHg"}
                    </strong>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-2xl text-center">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">
                      Weight / Hb
                    </span>
                    <strong className="text-xs font-black text-slate-800 block mt-0.5">
                      {currentPatient.vitals.weight || "52 kg"} • {currentPatient.vitals.hb || "11.2 g/dL"}
                    </strong>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-2xl text-center">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">
                      Fetal Rate
                    </span>
                    <strong className="text-xs font-black text-emerald-800 block mt-0.5">
                      {currentPatient.vitals.fetalHeartRate || "140 bpm"}
                    </strong>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-2xl text-center">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">
                      Intake Mode
                    </span>
                    <strong className="text-xs font-black text-slate-700 block mt-0.5">
                      {currentPatient.assistedMode ? "ASHA Assisted" : "Direct Voice"}
                    </strong>
                  </div>
                </div>
              )}
            </div>

            {/* Chief Complaint & AI Clinical Impression */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
              <div>
                <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider block mb-1.5">
                  Reported Chief Complaint:
                </span>
                <p className="text-xs font-bold text-slate-900 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/60 italic leading-relaxed">
                  "{currentPatient.chiefComplaint}"
                </p>
              </div>

              <div>
                <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider block mb-1.5">
                  AI Clinical Impression & Triage:
                </span>
                <p className="text-xs font-medium text-slate-800 bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-200/70 leading-relaxed">
                  {currentPatient.clinicalSummary}
                </p>
              </div>

              {/* Question and Answer History */}
              {currentPatient.assessmentHistory && (
                <div className="pt-2">
                  <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider block mb-2">
                    Symptom Assessment Responses ({currentPatient.assessmentHistory.length}):
                  </span>
                  <div className="space-y-2">
                    {currentPatient.assessmentHistory.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-50 p-3 rounded-2xl text-xs border border-slate-100"
                      >
                        <p className="font-semibold text-slate-600">
                          {idx + 1}. {item.question}
                        </p>
                        <p className="font-black text-slate-900 mt-1 pl-3 text-xs">
                          ↳ {item.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column (5 cols): Doctor Orders & Rx */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-blue-600/20 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-blue-700" />
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                    Doctor's Clinical Orders & Prescription
                  </h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-800">
                  Prescription (Rx)
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  Doctor's Clinical Advice:
                </label>
                <textarea
                  rows={2}
                  value={doctorNotes}
                  onChange={(e) => setDoctorNotes(e.target.value)}
                  placeholder="Clinical advice, lab tests, dietary instructions..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 resize-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5 flex items-center justify-between">
                  <span>Medicines & Dosage (Rx):</span>
                  <span className="text-[10px] text-slate-400 font-normal">Tap quick pills below</span>
                </label>
                <textarea
                  rows={3}
                  value={prescription}
                  onChange={(e) => setPrescription(e.target.value)}
                  placeholder="e.g. Tab IFA 1 daily, Tab Calcium 500mg BD x 30 days..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 resize-none transition-all"
                />

                {/* Quick Med Pills */}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {QUICK_MEDS.map((med, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAddMed(med)}
                      className="text-[10px] font-bold px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-800 border border-slate-200 transition-colors cursor-pointer"
                    >
                      + {med}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2.5">
                <button
                  type="button"
                  onClick={handleSaveReview}
                  className="w-full bg-[#0b6651] hover:bg-[#084e3e] text-white font-black text-xs sm:text-sm py-3 px-5 rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer hover:shadow-md active:scale-[0.99]"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve Review & Issue Prescription</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 px-4 rounded-2xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-slate-600" />
                  <span>Print Official Prescription Slip</span>
                </button>
              </div>
            </div>

            {/* Patient Queue List on Right */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Today's OPD Queue ({patientsList.length})
                </h4>
                <span className="text-[10px] text-slate-400 font-medium">Click to review</span>
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {patientsList.map((p) => {
                  const isCurrent = currentPatient.id === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => handleSelectPatient(p.id)}
                      className={`p-3 rounded-2xl transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isCurrent
                          ? "bg-blue-50 border border-blue-300 shadow-2xs"
                          : "bg-slate-50 hover:bg-slate-100 border border-slate-100"
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-blue-900">
                            {p.id}
                          </span>
                          <span className="font-bold text-slate-900 text-xs truncate">
                            {p.name}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {p.chiefComplaint}
                        </p>
                      </div>

                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full shrink-0 ${
                          p.triage === "Critical Red Flag"
                            ? "bg-rose-100 text-rose-800"
                            : p.status === "Reviewed"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {p.status === "Reviewed" ? "Reviewed ✓" : p.triage}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-12 text-center rounded-3xl border border-slate-200">
          <p className="text-slate-500 font-bold text-sm">No patient selected.</p>
        </div>
      )}
    </div>
  );
}
