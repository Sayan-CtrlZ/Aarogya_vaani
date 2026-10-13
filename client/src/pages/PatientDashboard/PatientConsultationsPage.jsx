import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Stethoscope,
  CheckCircle2,
  Pill,
  Clock,
  UserCheck,
  FileText,
  Printer,
  X,
  Bot,
  User,
  Sparkles,
  MessageSquare,
  AlertTriangle
} from "lucide-react";
import { getCurrentPatient } from "../../utils/patientStore";
import UniversalNavbar from "../../components/UniversalNavbar";
import { getPatientConsultations } from "../../services/api";

export default function PatientConsultationsPage() {
  const navigate = useNavigate();
  const [patient] = useState(() => getCurrentPatient());
  const [remoteConsultations, setRemoteConsultations] = useState([]);
  const [selectedConsultation, setSelectedConsultation] = useState(null);

  useEffect(() => {
    const pId = patient?.patient_ref || patient?.id || "AV-2026-8921";
    const normalizedPId = pId.startsWith("AV-") && pId.length === 7 ? `AV-2026-${pId.slice(3)}` : pId;
    getPatientConsultations(normalizedPId)
      .then((data) => {
        if (Array.isArray(data)) setRemoteConsultations(data);
      })
      .catch((err) => console.warn("[API] Patient consultations load notice:", err));
  }, [patient?.patient_ref, patient?.id]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      <UniversalNavbar showBack backPath="/patient" />

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-6">
        
        {/* Current Active Consultation Card */}
        <section className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <div>
                <h2 className="text-sm sm:text-base font-black text-slate-900">
                  Current Consultation Status
                </h2>
                <span className="text-[11px] text-slate-400 font-semibold block">
                  Active OP Intake & Review
                </span>
              </div>
            </div>
            <span className="text-xs font-black text-emerald-800 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 shadow-2xs">
              {patient.status || "Reviewed"}
            </span>
          </div>

          <div className="text-xs space-y-1.5 text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <p className="font-bold uppercase tracking-wider text-[11px] text-slate-500">Chief Stated Complaint:</p>
            <p className="font-semibold text-slate-800 leading-relaxed text-sm">
              {patient.chiefComplaint || "General Health Intake"}
            </p>
          </div>

          {patient.doctorReview && (
            <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-950">
                <span className="flex items-center gap-1.5 font-black text-sm text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  Doctor Assessment & Signed Plan
                </span>
                <span className="text-slate-500">{patient.doctorReview.reviewedAt}</span>
              </div>
              <p className="text-xs text-emerald-950 font-medium leading-relaxed">
                {patient.doctorReview.notes}
              </p>
              
              <div className="p-3 bg-white rounded-xl border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-mono font-black text-emerald-900">
                  <Pill className="w-4 h-4 text-emerald-600" />
                  <span>Prescription: {patient.doctorReview.prescription}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Attending: {patient.doctorReview.doctorName}</span>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Prior Visits & Cloud Consultations Timeline */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              <span>Prior Consultation Visits</span>
            </h3>
            <span className="text-xs text-slate-400 font-bold">
              {(remoteConsultations.length) + ((patient.priorVisits || []).length)} Recorded Visits
            </span>
          </div>

          <div className="space-y-3">
            {remoteConsultations.length > 0 && (
              <div className="space-y-3 mb-4">
                <span className="text-[11px] font-black text-blue-700 uppercase tracking-wider block">
                  Cloud Synced Consultations ({remoteConsultations.length})
                </span>
                {remoteConsultations.map((c) => (
                  <div
                    key={c.id}
                    className="bg-white rounded-2xl p-4 sm:p-5 border border-blue-200 shadow-2xs space-y-2.5 transition-all hover:shadow-sm"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-sm text-slate-900 flex items-center gap-2">
                        <Stethoscope className="w-4 h-4 text-blue-600" />
                        Voice Consultation ({c.language_used || "bn-IN"})
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                          c.triage_level === "EMERGENCY"
                            ? "bg-rose-100 text-rose-800 border border-rose-200"
                            : c.triage_level === "MONITOR"
                            ? "bg-amber-100 text-amber-800 border border-amber-200"
                            : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        }`}
                      >
                        {c.triage_level}
                      </span>
                    </div>

                    {/* Dedicated Patient Name Row */}
                    <div className="flex items-center gap-2 py-1.5 px-3 rounded-xl bg-blue-50/70 border border-blue-100/80 text-xs">
                      <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                        <User className="w-3 h-3" />
                      </div>
                      <span className="font-semibold text-slate-500 text-[11px]">Patient Name:</span>
                      <span className="font-bold text-slate-900">
                        {c.user_name || patient.name || "Mamta Debbarma"}
                      </span>
                      <span className="ml-auto font-mono text-[10px] text-slate-400 font-semibold">
                        ID: {c.patient_id || patient.id}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      {c.clinical_summary || c.chief_complaint || "Voice consultation completed with AarogyaVaani AI Assistant."}
                    </p>
                    {c.doctor_review_notes && (
                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-xs text-emerald-950 font-medium">
                        <span className="font-bold block text-emerald-900">Doctor Review & Orders:</span>
                        {c.doctor_review_notes}
                        {c.doctor_prescription && (
                          <span className="block mt-1 font-mono font-bold text-emerald-800">
                            Prescription: {c.doctor_prescription}
                          </span>
                        )}
                      </div>
                    )}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-500">
                      <span>
                        Turns: {Array.isArray(c.transcript) ? c.transcript.length : 0} | Status:{" "}
                        {c.doctor_status || "PENDING"}
                      </span>
                      <span className="font-mono text-slate-400 text-[10px]">{c.id}</span>
                    </div>

                    {/* View Full Dialogue Button */}
                    <button
                      type="button"
                      onClick={() => setSelectedConsultation(c)}
                      className="w-full mt-2 py-2 px-3 rounded-xl bg-blue-50/80 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-blue-100 hover:border-blue-200 active:scale-[0.99]"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                      <span>
                        View Complete Voice Dialogue ({Array.isArray(c.transcript) ? c.transcript.length : 0} Turns)
                      </span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {(patient.priorVisits || [
              {
                date: "14-Jul-2026",
                doctor: "Dr. S. Roy (Medical Officer)",
                type: "Antenatal Routine Checkup",
                summary: "Routine 2nd Trimester ANC check. BP 118/76 mmHg. IFA tablets provided."
              },
              {
                date: "02-May-2026",
                doctor: "Dr. P. Jamatia (CHC MO)",
                type: "OPD General Consultation",
                summary: "Mild fever and sore throat. Paracetamol 500mg prescribed. Advised hydration."
              }
            ]).map((visit, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-2 hover:border-blue-200 transition-colors"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-sm text-slate-900">{visit.type}</span>
                  <span className="text-slate-400 font-semibold">{visit.date}</span>
                </div>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  {visit.summary}
                </p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-500">
                  <span className="flex items-center gap-1">
                    <UserCheck className="w-3 h-3 text-blue-600" />
                    <span>Attending: {visit.doctor}</span>
                  </span>
                  <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                    Completed
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* FULL CHATGPT-STYLE CONVERSATION TRANSCRIPT MODAL */}
      {selectedConsultation && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setSelectedConsultation(null)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-2xl max-h-[88vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900">
                    Consultation Transcript
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                    <span className="font-mono text-slate-600 font-bold">{selectedConsultation.id}</span>
                    <span>•</span>
                    <span className="font-bold text-slate-800 flex items-center gap-1">
                      <User className="w-3 h-3 text-blue-600" />
                      {selectedConsultation.user_name || patient.name || "Mamta Debbarma"}
                    </span>
                    <span>•</span>
                    <span>Language: {selectedConsultation.language_used || "bn-IN"}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-1 rounded-full font-black text-[11px] uppercase tracking-wider ${
                    selectedConsultation.triage_level === "EMERGENCY"
                      ? "bg-rose-100 text-rose-800 border border-rose-200"
                      : selectedConsultation.triage_level === "MONITOR"
                      ? "bg-amber-100 text-amber-800 border border-amber-200"
                      : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                  }`}
                >
                  {selectedConsultation.triage_level}
                </span>

                <button
                  type="button"
                  onClick={() => setSelectedConsultation(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Clinical Overview Bar */}
            <div className="px-5 py-3 bg-blue-50/50 border-b border-blue-100/60 text-xs text-slate-700 space-y-1">
              <p className="font-bold text-blue-900">
                Chief Complaint: <span className="font-normal text-slate-800">{selectedConsultation.chief_complaint || "General consultation"}</span>
              </p>
              {selectedConsultation.clinical_summary && (
                <p className="text-[11px] text-slate-600 line-clamp-2">
                  <span className="font-semibold text-slate-700">AI Assessment:</span> {selectedConsultation.clinical_summary}
                </p>
              )}
            </div>

            {/* Turn-by-Turn ChatGPT-Style Conversation History */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/40">
              {Array.isArray(selectedConsultation.transcript) && selectedConsultation.transcript.length > 0 ? (
                selectedConsultation.transcript.map((turn, idx) => {
                  const isUser = turn.role === "user";
                  return (
                    <div
                      key={idx}
                      className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}
                    >
                      {!isUser && (
                        <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                          <Bot className="w-4 h-4" />
                        </div>
                      )}

                      <div
                        className={`max-w-[82%] sm:max-w-[75%] px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                          isUser
                            ? "bg-[#1d4ed8] text-white shadow-xs rounded-br-xs"
                            : "bg-white text-slate-800 border border-slate-200 shadow-2xs rounded-bl-xs"
                        }`}
                      >
                        <p>{turn.text}</p>
                        <div
                          className={`mt-1 text-[10px] font-mono flex items-center gap-1 ${
                            isUser ? "text-blue-200 justify-end" : "text-slate-400 justify-start"
                          }`}
                        >
                          <Clock className="w-2.5 h-2.5" />
                          <span>
                            {turn.display_time ||
                              (turn.timestamp ? new Date(typeof turn.timestamp === "number" ? turn.timestamp * 1000 : turn.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "")}
                          </span>
                        </div>
                      </div>

                      {isUser && (
                        <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5">
                          <User className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-xs text-slate-400 font-medium">
                  No turn-by-turn speech recorded for this session.
                </div>
              )}

              {/* Doctor Review in Modal if present */}
              {selectedConsultation.doctor_review_notes && (
                <div className="mt-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs space-y-1.5">
                  <div className="flex items-center gap-1.5 font-black text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>Attending Doctor's Note</span>
                  </div>
                  <p className="text-emerald-950 font-medium">
                    {selectedConsultation.doctor_review_notes}
                  </p>
                  {selectedConsultation.doctor_prescription && (
                    <p className="font-mono font-bold text-emerald-800 pt-1">
                      Rx: {selectedConsultation.doctor_prescription}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-white">
              <span className="text-[11px] text-slate-400 font-medium">
                Stored in Supabase Cloud
              </span>
              <button
                type="button"
                onClick={() => setSelectedConsultation(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

