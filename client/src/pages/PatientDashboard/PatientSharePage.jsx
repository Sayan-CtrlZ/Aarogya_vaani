import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Share2,
  KeyRound,
  ShieldCheck,
  Copy,
  Check,
  MessageCircle,
  Clock,
  History,
  Lock,
  Trash2,
  FileText,
  User,
  CheckCircle2,
  Stethoscope,
} from "lucide-react";
import PatientSidebar from "../../components/PatientSidebar";
import PatientHeader from "../../components/PatientHeader";
import { getCurrentPatient } from "../../utils/patientStore";
import {
  getAccessCodes,
  generateTemporaryCode,
  revokeAccessCode,
  getAuditLogs,
} from "../../utils/accessCodeStore";
import {
  generateShareCode,
  fetchShareCodes,
  revokeShareCode,
  fetchShareAuditLogs,
} from "../../services/api";

export default function PatientSharePage() {
  const navigate = useNavigate();
  const patient = getCurrentPatient() || {};

  // Sidebar drag & resize state
  const [leftWidth, setLeftWidth] = useState(240);
  const [isDraggingLeft, setIsDraggingLeft] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem("aarogya_sidebar_collapsed") === "true";
    } catch {
      return false;
    }
  });

  // Sharing records scope
  const [shareScope, setShareScope] = useState({
    recentConsultation: true,
    prescriptions: true,
    labReports: true,
  });

  const [shareDuration, setShareDuration] = useState(24); // hours
  const [activeGeneratedCode, setActiveGeneratedCode] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const [accessCodes, setAccessCodes] = useState(() => getAccessCodes());
  const [auditLogs, setAuditLogs] = useState(() => getAuditLogs());

  // Load active share codes and audit logs from FastAPI backend
  useEffect(() => {
    const pId = patient?.patient_ref || patient?.id || "AV-2026-8921";
    const normalizedPId = pId.startsWith("AV-") && pId.length === 7 ? `AV-2026-${pId.slice(3)}` : pId;

    fetchShareCodes(normalizedPId).then((codes) => {
      if (Array.isArray(codes) && codes.length > 0) {
        setAccessCodes(codes);
      }
    });

    fetchShareAuditLogs(normalizedPId).then((logs) => {
      if (Array.isArray(logs) && logs.length > 0) {
        setAuditLogs(logs);
      }
    });
  }, [patient?.patient_ref, patient?.id]);

  // Track sidebar drag
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
    };
  }, [isDraggingLeft]);

  // Generate Doctor Share Passcode & Link
  const handleGenerateShareCode = async () => {
    const pId = patient?.patient_ref || patient?.id || "AV-2026-8921";
    const pName = patient?.name || "Hare Krishna";
    const durationMins = shareDuration * 60;

    const localCodeObj = generateTemporaryCode({
      patientId: pId,
      patientName: pName,
      durationMinutes: durationMins,
      scope: shareScope,
    });

    try {
      const remoteCode = await generateShareCode({
        patientId: pId,
        patientName: pName,
        durationHours: shareDuration,
        scope: shareScope,
      });
      const activeObj = remoteCode || localCodeObj;
      setActiveGeneratedCode(activeObj);
      setAccessCodes((prev) => [activeObj, ...prev.filter((c) => c.code !== activeObj.code)]);
    } catch {
      setActiveGeneratedCode(localCodeObj);
      setAccessCodes(getAccessCodes());
    }

    setAuditLogs(getAuditLogs());
  };

  // Revoke Share Code
  const handleRevokeShare = async (codeStr) => {
    try {
      await revokeShareCode(codeStr);
    } catch {}
    revokeAccessCode(codeStr);
    setAccessCodes((prev) => prev.filter((c) => c.code !== codeStr && c.id !== codeStr));
    setAuditLogs(getAuditLogs());
    if (activeGeneratedCode && (activeGeneratedCode.code === codeStr || activeGeneratedCode.id === codeStr)) {
      setActiveGeneratedCode(null);
    }
  };

  // Share via WhatsApp
  const handleShareWhatsApp = (codeStr) => {
    const pName = patient?.name || "Hare Krishna";
    const shareUrl = `${window.location.origin}/doctor?access_code=${encodeURIComponent(codeStr)}`;
    const msg = `Namaskar Doctor. This is ${pName}'s health records link from AarogyaVaani (National Health Mission).\n\nAccess Link: ${shareUrl}\nTemporary Doctor Code: ${codeStr}\nValid for: ${shareDuration} hours.`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const copyToClipboard = (text, type = "code") => {
    navigator.clipboard?.writeText?.(text);
    if (type === "link") {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } else {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="h-screen w-screen bg-[#f8fafc] dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex flex-col overflow-hidden font-sans antialiased select-none">
      {/* 1. UNIVERSAL TOP HEADER */}
      <PatientHeader />

      {/* 2. BODY CONTAINER */}
      <div className="flex-1 flex flex-row min-h-0 overflow-hidden gap-0">
        {/* UNIVERSAL LEFT SIDEBAR */}
        <PatientSidebar
          activeNav="share"
          width={leftWidth}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />

      {/* 2. RESIZER HANDLE */}
      {!isCollapsed && (
        <div
          onMouseDown={() => setIsDraggingLeft(true)}
          onDoubleClick={() => setLeftWidth(240)}
          className="w-1 cursor-col-resize hover:w-1.5 hover:bg-emerald-500/25 transition-all relative z-20 select-none"
          title="Drag to resize sidebar (Double-click to reset)"
        />
      )}

      {/* 3. MAIN WORKSPACE CONTAINER */}
      <main className="flex-1 h-full bg-white dark:bg-slate-900 overflow-y-auto flex flex-col">
        <div className="p-6 sm:p-8 w-full space-y-6">

          {/* PAGE TITLE BAR */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-100">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Share Records with Doctor
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Generate a secure, time-bound link or 6-digit access code for your doctor
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Patient-Controlled Access</span>
              </span>
            </div>
          </div>

          {/* 1. SHARE GENERATOR CARD (Flat & Clean) */}
          <div className="p-5 rounded-xl border border-slate-200 space-y-5">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-1 border-b border-slate-100 flex items-center gap-2">
              <KeyRound className="w-3.5 h-3.5 text-slate-500" />
              <span>Create Doctor Access Code</span>
            </h3>

            {/* Select Records */}
            <div className="space-y-2 text-xs">
              <span className="font-semibold text-slate-700 block">
                1. Select records to include:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="flex items-center gap-2.5 p-3 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100/60">
                  <input
                    type="checkbox"
                    checked={shareScope.recentConsultation}
                    onChange={(e) => setShareScope({ ...shareScope, recentConsultation: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 accent-[#059669]"
                  />
                  <div>
                    <p className="font-semibold text-slate-800">Voice Consultations</p>
                    <p className="text-[11px] text-slate-500">Summary & symptoms</p>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 p-3 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100/60">
                  <input
                    type="checkbox"
                    checked={shareScope.prescriptions}
                    onChange={(e) => setShareScope({ ...shareScope, prescriptions: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 accent-[#059669]"
                  />
                  <div>
                    <p className="font-semibold text-slate-800">Prescriptions</p>
                    <p className="text-[11px] text-slate-500">Active medicines & dosage</p>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 p-3 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100/60">
                  <input
                    type="checkbox"
                    checked={shareScope.labReports}
                    onChange={(e) => setShareScope({ ...shareScope, labReports: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 accent-[#059669]"
                  />
                  <div>
                    <p className="font-semibold text-slate-800">Medical Reports</p>
                    <p className="text-[11px] text-slate-500">Uploaded lab tests & files</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Select Duration */}
            <div className="space-y-2 text-xs">
              <span className="font-semibold text-slate-700 block">
                2. Access duration:
              </span>
              <div className="flex items-center gap-2">
                {[
                  { hours: 1, label: "1 Hour (Quick Visit)" },
                  { hours: 24, label: "24 Hours (Today's OPD)" },
                  { hours: 168, label: "7 Days (Follow-up)" },
                ].map((dur) => (
                  <button
                    key={dur.hours}
                    type="button"
                    onClick={() => setShareDuration(dur.hours)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer ${
                      shareDuration === dur.hours
                        ? "bg-slate-800 text-white border-slate-800"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {dur.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              type="button"
              onClick={handleGenerateShareCode}
              className="w-full py-2.5 rounded-lg bg-[#059669] hover:bg-[#047857] text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Generate Doctor Access Passcode & Link</span>
            </button>
          </div>

          {/* 2. ACTIVE GENERATED PASSCODE CARD */}
          {activeGeneratedCode && (
            <div className="p-5 rounded-xl border border-slate-300 bg-slate-50/70 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-slate-600" />
                  Active Doctor Passcode
                </span>
                <span className="text-[10px] font-semibold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded">
                  Valid for {shareDuration} hours
                </span>
              </div>

              {/* Big Readable Passcode */}
              <div className="p-4 rounded-lg bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Doctor Passcode:</span>
                  <p className="font-mono text-2xl sm:text-3xl font-bold text-slate-900 tracking-wider">
                    {activeGeneratedCode.code}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(activeGeneratedCode.code, "code")}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? "Copied" : "Copy Code"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleShareWhatsApp(activeGeneratedCode.code)}
                    className="px-3 py-1.5 rounded-lg bg-[#059669] hover:bg-[#047857] text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Share on WhatsApp</span>
                  </button>
                </div>
              </div>

              {/* Link */}
              <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs flex items-center justify-between gap-2">
                <span className="font-mono text-[11px] truncate text-slate-500">
                  {window.location.origin}/doctor?access_code={activeGeneratedCode.code}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(`${window.location.origin}/doctor?access_code=${activeGeneratedCode.code}`, "link")
                  }
                  className="text-emerald-700 font-semibold hover:underline shrink-0 text-xs cursor-pointer"
                >
                  {copiedLink ? "Copied Link!" : "Copy Link"}
                </button>
              </div>

              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-[11px] text-slate-500">
                  Doctor gets read-only access. You can stop sharing at any second.
                </span>
                <button
                  type="button"
                  onClick={() => handleRevokeShare(activeGeneratedCode.code)}
                  className="text-red-600 hover:text-red-800 font-semibold cursor-pointer underline text-xs"
                >
                  Stop Sharing Now
                </button>
              </div>
            </div>
          )}

          {/* 3. DOCTOR ACCESS AUDIT LOG */}
          <div className="p-5 rounded-xl border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-slate-500" />
              <span>Doctor Access History</span>
            </h3>

            <div className="divide-y divide-slate-100 text-xs">
              {auditLogs.slice(0, 4).map((log, idx) => (
                <div key={idx} className="py-2 flex items-center justify-between text-slate-600">
                  <div>
                    <span className="font-semibold text-slate-800">{log.accessorName || "Dr. S. Roy"}</span>
                    <span className="text-slate-400 mx-1.5">·</span>
                    <span className="text-slate-500">{log.facility || "Bishalgarh CHC"}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {new Date(log.timestamp).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
      </div>

    </div>
  );
}
