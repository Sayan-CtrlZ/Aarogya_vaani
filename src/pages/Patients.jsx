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
import "./Patients.css";

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
      <span className="patients-status urgent">
        <AlertTriangle size={13} />
        Urgent
      </span>
    );
  }

  if (status === "Completed") {
    return (
      <span className="patients-status completed">
        <CheckCircle2 size={13} />
        Completed
      </span>
    );
  }

  return (
    <span className="patients-status pending">
      <Clock3 size={13} />
      {status}
    </span>
  );
}

function Patients() {
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
    window.location.href = `/patient-details?id=${encodeURIComponent(id)}`;
  };

  return (
    <div className="patients-page">
      <header className="simple-page-header">
        <div>
          <h1>AarogyaVaani</h1>
          <span>Tripura Health</span>
        </div>

        <button
          className="back-dashboard-button"
          onClick={() => {
            window.location.href = "/dashboard";
          }}
        >
          <ArrowLeft size={17} />
          Dashboard
        </button>
      </header>

      <main className="patients-content">
        <div className="page-breadcrumb">
          Dashboard <span>›</span> Patients
        </div>

        <section className="patients-hero">
          <div>
            <span className="page-eyebrow">
              <UserRound size={14} />
              Patient Records
            </span>

            <h2>
              {view === "activity"
                ? "Patient Intake Activity"
                : "All Patients"}
            </h2>

            <p>
              Review patient sessions captured through the
              AarogyaVaani intake workflow.
            </p>
          </div>

          <button
            className="new-patient-button"
            onClick={() => {
              window.location.href = "/new-patient";
            }}
          >
            New Patient
            <ArrowRight size={17} />
          </button>
        </section>

        <section className="patients-search-box">
          <Search size={18} />

          <input
            readOnly
            value={searchQuery}
            placeholder="Search by patient name, age, type, language or status..."
          />
        </section>

        {searchQuery && (
          <div className="search-result-note">
            Showing results for: <strong>{searchQuery}</strong>
          </div>
        )}

        <section className="patients-table-card">
          <div className="patients-table-heading">
            <div>
              <strong>{filteredPatients.length}</strong>
              <span>patient records</span>
            </div>
          </div>

          {filteredPatients.length === 0 ? (
            <div className="patients-empty">
              <Search size={35} />
              <h3>No patients found</h3>
              <p>
                Try another patient name, ID, language or status.
              </p>
            </div>
          ) : (
            <div className="patients-table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Age</th>
                    <th>Type</th>
                    <th>Language</th>
                    <th>Status</th>
                    <th>Time</th>
                    <th />
                  </tr>
                </thead>

                <tbody>
                  {filteredPatients.map((patient) => (
                    <tr key={patient.id}>
                      <td>
                        <div className="patient-main">
                          <div className="patient-icon">
                            <UserRound size={17} />
                          </div>

                          <div>
                            <strong>{patient.name}</strong>
                            <span>{patient.gender}</span>
                          </div>
                        </div>
                      </td>

                      <td>{patient.age}</td>
                      <td>{patient.type}</td>
                      <td>{patient.language}</td>

                      <td>
                        <StatusBadge status={patient.status} />
                      </td>

                      <td>{patient.time}</td>

                      <td>
                        <button
                          className="patient-open-button"
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