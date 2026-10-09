import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Activity,
  ArrowLeft,
  Bell,
  Settings as SettingsIcon,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function GovHeader({
  title,
  subtitle,
  showBack = false,
  backPath = "/dashboard",
  rightAction = null,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();

  const dangerData = JSON.parse(
    localStorage.getItem("aarogyaVaaniDangerCheck") || "{}"
  );
  const urgentCount = (dangerData.dangerSigns || []).length > 0 ? 1 : 2;

  const isHome = location.pathname === "/" || location.pathname === "/dashboard";

  return (
    <header className="w-full bg-white/95 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40">
      <div className="max-w-md sm:max-w-lg mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* Left Side */}
        {showBack ? (
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigate(backPath)}
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 flex items-center justify-center transition-all cursor-pointer"
              title={t("back")}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            {title && (
              <div className="leading-tight">
                <h1 className="text-base font-black text-slate-900 tracking-tight truncate max-w-[200px] sm:max-w-xs">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-[11px] text-slate-500 font-medium truncate max-w-[200px] sm:max-w-xs">
                    {subtitle}
                  </p>
                )}
              </div>
            )}
          </div>
        ) : (
          <div
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-black text-slate-900 tracking-tight">
              Aarogya<span className="text-emerald-700">Vaani</span>
            </span>
          </div>
        )}

        {/* Right Side: Language Toggle + Bell + Settings (HealthHub Style) */}
        <div className="flex items-center gap-2">
          {/* Compact Single-Language Switcher */}
          <div className="flex items-center bg-slate-100 rounded-full p-0.5 text-xs font-bold">
            <button
              onClick={() => setLanguage("en")}
              className={`px-2 py-1 rounded-full transition-all cursor-pointer ${
                language === "en"
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage("bn")}
              className={`px-2 py-1 rounded-full transition-all cursor-pointer ${
                language === "bn"
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              বাং
            </button>
            <button
              onClick={() => setLanguage("hi")}
              className={`px-2 py-1 rounded-full transition-all cursor-pointer ${
                language === "hi"
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              हिं
            </button>
            <button
              onClick={() => setLanguage("kok")}
              className={`px-2 py-1 rounded-full transition-all cursor-pointer ${
                language === "kok"
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Kok
            </button>
          </div>

          {/* Bell Icon with Red Badge */}
          <button
            onClick={() => navigate("/danger-alerts")}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 flex items-center justify-center transition-all cursor-pointer relative"
            title={t("alerts")}
          >
            <Bell className="w-4 h-4" />
            {urgentCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-black flex items-center justify-center ring-2 ring-white">
                {urgentCount}
              </span>
            )}
          </button>

          {/* Settings Icon */}
          <button
            onClick={() => navigate("/settings")}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 flex items-center justify-center transition-all cursor-pointer"
            title={t("settingsTitle")}
          >
            <SettingsIcon className="w-4 h-4" />
          </button>

          {rightAction}
        </div>
      </div>
    </header>
  );
}
