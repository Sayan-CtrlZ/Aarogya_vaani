import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  Save,
  UserRound,
  FileText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function getAnswerValue(answers, key) {
  return answers?.[key] || "";
}

export default function DoctorReview() {
  const navigate = useNavigate();
  const patientData = useMemo(() => {
    return JSON.parse(
      localStorage.getItem("aarogyaVaaniCurrentPatient") || "{}"
    );
  }, []);

  const interviewData = useMemo(() => {
    return JSON.parse(
      localStorage.getItem("aarogyaVaaniInterview") || "{}"
    );
  }, []);

  const dangerData = useMemo(() => {
    return JSON.parse(
      localStorage.getItem("aarogyaVaaniDangerCheck") || "{}"
    );
  }, []);

  const reports = useMemo(() => {
    return JSON.parse(
      localStorage.getItem("aarogyaVaaniReports") || "[]"
    );
  }, []);

  const answers = interviewData.answers || {};

  const patient = patientData.patient || {};

  const patientType =
    patientData.patientType || "maternal";

  const [summary, setSummary] = useState({
    mainComplaint: "",
    history: "",
    medicalConditions: "",
    medicines: "",
    allergies: "",
    additionalNotes: "",
  });

  const [approved, setApproved] = useState(false);

  useEffect(() => {
    const savedSummary = JSON.parse(
      localStorage.getItem("aarogyaVaaniDoctorSummary") || "null"
    );

    if (savedSummary) {
      setSummary(savedSummary);
      setApproved(Boolean(savedSummary.approved));
    } else {
      const mainComplaint =
        patientType === "maternal"
          ? "Antenatal / pregnancy intake"
          : getAnswerValue(answers, "mainProblem");

      const medicalConditions =
        getAnswerValue(answers, "medicalConditions") ||
        getAnswerValue(answers, "conditions");

      const medicines =
        getAnswerValue(answers, "medicines");

      const allergies =
        getAnswerValue(answers, "allergies");

      setSummary({
        mainComplaint,
        history:
          patientType === "maternal"
            ? `Pregnancy duration: ${
                getAnswerValue(answers, "pregnancyMonths") ||
                "Not recorded"
              } months.`
            : `Duration: ${
                getAnswerValue(answers, "duration") ||
                "Not recorded"
              }.`,
        medicalConditions,
        medicines,
        allergies,
        additionalNotes: "",
      });
    }
  }, [answers, patientType]);

  const handleChange = (field, value) => {
    setSummary((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleApprove = () => {
    const approvedSummary = {
      ...summary,
      approved: true,
      approvedAt: new Date().toISOString(),
      patientName: patient.name || "Patient",
      patientType,
      dangerSigns: dangerData.dangerSigns || [],
      reports,
    };

    localStorage.setItem(
      "aarogyaVaaniDoctorSummary",
      JSON.stringify(approvedSummary)
    );

    setSummary(approvedSummary);
    setApproved(true);
  };

  const handleBack = () => {
    navigate("/summary");
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(rgba(246,250,248,0.96),rgba(246,250,248,0.98)),url('https://upload.wikimedia.org/wikipedia/commons/3/36/Tripura_in_India.svg')] bg-[center/520px_no-repeat] text-[#103f32]">
      <header className="h-[76px] bg-[#103f32] text-white flex items-center justify-between px-[6%] max-sm:px-[5%]">
        <div>
          <h1 className="m-0 text-[25px]">AarogyaVaani</h1>
          <span className="block text-[12px] opacity-75">Tripura Health</span>
        </div>

        <div className="flex items-center gap-[8px] text-[13px] max-sm:hidden">
          <UserRound size={17} />
          Doctor Review
        </div>
      </header>

      <main className="w-[min(1050px,92%)] mx-auto py-[30px] pb-[65px] max-sm:w-[94%] max-sm:pt-[20px]">
        <div className="text-[#71847b] text-[13px] mb-[22px]">
          Summary <span className="mx-[8px]">/</span> <strong className="text-[#103f32]">Doctor Review</strong>
        </div>

        <section className="flex justify-between gap-[20px] items-start mb-[24px] max-sm:flex-col">
          <div>
            <p className="text-[#2f8f69] text-[11px] font-extrabold tracking-[1.5px] m-0 mb-[7px]">FINAL CLINICAL REVIEW</p>
            <h2 className="m-0 mb-[7px] text-[clamp(28px,5vw,42px)]">Review & Approve Summary</h2>
            <span className="text-[#71847c]">
              The doctor can correct the generated history before
              approving it.
            </span>
          </div>

          {approved && (
            <div className="flex items-center gap-[7px] bg-[#ddf2e6] text-[#176944] border border-[#b9dec8] rounded-full px-[14px] py-[9px] text-[13px] font-[750]">
              <CheckCircle2 size={18} />
              Approved
            </div>
          )}
        </section>

        <section className="flex items-center gap-[15px] bg-white border border-[#d7e8df] rounded-[18px] p-[20px] mb-[18px] shadow-[0_8px_28px_rgba(16,63,50,0.05)]">
          <div className="w-[56px] h-[56px] bg-[#e5f3eb] text-[#2f8f69] grid place-items-center rounded-[15px]">
            <UserRound size={28} />
          </div>

          <div>
            <small className="text-[#82938c] text-[11px]">Patient</small>
            <h3 className="m-0 my-[2px] text-[19px]">{patient.name || "Patient"}</h3>

            <p className="m-0 text-[#70827a] text-[13px]">
              {patient.age ? `${patient.age} years` : "Age not recorded"}
              {patient.gender
                ? ` • ${patient.gender}`
                : ""}
              {patientType === "maternal"
                ? " • Maternal / Antenatal"
                : " • General Intake"}
            </p>
          </div>
        </section>

        {dangerData.urgent && (
          <section className="flex items-start gap-[12px] p-[17px] bg-[#fff1f0] border border-[#efc8c4] rounded-[15px] mb-[18px] text-[#a5261c]">
            <AlertTriangle size={23} />

            <div>
              <strong className="block mb-[4px]">Safety flag requires attention</strong>

              <p className="m-0 text-[#806c68] text-[13px]">
                {dangerData.dangerSigns?.length || 0} danger
                sign(s) were detected during the fixed-rule
                screening.
              </p>
            </div>
          </section>
        )}

        <section className="bg-white border border-[#d7e8df] rounded-[20px] p-[25px] shadow-[0_8px_28px_rgba(16,63,50,0.05)] max-sm:p-[18px]">
          <div className="flex gap-[11px] items-start mb-[22px]">
            <FileText className="text-[#2f8f69]" size={20} />
            <div>
              <h3 className="m-0 mb-[4px]">Structured Patient History</h3>
              <p className="m-0 text-[#7a8c84] text-[13px]">Edit any field before approval.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-[18px] max-sm:grid-cols-1">
            <div className="col-span-2 max-sm:col-auto">
              <label className="block text-[13px] font-[750] mb-[8px]">Main complaint / reason for visit</label>

              <textarea
                className="w-full min-h-[105px] resize-y border border-[#cbded5] rounded-[12px] p-[13px] font-inherit text-[14px] leading-[1.5] outline-none focus:border-[#2f8f69] focus:shadow-[0_0_0_3px_rgba(47,143,105,0.11)]"
                value={summary.mainComplaint}
                onChange={(event) =>
                  handleChange(
                    "mainComplaint",
                    event.target.value
                  )
                }
              />
            </div>

            <div className="col-span-2 max-sm:col-auto">
              <label className="block text-[13px] font-[750] mb-[8px]">History of present problem</label>

              <textarea
                className="w-full min-h-[105px] resize-y border border-[#cbded5] rounded-[12px] p-[13px] font-inherit text-[14px] leading-[1.5] outline-none focus:border-[#2f8f69] focus:shadow-[0_0_0_3px_rgba(47,143,105,0.11)]"
                value={summary.history}
                onChange={(event) =>
                  handleChange(
                    "history",
                    event.target.value
                  )
                }
              />
            </div>

            <div>
              <label className="block text-[13px] font-[750] mb-[8px]">Medical conditions</label>

              <textarea
                className="w-full min-h-[105px] resize-y border border-[#cbded5] rounded-[12px] p-[13px] font-inherit text-[14px] leading-[1.5] outline-none focus:border-[#2f8f69] focus:shadow-[0_0_0_3px_rgba(47,143,105,0.11)]"
                value={summary.medicalConditions}
                onChange={(event) =>
                  handleChange(
                    "medicalConditions",
                    event.target.value
                  )
                }
              />
            </div>

            <div>
              <label className="block text-[13px] font-[750] mb-[8px]">Medicines / supplements</label>

              <textarea
                className="w-full min-h-[105px] resize-y border border-[#cbded5] rounded-[12px] p-[13px] font-inherit text-[14px] leading-[1.5] outline-none focus:border-[#2f8f69] focus:shadow-[0_0_0_3px_rgba(47,143,105,0.11)]"
                value={summary.medicines}
                onChange={(event) =>
                  handleChange(
                    "medicines",
                    event.target.value
                  )
                }
              />
            </div>

            <div>
              <label className="block text-[13px] font-[750] mb-[8px]">Allergies</label>

              <textarea
                className="w-full min-h-[105px] resize-y border border-[#cbded5] rounded-[12px] p-[13px] font-inherit text-[14px] leading-[1.5] outline-none focus:border-[#2f8f69] focus:shadow-[0_0_0_3px_rgba(47,143,105,0.11)]"
                value={summary.allergies}
                onChange={(event) =>
                  handleChange(
                    "allergies",
                    event.target.value
                  )
                }
              />
            </div>

            <div>
              <label className="block text-[13px] font-[750] mb-[8px]">Doctor's additional notes</label>

              <textarea
                className="w-full min-h-[105px] resize-y border border-[#cbded5] rounded-[12px] p-[13px] font-inherit text-[14px] leading-[1.5] outline-none focus:border-[#2f8f69] focus:shadow-[0_0_0_3px_rgba(47,143,105,0.11)]"
                value={summary.additionalNotes}
                onChange={(event) =>
                  handleChange(
                    "additionalNotes",
                    event.target.value
                  )
                }
                placeholder="Add any correction or note..."
              />
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-[18px] mt-[18px] max-sm:grid-cols-1">
          <div className="bg-white border border-[#d7e8df] rounded-[16px] p-[19px]">
            <h3 className="m-0 mb-[9px] text-[15px]">Safety findings</h3>

            {dangerData.dangerSigns?.length ? (
              <ul className="m-0 pl-[18px] text-[#8c2a21] text-[13px] leading-[1.8]">
                {dangerData.dangerSigns.map((item) => (
                  <li key={item.id}>{item.title}</li>
                ))}
              </ul>
            ) : (
              <p className="m-0 text-[#71847c] text-[13px]">No configured danger signs detected.</p>
            )}
          </div>

          <div className="bg-white border border-[#d7e8df] rounded-[16px] p-[19px]">
            <h3 className="m-0 mb-[9px] text-[15px]">Previous reports</h3>

            <p className="m-0 text-[#71847c] text-[13px]">
              {reports.length
                ? `${reports.length} report(s) attached for review.`
                : "No previous reports attached."}
            </p>
          </div>
        </section>

        <section className="flex gap-[12px] bg-[#eaf5ef] border border-[#cde3d7] rounded-[15px] p-[17px] mt-[18px]">
          <ShieldCheck className="text-[#2f8f69] shrink-0" size={22} />

          <div>
            <strong className="block mb-[4px]">Doctor approval required</strong>

            <p className="m-0 text-[#61766d] text-[12px] leading-[1.5]">
              AarogyaVaani does not make a diagnosis. This summary
              must be checked and approved by a qualified doctor.
            </p>
          </div>
        </section>

        <div className="flex justify-between gap-[15px] mt-[25px] max-sm:flex-col-reverse">
          <button
            className="min-h-[53px] rounded-[12px] px-[20px] flex items-center gap-[8px] cursor-pointer font-[750] max-sm:w-full max-sm:justify-center bg-white border border-[#cbded5] text-[#103f32]"
            onClick={handleBack}
          >
            <ArrowLeft size={18} />
            Back to Summary
          </button>

          <button
            className="min-h-[53px] rounded-[12px] px-[20px] flex items-center gap-[8px] cursor-pointer font-[750] max-sm:w-full max-sm:justify-center bg-[#0f5c45] border-0 text-white hover:bg-[#103f32]"
            onClick={handleApprove}
          >
            {approved ? (
              <>
                <CheckCircle2 size={19} />
                Approved
              </>
            ) : (
              <>
                <Save size={19} />
                Approve Summary
              </>
            )}
          </button>
        </div>

        {approved && (
          <div className="mt-[18px] bg-[#e8f6ee] border border-[#bfe0cc] rounded-[15px] p-[16px] flex gap-[11px] text-[#176944]">
            <CheckCircle2 className="shrink-0" size={22} />

            <div>
              <strong className="block mb-[3px]">Summary approved successfully</strong>
              <p className="m-0 text-[12px] text-[#637a6f]">
                The reviewed summary has been saved on this device.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}