import {
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function SignupStatus() {
  const navigate = useNavigate();
  const role =
    sessionStorage.getItem("aarogyaVaaniRole") || "health-worker";

  const userName =
    sessionStorage.getItem("aarogyaVaaniUserName") ||
    (role === "doctor" ? "Dr. Aarogya" : "Health Worker");

  return (
    <div className="min-h-screen bg-[#f5f9f8] text-[#12322f] font-sans">
      <header className="min-h-[72px] bg-white border-b border-[#e2ece9] flex justify-between items-center px-[35px] max-sm:px-4">
        <div>
          <h1 className="m-0 text-[#087f6a] text-[18px]">AarogyaVaani</h1>
          <span className="text-[#81918e] text-[10px]">Tripura Health</span>
        </div>

        <button
          onClick={() => navigate("/dashboard")}
          className="border border-[#dce9e5] bg-white text-[#087f6a] rounded-[9px] h-[38px] px-[13px] flex items-center gap-[7px] cursor-pointer"
        >
          <ArrowLeft size={17} />
          Dashboard
        </button>
      </header>

      <main className="max-w-[850px] mx-auto p-[30px] max-sm:px-[14px] max-sm:py-[18px]">
        <div className="text-[#8a9c98] text-[11px] mb-[18px]">
          Dashboard <span className="mx-[7px]">›</span> Signup Status
        </div>

        <section className="bg-[#e8f7f2] border border-[#d1eae2] rounded-[15px] p-[25px] flex gap-[14px] items-center">
          <div className="w-[52px] h-[52px] rounded-[14px] bg-white text-[#087f6a] flex items-center justify-center">
            <CheckCircle2 size={28} />
          </div>

          <div className="flex flex-col">
            <span className="text-[8px] font-extrabold text-[#087f6a]">ACCOUNT STATUS</span>
            <h2 className="my-[5px] text-[22px]">Profile setup complete</h2>
            <p className="m-0 text-[#718582] text-[10px]">
              This device has an active AarogyaVaani workspace.
            </p>
          </div>
        </section>

        <section className="bg-white border border-[#e2ece9] rounded-[15px] p-[20px] mt-[18px]">
          <div className="flex items-center gap-[11px] pb-[17px] border-b border-[#edf2f0]">
            <div className="w-[42px] h-[42px] rounded-[11px] bg-[#e7f7f2] text-[#087f6a] flex items-center justify-center">
              <UserRound size={22} />
            </div>

            <div className="flex flex-col gap-[3px]">
              <span className="text-[#8b9d99] text-[8px]">Registered user</span>
              <strong className="text-[11px]">{userName}</strong>
            </div>
          </div>

          <div className="grid grid-cols-[25px_1fr_auto] gap-[10px] items-center py-[14px] border-b border-[#edf2f0] text-[#087f6a]">
            <ShieldCheck size={18} />

            <div className="flex flex-col gap-[3px]">
              <span className="text-[#8b9d99] text-[8px]">Workspace</span>
              <strong className="text-[#12322f] text-[10px]">
                {role === "doctor"
                  ? "Doctor Workspace"
                  : "Health Worker Workspace"}
              </strong>
            </div>

            <b className="bg-[#e8f8f0] text-[#198a6e] rounded-[20px] px-[8px] py-[5px] text-[8px]">Active</b>
          </div>

          <div className="grid grid-cols-[25px_1fr_auto] gap-[10px] items-center py-[14px] border-b border-[#edf2f0] text-[#087f6a]">
            <CheckCircle2 size={18} />

            <div className="flex flex-col gap-[3px]">
              <span className="text-[#8b9d99] text-[8px]">Local profile</span>
              <strong className="text-[#12322f] text-[10px]">Available on this device</strong>
            </div>

            <b className="bg-[#e8f8f0] text-[#198a6e] rounded-[20px] px-[8px] py-[5px] text-[8px]">Ready</b>
          </div>
        </section>
      </main>
    </div>
  );
}

export default SignupStatus;