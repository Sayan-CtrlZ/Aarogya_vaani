import {
  ArrowLeft,
  CheckCircle2,
  CloudOff,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function SyncStatus() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f5f9f8] text-[#12322f] font-sans">
      <header className="min-h-[72px] bg-white border-b border-[#e2ece9] flex items-center justify-between px-[35px] max-sm:px-4">
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

      <main className="max-w-[950px] mx-auto p-[30px] max-sm:px-[14px] max-sm:py-[18px]">
        <div className="text-[#8a9c98] text-[11px] mb-[18px]">
          Dashboard <span className="mx-[7px]">›</span> Sync Status
        </div>

        <section className="bg-[#e8f7f2] border border-[#d4ebe4] rounded-[15px] p-[25px] flex items-center gap-[14px] text-[#087f6a]">
          <CloudOff size={27} />

          <div>
            <h2 className="mb-1 text-[#12322f] text-[23px]">Offline & Sync Status</h2>
            <p className="m-0 text-[#718582] text-[10px]">
              AarogyaVaani is designed to keep patient intake
              available even without internet.
            </p>
          </div>
        </section>

        <section className="grid grid-cols-3 max-sm:grid-cols-1 gap-[14px] mt-[18px]">
          <div className="bg-white border border-[#e2ece9] rounded-[13px] p-[18px] flex flex-col gap-[6px] text-[#087f6a]">
            <CheckCircle2 size={21} />
            <span className="text-[#879995] text-[9px] mt-[8px]">Local storage</span>
            <strong className="text-[#12322f] text-[19px]">Ready</strong>
            <p className="text-[#879995] text-[9px] leading-[1.5] m-0">Patient data remains on this device.</p>
          </div>

          <div className="bg-white border border-[#e2ece9] rounded-[13px] p-[18px] flex flex-col gap-[6px] text-[#087f6a]">
            <RefreshCw size={21} />
            <span className="text-[#879995] text-[9px] mt-[8px]">Records waiting</span>
            <strong className="text-[#12322f] text-[19px]">03</strong>
            <p className="text-[#879995] text-[9px] leading-[1.5] m-0">These records can be synced later.</p>
          </div>

          <div className="bg-white border border-[#e2ece9] rounded-[13px] p-[18px] flex flex-col gap-[6px] text-[#087f6a]">
            <ShieldCheck size={21} />
            <span className="text-[#879995] text-[9px] mt-[8px]">Privacy</span>
            <strong className="text-[#12322f] text-[19px]">Protected</strong>
            <p className="text-[#879995] text-[9px] leading-[1.5] m-0">Consent-first local data handling.</p>
          </div>
        </section>

        <button
          className="mt-[18px] border-0 bg-[#087f6a] text-white h-[40px] rounded-[8px] px-[15px] flex items-center gap-[7px] cursor-pointer text-[10px] font-bold"
          onClick={() => {
            alert(
              "Sync check complete. The application remains ready for offline operation."
            );
          }}
        >
          <RefreshCw size={17} />
          Check Again
        </button>
      </main>
    </div>
  );
}

export default SyncStatus;