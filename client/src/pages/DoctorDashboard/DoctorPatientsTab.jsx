import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, UsersRound, ArrowRight } from "lucide-react";
import { getAllPatients } from "../../utils/patientStore";

export default function DoctorPatientsTab() {
  const navigate = useNavigate();
  const patientsList = getAllPatients();

  const [registryFilter, setRegistryFilter] = useState("all");
  const [registrySearch, setRegistrySearch] = useState("");

  const emergencyPatients = useMemo(() => {
    return patientsList.filter(
      (p) => p.triage === "Critical Red Flag" || p.status === "Urgent"
    );
  }, [patientsList]);

  const filteredRegistry = useMemo(() => {
    let result = [...patientsList];
    if (registryFilter === "critical") {
      result = result.filter(
        (p) => p.triage === "Critical Red Flag" || p.status === "Urgent"
      );
    } else if (registryFilter === "pending") {
      result = result.filter((p) => p.status !== "Reviewed");
    } else if (registryFilter === "reviewed") {
      result = result.filter((p) => p.status === "Reviewed");
    }

    if (registrySearch.trim()) {
      const q = registrySearch.toLowerCase();
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.id?.toLowerCase().includes(q) ||
          p.village?.toLowerCase().includes(q) ||
          p.phone?.includes(q)
      );
    }
    return result;
  }, [patientsList, registryFilter, registrySearch]);

  return (
    <div className="space-y-5">
      {/* Search and Filters Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setRegistryFilter("all")}
              className={`px-3 py-1 rounded-xl cursor-pointer transition-colors ${
                registryFilter === "all" ? "bg-white text-slate-900 shadow-2xs font-black" : "text-slate-600"
              }`}
            >
              All ({patientsList.length})
            </button>
            <button
              type="button"
              onClick={() => setRegistryFilter("critical")}
              className={`px-3 py-1 rounded-xl cursor-pointer transition-colors ${
                registryFilter === "critical"
                  ? "bg-rose-600 text-white shadow-2xs font-bold"
                  : "text-slate-600 hover:text-rose-700"
              }`}
            >
              Critical ({emergencyPatients.length})
            </button>
            <button
              type="button"
              onClick={() => setRegistryFilter("pending")}
              className={`px-3 py-1 rounded-xl cursor-pointer transition-colors ${
                registryFilter === "pending" ? "bg-white text-slate-900 shadow-2xs font-black" : "text-slate-600"
              }`}
            >
              Pending Review
            </button>
            <button
              type="button"
              onClick={() => setRegistryFilter("reviewed")}
              className={`px-3 py-1 rounded-xl cursor-pointer transition-colors ${
                registryFilter === "reviewed" ? "bg-white text-slate-900 shadow-2xs font-black" : "text-slate-600"
              }`}
            >
              Reviewed
            </button>
          </div>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={registrySearch}
            onChange={(e) => setRegistrySearch(e.target.value)}
            placeholder="Search name, village, ID..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Registry Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-extrabold uppercase text-slate-500 tracking-wider">
                <th className="py-3 px-4">Patient ID</th>
                <th className="py-3 px-4">Name & Demographics</th>
                <th className="py-3 px-4">Village / Location</th>
                <th className="py-3 px-4">Chief Complaint</th>
                <th className="py-3 px-4">Triage Level</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRegistry.map((p) => {
                const isFlagged = p.triage === "Critical Red Flag";
                return (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-900">
                      {p.id}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div>{p.name}</div>
                      <span className="text-[11px] text-slate-400 font-normal">
                        {p.age} yrs • {p.gender}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {p.village}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 max-w-xs truncate">
                      {p.chiefComplaint}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                          isFlagged
                            ? "bg-rose-100 text-rose-800 border border-rose-200"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {p.triage}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          p.status === "Reviewed"
                            ? "bg-emerald-100 text-emerald-800 font-black"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {p.status === "Reviewed" ? "Reviewed ✓" : "Pending"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => navigate(`/doctor/review?id=${p.id}`)}
                        className="px-3.5 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs transition-colors cursor-pointer"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
