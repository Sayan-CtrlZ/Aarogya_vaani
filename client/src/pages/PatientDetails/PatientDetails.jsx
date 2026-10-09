import { useMemo } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  Languages,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const patients = {
  "patient-1": {
    name: "Mamta Debbarma",
    age: "27",
    gender: "Female",
    type: "Maternal & Antenatal",
    language: "Bengali",
    status: "Completed",
    details: "Routine antenatal check",
    answers: {
      "Age": "27",
      "Pregnancy": "18 weeks",
      "First pregnancy": "Yes",
      "Previous complications": "No",
      "Vaginal bleeding": "No",
      "Severe abdominal pain": "No",
      "Severe headache / blurred vision": "No",
      "Fever / feeling unwell": "No",
      "Swelling": "No",
      "Baby movement": "Normal",
    },
  },

  "patient-2": {
    name: "Rani Tripura",
    age: "24",
    gender: "Female",
    type: "Maternal & Antenatal",
    language: "Hindi",
    status: "In Progress",
    details: "20 weeks pregnancy",
    answers: {
      "Age": "24",
      "Pregnancy": "20 weeks",
      "First pregnancy": "Yes",
      "Previous complications": "No",
      "Current concern": "Routine check",
    },
  },

  "patient-3": {
    name: "Sukanta Das",
    age: "42",
    gender: "Male",
    type: "General Patient",
    language: "Bengali",
    status: "Awaiting Review",
    details: "Fever reported",
    answers: {
      "Age": "42",
      "Main problem": "Fever",
      "Duration": "2 days",
      "Fever": "Yes",
      "Breathing difficulty": "No",
      "Vomiting": "No",
    },
  },

  "patient-4": {
    name: "Bimala Reang",
    age: "31",
    gender: "Female",
    type: "Maternal & Antenatal",
    language: "Bengali",
    status: "Urgent",
    details: "Severe headache detected",
    dangerSigns: ["Severe headache / blurred vision"],
    answers: {
      "Age": "31",
      "Pregnancy": "28 weeks",
      "First pregnancy": "No",
      "Vaginal bleeding": "No",
      "Severe abdominal pain": "No",
      "Severe headache / blurred vision": "Yes",
      "Fever": "No",
      "Baby movement": "Normal",
    },
  },
};

function PatientDetails() {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  const currentPatient = useMemo(() => {
    if (id === "current-patient") {
      try {
        const patientData = JSON.parse(
          localStorage.getItem("aarogyaVaaniCurrentPatient") ||
            "null"
        );

        const interviewData = JSON.parse(
          localStorage.getItem("aarogyaVaaniInterview") ||
            "null"
        );

        const consentData = JSON.parse(
          localStorage.getItem("aarogyaVaaniConsent") ||
            "null"
        );

        if (!patientData?.patient) {
          return null;
        }

        return {
          name: patientData.patient.name || "Current Patient",
          age: patientData.patient.age || "—",
          gender: patientData.patient.gender || "—",
          type:
            patientData.patientType === "maternal"
              ? "Maternal & Antenatal"
              : "General Patient",
          language: consentData?.languageName || "English",
          status: "Current Session",
          details: "Current AarogyaVaani intake session",
          answers: interviewData?.answers || {},
          dangerSigns: interviewData?.dangerSigns || [],
        };
      } catch {
        return null;
      }
    }

    return patients[id] || null;
  }, [id]);

  if (!currentPatient) {
    return (
      <div className="min-h-screen bg-[#f5f9f8] text-[#12322f] font-sans">
        <div className="min-h-screen flex items-center justify-center flex-col text-center text-[#879995]">
          <UserRound size={40} />
          <h2 className="text-[#12322f]">Patient not found</h2>
          <p>The requested patient record could not be opened.</p>

          <button
            onClick={() => navigate("/patients")}
            className="mt-[12px] border-0 bg-[#087f6a] text-white px-[15px] py-[10px] rounded-[8px] cursor-pointer"
          >
            Back to Patients
          </button>
        </div>
      </div>
    );
  }

  const dangerSigns = currentPatient.dangerSigns || [];
  const urgent = dangerSigns.length > 0;

  return (
    <div className="min-h-screen bg-[#f5f9f8] text-[#12322f] font-sans">
      <header className="min-h-[72px] bg-white border-b border-[#e2ece9] flex items-center justify-between px-[35px] max-md:px-4">
        <div>
          <h1 className="m-0 text-[#087f6a] text-[18px]">AarogyaVaani</h1>
          <span className="text-[#81918e] text-[10px]">Tripura Health</span>
        </div>

        <button
          onClick={() => navigate("/patients")}
          className="border border-[#dce9e5] bg-white text-[#087f6a] rounded-[9px] h-[38px] px-[13px] flex items-center gap-[7px] cursor-pointer"
        >
          <ArrowLeft size={17} />
          Patients
        </button>
      </header>

      <main className="max-w-[1050px] mx-auto p-[30px] max-md:px-[14px] max-md:py-[18px]">
        <div className="text-[#8a9c98] text-[11px] mb-[18px]">
          Patients <span className="mx-[7px]">›</span> Patient Details
        </div>

        <section className="bg-white border border-[#e2ece9] rounded-[16px] p-[23px] flex items-center gap-[16px] max-md:flex-col max-md:items-start">
          <div className="w-[65px] h-[65px] rounded-[17px] bg-[#e5f6f0] text-[#087f6a] flex items-center justify-center">
            <UserRound size={30} />
          </div>

          <div className="flex-1">
            <span className="text-[#087f6a] text-[9px] font-extrabold tracking-[0.8px]">PATIENT RECORD</span>
            <h2 className="my-[5px] mb-[2px] text-[23px]">{currentPatient.name}</h2>

            <p className="m-0 text-[#849590] text-[11px]">
              {currentPatient.age} years • {currentPatient.gender}
            </p>
          </div>

          <div className="flex gap-[30px] max-md:w-full max-md:flex-wrap max-md:gap-[20px]">
            <div className="flex flex-col gap-[4px]">
              <span className="text-[#96a6a3] text-[9px]">Intake type</span>
              <strong className="text-[10px]">{currentPatient.type}</strong>
            </div>

            <div className="flex flex-col gap-[4px]">
              <span className="text-[#96a6a3] text-[9px]">Language</span>
              <strong className="text-[10px]">{currentPatient.language}</strong>
            </div>
          </div>
        </section>

        <section
          className={`mt-[18px] rounded-[13px] p-[17px] flex gap-[12px] items-start ${
            urgent ? "bg-[#fff1f1] border border-[#f0cccc] text-[#c94f4f]" : "bg-[#ecf9f4] border border-[#cfece1] text-[#087f6a]"
          }`}
        >
          {urgent ? (
            <AlertTriangle size={24} />
          ) : (
            <CheckCircle2 size={24} />
          )}

          <div>
            <strong className="text-[12px] font-bold">
              {urgent
                ? "Urgent safety flag"
                : "No danger sign flagged"}
            </strong>

            <p className="mt-[4px] mb-0 text-[#738681] text-[10px]">
              {urgent
                ? "A predefined safety rule requires health-worker or doctor attention."
                : "No predefined danger sign was identified in the available record."}
            </p>
          </div>
        </section>

        {urgent && (
          <section className="bg-white border border-[#efd2d2] rounded-[15px] mt-[18px] p-[20px]">
            <div className="flex items-center gap-[8px] text-[#087f6a] mb-[16px]">
              <AlertTriangle size={18} />
              <h3 className="m-0 text-[#12322f] text-[14px]">Danger Signs</h3>
            </div>

            {dangerSigns.map((sign) => (
              <div className="flex items-center gap-[7px] text-[#c74f4f] bg-[#fff5f5] rounded-[8px] p-[9px] mt-[7px] text-[10px] font-bold" key={sign}>
                <AlertTriangle size={15} />
                {sign}
              </div>
            ))}
          </section>
        )}

        <section className="bg-white border border-[#e2ece9] rounded-[15px] mt-[18px] p-[20px]">
          <div className="flex items-center gap-[8px] text-[#087f6a] mb-[16px]">
            <ClipboardList size={18} />
            <h3 className="m-0 text-[#12322f] text-[14px]">Structured Interview</h3>
          </div>

          <div className="grid grid-cols-2 gap-[10px] max-md:grid-cols-1">
            {Object.entries(currentPatient.answers || {}).map(
              ([question, answer]) => (
                <div className="bg-[#f7faf9] border border-[#e9f0ee] rounded-[9px] p-[11px] flex flex-col gap-[5px]" key={question}>
                  <span className="text-[#8b9d99] text-[9px]">{question}</span>
                  <strong className="text-[#12322f] text-[10px]">{String(answer)}</strong>
                </div>
              )
            )}
          </div>
        </section>

        <section className="grid grid-cols-2 gap-[14px] mt-[18px] max-md:grid-cols-1">
          <div className="bg-white border border-[#e2ece9] rounded-[13px] p-[15px] flex gap-[10px] items-center text-[#087f6a]">
            <Languages size={20} />
            <div className="flex flex-col gap-[3px]">
              <span className="text-[#8b9d99] text-[9px]">Interview language</span>
              <strong className="text-[#12322f] text-[10px]">{currentPatient.language}</strong>
            </div>
          </div>

          <div className="bg-white border border-[#e2ece9] rounded-[13px] p-[15px] flex gap-[10px] items-center text-[#087f6a]">
            <ShieldCheck size={20} />
            <div className="flex flex-col gap-[3px]">
              <span className="text-[#8b9d99] text-[9px]">Safety model</span>
              <strong className="text-[#12322f] text-[10px]">Fixed rule-based check</strong>
            </div>
          </div>
        </section>

        <section className="mt-[18px] p-[14px] bg-[#edf7f4] border border-[#d9ebe6] rounded-[11px] flex gap-[9px] text-[#087f6a]">
          <ShieldCheck size={18} />

          <p className="m-0 text-[#71847f] text-[9px] leading-[1.6]">
            This record contains information provided during
            patient intake. AarogyaVaani does not make a diagnosis.
            A doctor must review, edit and approve the clinical
            summary.
          </p>
        </section>
      </main>
    </div>
  );
}

export default PatientDetails;