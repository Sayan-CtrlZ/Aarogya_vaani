import React, { useState, useMemo } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Stethoscope,
  AlertTriangle,
  UsersRound,
  Activity,
  LogOut,
  Building2,
  ShieldCheck,
} from "lucide-react";
import { getAllPatients } from "../../utils/patientStore";

export default function DoctorDashboard() {
  const navigate = useNavigate();

  // Load doctor profile from session or fallback
  const doctorProfile = useMemo(() => {
    try {
      const stored =
        sessionStorage.getItem("aarogyaVaaniUserProfile") ||
        localStorage.getItem("aarogyaVaaniActiveUser");
      if (stored) return JSON.parse(stored);
    } catch {}
    return {
      userName: "Dr. S. Roy",
      facility: "Bishalgarh CHC",
      district: "Sepahijala District",
      workerId: "MO-8841",
      role: "doctor",
    };
  }, []);

  const patientsList = useMemo(() => getAllPatients(), []);

  const emergencyCount = useMemo(() => {
    return patientsList.filter(
      (p) => p.triage === "Critical Red Flag" || p.status === "Urgent"
    ).length;
  }, [patientsList]);

  const handleSignOut = () => {
    sessionStorage.removeItem("aarogyaVaaniRole");
    sessionStorage.removeItem("aarogyaVaaniUserProfile");
    localStorage.removeItem("aarogyaVaaniActiveUser");
    navigate("/login?role=doctor", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans text-slate-800">
      {/* 1. Indian Tricolor Micro Stripe */}
      <div className="gov-tricolor-bar" />

      {/* 2. Unified Doctor Portal Clinical Header */}
      <header className="w-full bg-white/95 backdrop-blur-xl border-b border-slate-200/90 sticky top-0 z-40 shadow-xs">
        <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
          {/* Brand & Clinic Node */}
          <div className="flex items-center justify-between w-full md:w-auto gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-800 to-indigo-900 text-white flex items-center justify-center shadow-md">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black tracking-tight text-slate-900 block leading-tight">
                    Aarogya<span className="text-blue-700">Vaani</span>
                  </span>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200/60">
                    Doctor Portal
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold mt-0.5">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-slate-400" />
                    {doctorProfile.facility || "Bishalgarh CHC"}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span>{doctorProfile.district || "Sepahijala District"}</span>
                </div>
              </div>
            </div>

            {/* Mobile Sign Out button */}
            <button
              onClick={handleSignOut}
              className="md:hidden p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Subpage Tabs */}
          <nav className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200/80 w-full md:w-auto overflow-x-auto">
            <NavLink
              to="/doctor/review"
              className={({ isActive }) =>
                `flex-1 md:flex-none px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-white text-blue-900 shadow-xs border border-blue-600/20 font-black"
                    : "text-slate-600 hover:text-slate-900"
                }`
              }
            >
              <Stethoscope className="w-3.5 h-3.5 text-blue-700" />
              <span>Clinical Review & Rx</span>
            </NavLink>

            <NavLink
              to="/doctor/emergency"
              className={({ isActive }) =>
                `flex-1 md:flex-none px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-white text-rose-900 shadow-xs border border-rose-600/20 font-black"
                    : "text-slate-600 hover:text-slate-900"
                }`
              }
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span>Emergency Queue</span>
              {emergencyCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] flex items-center justify-center font-bold">
                  {emergencyCount}
                </span>
              )}
            </NavLink>

            <NavLink
              to="/doctor/patients"
              className={({ isActive }) =>
                `flex-1 md:flex-none px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-white text-slate-900 shadow-xs border border-slate-300 font-black"
                    : "text-slate-600 hover:text-slate-900"
                }`
              }
            >
              <UsersRound className="w-3.5 h-3.5 text-slate-600" />
              <span>Patient Registry</span>
              <span className="text-[10px] text-slate-400 font-semibold">
                ({patientsList.length})
              </span>
            </NavLink>

            <NavLink
              to="/doctor/analytics"
              className={({ isActive }) =>
                `flex-1 md:flex-none px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-white text-teal-900 shadow-xs border border-teal-600/20 font-black"
                    : "text-slate-600 hover:text-slate-900"
                }`
              }
            >
              <Activity className="w-3.5 h-3.5 text-teal-700" />
              <span>OPD Stats & ABDM</span>
            </NavLink>
          </nav>

          {/* Right: Doctor Identity & Clean Sign Out */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="w-7 h-7 rounded-xl bg-blue-700 text-white flex items-center justify-center text-xs font-black">
                {(doctorProfile.userName || "D")[0]}
              </div>
              <div className="text-left">
                <span className="text-xs font-black text-slate-900 block leading-tight">
                  {doctorProfile.userName || "Dr. S. Roy"}
                </span>
                <span className="text-[10px] text-slate-500 font-bold block">
                  {doctorProfile.workerId || "MO-8841"}
                </span>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:border-rose-200 border border-slate-200 text-slate-600 hover:text-rose-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              title="Sign Out of Doctor Session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* 3. Main Outlet Container for Subpages */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
