import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Search,
  User,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  Stethoscope,
} from "lucide-react";
import GovHeader from "../../components/GovHeader";
import BottomNav from "../../components/BottomNav";
import { useLanguage } from "../../context/LanguageContext";
import { getAllPatients } from "../../utils/patientStore";

export default function Patients() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [patientList, setPatientList] = useState(() => getAllPatients());

  useEffect(() => {
    setPatientList(getAllPatients());
  }, []);

  const filteredPatients = useMemo(() => {
    return patientList.filter((p) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        p.name.toLowerCase().includes(term) ||
        (p.id && p.id.toLowerCase().includes(term)) ||
        (p.village && p.village.toLowerCase().includes(term)) ||
        (p.chiefComplaint && p.chiefComplaint.toLowerCase().includes(term));

      if (!matchesSearch) return false;

      if (statusFilter === "urgent") {
        return p.triage === "Critical Red Flag" || p.status === "Urgent";
      }
      if (statusFilter === "reviewed") {
        return p.status === "Reviewed";
      }
      if (statusFilter === "pending") {
        return p.status !== "Reviewed" && p.triage !== "Critical Red Flag";
      }

      return true;
    });
  }, [patientList, searchTerm, statusFilter]);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50/50 pb-10">
      <GovHeader
        title="Patient Directory"
        showBack={true}
        backPath="/"
      />

      <main className="flex-1 w-full max-w-md sm:max-w-lg mx-auto p-4 space-y-4 pb-24">
        {/* Search & New Patient Action */}
        <div className="glass-panel p-4 rounded-3xl shadow-sm border border-white/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Search Patient Records
            </span>
            <button
              onClick={() => navigate("/new-patient")}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Patient</span>
            </button>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Name, Patient ID, or Village..."
              className="w-full pl-9 pr-3.5 py-2.5 bg-white/90 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {[
              { id: "all", label: `All (${patientList.length})` },
              { id: "urgent", label: "Red Flags" },
              { id: "pending", label: "Pending" },
              { id: "reviewed", label: "Reviewed" },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setStatusFilter(f.id)}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === f.id
                    ? "bg-emerald-700 text-white shadow-2xs"
                    : "glass-card text-slate-600 hover:bg-white"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Patients List */}
        <div className="space-y-2.5">
          {filteredPatients.length > 0 ? (
            filteredPatients.map((p) => {
              const isUrgent =
                p.triage === "Critical Red Flag" || p.status === "Urgent";
              return (
                <div
                  key={p.id}
                  onClick={() => navigate(`/summary?id=${p.id}`)}
                  className="glass-panel p-4 rounded-3xl hover:bg-white transition-all cursor-pointer shadow-xs space-y-2 group border border-white/80"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black text-emerald-800">
                            {p.id}
                          </span>
                          <h3 className="font-black text-slate-900 text-sm">
                            {p.name}
                          </h3>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {p.age} yrs • {p.gender} • {p.village}
                        </p>
                        {p.assistedMode && (
                          <span className="text-[9px] bg-emerald-100 text-emerald-900 font-bold px-1.5 py-0.5 rounded mt-0.5 inline-block">
                            👩‍⚕️ ASHA Proxy: {p.patientCondition === "pregnant_distress" ? "Pregnant Mother" : p.patientCondition === "elderly_frail" ? `Elderly (${p.gender === "Female" ? "Old Woman" : "Old Man"})` : "Assisted"}
                          </span>
                        )}
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-black px-2.5 py-0.5 rounded-full shrink-0 ${
                        isUrgent
                          ? "bg-rose-100 text-rose-800 border border-rose-200"
                          : p.status === "Reviewed"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {p.status === "Reviewed" ? "Reviewed ✓" : isUrgent ? "Red Flag" : "Stable"}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-1 italic font-medium bg-slate-50 p-2 rounded-xl">
                    "{p.chiefComplaint}"
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>{p.createdAt}</span>
                    <span className="text-emerald-700 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                      <span>View Health Summary</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="glass-panel p-8 text-center rounded-3xl text-slate-500 font-bold text-xs">
              No patients match your search.
            </div>
          )}
        </div>
      </main>

      {/* Docked Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}