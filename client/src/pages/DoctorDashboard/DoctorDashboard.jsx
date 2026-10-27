import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import DoctorHeader from "../../components/DoctorHeader";
import DoctorSidebar from "../../components/DoctorSidebar";
import { getAllPatients } from "../../utils/patientStore";
import { verifyAccessCode } from "../../utils/accessCodeStore";

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const accessCodeParam = searchParams.get("access_code") || searchParams.get("code");

  const [patients, setPatients] = useState(() => getAllPatients());

  // Collapsible sidebar state & resizer (identical to PatientDashboard)
  const [leftWidth, setLeftWidth] = useState(240);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem("aarogya_doctor_sidebar_collapsed") === "true";
    } catch {
      return false;
    }
  });
  const [isDraggingLeft, setIsDraggingLeft] = useState(false);

  // Compute live queue number for sidebar badge
  const inQueueCount = patients.filter((p) => p.status === "In Queue" || p.status === "Current").length || 6;

  // Sync patients
  useEffect(() => {
    setPatients(getAllPatients());
  }, [location.pathname]);

  // Mouse drag tracking for resizing sidebar
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDraggingLeft) {
        const newWidth = Math.min(420, Math.max(180, e.clientX));
        setLeftWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      if (isDraggingLeft) {
        setIsDraggingLeft(false);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      }
    };

    if (isDraggingLeft) {
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isDraggingLeft]);

  // Handle shared access code from URL parameters
  useEffect(() => {
    if (accessCodeParam && !location.pathname.includes("/doctor/access")) {
      const codeCheck = verifyAccessCode(accessCodeParam.trim().toUpperCase());
      if (codeCheck?.valid && codeCheck.codeData) {
        navigate(`/doctor/review?id=${codeCheck.codeData.patientId}&code=${accessCodeParam.trim().toUpperCase()}`, { replace: true });
      }
    }
  }, [accessCodeParam, location.pathname, navigate]);

  return (
    <div className="h-screen w-screen bg-[#F7F9FC] dark:bg-slate-950 text-[#172033] dark:text-slate-100 flex flex-col overflow-hidden font-sans antialiased selection:bg-[#059669]/20 selection:text-[#047857]">
      {/* 1. UNIVERSAL TOP HEADER */}
      <DoctorHeader />

      {/* 2. BODY CONTAINER: SIDEBAR + MAIN */}
      <div className="flex-1 flex flex-row min-h-0 overflow-hidden gap-0">
        {/* UNIVERSAL DOCTOR LEFT SIDEBAR */}
        <DoctorSidebar
          width={leftWidth}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          inQueueCount={inQueueCount}
        />

        {/* RESIZER HANDLE */}
        {!isCollapsed && (
          <div
            onMouseDown={() => setIsDraggingLeft(true)}
            onDoubleClick={() => setLeftWidth(240)}
            className="w-1 cursor-col-resize hover:w-1.5 hover:bg-[#059669]/30 transition-all relative z-20 select-none bg-transparent"
            title="Drag to resize sidebar (Double-click to reset)"
          />
        )}

        {/* 3. MAIN WORKSPACE */}
        <main className="flex-1 h-full bg-[#F7F9FC] dark:bg-slate-950 overflow-hidden p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
