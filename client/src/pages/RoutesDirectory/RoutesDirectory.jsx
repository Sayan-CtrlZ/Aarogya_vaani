import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Compass,
  ArrowRight,
  Home,
  LogIn,
  UserPlus,
  Mic,
  FileText,
  Stethoscope,
  ShieldAlert,
  AlertTriangle,
  UsersRound,
  IdCard,
  Settings,
  Activity,
  CheckCircle2,
  Search,
  Filter,
  Layers,
  Sparkles,
} from "lucide-react";
import GovHeader from "../../components/GovHeader";
import BottomNav from "../../components/BottomNav";

export const APP_ROUTES = [
  {
    path: "/",
    title: "Landing Page (Home)",
    category: "Entry & Home",
    role: "Public / All Users",
    roleType: "all",
    icon: Home,
    colorClass: "glass-card-emerald",
    badgeColor: "bg-emerald-100 text-emerald-800",
    description:
      "Primary landing and home page of AarogyaVaani. Provides overview, key metrics, and portals for Patients and Doctors.",
  },
  {
    path: "/login",
    title: "Sign In & Sign Up Portal",
    category: "Entry & Home",
    role: "Patients & Doctors",
    roleType: "all",
    icon: LogIn,
    colorClass: "glass-card-blue",
    badgeColor: "bg-blue-100 text-blue-800",
    description:
      "Unified authentication and registration for Patients and Doctors / Medical Officers.",
  },
  {
    path: "/new-patient",
    title: "Patient Intake Interface",
    category: "Patient Intake",
    role: "Patient (User)",
    roleType: "patient",
    icon: UserPlus,
    colorClass: "glass-card-emerald",
    badgeColor: "bg-emerald-100 text-emerald-800",
    description:
      "User interface where a patient inputs their demographics or health details to start their intake.",
  },
  {
    path: "/consent",
    title: "Vernacular DPDP Audio Consent",
    category: "Patient Intake",
    role: "Patient",
    roleType: "patient",
    icon: Activity,
    colorClass: "glass-card-purple",
    badgeColor: "bg-purple-100 text-purple-800",
    description:
      "Spoken audio explanation in Bengali, Hindi, or English under India's DPDP Act 2023 with voice/touch confirmation.",
  },
  {
    path: "/interview",
    title: "AI Voice Consultation Assessment",
    category: "Patient Intake",
    role: "Patient",
    roleType: "patient",
    icon: Mic,
    colorClass: "glass-card-emerald",
    badgeColor: "bg-emerald-100 text-emerald-800",
    description:
      "Voice-first interactive clinical assessment with diagnostic trees tailored to maternal, geriatric, and general OPD conditions.",
  },
  {
    path: "/summary",
    title: "Clinical Summary & Triage Result",
    category: "Clinical & Summary",
    role: "Patient, Helper & Doctor",
    roleType: "all",
    icon: FileText,
    colorClass: "glass-card-amber",
    badgeColor: "bg-amber-100 text-amber-800",
    description:
      "Synthesized clinical summary, vitals card, detected danger signs, and triage classification (Stable, Moderate, Critical Red Flag).",
  },
  {
    path: "/doctor/review",
    title: "Doctor Portal: Clinical Review & Rx",
    category: "Doctor & Clinical",
    role: "Doctor / Medical Officer",
    roleType: "doctor",
    icon: Stethoscope,
    colorClass: "glass-card-blue",
    badgeColor: "bg-blue-100 text-blue-800",
    description:
      "Doctor workspace to search patient ID, review AI clinical assessment, write digital prescriptions, and record medical advice.",
  },
  {
    path: "/doctor/emergency",
    title: "Doctor Portal: Emergency Red Flag Queue",
    category: "Doctor & Clinical",
    role: "Doctor / Medical Officer",
    roleType: "doctor",
    icon: AlertTriangle,
    colorClass: "glass-card-rose",
    badgeColor: "bg-rose-100 text-rose-800",
    description:
      "Dedicated high-urgency queue for immediate clinical intervention on critical patients.",
  },
  {
    path: "/doctor/patients",
    title: "Doctor Portal: Patient Registry",
    category: "Doctor & Clinical",
    role: "Doctor / Medical Officer",
    roleType: "doctor",
    icon: UsersRound,
    colorClass: "glass-card",
    badgeColor: "bg-slate-100 text-slate-800",
    description:
      "Searchable and filterable registry table of all registered OPD patients.",
  },
  {
    path: "/doctor/analytics",
    title: "Doctor Portal: OPD Stats & ABDM Node",
    category: "Doctor & Clinical",
    role: "Doctor / Medical Officer",
    roleType: "doctor",
    icon: Activity,
    colorClass: "glass-card-teal",
    badgeColor: "bg-teal-100 text-teal-800",
    description:
      "OPD clinic statistics, Ayushman Bharat facility node status, and cloud synchronization.",
  },
  {
    path: "/danger-alerts",
    title: "Red Flag Emergency Triage Queue",
    category: "Doctor & Clinical",
    role: "Doctor & Health Staff",
    roleType: "doctor",
    icon: ShieldAlert,
    colorClass: "glass-card-red",
    badgeColor: "bg-rose-100 text-rose-800",
    description:
      "High-priority triage queue highlighting obstetric emergencies (preeclampsia, bleeding) and acute geriatric distress.",
  },
  {
    path: "/patients",
    title: "Patient Directory",
    category: "Records & Directory",
    role: "All Healthcare Staff",
    roleType: "staff",
    icon: UsersRound,
    colorClass: "glass-card",
    badgeColor: "bg-slate-100 text-slate-800",
    description:
      "Full database of all registered patients in the facility with search, status filters (Reviewed, Pending, Urgent), and direct summaries.",
  },
  {
    path: "/patient-details",
    title: "Detailed Patient Health Record",
    category: "Records & Directory",
    role: "All Healthcare Staff",
    roleType: "staff",
    icon: IdCard,
    colorClass: "glass-card",
    badgeColor: "bg-slate-100 text-slate-800",
    description:
      "In-depth clinical profile with longitudinal ANC visit history, ABHA/RCH identifiers, vitals progression, and lab tests.",
  },
  {
    path: "/dashboard",
    title: "Health Worker Staff Dashboard",
    category: "Facility & Operations",
    role: "Medical Staff & Helpers",
    roleType: "staff",
    icon: Activity,
    colorClass: "glass-card-emerald",
    badgeColor: "bg-emerald-100 text-emerald-800",
    description:
      "Operational dashboard displaying total intakes, red flag counts, recent clinical summaries, and quick patient ID search.",
  },
  {
    path: "/signup-status",
    title: "Staff & Helper Identity Badge",
    category: "Facility & Operations",
    role: "Health Worker & Doctor",
    roleType: "staff",
    icon: IdCard,
    colorClass: "glass-card-emerald",
    badgeColor: "bg-emerald-100 text-emerald-800",
    description:
      "Digital ID badge for verified ASHA workers and Medical Officers with facility info, unique ID, and printable QR code.",
  },
  {
    path: "/sync-status",
    title: "Offline Sync & ABDM Gateway",
    category: "Facility & Operations",
    role: "System & Operations",
    roleType: "staff",
    icon: Activity,
    colorClass: "glass-card-blue",
    badgeColor: "bg-blue-100 text-blue-800",
    description:
      "Tracks local SQLite database storage, pending records, and ABDM cloud sync status when device transitions between offline and online.",
  },
  {
    path: "/settings",
    title: "System Settings & Language",
    category: "System & Config",
    role: "All Users",
    roleType: "all",
    icon: Settings,
    colorClass: "glass-card",
    badgeColor: "bg-slate-100 text-slate-800",
    description:
      "Language preferences (English, Bengali, Hindi), offline cache toggles, audio playback volume, and storage management.",
  },
];

export default function RoutesDirectory() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");

  const filteredRoutes = APP_ROUTES.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole =
      selectedRole === "all" ||
      r.roleType === selectedRole ||
      r.roleType === "all";

    return matchesSearch && matchesRole;
  });

  const categories = Array.from(new Set(APP_ROUTES.map((r) => r.category)));

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50/50 pb-12">
      <GovHeader
        title="Application Routes & Map"
        subtitle="Complete AarogyaVaani Navigation Directory"
        showBack={true}
        backPath="/"
      />

      <main className="flex-1 w-full max-w-md sm:max-w-2xl mx-auto p-4 space-y-5 pb-24">
        {/* Header Hero Banner */}
        <div className="glass-panel p-5 rounded-3xl border border-white/80 shadow-sm space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-800 text-[11px] font-bold uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5 text-emerald-700" />
            <span>Complete Navigation Index</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">
            AarogyaVaani Route Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Directly inspect and navigate all pages of AarogyaVaani. First is the Home page (Landing), followed by Sign In / Sign Up, Patient Intake Interface, and Doctor Review Portal.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="glass-card p-4 rounded-2xl space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search routes by name, URL, or keyword..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] font-bold text-slate-400 shrink-0">
              Role:
            </span>
            <button
              onClick={() => setSelectedRole("all")}
              className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all shrink-0 ${
                selectedRole === "all"
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All Routes ({APP_ROUTES.length})
            </button>
            <button
              onClick={() => setSelectedRole("patient")}
              className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all shrink-0 ${
                selectedRole === "patient"
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Patient (Intake)
            </button>
            <button
              onClick={() => setSelectedRole("doctor")}
              className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all shrink-0 ${
                selectedRole === "doctor"
                  ? "bg-blue-700 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Doctor Portal
            </button>
            <button
              onClick={() => setSelectedRole("staff")}
              className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all shrink-0 ${
                selectedRole === "staff"
                  ? "bg-slate-800 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Staff & Operations
            </button>
          </div>
        </div>

        {/* Grouped Routes List */}
        <div className="space-y-6">
          {categories.map((cat) => {
            const catRoutes = filteredRoutes.filter((r) => r.category === cat);
            if (catRoutes.length === 0) return null;

            return (
              <div key={cat} className="space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">
                    {cat}
                  </h3>
                  <span className="text-[10px] font-bold text-slate-400">
                    {catRoutes.length} pages
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {catRoutes.map((route) => {
                    const Icon = route.icon;
                    return (
                      <div
                        key={route.path}
                        onClick={() => navigate(route.path)}
                        className={`${route.colorClass} p-4 rounded-2xl cursor-pointer hover:-translate-y-0.5 transition-all shadow-xs group flex flex-col justify-between`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-xl bg-white shadow-2xs flex items-center justify-center text-slate-800 group-hover:scale-105 transition-transform">
                                <Icon className="w-4 h-4" />
                              </div>
                              <div>
                                <h4 className="text-sm font-black text-slate-900 group-hover:text-emerald-800 transition-colors">
                                  {route.title}
                                </h4>
                                <span className="font-mono text-[11px] font-bold text-slate-500">
                                  {route.path}
                                </span>
                              </div>
                            </div>

                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${route.badgeColor} shrink-0`}
                            >
                              {route.role}
                            </span>
                          </div>

                          <p className="text-xs text-slate-600 leading-relaxed font-medium mt-1">
                            {route.description}
                          </p>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-black/5 flex items-center justify-between text-xs font-bold text-emerald-800 group-hover:text-emerald-950">
                          <span className="text-[11px] uppercase tracking-wide">
                            Open {route.title}
                          </span>
                          <span className="flex items-center gap-1">
                            <span>Navigate</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
