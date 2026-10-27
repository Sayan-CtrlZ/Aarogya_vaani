import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  ArrowRight, 
  User, 
  Phone, 
  Activity, 
  MoreHorizontal, 
  Calendar,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Stethoscope,
  X,
  Building2,
  FileText,
  Clock,
  Sparkles
} from "lucide-react";
import { getAllPatients, savePatient } from "../../utils/patientStore";
import { getPatients } from "../../services/api";
import { callSounds } from "../../utils/callSounds";
import DoctorPrescriptionsTab from "./DoctorPrescriptionsTab";
import DoctorAppointmentsTab from "./DoctorAppointmentsTab";
import DoctorRecordsVaultTab from "./DoctorRecordsVaultTab";

// Import Animated UI Icon
import { UsersIcon } from "../../components/icons/users";

// --- BASE REGISTRY SEED DATA ---
const SEED_REGISTRY = [
  { id: "91-4432-8871-0021", name: "Meena Devi", age: "28", gender: "F", contact: "98765 43210", category: "ANC High Risk", triage: "Critical", status: "Urgent", lastVisit: "Today", village: "Mohanpur" },
  { id: "91-8821-3342-9901", name: "Rakesh Das", age: "45", gender: "M", contact: "87654 32109", category: "Chronic/NCD", triage: "Stable", status: "Pending Review", lastVisit: "24 Oct 2026", village: "Bishalgarh" },
  { id: "91-1123-5543-8872", name: "Sunita Sharma", age: "32", gender: "F", contact: "76543 21098", category: "General OPD", triage: "Watch", status: "Pending Review", lastVisit: "Today", village: "Agartala" },
  { id: "91-9982-4412-0093", name: "Bimal Roy", age: "58", gender: "M", contact: "65432 10987", category: "Chronic/NCD", triage: "Stable", status: "Completed", lastVisit: "15 Oct 2026", village: "Melaghar" },
  { id: "91-4412-8899-1122", name: "Asha Debbarma", age: "24", gender: "F", contact: "54321 09876", category: "ANC Routine", triage: "Stable", status: "Pending Review", lastVisit: "Today", village: "Lefunga" },
  { id: "91-2234-7765-9988", name: "Kishore Saha", age: "62", gender: "M", contact: "99887 76655", category: "Chronic/NCD", triage: "Critical", status: "Urgent", lastVisit: "Today", village: "Khowai" },
  { id: "91-3345-8876-0011", name: "Priya Paul", age: "19", gender: "F", contact: "88776 65544", category: "General OPD", triage: "Stable", status: "Completed", lastVisit: "02 Oct 2026", village: "Udaipur" },
  { id: "91-6678-0099-3344", name: "Dipak Sutradhar", age: "41", gender: "M", contact: "66554 43322", category: "Chronic/NCD", triage: "Stable", status: "Pending Review", lastVisit: "Yesterday", village: "Sonamura" },
];

export default function DoctorPatientsTab() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTabParam = searchParams.get("tab");

  // Delegate Sub-Views
  if (activeTabParam === "prescriptions") {
    return <DoctorPrescriptionsTab />;
  }
  if (activeTabParam === "appointments") {
    return <DoctorAppointmentsTab />;
  }
  if (activeTabParam === "vault" || activeTabParam === "records") {
    return <DoctorRecordsVaultTab />;
  }

  const [activeTab, setActiveTab] = useState("All Patients");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // New Patient Registration Modal State
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [newPatientName, setNewPatientName] = useState("");
  const [newPatientAge, setNewPatientAge] = useState("");
  const [newPatientGender, setNewPatientGender] = useState("Female");
  const [newPatientContact, setNewPatientContact] = useState("");
  const [newPatientCategory, setNewPatientCategory] = useState("ANC Routine");
  const [newPatientTriage, setNewPatientTriage] = useState("Stable");
  const [newPatientVillage, setNewPatientVillage] = useState("Mohanpur CHC");

  // Raw Patients Store
  const [patientsList, setPatientsList] = useState(() => {
    const local = getAllPatients();
    const mergedMap = new Map();
    SEED_REGISTRY.forEach(p => mergedMap.set(p.id.toUpperCase(), p));
    local.forEach(p => {
      const id = (p.id || p.patient_ref || "").toUpperCase();
      if (id) {
        mergedMap.set(id, {
          id: p.id || p.patient_ref,
          name: p.name || "Patient",
          age: String(p.age || "28"),
          gender: (p.gender || "Female").startsWith("M") ? "M" : "F",
          contact: p.phone || "98621 00000",
          category: p.category || "General OPD",
          triage: p.triage === "Critical Red Flag" ? "Critical" : p.triage || "Stable",
          status: p.status === "Urgent" ? "Urgent" : p.status === "Reviewed" || p.status === "Completed" ? "Completed" : "Pending Review",
          lastVisit: "Today",
          village: p.district || p.village || "Tripura"
        });
      }
    });
    return Array.from(mergedMap.values());
  });

  // Sync with Cloud Store
  useEffect(() => {
    getPatients()
      .then((cloudPatients) => {
        if (Array.isArray(cloudPatients) && cloudPatients.length > 0) {
          setPatientsList((prev) => {
            const mergedMap = new Map();
            prev.forEach(p => mergedMap.set(p.id.toUpperCase(), p));
            cloudPatients.forEach((cp) => {
              const id = (cp.patient_ref || cp.id || "").toUpperCase();
              if (id) {
                const existing = mergedMap.get(id) || {};
                mergedMap.set(id, {
                  ...existing,
                  id: cp.patient_ref || cp.id,
                  name: cp.name || existing.name,
                  age: String(cp.age || existing.age || "28"),
                  gender: (cp.gender || existing.gender || "Female").startsWith("M") ? "M" : "F",
                  contact: cp.phone || existing.contact || "98621 00000",
                  category: cp.category || existing.category || "General OPD",
                  triage: cp.triage === "Critical Red Flag" ? "Critical" : cp.triage || existing.triage || "Stable",
                  status: cp.status === "Urgent" ? "Urgent" : cp.status === "Reviewed" ? "Completed" : existing.status || "Pending Review",
                  lastVisit: existing.lastVisit || "Today",
                  village: cp.village || cp.district || existing.village || "Tripura"
                });
              }
            });
            return Array.from(mergedMap.values());
          });
        }
      })
      .catch(() => {});
  }, []);

  // Dynamic counts for tabs
  const counts = useMemo(() => {
    const all = patientsList.length;
    const pending = patientsList.filter(p => p.status === "Pending Review" || p.status === "Urgent").length;
    const critical = patientsList.filter(p => p.triage === "Critical" || p.status === "Urgent").length;
    const completed = patientsList.filter(p => p.status === "Completed").length;
    return {
      "All Patients": all,
      "Pending Review": pending,
      "Critical Red Flag": critical,
      "Completed": completed,
    };
  }, [patientsList]);

  const tabs = [
    { id: "All Patients", label: `All Patients (${counts["All Patients"]})` },
    { id: "Pending Review", label: `Pending Review (${counts["Pending Review"]})` },
    { id: "Critical Red Flag", label: `Critical Red Flag (${counts["Critical Red Flag"]})` },
    { id: "Completed", label: `Completed (${counts["Completed"]})` },
  ];

  // Filtering Logic
  const filteredPatients = useMemo(() => {
    return patientsList.filter((p) => {
      let tabMatch = true;
      if (activeTab === "Pending Review") tabMatch = p.status === "Pending Review" || p.status === "Urgent";
      if (activeTab === "Critical Red Flag") tabMatch = p.triage === "Critical" || p.status === "Urgent";
      if (activeTab === "Completed") tabMatch = p.status === "Completed";

      const q = searchQuery.toLowerCase().trim();
      const searchMatch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.contact.replace(/\s+/g, "").includes(q.replace(/\s+/g, "")) ||
        (p.village && p.village.toLowerCase().includes(q));

      const categoryMatch =
        categoryFilter === "All Categories" ||
        p.category.toLowerCase().includes(categoryFilter.split(" ")[0].toLowerCase());

      return tabMatch && searchMatch && categoryMatch;
    });
  }, [patientsList, activeTab, searchQuery, categoryFilter]);

  // Pagination calculation
  const totalEntries = filteredPatients.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / pageSize));
  const paginatedPatients = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPatients.slice(start, start + pageSize);
  }, [filteredPatients, currentPage, pageSize]);

  // Registration handler
  const handleRegisterPatient = (e) => {
    e.preventDefault();
    if (!newPatientName.trim()) return;

    const autoId = `91-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(10 + Math.random() * 90)}`;
    const newRecord = {
      id: autoId,
      patient_ref: autoId,
      name: newPatientName.trim(),
      age: newPatientAge || "28",
      gender: newPatientGender === "Female" ? "F" : "M",
      phone: newPatientContact || "98621 55440",
      contact: newPatientContact || "98621 55440",
      category: newPatientCategory,
      triage: newPatientTriage,
      status: newPatientTriage === "Critical" ? "Urgent" : "Pending Review",
      lastVisit: "Today",
      village: newPatientVillage
    };

    savePatient(newRecord);
    setPatientsList(prev => [newRecord, ...prev]);
    setIsRegisterModalOpen(false);
    setNewPatientName("");
    setNewPatientAge("");
    setNewPatientContact("");
    callSounds.playCallConnectedChime();
  };

  return (
    <div className="h-full flex flex-col overflow-y-auto space-y-6 text-slate-900 dark:text-slate-100 font-sans selection:bg-emerald-100 dark:selection:bg-emerald-950">
      
      {/* --- PAGE HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400">
              <UsersIcon size={20} duration={1} isAnimated={true} />
            </span>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Patient Registry & Catchment Population
            </h1>
          </div>
          <p className="text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            Manage, search, and review all registered citizens and clinical dossiers in your CHC sector.
          </p>
        </div>

        <button 
          onClick={() => setIsRegisterModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all shadow-xs flex items-center justify-center gap-2 h-fit cursor-pointer"
        >
          <User size={16} strokeWidth={2.5} /> Register New Patient
        </button>
      </div>

      {/* --- TOOLBAR & DATA TABLE CONTAINER (OpenSource UI Aesthetic) --- */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col">
        
        {/* Top Filter Tabs */}
        <div className="flex overflow-x-auto border-b border-slate-100 dark:border-slate-800 px-3 pt-2 bg-slate-50/50 dark:bg-slate-800/40">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setCurrentPage(1); }}
              className={`px-5 py-3 text-xs md:text-sm font-bold transition-all border-b-[3px] whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? "border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-white dark:bg-slate-900 shadow-2xs"
                  : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:border-slate-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Filter Toolbar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
          
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, ABHA ID, or phone..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs md:text-sm focus:outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 transition-all font-medium placeholder:text-slate-400 text-slate-900 dark:text-white"
            />
          </div>
          
          {/* Category Dropdown */}
          <div className="relative w-full sm:w-56 shrink-0">
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
              className="w-full pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-500 appearance-none cursor-pointer transition-all"
            >
              <option value="All Categories">All Categories</option>
              <option value="ANC">ANC / Maternal</option>
              <option value="Chronic">Chronic / NCD</option>
              <option value="General">General OPD</option>
            </select>
            <Filter size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Patient Name</th>
                <th className="px-6 py-4 font-bold text-slate-500 text-xs uppercase tracking-wider">ABHA ID & Contact</th>
                <th className="px-6 py-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Age/Sex</th>
                <th className="px-6 py-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Triage & Category</th>
                <th className="px-6 py-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 font-bold text-slate-500 text-xs uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedPatients.map((patient) => {
                
                // Triage Dot Logic
                const isCritical = patient.triage === "Critical" || patient.status === "Urgent";
                const isWatch = patient.triage === "Watch";
                const triageColor = isCritical ? "bg-rose-500" : isWatch ? "bg-amber-500" : "bg-emerald-500";

                // Status Pill Logic
                let statusPill = "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700";
                if (patient.status === "Urgent") statusPill = "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900";
                if (patient.status === "Pending Review") statusPill = "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
                if (patient.status === "Completed") statusPill = "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900";

                return (
                  <tr key={patient.id} className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    
                    {/* Name Col */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 shrink-0 font-bold text-xs font-mono">
                          {patient.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-900 dark:text-white block">{patient.name}</span>
                          <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1 mt-0.5">
                            <Calendar size={12} /> Last Visit: {patient.lastVisit}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* ID & Contact Col */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 w-fit">
                          {patient.id}
                        </span>
                        <span className="font-mono text-[11px] text-slate-500 flex items-center gap-1">
                          <Phone size={10} /> +91 {patient.contact}
                        </span>
                      </div>
                    </td>

                    {/* Age/Sex Col */}
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {patient.age}y <span className="text-slate-300 dark:text-slate-700 mx-1">|</span> {patient.gender === "F" ? "Female" : "Male"}
                      </span>
                    </td>

                    {/* Triage & Category Col */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5 items-start">
                        <div className="flex items-center gap-1.5">
                          <div className="relative flex h-2 w-2">
                            {isCritical && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />}
                            <span className={`relative inline-flex rounded-full h-2 w-2 ${triageColor}`} />
                          </div>
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{patient.triage}</span>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          {patient.category}
                        </span>
                      </div>
                    </td>

                    {/* Status Col */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider border ${statusPill}`}>
                        {patient.status}
                      </span>
                    </td>

                    {/* Actions Col */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => navigate(`/doctor/review?id=${patient.id}`)}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 px-4 py-2 rounded-xl transition-all border border-emerald-200 dark:border-emerald-800 cursor-pointer shadow-2xs active:scale-98"
                        >
                          Review <ArrowRight size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {/* Empty State */}
              {paginatedPatients.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                        <Search size={24} />
                      </div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        No patients found matching your search or active filters.
                      </p>
                      <button 
                        onClick={() => { setSearchQuery(""); setCategoryFilter("All Categories"); setActiveTab("All Patients"); }}
                        className="text-emerald-600 dark:text-emerald-400 font-bold text-xs hover:underline mt-1 cursor-pointer"
                      >
                        Clear all filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer / Pagination */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs md:text-sm font-medium text-slate-500">
            Showing <span className="font-bold text-slate-900 dark:text-white">{filteredPatients.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</span> to <span className="font-bold text-slate-900 dark:text-white">{Math.min(currentPage * pageSize, filteredPatients.length)}</span> of <span className="font-bold text-slate-900 dark:text-white">{filteredPatients.length}</span> entries
          </p>
          
          <div className="flex items-center gap-1.5">
            <button 
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className={`p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors ${
                currentPage <= 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
              }`}
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNo) => (
              <button
                key={pageNo}
                onClick={() => setCurrentPage(pageNo)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                  currentPage === pageNo
                    ? "border-emerald-600 bg-emerald-600 text-white shadow-xs"
                    : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                }`}
              >
                {pageNo}
              </button>
            ))}

            <button 
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className={`p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors ${
                currentPage >= totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
              }`}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

      </div>

      {/* --- REGISTER NEW PATIENT MODAL --- */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
                  <User size={18} />
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Register New Catchment Patient
                </h3>
              </div>
              <button 
                onClick={() => setIsRegisterModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRegisterPatient} className="space-y-4 text-xs">
              
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Patient Full Name *
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Meena Devi"
                  value={newPatientName}
                  onChange={(e) => setNewPatientName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Age (Years)
                  </label>
                  <input 
                    type="number" 
                    placeholder="28"
                    value={newPatientAge}
                    onChange={(e) => setNewPatientAge(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Gender
                  </label>
                  <select 
                    value={newPatientGender}
                    onChange={(e) => setNewPatientGender(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-500 cursor-pointer text-slate-900 dark:text-white"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Phone / Contact Number
                  </label>
                  <input 
                    type="text" 
                    placeholder="98765 43210"
                    value={newPatientContact}
                    onChange={(e) => setNewPatientContact(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono focus:outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Clinical Category
                  </label>
                  <select 
                    value={newPatientCategory}
                    onChange={(e) => setNewPatientCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-500 cursor-pointer text-slate-900 dark:text-white"
                  >
                    <option value="ANC Routine">ANC Routine</option>
                    <option value="ANC High Risk">ANC High Risk</option>
                    <option value="Chronic/NCD">Chronic / NCD</option>
                    <option value="General OPD">General OPD</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Initial Triage Flag
                  </label>
                  <select 
                    value={newPatientTriage}
                    onChange={(e) => setNewPatientTriage(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-500 cursor-pointer text-slate-900 dark:text-white"
                  >
                    <option value="Stable">Stable</option>
                    <option value="Watch">Watch</option>
                    <option value="Critical">Critical Red Flag</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Sub-Centre / Village
                  </label>
                  <input 
                    type="text" 
                    value={newPatientVillage}
                    onChange={(e) => setNewPatientVillage(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-98"
                >
                  <Plus size={15} />
                  <span>Register & Assign ABHA</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
