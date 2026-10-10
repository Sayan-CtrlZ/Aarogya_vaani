import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  UsersRound,
  Mic,
  Stethoscope,
  ShieldAlert,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  const currentPath = location.pathname;

  const dangerData = JSON.parse(
    localStorage.getItem("aarogyaVaaniDangerCheck") || "{}"
  );
  const urgentCount = (dangerData.dangerSigns || []).length > 0 ? 1 : 1;

  const navItems = [
    {
      id: "home",
      label: "Home",
      path: "/",
      icon: Home,
    },
    {
      id: "patient",
      label: "Patient",
      path: "/patient",
      icon: UsersRound,
    },
    {
      id: "intake",
      label: "Assistant",
      path: "/patient",
      icon: Mic,
      isCenter: true,
    },
    {
      id: "doctor",
      label: "Doctor",
      path: "/doctor/review",
      icon: Stethoscope,
    },
    {
      id: "alerts",
      label: "Urgent",
      path: "/doctor/emergency",
      icon: ShieldAlert,
      badge: urgentCount,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none pb-2 sm:pb-4 px-4 flex justify-center">
      <nav className="pointer-events-auto bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-[0_12px_36px_rgba(11,102,81,0.16)] rounded-full px-3 py-2 flex items-center justify-between gap-1 sm:gap-4 max-w-lg w-full">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            currentPath === item.path ||
            (item.id === "patients" && currentPath.startsWith("/patient"));

          if (item.isCenter) {
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className="relative -top-4 bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white p-3.5 rounded-full shadow-[0_8px_20px_rgba(11,102,81,0.35)] hover:scale-105 active:scale-95 transition-all cursor-pointer flex flex-col items-center justify-center border-4 border-[#f7faf9]"
                title={item.label}
              >
                <Icon className="w-6 h-6" />
                <span className="sr-only">{item.label}</span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`flex-1 py-1 px-2 rounded-2xl flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer relative ${
                isActive
                  ? "text-emerald-700 font-extrabold"
                  : "text-slate-500 hover:text-slate-800 font-semibold"
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-colors ${
                  isActive ? "bg-emerald-100/80 text-emerald-800" : ""
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] tracking-tight leading-none truncate max-w-[64px]">
                {item.label}
              </span>

              {item.badge && !isActive && (
                <span className="absolute top-1 right-2 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-black flex items-center justify-center ring-2 ring-white">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
