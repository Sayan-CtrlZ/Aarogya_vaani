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
import "./Summary.css";

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
  /*
    Different versions of the interview page may save
    the question using different property names.

    We check all common possibilities.
  */

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

  /*
    CASE 1:
    Interview data has an array such as:

    responses: [
      {
        question: "What is your name?",
        answer: "Rahul"
      }
    ]
  */

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

  /*
    CASE 2:
    Interview data has separate questions and answers arrays.

    Example:

    questions: [...]
    answers: [...]
  */

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

  /*
    CASE 3:
    Answers are stored as an object.

    Example:

    answers: {
      "1": "Yes",
      "2": "No",
      "3": "Yes"
    }

    In this case we use the question list if it exists.
  */

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

        /*
          If there is a corresponding question
          in an array, use it.
        */

        if (
          Array.isArray(questionSource) &&
          questionSource[index]
        ) {
          questionText = getQuestionText(
            questionSource[index],
            index
          );
        }

        /*
          If the key itself is a meaningful question,
          use it as the question.

          Numeric keys such as "1", "2", "3" are NOT
          treated as question text.
        */

        const keyLooksNumeric =
          !isNaN(Number(key)) &&
          String(key).trim() !== "";

        if (!questionText && !keyLooksNumeric) {
          questionText = key;
        }

        /*
          If no actual question text is available,
          provide a clear fallback.
        */

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
      <div className="summary-page">
        <div className="summary-empty">
          <ClipboardList size={42} />

          <h2>
            Loading Patient Summary...
          </h2>

          <p>
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
      <div className="summary-page">
        <div className="summary-empty">
          <ClipboardList size={42} />

          <h2>
            Summary not available
          </h2>

          <p>
            Please complete the patient
            interview first.
          </p>

          <button
            onClick={() => {
              window.location.href =
                "/new-patient";
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

      window.location.href =
        "/doctor-review";
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

  /* =======================================================
     UI
     ======================================================= */

  return (
    <div className="summary-page">

      {/* ===================================================
          HEADER
          =================================================== */}

      <header className="summary-header">

        <div>
          <h1>
            AarogyaVaani
          </h1>

          <span>
            Tripura Health
          </span>
        </div>

        <div className="summary-header-label">
          <ClipboardList size={18} />

          Patient Summary
        </div>

      </header>

      {/* ===================================================
          MAIN
          =================================================== */}

      <main className="summary-content">

        {/* Breadcrumb */}

        <div className="summary-breadcrumb">

          Interview

          <span>›</span>

          Danger Check

          <span>›</span>

          Summary

        </div>

        {/* =================================================
            TITLE
            ================================================= */}

        <div className="summary-title-row">

          <div>

            <p className="eyebrow">
              STRUCTURED HISTORY
            </p>

            <h2>
              Patient Summary
            </h2>

            <p>
              Review of the information
              collected during the
              patient interview.
            </p>

          </div>

          <div className="summary-language">

            <Languages size={18} />

            {languageName}

          </div>

        </div>

        {/* =================================================
            PATIENT CARD
            ================================================= */}

        <section className="summary-patient-card">

          <div className="summary-patient-icon">
            <UserRound size={25} />
          </div>

          <div>

            <span>
              Patient
            </span>

            <strong>
              {patient.name ||
                patient.fullName ||
                "Unnamed Patient"}
            </strong>

          </div>

          <div>

            <span>
              Age
            </span>

            <strong>
              {patient.age || "—"}
            </strong>

          </div>

          <div>

            <span>
              Intake type
            </span>

            <strong>
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
          className={`summary-alert ${
            urgent
              ? "urgent"
              : "normal"
          }`}
        >

          {urgent ? (
            <AlertTriangle size={22} />
          ) : (
            <ShieldCheck size={22} />
          )}

          <div>

            <strong>
              {urgent
                ? "Urgent safety flag present"
                : "No danger sign flagged"}
            </strong>

            <p>
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
          <section className="summary-card">

            <div className="summary-section-title">

              <AlertTriangle size={20} />

              <h3>
                Danger Signs
              </h3>

            </div>

            {dangerSigns.length > 0 ? (

              <div className="danger-summary-list">

                {dangerSigns.map(
                  (sign, index) => (

                    <div
                      className="danger-summary-item"
                      key={`${String(
                        sign
                      )}-${index}`}
                    >

                      <AlertTriangle
                        size={17}
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

              <p className="empty-response">
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

        <section className="summary-card">

          <div className="summary-section-title">

            <ClipboardList size={20} />

            <h3>
              Interview Responses
            </h3>

          </div>

          {interviewResponses.length ===
          0 ? (

            <p className="empty-response">
              No interview responses
              were saved.
            </p>

          ) : (

            <div className="response-list">

              {interviewResponses.map(
                (item) => (

                  <div
                    className="response-row"
                    key={item.number}
                  >

                    {/* SERIAL NUMBER */}

                    <div className="response-number">

                      {String(
                        item.number
                      ).padStart(2, "0")}

                    </div>

                    {/* QUESTION */}

                    <div className="response-question">

                      <span className="response-question-label">
                        Question
                      </span>

                      <span className="response-question-text">
                        {item.question}
                      </span>

                    </div>

                    {/* ANSWER */}

                    <div className="response-answer">

                      <span className="response-answer-label">
                        Patient Answer
                      </span>

                      <span className="response-answer-text">
                        {item.answer}
                      </span>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </section>

        {/* =================================================
            PREVIOUS REPORTS
            ================================================= */}

        {reports.length > 0 && (

          <section className="summary-card">

            <div className="summary-section-title">

              <FileText size={20} />

              <h3>
                Previous Reports
              </h3>

            </div>

            <div className="response-list">

              {reports.map(
                (report, index) => (

                  <div
                    className="response-row"
                    key={
                      report?.id ||
                      index
                    }
                  >

                    <div className="response-number">

                      <FileText
                        size={17}
                      />

                    </div>

                    <div className="response-question">

                      <span className="response-question-label">
                        Report
                      </span>

                      <span className="response-question-text">
                        {report?.reportName ||
                          "Medical Report"}
                      </span>

                    </div>

                    <div className="response-answer">

                      <span className="response-answer-label">
                        File
                      </span>

                      <span className="response-answer-text">
                        {report?.fileName ||
                          "Uploaded report"}
                      </span>

                    </div>

                  </div>

                )
              )}

            </div>

          </section>

        )}

        {/* =================================================
            CLINICAL SAFETY
            ================================================= */}

        <section className="summary-safety-note">

          <ShieldCheck size={21} />

          <div>

            <strong>
              Clinical safety
            </strong>

            <p>
              This summary records
              information provided
              during the interview.
              AarogyaVaani does not
              make a diagnosis. The
              doctor must review, edit
              and approve the summary.
            </p>

          </div>

        </section>

        {/* =================================================
            ACTIONS
            ================================================= */}

        <div className="summary-actions">

          <button
            className="summary-back"
            onClick={() => {
              window.location.href =
                "/danger-check";
            }}
          >
            Back
          </button>

          <button
            className="summary-next"
            onClick={
              handleDoctorReview
            }
          >

            Send to Doctor Review

            <ArrowRight
              size={19}
            />

          </button>

        </div>

      </main>

    </div>
  );
}

export default Summary;