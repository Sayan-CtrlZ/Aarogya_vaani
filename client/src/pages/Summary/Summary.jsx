import { useEffect, useState } from "react";
import {
  ArrowRight,
  ClipboardList,
  AlertTriangle,
  UserRound,
  Languages,
  ShieldCheck,
  FileText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

/* =========================================================
   SAFE LOCAL STORAGE READER
   ========================================================= */

function readLocalStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);

    if (!value) {
      return fallback;
    }

    return JSON.parse(value);
  } catch (error) {
    console.error(`Error reading localStorage key: ${key}`, error);
    return fallback;
  }
}

/* =========================================================
   DANGER SIGN NORMALIZER
   ========================================================= */

function normalizeDangerSigns(data) {
  if (!data) {
    return [];
  }

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data.dangerSigns)) {
    return data.dangerSigns;
  }

  if (Array.isArray(data.signs)) {
    return data.signs;
  }

  if (typeof data === "string" && data.trim()) {
    return [data];
  }

  return [];
}

/* =========================================================
   ANSWER NORMALIZER
   ========================================================= */

function normalizeAnswers(data) {
  if (!data) {
    return {};
  }

  if (
    typeof data !== "object" ||
    Array.isArray(data)
  ) {
    return {};
  }

  return data;
}

/* =========================================================
   QUESTION TEXT EXTRACTION
   ========================================================= */

function getQuestionText(item, index) {
  if (!item) {
    return `Question ${index + 1}`;
  }

  if (typeof item === "string") {
    return item;
  }

  return (
    item.question ||
    item.questionText ||
    item.text ||
    item.label ||
    item.prompt ||
    item.title ||
    item.questionName ||
    `Question ${index + 1}`
  );
}

/* =========================================================
   ANSWER TEXT EXTRACTION
   ========================================================= */

function getAnswerText(item) {
  if (item === null || item === undefined) {
    return "—";
  }

  if (
    typeof item === "string" ||
    typeof item === "number" ||
    typeof item === "boolean"
  ) {
    return String(item);
  }

  if (Array.isArray(item)) {
    return item
      .map((value) => getAnswerText(value))
      .join(", ");
  }

  if (typeof item === "object") {
    return (
      item.answer ??
      item.value ??
      item.response ??
      item.selectedAnswer ??
      item.selectedOption ??
      item.answerText ??
      item.text ??
      JSON.stringify(item)
    );
  }

  return String(item);
}

/* =========================================================
   INTERVIEW RESPONSE BUILDER
   ========================================================= */

function buildInterviewResponses(interviewData) {
  if (!interviewData) {
    return [];
  }

  const possibleArrays = [
    interviewData.responses,
    interviewData.questionsAndAnswers,
    interviewData.questionAnswers,
    interviewData.interviewResponses,
    interviewData.history,
  ];

  for (const possibleArray of possibleArrays) {
    if (Array.isArray(possibleArray) && possibleArray.length > 0) {
      return possibleArray.map((item, index) => ({
        number: index + 1,
        question: getQuestionText(item, index),
        answer: getAnswerText(
          item?.answer ??
          item?.value ??
          item?.response ??
          item?.selectedAnswer ??
          item?.selectedOption ??
          item
        ),
      }));
    }
  }

  if (
    Array.isArray(interviewData.questions) &&
    Array.isArray(interviewData.answers)
  ) {
    return interviewData.questions.map((question, index) => ({
      number: index + 1,
      question: getQuestionText(question, index),
      answer: getAnswerText(interviewData.answers[index]),
    }));
  }

  const answers = normalizeAnswers(interviewData.answers);

  if (Object.keys(answers).length > 0) {
    const questionSource =
      interviewData.questions ||
      interviewData.questionList ||
      interviewData.interviewQuestions ||
      [];

    const answerEntries = Object.entries(answers);

    return answerEntries.map(
      ([key, value], index) => {
        let questionText = "";

        if (
          Array.isArray(questionSource) &&
          questionSource[index]
        ) {
          questionText = getQuestionText(
            questionSource[index],
            index
          );
        }

        const keyLooksNumeric =
          !isNaN(Number(key)) &&
          String(key).trim() !== "";

        if (!questionText && !keyLooksNumeric) {
          questionText = key;
        }

        if (!questionText) {
          questionText = `Question ${index + 1}`;
        }

        return {
          number: index + 1,
          question: questionText,
          answer: getAnswerText(value),
        };
      }
    );
  }

  return [];
}

/* =========================================================
   MAIN COMPONENT
   ========================================================= */

function Summary() {
  const navigate = useNavigate();
  const [patientData, setPatientData] = useState(null);
  const [interviewData, setInterviewData] = useState(null);
  const [dangerData, setDangerData] = useState(null);
  const [reports, setReports] = useState([]);

  /* =======================================================
     LOAD DATA
     ======================================================= */

  useEffect(() => {
    console.log("=================================");
    console.log("AarogyaVaani Summary: Loading data");
    console.log("=================================");

    const patient = readLocalStorage(
      "aarogyaVaaniCurrentPatient",
      null
    );

    const interview = readLocalStorage(
      "aarogyaVaaniInterview",
      null
    );

    const danger = readLocalStorage(
      "aarogyaVaaniDangerCheck",
      null
    );

    const savedReports = readLocalStorage(
      "aarogyaVaaniReports",
      []
    );

    console.log("Patient data:", patient);
    console.log("Interview data:", interview);
    console.log("Danger data:", danger);
    console.log("Reports:", savedReports);

    setPatientData(patient);
    setInterviewData(interview);
    setDangerData(danger);

    setReports(
      Array.isArray(savedReports)
        ? savedReports
        : []
    );
  }, []);

  /* =======================================================
     LOADING
     ======================================================= */

  if (
    patientData === null ||
    interviewData === null
  ) {
    return (
      <div className="min-h-screen w-full bg-[linear-gradient(135deg,rgba(240,253,250,0.97),rgba(248,250,252,0.98))] text-[#16302b] font-sans overflow-x-hidden">
        <div className="w-[min(560px,90%)] mx-auto my-[90px] px-[30px] py-[45px] text-center bg-white border border-[#dcebe8] rounded-[20px] shadow-[0_15px_40px_rgba(14,84,71,0.08)]">
          <ClipboardList className="mx-auto text-[#087f68] mb-[12px]" size={42} />

          <h2 className="m-0 mb-[9px] text-[#173f38] text-[23px] font-[800]">
            Loading Patient Summary...
          </h2>

          <p className="m-0 mb-[22px] text-[#70817d] text-[14px] leading-[1.6]">
            Please wait while the collected
            patient information is being prepared.
          </p>
        </div>
      </div>
    );
  }

  /* =======================================================
     MISSING DATA
     ======================================================= */

  if (
    !patientData ||
    !interviewData
  ) {
    return (
      <div className="min-h-screen w-full bg-[linear-gradient(135deg,rgba(240,253,250,0.97),rgba(248,250,252,0.98))] text-[#16302b] font-sans overflow-x-hidden">
        <div className="w-[min(560px,90%)] mx-auto my-[90px] px-[30px] py-[45px] text-center bg-white border border-[#dcebe8] rounded-[20px] shadow-[0_15px_40px_rgba(14,84,71,0.08)]">
          <ClipboardList className="mx-auto text-[#087f68] mb-[12px]" size={42} />

          <h2 className="m-0 mb-[9px] text-[#173f38] text-[23px] font-[800]">
            Summary not available
          </h2>

          <p className="m-0 mb-[22px] text-[#70817d] text-[14px] leading-[1.6]">
            Please complete the patient
            interview first.
          </p>

          <button
            className="border-none px-[20px] py-[12px] rounded-[11px] bg-[#087f68] text-white font-sans text-[14px] font-[750] cursor-pointer transition-[0.2s_ease] hover:bg-[#075e54] hover:-translate-y-[1px] focus-visible:outline focus-visible:outline-3 focus-visible:outline-[rgba(8,127,104,0.25)] focus-visible:outline-offset-3"
            onClick={() => {
              navigate("/new-patient");
            }}
          >
            Start New Patient
          </button>
        </div>
      </div>
    );
  }

  /* =======================================================
     PATIENT DATA
     ======================================================= */

  const patient =
    patientData.patient &&
    typeof patientData.patient === "object"
      ? patientData.patient
      : patientData;

  /* =======================================================
     DANGER DATA
     ======================================================= */

  const dangerSignsFromStorage =
    normalizeDangerSigns(dangerData);

  const dangerSignsFromInterview =
    normalizeDangerSigns(
      interviewData.dangerSigns
    );

  const dangerSigns =
    dangerSignsFromStorage.length > 0
      ? dangerSignsFromStorage
      : dangerSignsFromInterview;

  const urgent =
    Boolean(
      dangerData?.urgent ||
      interviewData?.urgent
    ) ||
    dangerSigns.length > 0;

  /* =======================================================
     LANGUAGE
     ======================================================= */

  const languageName =
    interviewData.languageName ||
    dangerData?.languageName ||
    "English";

  /* =======================================================
     INTERVIEW RESPONSES
     ======================================================= */

  const interviewResponses =
    buildInterviewResponses(
      interviewData
    );

  console.log(
    "Prepared interview responses:",
    interviewResponses
  );

  /* =======================================================
     DOCTOR REVIEW
     ======================================================= */

  const handleDoctorReview = () => {
    try {
      const summary = {
        patient,

        patientType:
          patientData.patientType ||
          interviewData.patientType ||
          "general",

        language:
          interviewData.language ||
          "english",

        languageName,

        answers:
          interviewData.answers || {},

        responses:
          interviewResponses,

        bodyPain:
          interviewData.bodyPain || {
            hasPain: false,
            locations: [],
            otherLocation: "",
          },

        visitHistory:
          interviewData.visitHistory || "",

        dangerSigns,

        urgent,

        reports,

        generatedAt:
          new Date().toISOString(),

        doctorStatus:
          "pending-review",
      };

      console.log(
        "Saving AarogyaVaani summary:",
        summary
      );

      localStorage.setItem(
        "aarogyaVaaniSummary",
        JSON.stringify(summary)
      );

      console.log(
        "Summary saved successfully."
      );

      navigate("/doctor-review");
    } catch (error) {
      console.error(
        "Unable to save patient summary:",
        error
      );

      alert(
        "The patient summary could not be saved. Please try again."
      );
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  /* =======================================================
     UI
     ======================================================= */

  return (
    <div className="min-h-screen w-full bg-[linear-gradient(135deg,rgba(240,253,250,0.97),rgba(248,250,252,0.98))] text-[#16302b] font-sans overflow-x-hidden">

      {/* ===================================================
          HEADER
          =================================================== */}

      <header className="w-full min-h-[76px] px-[6%] py-[14px] flex items-center justify-between gap-[20px] bg-[linear-gradient(135deg,#075e54,#087f68)] text-white shadow-[0_4px_18px_rgba(0,0,0,0.12)] relative z-10 max-[900px]:px-[4%] max-[650px]:min-h-[70px] max-[650px]:px-[18px] max-[650px]:items-start">

        <div>
          <h1 className="m-0 text-[24px] font-[800] tracking-[-0.4px] max-[650px]:text-[21px]">
            AarogyaVaani
          </h1>

          <span className="block mt-[2px] text-[12px] opacity-[0.82] tracking-[0.4px] max-[650px]:text-[11px]">
            Tripura Health
          </span>
        </div>

        <div className="flex items-center gap-[8px] px-[14px] py-[9px] rounded-full bg-[rgba(255,255,255,0.13)] border border-[rgba(255,255,255,0.2)] text-[14px] font-semibold max-[650px]:px-[10px] max-[650px]:py-[7px] max-[650px]:text-[11px] max-[400px]:hidden">
          <ClipboardList size={18} />

          Patient Summary
        </div>

      </header>

      {/* ===================================================
          MAIN
          =================================================== */}

      <main className="w-[min(1180px,92%)] mx-auto pt-[30px] pb-[60px] max-[900px]:w-[92%] max-[900px]:pt-[25px] max-[650px]:w-[calc(100%-28px)] max-[650px]:pt-[20px] max-[650px]:pb-[40px] max-[400px]:w-[calc(100%-20px)]">

        {/* Breadcrumb */}

        <div className="flex items-center flex-wrap gap-[9px] mb-[22px] text-[#6b7d78] text-[13px] font-semibold max-[650px]:mb-[17px] max-[650px]:text-[11px]">

          Interview

          <span className="text-[#a2b0ad] text-[18px]">›</span>

          Danger Check

          <span className="text-[#a2b0ad] text-[18px]">›</span>

          Summary

        </div>

        {/* =================================================
            TITLE
            ================================================= */}

        <div className="flex items-start justify-between gap-[25px] mb-[28px] max-[900px]:items-start max-[650px]:block max-[650px]:mb-[21px]">

          <div>

            <p className="m-0 mb-[7px] text-[#07856e] text-[11px] font-[800] tracking-[1.4px]">
              STRUCTURED HISTORY
            </p>

            <h2 className="m-0 text-[#123c35] text-[clamp(30px,4vw,42px)] leading-[1.1] font-[800] tracking-[-1px] max-[650px]:text-[30px] max-[400px]:text-[27px]">
              Patient Summary
            </h2>

            <p className="mt-[9px] m-0 text-[#687b76] text-[15px] leading-[1.6] max-[650px]:text-[13px]">
              Review of the information
              collected during the
              patient interview.
            </p>

          </div>

          <div className="shrink-0 flex items-center gap-[8px] px-[15px] py-[10px] border border-[#cce5df] rounded-[12px] bg-white text-[#08715f] text-[13px] font-bold shadow-[0_5px_18px_rgba(14,84,71,0.06)] max-[650px]:w-fit max-[650px]:mt-[15px]">

            <Languages size={18} />

            {languageName}

          </div>

        </div>

        {/* =================================================
            PATIENT CARD
            ================================================= */}

        <section className="grid grid-cols-[auto_1.5fr_0.7fr_1.1fr] items-center gap-[20px] p-[22px] bg-white border border-[#d9ebe7] rounded-[18px] shadow-[0_10px_30px_rgba(14,84,71,0.07)] mb-[20px] max-[900px]:grid-cols-[auto_1fr_1fr] max-[650px]:grid-cols-[auto_1fr] max-[650px]:gap-[15px] max-[650px]:p-[18px] max-[400px]:p-[15px]">

          <div className="w-[52px] h-[52px] flex items-center justify-center rounded-[15px] bg-[#e5f6f1] text-[#08715f]">
            <UserRound size={25} />
          </div>

          <div>

            <span className="block mb-[5px] text-[#7a8b87] text-[11px] font-bold uppercase tracking-[0.6px]">
              Patient
            </span>

            <strong className="block text-[#173e37] text-[15px] font-[750] break-words">
              {patient.name ||
                patient.fullName ||
                "Unnamed Patient"}
            </strong>

          </div>

          <div className="max-[650px]:col-[1/-1]">

            <span className="block mb-[5px] text-[#7a8b87] text-[11px] font-bold uppercase tracking-[0.6px]">
              Age
            </span>

            <strong className="block text-[#173e37] text-[15px] font-[750] break-words">
              {patient.age || "—"}
            </strong>

          </div>

          <div className="max-[900px]:col-span-2 max-[900px]:col-start-2 max-[650px]:col-[1/-1]">

            <span className="block mb-[5px] text-[#7a8b87] text-[11px] font-bold uppercase tracking-[0.6px]">
              Intake type
            </span>

            <strong className="block text-[#173e37] text-[15px] font-[750] break-words">
              {patientData.patientType ===
              "maternal"
                ? "Maternal & Antenatal"
                : "General Patient"}
            </strong>

          </div>

        </section>

        {/* =================================================
            SAFETY STATUS
            ================================================= */}

        <section
          className={`flex items-start gap-[14px] px-[20px] py-[18px] rounded-[16px] mb-[22px] border border-solid max-[650px]:p-[16px] max-[650px]:gap-[11px] ${
            urgent
              ? "bg-[#fff7ed] border-[#fed7aa] text-[#9a3412]"
              : "bg-[#effcf6] border-[#c8eadb] text-[#146c58]"
          }`}
        >

          {urgent ? (
            <AlertTriangle className="shrink-0 mt-[2px] text-[#ea580c]" size={22} />
          ) : (
            <ShieldCheck className="shrink-0 mt-[2px] text-[#087f68]" size={22} />
          )}

          <div>

            <strong className="block mb-[4px] text-[15px] font-[800] max-[650px]:text-[14px]">
              {urgent
                ? "Urgent safety flag present"
                : "No danger sign flagged"}
            </strong>

            <p className="m-0 text-[13px] leading-[1.55] max-[650px]:text-[12px]">
              {urgent
                ? "The following predefined danger signs require health-worker or doctor review."
                : "The interview safety rules did not flag a danger sign."}
            </p>

          </div>

        </section>

        {/* =================================================
            DANGER SIGNS
            ================================================= */}

        {urgent && (
          <section className="bg-white border border-[#dcebe8] rounded-[18px] p-[24px] mb-[20px] shadow-[0_10px_28px_rgba(14,84,71,0.06)] max-[650px]:p-[18px] max-[650px]:rounded-[15px] max-[400px]:p-[15px]">

            <div className="flex items-center gap-[9px] pb-[16px] mb-[17px] border-b border-[#e8f0ee] text-[#08715f]">

              <AlertTriangle size={20} />

              <h3 className="m-0 text-[#183f38] text-[17px] font-[800] max-[650px]:text-[16px]">
                Danger Signs
              </h3>

            </div>

            {dangerSigns.length > 0 ? (

              <div className="flex flex-col gap-[10px]">

                {dangerSigns.map(
                  (sign, index) => (

                    <div
                      className="flex items-start gap-[11px] px-[15px] py-[13px] bg-[#fff7ed] border border-[#fed7aa] rounded-[12px] text-[#9a3412] text-[14px] leading-[1.5] max-[400px]:p-[11px] max-[400px]:text-[13px]"
                      key={`${String(
                        sign
                      )}-${index}`}
                    >

                      <AlertTriangle
                        size={17}
                        className="shrink-0 mt-[2px] text-[#ea580c]"
                      />

                      <span>
                        {typeof sign ===
                        "string"
                          ? sign
                          : sign?.label ||
                            sign?.name ||
                            sign?.message ||
                            JSON.stringify(
                              sign
                            )}
                      </span>

                    </div>

                  )
                )}

              </div>

            ) : (

              <p className="m-0 text-[#7b8b87] text-[14px] leading-[1.6]">
                A safety flag was recorded,
                but no specific danger sign
                was saved.
              </p>

            )}

          </section>
        )}

        {/* =================================================
            INTERVIEW RESPONSES
            ================================================= */}

        <section className="bg-white border border-[#dcebe8] rounded-[18px] p-[24px] mb-[20px] shadow-[0_10px_28px_rgba(14,84,71,0.06)] max-[650px]:p-[18px] max-[650px]:rounded-[15px] max-[400px]:p-[15px]">

          <div className="flex items-center gap-[9px] pb-[16px] mb-[17px] border-b border-[#e8f0ee] text-[#08715f]">

            <ClipboardList size={20} />

            <h3 className="m-0 text-[#183f38] text-[17px] font-[800] max-[650px]:text-[16px]">
              Interview Responses
            </h3>

          </div>

          {interviewResponses.length > 0 ? (

            <div className="flex flex-col gap-[12px]">

              {interviewResponses.map(
                (item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-[52px_minmax(250px,1.5fr)_minmax(180px,1fr)] items-start gap-[18px] px-[18px] py-[17px] bg-[#f8fbfa] border border-[#e4efec] rounded-[13px] min-w-0 transition-all duration-200 hover:bg-[#f3faf8] hover:border-[#cde5df] hover:shadow-[0_5px_15px_rgba(14,84,71,0.05)] max-[900px]:grid-cols-[45px_minmax(0,1fr)] max-[650px]:grid-cols-[38px_minmax(0,1fr)] max-[650px]:gap-[12px] max-[650px]:p-[14px] max-[400px]:p-[12px]"
                  >

                    <div className="w-[38px] min-w-[38px] h-[38px] flex items-center justify-center rounded-[10px] bg-[#e2f4ef] text-[#08715f] text-[13px] font-[800] overflow-hidden max-[650px]:w-[34px] max-[650px]:min-w-[34px] max-[650px]:h-[34px] max-[650px]:rounded-[9px] max-[650px]:text-[12px]">
                      {item.number}
                    </div>

                    <div className="min-w-0">

                      <span className="block mb-[5px] text-[#08715f] text-[10px] font-[800] uppercase tracking-[0.8px]">
                        Question
                      </span>

                      <span className="block text-[#294740] text-[14px] font-bold leading-[1.55] break-words max-[650px]:text-[13px]">
                        {item.question}
                      </span>

                    </div>

                    <div className="min-w-0 pl-[18px] border-l border-[#dcebe7] max-[900px]:col-start-2 max-[900px]:pl-0 max-[900px]:pt-[10px] max-[900px]:border-l-0 max-[900px]:border-t max-[650px]:col-[1/-1] max-[650px]:pl-0 max-[650px]:pt-[11px] max-[650px]:border-l-0 max-[650px]:border-t">

                      <span className="block mb-[5px] text-[#81918d] text-[10px] font-[800] uppercase tracking-[0.8px]">
                        Response
                      </span>

                      <span className="block text-[#173f38] text-[14px] font-semibold leading-[1.55] break-words max-[650px]:text-[13px]">
                        {item.answer}
                      </span>

                    </div>

                  </div>
                )
              )}

            </div>

          ) : (

            <p className="m-0 text-[#7b8b87] text-[14px] leading-[1.6]">
              No structured interview
              responses were found for
              this patient.
            </p>

          )}

        </section>

        {/* =================================================
            CLINICAL SAFETY NOTE
            ================================================= */}

        <section className="flex items-start gap-[13px] mt-[22px] px-[20px] py-[18px] bg-[#eef9f6] border border-[#cce8e1] rounded-[15px] text-[#146c58] max-[650px]:p-[16px] max-[650px]:gap-[10px]">

          <ShieldCheck size={20} className="shrink-0 mt-[2px]" />

          <div>
            <strong className="block mb-[5px] text-[#075e54] text-[14px] font-[800]">
              Patient Privacy & Final Review
            </strong>

            <p className="m-0 text-[#52716a] text-[13px] leading-[1.6] max-[650px]:text-[12px]">
              This AI-generated summary does not replace professional clinical judgment. Please proceed to the final review to securely submit this record.
            </p>
          </div>

        </section>

        {/* =================================================
            ACTIONS
            ================================================= */}

        <section className="flex items-center justify-between gap-[15px] mt-[30px] max-[650px]:flex-col-reverse max-[650px]:items-stretch">

          <button
            className="min-h-[48px] rounded-[12px] px-[20px] font-sans text-[14px] font-[750] cursor-pointer transition-all duration-200 hover:-translate-y-[2px] active:translate-y-0 max-[650px]:w-full focus-visible:outline focus-visible:outline-3 focus-visible:outline-[rgba(8,127,104,0.25)] focus-visible:outline-offset-3 bg-white border border-[#cbded9] text-[#40635b] hover:bg-[#f3f9f7] hover:shadow-[0_6px_16px_rgba(14,84,71,0.08)]"
            onClick={handleGoBack}
          >
            Back
          </button>

          <button
            className="min-h-[48px] rounded-[12px] px-[20px] font-sans text-[14px] font-[750] cursor-pointer transition-all duration-200 hover:-translate-y-[2px] active:translate-y-0 max-[650px]:w-full focus-visible:outline focus-visible:outline-3 focus-visible:outline-[rgba(8,127,104,0.25)] focus-visible:outline-offset-3 inline-flex items-center justify-center gap-[9px] bg-[linear-gradient(135deg,#087f68,#075e54)] border-none text-white shadow-[0_8px_20px_rgba(8,127,104,0.22)] hover:shadow-[0_12px_26px_rgba(8,127,104,0.3)] group"
            onClick={handleDoctorReview}
          >
            <span>Continue to Doctor Review</span>
            <ArrowRight size={18} className="transition-transform duration-200 group-hover:translate-x-[3px]" />
          </button>

        </section>

      </main>

    </div>
  );
}

export default Summary;