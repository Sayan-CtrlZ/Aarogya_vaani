import { useMemo } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Activity,
  HeartPulse,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function DangerCheck() {
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

  const patientType = patientData.patientType || "maternal";

  const answers = interviewData.answers || {};

  const dangerSigns = [];

  if (patientType === "maternal") {
    if (answers.bleeding === "Yes") {
      dangerSigns.push({
        id: "bleeding",
        title: "Vaginal bleeding reported",
        description:
          "The patient reported bleeding during pregnancy.",
      });
    }

    if (answers.abdominalPain === "Yes") {
      dangerSigns.push({
        id: "abdominalPain",
        title: "Severe abdominal pain reported",
        description:
          "The patient reported severe abdominal pain.",
      });
    }

    if (answers.headacheVision === "Yes") {
      dangerSigns.push({
        id: "headacheVision",
        title: "Severe headache or blurred vision",
        description:
          "The patient reported severe headache or changes in vision.",
      });
    }

    if (answers.fever === "Yes") {
      dangerSigns.push({
        id: "fever",
        title: "Fever or feeling very unwell",
        description:
          "The patient reported fever or feeling seriously unwell.",
      });
    }

    if (answers.babyMovement === "No") {
      dangerSigns.push({
        id: "babyMovement",
        title: "Reduced or absent baby movement",
        description:
          "The patient reported that the baby's movement is less than usual.",
      });
    }
  }

  if (patientType === "general") {
    if (answers.breathing === "Yes") {
      dangerSigns.push({
        id: "breathing",
        title: "Difficulty breathing reported",
        description:
          "The patient reported difficulty breathing.",
      });
    }

    if (answers.fainting === "Yes") {
      dangerSigns.push({
        id: "fainting",
        title: "Fainting or severe dizziness reported",
        description:
          "The patient reported fainting or severe dizziness.",
      });
    }
  }

  const isUrgent = dangerSigns.length > 0;

  const saveDangerResult = () => {
    localStorage.setItem(
      "aarogyaVaaniDangerCheck",
      JSON.stringify({
        checkedAt: new Date().toISOString(),
        urgent: isUrgent,
        dangerSigns,
      })
    );

    navigate("/summary");
  };

  const patientName =
    patientData.patient?.name || "Patient";

  return (
    <div className="min-h-screen bg-[linear-gradient(rgba(247,251,249,0.95),rgba(247,251,249,0.98)),url('https://upload.wikimedia.org/wikipedia/commons/3/36/Tripura_in_India.svg')] bg-[center_top] bg-[length:520px] bg-no-repeat text-[#103f32]">
      <header className="h-[76px] bg-[#103f32] text-white flex items-center justify-between px-[6%] max-sm:px-[5%]">
        <div>
          <h1 className="m-0 text-[25px]">AarogyaVaani</h1>
          <span className="block text-[12px] opacity-75">Tripura Health</span>
        </div>

        <div className="flex items-center gap-[8px] text-[13px] max-sm:hidden">
          <ShieldAlert size={18} />
          Safety Check
        </div>
      </header>

      <main className="w-[min(1000px,92%)] max-sm:w-[94%] mx-auto py-[30px] max-sm:pt-[20px] pb-[60px]">
        <div className="flex items-center gap-[14px] text-[#71847c] text-[12px] font-bold mb-[28px]">
          <span>Safety Check</span>
          <div className="h-[6px] flex-1 bg-[#dceae4] rounded-full overflow-hidden">
            <div className="w-[83%] h-full bg-[#2f8f69]"></div>
          </div>
          <span>05 / 06</span>
        </div>

        <section
          className={`flex gap-[22px] items-center rounded-[22px] p-[30px] mb-[22px] border max-sm:flex-col max-sm:items-start max-sm:p-[22px] ${
            isUrgent ? "bg-[#fff1f0] border-[#f0c9c5]" : "bg-[#eaf7f0] border-[#c7e5d4]"
          }`}
        >
          <div className={`w-[76px] h-[76px] rounded-[20px] grid place-items-center shrink-0 max-sm:w-[60px] max-sm:h-[60px] ${isUrgent ? 'bg-[#f8d9d5] text-[#b42318]' : 'bg-[#d5efdf] text-[#19704d]'}`}>
            {isUrgent ? (
              <AlertTriangle size={45} />
            ) : (
              <CheckCircle2 size={45} />
            )}
          </div>

          <div>
            <p className="text-[11px] font-extrabold tracking-[1.5px] mb-[6px] mt-0">
              AUTOMATED SAFETY CHECK
            </p>

            <h2 className="text-[clamp(26px,5vw,38px)] mb-[9px] mt-0">
              {isUrgent
                ? "Urgent signs detected"
                : "No danger signs detected"}
            </h2>

            <p className="m-0 leading-[1.6] text-[#667a72]">
              {isUrgent
                ? `AarogyaVaani identified ${dangerSigns.length} reported danger sign${
                    dangerSigns.length > 1 ? "s" : ""
                  } for ${patientName}. A health professional should review this immediately.`
                : `No configured danger signs were reported by ${patientName} during this intake.`}
            </p>
          </div>
        </section>

        {isUrgent ? (
          <section className="bg-white border border-[#efc6c2] rounded-[20px] p-[24px] shadow-[0_10px_30px_rgba(180,35,24,0.07)] mb-[20px] max-sm:p-[18px]">
            <div className="flex gap-[12px] items-start text-[#b42318] mb-[18px]">
              <AlertTriangle size={23} />
              <div>
                <strong className="block text-[17px] text-[#8d2118]">Health worker attention required</strong>
                <p className="mt-[4px] mb-0 text-[#876e6a] text-[13px]">
                  This is a rule-based safety flag, not a diagnosis.
                </p>
              </div>
            </div>

            <div className="grid gap-[10px]">
              {dangerSigns.map((sign) => (
                <div className="flex gap-[12px] p-[15px] bg-[#fff8f7] border border-[#f3d9d6] rounded-[13px]" key={sign.id}>
                  <div className="w-[38px] h-[38px] rounded-[10px] bg-[#f8dfdc] text-[#b42318] grid place-items-center shrink-0">
                    <Activity size={20} />
                  </div>

                  <div>
                    <strong className="text-[14px] font-bold">{sign.title}</strong>
                    <p className="mt-[4px] mb-0 text-[#786f6c] text-[13px] leading-[1.5]">{sign.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <section className="bg-white border border-[#d7e8df] rounded-[20px] p-[25px] flex items-center max-sm:items-start gap-[18px] mb-[20px] shadow-[0_10px_30px_rgba(16,63,50,0.05)] max-sm:p-[18px]">
            <HeartPulse size={38} className="text-[#2f8f69] shrink-0" />

            <div>
              <h3 className="m-0 mb-[5px]">Screening completed</h3>

              <p className="m-0 text-[#697e75] leading-[1.6]">
                No configured red-flag response was found in the
                current intake. The complete history still needs
                review by the doctor.
              </p>
            </div>
          </section>
        )}

        <section className="flex gap-[12px] items-start bg-[#f0f5f2] border border-[#d6e2dc] rounded-[15px] p-[16px] text-[#536d62]">
          <ShieldAlert size={20} className="shrink-0" />

          <div>
            <strong className="block text-[#35574b] mb-[4px]">Important</strong>

            <p className="m-0 text-[12px] leading-[1.6]">
              AarogyaVaani does not diagnose medical conditions.
              This screen only checks predefined safety rules from
              the patient's answers. A doctor or qualified health
              professional must make clinical decisions.
            </p>
          </div>
        </section>

        <div className="flex justify-end mt-[25px] max-sm:w-full">
          <button
            onClick={saveDangerResult}
            className="border-0 min-h-[54px] px-[22px] bg-[#0f5c45] hover:bg-[#103f32] text-white rounded-[12px] font-extrabold flex items-center justify-center gap-[9px] cursor-pointer max-sm:w-full"
          >
            Continue to Patient Summary
            <ArrowRight size={20} />
          </button>
        </div>
      </main>
    </div>
  );
}