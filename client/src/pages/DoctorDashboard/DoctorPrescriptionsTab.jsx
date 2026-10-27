import React, { useState, useMemo } from "react";
import { 
  Search, Filter, Plus, FileText, Pill, Printer, Download, 
  CheckCircle2, AlertCircle, ChevronRight, ArrowLeft, Trash2, 
  Save, Activity, Clock, ShieldCheck, UserCheck, Stethoscope,
  X, Check, AlertTriangle
} from "lucide-react";

// --- MOCK DATA FOR PRESCRIPTIONS ---
const INITIAL_RECENT_PRESCRIPTIONS = [
  {
    id: "RX-2026-9921",
    patientName: "Mamta Debbarma",
    patientId: "AV-2026-8921",
    date: "27 Oct 2026",
    time: "10:45 AM",
    diagnosis: "Mild Viral URI, Pregnancy (20w)",
    medicationsCount: 3,
    medications: [
      { name: "Tab Paracetamol 650mg", dosage: "1 Tab", frequency: "1-0-1", duration: "5 Days", instructions: "After food" },
      { name: "Tab Iron Folic Acid (IFA)", dosage: "1 Tab", frequency: "0-1-0", duration: "30 Days", instructions: "After lunch" },
      { name: "Tab Calcium 500mg", dosage: "1 Tab", frequency: "1-0-0", duration: "30 Days", instructions: "Morning with water" }
    ],
    status: "SIGNED",
    doctor: "Dr. S. Roy (ABDM-9941-TR)"
  },
  {
    id: "RX-2026-9920",
    patientName: "Hare Krishna",
    patientId: "AV-2026-7316",
    date: "27 Oct 2026",
    time: "09:55 AM",
    diagnosis: "Essential Hypertension",
    medicationsCount: 2,
    medications: [
      { name: "Tab Amlodipine 5mg", dosage: "1 Tab", frequency: "1-0-0", duration: "30 Days", instructions: "Morning before breakfast" },
      { name: "Tab Telmisartan 40mg", dosage: "1 Tab", frequency: "0-0-1", duration: "30 Days", instructions: "Bedtime" }
    ],
    status: "SIGNED",
    doctor: "Dr. S. Roy (ABDM-9941-TR)"
  },
  {
    id: "RX-2026-9919",
    patientName: "Bappaditya Paul",
    patientId: "AV-2026-4454",
    date: "27 Oct 2026",
    time: "09:30 AM",
    diagnosis: "General Health Check & Seasonal Allergy",
    medicationsCount: 1,
    medications: [
      { name: "Tab Cetirizine 10mg", dosage: "1 Tab", frequency: "0-0-1", duration: "5 Days", instructions: "At night" }
    ],
    status: "DRAFT",
    doctor: "Dr. S. Roy (ABDM-9941-TR)"
  },
  {
    id: "RX-2026-9882",
    patientName: "Sunita Das",
    patientId: "AV-2026-2103",
    date: "26 Oct 2026",
    time: "04:15 PM",
    diagnosis: "Postnatal Hypertension (Review)",
    medicationsCount: 4,
    medications: [
      { name: "Tab Labetalol 100mg", dosage: "1 Tab", frequency: "1-0-1", duration: "14 Days", instructions: "Monitor BP weekly" },
      { name: "Tab Calcium 500mg", dosage: "1 Tab", frequency: "1-0-0", duration: "30 Days", instructions: "With water" },
      { name: "Cap Omeprazole 20mg", dosage: "1 Cap", frequency: "1-0-0", duration: "10 Days", instructions: "Empty stomach" },
      { name: "ORS Sachet", dosage: "1 Packet", frequency: "SOS", duration: "3 Days", instructions: "In 1L boiled water" }
    ],
    status: "SIGNED",
    doctor: "Dr. S. Roy (ABDM-9941-TR)"
  }
];

const FORMULARY_DB = [
  { id: "D001", name: "Tab Paracetamol 650mg", type: "Tablet", category: "Analgesic / Antipyretic", stock: "In Stock" },
  { id: "D002", name: "Tab Iron Folic Acid (IFA)", type: "Tablet", category: "Maternal Supplement", stock: "In Stock" },
  { id: "D003", name: "Tab Calcium 500mg", type: "Tablet", category: "Maternal Supplement", stock: "In Stock" },
  { id: "D004", name: "Syp Amoxicillin 250mg/5ml", type: "Syrup", category: "Pediatric Antibiotic", stock: "In Stock" },
  { id: "D005", name: "Cap Omeprazole 20mg", type: "Capsule", category: "Antacid / PPI", stock: "In Stock" },
  { id: "D006", name: "ORS Sachet (WHO Formula)", type: "Powder", category: "Electrolyte / Dehydration", stock: "In Stock" },
  { id: "D007", name: "Tab Metformin 500mg", type: "Tablet", category: "Antidiabetic", stock: "In Stock" },
  { id: "D008", name: "Tab Amlodipine 5mg", type: "Tablet", category: "Antihypertensive", stock: "In Stock" },
  { id: "D009", name: "Tab Azithromycin 500mg", type: "Tablet", category: "Broad Spectrum Antibiotic", stock: "In Stock" },
  { id: "D010", name: "Inj Magnesium Sulfate 50%", type: "Injectable", category: "Emergency Obstetric", stock: "Emergency Reserve" },
];

export default function DoctorPrescriptionsTab() {
  const [view, setView] = useState("LIST"); // 'LIST' | 'BUILDER' | 'VIEW'
  const [subTab, setSubTab] = useState("recent"); // 'recent' | 'templates' | 'formulary'
  const [searchQuery, setSearchQuery] = useState("");
  const [prescriptions, setPrescriptions] = useState(INITIAL_RECENT_PRESCRIPTIONS);
  const [viewingRx, setViewingRx] = useState(null);

  // Builder State
  const [patientName, setPatientName] = useState("Mamta Debbarma");
  const [patientId, setPatientId] = useState("AV-2026-8921");
  const [clinicalDiagnosis, setClinicalDiagnosis] = useState("Mild Viral URI");
  const [formularySearch, setFormularySearch] = useState("");
  const [selectedMeds, setSelectedMeds] = useState([
    {
      id: "D001",
      name: "Tab Paracetamol 650mg",
      type: "Tablet",
      dosage: "1 Tab",
      frequency: "1-0-1",
      duration: "5 Days",
      instructions: "After meals"
    }
  ]);
  const [isSigning, setIsSigning] = useState(false);
  const [signSuccessMessage, setSignSuccessMessage] = useState(false);

  const handleAddMedication = (med) => {
    if (!selectedMeds.find((m) => m.id === med.id)) {
      setSelectedMeds([
        ...selectedMeds,
        {
          ...med,
          dosage: med.type === "Syrup" ? "5 ml" : med.type === "Powder" ? "1 Sachet" : "1 Tab",
          frequency: "1-0-1",
          duration: "5 Days",
          instructions: "After meals"
        }
      ]);
    }
  };

  const handleUpdateMed = (id, field, value) => {
    setSelectedMeds(
      selectedMeds.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const handleRemoveMed = (id) => {
    setSelectedMeds(selectedMeds.filter((m) => m.id !== id));
  };

  const handleSignIssue = () => {
    setIsSigning(true);
    setTimeout(() => {
      const newRx = {
        id: `RX-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        patientName: patientName,
        patientId: patientId,
        date: "27 Oct 2026",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        diagnosis: clinicalDiagnosis,
        medicationsCount: selectedMeds.length,
        medications: [...selectedMeds],
        status: "SIGNED",
        doctor: "Dr. S. Roy (ABDM-9941-TR)"
      };

      setPrescriptions([newRx, ...prescriptions]);
      setIsSigning(false);
      setSignSuccessMessage(true);
      setTimeout(() => {
        setSignSuccessMessage(false);
        setView("LIST");
        setSelectedMeds([]);
      }, 1200);
    }, 1200);
  };

  const filteredPrescriptions = useMemo(() => {
    return prescriptions.filter((rx) => {
      const q = searchQuery.toLowerCase();
      return (
        rx.id.toLowerCase().includes(q) ||
        rx.patientName.toLowerCase().includes(q) ||
        rx.patientId.toLowerCase().includes(q) ||
        rx.diagnosis.toLowerCase().includes(q)
      );
    });
  }, [prescriptions, searchQuery]);

  const filteredFormulary = useMemo(() => {
    return FORMULARY_DB.filter((med) => {
      const q = formularySearch.toLowerCase();
      return (
        med.name.toLowerCase().includes(q) ||
        med.category.toLowerCase().includes(q) ||
        med.type.toLowerCase().includes(q)
      );
    });
  }, [formularySearch]);

  const handlePrint = (rx) => {
    window.print();
  };

  return (
    <div className="h-full flex flex-col overflow-y-auto space-y-6 text-slate-900 dark:text-slate-100 font-sans selection:bg-emerald-100 dark:selection:bg-emerald-950">
      
      {/* SUCCESS TOAST */}
      {signSuccessMessage && (
        <div className="fixed top-20 right-8 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
          <ShieldCheck className="w-5 h-5 text-white" />
          <span className="text-sm font-semibold">Prescription Cryptographically Signed & ABDM Synced!</span>
        </div>
      )}

      {/* --- LIST VIEW --- */}
      {view === "LIST" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600">
                  <Pill size={20} />
                </span>
                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Prescriptions Vault
                </h1>
              </div>
              <p className="text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                Manage digitally-signed e-prescriptions, CHC formulary, and ABDM FHIR compliant medicine slips.
              </p>
            </div>
            <button 
              onClick={() => setView("BUILDER")}
              className="bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <Plus size={16} strokeWidth={2.5} /> Create e-Prescription
            </button>
          </div>

          {/* Toolbar */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4 p-4 items-center justify-between shadow-xs">
            <div className="flex w-full md:w-auto bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700">
              <button 
                onClick={() => setSubTab("recent")}
                className={`px-4 py-1.5 text-xs md:text-sm font-bold rounded-lg transition-all ${
                  subTab === "recent"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs border border-slate-200/50 dark:border-slate-700"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                Recent Vault ({prescriptions.length})
              </button>
              <button 
                onClick={() => setSubTab("formulary")}
                className={`px-4 py-1.5 text-xs md:text-sm font-bold rounded-lg transition-all ${
                  subTab === "formulary"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs border border-slate-200/50 dark:border-slate-700"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                CHC Formulary ({FORMULARY_DB.length})
              </button>
            </div>

            <div className="relative w-full md:w-80">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text"
                placeholder="Search by Rx ID or Patient..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs md:text-sm font-medium focus:outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* SubTab Content */}
          {subTab === "recent" ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="px-6 py-3.5 font-bold text-slate-500 text-xs uppercase tracking-wider">Rx Identity</th>
                      <th className="px-6 py-3.5 font-bold text-slate-500 text-xs uppercase tracking-wider">Patient Details</th>
                      <th className="px-6 py-3.5 font-bold text-slate-500 text-xs uppercase tracking-wider">Clinical Diagnosis</th>
                      <th className="px-6 py-3.5 font-bold text-slate-500 text-xs uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3.5 font-bold text-slate-500 text-xs uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredPrescriptions.map((rx) => (
                      <tr key={rx.id} className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 w-fit">
                              {rx.id}
                            </span>
                            <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                              <Clock size={12} /> {rx.date} · {rx.time}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-semibold text-slate-900 dark:text-white">{rx.patientName}</span>
                            <span className="font-mono text-[10px] text-slate-500">{rx.patientId}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate max-w-[240px]">
                              {rx.diagnosis}
                            </span>
                            <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                              <Pill size={12} className="text-emerald-500" /> {rx.medicationsCount} Medications prescribed
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {rx.status === "SIGNED" ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                              <CheckCircle2 size={12} /> Digitally Signed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                              <Save size={12} /> Draft Saved
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => handlePrint(rx)}
                              className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer" 
                              title="Print Slip"
                            >
                              <Printer size={16} />
                            </button>
                            <button 
                              onClick={() => setViewingRx(rx)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                            >
                              View Slip <ChevronRight size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Formulary Catalog View */
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Tripura Essential Drugs Formulary</h3>
                  <p className="text-xs text-slate-500">Stocked at District Hospital Agartala & Primary Health Centres.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {FORMULARY_DB.map((med) => (
                  <div key={med.id} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">{med.name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {med.stock}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-[10px] font-semibold bg-white dark:bg-slate-700 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300">
                        {med.type}
                      </span>
                      <span className="text-[10px] font-semibold bg-white dark:bg-slate-700 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300">
                        {med.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- BUILDER VIEW --- */}
      {view === "BUILDER" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header & Back Button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setView("LIST")}
                className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Prescription Builder
                </h1>
                <p className="text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                  Drafting new official e-prescription for clinical consultation.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setView("LIST")}
                className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs md:text-sm font-bold rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Save size={16} /> Save as Draft
              </button>
              <button 
                onClick={handleSignIssue}
                disabled={selectedMeds.length === 0 || isSigning}
                className={`px-5 py-2 text-white text-xs md:text-sm font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-xs
                  ${selectedMeds.length === 0 ? "bg-slate-300 dark:bg-slate-800 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700 active:scale-98"}
                `}
              >
                {isSigning ? (
                  <><Activity size={16} className="animate-spin" /> Verifying Credentials...</>
                ) : (
                  <><CheckCircle2 size={16} /> Sign & Issue Prescription</>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* Left Column: Context & Formulary Search */}
            <div className="xl:col-span-1 space-y-6">
              
              {/* Patient Context Card */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Patient Context</h3>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-base md:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                      {patientName}
                    </h2>
                    <span className="font-mono text-xs font-semibold text-slate-500 bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 mt-1 inline-block">
                      {patientId}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300">27y · Female</span>
                    <span className="px-2 py-0.5 bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 rounded text-[10px] font-bold uppercase tracking-wider inline-block mt-1">
                      Pregnant 20w
                    </span>
                  </div>
                </div>
                
                <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Clinical Diagnosis
                    </label>
                    <input 
                      type="text" 
                      value={clinicalDiagnosis}
                      onChange={(e) => setClinicalDiagnosis(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Known Allergies
                    </label>
                    <div className="flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-lg text-xs font-medium text-amber-800 dark:text-amber-300">
                      <AlertCircle size={14} className="text-amber-600 shrink-0" /> Sulfa Drugs (Contraindicated)
                    </div>
                  </div>
                </div>
              </div>

              {/* Formulary Search */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col h-[400px] shadow-xs">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Add From Formulary</h3>
                <div className="relative mb-3">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text"
                    placeholder="Search medications..."
                    value={formularySearch}
                    onChange={(e) => setFormularySearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium focus:outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 transition-colors"
                  />
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                  {filteredFormulary.map((med) => {
                    const isAdded = selectedMeds.some((m) => m.id === med.id);
                    return (
                      <div 
                        key={med.id} 
                        className={`flex flex-col p-2.5 rounded-xl border transition-all cursor-pointer ${
                          isAdded
                            ? "bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800"
                            : "border-slate-100 dark:border-slate-800 hover:border-emerald-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                        }`}
                        onClick={() => handleAddMedication(med)}
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">{med.name}</span>
                          <span className="text-emerald-600 text-xs">
                            {isAdded ? <Check size={14} /> : <Plus size={14} />}
                          </span>
                        </div>
                        <div className="flex gap-2 mt-1">
                          <span className="text-[10px] font-semibold text-slate-500 bg-white dark:bg-slate-800 px-1.5 rounded border border-slate-200 dark:border-slate-700">
                            {med.type}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-500 bg-white dark:bg-slate-800 px-1.5 rounded border border-slate-200 dark:border-slate-700">
                            {med.category}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Right Column: Rx Table */}
            <div className="xl:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden shadow-xs">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex justify-between items-center">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText size={18} className="text-emerald-600" /> Prescribed Medications (Rx)
                </h2>
                <span className="text-xs font-semibold text-slate-500 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-lg">
                  {selectedMeds.length} Items Selected
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[300px]">
                {selectedMeds.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center p-12 text-center">
                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 text-slate-300 dark:text-slate-600 rounded-full flex items-center justify-center mb-4 border border-slate-100 dark:border-slate-700">
                      <Pill size={32} />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">No Medications Added</h3>
                    <p className="text-xs font-medium text-slate-500 mt-1 max-w-sm">
                      Select medications from the formulary panel on the left to add them to this prescription.
                    </p>
                  </div>
                ) : (
                  selectedMeds.map((med, index) => (
                    <div key={med.id} className="relative flex flex-col gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30">
                      
                      {/* Header / Remove */}
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-xs font-bold font-mono">
                            {index + 1}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">{med.name}</h4>
                        </div>
                        <button 
                          onClick={() => handleRemoveMed(med.id)}
                          className="text-slate-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {/* Inputs Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Dosage
                          </label>
                          <input 
                            type="text" 
                            value={med.dosage}
                            onChange={(e) => handleUpdateMed(med.id, "dosage", e.target.value)}
                            className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono font-medium focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Frequency
                          </label>
                          <select 
                            value={med.frequency}
                            onChange={(e) => handleUpdateMed(med.id, "frequency", e.target.value)}
                            className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono font-medium focus:outline-none focus:border-emerald-500 cursor-pointer"
                          >
                            <option value="1-0-1">1-0-1 (Morning & Night)</option>
                            <option value="1-1-1">1-1-1 (Thrice daily)</option>
                            <option value="1-0-0">1-0-0 (Morning only)</option>
                            <option value="0-0-1">0-0-1 (Night only)</option>
                            <option value="SOS">SOS (As Needed)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Duration
                          </label>
                          <input 
                            type="text" 
                            value={med.duration}
                            onChange={(e) => handleUpdateMed(med.id, "duration", e.target.value)}
                            className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono font-medium focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Instructions
                          </label>
                          <input 
                            type="text" 
                            value={med.instructions}
                            onChange={(e) => handleUpdateMed(med.id, "instructions", e.target.value)}
                            className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>

                    </div>
                  ))
                )}
              </div>

              {/* Footer Warning & Sign info */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-emerald-50/50 dark:bg-emerald-950/20 flex items-start gap-3">
                <CheckCircle2 size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                <p className="text-xs font-medium text-emerald-800 dark:text-emerald-300 leading-relaxed">
                  By digitally issuing this prescription, it is bound to Doctor Medical Council Registration (Tripura) and ABDM HIP/HIU node. Synced live to the patient record.
                </p>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* --- VIEW RX MODAL --- */}
      {viewingRx && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
                  ABDM e-Prescription Record
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {viewingRx.id} · {viewingRx.patientName}
                </h3>
              </div>
              <button 
                onClick={() => setViewingRx(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Patient Details</span>
                <div className="font-bold text-slate-800 dark:text-slate-200">{viewingRx.patientName} ({viewingRx.patientId})</div>
                <div className="text-slate-500">Date: {viewingRx.date} · {viewingRx.time}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Prescribing Physician</span>
                <div className="font-bold text-slate-800 dark:text-slate-200">{viewingRx.doctor}</div>
                <div className="text-slate-500">Diagnosis: {viewingRx.diagnosis}</div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Medication Regimen</h4>
              <div className="space-y-2">
                {viewingRx.medications.map((m, idx) => (
                  <div key={idx} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">{m.name}</span>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {m.dosage} • {m.frequency} • {m.duration}
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                      {m.instructions}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] text-emerald-700 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                <ShieldCheck size={14} /> Cryptographically Verified by State Health Authority
              </span>
              <button 
                onClick={() => handlePrint(viewingRx)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Printer size={14} /> Print e-Rx
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
