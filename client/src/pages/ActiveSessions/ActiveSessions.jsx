import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Mic,
  PauseCircle,
  UserRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function ActiveSessions() {
  const navigate = useNavigate();
  const currentPatient = JSON.parse(
    localStorage.getItem("aarogyaVaaniCurrentPatient") || "null"
  );

  const hasSession = Boolean(currentPatient?.patient);

  return (
    <div className="min-h-screen bg-[#f5f9f8] text-[#12322f] font-sans">
      <header className="min-h-[72px] bg-white border-b border-[#e2ece9] flex justify-between items-center px-[35px] max-md:px-4">
        <div>
          <h1 className="m-0 text-[#087f6a] text-[18px]">AarogyaVaani</h1>
          <span className="text-[10px] text-[#81918e]">Tripura Health</span>
        </div>

        <button
          onClick={() => navigate("/dashboard")}
          className="border border-[#dce9e5] bg-white text-[#087f6a] rounded-[9px] h-[38px] px-[13px] flex items-center gap-[7px] cursor-pointer"
        >
          <ArrowLeft size={17} />
          Dashboard
        </button>
      </header>

      <main className="max-w-[1000px] mx-auto p-[30px] max-md:px-[14px] max-md:py-[18px]">
        <div className="text-[#8a9c98] text-[11px] mb-[18px]">
          Dashboard <span className="mx-[7px]">›</span> Active Sessions
        </div>

        <section className="bg-[#e8f7f2] border border-[#d4ebe4] rounded-[15px] p-[25px] flex items-center gap-[14px] text-[#087f6a]">
          <Activity size={25} />

          <div>
            <h2 className="text-[#12322f] mb-1 text-[23px] mt-0">Active Sessions</h2>
            <p className="m-0 text-[#718582] text-[11px]">
              Patient interviews currently stored or active on this
              device.
            </p>
          </div>
        </section>

        {hasSession ? (
          <section className="bg-white border border-[#e2ece9] rounded-[15px] mt-[18px] p-[22px]">
            <div className="text-[#168b6d] text-[9px] font-extrabold flex items-center gap-[6px]">
              <span className="w-[8px] h-[8px] rounded-full bg-[#25b583] shadow-[0_0_0_5px_#e5f8f1]" />
              ACTIVE
            </div>

            <div className="mt-[20px] flex items-center gap-[13px]">
              <div className="w-[55px] h-[55px] rounded-[15px] bg-[#e7f7f2] text-[#087f6a] flex items-center justify-center">
                <UserRound size={24} />
              </div>

              <div>
                <span className="text-[9px] text-[#8d9d99]">Current Patient</span>
                <h3 className="my-[3px] text-[17px]">{currentPatient.patient.name}</h3>
                <p className="m-0 text-[#758984] text-[10px]">
                  {currentPatient.patientType === "maternal"
                    ? "Maternal & Antenatal"
                    : "General Patient"}
                </p>
              </div>
            </div>

            <div className="flex gap-[10px] mt-[25px] max-md:flex-col">
              <button
                className="border-0 bg-[#087f6a] text-white rounded-[8px] h-[38px] px-[13px] flex items-center gap-[7px] cursor-pointer text-[10px] font-bold max-md:justify-center"
                onClick={() => navigate("/interview")}
              >
                <Mic size={17} />
                Resume Intake
                <ArrowRight size={15} />
              </button>

              <button
                className="border border-[#dce9e5] bg-white text-[#687d78] rounded-[8px] h-[38px] px-[13px] flex items-center gap-[7px] cursor-pointer text-[10px] font-bold max-md:justify-center"
                onClick={() => {
                  alert(
                    "This session remains safely stored on the device."
                  );
                }}
              >
                <PauseCircle size={17} />
                Keep Session Saved
              </button>
            </div>
          </section>
        ) : (
          <div className="mt-[20px] bg-white border border-[#e2ece9] rounded-[15px] px-[20px] py-[70px] text-center text-[#8a9b97] flex flex-col items-center justify-center">
            <Activity size={38} />
            <h3 className="text-[#12322f] my-2">No active session</h3>
            <p className="m-0">Start a new patient intake to begin a session.</p>

            <button
              onClick={() => navigate("/new-patient")}
              className="border-0 bg-[#087f6a] text-white rounded-[8px] px-[15px] py-[10px] cursor-pointer mt-4"
            >
              Start New Intake
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default ActiveSessions;