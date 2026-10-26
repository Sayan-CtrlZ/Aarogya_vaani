import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, ArrowRight, Phone, ShieldAlert } from "lucide-react";
import { getAllPatients } from "../../utils/patientStore";

export default function DoctorEmergencyTab() {
  const navigate = useNavigate();
  const patientsList = getAllPatients();

  const emergencyPatients = useMemo(() => {
    return patientsList.filter(
      (p) => p.triage === "Critical Red Flag" || p.status === "Urgent"
    );
  }, [patientsList]);

  return (
    <div className="space-y-6">
      <div className="bg-rose-50 border border-rose-200 p-5 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-bold shrink-0">
            <AlertTriangle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-black text-rose-950">
              Emergency Red Flag Triage Queue
            </h2>
            <p className="text-xs text-rose-800 mt-0.5">
              Patients flagged with immediate danger signs like severe preeclampsia, high fever, or distress.
            </p>
          </div>
        </div>
        <span className="px-3 py-1 bg-rose-600 text-white text-xs font-bold rounded-xl shadow-xs shrink-0">
          {emergencyPatients.length} Critical Cases
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {emergencyPatients.map((p) => (
          <div
            key={p.id}
            className="bg-white p-5 rounded-3xl border-2 border-rose-200/80 shadow-sm space-y-4 hover:border-rose-400 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black text-rose-800 bg-rose-50 px-2 py-0.5 rounded-md">
                    {p.id}
                  </span>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-rose-600 text-white">
                    Critical Alert
                  </span>
                </div>
                <h3 className="text-base font-black text-slate-900 mt-1">
                  {p.name}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {p.age} yrs • {p.gender} • Phone: {p.phone}
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Blood Pressure
                </span>
                <span className="text-sm font-black text-rose-600 block">
                  {p.vitals?.bp || "High"}
                </span>
              </div>
            </div>

            <div className="bg-rose-50/60 p-3.5 rounded-2xl border border-rose-100 text-xs">
              <span className="text-[10px] font-black uppercase text-rose-700 block mb-1">
                Chief Danger Symptoms:
              </span>
              <p className="text-slate-800 font-semibold leading-relaxed">
                {p.chiefComplaint}
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => navigate(`/doctor/review?id=${p.id}`)}
                className="flex-1 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>Review in Clinical Desk</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <a
                href={`tel:${p.phone}`}
                className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5 text-slate-600" />
                <span>Call Patient</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
