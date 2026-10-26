import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Stethoscope,
  UsersRound,
  Calendar,
  FileText,
  Layers,
  Activity,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

/**
 * DoctorSidebar
 * 
 * Identical styling to PatientSidebar:
 * - Collapsible with animated transition (64px <-> width)
 * - Vertical divider toggle button (< / >)
 * - Identical active state colors (emerald bg, text, and icons)
 * - Secondary bottom links (Settings, Sign Out)
 */
export default function DoctorSidebar({
  activeNav,
  width = 240,
  isCollapsed: controlledCollapsed,
  setIsCollapsed: controlledSetCollapsed,
  inQueueCount = 5,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const [internalCollapsed, setInternalCollapsed] = useState(() => {
    try {
      return localStorage.getItem("aarogya_doctor_sidebar_collapsed") === "true";
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
      localStorage.setItem("aarogya_doctor_sidebar_collapsed", String(next));
    } catch {}
  };

  const handleNavClick = (path) => {
    if (path) navigate(path);
  };

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.removeItem("aarogyaVaaniDoctorSession");
    localStorage.removeItem("aarogyaVaaniDoctor");
    localStorage.removeItem("aarogyaVaaniActiveUser");
    localStorage.removeItem("aarogyaVaaniRole");
    navigate("/");
  };

  // Determine which tab is active based on path and search
  const isItemActive = (key) => {
    if (activeNav) return activeNav === key;
    const path = location.pathname;
    const search = location.search;

    if (key === "review") return path.startsWith("/doctor/review");
    if (key === "patients") return path.includes("/doctor/patients") && !search.includes("tab=");
    if (key === "appointments") return path.includes("/doctor/patients") && search.includes("tab=appointments");
    if (key === "prescriptions") return path.includes("/doctor/patients") && search.includes("tab=prescriptions");
    if (key === "vault") return path.includes("/doctor/patients") && search.includes("tab=vault");
    if (key === "analytics") return path.startsWith("/doctor/analytics");
    return false;
  };

  const navItems = [
    {
      key: "review",
      label: "Clinical Review",
      icon: Stethoscope,
      path: "/doctor/review",
    },
    {
      key: "patients",
      label: "Patient Queue",
      icon: UsersRound,
      path: "/doctor/patients",
      badge: inQueueCount,
    },
    {
      key: "appointments",
      label: "Appointments",
      icon: Calendar,
      path: "/doctor/patients?tab=appointments",
    },
    {
      key: "prescriptions",
      label: "Prescriptions",
      icon: FileText,
      path: "/doctor/patients?tab=prescriptions",
    },
    {
      key: "vault",
      label: "Reports Vault",
      icon: Layers,
      path: "/doctor/patients?tab=vault",
    },
    {
      key: "analytics",
      label: "Analytics",
      icon: Activity,
      path: "/doctor/analytics",
    },
  ];

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
            {navItems.map((item) => {
              const active = isItemActive(item.key);
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  onClick={() => handleNavClick(item.path)}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center ${
                    isCollapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5"
                  } rounded-xl text-xs font-medium transition cursor-pointer ${
                    active
                      ? "bg-[#e8f8f0] dark:bg-emerald-950/40 text-[#059669] dark:text-emerald-400 font-semibold shadow-2xs"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 shrink-0 ${
                      active
                        ? "text-[#059669] dark:text-emerald-400"
                        : "text-slate-500 dark:text-slate-400"
                    }`}
                  />
                  {!isCollapsed && (
                    <span className="truncate flex-1 text-left">{item.label}</span>
                  )}
                  {!isCollapsed && item.badge !== undefined && (
                    <span className="ml-auto px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Secondary Bottom Links */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
          <button
            onClick={() => handleNavClick("/doctor/analytics")}
            title={isCollapsed ? "Settings" : undefined}
            className={`w-full flex items-center ${
              isCollapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5"
            } rounded-xl text-xs font-medium transition cursor-pointer text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white`}
          >
            <Settings className="w-5 h-5 shrink-0 text-slate-500 dark:text-slate-400" />
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
