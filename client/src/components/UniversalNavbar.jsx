import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, NavLink } from "react-router-dom";
import {
  Activity,
  Bot,
  Stethoscope,
  Calendar,
  FileText,
  Share2,
  Users,
  AlertTriangle,
  BarChart3,
  LogOut,
  LogIn,
  UserPlus,
  Menu,
  X,
  Languages,
  ArrowLeft,
  ShieldCheck,
  Building2,
  Sparkles,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { getCurrentPatient } from "../utils/patientStore";

/**
 * UniversalNavbar
 *
 * Unified, consistent navigation bar for all pages across AarogyaVaani:
 * - Landing Page
 * - Login Page
 * - Patient Portal (Dashboard, AI Doctor Voice, Consultations, Documents, Share)
 * - Doctor Portal (Review, Emergency, Patients, Analytics)
 *
 * Keeps branding, Indian Tricolor stripe, language switcher, and navigation
 * stationary and 100% consistent across the entire application.
 */
export default function UniversalNavbar({
  showBack = false,
  backPath,
  title,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, setLanguage } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Determine current active section
  const isDoctorSection = location.pathname.startsWith("/doctor");
  const isPatientSection =
    location.pathname.startsWith("/patient") || location.pathname === "/dashboard";
  const isAIDoctorPage = location.pathname === "/patient/ai-doctor";
  const isLandingPage = location.pathname === "/";

  // Patient and Doctor user states
  const [patient, setPatient] = useState(() => getCurrentPatient());
  const [doctorProfile, setDoctorProfile] = useState(() => {
    try {
      const stored =
        sessionStorage.getItem("aarogyaVaaniDoctorSession") ||
        localStorage.getItem("aarogyaVaaniDoctor");
      if (stored) return JSON.parse(stored);
    } catch {}
    return {
      name: "Dr. Sandeep Roy, MBBS, MD",
      facility: "Bishalgarh Community Health Centre",
      role: "doctor",
    };
  });

  // Track stored user profile if logged in from landing
  const [activeUser, setActiveUser] = useState(() => {
    try {
      const stored =
        sessionStorage.getItem("aarogyaVaaniUserProfile") ||
        localStorage.getItem("aarogyaVaaniActiveUser");
      if (stored) return JSON.parse(stored);
    } catch {}
    return null;
  });

  useEffect(() => {
    try {
      setPatient(getCurrentPatient());
      const stored =
        sessionStorage.getItem("aarogyaVaaniUserProfile") ||
        localStorage.getItem("aarogyaVaaniActiveUser");
      if (stored) setActiveUser(JSON.parse(stored));
    } catch {}
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.removeItem("aarogyaVaaniActiveUser");
    localStorage.removeItem("aarogyaVaaniDoctorSession");
    setActiveUser(null);
    navigate("/");
  };

  // Smart Logo Home click handler
  const handleLogoClick = () => {
    if (isDoctorSection) {
      navigate("/doctor/review");
    } else if (isPatientSection) {
      navigate("/patient");
    } else {
      const role = sessionStorage.getItem("aarogyaVaaniRole");
      if (role === "doctor") {
        navigate("/doctor/review");
      } else if (role === "patient" || activeUser) {
        navigate("/patient");
      } else {
        navigate("/");
      }
    }
  };

  return (
    <header className="w-full bg-white/95 backdrop-blur-xl border-b border-slate-200/80 sticky top-0 z-50 shadow-[0_2px_15px_rgba(0,0,0,0.03)] select-none">
      {/* 1. Indian Tricolor Ribbon */}
      <div className="gov-tricolor-bar" />

      {/* 2. Main Navigation Bar */}
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-3 sm:gap-6">
        {/* Left: Optional Back Arrow & Brand Logo */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
          {showBack && (
            <button
              onClick={() => (backPath ? navigate(backPath) : navigate(-1))}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer border border-slate-200"
              title="Go Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          <div
            onClick={handleLogoClick}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group"
            title="AarogyaVaani Home"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-[#0b6651] via-[#0d7a62] to-[#14b8a6] text-white flex items-center justify-center shadow-md border border-emerald-300/30 group-hover:scale-105 transition-all duration-200 shrink-0">
              <Activity className="w-5 h-5 text-white" />
            </div>

            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-none whitespace-nowrap">
                  Aarogya<span className="text-[#0b6651]">Vaani</span>
                </span>
                {isDoctorSection && (
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200 hidden xs:inline">
                    Doctor Portal
                  </span>
                )}
                {isPatientSection && (
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 hidden xs:inline">
                    Patient
                  </span>
                )}
              </div>

              <p className="text-[10px] font-medium text-slate-500 tracking-tight mt-0.5 hidden sm:flex items-center gap-1.5 whitespace-nowrap">
                <span>National Health Mission</span>
                <span className="text-slate-300">•</span>
                <span className="text-emerald-700 font-semibold">Ayushman Bharat (ABDM)</span>
              </p>
            </div>
          </div>
        </div>

        {/* Center: Context-Aware Navigation Links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {/* A. DOCTOR SECTION NAVIGATION */}
          {isDoctorSection && (
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl border border-slate-200/80">
              <NavLink
                to="/doctor/review"
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? "bg-white text-blue-900 shadow-xs border border-blue-600/20 font-black"
                      : "text-slate-600 hover:text-slate-900"
                  }`
                }
              >
                <Stethoscope className="w-3.5 h-3.5 text-blue-700" />
                <span>Clinical Review</span>
              </NavLink>

              <NavLink
                to="/doctor/emergency"
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? "bg-white text-rose-900 shadow-xs border border-rose-600/20 font-black"
                      : "text-slate-600 hover:text-slate-900"
                  }`
                }
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>Emergency Queue</span>
                <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
              </NavLink>

              <NavLink
                to="/doctor/patients"
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? "bg-white text-emerald-900 shadow-xs border border-emerald-600/20 font-black"
                      : "text-slate-600 hover:text-slate-900"
                  }`
                }
              >
                <Users className="w-3.5 h-3.5 text-emerald-700" />
                <span>Patients</span>
              </NavLink>

              <NavLink
                to="/doctor/analytics"
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? "bg-white text-indigo-900 shadow-xs border border-indigo-600/20 font-black"
                      : "text-slate-600 hover:text-slate-900"
                  }`
                }
              >
                <BarChart3 className="w-3.5 h-3.5 text-indigo-700" />
                <span>Analytics</span>
              </NavLink>
            </div>
          )}

          {/* B. PATIENT SECTION NAVIGATION */}
          {isPatientSection && (
            <div className="flex items-center gap-1 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80">
              <NavLink
                to="/patient"
                end
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? "bg-white text-emerald-900 shadow-xs border border-emerald-600/20 font-black"
                      : "text-slate-600 hover:text-slate-900"
                  }`
                }
              >
                <Activity className="w-3.5 h-3.5 text-[#0b6651]" />
                <span>Dashboard</span>
              </NavLink>

              <NavLink
                to="/patient/ai-doctor"
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? "bg-white text-blue-900 shadow-xs border border-blue-600/20 font-black"
                      : "text-slate-600 hover:text-slate-900"
                  }`
                }
              >
                <Bot className="w-3.5 h-3.5 text-blue-600" />
                <span>AI Doctor Voice</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              </NavLink>

              <NavLink
                to="/patient/consultations"
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? "bg-white text-emerald-900 shadow-xs border border-emerald-600/20 font-black"
                      : "text-slate-600 hover:text-slate-900"
                  }`
                }
              >
                <Calendar className="w-3.5 h-3.5 text-teal-600" />
                <span>Consultations</span>
              </NavLink>

              <NavLink
                to="/patient/documents"
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? "bg-white text-emerald-900 shadow-xs border border-emerald-600/20 font-black"
                      : "text-slate-600 hover:text-slate-900"
                  }`
                }
              >
                <FileText className="w-3.5 h-3.5 text-amber-600" />
                <span>Documents</span>
              </NavLink>

              <NavLink
                to="/patient/share"
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? "bg-white text-emerald-900 shadow-xs border border-emerald-600/20 font-black"
                      : "text-slate-600 hover:text-slate-900"
                  }`
                }
              >
                <Share2 className="w-3.5 h-3.5 text-purple-600" />
                <span>Share Access</span>
              </NavLink>
            </div>
          )}
        </nav>

        {/* Right: Language Switcher, User Profile / Auth, & Mobile Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Universal Language Switcher (EN | বাং | हिं) */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-full border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setLanguage("en")}
              className={`px-2 sm:px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                language === "en"
                  ? "bg-emerald-800 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLanguage("bn")}
              className={`px-2 sm:px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                language === "bn"
                  ? "bg-emerald-800 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              বাং
            </button>
            <button
              type="button"
              onClick={() => setLanguage("hi")}
              className={`px-2 sm:px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                language === "hi"
                  ? "bg-emerald-800 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              हिं
            </button>
          </div>

          {/* User Status / Role Pill */}
          {isDoctorSection ? (
            <div className="flex items-center gap-1.5">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-950 text-xs font-bold">
                <div className="w-5 h-5 rounded-full bg-blue-700 text-white flex items-center justify-center text-[10px] font-black">
                  D
                </div>
                <span className="truncate max-w-[130px]">{doctorProfile.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-full bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 transition-colors cursor-pointer border border-slate-200"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : isPatientSection ? (
            <div className="flex items-center gap-1.5">
              <div
                onClick={() => navigate("/patient")}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs font-bold cursor-pointer hover:bg-emerald-100 transition-all"
              >
                <div className="w-5 h-5 rounded-full bg-[#0b6651] text-white flex items-center justify-center text-[10px] font-black">
                  {(patient.name || "P")[0]}
                </div>
                <span className="truncate max-w-[130px]">{patient.name || "Patient"}</span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-full bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 transition-colors cursor-pointer border border-slate-200"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : activeUser ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() =>
                  navigate(activeUser.role === "doctor" ? "/doctor/review" : "/patient")
                }
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800"
              >
                <span>{activeUser.userName || "Dashboard"}</span>
              </button>
              <button
                onClick={handleLogout}
                className="p-2 rounded-full bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 transition-colors cursor-pointer border border-slate-200"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => navigate("/login?mode=signin")}
                className="flex items-center gap-1 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-bold text-xs py-1.5 px-3 rounded-full transition-all cursor-pointer shadow-2xs whitespace-nowrap"
              >
                <LogIn className="w-3 h-3 text-slate-600" />
                <span>Sign In</span>
              </button>
              <button
                onClick={() => navigate("/login?mode=signup")}
                className="flex items-center gap-1 bg-[#0b6651] hover:bg-[#074738] text-white font-black text-xs py-1.5 px-3.5 rounded-full transition-all cursor-pointer shadow-xs whitespace-nowrap"
              >
                <UserPlus className="w-3 h-3 text-emerald-200" />
                <span>Sign Up</span>
              </button>
            </div>
          )}

          {/* Mobile Navigation Drawer Toggle */}
          {(isDoctorSection || isPatientSection) && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer border border-slate-200"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* 3. Mobile Responsive Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white/95 backdrop-blur-2xl border-t border-slate-200 px-4 py-3 space-y-2 shadow-xl animate-in slide-in-from-top-2 duration-200">
          {/* A. DOCTOR SECTION MOBILE LINKS */}
          {isDoctorSection && (
            <div className="space-y-1">
              <button
                onClick={() => {
                  navigate("/doctor/review");
                  setMobileMenuOpen(false);
                }}
                className="w-full p-2.5 rounded-xl text-left font-bold text-xs flex items-center gap-2 hover:bg-blue-50 text-slate-800"
              >
                <Stethoscope className="w-4 h-4 text-blue-700" />
                <span>Clinical Review & Rx</span>
              </button>
              <button
                onClick={() => {
                  navigate("/doctor/emergency");
                  setMobileMenuOpen(false);
                }}
                className="w-full p-2.5 rounded-xl text-left font-bold text-xs flex items-center gap-2 hover:bg-rose-50 text-rose-700"
              >
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Emergency Safety Queue</span>
              </button>
              <button
                onClick={() => {
                  navigate("/doctor/patients");
                  setMobileMenuOpen(false);
                }}
                className="w-full p-2.5 rounded-xl text-left font-bold text-xs flex items-center gap-2 hover:bg-emerald-50 text-slate-800"
              >
                <Users className="w-4 h-4 text-emerald-700" />
                <span>Patient Registry</span>
              </button>
              <button
                onClick={() => {
                  navigate("/doctor/analytics");
                  setMobileMenuOpen(false);
                }}
                className="w-full p-2.5 rounded-xl text-left font-bold text-xs flex items-center gap-2 hover:bg-indigo-50 text-slate-800"
              >
                <BarChart3 className="w-4 h-4 text-indigo-700" />
                <span>Clinical Analytics</span>
              </button>
            </div>
          )}

          {/* B. PATIENT SECTION MOBILE LINKS */}
          {isPatientSection && (
            <div className="space-y-1">
              <button
                onClick={() => {
                  navigate("/patient");
                  setMobileMenuOpen(false);
                }}
                className="w-full p-2.5 rounded-xl text-left font-bold text-xs flex items-center gap-2 hover:bg-slate-100 text-slate-800"
              >
                <Activity className="w-4 h-4 text-[#0b6651]" />
                <span>Patient Dashboard</span>
              </button>
              <button
                onClick={() => {
                  navigate("/patient/ai-doctor");
                  setMobileMenuOpen(false);
                }}
                className="w-full p-2.5 rounded-xl text-left font-bold text-xs flex items-center gap-2 hover:bg-blue-50 text-blue-700 font-black"
              >
                <Bot className="w-4 h-4 text-blue-600" />
                <span>Talk to AI Doctor (Voice)</span>
              </button>
              <button
                onClick={() => {
                  navigate("/patient/consultations");
                  setMobileMenuOpen(false);
                }}
                className="w-full p-2.5 rounded-xl text-left font-bold text-xs flex items-center gap-2 hover:bg-slate-100 text-slate-800"
              >
                <Calendar className="w-4 h-4 text-teal-600" />
                <span>My Consultations</span>
              </button>
              <button
                onClick={() => {
                  navigate("/patient/documents");
                  setMobileMenuOpen(false);
                }}
                className="w-full p-2.5 rounded-xl text-left font-bold text-xs flex items-center gap-2 hover:bg-slate-100 text-slate-800"
              >
                <FileText className="w-4 h-4 text-amber-600" />
                <span>Medical Documents</span>
              </button>
              <button
                onClick={() => {
                  navigate("/patient/share");
                  setMobileMenuOpen(false);
                }}
                className="w-full p-2.5 rounded-xl text-left font-bold text-xs flex items-center gap-2 hover:bg-slate-100 text-slate-800"
              >
                <Share2 className="w-4 h-4 text-purple-600" />
                <span>Share Access with Doctor</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
