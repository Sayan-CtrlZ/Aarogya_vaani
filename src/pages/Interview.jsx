import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Mic,
  MicOff,
  CheckCircle2,
} from "lucide-react";
import "./Interview.css";

/* =========================================================
   MATERNAL QUESTIONS
========================================================= */

const maternalQuestions = [
  {
    id: 1,
    key: "age",
    translations: {
      english: "How old are you?",
      bengali: "আপনার বয়স কত?",
      hindi: "आपकी उम्र कितनी है?",
      kokborok: "Nini bohor?",
    },
    placeholder: {
      english: "Enter your age",
      bengali: "আপনার বয়স লিখুন",
      hindi: "अपनी उम्र दर्ज करें",
      kokborok: "Nini bohor khulum",
    },
    type: "text",
  },
  {
    id: 2,
    key: "pregnancyMonths",
    translations: {
      english: "How many months pregnant are you?",
      bengali: "আপনি কত মাসের গর্ভবতী?",
      hindi: "आप कितने महीने की गर्भवती हैं?",
      kokborok: "Nini borokni kotor month?",
    },
    placeholder: {
      english: "Enter months",
      bengali: "মাস লিখুন",
      hindi: "महीने दर्ज करें",
      kokborok: "Month khulum",
    },
    type: "text",
  },
  {
    id: 3,
    key: "firstPregnancy",
    translations: {
      english: "Is this your first pregnancy?",
      bengali: "এটি কি আপনার প্রথম গর্ভাবস্থা?",
      hindi: "क्या यह आपकी पहली गर्भावस्था है?",
      kokborok: "Bini pregnancy sakra?",
    },
    type: "yesno",
  },
  {
    id: 4,
    key: "previousComplications",
    translations: {
      english:
        "Did you have any complications during a previous pregnancy or delivery?",
      bengali:
        "আগের গর্ভাবস্থা বা প্রসবের সময় কি কোনো জটিলতা হয়েছিল?",
      hindi:
        "क्या पिछली गर्भावस्था या प्रसव के दौरान कोई जटिलता हुई थी?",
      kokborok:
        "Agor pregnancy ba delivery somoi khamokha asik?",
    },
    type: "yesno",
  },
  {
    id: 5,
    key: "bleeding",
    translations: {
      english: "Do you have any vaginal bleeding?",
      bengali: "আপনার কি যোনিপথে রক্তপাত হচ্ছে?",
      hindi: "क्या आपको योनि से रक्तस्राव हो रहा है?",
      kokborok: "Nini vaginal bleeding tong?",
    },
    type: "yesno",
  },
  {
    id: 6,
    key: "abdominalPain",
    translations: {
      english: "Do you have severe abdominal pain or cramps?",
      bengali: "আপনার কি তীব্র পেটে ব্যথা বা ক্র্যাম্প হচ্ছে?",
      hindi: "क्या आपको तेज पेट दर्द या ऐंठन हो रही है?",
      kokborok: "Nini stomach-ni khorok ba betha tong?",
    },
    type: "yesno",
  },
  {
    id: 7,
    key: "headacheVision",
    translations: {
      english: "Do you have a severe headache or blurred vision?",
      bengali: "আপনার কি তীব্র মাথাব্যথা বা ঝাপসা দৃষ্টি হচ্ছে?",
      hindi: "क्या आपको तेज सिरदर्द या धुंधला दिखाई दे रहा है?",
      kokborok: "Nini head-ni khorok ba chok khulum?",
    },
    type: "yesno",
  },
  {
    id: 8,
    key: "fever",
    translations: {
      english: "Do you have fever or feel very unwell?",
      bengali: "আপনার কি জ্বর বা খুব অসুস্থ লাগছে?",
      hindi: "क्या आपको बुखार है या बहुत अस्वस्थ महसूस हो रहा है?",
      kokborok: "Nini fever tong ba khorok khang?",
    },
    type: "yesno",
  },
  {
    id: 9,
    key: "swelling",
    translations: {
      english: "Do you have swelling of your face or hands?",
      bengali: "আপনার মুখ বা হাতে কি ফোলা আছে?",
      hindi: "क्या आपके चेहरे या हाथों में सूजन है?",
      kokborok: "Nini mukh ba hat-ni swelling tong?",
    },
    type: "yesno",
  },
  {
    id: 10,
    key: "babyMovement",
    translations: {
      english: "Have you felt your baby move today?",
      bengali: "আজ কি আপনি আপনার শিশুর নড়াচড়া অনুভব করেছেন?",
      hindi: "क्या आपने आज अपने बच्चे की हलचल महसूस की है?",
      kokborok: "Nini baby movement aini feel khang?",
    },
    type: "yesno",
  },
  {
    id: 11,
    key: "antenatalCheckups",
    translations: {
      english: "Have you been attending your antenatal checkups?",
      bengali: "আপনি কি নিয়মিত গর্ভকালীন পরীক্ষা করছেন?",
      hindi: "क्या आप नियमित प्रसवपूर्व जांच करा रही हैं?",
      kokborok: "Nini antenatal checkup regular khang?",
    },
    type: "yesno",
  },
  {
    id: 12,
    key: "bloodPressure",
    translations: {
      english: "Have you had your blood pressure checked recently?",
      bengali: "সম্প্রতি কি আপনার রক্তচাপ পরীক্ষা করা হয়েছে?",
      hindi: "क्या हाल ही में आपका ब्लड प्रेशर चेक हुआ है?",
      kokborok: "Nini blood pressure recent check khang?",
    },
    type: "yesno",
  },
  {
    id: 13,
    key: "medicalConditions",
    translations: {
      english:
        "Do you have anaemia, high blood pressure, diabetes, or another medical condition?",
      bengali:
        "আপনার কি রক্তশূন্যতা, উচ্চ রক্তচাপ, ডায়াবেটিস বা অন্য কোনো রোগ আছে?",
      hindi:
        "क्या आपको एनीमिया, हाई ब्लड प्रेशर, डायबिटीज या कोई अन्य बीमारी है?",
      kokborok:
        "Nini anaemia, high pressure, diabetes ba sakra rog tong?",
    },
    type: "yesno",
  },
  {
    id: 14,
    key: "medicines",
    translations: {
      english:
        "Are you taking any medicines, iron tablets, or supplements?",
      bengali:
        "আপনি কি কোনো ওষুধ, আয়রন ট্যাবলেট বা সাপ্লিমেন্ট নিচ্ছেন?",
      hindi:
        "क्या आप कोई दवा, आयरन की गोली या सप्लीमेंट ले रही हैं?",
      kokborok:
        "Nini medicine, iron tablet ba supplement khang?",
    },
    type: "yesno",
  },
  {
    id: 15,
    key: "otherConcern",
    translations: {
      english:
        "Is there any other health concern you want to tell us about?",
      bengali:
        "আপনার কি অন্য কোনো স্বাস্থ্য সমস্যা আছে যা আপনি জানাতে চান?",
      hindi:
        "क्या कोई अन्य स्वास्थ्य समस्या है जिसके बारे में आप बताना चाहती हैं?",
      kokborok:
        "Nini sakra health concern tong?",
    },
    type: "yesno",
  },
];

/* =========================================================
   GENERAL QUESTIONS
========================================================= */

const generalQuestions = [
  {
    id: 1,
    key: "age",
    translations: {
      english: "How old are you?",
      bengali: "আপনার বয়স কত?",
      hindi: "आपकी उम्र कितनी है?",
      kokborok: "Nini bohor?",
    },
    placeholder: {
      english: "Enter your age",
      bengali: "আপনার বয়স লিখুন",
      hindi: "अपनी उम्र दर्ज करें",
      kokborok: "Nini bohor khulum",
    },
    type: "text",
  },
  {
    id: 2,
    key: "mainProblem",
    translations: {
      english: "What is your main health problem today?",
      bengali: "আজ আপনার প্রধান স্বাস্থ্য সমস্যা কী?",
      hindi: "आज आपकी मुख्य स्वास्थ्य समस्या क्या है?",
      kokborok: "Aini nini main health problem ni?",
    },
    placeholder: {
      english: "Describe the problem",
      bengali: "সমস্যাটি লিখুন",
      hindi: "समस्या बताएं",
      kokborok: "Problem khulum",
    },
    type: "text",
  },
  {
    id: 3,
    key: "duration",
    translations: {
      english: "How long have you had this problem?",
      bengali: "এই সমস্যাটি কতদিন ধরে আছে?",
      hindi: "यह समस्या आपको कब से है?",
      kokborok: "Kotor din-ni problem tong?",
    },
    placeholder: {
      english: "For example: 2 days",
      bengali: "যেমন: ২ দিন",
      hindi: "जैसे: 2 दिन",
      kokborok: "Example: 2 days",
    },
    type: "text",
  },
  {
    id: 4,
    key: "pain",
    translations: {
      english: "Do you have pain in any part of your body?",
      bengali: "আপনার শরীরের কোনো অংশে কি ব্যথা হচ্ছে?",
      hindi: "क्या आपके शरीर के किसी हिस्से में दर्द है?",
      kokborok: "Nini body-ni sakra jaiga-ni betha tong?",
    },
    type: "yesno",
    adaptive: "bodyPain",
  },
  {
    id: 5,
    key: "painSeverity",
    translations: {
      english: "How severe is the pain?",
      bengali: "ব্যথাটি কতটা তীব্র?",
      hindi: "दर्द कितना तेज है?",
      kokborok: "Betha kotor khorok?",
    },
    type: "choice",
    options: {
      english: ["Mild", "Moderate", "Severe"],
      bengali: ["হালকা", "মাঝারি", "তীব্র"],
      hindi: ["हल्का", "मध्यम", "तेज"],
      kokborok: ["Mild", "Moderate", "Severe"],
    },
  },
  {
    id: 6,
    key: "fever",
    translations: {
      english: "Do you have fever?",
      bengali: "আপনার কি জ্বর আছে?",
      hindi: "क्या आपको बुखार है?",
      kokborok: "Nini fever tong?",
    },
    type: "yesno",
  },
  {
    id: 7,
    key: "breathing",
    translations: {
      english: "Are you having difficulty breathing?",
      bengali: "আপনার কি শ্বাস নিতে অসুবিধা হচ্ছে?",
      hindi: "क्या आपको सांस लेने में कठिनाई हो रही है?",
      kokborok: "Nini saas khangni khamokha tong?",
    },
    type: "yesno",
  },
  {
    id: 8,
    key: "fainting",
    translations: {
      english:
        "Have you fainted, felt severely dizzy, or lost consciousness?",
      bengali:
        "আপনি কি অজ্ঞান হয়েছেন, খুব মাথা ঘুরেছে বা জ্ঞান হারিয়েছেন?",
      hindi:
        "क्या आप बेहोश हुए हैं, बहुत चक्कर आया है या होश खोया है?",
      kokborok:
        "Nini behosh ba khorok dizzy khang?",
    },
    type: "yesno",
  },
  {
    id: 9,
    key: "vomiting",
    translations: {
      english:
        "Are you vomiting repeatedly or unable to keep fluids down?",
      bengali:
        "আপনার কি বারবার বমি হচ্ছে বা পানি রাখতে পারছেন না?",
      hindi:
        "क्या आपको बार-बार उल्टी हो रही है या पानी भी नहीं रुक रहा?",
      kokborok:
        "Nini bar bar vomiting ba pani khangni khamokha tong?",
    },
    type: "yesno",
  },
  {
    id: 10,
    key: "conditions",
    translations: {
      english: "Do you have any known medical conditions?",
      bengali: "আপনার কি কোনো পরিচিত রোগ আছে?",
      hindi: "क्या आपको कोई ज्ञात बीमारी है?",
      kokborok: "Nini sakra known rog tong?",
    },
    type: "yesno",
  },
  {
    id: 11,
    key: "medicines",
    translations: {
      english: "Are you currently taking any medicines?",
      bengali: "আপনি কি বর্তমানে কোনো ওষুধ খাচ্ছেন?",
      hindi: "क्या आप अभी कोई दवा ले रहे हैं?",
      kokborok: "Nini aini medicine khang?",
    },
    type: "yesno",
  },
  {
    id: 12,
    key: "allergies",
    translations: {
      english: "Do you have any medicine or food allergies?",
      bengali: "আপনার কি কোনো ওষুধ বা খাবারে অ্যালার্জি আছে?",
      hindi: "क्या आपको किसी दवा या भोजन से एलर्जी है?",
      kokborok: "Nini medicine ba food-ni allergy tong?",
    },
    type: "yesno",
  },
  {
    id: 13,
    key: "surgery",
    translations: {
      english:
        "Have you ever had surgery or been admitted to a hospital?",
      bengali:
        "আপনার কি কখনও অস্ত্রোপচার হয়েছে বা হাসপাতালে ভর্তি হতে হয়েছে?",
      hindi:
        "क्या आपकी कभी सर्जरी हुई है या अस्पताल में भर्ती हुए हैं?",
      kokborok:
        "Nini surgery ba hospital admission khang?",
    },
    type: "yesno",
  },
  {
    id: 14,
    key: "appetiteSleepEnergy",
    translations: {
      english:
        "Have you noticed changes in your appetite, sleep, or energy?",
      bengali:
        "আপনার খাওয়া, ঘুম বা শক্তির মধ্যে কি কোনো পরিবর্তন হয়েছে?",
      hindi:
        "क्या आपकी भूख, नींद या ऊर्जा में कोई बदलाव आया है?",
      kokborok:
        "Nini appetite, sleep ba energy-ni change tong?",
    },
    type: "yesno",
  },
  {
    id: 15,
    key: "otherConcern",
    translations: {
      english: "Is there any other concern you want to tell us about?",
      bengali: "আপনার কি অন্য কোনো সমস্যা আছে যা আপনি জানাতে চান?",
      hindi:
        "क्या कोई अन्य समस्या है जिसके बारे में आप बताना चाहते हैं?",
      kokborok:
        "Nini sakra concern khulumni tong?",
    },
    type: "yesno",
  },
];

/* =========================================================
   LANGUAGE UI TEXT
========================================================= */

const languageText = {
  english: {
    back: "Back",
    next: "Next",
    finish: "Continue",
    yes: "Yes",
    no: "No",
    listening: "Listening...",
    speak: "Speak Answer",

    selectLocation: "Where does it hurt?",
    selectMultiple: "Select one or more areas",
    otherLocation: "Please specify where it hurts",
    otherPlaceholder: "Type the body part or location",
    selected: "Selected",
    body: "Body",

    firstVisitQuestion:
      "Have you visited this health centre before?",
    firstVisitDescription:
      "This helps us know whether you have previous medical reports to attach.",
    firstVisit: "This is my first visit",
    previousVisit: "I have visited before",

    firstStep: "Final step",
    question: "Question",
  },

  bengali: {
    back: "পিছনে",
    next: "পরবর্তী",
    finish: "চালিয়ে যান",
    yes: "হ্যাঁ",
    no: "না",
    listening: "শোনা হচ্ছে...",
    speak: "উত্তর বলুন",

    selectLocation: "কোথায় ব্যথা হচ্ছে?",
    selectMultiple: "এক বা একাধিক অংশ নির্বাচন করুন",
    otherLocation: "কোথায় ব্যথা হচ্ছে লিখুন",
    otherPlaceholder: "শরীরের অংশ বা স্থান লিখুন",
    selected: "নির্বাচিত",
    body: "শরীর",

    firstVisitQuestion:
      "আপনি কি আগে এই স্বাস্থ্যকেন্দ্রে এসেছেন?",
    firstVisitDescription:
      "এর মাধ্যমে আমরা জানতে পারব আপনার আগের কোনো রিপোর্ট আছে কি না।",
    firstVisit: "এটি আমার প্রথমবার",
    previousVisit: "আমি আগে এসেছি",

    firstStep: "শেষ ধাপ",
    question: "প্রশ্ন",
  },

  hindi: {
    back: "पीछे",
    next: "आगे",
    finish: "जारी रखें",
    yes: "हाँ",
    no: "नहीं",
    listening: "सुन रहा है...",
    speak: "उत्तर बोलें",

    selectLocation: "कहाँ दर्द हो रहा है?",
    selectMultiple: "एक या अधिक हिस्से चुनें",
    otherLocation: "दर्द कहाँ है, बताएं",
    otherPlaceholder: "शरीर का हिस्सा या स्थान लिखें",
    selected: "चयनित",
    body: "शरीर",

    firstVisitQuestion:
      "क्या आप पहले इस स्वास्थ्य केंद्र में आए हैं?",
    firstVisitDescription:
      "इससे हमें पता चलेगा कि आपके पास पिछली मेडिकल रिपोर्ट है या नहीं।",
    firstVisit: "यह मेरी पहली यात्रा है",
    previousVisit: "मैं पहले आ चुका/चुकी हूँ",

    firstStep: "अंतिम चरण",
    question: "प्रश्न",
  },

  kokborok: {
    back: "Agok",
    next: "Agor",
    finish: "Continue",
    yes: "Ih",
    no: "Ihi",
    listening: "Khang khang...",
    speak: "Katha khulum",

    selectLocation: "Bini kothai betha tong?",
    selectMultiple: "Sakra jaiga select khang",
    otherLocation: "Kothai betha tong khulum",
    otherPlaceholder: "Body part ba jaiga khulum",
    selected: "Select khang",
    body: "Body",

    firstVisitQuestion:
      "Nini agor somoi health centre-o khang?",
    firstVisitDescription:
      "Agor medical report tong na nai khangni help khang.",
    firstVisit: "Iha nini first visit",
    previousVisit: "Nini agor somoi khang",

    firstStep: "Last step",
    question: "Question",
  },
};

/* =========================================================
   BODY PARTS
========================================================= */

const bodyParts = [
  { id: "head", label: "Head" },
  { id: "neck", label: "Neck" },
  { id: "chest", label: "Chest" },
  { id: "stomach", label: "Stomach" },
  { id: "back", label: "Back" },
  { id: "leftArm", label: "Left Arm" },
  { id: "rightArm", label: "Right Arm" },
  { id: "leftHand", label: "Left Hand" },
  { id: "rightHand", label: "Right Hand" },
  { id: "leftLeg", label: "Left Leg" },
  { id: "rightLeg", label: "Right Leg" },
  { id: "other", label: "Other" },
];

/* =========================================================
   BODY PAIN SELECTOR
========================================================= */

function BodyPainSelector({
  language,
  selectedParts,
  setSelectedParts,
  otherText,
  setOtherText,
}) {
  const text = languageText[language] || languageText.english;

  const togglePart = (partId) => {
    setSelectedParts((previous) =>
      previous.includes(partId)
        ? previous.filter((item) => item !== partId)
        : [...previous, partId]
    );
  };

  return (
    <div className="body-pain-section">
      <div className="body-pain-heading">
        <span className="adaptive-badge">Adaptive question</span>

        <h3>{text.selectLocation}</h3>

        <p>{text.selectMultiple}</p>
      </div>

      <div className="body-pain-layout">
        {/* BODY DIAGRAM */}
        <div className="body-diagram-card">
          <div className="body-diagram-title">
            {text.body}
          </div>

          <div className="human-body">
            {/* HEAD */}
            <button
              type="button"
              aria-label="Head"
              className={`body-part body-head ${
                selectedParts.includes("head") ? "active" : ""
              } ${
                selectedParts.includes("head")
                  ? "danger-location"
                  : ""
              }`}
              onClick={() => togglePart("head")}
            >
              {selectedParts.includes("head") && (
                <span className="head-alert-dot" />
              )}
            </button>

            {/* NECK */}
            <button
              type="button"
              aria-label="Neck"
              className={`body-part body-neck ${
                selectedParts.includes("neck") ? "active" : ""
              }`}
              onClick={() => togglePart("neck")}
            />

            {/* CHEST */}
            <button
              type="button"
              aria-label="Chest"
              className={`body-part body-chest ${
                selectedParts.includes("chest") ? "active" : ""
              }`}
              onClick={() => togglePart("chest")}
            />

            {/* STOMACH */}
            <button
              type="button"
              aria-label="Stomach"
              className={`body-part body-stomach ${
                selectedParts.includes("stomach")
                  ? "active"
                  : ""
              }`}
              onClick={() => togglePart("stomach")}
            />

            {/* LEFT ARM */}
            <button
              type="button"
              aria-label="Left arm"
              className={`body-part body-left-arm ${
                selectedParts.includes("leftArm")
                  ? "active"
                  : ""
              }`}
              onClick={() => togglePart("leftArm")}
            />

            {/* RIGHT ARM */}
            <button
              type="button"
              aria-label="Right arm"
              className={`body-part body-right-arm ${
                selectedParts.includes("rightArm")
                  ? "active"
                  : ""
              }`}
              onClick={() => togglePart("rightArm")}
            />

            {/* LEFT HAND */}
            <button
              type="button"
              aria-label="Left hand"
              className={`body-part body-left-hand ${
                selectedParts.includes("leftHand")
                  ? "active"
                  : ""
              }`}
              onClick={() => togglePart("leftHand")}
            />

            {/* RIGHT HAND */}
            <button
              type="button"
              aria-label="Right hand"
              className={`body-part body-right-hand ${
                selectedParts.includes("rightHand")
                  ? "active"
                  : ""
              }`}
              onClick={() => togglePart("rightHand")}
            />

            {/* LEFT LEG */}
            <button
              type="button"
              aria-label="Left leg"
              className={`body-part body-left-leg ${
                selectedParts.includes("leftLeg")
                  ? "active"
                  : ""
              }`}
              onClick={() => togglePart("leftLeg")}
            />

            {/* RIGHT LEG */}
            <button
              type="button"
              aria-label="Right leg"
              className={`body-part body-right-leg ${
                selectedParts.includes("rightLeg")
                  ? "active"
                  : ""
              }`}
              onClick={() => togglePart("rightLeg")}
            />

            <div className="body-center-line" />
          </div>

          {selectedParts.includes("head") && (
            <div className="head-alert-message">
              <span className="blinking-red-light" />
              Head selected
            </div>
          )}
        </div>

        {/* BODY LOCATION BUTTONS */}
        <div className="body-location-options">
          {bodyParts.map((part) => (
            <button
              type="button"
              key={part.id}
              className={`body-location-option ${
                selectedParts.includes(part.id)
                  ? "selected"
                  : ""
              }`}
              onClick={() => togglePart(part.id)}
            >
              <span className="body-location-dot">●</span>

              <span>{part.label}</span>

              {selectedParts.includes(part.id) && (
                <CheckCircle2 size={18} />
              )}
            </button>
          ))}
        </div>
      </div>

      {selectedParts.includes("other") && (
        <div className="other-body-location">
          <label>{text.otherLocation}</label>

          <input
            type="text"
            value={otherText}
            onChange={(event) =>
              setOtherText(event.target.value)
            }
            placeholder={text.otherPlaceholder}
          />
        </div>
      )}

      {selectedParts.length > 0 && (
        <div className="selected-body-parts">
          <strong>{text.selected}:</strong>{" "}
          {selectedParts
            .map(
              (id) =>
                bodyParts.find(
                  (part) => part.id === id
                )?.label || id
            )
            .join(", ")}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   VISIT HISTORY
========================================================= */

function VisitHistoryQuestion({
  language,
  visitHistory,
  setVisitHistory,
}) {
  const text =
    languageText[language] || languageText.english;

  return (
    <div className="visit-history-section">
      <div className="visit-history-icon">
        <CheckCircle2 size={32} />
      </div>

      <h2>{text.firstVisitQuestion}</h2>

      <p>{text.firstVisitDescription}</p>

      <div className="visit-history-options">
        <button
          type="button"
          className={`visit-history-button ${
            visitHistory === "first-time"
              ? "selected"
              : ""
          }`}
          onClick={() =>
            setVisitHistory("first-time")
          }
        >
          <span className="visit-radio">
            {visitHistory === "first-time" ? "✓" : ""}
          </span>

          <span>{text.firstVisit}</span>
        </button>

        <button
          type="button"
          className={`visit-history-button ${
            visitHistory === "previous"
              ? "selected"
              : ""
          }`}
          onClick={() =>
            setVisitHistory("previous")
          }
        >
          <span className="visit-radio">
            {visitHistory === "previous" ? "✓" : ""}
          </span>

          <span>{text.previousVisit}</span>
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN INTERVIEW
========================================================= */

export default function Interview() {
  const patientData = JSON.parse(
    localStorage.getItem(
      "aarogyaVaaniCurrentPatient"
    ) || "{}"
  );

  const consentData = JSON.parse(
    localStorage.getItem(
      "aarogyaVaaniConsent"
    ) || "{}"
  );

  const patientType =
    patientData.patientType || "maternal";

  const language =
    consentData.language || "english";

  const questions = useMemo(
    () =>
      patientType === "general"
        ? generalQuestions
        : maternalQuestions,
    [patientType]
  );

  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [answers, setAnswers] = useState({});

  const [selectedBodyParts, setSelectedBodyParts] =
    useState([]);

  const [otherBodyLocation, setOtherBodyLocation] =
    useState("");

  const [isListening, setIsListening] =
    useState(false);

  const [voiceError, setVoiceError] =
    useState("");

  const [showVisitHistory, setShowVisitHistory] =
    useState(false);

  const [visitHistory, setVisitHistory] =
    useState("");

  const currentQuestion =
    questions[currentIndex];

  const text =
    languageText[language] ||
    languageText.english;

  /* =====================================================
     LOAD SAVED INTERVIEW
  ===================================================== */

  useEffect(() => {
    const savedInterview = JSON.parse(
      localStorage.getItem(
        "aarogyaVaaniInterview"
      ) || "{}"
    );

    if (savedInterview.answers) {
      setAnswers(savedInterview.answers);
    }

    if (savedInterview.bodyPain?.locations) {
      setSelectedBodyParts(
        savedInterview.bodyPain.locations
      );
    }

    if (savedInterview.bodyPain?.otherLocation) {
      setOtherBodyLocation(
        savedInterview.bodyPain.otherLocation
      );
    }

    if (savedInterview.visitHistory) {
      setVisitHistory(
        savedInterview.visitHistory
      );
    }
  }, []);

  /* =====================================================
     SET ANSWER
  ===================================================== */

  const setAnswer = (value) => {
    setAnswers((previous) => ({
      ...previous,
      [currentQuestion.key]: value,
    }));
  };

  /* =====================================================
     DANGER RULES
  ===================================================== */

  const getDangerSigns = () => {
    const detectedDangerSigns = [];

    if (patientType === "maternal") {
      if (answers.bleeding === "Yes") {
        detectedDangerSigns.push(
          "Vaginal bleeding"
        );
      }

      if (answers.abdominalPain === "Yes") {
        detectedDangerSigns.push(
          "Severe abdominal pain"
        );
      }

      if (answers.headacheVision === "Yes") {
        detectedDangerSigns.push(
          "Severe headache or blurred vision"
        );
      }

      if (answers.fever === "Yes") {
        detectedDangerSigns.push(
          "Fever / feeling very unwell"
        );
      }

      if (answers.babyMovement === "No") {
        detectedDangerSigns.push(
          "Reduced or absent baby movement"
        );
      }
    }

    if (patientType === "general") {
      if (answers.breathing === "Yes") {
        detectedDangerSigns.push(
          "Difficulty breathing"
        );
      }

      if (answers.fainting === "Yes") {
        detectedDangerSigns.push(
          "Fainting / severe dizziness / loss of consciousness"
        );
      }
    }

    return detectedDangerSigns;
  };

  /* =====================================================
     SAVE INTERVIEW
  ===================================================== */

  const saveInterviewProgress = (
    completed = false
  ) => {
    const detectedDangerSigns =
      getDangerSigns();

    localStorage.setItem(
      "aarogyaVaaniInterview",
      JSON.stringify({
        patientType,
        language,
        languageName:
          consentData.languageName ||
          "English",

        answers,

        bodyPain: {
          hasPain: answers.pain === "Yes",
          locations: selectedBodyParts,
          otherLocation: otherBodyLocation,
        },

        visitHistory,

        dangerSigns:
          detectedDangerSigns,

        completed,

        completedAt: completed
          ? new Date().toISOString()
          : null,
      })
    );
  };

  /* =====================================================
     FINISH INTERVIEW
  ===================================================== */

  const finishInterview = () => {
    if (!visitHistory) {
      alert(text.firstVisitQuestion);
      return;
    }

    saveInterviewProgress(true);

    /*
      FIRST-TIME PATIENT
      Interview → Danger Check

      RETURNING PATIENT
      Interview → Reports → Danger Check
    */

    if (visitHistory === "previous") {
      window.location.href = "/reports";
    } else {
      window.location.href = "/danger-check";
    }
  };

  /* =====================================================
     NORMAL FORWARD MOVEMENT
  ===================================================== */

  const moveForward = () => {
    if (
      currentIndex <
      questions.length - 1
    ) {
      setCurrentIndex(
        (previous) => previous + 1
      );

      setVoiceError("");

      return;
    }

    /*
      We have reached the final numbered
      question, so show the visit-history step.
    */

    setShowVisitHistory(true);

    setVoiceError("");

    saveInterviewProgress(false);
  };

  /* =====================================================
     NEXT QUESTION
  ===================================================== */

  const nextQuestion = () => {
    /*
      BODY PAIN ADAPTIVE FLOW
    */

    if (
      currentQuestion.adaptive ===
      "bodyPain"
    ) {
      const painAnswer =
        answers[currentQuestion.key];

      /*
        No pain:
        Skip the pain-severity question.
        Go directly to question 6.
      */

      if (painAnswer === "No") {
        if (
          currentIndex <
          questions.length - 1
        ) {
          setCurrentIndex(
            currentIndex + 2
          );
        }

        setVoiceError("");

        return;
      }

      /*
        Yes pain:
        Patient must select at least
        one body location.
      */

      if (painAnswer === "Yes") {
        if (
          selectedBodyParts.length === 0
        ) {
          alert(text.selectLocation);
          return;
        }

        /*
          If Other is selected, require
          the patient to describe it.
        */

        if (
          selectedBodyParts.includes(
            "other"
          ) &&
          !otherBodyLocation.trim()
        ) {
          alert(text.otherLocation);
          return;
        }

        /*
          Pain location completed.
          Continue to pain severity.
        */

        moveForward();

        return;
      }

      /*
        Don't allow moving forward without
        answering the pain question.
      */

      alert(
        `${currentQuestion.translations[
          language
        ] || currentQuestion.translations.english}`
      );

      return;
    }

    /*
      NORMAL QUESTIONS
    */

    moveForward();
  };

  /* =====================================================
     PREVIOUS QUESTION
  ===================================================== */

  const previousQuestion = () => {
    if (showVisitHistory) {
      setShowVisitHistory(false);
      return;
    }

    /*
      Special case:
      If we are on pain severity (question 5),
      pressing Back should return to the
      body-pain question/location step.
    */

    if (
      patientType === "general" &&
      currentQuestion.key ===
        "painSeverity"
    ) {
      setCurrentIndex(
        currentIndex - 1
      );

      setVoiceError("");

      return;
    }

    /*
      If we are on question 6 and the patient
      had answered No to pain, pressing Back
      should return to question 4.
    */

    if (
      patientType === "general" &&
      currentQuestion.key === "fever" &&
      answers.pain === "No"
    ) {
      setCurrentIndex(
        currentIndex - 2
      );

      setVoiceError("");

      return;
    }

    if (currentIndex > 0) {
      setCurrentIndex(
        (previous) => previous - 1
      );

      setVoiceError("");

      return;
    }

    window.location.href = "/consent";
  };

  /* =====================================================
     VOICE INPUT
  ===================================================== */

  const startVoiceInput = () => {
    setVoiceError("");

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceError(
        "Voice input is not supported by this browser. Please use Chrome or another supported browser."
      );

      return;
    }

    const recognition =
      new SpeechRecognition();

    /*
      Use the language selected on the
      Consent page.
    */

    recognition.lang =
      consentData.speechCode ||
      "en-IN";

    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const spokenText =
        event.results[0][0].transcript;

      /*
        YES / NO detection
      */

      if (
        currentQuestion.type === "yesno"
      ) {
        const lower =
          spokenText.toLowerCase();

        if (
          lower.includes("yes") ||
          lower.includes("হ্যাঁ") ||
          lower.includes("হা") ||
          lower.includes("हाँ") ||
          lower.includes("ih")
        ) {
          setAnswer("Yes");
        } else if (
          lower.includes("no") ||
          lower.includes("না") ||
          lower.includes("नहीं") ||
          lower.includes("nahi") ||
          lower.includes("ihi")
        ) {
          setAnswer("No");
        } else {
          setAnswer(spokenText);
        }
      } else {
        setAnswer(spokenText);
      }
    };

    recognition.onerror = () => {
      setVoiceError(
        "We could not understand the voice input. Please try again."
      );

      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div className="interview-page">
      {/* HEADER */}

      <header className="interview-header">
        <div>
          <div className="brand-name">
            AarogyaVaani
          </div>

          <div className="brand-subtitle">
            Tripura Health
          </div>
        </div>

        <div className="interview-language">
          {consentData.languageName ||
            "English"}
        </div>
      </header>

      {/* MAIN */}

      <main className="interview-main">
        <div className="interview-top-row">
          <button
            type="button"
            className="interview-back-button"
            onClick={previousQuestion}
          >
            <ArrowLeft size={18} />
            {text.back}
          </button>

          <div className="question-counter">
            {showVisitHistory
              ? text.firstStep
              : `${text.question} ${
                  currentIndex + 1
                } of ${questions.length}`}
          </div>
        </div>

        {/* PROGRESS */}

        <div className="interview-progress">
          <div
            className="interview-progress-fill"
            style={{
              width: showVisitHistory
                ? "100%"
                : `${
                    ((currentIndex + 1) /
                      questions.length) *
                    100
                  }%`,
            }}
          />
        </div>

        {/* QUESTION CARD */}

        <section className="question-card">
          {!showVisitHistory ? (
            <>
              <div className="question-number">
                {String(
                  currentIndex + 1
                ).padStart(2, "0")}
              </div>

              <h1>
                {currentQuestion.translations[
                  language
                ] ||
                  currentQuestion
                    .translations
                    .english}
              </h1>

              {/* TEXT INPUT */}

              {currentQuestion.type ===
                "text" && (
                <div className="text-answer-area">
                  <input
                    type="text"
                    value={
                      answers[
                        currentQuestion.key
                      ] || ""
                    }
                    onChange={(event) =>
                      setAnswer(
                        event.target.value
                      )
                    }
                    placeholder={
                      currentQuestion
                        .placeholder?.[
                        language
                      ] ||
                      currentQuestion
                        .placeholder
                        ?.english
                    }
                  />
                </div>
              )}

              {/* YES / NO */}

              {currentQuestion.type ===
                "yesno" && (
                <div className="answer-buttons">
                  <button
                    type="button"
                    className={`answer-button yes ${
                      answers[
                        currentQuestion.key
                      ] === "Yes"
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      setAnswer("Yes")
                    }
                  >
                    {text.yes}
                  </button>

                  <button
                    type="button"
                    className={`answer-button no ${
                      answers[
                        currentQuestion.key
                      ] === "No"
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      setAnswer("No")
                    }
                  >
                    {text.no}
                  </button>
                </div>
              )}

              {/* CHOICE */}

              {currentQuestion.type ===
                "choice" && (
                <div className="choice-grid">
                  {currentQuestion.options[
                    language
                  ].map(
                    (option, index) => (
                      <button
                        type="button"
                        key={option}
                        className={`choice-button ${
                          answers[
                            currentQuestion.key
                          ] ===
                          currentQuestion
                            .options
                            .english[
                            index
                          ]
                            ? "selected"
                            : ""
                        }`}
                        onClick={() =>
                          setAnswer(
                            currentQuestion
                              .options
                              .english[
                              index
                            ]
                          )
                        }
                      >
                        {option}
                      </button>
                    )
                  )}
                </div>
              )}

              {/* BODY PAIN ADAPTIVE FLOW */}

              {currentQuestion.adaptive ===
                "bodyPain" &&
                answers[
                  currentQuestion.key
                ] === "Yes" && (
                  <BodyPainSelector
                    language={language}
                    selectedParts={
                      selectedBodyParts
                    }
                    setSelectedParts={
                      setSelectedBodyParts
                    }
                    otherText={
                      otherBodyLocation
                    }
                    setOtherText={
                      setOtherBodyLocation
                    }
                  />
                )}

              {/* VOICE */}

              <div className="voice-section">
                <button
                  type="button"
                  className={`voice-button ${
                    isListening
                      ? "listening"
                      : ""
                  }`}
                  onClick={
                    isListening
                      ? undefined
                      : startVoiceInput
                  }
                >
                  {isListening ? (
                    <MicOff size={20} />
                  ) : (
                    <Mic size={20} />
                  )}

                  {isListening
                    ? text.listening
                    : text.speak}
                </button>

                {voiceError && (
                  <p className="voice-error">
                    {voiceError}
                  </p>
                )}
              </div>

              {/* NAVIGATION */}

              <div className="interview-navigation">
                <button
                  type="button"
                  className="secondary-nav-button"
                  onClick={
                    previousQuestion
                  }
                >
                  <ArrowLeft size={18} />
                  {text.back}
                </button>

                <button
                  type="button"
                  className="primary-nav-button"
                  onClick={nextQuestion}
                >
                  {text.next}
                  <ArrowRight size={18} />
                </button>
              </div>
            </>
          ) : (
            <>
              <VisitHistoryQuestion
                language={language}
                visitHistory={
                  visitHistory
                }
                setVisitHistory={
                  setVisitHistory
                }
              />

              <div className="interview-navigation">
                <button
                  type="button"
                  className="secondary-nav-button"
                  onClick={
                    previousQuestion
                  }
                >
                  <ArrowLeft size={18} />
                  {text.back}
                </button>

                <button
                  type="button"
                  className="primary-nav-button"
                  onClick={
                    finishInterview
                  }
                >
                  {text.finish}
                  <ArrowRight size={18} />
                </button>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

