import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Activity,
  Menu,
  X,
  LogIn,
  UserPlus,
  LogOut,
  ShieldCheck,
} from "lucide-react";

export default function PublicHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    try {
      const stored =
        sessionStorage.getItem("aarogyaVaaniUserProfile") ||
        localStorage.getItem("aarogyaVaaniActiveUser");
      if (stored) {
        setUserProfile(JSON.parse(stored));
      }
    } catch {
      setUserProfile(null);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.removeItem("aarogyaVaaniActiveUser");
    setUserProfile(null);
    navigate("/");
  };

  const navLinks = [
    { label: "Home", path: "/" },
    { label: "About Project", href: "#about-section" },
    { label: "Key Features", href: "#features-section" },
    { label: "How It Works", href: "#workflow-section" },
  ];

  const handleNavClick = (link) => {
    setMobileMenuOpen(false);
    if (link.path) {
      navigate(link.path);
    } else if (link.href) {
      if (location.pathname !== "/") {
        navigate("/" + link.href);
      } else {
        const el = document.querySelector(link.href);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }
    }
  };

  return (
    <header className="w-full bg-white/80 backdrop-blur-2xl border-b border-white/70 sticky top-0 z-50 shadow-[0_4px_30px_rgba(15,23,42,0.03)]">
      {/* 1. Indian Tricolor Micro Stripe */}
      <div className="gov-tricolor-bar" />

      {/* 2. Main Navigation Bar */}
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-10 xl:px-14 py-3 sm:py-3.5 flex items-center justify-between gap-4 lg:gap-8">
        {/* Brand & Identity */}
        <div
          onClick={() => navigate("/")}
          className="flex items-center gap-3 cursor-pointer group select-none shrink-0"
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-[#0b6651] via-[#0d7a62] to-[#14b8a6] text-white flex items-center justify-center shadow-[0_4px_16px_rgba(11,102,81,0.22)] border border-emerald-300/30 group-hover:scale-105 transition-all duration-200">
            <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight leading-none whitespace-nowrap">
                Aarogya<span className="text-[#0b6651]">Vaani</span>
              </span>
            </div>

            <p className="text-[11px] font-medium text-slate-500 tracking-tight mt-1 flex items-center gap-1.5 whitespace-nowrap">
              <span>National Health Mission</span>
              <span className="text-slate-300">•</span>
              <span className="text-emerald-700/90 font-semibold">Ayushman Bharat (ABDM)</span>
            </p>
          </div>
        </div>

        {/* Center Project Info Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
          {navLinks.map((link) => {
            const isActive = link.path && location.pathname === link.path;
            return (
              <button
                key={link.label}
                onClick={() => handleNavClick(link)}
                className={`px-4 py-2 rounded-full text-xs lg:text-[13px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-emerald-600/10 text-emerald-900 border border-emerald-500/25 shadow-2xs font-extrabold"
                    : "text-slate-600 hover:text-slate-950 hover:bg-slate-900/5"
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Right Zone: ONLY Sign In & Sign Up (No internal access until logged in) */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {userProfile ? (
            /* Logged-In User Profile & Sign Out */
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (userProfile.role === "doctor") {
                    navigate("/doctor/review");
                  } else {
                    navigate("/new-patient");
                  }
                }}
                className="bg-white/90 hover:bg-white backdrop-blur-xl text-slate-900 font-bold text-xs py-2 px-3.5 rounded-full border border-slate-200/90 shadow-xs transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap"
                title={`Go to Dashboard (${userProfile.userName})`}
              >
                <div className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px] font-black shrink-0">
                  {(userProfile.userName || "U")[0]}
                </div>
                <span className="max-w-[100px] sm:max-w-[140px] truncate font-extrabold whitespace-nowrap">
                  {userProfile.userName || "Dashboard"}
                </span>
              </button>

              <button
                onClick={handleLogout}
                className="p-2 rounded-full bg-white/80 hover:bg-rose-50 hover:text-rose-700 text-slate-600 border border-slate-200/80 backdrop-blur-md transition-all cursor-pointer shadow-xs"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            /* Public Visitors: Only Sign In & Sign Up */
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate("/login?mode=signin")}
                className="flex items-center gap-1.5 bg-white/90 hover:bg-white backdrop-blur-xl text-slate-800 border border-slate-200/90 hover:border-slate-300 font-bold text-xs sm:text-sm py-2 px-4 sm:px-4.5 rounded-full transition-all cursor-pointer shadow-xs hover:shadow-sm whitespace-nowrap active:scale-95"
              >
                <LogIn className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                <span>Sign In</span>
              </button>

              <button
                onClick={() => navigate("/login?mode=signup")}
                className="flex items-center gap-1.5 bg-gradient-to-r from-[#0b6651] to-[#0d7a62] hover:from-[#085241] hover:to-[#0b6651] text-white font-extrabold text-xs sm:text-sm py-2 px-4 sm:px-5 rounded-full shadow-[0_4px_16px_rgba(11,102,81,0.25)] hover:shadow-[0_6px_22px_rgba(11,102,81,0.35)] transition-all cursor-pointer whitespace-nowrap active:scale-95"
              >
                <UserPlus className="w-3.5 h-3.5 text-emerald-200 shrink-0" />
                <span>Sign Up</span>
              </button>
            </div>
          )}

          {/* Mobile Drawer Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-full bg-white/80 hover:bg-white backdrop-blur-md border border-slate-200 text-slate-800 transition-all cursor-pointer shadow-xs shrink-0"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* 3. Mobile Drawer Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-2xl border-t border-slate-200/80 px-4 py-4 space-y-3 shadow-xl animate-in slide-in-from-top-2 duration-200">
          {/* Active Logged-in State on Mobile */}
          {userProfile && (
            <div className="p-3 bg-emerald-50/90 rounded-2xl border border-emerald-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-black text-emerald-950">
                  Signed in: {userProfile.userName}
                </p>
                <p className="text-[10px] text-emerald-800 capitalize font-medium">
                  {userProfile.role} • {userProfile.facility || "Primary Health Centre"}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="text-xs font-bold text-rose-700 underline cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          )}

          {/* Project Informational Links */}
          <div className="space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNavClick(link)}
                className="w-full p-2.5 rounded-xl text-left hover:bg-slate-100 text-slate-800 font-bold text-xs cursor-pointer"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Mobile Sign In & Sign Up buttons if not logged in */}
          {!userProfile && (
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate("/login?mode=signin");
                }}
                className="w-full bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-bold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5 text-slate-600" />
                <span>Sign In</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate("/login?mode=signup");
                }}
                className="w-full bg-[#0b6651] hover:bg-[#074738] text-white font-black text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Sign Up</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
