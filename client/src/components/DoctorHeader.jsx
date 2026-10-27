import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  HeartPulse, 
  Bell, 
  Globe, 
  Clock, 
  Sun, 
  Moon,
  Menu
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import { getAllPatients } from "../utils/patientStore";

/**
 * Universal Doctor Portal Top Header
 * Recreated to match the canvas design tokens and aesthetic.
 */
export default function DoctorHeader({ onMenuClick }) {
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();
  const { theme, toggleTheme, isDark } = useTheme();

  // ── Live Clock ──────────────────────────────────────────────
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(timer);
  }, []);

  const liveTime = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    const day = days[now.getDay()];
    const date = now.getDate();
    const month = months[now.getMonth()];
    return `${hh}:${mm} · ${day}, ${date} ${month}`;
  }, [now]);

  // ── Emergency count for notification badge ─────────────────
  const emergencyCount = useMemo(() => {
    try {
      const patients = getAllPatients();
      return patients.filter(
        (p) => p.triage === "Critical Red Flag" || p.status === "Urgent"
      ).length;
    } catch {
      return 0;
    }
  }, []);

  // ── Doctor profile from session ────────────────────────────
  const doctorProfile = useMemo(() => {
    try {
      const stored =
        sessionStorage.getItem("aarogyaVaaniUserProfile") ||
        localStorage.getItem("aarogyaVaaniActiveUser");
      if (stored) return JSON.parse(stored);
    } catch {}
    return {
      userName: "Dr. S. Roy",
      role: "Medical Officer",
      workerId: "MO-8841",
    };
  }, []);

  const doctorName = doctorProfile.userName || "Dr. S. Roy";
  const doctorInitials = doctorName
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-[#E4E9F0] dark:border-slate-800 flex items-center justify-between px-4 lg:px-6 shrink-0 sticky top-0 z-20">
      {/* 1. LEFT: Menu button (mobile) + Brand Logo */}
      <div className="flex items-center gap-4">
        {onMenuClick && (
          <button 
            type="button"
            onClick={onMenuClick} 
            className="lg:hidden p-2 text-[#667085] hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
          >
            <Menu size={20} />
          </button>
        )}
        
        <div 
          onClick={() => navigate("/doctor/review")}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-8 h-8 bg-[#059669] rounded-lg shadow-sm flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <HeartPulse size={18} className="text-white" />
          </div>
          <div className="flex flex-col">
            <h1 className="font-semibold text-[#172033] dark:text-white text-[15px] leading-tight tracking-tight">
              Aarogya<span className="text-[#059669]">Vaani</span>
            </h1>
            <span className="text-[11px] font-medium text-[#667085] dark:text-slate-400">
              NHM Tripura • Bishalgarh CHC
            </span>
          </div>
        </div>
      </div>

      {/* 2. CENTER: Live Clock */}
      <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-lg bg-[#F7F9FC] dark:bg-slate-800 border border-[#E4E9F0] dark:border-slate-700">
        <Clock className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-xs font-mono font-medium text-[#667085] dark:text-slate-300">
          {liveTime}
        </span>
      </div>

      {/* 3. RIGHT: Connected Badge, Language, Theme, Bell & Profile */}
      <div className="flex items-center gap-2 sm:gap-3.5">
        {/* Connected Badge */}
        <span className="hidden md:inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-[#059669] dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
          <span className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulse mr-1.5" />
          Connected
        </span>

        <div className="h-6 w-px bg-[#E4E9F0] dark:bg-slate-700 hidden sm:block mx-1" />

        {/* Language Switcher Button */}
        <button
          type="button"
          onClick={() => {
            const next = language === "en" ? "bn" : language === "bn" ? "hi" : "en";
            setLanguage(next);
          }}
          className="inline-flex items-center justify-center font-medium rounded-lg text-xs px-2.5 py-1.5 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-[#667085] hover:text-[#172033] dark:hover:text-white transition-colors cursor-pointer"
          title={`Language: ${language.toUpperCase()} (Click to toggle)`}
        >
          <Globe size={14} className="mr-1.5" />
          <span className="font-bold">{language.toUpperCase()}</span>
        </button>

        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 text-[#667085] hover:text-[#172033] dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label="Toggle Theme"
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-180 duration-300" />
          ) : (
            <Moon className="w-4 h-4 text-[#667085] animate-in spin-in-180 duration-300" />
          )}
        </button>

        {/* Notification Bell */}
        <button 
          type="button"
          onClick={() => navigate("/doctor/emergency")}
          className="relative p-2 text-[#667085] hover:text-[#172033] dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          title={`Emergency Alerts (${emergencyCount})`}
        >
          <Bell size={18} />
          {emergencyCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
          )}
        </button>

        {/* Doctor Profile Chip */}
        <div 
          onClick={() => navigate("/doctor/analytics")}
          className="flex items-center gap-3 pl-2 sm:pl-3 border-l border-[#E4E9F0] dark:border-slate-800 cursor-pointer group"
          title={`${doctorName} · Medical Officer`}
        >
          <div className="hidden md:flex flex-col text-right">
            <span className="text-sm font-semibold text-[#172033] dark:text-white leading-none group-hover:text-[#059669] transition-colors">
              {doctorName}
            </span>
            <span className="text-[11px] font-medium text-[#667085] dark:text-slate-400 mt-1">
              {doctorProfile.role || "Medical Officer"}
            </span>
          </div>
          <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-[#059669] dark:text-emerald-400 flex items-center justify-center text-sm font-semibold border border-[#E4E9F0] dark:border-slate-700">
            {doctorInitials}
          </div>
        </div>
      </div>
    </header>
  );
}
