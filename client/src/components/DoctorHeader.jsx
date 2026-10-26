import React from "react";
import { useNavigate } from "react-router-dom";
import { Sun, Moon, Stethoscope, Bell } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";

/**
 * Universal Doctor Portal Top Header
 * 
 * Styled identically to PatientHeader:
 * - Height: h-14 (56px)
 * - Matching brand logo, font, colors, dark mode
 * - Clean, spacious center
 * - Right: Doctor badge, language switcher, theme toggle, profile
 */
export default function DoctorHeader() {
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <header className="w-full h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between select-none shrink-0 transition-colors duration-200 z-20">
      {/* 1. LEFT: Brand Icon & Name (Identical to PatientHeader) */}
      <div
        onClick={() => navigate("/doctor/review")}
        className="flex items-center gap-2.5 px-1 py-1 cursor-pointer group shrink-0"
        title="AarogyaVaani Home"
      >
        <div className="w-8 h-8 rounded-xl bg-[#059669] flex items-center justify-center text-white shadow-xs shrink-0 group-hover:scale-105 transition">
          <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>
        <div className="min-w-0">
          <h1 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-none truncate">
            Aarogya<span className="text-[#059669]">Vaani</span>
          </h1>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-tight mt-0.5 truncate hidden sm:block">
            National Health Mission · Tripura
          </p>
        </div>
      </div>

      {/* 2. CENTER: Clean & Spacious */}
      <div className="flex-1" />

      {/* 3. RIGHT: Role Badge, Language Selector, Dark/Light Mode Toggle & Doctor Profile */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Doctor Clinical Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#e8f8f0] dark:bg-emerald-950/40 text-[#059669] dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-800/60 shadow-2xs">
          <Stethoscope className="w-3.5 h-3.5" />
          <span>Doctor Portal</span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            type="button"
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/90 dark:border-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1.5 right-1.5 ring-2 ring-white dark:ring-slate-900" />
          </button>
        </div>

        {/* Language Switcher Pills (Identical to PatientHeader) */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-700/70 border border-slate-200/90 dark:border-slate-600/80 rounded-xl p-0.5 sm:p-1 text-xs">
          <button
            onClick={() => setLanguage("en")}
            className={`px-2 py-1 rounded-lg font-medium transition text-center cursor-pointer ${
              language === "en"
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-2xs font-bold text-[11px]"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 text-[11px]"
            }`}
            title="English"
          >
            EN
          </button>
          <button
            onClick={() => setLanguage("bn")}
            className={`px-2 py-1 rounded-lg font-medium transition text-center cursor-pointer ${
              language === "bn"
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-2xs font-bold text-[11px]"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 text-[11px]"
            }`}
            title="বাংলা (Bengali)"
          >
            বাংলা
          </button>
          <button
            onClick={() => setLanguage("hi")}
            className={`px-2 py-1 rounded-lg font-medium transition text-center cursor-pointer ${
              language === "hi"
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-2xs font-bold text-[11px]"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 text-[11px]"
            }`}
            title="हिंदी (Hindi)"
          >
            हिंदी
          </button>
        </div>

        {/* Dark / Light Mode Toggle Button (Identical to PatientHeader) */}
        <button
          onClick={toggleTheme}
          className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-100 dark:bg-slate-700/70 hover:bg-slate-200 dark:hover:bg-slate-600/70 border border-slate-200/90 dark:border-slate-600/80 text-slate-600 dark:text-slate-300 transition cursor-pointer"
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label="Toggle Theme"
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-180 duration-300" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600 animate-in spin-in-180 duration-300" />
          )}
        </button>

        {/* Doctor Profile Mini Shortcut (Identical styling to PatientHeader) */}
        <div
          className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-xl bg-slate-100 dark:bg-slate-700/70 hover:bg-slate-200 dark:hover:bg-slate-600/70 border border-slate-200/90 dark:border-slate-600/80 transition cursor-pointer"
          title="Dr. Sandeep Roy · General Physician"
        >
          <div className="w-6 h-6 rounded-full bg-[#059669] text-white flex items-center justify-center font-bold text-[11px] shrink-0">
            DR
          </div>
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 hidden md:inline truncate max-w-[130px]">
            Dr. Sandeep Roy
          </span>
        </div>
      </div>
    </header>
  );
}
