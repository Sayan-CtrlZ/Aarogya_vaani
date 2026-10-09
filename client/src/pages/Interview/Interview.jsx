import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Mic, MicOff, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
      english: "Did you have any complications during a previous pregnancy or delivery?",
      bengali: "আগের গর্ভাবস্থা বা প্রসবের সময় কি কোনো জটিলতা হয়েছিল?",
      hindi: "क्या पिछली गर्भावस्था या प्रसव के दौरान कोई जटिलता हुई थी?",
      kokborok: "Agor pregnancy ba delivery somoi khamokha asik?",
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
      english: "Do you have anaemia, high blood pressure, diabetes, or another medical condition?",
      bengali: "আপনার কি রক্তশূন্যতা, উচ্চ রক্তচাপ, ডায়াবেটিস বা অন্য কোনো রোগ আছে?",
      hindi: "क्या आपको एनीमिया, हाई ब्लड प्रेशर, डायबिटीज या कोई अन्य बीमारी है?",
      kokborok: "Nini anaemia, high pressure, diabetes ba sakra rog tong?",
    },
    type: "yesno",
  },
  {
    id: 14,
    key: "medicines",
    translations: {
      english: "Are you taking any medicines, iron tablets, or supplements?",
      bengali: "আপনি কি কোনো ওষুধ, আয়রন ট্যাবলেট বা সাপ্লিমেন্ট নিচ্ছেন?",
      hindi: "क्या आप कोई दवा, आयरन की गोली या सप्लीमेंट ले रही हैं?",
      kokborok: "Nini medicine, iron tablet ba supplement khang?",
    },
    type: "yesno",
  },
  {
    id: 15,
    key: "otherConcern",
    translations: {
      english: "Is there any other health concern you want to tell us about?",
      bengali: "আপনার কি অন্য কোনো স্বাস্থ্য সমস্যা আছে যা আপনি জানাতে চান?",
      hindi: "क्या कोई अन्य स्वास्थ्य समस्या है जिसके बारे में आप बताना चाहती हैं?",
      kokborok: "Nini sakra health concern tong?",
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
      english: "Have you fainted, felt severely dizzy, or lost consciousness?",
      bengali: "আপনি কি অজ্ঞান হয়েছেন, খুব মাথা ঘুরেছে বা জ্ঞান হারিয়েছেন?",
      hindi: "क्या आप बेहोश हुए हैं, बहुत चक्कर आया है या होश खोया है?",
      kokborok: "Nini behosh ba khorok dizzy khang?",
    },
    type: "yesno",
  },
  {
    id: 9,
    key: "vomiting",
    translations: {
      english: "Are you vomiting repeatedly or unable to keep fluids down?",
      bengali: "আপনার কি বারবার বমি হচ্ছে বা পানি রাখতে পারছেন না?",
      hindi: "क्या आपको बार-बार उल्टी हो रही है या पानी भी नहीं रुक रहा?",
      kokborok: "Nini bar bar vomiting ba pani khangni khamokha tong?",
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
      english: "Have you ever had surgery or been admitted to a hospital?",
      bengali: "আপনার কি কখনও অস্ত্রোপচার হয়েছে বা হাসপাতালে ভর্তি হতে হয়েছে?",
      hindi: "क्या आपकी कभी सर्जरी हुई है या अस्पताल में भर्ती हुए हैं?",
      kokborok: "Nini surgery ba hospital admission khang?",
    },
    type: "yesno",
  },
  {
    id: 14,
    key: "appetiteSleepEnergy",
    translations: {
      english: "Have you noticed changes in your appetite, sleep, or energy?",
      bengali: "আপনার খাওয়া, ঘুম বা শক্তির মধ্যে কি কোনো পরিবর্তন হয়েছে?",
      hindi: "क्या आपकी भूख, नींद या ऊर्जा में कोई बदलाव आया है?",
      kokborok: "Nini appetite, sleep ba energy-ni change tong?",
    },
    type: "yesno",
  },
  {
    id: 15,
    key: "otherConcern",
    translations: {
      english: "Is there any other concern you want to tell us about?",
      bengali: "আপনার কি অন্য কোনো সমস্যা আছে যা আপনি জানাতে চান?",
      hindi: "क्या कोई अन्य समस्या है जिसके बारे में आप बताना चाहते हैं?",
      kokborok: "Nini sakra concern khulumni tong?",
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
    firstVisitQuestion: "Have you visited this health centre before?",
    firstVisitDescription: "This helps us know whether you have previous medical reports to attach.",
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
    firstVisitQuestion: "আপনি কি আগে এই স্বাস্থ্যকেন্দ্রে এসেছেন?",
    firstVisitDescription: "এর মাধ্যমে আমরা জানতে পারব আপনার আগের কোনো রিপোর্ট আছে কি না।",
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
    firstVisitQuestion: "क्या आप पहले इस स्वास्थ्य केंद्र में आए हैं?",
    firstVisitDescription: "इससे हमें पता चलेगा कि आपके पास पिछली मेडिकल रिपोर्ट है या नहीं।",
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
    firstVisitQuestion: "Nini agor somoi health centre-o khang?",
    firstVisitDescription: "Agor medical report tong na nai khangni help khang.",
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

function BodyPainSelector({ language, selectedParts, setSelectedParts, otherText, setOtherText }) {
  const text = languageText[language] || languageText.english;

  const togglePart = (partId) => {
    setSelectedParts((previous) =>
      previous.includes(partId) ? previous.filter((item) => item !== partId) : [...previous, partId]
    );
  };

  const activeClass = "bg-[#75b99c] border-[#0f5c45] shadow-[0_0_0_4px_rgba(47,143,105,0.14)] z-[4]";
  const baseClass = "absolute p-0 border-[2px] border-[#8eb4a4] bg-[#e8f5ef] cursor-pointer z-[3] transition-all duration-200 hover:bg-[#cce8db] hover:border-[#2f8f69] hover:scale-105";

  return (
    <div className="mt-[28px] p-[24px] rounded-[22px] bg-[#f5faf7] border border-[#d7e8df]">
      <style>{`
        @keyframes headPulse {
          0%, 100% { opacity: 1; transform: scale(1); box-shadow: 0 0 0 5px rgba(217,45,32,0.14); }
          50% { opacity: 0.25; transform: scale(1.35); box-shadow: 0 0 0 11px rgba(217,45,32,0.04); }
        }
        .animate-headPulse { animation: headPulse 0.9s infinite; }
      `}</style>
      
      <div className="mb-[22px]">
        <span className="inline-flex px-[11px] py-[6px] rounded-full bg-[#e8f5ef] text-[#0f5c45] text-[11px] font-extrabold uppercase tracking-[0.8px]">
          Adaptive question
        </span>
        <h3 className="m-[13px_0_5px] text-[24px] text-[#103f32]">{text.selectLocation}</h3>
        <p className="m-0 text-[#668075] text-[14px]">{text.selectMultiple}</p>
      </div>

      <div className="grid grid-cols-[minmax(280px,0.9fr)_minmax(280px,1.1fr)] gap-[26px] items-stretch max-[760px]:grid-cols-1">
        {/* BODY DIAGRAM */}
        <div className="min-h-[500px] flex flex-col items-center justify-center p-[25px] rounded-[22px] bg-white border border-[#d7e8df]">
          <div className="self-start mb-[14px] text-[13px] font-extrabold text-[#527065] uppercase tracking-[1px]">
            {text.body}
          </div>

          <div className="relative w-[245px] h-[410px] m-auto">
            {/* HEAD */}
            <button type="button" aria-label="Head" onClick={() => togglePart("head")} className={`${baseClass} w-[58px] h-[62px] left-[94px] top-[7px] rounded-full ${selectedParts.includes("head") ? activeClass : ""}`}>
              {selectedParts.includes("head") && <span className="absolute w-[15px] h-[15px] top-[18px] left-[20px] rounded-full bg-[#d92d20] shadow-[0_0_0_5px_rgba(217,45,32,0.14)] animate-headPulse" />}
            </button>

            {/* NECK */}
            <button type="button" aria-label="Neck" onClick={() => togglePart("neck")} className={`${baseClass} w-[34px] h-[28px] left-[106px] top-[61px] rounded-[8px] ${selectedParts.includes("neck") ? activeClass : ""}`} />

            {/* CHEST */}
            <button type="button" aria-label="Chest" onClick={() => togglePart("chest")} className={`${baseClass} w-[82px] h-[75px] left-[81px] top-[78px] rounded-[24px_24px_15px_15px] ${selectedParts.includes("chest") ? activeClass : ""}`} />

            {/* STOMACH */}
            <button type="button" aria-label="Stomach" onClick={() => togglePart("stomach")} className={`${baseClass} w-[78px] h-[78px] left-[83px] top-[145px] rounded-[13px_13px_24px_24px] ${selectedParts.includes("stomach") ? activeClass : ""}`} />

            {/* LEFT ARM */}
            <button type="button" aria-label="Left arm" onClick={() => togglePart("leftArm")} className={`${baseClass} w-[32px] h-[142px] left-[45px] top-[87px] rounded-[18px] rotate-[7deg] hover:rotate-[7deg] ${selectedParts.includes("leftArm") ? activeClass : ""}`} />

            {/* RIGHT ARM */}
            <button type="button" aria-label="Right arm" onClick={() => togglePart("rightArm")} className={`${baseClass} w-[32px] h-[142px] right-[45px] top-[87px] rounded-[18px] -rotate-[7deg] hover:-rotate-[7deg] ${selectedParts.includes("rightArm") ? activeClass : ""}`} />

            {/* LEFT HAND */}
            <button type="button" aria-label="Left hand" onClick={() => togglePart("leftHand")} className={`${baseClass} w-[35px] h-[43px] left-[36px] top-[218px] rounded-[15px] ${selectedParts.includes("leftHand") ? activeClass : ""}`} />

            {/* RIGHT HAND */}
            <button type="button" aria-label="Right hand" onClick={() => togglePart("rightHand")} className={`${baseClass} w-[35px] h-[43px] right-[36px] top-[218px] rounded-[15px] ${selectedParts.includes("rightHand") ? activeClass : ""}`} />

            {/* LEFT LEG */}
            <button type="button" aria-label="Left leg" onClick={() => togglePart("leftLeg")} className={`${baseClass} w-[42px] h-[157px] left-[78px] top-[218px] rounded-[13px_13px_20px_20px] ${selectedParts.includes("leftLeg") ? activeClass : ""}`} />

            {/* RIGHT LEG */}
            <button type="button" aria-label="Right leg" onClick={() => togglePart("rightLeg")} className={`${baseClass} w-[42px] h-[157px] right-[78px] top-[218px] rounded-[13px_13px_20px_20px] ${selectedParts.includes("rightLeg") ? activeClass : ""}`} />

            <div className="absolute w-[3px] h-[295px] left-[121px] top-[82px] bg-[rgba(47,143,105,0.25)] rounded-full z-[1] pointer-events-none" />
          </div>

          {selectedParts.includes("head") && (
            <div className="flex items-center gap-[8px] mt-[14px] p-[8px_12px] rounded-full bg-[#fff4f2] text-[#b42318] text-[12px] font-extrabold">
              <span className="w-[9px] h-[9px] rounded-full bg-[#d92d20] animate-headPulse" />
              Head selected
            </div>
          )}
        </div>

        {/* BODY LOCATION BUTTONS */}
        <div className="grid grid-cols-2 gap-[11px] content-center max-[450px]:grid-cols-1">
          {bodyParts.map((part) => (
            <button
              type="button"
              key={part.id}
              className={`min-h-[54px] flex items-center gap-[10px] p-[10px_13px] border-[1.5px] rounded-[14px] text-[14px] font-bold cursor-pointer text-left transition-all duration-200 hover:-translate-y-[2px] hover:border-[#2f8f69] ${selectedParts.includes(part.id) ? "bg-[#e8f5ef] border-[#2f8f69] text-[#0f5c45]" : "bg-white border-[#d7e8df] text-[#315c4d]"}`}
              onClick={() => togglePart(part.id)}
            >
              <span className="text-[#2f8f69] text-[10px]">●</span>
              <span>{part.label}</span>
              {selectedParts.includes(part.id) && <CheckCircle2 size={18} className="ml-auto" />}
            </button>
          ))}
        </div>
      </div>

      {selectedParts.includes("other") && (
        <div className="mt-[18px]">
          <label className="block mb-[8px] text-[14px] font-extrabold text-[#315c4d]">{text.otherLocation}</label>
          <input
            type="text"
            value={otherText}
            onChange={(event) => setOtherText(event.target.value)}
            placeholder={text.otherPlaceholder}
            className="w-full min-h-[54px] px-[15px] border-[1.5px] border-[#d7e8df] rounded-[13px] bg-white outline-none font-sans text-[15px] text-[#103f32] transition-colors focus:border-[#2f8f69]"
          />
        </div>
      )}

      {selectedParts.length > 0 && (
        <div className="mt-[18px] p-[14px_16px] rounded-[12px] bg-[#e8f5ef] text-[#13664d] text-[13px] leading-[1.6]">
          <strong>{text.selected}:</strong> {selectedParts.map((id) => bodyParts.find((part) => part.id === id)?.label || id).join(", ")}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   VISIT HISTORY
========================================================= */

function VisitHistoryQuestion({ language, visitHistory, setVisitHistory }) {
  const text = languageText[language] || languageText.english;

  return (
    <div className="flex flex-col items-center justify-center text-center p-[40px_20px] max-[760px]:p-[20px_0]">
      <div className="w-[84px] h-[84px] rounded-[24px] bg-[#e8f5ef] text-[#10704f] flex items-center justify-center mb-[28px]">
        <CheckCircle2 size={32} />
      </div>
      <h2 className="m-0 text-[#103f32] text-[clamp(24px,3.5vw,34px)] leading-[1.2] tracking-[-0.5px] mb-[12px]">{text.firstVisitQuestion}</h2>
      <p className="m-0 text-[#527065] text-[16px] max-w-[480px] mb-[45px]">{text.firstVisitDescription}</p>
      
      <div className="flex gap-[20px] w-full max-w-[650px] max-[600px]:flex-col">
        <button
          type="button"
          className={`flex-1 min-h-[105px] border-[2px] rounded-[22px] flex items-center justify-center gap-[16px] p-[20px] text-[18px] font-bold cursor-pointer transition-all hover:-translate-y-[3px] hover:shadow-[0_12px_30px_rgba(47,143,105,0.08)] ${visitHistory === "first-time" ? "bg-[#e8f5ef] border-[#2f8f69] text-[#0f5c45] shadow-[0_12px_30px_rgba(47,143,105,0.12)]" : "bg-white border-[#d7e8df] text-[#103f32] hover:border-[#2f8f69]"}`}
          onClick={() => setVisitHistory("first-time")}
        >
          <span className={`w-[26px] h-[26px] rounded-full border-[2px] flex items-center justify-center text-[14px] ${visitHistory === "first-time" ? "border-[#2f8f69] bg-[#2f8f69] text-white" : "border-[#b5cdc3]"}`}>
            {visitHistory === "first-time" ? "✓" : ""}
          </span>
          <span>{text.firstVisit}</span>
        </button>

        <button
          type="button"
          className={`flex-1 min-h-[105px] border-[2px] rounded-[22px] flex items-center justify-center gap-[16px] p-[20px] text-[18px] font-bold cursor-pointer transition-all hover:-translate-y-[3px] hover:shadow-[0_12px_30px_rgba(47,143,105,0.08)] ${visitHistory === "previous" ? "bg-[#e8f5ef] border-[#2f8f69] text-[#0f5c45] shadow-[0_12px_30px_rgba(47,143,105,0.12)]" : "bg-white border-[#d7e8df] text-[#103f32] hover:border-[#2f8f69]"}`}
          onClick={() => setVisitHistory("previous")}
        >
          <span className={`w-[26px] h-[26px] rounded-full border-[2px] flex items-center justify-center text-[14px] ${visitHistory === "previous" ? "border-[#2f8f69] bg-[#2f8f69] text-white" : "border-[#b5cdc3]"}`}>
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
  const navigate = useNavigate();
  const patientData = JSON.parse(localStorage.getItem("aarogyaVaaniCurrentPatient") || "{}");
  const consentData = JSON.parse(localStorage.getItem("aarogyaVaaniConsent") || "{}");
  const patientType = patientData.patientType || "maternal";
  const language = consentData.language || "english";

  const questions = useMemo(() => patientType === "general" ? generalQuestions : maternalQuestions, [patientType]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selectedBodyParts, setSelectedBodyParts] = useState([]);
  const [otherBodyLocation, setOtherBodyLocation] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState("");
  const [showVisitHistory, setShowVisitHistory] = useState(false);
  const [visitHistory, setVisitHistory] = useState("");

  const currentQuestion = questions[currentIndex];
  const text = languageText[language] || languageText.english;

  useEffect(() => {
    const savedInterview = JSON.parse(localStorage.getItem("aarogyaVaaniInterview") || "{}");
    if (savedInterview.answers) setAnswers(savedInterview.answers);
    if (savedInterview.bodyPain?.locations) setSelectedBodyParts(savedInterview.bodyPain.locations);
    if (savedInterview.bodyPain?.otherLocation) setOtherBodyLocation(savedInterview.bodyPain.otherLocation);
    if (savedInterview.visitHistory) setVisitHistory(savedInterview.visitHistory);
  }, []);

  const setAnswer = (value) => {
    setAnswers((previous) => ({ ...previous, [currentQuestion.key]: value }));
  };

  const getDangerSigns = () => {
    const detectedDangerSigns = [];
    if (patientType === "maternal") {
      if (answers.bleeding === "Yes") detectedDangerSigns.push("Vaginal bleeding");
      if (answers.abdominalPain === "Yes") detectedDangerSigns.push("Severe abdominal pain");
      if (answers.headacheVision === "Yes") detectedDangerSigns.push("Severe headache or blurred vision");
      if (answers.fever === "Yes") detectedDangerSigns.push("Fever / feeling very unwell");
      if (answers.babyMovement === "No") detectedDangerSigns.push("Reduced or absent baby movement");
    }
    if (patientType === "general") {
      if (answers.breathing === "Yes") detectedDangerSigns.push("Difficulty breathing");
      if (answers.fainting === "Yes") detectedDangerSigns.push("Fainting / severe dizziness / loss of consciousness");
    }
    return detectedDangerSigns;
  };

  const saveInterviewProgress = (completed = false) => {
    const detectedDangerSigns = getDangerSigns();
    localStorage.setItem(
      "aarogyaVaaniInterview",
      JSON.stringify({
        patientType,
        language,
        languageName: consentData.languageName || "English",
        answers,
        bodyPain: { hasPain: answers.pain === "Yes", locations: selectedBodyParts, otherLocation: otherBodyLocation },
        visitHistory,
        dangerSigns: detectedDangerSigns,
        completed,
        completedAt: completed ? new Date().toISOString() : null,
      })
    );
  };

  const finishInterview = () => {
    if (!visitHistory) {
      alert(text.firstVisitQuestion);
      return;
    }
    saveInterviewProgress(true);
    if (visitHistory === "previous") {
      navigate("/reports");
    } else {
      navigate("/danger-check");
    }
  };

  const moveForward = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((previous) => previous + 1);
      setVoiceError("");
      return;
    }
    setShowVisitHistory(true);
    setVoiceError("");
    saveInterviewProgress(false);
  };

  const nextQuestion = () => {
    if (currentQuestion.adaptive === "bodyPain") {
      const painAnswer = answers[currentQuestion.key];
      if (painAnswer === "No") {
        if (currentIndex < questions.length - 1) setCurrentIndex(currentIndex + 2);
        setVoiceError("");
        return;
      }
      if (painAnswer === "Yes") {
        if (selectedBodyParts.length === 0) {
          alert(text.selectLocation);
          return;
        }
        if (selectedBodyParts.includes("other") && !otherBodyLocation.trim()) {
          alert(text.otherLocation);
          return;
        }
        moveForward();
        return;
      }
      alert(`${currentQuestion.translations[language] || currentQuestion.translations.english}`);
      return;
    }
    moveForward();
  };

  const previousQuestion = () => {
    if (showVisitHistory) {
      setShowVisitHistory(false);
      return;
    }
    if (patientType === "general" && currentQuestion.key === "painSeverity") {
      setCurrentIndex(currentIndex - 1);
      setVoiceError("");
      return;
    }
    if (patientType === "general" && currentQuestion.key === "fever" && answers.pain === "No") {
      setCurrentIndex(currentIndex - 2);
      setVoiceError("");
      return;
    }
    if (currentIndex > 0) {
      setCurrentIndex((previous) => previous - 1);
      setVoiceError("");
      return;
    }
    navigate("/consent");
  };

  const startVoiceInput = () => {
    setVoiceError("");
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceError("Voice input is not supported by this browser. Please use Chrome or another supported browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = consentData.speechCode || "en-IN";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const spokenText = event.results[0][0].transcript;
      if (currentQuestion.type === "yesno") {
        const lower = spokenText.toLowerCase();
        if (lower.includes("yes") || lower.includes("হ্যাঁ") || lower.includes("হা") || lower.includes("हाँ") || lower.includes("ih")) {
          setAnswer("Yes");
        } else if (lower.includes("no") || lower.includes("না") || lower.includes("नहीं") || lower.includes("nahi") || lower.includes("ihi")) {
          setAnswer("No");
        } else {
          setAnswer(spokenText);
        }
      } else {
        setAnswer(spokenText);
      }
    };
    recognition.onerror = () => {
      setVoiceError("We could not understand the voice input. Please try again.");
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  return (
    <div className="min-h-screen w-full bg-[linear-gradient(rgba(232,245,239,0.94),rgba(245,250,247,0.97)),url('https://upload.wikimedia.org/wikipedia/commons/3/36/Tripura_in_India.svg')] bg-cover bg-center bg-fixed text-[#103f32] pb-[40px] font-sans">
      {/* HEADER */}
      <header className="min-h-[82px] px-[5%] bg-[rgba(16,63,50,0.98)] flex items-center justify-between text-white shadow-[0_4px_20px_rgba(16,63,50,0.15)]">
        <div>
          <div className="font-extrabold text-[26px] tracking-[-0.5px]">AarogyaVaani</div>
          <div className="mt-[2px] text-[12px] tracking-[1.5px] opacity-75 uppercase">Tripura Health</div>
        </div>
        <div className="px-[16px] py-[9px] rounded-full bg-white/10 border border-white/20 text-[14px] font-bold">
          {consentData.languageName || "English"}
        </div>
      </header>

      {/* MAIN */}
      <main className="w-[min(1050px,92%)] mx-auto mt-[34px]">
        <div className="flex items-center justify-between gap-[20px] mb-[14px]">
          <button type="button" className="inline-flex items-center gap-[8px] bg-transparent border-0 text-[#0f5c45] font-bold text-[15px] cursor-pointer hover:opacity-75" onClick={previousQuestion}>
            <ArrowLeft size={18} />
            {text.back}
          </button>
          <div className="text-[14px] font-bold text-[#527065]">
            {showVisitHistory ? text.firstStep : `${text.question} ${currentIndex + 1} of ${questions.length}`}
          </div>
        </div>

        {/* PROGRESS */}
        <div className="h-[8px] w-full bg-[#d7e8df] rounded-full overflow-hidden mb-[22px]">
          <div className="h-full bg-[#2f8f69] rounded-full transition-all duration-300" style={{ width: showVisitHistory ? "100%" : `${((currentIndex + 1) / questions.length) * 100}%` }} />
        </div>

        {/* QUESTION CARD */}
        <section className="w-full bg-white/95 border border-[#d7e8df] rounded-[28px] p-[44px] shadow-[0_24px_60px_rgba(16,63,50,0.12)] backdrop-blur-md max-[760px]:p-[25px]">
          {!showVisitHistory ? (
            <>
              <div className="w-[54px] h-[54px] flex items-center justify-center rounded-[16px] bg-[#e8f5ef] text-[#0f5c45] text-[18px] font-extrabold mb-[22px]">
                {String(currentIndex + 1).padStart(2, "0")}
              </div>

              <h1 className="max-w-[850px] m-0 text-[#103f32] text-[clamp(28px,4vw,43px)] leading-[1.18] tracking-[-1px]">
                {currentQuestion.translations[language] || currentQuestion.translations.english}
              </h1>

              {/* TEXT INPUT */}
              {currentQuestion.type === "text" && (
                <div className="mt-[34px]">
                  <input
                    type="text"
                    value={answers[currentQuestion.key] || ""}
                    onChange={(event) => setAnswer(event.target.value)}
                    placeholder={currentQuestion.placeholder?.[language] || currentQuestion.placeholder?.english}
                    className="w-full min-h-[62px] px-[20px] border-[2px] border-[#d7e8df] rounded-[16px] outline-none text-[18px] text-[#103f32] bg-[#f8fcfa] transition-all duration-200 focus:border-[#2f8f69] focus:shadow-[0_0_0_4px_rgba(47,143,105,0.12)] placeholder:text-[#8ca49a]"
                  />
                </div>
              )}

              {/* YES / NO */}
              {currentQuestion.type === "yesno" && (
                <div className="grid grid-cols-2 gap-[18px] mt-[34px] max-[500px]:grid-cols-1">
                  <button type="button" className={`min-h-[82px] rounded-[18px] border-[2px] text-[21px] font-extrabold cursor-pointer transition-all duration-200 hover:-translate-y-[2px] hover:border-[#2f8f69] ${answers[currentQuestion.key] === "Yes" ? "bg-[#e8f5ef] border-[#2f8f69] shadow-[0_8px_22px_rgba(47,143,105,0.13)] text-[#103f32]" : "bg-[#f8fcfa] border-[#d7e8df] text-[#103f32]"}`} onClick={() => setAnswer("Yes")}>
                    {text.yes}
                  </button>
                  <button type="button" className={`min-h-[82px] rounded-[18px] border-[2px] text-[21px] font-extrabold cursor-pointer transition-all duration-200 hover:-translate-y-[2px] hover:border-[#2f8f69] ${answers[currentQuestion.key] === "No" ? "bg-[#e8f5ef] border-[#2f8f69] shadow-[0_8px_22px_rgba(47,143,105,0.13)] text-[#103f32]" : "bg-[#f8fcfa] border-[#d7e8df] text-[#103f32]"}`} onClick={() => setAnswer("No")}>
                    {text.no}
                  </button>
                </div>
              )}

              {/* CHOICE */}
              {currentQuestion.type === "choice" && (
                <div className="grid grid-cols-3 gap-[16px] mt-[34px] max-[760px]:grid-cols-1">
                  {currentQuestion.options[language].map((option, index) => (
                    <button type="button" key={option} className={`min-h-[72px] rounded-[16px] border-[2px] text-[17px] font-bold cursor-pointer transition-all duration-200 hover:-translate-y-[2px] hover:border-[#2f8f69] ${answers[currentQuestion.key] === currentQuestion.options.english[index] ? "bg-[#e8f5ef] border-[#2f8f69] text-[#103f32]" : "bg-[#f8fcfa] border-[#d7e8df] text-[#103f32]"}`} onClick={() => setAnswer(currentQuestion.options.english[index])}>
                      {option}
                    </button>
                  ))}
                </div>
              )}

              {/* BODY PAIN ADAPTIVE FLOW */}
              {currentQuestion.adaptive === "bodyPain" && answers[currentQuestion.key] === "Yes" && (
                <BodyPainSelector language={language} selectedParts={selectedBodyParts} setSelectedParts={setSelectedBodyParts} otherText={otherBodyLocation} setOtherText={setOtherBodyLocation} />
              )}

              {/* VOICE */}
              <div className="mt-[44px] flex flex-col items-center">
                <button type="button" className={`w-full max-w-[340px] min-h-[72px] border-0 rounded-[999px] flex items-center justify-center gap-[12px] text-[18px] font-extrabold cursor-pointer transition-all duration-200 ${isListening ? "bg-[#e85f5f] text-white shadow-[0_0_0_8px_rgba(232,95,95,0.2)]" : "bg-[rgba(16,63,50,0.92)] text-white hover:-translate-y-[3px] hover:shadow-[0_12px_24px_rgba(16,63,50,0.2)]"}`} onClick={isListening ? undefined : startVoiceInput}>
                  {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                  {isListening ? text.listening : text.speak}
                </button>
                {voiceError && <p className="mt-[16px] text-center text-[#d92d20] font-bold text-[14px] bg-[#fff4f2] p-[10px_16px] rounded-[12px]">{voiceError}</p>}
              </div>

              {/* NAVIGATION */}
              <div className="flex items-center justify-between mt-[55px] pt-[28px] border-t border-[#d7e8df] gap-[15px] max-[500px]:flex-col">
                <button type="button" className="min-h-[56px] px-[32px] rounded-[14px] border border-[#d7e8df] bg-white text-[#315c4d] font-bold text-[16px] flex items-center gap-[10px] cursor-pointer transition-all duration-200 hover:bg-[#f3f9f6] max-[500px]:w-full max-[500px]:justify-center" onClick={previousQuestion}>
                  <ArrowLeft size={18} />
                  {text.back}
                </button>
                <button type="button" className="min-h-[56px] px-[36px] rounded-[14px] border-0 bg-[#159b80] text-white font-extrabold text-[16px] flex items-center gap-[10px] cursor-pointer shadow-[0_8px_20px_rgba(21,155,128,0.25)] transition-all duration-200 hover:bg-[#11846c] hover:-translate-y-[2px] max-[500px]:w-full max-[500px]:justify-center" onClick={nextQuestion}>
                  {text.next}
                  <ArrowRight size={18} />
                </button>
              </div>
            </>
          ) : (
            <>
              <VisitHistoryQuestion language={language} visitHistory={visitHistory} setVisitHistory={setVisitHistory} />

              <div className="flex items-center justify-between mt-[55px] pt-[28px] border-t border-[#d7e8df] gap-[15px] max-[500px]:flex-col">
                <button type="button" className="min-h-[56px] px-[32px] rounded-[14px] border border-[#d7e8df] bg-white text-[#315c4d] font-bold text-[16px] flex items-center gap-[10px] cursor-pointer transition-all duration-200 hover:bg-[#f3f9f6] max-[500px]:w-full max-[500px]:justify-center" onClick={previousQuestion}>
                  <ArrowLeft size={18} />
                  {text.back}
                </button>
                <button type="button" className="min-h-[56px] px-[36px] rounded-[14px] border-0 bg-[#159b80] text-white font-extrabold text-[16px] flex items-center gap-[10px] cursor-pointer shadow-[0_8px_20px_rgba(21,155,128,0.25)] transition-all duration-200 hover:bg-[#11846c] hover:-translate-y-[2px] max-[500px]:w-full max-[500px]:justify-center" onClick={finishInterview}>
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
