import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Printer,
  Download,
  Share2,
  X,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Stethoscope,
  Calendar,
  Clock,
  User,
  HeartPulse,
  Pill,
  ExternalLink,
  FileText,
} from "lucide-react";

export default function ClinicalReportModal({ report, onClose }) {
  const navigate = useNavigate();
  const printRef = useRef(null);

  if (!report) return null;

  const {
    reportId,
    displayDate,
    displayTime,
    durationFormatted,
    patient,
    attendingOfficer,
    triageLevel,
    chiefComplaint,
    symptomsTimeline,
    provisionalDiagnosis,
    clinicalSummary,
    supportiveCare = [],
    prescriptions = [],
    redFlagsEmergency = [],
    followUpGuidance,
    doctorStatus,
    transcript = [],
  } = report;

  const isEmergency = triageLevel === "EMERGENCY";
  const isMonitor = triageLevel === "MONITOR";

  const triageBadgeBg = isEmergency
    ? "bg-rose-100 text-rose-800 border-rose-300"
    : isMonitor
    ? "bg-amber-100 text-amber-800 border-amber-300"
    : "bg-emerald-100 text-emerald-800 border-emerald-300";

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Control Bar (Non-printable) */}
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900">Clinical Consultation & Triage Report</span>
              <p className="text-[10px] text-slate-500 font-mono">Reference ID: {reportId}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
              title="Print or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Print / PDF</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                navigate("/patient/consultations");
              }}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <span>Consultations History</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-200/80 hover:bg-slate-300 text-slate-700 flex items-center justify-center transition cursor-pointer"
              title="Close Report"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Medical Sheet Body */}
        <div ref={printRef} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 bg-white text-slate-900 print:p-0 print:m-0">
          
          {/* 1. Official Health Department Header */}
          <div className="border-b-2 border-emerald-700 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-md shrink-0">
                <Stethoscope className="w-7 h-7" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                  Government of Tripura · Directorate of Health Services
                </p>
                <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight leading-none mt-0.5">
                  AarogyaVaani Primary Healthcare Network
                </h1>
                <p className="text-xs text-slate-600 font-medium mt-1">
                  Tele-Health Clinical Triage & Intake Consultation Summary
                </p>
              </div>
            </div>

            <div className="sm:text-right shrink-0">
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-black uppercase tracking-wider ${triageBadgeBg}`}>
                {isEmergency ? (
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                ) : isMonitor ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                )}
                <span>TRIAGE: {triageLevel}</span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono mt-1.5">
                {displayDate} · {displayTime}
              </p>
              <p className="text-[10px] text-slate-400">Duration: {durationFormatted}</p>
            </div>
          </div>

          {/* 2. Patient Demographics Strip */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Patient Name</span>
              <p className="font-extrabold text-slate-900 text-sm">{patient?.name}</p>
              <p className="text-[11px] text-emerald-700 font-semibold">{patient?.category}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Patient ID & Age</span>
              <p className="font-mono font-bold text-slate-800">{patient?.id}</p>
              <p className="text-slate-600">{patient?.age} Yrs · {patient?.gender}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Blood Group & Context</span>
              <p className="font-bold text-slate-800">Blood: {patient?.bloodGroup}</p>
              <p className="text-slate-600">{patient?.pregnancy || "Non-maternal"}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Facility / Location</span>
              <p className="font-bold text-slate-800">{patient?.phcFacility}</p>
              <p className="text-slate-500 text-[11px]">{patient?.district}</p>
            </div>
          </div>

          {/* 3. Chief Complaint & Timeline */}
          <div className="space-y-1.5">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <span>1. Chief Complaint & Symptoms Timeline</span>
            </h2>
            <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-xl p-3.5 text-xs text-slate-800 leading-relaxed">
              <strong className="text-slate-950 font-bold block mb-1">
                Primary Issue: {chiefComplaint}
              </strong>
              <p className="text-slate-600">
                <span className="font-semibold text-slate-700">Timeline / Evolution: </span>
                {symptomsTimeline}
              </p>
            </div>
          </div>

          {/* 4. Clinical Assessment & Provisional Diagnosis */}
          <div className="space-y-1.5">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-500">
              2. Provisional Clinical Assessment & Triage
            </h2>
            <div className="border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs bg-white">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="font-bold text-slate-900 text-sm">
                  Provisional Diagnosis: <span className="text-emerald-800">{provisionalDiagnosis}</span>
                </span>
                <span className="text-[11px] font-semibold text-slate-500">
                  Algorithm: Indian PHC Standard Triage Guidelines
                </span>
              </div>
              <p className="text-slate-700 leading-relaxed font-medium">
                {clinicalSummary}
              </p>
              {report?.attachedDocument && (
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-start gap-2.5 bg-emerald-50/60 p-2.5 rounded-lg border border-emerald-100">
                  <FileText className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div className="text-[11px] leading-tight">
                    <span className="font-bold text-emerald-950">
                      Reviewed Patient Document: {report.attachedDocument.title}
                    </span>
                    <span className="text-emerald-700 ml-1.5 font-semibold">({report.attachedDocument.category})</span>
                    <p className="text-emerald-900/80 font-normal mt-0.5">
                      {report.attachedDocument.summary}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 5. Recommended Prescriptions / Symptomatic Regimen */}
          {prescriptions.length > 0 && (
            <div className="space-y-1.5">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Pill className="w-3.5 h-3.5 text-emerald-700" />
                <span>3. Recommended Symptomatic Care & Medications</span>
              </h2>
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold text-[11px]">
                      <th className="p-2.5">Medication / Measure</th>
                      <th className="p-2.5">Dosage & Frequency</th>
                      <th className="p-2.5">Duration</th>
                      <th className="p-2.5">Clinical Instructions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {prescriptions.map((rx, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80">
                        <td className="p-2.5 font-bold text-slate-900">{rx.name}</td>
                        <td className="p-2.5 text-emerald-800 font-semibold">{rx.dosage}</td>
                        <td className="p-2.5 text-slate-600 font-medium">{rx.duration}</td>
                        <td className="p-2.5 text-slate-600">{rx.notes || "As directed"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 6. Supportive Home Management */}
          {supportiveCare.length > 0 && (
            <div className="space-y-1.5">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-500">
                4. Supportive Home Care Advice
              </h2>
              <ul className="list-disc list-inside space-y-1 text-xs text-slate-700 bg-slate-50/70 border border-slate-200 rounded-xl p-3.5">
                {supportiveCare.map((item, idx) => (
                  <li key={idx} className="leading-relaxed">
                    <span className="font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 7. Clinical Red Flags & Emergency Guidance */}
          <div className="border-2 border-rose-200 bg-rose-50/60 rounded-xl p-3.5 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-rose-800 font-bold">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Critical Red Flags — When to Seek Immediate Physical Emergency Care:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-rose-950 font-medium">
              {redFlagsEmergency.map((flag, idx) => (
                <li key={idx}>{flag}</li>
              ))}
            </ul>
            <p className="text-[11px] text-rose-900 font-bold pt-1">
              {followUpGuidance}
            </p>
          </div>

          {/* 8. Verbatim Consultation Log (Collapsible or Clean Box) */}
          {transcript.length > 0 && (
            <div className="space-y-1.5">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-500">
                5. Spoken Dialogue Transcript Record
              </h2>
              <div className="border border-slate-200 rounded-xl p-3 max-h-48 overflow-y-auto space-y-2 bg-slate-50/50 text-[11px]">
                {transcript.map((t, idx) => (
                  <div key={idx} className="flex gap-2 leading-relaxed">
                    <strong className={t.role === "user" ? "text-slate-900 shrink-0" : "text-emerald-800 shrink-0"}>
                      {t.role === "user" ? `${patient?.name || "Patient"}:` : "Dr. Preeti Sharma (AI Doctor):"}
                    </strong>
                    <span className="text-slate-700">{t.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 9. Sign-off & Counter-signature Footer */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 text-xs">
            <div>
              <p className="font-bold text-slate-900">{attendingOfficer?.name}</p>
              <p className="text-slate-500">{attendingOfficer?.designation}</p>
              <p className="text-[10px] text-slate-400 font-mono">Reg. No: {attendingOfficer?.licenseNumber}</p>
              <p className="text-[10px] text-slate-400">{attendingOfficer?.facility}</p>
            </div>

            <div className="text-left sm:text-right border-l sm:border-l-0 sm:border-t-0 pl-3 sm:pl-0">
              <div className="inline-block px-3 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold">
                {doctorStatus}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Generated via AarogyaVaani Multi-Lingual Clinical Engine v2.4
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Actions Bar (Non-printable) */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="text-xs text-slate-500">
            ✓ Report permanently recorded in Patient EHR & Community Health Center Queue.
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                onClose();
                navigate(`/doctor/review?id=${patient?.id}`);
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Review in Doctor Dashboard</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Report / PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold transition cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
