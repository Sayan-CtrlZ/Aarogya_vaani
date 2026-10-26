import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, Filter, UsersRound, ArrowRight, AlertTriangle, CheckCircle2, Clock, Activity } from "lucide-react";
import { getAllPatients } from "../../utils/patientStore";
import { getPatients } from "../../services/api";

export default function DoctorPatientsTab() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const paramFilter = searchParams.get("filter");
  const [patientsList, setPatientsList] = useState(() => getAllPatients());

  useEffect(() => {
    const list = getAllPatients();
    setPatientsList(list);
    getPatients()
      .then((cloudPatients) => {
        if (Array.isArray(cloudPatients) && cloudPatients.length > 0) {
          const mergedMap = new Map();
          list.forEach((p) => mergedMap.set((p.id || p.patient_ref)?.toUpperCase(), p));
          cloudPatients.forEach((cp) => {
            const id = cp.patient_ref || cp.id;
            if (id) {
              const key = id.toUpperCase();
              const existing = mergedMap.get(key) || {};
              mergedMap.set(key, {
                ...existing,
                id: id,
                patient_ref: id,
                name: cp.name || existing.name,
                phone: cp.phone || existing.phone,
                age: cp.age || existing.age || "28",
                gender: cp.gender || existing.gender || "Female",
                district: cp.village || cp.district || existing.district || "Tripura",
                category: cp.category || existing.category || "General",
                triage: cp.triage || existing.triage || "Stable",
                status: cp.status || existing.status || "Active",
              });
            }
          });
          setPatientsList(Array.from(mergedMap.values()));
        }
      })
      .catch(() => {});
  }, []);

  const [registryFilter, setRegistryFilter] = useState(paramFilter || "all");
  const [registrySearch, setRegistrySearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    if (paramFilter) {
      setRegistryFilter(paramFilter);
    }
  }, [paramFilter]);

  const handleFilterChange = (filterKey) => {
    setRegistryFilter(filterKey);
    setSearchParams(filterKey === "all" ? {} : { filter: filterKey });
  };

  // Compute live filter counts
  const counts = useMemo(() => {
    const total = patientsList.length;
    const inQueue = patientsList.filter(
      (p) => p.status === "In Queue" || p.status === "Current" || p.status !== "Reviewed"
    ).length;
    const critical = patientsList.filter(
      (p) => p.triage === "Critical Red Flag" || p.status === "Urgent"
    ).length;
    const reviewed = patientsList.filter(
      (p) => p.status === "Reviewed" || p.status === "Completed"
    ).length;
    return { total, inQueue, critical, reviewed };
  }, [patientsList]);

  // Extract distinct categories
  const categories = useMemo(() => {
    const set = new Set();
    patientsList.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [patientsList]);

  const filteredRegistry = useMemo(() => {
    let result = [...patientsList];

    // Status / Queue Filter
    if (registryFilter === "critical") {
      result = result.filter(
        (p) => p.triage === "Critical Red Flag" || p.status === "Urgent"
      );
    } else if (registryFilter === "pending" || registryFilter === "queue") {
      result = result.filter(
        (p) => p.status === "In Queue" || p.status === "Current" || p.status !== "Reviewed"
      );
    } else if (registryFilter === "reviewed") {
      result = result.filter(
        (p) => p.status === "Reviewed" || p.status === "Completed"
      );
    }

    // Category Filter
    if (selectedCategory !== "all") {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Search Query Filter
    if (registrySearch.trim()) {
      const q = registrySearch.toLowerCase();
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.id?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.chiefComplaint?.toLowerCase().includes(q) ||
          p.phone?.includes(q)
      );
    }
    return result;
  }, [patientsList, registryFilter, selectedCategory, registrySearch]);

  return (
    <div className="space-y-5">
      {/* Search and Filters Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
            {/* All Patients */}
            <button
              type="button"
              onClick={() => handleFilterChange("all")}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all flex items-center gap-1.5 ${
                registryFilter === "all"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs font-extrabold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <span>All Patients</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 text-[10px] font-black text-slate-700 dark:text-slate-300">
                {counts.total}
              </span>
            </button>

            {/* In Queue / Pending Review */}
            <button
              type="button"
              onClick={() => handleFilterChange("pending")}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all flex items-center gap-1.5 ${
                registryFilter === "pending" || registryFilter === "queue"
                  ? "bg-[#e8f8f0] dark:bg-emerald-950/60 text-[#059669] dark:text-emerald-400 shadow-xs font-extrabold"
                  : "text-slate-600 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-400"
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-[#059669]" />
              <span>In Queue</span>
              <span className="px-1.5 py-0.2 rounded-full bg-[#059669] text-white text-[10px] font-black">
                {counts.inQueue}
              </span>
            </button>

            {/* Critical Red Flags */}
            <button
              type="button"
              onClick={() => handleFilterChange("critical")}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all flex items-center gap-1.5 ${
                registryFilter === "critical"
                  ? "bg-rose-600 text-white shadow-xs font-extrabold"
                  : "text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Critical</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                registryFilter === "critical" ? "bg-white text-rose-700" : "bg-rose-100 text-rose-800"
              }`}>
                {counts.critical}
              </span>
            </button>

            {/* Reviewed / Completed */}
            <button
              type="button"
              onClick={() => handleFilterChange("reviewed")}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all flex items-center gap-1.5 ${
                registryFilter === "reviewed"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs font-extrabold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Reviewed</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 text-[10px] font-black text-slate-700 dark:text-slate-300">
                {counts.reviewed}
              </span>
            </button>
          </div>
        </div>

        {/* Right Search & Category Filter */}
        <div className="flex items-center gap-2.5">
          {categories.length > 0 && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold rounded-xl px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-[#059669] cursor-pointer"
            >
              <option value="all">All Departments</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          )}

          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={registrySearch}
              onChange={(e) => setRegistrySearch(e.target.value)}
              placeholder="Search patient, ID, symptom..."
              className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-[#059669] transition-all"
            />
          </div>
        </div>
      </div>

      {/* Registry Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-extrabold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                <th className="py-3 px-4">Patient ID</th>
                <th className="py-3 px-4">Name & Demographics</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Chief Complaint</th>
                <th className="py-3 px-4">Triage Level</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredRegistry.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    <UsersRound className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-semibold text-sm">No patients found</p>
                    <p className="text-xs text-slate-400 mt-0.5">Try clearing your filters or search query.</p>
                  </td>
                </tr>
              ) : (
                filteredRegistry.map((p) => {
                  const isFlagged = p.triage === "Critical Red Flag" || p.status === "Urgent";
                  const isReviewed = p.status === "Reviewed" || p.status === "Completed";
                  return (
                    <tr
                      key={p.id}
                      onClick={() => navigate(`/doctor/review?id=${p.id}`)}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-[#059669] dark:text-emerald-400">
                        {p.id}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                        <div>{p.name}</div>
                        <span className="text-[11px] text-slate-400 font-normal">
                          {p.age} yrs • {p.gender}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium">
                        {p.category || "General OPD"}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 max-w-xs truncate">
                        {p.chiefComplaint || p.nativeIntake || "General health consultation"}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                            isFlagged
                              ? "bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          {p.triage || "Stable"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            isReviewed
                              ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-black"
                              : "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300"
                          }`}
                        >
                          {isReviewed ? "Reviewed ✓" : "In Queue"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/doctor/review?id=${p.id}`);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs transition-colors cursor-pointer shadow-2xs"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
