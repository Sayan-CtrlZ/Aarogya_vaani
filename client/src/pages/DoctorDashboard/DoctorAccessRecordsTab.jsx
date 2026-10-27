import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Key, Clock, ShieldCheck, ArrowRight, User, AlertCircle, CheckCircle2, Sparkles } from "lucide-react";
import { verifyShareCode, fetchDoctorRecentAccessHistory } from "../../services/api";
import { verifyAccessCode, logAuditEvent } from "../../utils/accessCodeStore";
import { getPatientById } from "../../utils/patientStore";

export default function DoctorAccessRecordsTab() {
  const navigate = useNavigate();
  const [accessCode, setAccessCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successInfo, setSuccessInfo] = useState(null);

  // Default initial recent access history matching user spec
  const [recentAccess, setRecentAccess] = useState([
    {
      id: 1,
      name: "Mamta Debbarma",
      patientId: "AV-2026-8921",
      code: "749201",
      time: "Today, 10:45 AM",
      active: true,
    },
    {
      id: 2,
      name: "Bappaditya Paul",
      patientId: "AV-2026-4454",
      code: "592014",
      time: "25 Oct, 09:15 AM",
      active: false,
    },
    {
      id: 3,
      name: "Hare Krishna",
      patientId: "AV-2026-7316",
      code: "384912",
      time: "24 Oct, 11:30 AM",
      active: false,
    },
  ]);

  // Load real history from backend if available
  useEffect(() => {
    let isMounted = true;
    async function loadBackendHistory() {
      try {
        const logs = await fetchDoctorRecentAccessHistory();
        if (logs && Array.isArray(logs) && logs.length > 0 && isMounted) {
          const mapped = logs.map((log, idx) => ({
            id: log.id || idx + 1,
            name: log.patient_name || log.patientName || "Patient",
            patientId: log.patient_id || log.patientId || "AV-2026-8921",
            code: log.code || "749201",
            time: log.time || log.accessed_at || "Recently",
            active: log.active ?? (idx === 0),
          }));
          setRecentAccess(mapped);
        }
      } catch (e) {
        // Fallback to initial seeded list
      }
    }
    loadBackendHistory();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleAccess = async (e) => {
    if (e) e.preventDefault();
    const cleanCode = accessCode.trim().toUpperCase();
    if (!cleanCode) return;

    setIsLoading(true);
    setErrorMessage("");
    setSuccessInfo(null);

    try {
      let verifiedPatientId = null;
      let patientName = "Patient";

      // 1. Try real FastAPI backend verify
      try {
        const res = await verifyShareCode({
          code: cleanCode,
          doctorName: "Dr. S. Roy",
          facility: "Bishalgarh Community Health Centre",
        });
        if (res && res.status === "AUTHORIZED") {
          verifiedPatientId = res.patient_id;
          patientName = res.patient_name || "Patient";
        }
      } catch (apiErr) {
        // 2. Fallback to local access code store if backend fails
        const localCheck = verifyAccessCode(cleanCode);
        if (localCheck?.valid && localCheck.codeData) {
          verifiedPatientId = localCheck.codeData.patientId;
          patientName = localCheck.codeData.patientName;
        } else {
          // If code is one of the known demo codes
          if (cleanCode === "749201") {
            verifiedPatientId = "AV-2026-8921";
            patientName = "Mamta Debbarma";
          } else if (cleanCode === "592014") {
            verifiedPatientId = "AV-2026-4454";
            patientName = "Bappaditya Paul";
          } else if (cleanCode === "384912") {
            verifiedPatientId = "AV-2026-7316";
            patientName = "Hare Krishna";
          } else {
            throw new Error(apiErr.message || "Invalid or expired access code.");
          }
        }
      }

      if (!verifiedPatientId) {
        throw new Error("Unable to identify patient from access code.");
      }

      setSuccessInfo({
        name: patientName,
        id: verifiedPatientId,
        code: cleanCode,
      });

      // Record local audit
      logAuditEvent({
        patientId: verifiedPatientId,
        code: cleanCode,
        accessorRole: "Doctor",
        accessorName: "Dr. S. Roy",
        facility: "Bishalgarh Community Health Centre",
        action: "RECORD_VIEWED",
        details: `Access granted via patient code ${cleanCode}. Loaded clinical review.`,
      });

      // Update recent access state
      setRecentAccess((prev) => [
        {
          id: Date.now(),
          name: patientName,
          patientId: verifiedPatientId,
          code: cleanCode,
          time: "Just now",
          active: true,
        },
        ...prev.filter((p) => p.patientId !== verifiedPatientId),
      ]);

      // Seamlessly navigate to Clinical Review with patient and verified code
      setTimeout(() => {
        navigate(`/doctor/review?id=${verifiedPatientId}&code=${cleanCode}`);
      }, 600);

    } catch (err) {
      setErrorMessage(err.message || "Invalid access code. Please check with the patient and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectRecent = (record) => {
    const targetId = record.patientId || "AV-2026-8921";
    const targetCode = record.code || "749201";
    navigate(`/doctor/review?id=${targetId}&code=${targetCode}`);
  };

  const handleFillDemoCode = (code) => {
    setAccessCode(code);
    setErrorMessage("");
  };

  return (
    <div className="min-h-full bg-gray-50/60 dark:bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 font-sans text-gray-900 dark:text-slate-100">
      {/* Container simulating a section in the Doctor's Dashboard */}
      <div className="w-full max-w-lg">
        
        {/* Main Access Card */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-xs">
          
          {/* Header Section */}
          <div className="p-6 border-b border-gray-200 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-md">
                <Key size={20} />
              </div>
              <h2 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
                Access Patient Records
              </h2>
            </div>
            <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed mt-2">
              Enter the 6-digit access code provided by the patient to view their secure medical records, voice consultations, and prescriptions.
            </p>
          </div>

          {/* Form Section */}
          <div className="p-6">
            <form onSubmit={handleAccess} className="space-y-4">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                  Patient Access Code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="code"
                    maxLength={10}
                    value={accessCode}
                    onChange={(e) => {
                      setErrorMessage("");
                      setAccessCode(e.target.value.replace(/[^0-9A-Za-z-]/g, ""));
                    }}
                    placeholder="123456"
                    autoFocus
                    className="w-full border border-gray-300 dark:border-slate-700 dark:bg-slate-800/80 rounded-lg px-4 py-3 text-lg tracking-widest text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-gray-900 dark:focus:border-emerald-500 focus:ring-0 transition-colors uppercase"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500">
                    <ShieldCheck size={20} />
                  </div>
                </div>
              </div>

              {/* Quick Test Demo Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <span className="text-gray-500 dark:text-slate-400 font-medium">Quick Demo:</span>
                <button
                  type="button"
                  onClick={() => handleFillDemoCode("749201")}
                  className="px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 hover:bg-emerald-100 transition-colors font-mono cursor-pointer"
                >
                  749201 (Mamta)
                </button>
                <button
                  type="button"
                  onClick={() => handleFillDemoCode("592014")}
                  className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition-colors font-mono cursor-pointer"
                >
                  592014 (Bappaditya)
                </button>
                <button
                  type="button"
                  onClick={() => handleFillDemoCode("384912")}
                  className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition-colors font-mono cursor-pointer"
                >
                  384912 (Hare Krishna)
                </button>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-sm flex items-start gap-2">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successInfo && (
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-sm flex items-center gap-2">
                  <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
                  <span>
                    Verified! Unlocking <strong>{successInfo.name}</strong>'s dossier and redirecting to Clinical Review...
                  </span>
                </div>
              )}

              <button
                type="submit"
                disabled={accessCode.length < 6 || isLoading}
                className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-md font-medium text-white transition-colors cursor-pointer
                  ${accessCode.length >= 6 && !isLoading
                    ? "bg-emerald-600 hover:bg-emerald-700" 
                    : "bg-gray-300 dark:bg-slate-700 cursor-not-allowed opacity-70"}`}
              >
                {isLoading ? "Verifying..." : "Access Records"}
                {!isLoading && <ArrowRight size={18} />}
              </button>
            </form>
          </div>
        </div>

        {/* Recent History Section */}
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-4 px-1">
            <Clock size={16} className="text-gray-400" />
            <h3 className="text-sm font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
              Recent Access History
            </h3>
          </div>
          
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg divide-y divide-gray-100 dark:divide-slate-800 shadow-xs">
            {recentAccess.map((record) => (
              <div
                key={record.id}
                onClick={() => handleSelectRecent(record)}
                className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-slate-800/60 transition-colors group cursor-pointer"
                title={`Open Clinical Review for ${record.name}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-500 dark:text-slate-400 border border-gray-200 dark:border-slate-700">
                    <User size={14} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {record.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">{record.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {record.active && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/60">
                      Active
                    </span>
                  )}
                  <button
                    type="button"
                    className="text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 opacity-60 group-hover:opacity-100 transition-all p-1"
                  >
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
