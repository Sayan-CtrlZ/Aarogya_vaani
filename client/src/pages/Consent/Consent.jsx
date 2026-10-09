import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ShieldCheck,
  Volume2,
  Languages,
  Mic,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const languages = [
  {
    id: "english",
    name: "English",
    native: "English",
    speechCode: "en-IN",
  },
  {
    id: "bengali",
    name: "Bengali",
    native: "বাংলা",
    speechCode: "bn-IN",
  },
  {
    id: "hindi",
    name: "Hindi",
    native: "हिन्दी",
    speechCode: "hi-IN",
  },
  {
    id: "kokborok",
    name: "Kokborok",
    native: "Kokborok",
    speechCode: "kok-IN",
  },
];

function Consent() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState("english");
  const [audioConsent, setAudioConsent] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const patientData = JSON.parse(
    localStorage.getItem("aarogyaVaaniCurrentPatient") || "{}"
  );

  const patientType = patientData.patientType || "maternal";

  const selectedLanguage = languages.find(
    (item) => item.id === language
  );

  const goBack = () => {
    navigate("/new-patient");
  };

  const handleContinue = () => {
    if (!audioConsent || !privacyAccepted) {
      alert(
        "Please provide audio consent and accept the privacy notice before continuing."
      );
      return;
    }

    localStorage.setItem(
      "aarogyaVaaniConsent",
      JSON.stringify({
        language,
        languageName: selectedLanguage.name,
        speechCode: selectedLanguage.speechCode,
        audioConsent: true,
        consentGiven: true,
        consentAt: new Date().toISOString(),
      })
    );

    navigate("/interview");
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-[#f3faf6] text-[#123c30] before:content-[''] before:fixed before:inset-0 before:bg-[linear-gradient(rgba(243,250,246,0.94),rgba(243,250,246,0.97)),url('https://upload.wikimedia.org/wikipedia/commons/3/36/Tripura_in_India.svg')] before:bg-no-repeat before:bg-center before:bg-[length:cover,520px] before:opacity-95 before:pointer-events-none before:z-0">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(47,143,105,0.12),transparent_30%),radial-gradient(circle_at_90%_80%,rgba(15,92,69,0.08),transparent_30%)] pointer-events-none z-10"></div>

      <header className="min-h-[78px] px-[5%] py-[15px] bg-[rgba(255,255,255,0.92)] border-b border-[#dcebe4] flex items-center justify-between relative z-50 backdrop-blur-[14px] max-sm:px-[18px] max-sm:py-[14px]">
        <div>
          <div className="text-[25px] font-extrabold tracking-[-0.5px] text-[#103f32]">AarogyaVaani</div>
          <div className="mt-[1px] text-[11px] font-bold tracking-[1.7px] text-[#2f8f69] uppercase">Tripura Health</div>
        </div>

        <div>
          <span className="flex items-center gap-[7px] px-[13px] py-[9px] rounded-[30px] bg-[#e8f5ef] text-[#176246] text-[13px] font-bold max-sm:hidden">
            <ShieldCheck size={17} />
            Privacy First
          </span>
        </div>
      </header>

      <main className="relative z-30 w-[min(1120px,92%)] mx-auto py-[28px] max-sm:pt-[20px] pb-[55px] max-md:w-[min(94%,760px)]">
        <div className="flex items-center gap-[8px] text-[13px] text-[#71867d] mb-[20px]">
          <span className="cursor-pointer hover:text-[#2f8f69]" onClick={goBack}>Patient Information</span>
          <ArrowRight size={15} />
          <strong className="text-[#103f32]">Language & Consent</strong>
        </div>

        <div className="flex items-center justify-center gap-[10px] mb-[32px] max-sm:justify-start max-sm:overflow-x-auto">
          <div className="flex items-center gap-[8px] text-[#176246] text-[12px] font-bold max-sm:whitespace-nowrap">
            <span className="w-[29px] h-[29px] rounded-full bg-[#2f8f69] grid place-items-center text-white">
              <Check size={15} />
            </span>
            Patient
          </div>

          <div className="w-[70px] h-[2px] bg-[#2f8f69] max-sm:w-[25px] max-sm:shrink-0"></div>

          <div className="flex items-center gap-[8px] text-[#176246] text-[12px] font-bold max-sm:whitespace-nowrap">
            <span className="w-[29px] h-[29px] rounded-full bg-[#2f8f69] grid place-items-center text-white">2</span>
            Consent
          </div>

          <div className="w-[70px] h-[2px] bg-[#d9e5df] max-sm:w-[25px] max-sm:shrink-0"></div>

          <div className="flex items-center gap-[8px] text-[#91a69d] text-[12px] font-bold max-sm:whitespace-nowrap">
            <span className="w-[29px] h-[29px] rounded-full bg-[#e1ebe6] grid place-items-center">3</span>
            Interview
          </div>

          <div className="w-[70px] h-[2px] bg-[#d9e5df] max-sm:w-[25px] max-sm:shrink-0"></div>

          <div className="flex items-center gap-[8px] text-[#91a69d] text-[12px] font-bold max-sm:whitespace-nowrap">
            <span className="w-[29px] h-[29px] rounded-full bg-[#e1ebe6] grid place-items-center">4</span>
            Summary
          </div>
        </div>

        <section className="flex items-center gap-[18px] mb-[20px] max-sm:items-start">
          <div className="w-[62px] h-[62px] shrink-0 rounded-[18px] bg-[#dff2e9] text-[#176246] grid place-items-center max-sm:w-[50px] max-sm:h-[50px]">
            <Languages size={30} />
          </div>

          <div>
            <p className="m-0 mb-[5px] text-[11px] font-extrabold text-[#2f8f69] tracking-[1.5px]">STEP 2 OF 4</p>
            <h1 className="m-0 text-[#103f32] text-[clamp(28px,4vw,42px)] tracking-[-1px]">Language & Consent</h1>

            <p className="mt-[8px] max-w-[720px] leading-[1.6] text-[#61776e]">
              Choose the language the patient is most comfortable speaking.
              AarogyaVaani will use this choice throughout the interview.
            </p>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-[20px] px-[20px] py-[17px] mb-[18px] bg-[rgba(255,255,255,0.85)] border border-[#dcebe4] rounded-[16px] max-sm:grid-cols-1">
          <div>
            <span className="block text-[11px] text-[#80948c] uppercase tracking-[1px] mb-[5px]">Patient</span>
            <strong className="text-[15px] text-[#163f33]">
              {patientData.patient?.name || "Patient"}
            </strong>
          </div>

          <div>
            <span className="block text-[11px] text-[#80948c] uppercase tracking-[1px] mb-[5px]">Intake Type</span>
            <strong className="text-[15px] text-[#163f33]">
              {patientType === "maternal"
                ? "Maternal Care"
                : "General Patient Intake"}
            </strong>
          </div>
        </section>

        <section className="bg-[rgba(255,255,255,0.94)] border border-[#dcebe4] rounded-[22px] p-[25px] mb-[18px] shadow-[0_12px_35px_rgba(16,63,50,0.06)] max-sm:p-[18px] max-sm:rounded-[17px]">
          <div className="flex items-start justify-between gap-[20px] mb-[20px] text-[#2f8f69]">
            <div>
              <p className="m-0 mb-[5px] text-[11px] font-extrabold text-[#2f8f69] tracking-[1.5px]">PATIENT LANGUAGE</p>
              <h2 className="m-0 text-[#153f33] text-[20px]">Which language would you like to use?</h2>
            </div>

            <Languages size={24} />
          </div>

          <div className="grid grid-cols-4 gap-[13px] max-md:grid-cols-2 max-sm:grid-cols-1">
            {languages.map((item) => (
              <button
                key={item.id}
                className={`relative rounded-[17px] p-[17px] text-left flex items-center gap-[12px] cursor-pointer transition-[0.25s_ease] hover:-translate-y-[3px] hover:border-[#79b89f] hover:shadow-[0_9px_22px_rgba(47,143,105,0.1)] ${
                  language === item.id ? "bg-[#eaf7f0] border-2 border-[#2f8f69]" : "bg-[#f9fcfa] border border-[#d8e7df]"
                }`}
                onClick={() => setLanguage(item.id)}
              >
                <div className={`w-[25px] h-[25px] rounded-full grid place-items-center text-white shrink-0 ${language === item.id ? "bg-[#2f8f69] border border-[#2f8f69]" : "border-[1.5px] border-[#c5d9d0]"}`}>
                  {language === item.id && <Check size={17} />}
                </div>

                <div className="flex-1">
                  <strong className="block text-[#173e33] text-[15px]">{item.name}</strong>
                  <span className="block mt-[3px] text-[12px] text-[#81958d]">{item.native}</span>
                </div>

                <div className="text-[#79a996]">
                  <Mic size={18} />
                </div>
              </button>
            ))}
          </div>

          <div className="flex gap-[12px] items-start p-[15px] mt-[18px] rounded-[14px] bg-[#f1f8f4] text-[#2f8f69]">
            <Volume2 size={20} />

            <div>
              <strong className="text-[#245c49] text-[14px]">Voice-first support</strong>
              <p className="mt-[3px] mb-0 text-[12px] text-[#71867d] leading-[1.5]">
                The selected language will also be used when voice input is
                available on the device.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-[rgba(255,255,255,0.94)] border border-[#dcebe4] rounded-[22px] p-[25px] mb-[18px] shadow-[0_12px_35px_rgba(16,63,50,0.06)] max-sm:p-[18px] max-sm:rounded-[17px]">
          <div className="flex items-start justify-between gap-[20px] mb-[20px] text-[#2f8f69]">
            <div>
              <p className="m-0 mb-[5px] text-[11px] font-extrabold text-[#2f8f69] tracking-[1.5px]">AUDIO CONSENT</p>
              <h2 className="m-0 text-[#153f33] text-[20px]">May we use voice input?</h2>
            </div>

            <Mic size={24} />
          </div>

          <p className="text-[#687d74] leading-[1.6] text-[14px] -mt-[8px] mb-[18px]">
            AarogyaVaani can use the device microphone to understand the
            patient's spoken answers. Audio is not stored as part of this
            demo workflow.
          </p>

          <button
            className={`w-full rounded-[17px] p-[16px] flex items-center gap-[14px] text-left cursor-pointer transition-[0.25s_ease] hover:border-[#7bb89f] ${
              audioConsent ? "bg-[#eaf7f0] border border-[#2f8f69]" : "bg-[#f9fcfa] border border-[#d6e6de]"
            }`}
            onClick={() => setAudioConsent(!audioConsent)}
          >
            <div className={`w-[31px] h-[31px] rounded-full grid place-items-center text-white shrink-0 ${audioConsent ? 'bg-[#2f8f69] border border-[#2f8f69]' : 'border-2 border-[#bcd4c8]'}`}>
              {audioConsent && <Check size={16} />}
            </div>

            <div>
              <strong className="block text-[#173e33] text-[14px]">
                {audioConsent
                  ? "Audio consent given"
                  : "Allow voice input"}
              </strong>

              <span className="block text-[#81958d] text-[12px] mt-[3px]">
                {audioConsent
                  ? "The patient has agreed to continue."
                  : "Tap to provide consent."}
              </span>
            </div>
          </button>
        </section>

        <section className="flex gap-[15px] p-[20px] rounded-[20px] bg-[#edf7f2] border border-[#cfe4d9] mb-[22px] max-sm:p-[16px]">
          <div className="w-[45px] h-[45px] rounded-[13px] bg-white text-[#2f8f69] grid place-items-center shrink-0">
            <ShieldCheck size={23} />
          </div>

          <div>
            <h3 className="m-0 text-[#194b3a] text-[16px]">Patient privacy comes first</h3>

            <p className="my-[7px] mb-[13px] text-[#61776e] leading-[1.55] text-[13px]">
              The patient can refuse voice input or stop the interview at any
              time. AarogyaVaani does not provide a diagnosis. Final clinical
              review remains with the healthcare professional.
            </p>

            <label className="flex items-start gap-[10px] cursor-pointer text-[13px] text-[#315b4c] leading-[1.45]">
              <input
                type="checkbox"
                className="mt-[3px] accent-[#2f8f69] w-[16px] h-[16px]"
                checked={privacyAccepted}
                onChange={(e) =>
                  setPrivacyAccepted(e.target.checked)
                }
              />

              <span>
                I understand the privacy notice and the patient has agreed
                to continue.
              </span>
            </label>
          </div>
        </section>

        <div className="flex items-center justify-between gap-[15px] max-sm:flex-col-reverse">
          <button className="min-h-[48px] px-[22px] rounded-[13px] flex items-center justify-center gap-[9px] font-bold text-[14px] cursor-pointer transition-[0.25s_ease] max-sm:w-full border border-[#cdded6] bg-white text-[#315b4c] hover:border-[#2f8f69]" onClick={goBack}>
            <ArrowLeft size={18} />
            Back
          </button>

          <button
            className="min-h-[48px] px-[22px] rounded-[13px] flex items-center justify-center gap-[9px] font-bold text-[14px] cursor-pointer transition-[0.25s_ease] max-sm:w-full border-0 bg-[#176246] text-white shadow-[0_8px_20px_rgba(23,98,70,0.18)] hover:not-disabled:bg-[#0f4f3b] hover:not-disabled:-translate-y-[2px] disabled:opacity-45 disabled:cursor-not-allowed"
            onClick={handleContinue}
            disabled={!audioConsent || !privacyAccepted}
          >
            Continue to Interview
            <ArrowRight size={18} />
          </button>
        </div>
      </main>
    </div>
  );
}

export default Consent;