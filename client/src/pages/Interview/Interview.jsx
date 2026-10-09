import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  User,
  Heart,
  Stethoscope,
  Send,
  RefreshCw,
} from "lucide-react";
import GovHeader from "../../components/GovHeader";
import BottomNav from "../../components/BottomNav";
import { useLanguage } from "../../context/LanguageContext";
import { savePatient, generatePatientId } from "../../utils/patientStore";

// Question bank generator based on chief complaints & patient condition (Doctor-style diagnostic trees)
function generateDoctorAssessment(complaintText, isMaternal, patientCondition, patientGender) {
  const text = (complaintText || "").toLowerCase();
  const isFemale = patientGender === "Female";

  // Dedicated Geriatric / Elderly Patient Assessment Tree
  if (
    patientCondition === "elderly_frail" ||
    text.includes("elderly") ||
    text.includes("old") ||
    text.includes("bedridden") ||
    text.includes("shiver") ||
    text.includes("rigor") ||
    text.includes("frail")
  ) {
    return [
      {
        id: "q1",
        question: `For how many days has the elderly patient (${isFemale ? "old woman" : "old man"}) had fever, chills, or extreme weakness?`,
        bengali: `প্রবীণ রোগীর (${isFemale ? "বৃদ্ধা মহিলার" : "বৃদ্ধ পুরুষের"}) কতদিন ধরে জ্বর, কাঁপুনি বা তীব্র দুর্বলতা হচ্ছে?`,
        hindi: `बुजुर्ग मरीज (${isFemale ? "वृद्ध महिला" : "वृद्ध पुरुष"}) को कितने दिनों से बुखार, कंपकंपी या कमजोरी है?`,
        options: ["1-2 days (Recent onset)", "3-5 days (High fever with shivering)", "Over a week (Bedridden)", "Chronic recurring fever"],
      },
      {
        id: "q2",
        question: "Is the patient able to stand or walk, or having chest heaviness or gasping?",
        bengali: "রোগী কি একা দাঁড়াতে বা হাঁটতে পারছেন, নাকি বুকে চাপ ও শ্বাসকষ্ট হচ্ছে?",
        hindi: "क्या मरीज खड़े होने या चलने में असमर्थ हैं, या सीने में भारीपन व सांस लेने में तकलीफ है?",
        options: ["Completely bedridden (Cannot stand)", "Unable to walk without support", "Chest heaviness / breathlessness", "Can walk slowly with help"],
      },
      {
        id: "q3",
        question: "Is the elderly patient disoriented, unusually drowsy, or having slurred speech?",
        bengali: "রোগী কি বিভ্রান্ত/অসংলগ্ন কথা বলছেন, নিস্তেজ হয়ে পড়ে আছেন বা কথা জড়িয়ে যাচ্ছে?",
        hindi: "क्या मरीज भ्रमित (confused) हैं, बहुत सुस्त हैं या आवाज लड़खड़ा रही है?",
        options: ["Disoriented / confused", "Severe drowsiness & weakness", "Slurred speech", "Alert & conscious"],
      },
      {
        id: "q4",
        question: "Is the patient taking water and food, or unable to swallow fluids?",
        bengali: "রোগী কি জল বা খাবার খেতে পারছেন নাকি বমি হয়ে যাচ্ছে?",
        hindi: "क्या मरीज पानी और तरल पदार्थ ले पा रहे हैं या खाना-पीना छोड़ दिया है?",
        options: ["Unable to eat or drink (Refusing)", "Taking small sips of water only", "Frequent vomiting", "Normal intake"],
      },
    ];
  }

  // Maternal & Preeclampsia / Headache Tree
  if (text.includes("head") || text.includes("dizz") || text.includes("eye") || text.includes("blur") || text.includes("matha") || text.includes("sir")) {
    return [
      {
        id: "q1",
        question: "When did this headache start, and is it severe or mild?",
        bengali: "মাথাব্যথাটি কখন থেকে শুরু হয়েছে এবং এটি কি খুব তীব্র নাকি হালকা?",
        hindi: "यह सिरदर्द कब से शुरू हुआ है, और क्या यह बहुत तेज है या हल्का?",
        options: ["Started today (Severe)", "Since 2-3 days", "Mild on & off", "Very Severe / Unbearable"],
      },
      {
        id: "q2",
        question: "Are you having any blurred vision, dark spots, or dizziness?",
        bengali: "আপনার কি চোখে ঝাপসা দেখা, অন্ধকার লাগা বা মাথা ঘোরার সমস্যা হচ্ছে?",
        hindi: "क्या आपको धुंधला दिखाई दे रहा है, चक्कर आ रहे हैं या आंखों के आगे अंधेरा छा रहा है?",
        options: ["Yes, blurry vision", "Only dizziness", "No visual issues", "Severe blackout"],
      },
      {
        id: "q3",
        question: "Have you noticed sudden swelling in your feet, hands, or face?",
        bengali: "আপনার হাত, পা বা মুখে কি হঠাৎ কোনো ফোলাভাব লক্ষ্য করেছেন?",
        hindi: "क्या आपके पैरों, हाथों या चेहरे पर अचानक कोई सूजन आई है?",
        options: ["Yes, feet swollen", "Swelling on face & hands", "No swelling", "Mild ankle puffiness"],
      },
      ...(isMaternal
        ? [
            {
              id: "q4",
              question: "Are you feeling the baby's movements regularly today?",
              bengali: "আজকে গর্ভস্থ বাচ্চার নড়াচড়া কি স্বাভাবিকভাবে টের পাচ্ছেন?",
              hindi: "क्या आज आपको बच्चे की हलचल सामान्य रूप से महसूस हो रही है?",
              options: ["Yes, normal & active", "Reduced movements", "No movement today", "Not sure"],
            },
          ]
        : [
            {
              id: "q4",
              question: "Have you had your blood pressure checked, or taken any medicine?",
              bengali: "আপনার রক্তচাপ (BP) কি মাপা হয়েছে বা কোনো ওষুধ খেয়েছেন?",
              hindi: "क्या आपका ब्लड प्रेशर नापा गया है या आपने कोई दवा ली है?",
              options: ["High BP reported", "Normal BP", "Took Paracetamol", "Not checked yet"],
            },
          ]),
    ];
  }

  // Bleeding / Obstetric Danger Tree
  if (text.includes("bleed") || text.includes("blood") || text.includes("spot") || text.includes("rokto") || text.includes("khoon")) {
    return [
      {
        id: "q1",
        question: "How heavy is the bleeding or spotting, and when did it begin?",
        bengali: "রক্তপাত কতটা বেশি এবং এটি কখন থেকে শুরু হয়েছে?",
        hindi: "रक्तस्राव कितना अधिक है और यह कब से शुरू हुआ है?",
        options: ["Fresh red bleeding (Heavy)", "Light spotting", "Brown discharge", "Continuous flow"],
      },
      {
        id: "q2",
        question: "Are you having severe abdominal cramps or back pain with it?",
        bengali: "এর সাথে কি তীব্র পেটে মোচড় বা কোমরে ব্যথা হচ্ছে?",
        hindi: "क्या इसके साथ पेट में तेज मरोड़ या कमर में दर्द हो रहा है?",
        options: ["Severe cramping pain", "Mild ache", "No pain", "Pain in lower back"],
      },
      {
        id: "q3",
        question: "Are you feeling faint, unusually cold, or dizzy?",
        bengali: "আপনার কি মাথা ঘোরা, অজ্ঞান হয়ে যাওয়া বা শরীর ঠান্ডা লাগার অনুভূতি হচ্ছে?",
        hindi: "क्या आपको चक्कर, बेहोशी या कमजोरी महसूस हो रही है?",
        options: ["Yes, very dizzy & weak", "Mild weakness", "No fainting feeling", "Cold sweats"],
      },
      {
        id: "q4",
        question: "Did this happen after heavy lifting, travel, or suddenly?",
        bengali: "এটি কি ভারী কোনো কাজ, যাতায়াত নাকি হঠাৎ করেই হয়েছে?",
        hindi: "क्या यह कोई भारी काम करने, सफर करने के बाद हुआ या अचानक?",
        options: ["Sudden onset while resting", "After travel / walking", "After lifting weight", "Gradual increase"],
      },
    ];
  }

  // Abdominal Pain / Contractions Tree
  if (text.includes("pain") || text.includes("stomach") || text.includes("cramp") || text.includes("pet") || text.includes("betha") || text.includes("groan") || text.includes("labor")) {
    return [
      {
        id: "q1",
        question: "Where exactly is the pain located (upper, lower, or all over)?",
        bengali: "ব্যথাটি ঠিক পেটের কোন অংশে হচ্ছে (উপরের পেট, তলপেট নাকি পুরো পেট)?",
        hindi: "दर्द पेट के किस हिस्से में है (ऊपर, निचले हिस्से में या पूरे पेट में)?",
        options: ["Lower abdomen (cramps)", "Upper right under ribs", "Entire stomach", "Radiating to back"],
      },
      {
        id: "q2",
        question: "Is the pain coming in continuous waves, or constant sharp pain?",
        bengali: "ব্যথাটি কি মোচড় দিয়ে ঢেউয়ের মতো আসছে নাকি একটানা তীব্র ব্যথা?",
        hindi: "क्या दर्द मरोड़ की तरह रुक-रुक कर आ रहा है या लगातार तेज बना हुआ है?",
        options: ["Continuous severe pain", "Comes in waves (like cramps)", "Mild dull ache", "Sharp stabbing pain"],
      },
      {
        id: "q3",
        question: "Do you have any vomiting, fever, or burning while urinating?",
        bengali: "আপনার কি বমি, জ্বর বা প্রস্রাবে জ্বালাপোড়ার সমস্যা আছে?",
        hindi: "क्या आपको उल्टी, बुखार या पेशाब में जलन की समस्या है?",
        options: ["Yes, vomiting & nausea", "Burning urination", "Mild fever", "No other symptoms"],
      },
      ...(isMaternal
        ? [
            {
              id: "q4",
              question: "Are you feeling the baby move, and is there any watery discharge?",
              bengali: "বাচ্চার নড়াচড়া কি ঠিক আছে এবং কোনো জল বা তরল ভাঙছে কি?",
              hindi: "क्या बच्चे की हलचल ठीक है और क्या कोई पानी जैसा स्राव हो रहा है?",
              options: ["Baby moving normally", "Baby movements reduced", "Watery fluid leakage", "No leakage, normal"],
            },
          ]
        : [
            {
              id: "q4",
              question: "When did you last pass stool or eat a normal meal?",
              bengali: "শেষ কবে স্বাভাবিকভাবে খাবার খেয়েছেন বা শৌচ করেছেন?",
              hindi: "आपने आखिरी बार सामान्य खाना कब खाया था या शौच हुआ था?",
              options: ["Loose motions / diarrhea", "Constipation since 3 days", "Unable to eat food", "Normal digestion"],
            },
          ]),
    ];
  }

  // Default / General Fever & Illness Tree
  return [
    {
      id: "q1",
      question: "For how many days have you been feeling unwell or having fever?",
      bengali: "কতদিন ধরে আপনার এই অসুস্থতা বা জ্বর হচ্ছে?",
      hindi: "आप कितने दिनों से अस्वस्थ हैं या आपको बुखार आ रहा है?",
      options: ["1-2 days (Recent onset)", "3-5 days", "More than a week", "Over 2 weeks"],
    },
    {
      id: "q2",
      question: "Do you have shivering, chills, severe body ache, or bitter taste?",
      bengali: "আপনার কি কাঁপুনি দিয়ে জ্বর, তীব্র গায়ে ব্যথা বা মুখের স্বাদ তেতো লাগছে?",
      hindi: "क्या आपको कंपकंपी के साथ बुखार, तेज बदन दर्द या मुंह में कड़वाहट है?",
      options: ["Yes, high fever with chills", "Severe body & joint aches", "Bitter taste & weakness", "Mild fever only"],
    },
    {
      id: "q3",
      question: "Are you able to drink water and eat, or are you throwing up?",
      bengali: "আপনি কি জল ও খাবার খেতে পারছেন নাকি বমি হয়ে যাচ্ছে?",
      hindi: "क्या आप पानी और खाना ले पा रहे हैं या उल्टी हो रही है?",
      options: ["Able to drink fluids", "Frequent vomiting", "Extreme fatigue & nausea", "Normal appetite"],
    },
    {
      id: "q4",
      question: "Any chest tightness, cough, or difficulty breathing while resting?",
      bengali: "বুকে চাপ, কাশি বা বিশ্রাম নেওয়ার সময় শ্বাসকষ্ট হচ্ছে কি?",
      hindi: "क्या सीने में जकड़न, खांसी या सांस लेने में कोई तकलीफ हो रही है?",
      options: ["No breathing issues", "Dry cough present", "Shortness of breath", "Chest heaviness"],
    },
  ];
}

export default function Interview() {
  const navigate = useNavigate();
  const { language } = useLanguage();

  // Retrieve current active patient
  const storedRecord = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("aarogyaVaaniCurrentPatient") || "{}");
    } catch {
      return {};
    }
  }, []);

  const patient = storedRecord.patient || {
    name: "Mamta Debbarma",
    age: "27",
    gender: "Female",
    village: "Bishramganj, Sepahijala",
    phone: "9862100000",
    id: storedRecord.id || "AV-8921",
  };

  const patientId = storedRecord.id || patient.id || "AV-8921";
  const isMaternal = storedRecord.patientType !== "general";
  const assistedMode = storedRecord.assistedMode ?? true;
  const patientCondition = storedRecord.patientCondition || (isMaternal ? "pregnant_distress" : "elderly_frail");
  const assistedBy = storedRecord.assistedBy || "Kalpana Reang (ASHA Worker)";
  const assistedReason = storedRecord.assistedReason || (
    patientCondition === "pregnant_distress"
      ? "Pregnant mother in distress / pain (ASHA assisted intake)"
      : patientCondition === "elderly_frail"
      ? `Elderly patient (${patient.gender === "Female" ? "Old woman" : "Old man"} unable to operate phone)`
      : "Assisted intake for patient unable to use device"
  );

  // Flow States: 1: 'chief_complaint', 2: 'assessment', 3: 'generating'
  const [stage, setStage] = useState("chief_complaint");
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [speechError, setSpeechError] = useState("");
  const [activeChipTab, setActiveChipTab] = useState(
    patientCondition === "pregnant_distress" ? "maternal" : "elderly"
  );

  // Assessment flow
  const [assessmentQuestions, setAssessmentQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [currentAnswerText, setCurrentAnswerText] = useState("");

  const recognitionRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      setSpeechSupported(true);
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = language === "bn" ? "bn-IN" : language === "hi" ? "hi-IN" : "en-IN";

      rec.onstart = () => {
        setIsListening(true);
        setSpeechError("");
      };

      rec.onresult = (e) => {
        const transcript = Array.from(e.results)
          .map((r) => r[0].transcript)
          .join("");

        if (stage === "chief_complaint") {
          setChiefComplaint(transcript);
        } else {
          setCurrentAnswerText(transcript);
        }
      };

      rec.onerror = (e) => {
        console.warn("Speech recognition error:", e);
        setIsListening(false);
        setSpeechError("Microphone input ended. You can also type or choose options below.");
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, [language, stage]);

  // Text to speech helper
  const speakText = (text) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === "bn" ? "bn-IN" : language === "hi" ? "hi-IN" : "en-IN";
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  // Speak welcome prompt on mount tailored for ASHA worker or direct patient
  useEffect(() => {
    let welcome = "";
    if (assistedMode) {
      if (patientCondition === "pregnant_distress") {
        welcome =
          language === "bn"
            ? `নমস্কার আশা দিদি! মা কি বেশি কষ্টে আছেন? আপনি ওনার শারীরিক কষ্ট বা লক্ষণগুলি বলুন বা নিচের পর্যবেক্ষণ বোতাম বেছে নিন।`
            : language === "hi"
            ? `नमस्ते आशा दीदी! क्या गर्भवती माता अत्यधिक कष्ट में हैं? कृपया उनके लक्षण बोलकर बताएं या नीचे दिए गए बटन चुनें।`
            : `Namaste ASHA Didi! As the pregnant mother is in acute distress and unable to use the device, please speak her observed symptoms or select from the options below.`;
      } else if (patientCondition === "elderly_frail") {
        const elderlyTitleBn = patient.gender === "Female" ? "বৃদ্ধা মহিলার" : "বৃদ্ধ পুরুষের";
        const elderlyTitleHi = patient.gender === "Female" ? "वृद्ध महिला" : "वृद्ध पुरुष";
        const elderlyTitleEn = patient.gender === "Female" ? "elderly woman" : "elderly man";
        welcome =
          language === "bn"
            ? `নমস্কার আশা দিদি! প্রবীণ ${elderlyTitleBn} শারীরিক অবস্থা কেমন? ওনার লক্ষণগুলো আমাকে বলুন বা নিচের বোতামগুলো বেছে নিন।`
            : language === "hi"
            ? `नमस्ते आशा दीदी! ${elderlyTitleHi} की स्थिति कैसी है? कृपया उनके लक्षण बोलकर या चुनकर दर्ज करें।`
            : `Namaste ASHA Didi! As the ${elderlyTitleEn} cannot operate the mobile phone, please observe and speak their symptoms or select the options below.`;
      } else {
        welcome =
          language === "bn"
            ? `নমস্কার আশা দিদি! রোগীর পর্যবেক্ষণ করা লক্ষণগুলো আমাকে বলুন বা বোতাম বেছে নিন।`
            : language === "hi"
            ? `नमस्ते आशा दीदी! मरीज के लक्षण बोलकर या नीचे से चुनकर दर्ज करें।`
            : `Namaste ASHA Didi! Please record the patient's observed symptoms on their behalf.`;
      }
    } else {
      welcome =
        language === "bn"
          ? `নমস্কার ${patient.name}। সহজ ভাষায় আমাকে বলুন, আজকে আপনার কি সমস্যা বা কষ্ট হচ্ছে?`
          : language === "hi"
          ? `नमस्ते ${patient.name}। कृपया सरल शब्दों में बताएं कि आज आपको क्या शारीरिक परेशानी हो रही है?`
          : `Namaste ${patient.name}. Please tell me in your own words, what health issues or symptoms are you facing today?`;
    }

    const timer = setTimeout(() => speakText(welcome), 450);
    return () => {
      clearTimeout(timer);
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, [patient.name, language, assistedMode, patientCondition]);

  // Toggle voice listening
  const toggleListening = () => {
    if (!speechSupported || !recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Please type your message.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.lang =
          language === "bn" ? "bn-IN" : language === "hi" ? "hi-IN" : "en-IN";
        recognitionRef.current.start();
      } catch (err) {
        console.warn(err);
      }
    }
  };

  // Start Assessment once Chief Complaint is provided
  const handleStartAssessment = () => {
    if (!chiefComplaint.trim()) {
      alert("Please tell or type the patient's symptoms first.");
      return;
    }

    const generated = generateDoctorAssessment(
      chiefComplaint,
      isMaternal,
      patientCondition,
      patient.gender
    );
    setAssessmentQuestions(generated);
    setCurrentQIndex(0);
    setStage("assessment");

    // Speak first question
    const firstQ =
      language === "bn"
        ? generated[0].bengali
        : language === "hi"
        ? generated[0].hindi
        : generated[0].question;
    speakText(
      assistedMode
        ? language === "bn"
          ? `আশা দিদি, রোগীকে জিজ্ঞাসা করুন: ${firstQ}`
          : `ASHA Didi, please ask: ${firstQ}`
        : firstQ
    );
  };

  // Answer selection or next question
  const handleSelectOption = (opt) => {
    const currentQ = assessmentQuestions[currentQIndex];
    const newAnswers = { ...answers, [currentQ.id]: opt };
    setAnswers(newAnswers);
    setCurrentAnswerText(opt);

    // Auto advance after slight delay
    setTimeout(() => {
      advanceQuestion(newAnswers);
    }, 300);
  };

  const handleNextWithCurrentText = () => {
    const currentQ = assessmentQuestions[currentQIndex];
    const answerVal = currentAnswerText.trim() || answers[currentQ.id] || "No specific details";
    const newAnswers = { ...answers, [currentQ.id]: answerVal };
    setAnswers(newAnswers);
    advanceQuestion(newAnswers);
  };

  const advanceQuestion = (updatedAnswers) => {
    if (currentQIndex < assessmentQuestions.length - 1) {
      const nextIdx = currentQIndex + 1;
      setCurrentQIndex(nextIdx);
      const nextQ = assessmentQuestions[nextIdx];
      setCurrentAnswerText(updatedAnswers[nextQ.id] || "");

      const qText =
        language === "bn"
          ? nextQ.bengali
          : language === "hi"
          ? nextQ.hindi
          : nextQ.question;
      speakText(
        assistedMode
          ? language === "bn"
            ? `পরবর্তী প্রশ্ন: ${qText}`
            : `Next question for ASHA Didi: ${qText}`
          : qText
      );
    } else {
      // Completed all questions -> Generate summary
      finishAndSaveSummary(updatedAnswers);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQIndex > 0) {
      const prevIdx = currentQIndex - 1;
      setCurrentQIndex(prevIdx);
      const prevQ = assessmentQuestions[prevIdx];
      setCurrentAnswerText(answers[prevQ.id] || "");
    } else {
      setStage("chief_complaint");
    }
  };

  // Compile clinical summary & save into patient database
  const finishAndSaveSummary = (finalAnswers) => {
    setStage("generating");

    // Determine danger flags
    const answersText = Object.values(finalAnswers).join(" ").toLowerCase();
    const complaintLower = chiefComplaint.toLowerCase();
    const fullContext = `${complaintLower} ${answersText}`;

    const dangerSigns = [];
    let triageLevel = "Stable";

    // Obstetric Red Flags
    if (
      fullContext.includes("severe") ||
      fullContext.includes("blur") ||
      fullContext.includes("swelling on face") ||
      fullContext.includes("unbearable")
    ) {
      dangerSigns.push("Severe headache with visual disturbance / Preeclampsia risk");
      triageLevel = "Critical Red Flag";
    }

    if (fullContext.includes("heavy") || fullContext.includes("fresh red") || fullContext.includes("bleed")) {
      dangerSigns.push("Active vaginal bleeding reported");
      triageLevel = "Critical Red Flag";
    }

    if (fullContext.includes("no movement today") || fullContext.includes("reduced movement")) {
      dangerSigns.push("Decreased or absent fetal movements");
      triageLevel = "Critical Red Flag";
    }

    // Geriatric / Acute debility Red Flags
    if (
      fullContext.includes("bedridden") ||
      fullContext.includes("disoriented") ||
      fullContext.includes("slurred") ||
      fullContext.includes("gasping") ||
      fullContext.includes("chest heaviness") ||
      fullContext.includes("unable to eat or drink")
    ) {
      dangerSigns.push("Geriatric Acute Warning: Severe debility, disorientation, or cardiorespiratory distress");
      triageLevel = "Critical Red Flag";
    }

    if (triageLevel !== "Critical Red Flag" && (fullContext.includes("chills") || fullContext.includes("fever") || fullContext.includes("shiver") || fullContext.includes("rigor") || fullContext.includes("vomit"))) {
      triageLevel = "Moderate";
      dangerSigns.push("Acute febrile illness or high fever with rigors in malaria endemic zone");
    }

    // Build Q&A history array
    const assessmentHistory = assessmentQuestions.map((q) => ({
      question: q.question,
      answer: finalAnswers[q.id] || "Not answered",
    }));

    // AI Clinical summary text
    let clinicalSummary = "";
    if (assistedMode && patientCondition === "pregnant_distress") {
      clinicalSummary = `Assisted field intake conducted by ASHA Worker ${assistedBy}. Patient is a ${patient.age}-year-old pregnant female in acute pain/distress unable to operate device. Reported: "${chiefComplaint}". Assessment: ${
        triageLevel === "Critical Red Flag"
          ? "CRITICAL OBSTETRIC ALERT. Symptoms indicate potential severe preeclampsia or complications. Immediate Doctor review, BP check, and fetal Doppler required."
          : "Moderate pregnancy distress reported. Advise Doctor evaluation for symptomatic relief and monitoring."
      }`;
    } else if (assistedMode && patientCondition === "elderly_frail") {
      clinicalSummary = `Assisted field intake conducted by ASHA Worker ${assistedBy}. Patient is an elderly ${patient.gender.toLowerCase()} (${patient.age} yrs) unable to operate phone due to severe debility/illness. Reported: "${chiefComplaint}". Assessment: ${
        triageLevel === "Critical Red Flag"
          ? "URGENT GERIATRIC RED FLAG. High risk of sepsis, stroke, or severe cardiorespiratory distress. Immediate Medical Officer evaluation required."
          : "Geriatric clinical assessment logged by ASHA proxy. Doctor review recommended for rapid diagnostic test (Malaria/Dengue RDT) and prescription."
      }`;
    } else if (isMaternal) {
      clinicalSummary = `${patient.age}-year-old female (${patient.category || "ANC"}) reporting: "${chiefComplaint}". Assessment: ${
        triageLevel === "Critical Red Flag"
          ? "CRITICAL OBSTETRIC ALERT. Potential severe preeclampsia or complications. Immediate Doctor review required."
          : "Routine pregnancy intake with stable vitals. Continue nutritional supplements and standard ANC checkup."
      }`;
    } else {
      clinicalSummary = `${patient.age}-year-old ${patient.gender} presenting with: "${chiefComplaint}". Assessment: ${
        triageLevel === "Critical Red Flag"
          ? "URGENT MEDICAL ATTENTION REQUIRED. Acute warning flags detected."
          : "Outpatient clinical intake completed. Doctor review recommended for diagnosis and prescription."
      }`;
    }

    const patientRecord = {
      id: patientId,
      name: patient.name,
      age: patient.age,
      gender: patient.gender || (isMaternal ? "Female" : "Male"),
      village: patient.village || "Sepahijala",
      phone: patient.phone || "9862000000",
      category: isMaternal
        ? "Maternal & Antenatal (ANC)"
        : patientCondition === "elderly_frail"
        ? "Elderly & Geriatric OPD"
        : "General OPD",
      pregnancyMonths: isMaternal ? "Active Pregnancy" : null,
      assistedMode,
      assistedBy: assistedMode ? assistedBy : null,
      assistedReason,
      patientCondition,
      status: triageLevel === "Critical Red Flag" ? "Urgent" : "Pending Review",
      triage: triageLevel,
      chiefComplaint,
      assessmentHistory,
      dangerSigns,
      clinicalSummary,
      vitals: {
        bp: triageLevel === "Critical Red Flag" ? "152/96 mmHg (Elevated)" : "120/80 mmHg",
        weight: patientCondition === "elderly_frail" ? "56 kg" : "54 kg",
        hb: "10.4 g/dL",
        fetalHeartRate: isMaternal ? "140 bpm" : undefined,
        temp: fullContext.includes("fever") || fullContext.includes("chills") ? "102.4 °F" : "98.6 °F",
      },
      doctorReview: null,
      createdAt: "Today, Just now",
    };

    // Save to permanent store
    savePatient(patientRecord);

    // Also update localStorage current summary
    localStorage.setItem("aarogyaVaaniCurrentPatient", JSON.stringify({ patient: patientRecord, patientType: storedRecord.patientType }));
    localStorage.setItem("aarogyaVaaniCurrentSummary", JSON.stringify(patientRecord));

    setTimeout(() => {
      navigate(`/summary?id=${patientId}`);
    }, 1000);
  };

  const quickSymptomChips = isMaternal
    ? [
        "Severe headache & blurred vision",
        "Stomach pain / acute cramps",
        "Vaginal bleeding or spotting",
        "Baby movements feel reduced",
        "Swollen feet & puffy face",
        "Routine pregnancy checkup",
      ]
    : [
        "High fever with shivering chills",
        "Severe body ache & joint pain",
        "Difficulty breathing & chest heaviness",
        "Vomiting & loose motions",
        "Severe dizziness & weakness",
      ];

  const currentQ = assessmentQuestions[currentQIndex];

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50/50 pb-10">
      <GovHeader
        title="AI Voice Health Assistant"
        showBack={true}
        backPath="/dashboard"
      />

      <main className="flex-1 w-full max-w-md sm:max-w-lg mx-auto p-4 space-y-4 pb-24">
        {/* ASHA Assisted Intake Proxy Banner */}
        {assistedMode && (
          <div className="glass-card-emerald p-3.5 rounded-2xl border border-emerald-500/30 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#0b6651] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
                👩‍⚕️
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase text-emerald-900 tracking-wider">
                    ASHA Assisted Intake
                  </span>
                  <span className="text-[9px] bg-emerald-200/80 text-emerald-950 font-bold px-1.5 py-0.2 rounded">
                    Proxy Mode
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-800">
                  {assistedBy} • {patientCondition === "pregnant_distress" ? "Pregnant Mother in Acute Pain" : patientCondition === "elderly_frail" ? `Elderly (${patient.gender === "Female" ? "Old Woman" : "Old Man"})` : "Assisted Patient"}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-extrabold text-emerald-800 bg-white/85 px-2.5 py-1 rounded-lg border border-emerald-200/50">
              {patientCondition === "pregnant_distress" ? "🤰 Mother In Pain" : patientCondition === "elderly_frail" ? "👴 Frail/Bedridden" : "Proxy Intake"}
            </span>
          </div>
        )}

        {/* Patient Identity Bar */}
        <div className="glass-panel p-3.5 rounded-2xl flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-base shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-black text-slate-900 text-sm truncate">{patient.name}</h3>
              <p className="text-[11px] text-slate-500 font-semibold truncate">
                {patient.age} yrs • {patient.gender} • {patient.village}
              </p>
            </div>
          </div>
          <div className="glass-card-emerald px-2.5 py-1 rounded-xl text-right shrink-0">
            <span className="text-[9px] uppercase font-bold text-emerald-800 block">Patient ID</span>
            <strong className="font-mono text-xs font-black text-emerald-950">{patientId}</strong>
          </div>
        </div>

        {/* ---------------- STAGE 1: CHIEF COMPLAINT ---------------- */}
        {stage === "chief_complaint" && (
          <div className="glass-panel p-5 sm:p-6 rounded-3xl shadow-md border border-white/80 space-y-5 animate-fade-in">
            {/* AI Greeting Doctor Card */}
            <div className="glass-card-emerald p-4 rounded-2xl flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider block">
                    {assistedMode ? "AI Doctor • ASHA Guidance" : "AI Doctor Agent"}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      speakText(
                        assistedMode
                          ? patientCondition === "pregnant_distress"
                            ? "ASHA Didi, please observe and speak the mother's condition, or select options below."
                            : patientCondition === "elderly_frail"
                            ? "ASHA Didi, please observe and speak the elderly patient's condition, or select options below."
                            : "ASHA Didi, please record the patient's symptoms on their behalf."
                          : `Namaste ${patient.name}! Tell me in your own words, what problems or symptoms are you facing today?`
                      )
                    }
                    className="text-emerald-800 hover:text-emerald-950 flex items-center gap-1 text-xs font-bold cursor-pointer bg-white/60 px-2 py-0.5 rounded-lg"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Listen</span>
                  </button>
                </div>
                <p className="text-sm font-bold text-emerald-950 mt-1 leading-snug">
                  {assistedMode ? (
                    patientCondition === "pregnant_distress" ? (
                      language === "bn"
                        ? "মা কি বেশি কষ্টে আছেন? আশা দিদি, আপনি ওনার শারীরিক কষ্ট বা লক্ষণগুলি বলুন বা নিচের পর্যবেক্ষণ বোতাম বেছে নিন।"
                        : language === "hi"
                        ? "क्या गर्भवती माता अत्यधिक कष्ट में हैं? आशा दीदी, कृपया उनके लक्षण बोलकर या नीचे से चुनकर दर्ज करें।"
                        : "Patient is in acute pain / distress. ASHA Didi: Please observe and speak her condition, or select 1-tap signs below."
                    ) : patientCondition === "elderly_frail" ? (
                      language === "bn"
                        ? `প্রবীণ রোগী কি শয্যাশায়ী? আশা দিদি, ওনার কষ্ট বা লক্ষণগুলি বলুন বা নিচের বোতাম বেছে নিন।`
                        : language === "hi"
                        ? "बुजुर्ग मरीज बोल या मोबाइल चला नहीं पा रहे हैं। आशा दीदी, कृपया उनके लक्षण बोलकर या चुनकर दर्ज करें।"
                        : "Elderly patient is frail/bedridden. ASHA Didi: Speak their symptoms or select 1-tap signs below."
                    ) : (
                      "ASHA Didi: Please observe and record patient symptoms on their behalf."
                    )
                  ) : language === "bn" ? (
                    `নমস্কার ${patient.name}! সহজ ভাষায় আমাকে বলুন, আজকে আপনার কি সমস্যা বা কষ্ট হচ্ছে?`
                  ) : language === "hi" ? (
                    `नमस्ते ${patient.name}! कृपया सरल शब्दों में बताएं कि आज आपको क्या शारीरिक परेशानी हो रही है?`
                  ) : (
                    `Namaste ${patient.name}! Tell me in your own words, what problems or symptoms are you facing today?`
                  )}
                </p>
              </div>
            </div>

            {/* Voice Input Button & Visualizer */}
            <div className="flex flex-col items-center justify-center py-3">
              <button
                type="button"
                onClick={toggleListening}
                className={`w-24 h-24 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 shadow-lg ${
                  isListening
                    ? "bg-red-600 text-white animate-pulse ring-8 ring-red-200 shadow-red-500/50 scale-105"
                    : "bg-gradient-to-br from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white hover:scale-105"
                }`}
              >
                {isListening ? <MicOff className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
              </button>

              <span className="text-xs font-extrabold text-slate-700 mt-3 flex items-center gap-1.5">
                {isListening ? (
                  <span className="text-red-600 flex items-center gap-1.5 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-red-600" />
                    {assistedMode ? "Recording ASHA Worker's voice... Speak now" : "Listening to patient... Speak now"}
                  </span>
                ) : (
                  <span>
                    {assistedMode ? "Tap microphone to speak as ASHA Worker" : "Tap microphone to talk to AI"}
                  </span>
                )}
              </span>

              {speechError && (
                <p className="text-[11px] text-amber-800 font-semibold text-center mt-2 px-3 py-1 bg-amber-50 rounded-lg">
                  {speechError}
                </p>
              )}
            </div>

            {/* Text Input Box */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {assistedMode
                  ? "Observed Symptoms (Spoken by ASHA Worker or Typed):"
                  : "Patient's Issue / Symptoms (Spoken or Typed):"}
              </label>
              <textarea
                rows={3}
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                placeholder={
                  assistedMode
                    ? "e.g. Patient is groaning with severe contraction pain and cannot stand..."
                    : "e.g. I have severe headache, dizziness and stomach ache since yesterday..."
                }
                className="w-full p-3.5 bg-white/90 border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-inner resize-none"
              />
            </div>

            {/* ASHA Quick 1-Tap Observation Category Tabs & Chips */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  {assistedMode ? "ASHA 1-Tap Field Signs:" : "Quick 1-Tap Symptoms:"}
                </span>
                {assistedMode && (
                  <div className="flex gap-1 bg-slate-200/70 p-0.5 rounded-xl text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setActiveChipTab("maternal")}
                      className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                        activeChipTab === "maternal" ? "bg-emerald-700 text-white shadow-2xs" : "text-slate-600"
                      }`}
                    >
                      🤰 Pregnant Mother
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveChipTab("elderly")}
                      className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                        activeChipTab === "elderly" ? "bg-emerald-700 text-white shadow-2xs" : "text-slate-600"
                      }`}
                    >
                      👴 Elderly (Old Man/Woman)
                    </button>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {(activeChipTab === "maternal" || isMaternal
                  ? [
                      "Severe labor pain / groaning",
                      "Severe headache & blurred vision (Pre-eclampsia)",
                      "Water break / vaginal bleeding",
                      "Extreme pedal swelling / unable to walk",
                      "Baby movements reduced or absent",
                      "Severe dizziness & continuous vomiting",
                    ]
                  : [
                      "Bedridden & extreme weakness (Cannot stand)",
                      "High fever with shaking chills (Rigors)",
                      "Gasping for breath & chest tightness",
                      "Disoriented / confused / slurred speech",
                      "Unable to eat food or drink water",
                      "Severe joint & back pain (Immobile)",
                    ]
                ).map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setChiefComplaint(chip);
                      speakText(
                        assistedMode
                          ? `Observed sign noted: ${chip}. Starting clinical assessment.`
                          : `Noted: ${chip}. Let me ask you doctor assessment questions.`
                      );
                    }}
                    className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                      chiefComplaint === chip
                        ? "bg-emerald-700 text-white shadow-xs"
                        : "glass-card text-slate-700 hover:bg-emerald-50 hover:text-emerald-900"
                    }`}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Proceed to Assessment Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleStartAssessment}
                className="w-full bg-[#0b6651] hover:bg-[#074738] text-white font-extrabold text-sm py-4 px-6 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:shadow-lg"
              >
                <span>Assess Symptoms with AI Doctor</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* ---------------- STAGE 2: DOCTOR-LIKE ASSESSMENT ---------------- */}
        {stage === "assessment" && currentQ && (
          <div className="glass-panel p-5 sm:p-6 rounded-3xl shadow-md border border-white/80 space-y-5 animate-fade-in">
            {/* Assessment Progress */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1.5">
                <span className="text-emerald-800">
                  {assistedMode ? "ASHA Assisted Clinical Diagnostic Check" : "Doctor Clinical Assessment"}
                </span>
                <span>
                  Question {currentQIndex + 1} of {assessmentQuestions.length}
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-600 h-2 transition-all duration-300 rounded-full"
                  style={{
                    width: `${((currentQIndex + 1) / assessmentQuestions.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Doctor Question Card */}
            <div className="glass-card-emerald p-4.5 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase tracking-wider">
                  {assistedMode ? `ASHA Didi Check • Q${currentQIndex + 1}` : `Q${currentQIndex + 1} Clinical Diagnostic Check`}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    speakText(
                      language === "bn"
                        ? currentQ.bengali
                        : language === "hi"
                        ? currentQ.hindi
                        : currentQ.question
                    )
                  }
                  className="text-emerald-800 hover:text-emerald-950 flex items-center gap-1 text-xs font-bold cursor-pointer bg-white/60 px-2.5 py-1 rounded-lg"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Listen</span>
                </button>
              </div>

              {assistedMode && (
                <span className="text-xs font-black text-emerald-950 block">
                  👩‍⚕️ ASHA Didi, ask or check {patient.name}:
                </span>
              )}

              <h2 className="text-lg font-black text-slate-900 leading-snug">
                {language === "bn"
                  ? currentQ.bengali
                  : language === "hi"
                  ? currentQ.hindi
                  : currentQ.question}
              </h2>
            </div>

            {/* Quick Answer Option Buttons */}
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                {assistedMode ? "Select Patient's Response or Observed Status:" : "Select Patient Answer:"}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {currentQ.options.map((opt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSelectOption(opt)}
                    className={`p-3.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                      answers[currentQ.id] === opt || currentAnswerText === opt
                        ? "bg-emerald-700 text-white border-emerald-700 shadow-sm"
                        : "bg-white/80 hover:bg-emerald-50 text-slate-800 border-slate-200"
                    }`}
                  >
                    <span>{opt}</span>
                    {(answers[currentQ.id] === opt || currentAnswerText === opt) && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Voice Input or Custom Detail */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={currentAnswerText}
                  onChange={(e) => setCurrentAnswerText(e.target.value)}
                  placeholder={assistedMode ? "Or speak/type ASHA worker observation..." : "Or speak/type custom answer..."}
                  className="flex-1 px-3.5 py-2.5 bg-white/90 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`p-2.5 rounded-xl text-white transition-all cursor-pointer ${
                    isListening ? "bg-red-600 animate-pulse" : "bg-emerald-700 hover:bg-emerald-800"
                  }`}
                  title="Speak Answer"
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handlePrevQuestion}
                className="glass-card hover:bg-white text-slate-700 font-bold text-xs py-3 px-4 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={handleNextWithCurrentText}
                className="bg-[#0b6651] hover:bg-[#074738] text-white font-extrabold text-xs py-3 px-5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer ml-auto"
              >
                <span>
                  {currentQIndex === assessmentQuestions.length - 1
                    ? "Compile Health Summary"
                    : "Next Question"}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ---------------- STAGE 3: GENERATING SUMMARY SPINNER ---------------- */}
        {stage === "generating" && (
          <div className="glass-panel p-8 rounded-3xl shadow-md border border-white/80 text-center space-y-4 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto animate-spin">
              <Sparkles className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                Compiling Clinical Health Summary...
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Analyzing symptoms, danger signs, and generating doctor assessment sheet
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Docked Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
