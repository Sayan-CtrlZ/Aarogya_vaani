import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  ShieldAlert,
  UserRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const alerts = [
  {
    id: "patient-4",
    name: "Bimala Reang",
    age: "31",
    type: "Maternal & Antenatal",
    sign: "Severe headache / blurred vision",
    time: "09:21 AM",
  },
];

function DangerAlerts() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f5f9f8] text-[#12322f] font-sans">
      <header className="min-h-[72px] bg-white border-b border-[#e2ece9] flex justify-between items-center px-[35px] max-md:px-4">
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

      <main className="max-w-[1100px] mx-auto p-[30px] max-md:px-[14px] max-md:py-[18px]">
        <div className="text-[#8a9c98] text-[11px] mb-[18px]">
          Dashboard <span className="mx-[7px]">›</span> Danger Alerts
        </div>

        <section className="bg-[#fff1f1] border border-[#f0d1d1] text-[#cf5151] rounded-[15px] p-[25px] flex items-center gap-[14px]">
          <ShieldAlert size={26} />

          <div>
            <h2 className="text-[#12322f] mb-1 text-[23px] mt-0">Danger Alerts</h2>
            <p className="m-0 text-[#718582] text-[11px]">
              Predefined safety rules that require health-worker or
              doctor attention.
            </p>
          </div>
        </section>

        <div className="mt-[18px] bg-[#fffaf0] border border-[#f1e1bd] rounded-[12px] p-[15px] flex gap-[10px] text-[#b27620]">
          <AlertTriangle size={20} />

          <div>
            <strong className="text-[11px] font-bold">Safety flags are not diagnoses.</strong>
            <p className="mt-1 mb-0 text-[#8c806c] text-[9px]">
              AarogyaVaani only highlights predefined danger signs
              collected during patient intake.
            </p>
          </div>
        </div>

        <section className="mt-[18px] flex flex-col gap-[12px]">
          {alerts.map((alert) => (
            <article className="bg-white border border-[#ecdada] rounded-[13px] p-[16px] grid grid-cols-[1.3fr_1.5fr_90px_auto] gap-[15px] items-center max-md:grid-cols-1" key={alert.id}>
              <div className="flex items-center gap-[10px]">
                <div className="w-[38px] h-[38px] rounded-[10px] bg-[#fde7e7] text-[#d45555] flex items-center justify-center">
                  <UserRound size={20} />
                </div>

                <div className="flex flex-col gap-[3px]">
                  <strong className="text-[11px]">{alert.name}</strong>
                  <span className="text-[8px] text-[#91a19d]">
                    {alert.age} years • {alert.type}
                  </span>
                </div>
              </div>

              <div className="bg-[#fff2f2] rounded-[8px] p-[9px] flex gap-[6px] items-center text-[#cc5050] text-[9px] font-bold">
                <AlertTriangle size={17} />
                <span>{alert.sign}</span>
              </div>

              <div className="text-[#879995] text-[9px]">
                {alert.time}
              </div>

              <button
                onClick={() => navigate(`/patient-details?id=${alert.id}`)}
                className="border-0 bg-[#d95858] text-white rounded-[8px] h-[34px] px-[11px] flex items-center gap-[5px] cursor-pointer text-[9px] font-bold max-md:justify-center"
              >
                Review
                <ArrowRight size={15} />
              </button>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}

export default DangerAlerts;