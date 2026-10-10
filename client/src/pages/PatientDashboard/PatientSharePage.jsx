import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Share2,
  KeyRound,
  ShieldCheck,
  Copy,
  Check,
  Trash2,
  Clock,
  History,
  Lock,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { getCurrentPatient } from "../../utils/patientStore";
import {
  getAccessCodes,
  generateTemporaryCode,
  revokeAccessCode,
  getAuditLogs
} from "../../utils/accessCodeStore";
import UniversalNavbar from "../../components/UniversalNavbar";

export default function PatientSharePage() {
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();
  const [patient] = useState(() => getCurrentPatient());

  const [accessCodes, setAccessCodes] = useState(() => getAccessCodes());
  const [auditLogs, setAuditLogs] = useState(() => getAuditLogs());

  const [shareScope, setShareScope] = useState({
    currentVisit: true,
    selectedReports: true,
    medicalHistory: false,
  });
  const [shareDuration, setShareDuration] = useState(30);
  const [generatedCode, setGeneratedCode] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setAccessCodes(getAccessCodes());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const handleGenerateCode = () => {
    const scopesArray = [];
    if (shareScope.currentVisit) scopesArray.push("Current Consultation Intake");
    if (shareScope.selectedReports) scopesArray.push("Verified Lab Reports & MCP");
    if (shareScope.medicalHistory) scopesArray.push("Full Chronic & Antenatal History");

    const codeObj = generateTemporaryCode({
      patientId: patient.id,
      patientName: patient.name,
      durationMinutes: shareDuration,
      scopes: scopesArray,
    });

    setGeneratedCode(codeObj);
    setAccessCodes(getAccessCodes());
    setAuditLogs(getAuditLogs());
  };

  const handleRevoke = (codeId) => {
    revokeAccessCode(codeId, "Revoked by patient from dashboard");
    setAccessCodes(getAccessCodes());
    setAuditLogs(getAuditLogs());
    if (generatedCode && generatedCode.id === codeId) {
      setGeneratedCode(null);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard?.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const activeCodesList = accessCodes.filter((c) => c.status === "active");

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      <UniversalNavbar showBack backPath="/patient" />

      {/* 3. Main Content Workspace */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-6">
        
        {/* Passcode Generator Card */}
        <section className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <KeyRound className="w-5 h-5 text-amber-600" />
              <div>
                <h2 className="text-sm sm:text-base font-black text-slate-900">
                  Generate Doctor Access Code
                </h2>
                <span className="text-[11px] text-slate-400 font-medium block">
                  Doctors enter this single-use code to temporarily view authorized records
                </span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-black flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Encrypted</span>
            </span>
          </div>

          {/* Granular Scope Selector */}
          <div className="space-y-3 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/80">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">
              1. Select What Records the Doctor Can View:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-slate-200 cursor-pointer text-xs font-bold text-slate-800 hover:border-amber-400 transition-colors">
                <input
                  type="checkbox"
                  checked={shareScope.currentVisit}
                  onChange={(e) =>
                    setShareScope((prev) => ({ ...prev, currentVisit: e.target.checked }))
                  }
                  className="mt-0.5 rounded text-amber-600"
                />
                <div>
                  <span className="block">Current Visit</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    Symptoms & complaints
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-slate-200 cursor-pointer text-xs font-bold text-slate-800 hover:border-amber-400 transition-colors">
                <input
                  type="checkbox"
                  checked={shareScope.selectedReports}
                  onChange={(e) =>
                    setShareScope((prev) => ({ ...prev, selectedReports: e.target.checked }))
                  }
                  className="mt-0.5 rounded text-amber-600"
                />
                <div>
                  <span className="block">Uploaded Reports</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    Blood tests, MCP card
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-slate-200 cursor-pointer text-xs font-bold text-slate-800 hover:border-amber-400 transition-colors">
                <input
                  type="checkbox"
                  checked={shareScope.medicalHistory}
                  onChange={(e) =>
                    setShareScope((prev) => ({ ...prev, medicalHistory: e.target.checked }))
                  }
                  className="mt-0.5 rounded text-amber-600"
                />
                <div>
                  <span className="block">Medical History</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    Allergies & past visits
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Duration Selector */}
          <div className="space-y-3 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/80">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">
              2. Select How Long Access Stays Valid:
            </h3>
            <div className="grid grid-cols-4 gap-2 text-xs font-bold">
              {[
                { label: "15 Min", val: 15 },
                { label: "30 Min", val: 30 },
                { label: "1 Hour", val: 60 },
                { label: "24 Hours", val: 1440 }
              ].map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setShareDuration(opt.val)}
                  className={`py-2.5 rounded-xl border transition-all cursor-pointer ${
                    shareDuration === opt.val
                      ? "bg-amber-500 text-white border-amber-600 shadow-sm"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleGenerateCode}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-95"
          >
            <KeyRound className="w-4 h-4 text-white" />
            <span>Generate New Access Code</span>
          </button>

          {/* Generated Code Display Card */}
          {generatedCode && (
            <div className="p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 space-y-3 text-center animate-fade-in shadow-inner">
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider block">
                Active Temporary Passcode
              </span>
              <div className="flex items-center justify-center gap-3">
                <span className="text-3xl sm:text-4xl font-mono font-black tracking-widest text-amber-950 bg-white px-5 py-2 rounded-2xl border border-amber-300 shadow-sm">
                  {generatedCode.code}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(generatedCode.code)}
                  className="p-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white transition-all cursor-pointer shadow-md"
                  title="Copy code"
                >
                  {copiedCode ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-amber-900 font-medium">
                Expires at {generatedCode.expiresAt} • Single-use doctor authorization
              </p>
            </div>
          )}
        </section>

        {/* Currently Active Codes List */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              <span>Active Authorized Sessions</span>
            </h3>
            <span className="text-xs text-slate-500 font-bold">
              {activeCodesList.length} Active Code(s)
            </span>
          </div>

          {activeCodesList.length === 0 ? (
            <div className="p-6 rounded-3xl bg-white border border-slate-200 text-center text-xs text-slate-400 font-medium">
              No active doctor access codes. Generate a code above when you need to consult a doctor.
            </div>
          ) : (
            <div className="space-y-3">
              {activeCodesList.map((codeItem) => (
                <div
                  key={codeItem.id}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-base text-amber-900 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200">
                        {codeItem.code}
                      </span>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Active
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                      Scopes: {codeItem.scopes.join(", ")}
                    </p>
                    <span className="text-[11px] text-slate-400 font-medium">
                      Expires: {codeItem.expiresAt}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRevoke(codeItem.id)}
                    className="self-end sm:self-center px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Revoke Immediately</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Security Audit Access Logs Table */}
        <section className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <History className="w-4 h-4 text-slate-500" />
              <span>DPDP Compliance Security Access Logs</span>
            </h3>
            <span className="text-[11px] text-emerald-700 font-bold">
              Immutable Audit Trail
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Accessor / Doctor</th>
                  <th className="py-2.5 px-3">Facility / Terminal</th>
                  <th className="py-2.5 px-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.slice(0, 5).map((log, i) => (
                  <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">{log.timestamp}</td>
                    <td className="py-3 px-3 font-bold text-slate-800">{log.accessor}</td>
                    <td className="py-3 px-3 text-slate-500">{log.facility}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 font-bold text-slate-700 text-[10px]">
                        {log.action}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </main>
    </div>
  );
}
