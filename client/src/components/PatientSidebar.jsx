import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  Calendar,
  Clock,
  Share2,
  User,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

/**
 * Universal Patient Sidebar
 *
 * Streamlined left navigation:
 * - Direct primary tabs (Dashboard, AI Doctor, Appointments, Consultations, Documents, Share Access)
 * - Secondary links (Profile, Settings, Sign Out)
 * - Collapsible with animated slide and vertical divider toggle button (< / >)
 * - Pure white background connected directly with right border and zero gap
 */
export default function PatientSidebar({
  activeNav = "dashboard",
  width = 240,
  isCollapsed: controlledCollapsed,
  setIsCollapsed: controlledSetCollapsed,
}) {
  const navigate = useNavigate();

  const [internalCollapsed, setInternalCollapsed] = useState(() => {
    try {
      return localStorage.getItem("aarogya_sidebar_collapsed") === "true";
    } catch {
      return false;
    }
  });

  const isCollapsed =
    controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;

  const handleToggleCollapse = (e) => {
    e?.stopPropagation?.();
    const next = !isCollapsed;
    if (controlledSetCollapsed) {
      controlledSetCollapsed(next);
    } else {
      setInternalCollapsed(next);
    }
    try {
      localStorage.setItem("aarogya_sidebar_collapsed", String(next));
    } catch {}
  };

  const handleNavClick = (navKey, path) => {
    if (path) navigate(path);
  };

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.removeItem("aarogyaVaaniActiveUser");
    navigate("/login");
  };

  return (
    <div className="relative flex h-full shrink-0 select-none z-30">
      <aside
        style={{ width: isCollapsed ? "64px" : `${width}px` }}
        className={`h-full flex-shrink-0 flex flex-col justify-between bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 ${
          isCollapsed ? "px-2 py-3.5 overflow-hidden" : "px-3 py-3.5 overflow-y-auto overflow-x-hidden"
        } transition-[width,padding] duration-200 ease-in-out select-none`}
      >
        <div className="flex flex-col gap-1 min-w-0">
          {/* Primary Navigation Links */}
          <nav className="space-y-1.5">
            {/* Dashboard */}
            <button
              onClick={() => handleNavClick("dashboard", "/patient")}
              title={isCollapsed ? "Dashboard" : undefined}
              className={`w-full flex items-center ${
                isCollapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5"
              } rounded-xl text-xs font-medium transition cursor-pointer ${
                activeNav === "dashboard"
                  ? "bg-[#e8f8f0] dark:bg-emerald-950/40 text-[#059669] dark:text-emerald-400 font-semibold shadow-2xs"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <LayoutDashboard
                className={`w-5 h-5 shrink-0 ${
                  activeNav === "dashboard"
                    ? "text-[#059669] dark:text-emerald-400"
                    : "text-slate-500 dark:text-slate-400"
                }`}
              />
              {!isCollapsed && <span className="truncate">Dashboard</span>}
            </button>

            {/* AI Doctor */}
            <button
              onClick={() => handleNavClick("ai-doctor", "/patient/ai-doctor")}
              title={isCollapsed ? "AI Doctor" : undefined}
              className={`w-full flex items-center ${
                isCollapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5"
              } rounded-xl text-xs font-medium transition cursor-pointer ${
                activeNav === "ai-doctor"
                  ? "bg-[#e8f8f0] dark:bg-emerald-950/40 text-[#059669] dark:text-emerald-400 font-semibold shadow-2xs"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <MessageSquare
                className={`w-5 h-5 shrink-0 ${
                  activeNav === "ai-doctor"
                    ? "text-[#059669] dark:text-emerald-400 fill-current"
                    : "text-slate-500 dark:text-slate-400"
                }`}
              />
              {!isCollapsed && <span className="truncate">AI Doctor</span>}
            </button>

            {/* Appointments (Book OPD / Health Centre) */}
            <button
              onClick={() => handleNavClick("appointments", "/patient/appointments")}
              title={isCollapsed ? "Appointments" : undefined}
              className={`w-full flex items-center ${
                isCollapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5"
              } rounded-xl text-xs font-medium transition cursor-pointer ${
                activeNav === "appointments"
                  ? "bg-[#e8f8f0] dark:bg-emerald-950/40 text-[#059669] dark:text-emerald-400 font-semibold shadow-2xs"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Calendar
                className={`w-5 h-5 shrink-0 ${
                  activeNav === "appointments"
                    ? "text-[#059669] dark:text-emerald-400"
                    : "text-slate-500 dark:text-slate-400"
                }`}
              />
              {!isCollapsed && <span className="truncate">Appointments</span>}
            </button>

            {/* Consultations (History & Doctor Notes) */}
            <button
              onClick={() => handleNavClick("consultations", "/patient/consultations")}
              title={isCollapsed ? "Consultations" : undefined}
              className={`w-full flex items-center ${
                isCollapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5"
              } rounded-xl text-xs font-medium transition cursor-pointer ${
                activeNav === "consultations"
                  ? "bg-[#e8f8f0] dark:bg-emerald-950/40 text-[#059669] dark:text-emerald-400 font-semibold shadow-2xs"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Clock
                className={`w-5 h-5 shrink-0 ${
                  activeNav === "consultations"
                    ? "text-[#059669] dark:text-emerald-400"
                    : "text-slate-500 dark:text-slate-400"
                }`}
              />
              {!isCollapsed && <span className="truncate">Consultations</span>}
            </button>

            {/* Documents */}
            <button
              onClick={() => handleNavClick("documents", "/patient/documents")}
              title={isCollapsed ? "Documents" : undefined}
              className={`w-full flex items-center ${
                isCollapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5"
              } rounded-xl text-xs font-medium transition cursor-pointer ${
                activeNav === "documents"
                  ? "bg-[#e8f8f0] dark:bg-emerald-950/40 text-[#059669] dark:text-emerald-400 font-semibold shadow-2xs"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <FileText
                className={`w-5 h-5 shrink-0 ${
                  activeNav === "documents"
                    ? "text-[#059669] dark:text-emerald-400"
                    : "text-slate-500 dark:text-slate-400"
                }`}
              />
              {!isCollapsed && <span className="truncate">Documents</span>}
            </button>

            {/* Share Access (Consent & Doctor Passcode) */}
            <button
              onClick={() => handleNavClick("share", "/patient/share")}
              title={isCollapsed ? "Share Access" : undefined}
              className={`w-full flex items-center ${
                isCollapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5"
              } rounded-xl text-xs font-medium transition cursor-pointer ${
                activeNav === "share"
                  ? "bg-[#e8f8f0] dark:bg-emerald-950/40 text-[#059669] dark:text-emerald-400 font-semibold shadow-2xs"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Share2
                className={`w-5 h-5 shrink-0 ${
                  activeNav === "share"
                    ? "text-[#059669] dark:text-emerald-400"
                    : "text-slate-500 dark:text-slate-400"
                }`}
              />
              {!isCollapsed && <span className="truncate">Share Access</span>}
            </button>
          </nav>
        </div>

        {/* Secondary Bottom Links */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
          <button
            onClick={() => navigate("/patient/profile")}
            title={isCollapsed ? "Profile" : undefined}
            className={`w-full flex items-center ${
              isCollapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5"
            } rounded-xl text-xs font-medium transition cursor-pointer ${
              activeNav === "profile"
                ? "bg-[#e8f8f0] dark:bg-emerald-950/40 text-[#059669] dark:text-emerald-400 font-semibold shadow-2xs"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <User
              className={`w-5 h-5 shrink-0 ${
                activeNav === "profile"
                  ? "text-[#059669] dark:text-emerald-400"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            />
            {!isCollapsed && <span className="truncate">Profile</span>}
          </button>

          <button
            onClick={() => handleNavClick("settings", "/patient/settings")}
            title={isCollapsed ? "Settings" : undefined}
            className={`w-full flex items-center ${
              isCollapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5"
            } rounded-xl text-xs font-medium transition cursor-pointer ${
              activeNav === "settings"
                ? "bg-[#e8f8f0] dark:bg-emerald-950/40 text-[#059669] dark:text-emerald-400 font-semibold shadow-2xs"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Settings
              className={`w-5 h-5 shrink-0 ${
                activeNav === "settings"
                  ? "text-[#059669] dark:text-emerald-400"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            />
            {!isCollapsed && <span className="truncate">Settings</span>}
          </button>

          <button
            onClick={handleLogout}
            title={isCollapsed ? "Sign Out" : undefined}
            className={`w-full flex items-center ${
              isCollapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5"
            } rounded-xl text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition cursor-pointer`}
          >
            <LogOut className="w-5 h-5 text-red-500 shrink-0" />
            {!isCollapsed && <span className="truncate">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Vertical divider collapse/expand pill button */}
      <button
        type="button"
        onClick={handleToggleCollapse}
        className="absolute -right-3 top-1/2 -translate-y-1/2 z-40 w-6 h-11 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg rounded-full flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer group"
        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? (
          <ChevronRight className="w-3.5 h-3.5 stroke-[2.8] group-hover:scale-110 transition-transform" />
        ) : (
          <ChevronLeft className="w-3.5 h-3.5 stroke-[2.8] group-hover:scale-110 transition-transform" />
        )}
      </button>
    </div>
  );
}
