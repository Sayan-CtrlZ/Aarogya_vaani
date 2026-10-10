import { useState } from "react";
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
  Printer
} from "lucide-react";
import { getCurrentPatient } from "../../utils/patientStore";
import UniversalNavbar from "../../components/UniversalNavbar";

export default function PatientConsultationsPage() {
  const navigate = useNavigate();
  const [patient] = useState(() => getCurrentPatient());

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      <UniversalNavbar showBack backPath="/patient" />

      {/* 3. Main Content Workspace */}
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
              {patient.chiefComplaint}
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

        {/* Prior Visits History Timeline */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              <span>Prior Consultation Visits</span>
            </h3>
            <span className="text-xs text-slate-400 font-bold">
              {(patient.priorVisits || []).length} Recorded Visits
            </span>
          </div>

          <div className="space-y-3">
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
    </div>
  );
}
