import { useMemo } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Search,
  UserRound,
  AlertTriangle,
  CheckCircle2,
  Clock3,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const demoPatients = [
  {
    id: "patient-1",
    name: "Mamta Debbarma",
    age: "27",
    gender: "Female",
    type: "Maternal & Antenatal",
    language: "Bengali",
    status: "Completed",
    time: "10:32 AM",
    details: "Routine antenatal check",
  },
  {
    id: "patient-2",
    name: "Rani Tripura",
    age: "24",
    gender: "Female",
    type: "Maternal & Antenatal",
    language: "Hindi",
    status: "In Progress",
    time: "10:15 AM",
    details: "20 weeks pregnancy",
  },
  {
    id: "patient-3",
    name: "Sukanta Das",
    age: "42",
    gender: "Male",
    type: "General Patient",
    language: "Bengali",
    status: "Awaiting Review",
    time: "09:48 AM",
    details: "Fever reported",
  },
  {
    id: "patient-4",
    name: "Bimala Reang",
    age: "31",
    gender: "Female",
    type: "Maternal & Antenatal",
    language: "Bengali",
    status: "Urgent",
    time: "09:21 AM",
    details: "Severe headache detected",
    dangerSigns: ["Severe headache / blurred vision"],
  },
];

function getStoredPatient() {
  try {
    return JSON.parse(
      localStorage.getItem("aarogyaVaaniCurrentPatient") || "null"
    );
  } catch {
    return null;
  }
}

function StatusBadge({ status }) {
  if (status === "Urgent") {
    return (
      <span className="inline-flex items-center gap-[5px] px-[8px] py-[5px] rounded-[20px] text-[8px] font-extrabold whitespace-nowrap bg-[#fde9e9] text-[#d45555]">
        <AlertTriangle size={13} />
        Urgent
      </span>
    );
  }

  if (status === "Completed") {
    return (
      <span className="inline-flex items-center gap-[5px] px-[8px] py-[5px] rounded-[20px] text-[8px] font-extrabold whitespace-nowrap bg-[#e8f8f0] text-[#198a6e]">
        <CheckCircle2 size={13} />
        Completed
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-[5px] px-[8px] py-[5px] rounded-[20px] text-[8px] font-extrabold whitespace-nowrap bg-[#f2edfb] text-[#745cb8]">
      <Clock3 size={13} />
      {status}
    </span>
  );
}

function Patients() {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const searchQuery = (params.get("search") || "").toLowerCase();
  const statusFilter = params.get("status");
  const view = params.get("view");

  const storedPatient = getStoredPatient();

  const allPatients = useMemo(() => {
    const stored = [];

    if (storedPatient?.patient) {
      stored.push({
        id: "current-patient",
        name: storedPatient.patient.name || "Current Patient",
        age: storedPatient.patient.age || "—",
        gender: storedPatient.patient.gender || "—",
        type:
          storedPatient.patientType === "maternal"
            ? "Maternal & Antenatal"
            : "General Patient",
        language:
          JSON.parse(
            localStorage.getItem("aarogyaVaaniConsent") || "{}"
          )?.languageName || "English",
        status: "Current Session",
        time: "Current",
        details: "Current AarogyaVaani intake session",
      });
    }

    return [...stored, ...demoPatients];
  }, [storedPatient]);

  const filteredPatients = allPatients.filter((patient) => {
    const searchable = [
      patient.name,
      patient.age,
      patient.type,
      patient.language,
      patient.details,
      patient.status,
    ]
      .join(" ")
      .toLowerCase();

    const matchesSearch =
      !searchQuery || searchable.includes(searchQuery);

    let matchesStatus = true;

    if (statusFilter === "review") {
      matchesStatus =
        patient.status === "Awaiting Review" ||
        patient.status === "Pending Review";
    }

    if (statusFilter === "approved") {
      matchesStatus = patient.status === "Completed";
    }

    return matchesSearch && matchesStatus;
  });

  const openPatient = (id) => {
    navigate(`/patient-details?id=${encodeURIComponent(id)}`);
  };

  return (
    <div className="min-h-screen bg-[#f5f9f8] text-[#12322f] font-sans">
      <header className="min-h-[72px] bg-white border-b border-[#e2ece9] flex items-center justify-between px-[35px] sticky top-0 z-20 max-sm:px-4">
        <div className="flex flex-col">
          <h1 className="m-0 text-[#087f6a] text-[18px]">AarogyaVaani</h1>
          <span className="text-[#81918e] text-[10px] mt-[3px]">Tripura Health</span>
        </div>

        <button
          className="border border-[#dce9e5] bg-white text-[#087f6a] rounded-[9px] h-[38px] px-[13px] flex items-center gap-[7px] cursor-pointer"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft size={17} />
          Dashboard
        </button>
      </header>

      <main className="max-w-[1250px] mx-auto p-[30px] max-md:px-[14px] max-md:py-[18px]">
        <div className="text-[#8a9c98] text-[11px] mb-[18px]">
          Dashboard <span className="mx-[7px]">›</span> Patients
        </div>

        <section className="bg-[linear-gradient(110deg,#effaf7,#e5f6f1)] border border-[#d6ebe5] rounded-[18px] p-[28px] flex items-center justify-between gap-[20px] max-md:p-[20px] max-md:items-start max-md:flex-col">
          <div>
            <span className="flex items-center gap-[6px] text-[#087f6a] text-[10px] font-extrabold uppercase">
              <UserRound size={14} />
              Patient Records
            </span>

            <h2 className="my-[8px] mb-[5px] text-[27px] max-md:text-[23px]">
              {view === "activity"
                ? "Patient Intake Activity"
                : "All Patients"}
            </h2>

            <p className="m-0 text-[#708580] text-[12px]">
              Review patient sessions captured through the
              AarogyaVaani intake workflow.
            </p>
          </div>

          <button
            className="border-0 bg-[#087f6a] text-white rounded-[9px] px-[17px] py-[12px] flex items-center gap-[7px] cursor-pointer text-[11px] font-bold whitespace-nowrap max-md:w-full max-md:justify-center"
            onClick={() => navigate("/new-patient")}
          >
            New Patient
            <ArrowRight size={17} />
          </button>
        </section>

        <section className="my-[20px] mb-[10px] h-[45px] bg-white border border-[#dfeae7] rounded-[10px] flex items-center gap-[10px] px-[14px] text-[#81938f]">
          <Search size={18} />

          <input
            className="border-0 outline-0 w-full text-[#12322f] bg-transparent text-[12px]"
            readOnly
            value={searchQuery}
            placeholder="Search by patient name, age, type, language or status..."
          />
        </section>

        {searchQuery && (
          <div className="mx-[2px] my-[10px] text-[#718582] text-[11px]">
            Showing results for: <strong>{searchQuery}</strong>
          </div>
        )}

        <section className="bg-white border border-[#e2ece9] rounded-[15px] overflow-hidden mt-[15px]">
          <div className="px-[20px] py-[18px] border-b border-[#edf2f0]">
            <div className="flex gap-[5px] items-baseline">
              <strong className="text-[20px]">{filteredPatients.length}</strong>
              <span className="text-[10px] text-[#8b9c98]">patient records</span>
            </div>
          </div>

          {filteredPatients.length === 0 ? (
            <div className="px-[20px] py-[70px] text-center text-[#91a29f] flex flex-col items-center">
              <Search size={35} />
              <h3 className="text-[#12322f] my-[12px] mb-[5px]">No patients found</h3>
              <p className="text-[11px]">
                Try another patient name, ID, language or status.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] border-collapse">
                <thead>
                  <tr>
                    <th className="bg-[#f7faf9] px-[15px] py-[11px] text-[#849590] text-[9px] text-left">Patient</th>
                    <th className="bg-[#f7faf9] px-[15px] py-[11px] text-[#849590] text-[9px] text-left">Age</th>
                    <th className="bg-[#f7faf9] px-[15px] py-[11px] text-[#849590] text-[9px] text-left">Type</th>
                    <th className="bg-[#f7faf9] px-[15px] py-[11px] text-[#849590] text-[9px] text-left">Language</th>
                    <th className="bg-[#f7faf9] px-[15px] py-[11px] text-[#849590] text-[9px] text-left">Status</th>
                    <th className="bg-[#f7faf9] px-[15px] py-[11px] text-[#849590] text-[9px] text-left">Time</th>
                    <th className="bg-[#f7faf9] px-[15px] py-[11px] text-[#849590] text-[9px] text-left" />
                  </tr>
                </thead>

                <tbody>
                  {filteredPatients.map((patient) => (
                    <tr key={patient.id}>
                      <td className="px-[15px] py-[13px] border-t border-[#edf2f0] text-[#627873] text-[10px]">
                        <div className="flex items-center gap-[9px]">
                          <div className="w-[32px] h-[32px] rounded-[9px] bg-[#e7f7f2] text-[#087f6a] flex items-center justify-center">
                            <UserRound size={17} />
                          </div>

                          <div className="flex flex-col gap-[2px]">
                            <strong className="text-[#12322f] text-[10px]">{patient.name}</strong>
                            <span className="text-[#9aa9a6] text-[8px]">{patient.gender}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-[15px] py-[13px] border-t border-[#edf2f0] text-[#627873] text-[10px]">{patient.age}</td>
                      <td className="px-[15px] py-[13px] border-t border-[#edf2f0] text-[#627873] text-[10px]">{patient.type}</td>
                      <td className="px-[15px] py-[13px] border-t border-[#edf2f0] text-[#627873] text-[10px]">{patient.language}</td>

                      <td className="px-[15px] py-[13px] border-t border-[#edf2f0] text-[#627873] text-[10px]">
                        <StatusBadge status={patient.status} />
                      </td>

                      <td className="px-[15px] py-[13px] border-t border-[#edf2f0] text-[#627873] text-[10px]">{patient.time}</td>

                      <td className="px-[15px] py-[13px] border-t border-[#edf2f0] text-[#627873] text-[10px]">
                        <button
                          className="border border-[#dce9e5] bg-white text-[#087f6a] rounded-[7px] px-[9px] py-[7px] flex items-center gap-[4px] cursor-pointer text-[8px] font-bold hover:bg-[#e7f7f2]"
                          onClick={() => openPatient(patient.id)}
                        >
                          Open
                          <ArrowRight size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Patients;