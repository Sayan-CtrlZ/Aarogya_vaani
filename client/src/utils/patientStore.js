// Central Patient Data Store for AarogyaVaani

const STORAGE_KEY = "aarogyaVaaniAllPatients";
const STORAGE_DOCS_KEY = "aarogyaVaaniDocuments";

export const INITIAL_PATIENTS = [
  {
    id: "AV-2026-8921",
    altId: "AV-8921",
    name: "Mamta Debbarma",
    age: "27",
    gender: "Female",
    phone: "9862100000",
    bloodGroup: "B+",
    pregnancy: "Pregnant (20 weeks)",
    pregnancyBadge: "2nd Trimester (20w)",
    allergies: ["None known"],
    chronicConditions: ["None"],
    lastVisit: "11 Oct 2024",
    time: "10:24 AM",
    status: "Current",
    triage: "Stable",
    activeCase: true,
    queueType: "today",
    category: "Maternal & Antenatal (ANC)",
    nativeIntake: "बुखार और बदन दर्द, कभी कभी हल्का बुखार, पिछले ३ दिन से सूखी खांसी।",
    englishIntake: "Dry cough for 3 days, mild body ache, occasional low-grade fever.",
    intakeDetails: {
      duration: "3 days",
      severity: "Mild",
      relatedSymptoms: "No breathlessness, no chest pain",
      selfMedication: "None",
      concerns: "Safe in pregnancy?",
    },
    chiefComplaint: "Dry cough for 3 days with mild throat irritation. No fever reported.",
    keyFindings: [
      "Currently 20 weeks pregnant (antenatal checkup normal).",
      "No history of asthma or chronic lung disease.",
      "Recent vitals within normal range.",
      "No known allergies.",
    ],
    aiImpression: "Likely viral upper respiratory tract infection. No red flag symptoms reported.",
    suggestedQuestions: [
      "Has the cough changed over time?",
      "Any throat pain or nasal congestion?",
      "Any recent exposure to someone with infection?",
      "Any difficulty in sleep due to cough?",
    ],
    vitals: {
      bp: "118/76 mmHg",
      weight: "54 kg",
      hb: "11.2 g/dL",
      fetalHeartRate: "142 bpm",
      temp: "98.6 °F",
      pulse: "74 bpm",
      spo2: "99%",
    },
    prescriptions: [
      { id: "rx-1", name: "Tab Iron Folic Acid (IFA)", dose: "1 tablet daily", duration: "x 30 days", selected: true },
      { id: "rx-2", name: "Tab Calcium 500mg", dose: "1 tablet twice daily", duration: "x 30 days", selected: true },
      { id: "rx-3", name: "Tab Paracetamol 650mg", dose: "SOS (if fever > 100°F)", duration: "x 5 days", selected: true },
      { id: "rx-4", name: "ORS Sachet", dose: "1 sachet in 200ml water", duration: "x 2 packets", selected: true },
    ],
    priorVisits: [
      {
        date: "11 Oct 2024",
        doctor: "Dr. Sandeep Roy",
        facility: "Bishalgarh CHC",
        type: "Routine ANC Follow-up",
        summary: "Normal gestational progress. Advised IFA & Calcium supplementation. BP stable at 116/74.",
        status: "Completed",
      },
      {
        date: "14 Jul 2024",
        doctor: "Dr. Anita Sen (Gynecologist)",
        facility: "Bishalgarh CHC",
        type: "ANC Trimester 2 Check",
        summary: "TT-1 booster administered. Fetal heartbeat audible and regular. Hb recorded at 10.4 g/dL.",
        status: "Completed",
      },
    ],
    consultationsCount: 2,
    reportsCount: 3,
  },
  {
    id: "AV-2026-7316",
    altId: "AV-7316",
    name: "Hare Krishna",
    age: "45",
    gender: "Male",
    phone: "9862111000",
    bloodGroup: "O+",
    pregnancy: null,
    allergies: ["Penicillin"],
    chronicConditions: ["Hypertension (Grade 1)"],
    lastVisit: "15 Sep 2024",
    time: "09:40 AM",
    status: "In Queue",
    triage: "Stable",
    activeCase: true,
    queueType: "today",
    category: "Hypertension & NCD Clinic",
    nativeIntake: "সকাল বেলা মাথা ভারি লাগে, ৪ দিন ঔষধ খাওয়া বন্ধ ছিল।",
    englishIntake: "Heavy head in the morning, missed taking blood pressure medicine for 4 days.",
    intakeDetails: {
      duration: "4 days",
      severity: "Moderate",
      relatedSymptoms: "Occipital heaviness, mild neck tension",
      selfMedication: "None",
      concerns: "Risk of stroke?",
    },
    chiefComplaint: "Mild occipital throbbing headache in morning; skipped amlodipine for 4 days.",
    keyFindings: [
      "Known hypertensive on Tab Amlodipine 5mg OD.",
      "BP elevated at 148/92 mmHg today.",
      "No neurological deficit, vision clear.",
    ],
    aiImpression: "Uncontrolled Stage 1 Essential Hypertension secondary to medication non-compliance.",
    suggestedQuestions: [
      "Have you experienced any chest pain or palpitations?",
      "Any visual disturbances or nausea?",
      "Are you restricting dietary salt intake?",
    ],
    vitals: {
      bp: "148/92 mmHg",
      weight: "68 kg",
      hb: "13.6 g/dL",
      temp: "98.4 °F",
      pulse: "78 bpm",
      spo2: "98%",
    },
    prescriptions: [
      { id: "rx-hk-1", name: "Tab Amlodipine 5mg", dose: "1 tablet OD (morning)", duration: "x 30 days", selected: true },
      { id: "rx-hk-2", name: "Tab Telmisartan 40mg", dose: "1 tablet OD (if BP remains > 140)", duration: "x 30 days", selected: false },
    ],
    priorVisits: [
      {
        date: "15 Sep 2024",
        doctor: "Dr. Sandeep Roy",
        facility: "Bishalgarh CHC",
        type: "NCD Monthly Follow-up",
        summary: "BP was controlled at 126/82 on Amlodipine 5mg. Advised 30 min daily walking.",
        status: "Completed",
      },
    ],
    consultationsCount: 1,
    reportsCount: 2,
  },
  {
    id: "AV-2026-4454",
    altId: "AV-4454",
    name: "Bappaditya Paul",
    age: "34",
    gender: "Male",
    phone: "9862122000",
    bloodGroup: "A+",
    allergies: ["None known"],
    chronicConditions: ["None"],
    lastVisit: "02 Jun 2024",
    time: "09:20 AM",
    status: "In Queue",
    triage: "Moderate",
    activeCase: true,
    queueType: "today",
    category: "General OPD / Fever",
    nativeIntake: "দুদিন ধরে তীব্র জ্বর আর সারা শরীরে প্রচণ্ড ব্যথা, মুখে অরুচি।",
    englishIntake: "Severe fever for 2 days with whole body ache, total loss of taste and appetite.",
    intakeDetails: {
      duration: "2 days",
      severity: "Moderate-High",
      relatedSymptoms: "Retro-orbital pain, severe myalgia",
      selfMedication: "Paracetamol 500mg 1 tab yesterday",
      concerns: "Dengue or Malaria?",
    },
    chiefComplaint: "Acute high fever with rigors for 2 days, severe body aches and loss of appetite.",
    keyFindings: [
      "Body temperature 101.4 °F recorded at triage.",
      "Lives in rubber-plantation area with high mosquito exposure.",
      "No petechial rash or bleeding from gums.",
    ],
    aiImpression: "Acute Febrile Illness. Differential includes Dengue NS1 / Malaria endemic infection.",
    suggestedQuestions: [
      "Any vomiting or severe abdominal pain?",
      "Have you noticed dark urine or bleeding?",
      "Is anyone else at home having high fever?",
    ],
    vitals: {
      bp: "122/80 mmHg",
      weight: "61 kg",
      hb: "12.8 g/dL",
      temp: "101.4 °F",
      pulse: "92 bpm",
      spo2: "97%",
    },
    prescriptions: [
      { id: "rx-bp-1", name: "Tab Paracetamol 650mg", dose: "1 tablet TDS after meals", duration: "x 5 days", selected: true },
      { id: "rx-bp-2", name: "ORS Sachet", dose: "1 sachet in 1L boiled water daily", duration: "x 4 packets", selected: true },
      { id: "rx-bp-3", name: "Tab Pantoprazole 40mg", dose: "1 tablet OD (empty stomach)", duration: "x 5 days", selected: true },
    ],
    consultationsCount: 1,
    reportsCount: 1,
  },
  {
    id: "AV-2026-2103",
    altId: "AV-2103",
    name: "Sunita Das",
    age: "29",
    gender: "Female",
    phone: "9862133000",
    bloodGroup: "O+",
    pregnancy: "Postnatal (Day 12)",
    pregnancyBadge: "Postnatal (Day 12)",
    allergies: ["None known"],
    chronicConditions: ["Postpartum Gestational Hypertension"],
    lastVisit: "12 Oct 2024",
    time: "08:50 AM",
    status: "Urgent",
    triage: "Critical Red Flag",
    activeCase: true,
    queueType: "today",
    category: "Postnatal Care (PNC)",
    nativeIntake: "বাচ্চা হওয়ার পর ১২ দিন হলো, হঠাৎ দুই পা ফুলে গেছে আর মাথায় খুব যন্ত্রণা।",
    englishIntake: "12 days since delivery, sudden swelling in both feet and agonizing frontal headache.",
    intakeDetails: {
      duration: "1 day",
      severity: "Severe",
      relatedSymptoms: "Pedal edema, visual spots, irritability",
      selfMedication: "None",
      concerns: "Postpartum preeclampsia risk",
    },
    chiefComplaint: "Postnatal Day 12; sudden high BP, severe headache and bilateral pedal edema.",
    keyFindings: [
      "Severe elevated BP: 152/96 mmHg on postpartum check.",
      "Bilateral pitting edema up to mid-shin.",
      "Risk of late postpartum preeclampsia / eclampsia.",
    ],
    aiImpression: "Late Postpartum Preeclampsia. Urgent Obstetric evaluation and antihypertensive management advised.",
    suggestedQuestions: [
      "Are you seeing blurred vision or flashing lights?",
      "Any severe pain under the right rib cage?",
      "Is baby feeding well at breast?",
    ],
    vitals: {
      bp: "152/96 mmHg",
      weight: "59 kg",
      hb: "9.6 g/dL",
      temp: "98.8 °F",
      pulse: "96 bpm",
      spo2: "98%",
    },
    prescriptions: [
      { id: "rx-sd-1", name: "Tab Labetalol 100mg", dose: "1 tablet BD after food", duration: "x 14 days", selected: true },
      { id: "rx-sd-2", name: "Tab Calcium 500mg", dose: "1 tablet twice daily", duration: "x 30 days", selected: true },
      { id: "rx-sd-3", name: "Tab Iron Folic Acid (IFA)", dose: "1 tablet daily", duration: "x 60 days", selected: true },
    ],
    consultationsCount: 3,
    reportsCount: 3,
  },
  {
    id: "AV-2026-6678",
    altId: "AV-6678",
    name: "Rakesh Sharma",
    age: "52",
    gender: "Male",
    phone: "9862144000",
    bloodGroup: "B+",
    allergies: ["Aspirin (mild gastric distress)"],
    chronicConditions: ["Type 2 Diabetes Mellitus (5 yrs)"],
    lastVisit: "20 Aug 2024",
    time: "08:30 AM",
    status: "In Queue",
    triage: "Stable",
    activeCase: true,
    queueType: "today",
    category: "Diabetes & Endocrine Clinic",
    nativeIntake: "পায়ের পাতায় সূচ ফোটার মত অনুভূতি হয়, মাঝে মাঝে খুব পিপাসা পায়।",
    englishIntake: "Pins and needles sensation in soles of feet, excessive thirst at night.",
    intakeDetails: {
      duration: "2 weeks",
      severity: "Moderate",
      relatedSymptoms: "Polydipsia, nocturia (3 times/night)",
      selfMedication: "Metformin 500mg BD",
      concerns: "Diabetic neuropathy progression",
    },
    chiefComplaint: "Routine diabetes checkup, reports tingling in feet and nocturnal thirst.",
    keyFindings: [
      "Fasting blood sugar 182 mg/dL.",
      "HbA1c last recorded 7.8%.",
      "Early peripheral diabetic neuropathy signs in bilateral soles.",
    ],
    aiImpression: "Suboptimally controlled Type 2 Diabetes with early distal sensorimotor neuropathy.",
    suggestedQuestions: [
      "Any non-healing sores or blisters on feet?",
      "Have you experienced dizzy spells when standing up?",
      "When was your last retinal eye examination?",
    ],
    vitals: {
      bp: "130/84 mmHg",
      weight: "74 kg",
      hb: "14.1 g/dL",
      temp: "98.4 °F",
      pulse: "76 bpm",
      spo2: "98%",
    },
    prescriptions: [
      { id: "rx-rs-1", name: "Tab Metformin 1000mg ER", dose: "1 tablet with evening meal", duration: "x 30 days", selected: true },
      { id: "rx-rs-2", name: "Tab Methylcobalamin 1500mcg", dose: "1 tablet daily after food", duration: "x 30 days", selected: true },
      { id: "rx-rs-3", name: "Tab Glimepiride 1mg", dose: "1 tablet morning before breakfast", duration: "x 30 days", selected: true },
    ],
    consultationsCount: 2,
    reportsCount: 2,
  },
  {
    id: "AV-2026-9902",
    altId: "AV-9902",
    name: "Pritam Saha",
    age: "31",
    gender: "Male",
    phone: "9862155000",
    bloodGroup: "AB+",
    allergies: ["Dust mites", "Cold weather"],
    chronicConditions: ["Bronchial Asthma (Intermittent)"],
    lastVisit: "08 Jul 2024",
    time: "08:15 AM",
    status: "In Queue",
    triage: "Moderate",
    activeCase: true,
    queueType: "today",
    category: "Pulmonology & Respiratory",
    nativeIntake: "ঠান্ডা লাগলেই বুকে বাঁশির মত আওয়াজ হয় আর রাতে কাশিতে ঘুম ভাঙে।",
    englishIntake: "Whenever cold strikes, wheezing starts in chest and night cough wakes me up.",
    intakeDetails: {
      duration: "5 days",
      severity: "Moderate",
      relatedSymptoms: "Expiratory wheeze, chest tightness",
      selfMedication: "Salbutamol inhaler SOS",
      concerns: "Need preventive inhaler?",
    },
    chiefComplaint: "Wheezing and nocturnal cough exacerbated by seasonal cold air.",
    keyFindings: [
      "SpO2 96% on room air, respiratory rate 22/min.",
      "Bilateral expiratory rhonchi audible on chest auscultation.",
      "No intercostal indrawing or cyanosis.",
    ],
    aiImpression: "Mild Persistent Bronchial Asthma with acute seasonal exacerbation.",
    suggestedQuestions: [
      "How many times per week do you use your rescue inhaler?",
      "Does the wheeze worsen after physical exertion?",
      "Any history of allergy or eczema?",
    ],
    vitals: {
      bp: "120/78 mmHg",
      weight: "63 kg",
      hb: "13.2 g/dL",
      temp: "98.6 °F",
      pulse: "84 bpm",
      spo2: "96%",
    },
    prescriptions: [
      { id: "rx-ps-1", name: "Inhaler Budecort 200mcg", dose: "2 puffs twice daily with spacer", duration: "x 30 days", selected: true },
      { id: "rx-ps-2", name: "Inhaler Asthalin 100mcg", dose: "2 puffs SOS for acute breathlessness", duration: "x 30 days", selected: true },
      { id: "rx-ps-3", name: "Tab Montelukast 10mg + Levocetirizine 5mg", dose: "1 tablet at bedtime", duration: "x 15 days", selected: true },
    ],
    consultationsCount: 1,
    reportsCount: 1,
  },
  {
    id: "AV-2026-1120",
    altId: "AV-1120",
    name: "Anita Roy",
    age: "38",
    gender: "Female",
    phone: "9862166000",
    bloodGroup: "O-",
    allergies: ["None known"],
    chronicConditions: ["Primary Hypothyroidism (3 yrs)"],
    lastVisit: "10 Jul 2024",
    time: "07:50 AM",
    status: "Completed",
    triage: "Stable",
    activeCase: false,
    queueType: "today",
    category: "Endocrinology / Thyroid",
    nativeIntake: "নিয়মিত থাইরয়েডের বড়ি খাচ্ছি, কিন্তু ওজন কিছুতেই কমছে না আর ক্লান্তি ভাব।",
    englishIntake: "Taking thyroid pill regularly, but still struggling with lethargy and weight gain.",
    intakeDetails: {
      duration: "3 months",
      severity: "Mild",
      relatedSymptoms: "Cold intolerance, mild constipation",
      selfMedication: "Thyroxine 50mcg OD",
      concerns: "Need dosage increase?",
    },
    chiefComplaint: "Hypothyroidism follow-up; TSH report review and persistent lethargy.",
    keyFindings: [
      "TSH elevated at 7.4 uIU/mL on recent diagnostic panel.",
      "Adherent to daily empty-stomach morning medication.",
      "Thyroid gland non-tender, no palpable nodules.",
    ],
    aiImpression: "Under-treated Primary Hypothyroidism requiring Thyroxine dose titration.",
    suggestedQuestions: [
      "Do you wait at least 45 minutes before tea or breakfast after pill?",
      "Any palpitations, heat intolerance, or hair thinning?",
    ],
    vitals: {
      bp: "124/82 mmHg",
      weight: "67 kg",
      hb: "11.6 g/dL",
      temp: "98.2 °F",
      pulse: "68 bpm",
      spo2: "99%",
    },
    prescriptions: [
      { id: "rx-ar-1", name: "Tab Levothyroxine 75mcg", dose: "1 tablet early morning empty stomach", duration: "x 60 days", selected: true },
    ],
    consultationsCount: 2,
    reportsCount: 2,
  },
  {
    id: "AV-2026-7788",
    altId: "AV-7788",
    name: "Deepak Das",
    age: "48",
    gender: "Male",
    phone: "9862177000",
    bloodGroup: "B-",
    allergies: ["None known"],
    chronicConditions: ["Smoker (20 pack-years), Pre-hypertension"],
    lastVisit: "04 Apr 2024",
    time: "07:35 AM",
    status: "Urgent",
    triage: "Critical Red Flag",
    activeCase: true,
    queueType: "today",
    category: "Emergency & Cardiology",
    nativeIntake: "বুকে পাথর চাপা দিয়ে রাখার মতো প্রচণ্ড ব্যথা, বাঁ হাতে নামছে, ঘেমে ভিজে গেছি।",
    englishIntake: "Agonizing heavy crushing pain on chest radiating to left arm, cold sweating heavily.",
    intakeDetails: {
      duration: "45 minutes",
      severity: "Extreme Critical",
      relatedSymptoms: "Diaphoresis, shortness of breath, nausea",
      selfMedication: "None",
      concerns: "Heart attack in progress",
    },
    chiefComplaint: "Substernal crushing chest pain radiating to left arm with profuse diaphoresis.",
    keyFindings: [
      "BP 160/100 mmHg, pulse 104 bpm, SpO2 94%.",
      "Severe acute coronary distress appearance.",
      "Immediate STAT 12-lead ECG and emergency loading dose required.",
    ],
    aiImpression: "Acute Coronary Syndrome (Suspected STEMI / NSTEMI). Immediate red-flag transfer protocol.",
    suggestedQuestions: [
      "When did the crushing sensation reach maximum intensity?",
      "Have you had similar angina episodes during climbing stairs?",
    ],
    vitals: {
      bp: "160/100 mmHg",
      weight: "72 kg",
      hb: "14.4 g/dL",
      temp: "98.4 °F",
      pulse: "104 bpm",
      spo2: "94%",
    },
    prescriptions: [
      { id: "rx-dd-1", name: "Tab Aspirin 300mg (Soluble)", dose: "Chew STAT immediately", duration: "x 1 dose", selected: true },
      { id: "rx-dd-2", name: "Tab Clopidogrel 300mg", dose: "Swallow STAT with water", duration: "x 1 dose", selected: true },
      { id: "rx-dd-3", name: "Tab Atorvastatin 80mg", dose: "Take STAT", duration: "x 1 dose", selected: true },
      { id: "rx-dd-4", name: "Tab Sorbitrate 5mg (Sublingual)", dose: "Place under tongue SOS for chest pain", duration: "x 2 tabs", selected: true },
    ],
    consultationsCount: 1,
    reportsCount: 1,
  },
  {
    id: "AV-2026-3345",
    altId: "AV-3345",
    name: "Rekha Sutradhar",
    age: "26",
    gender: "Female",
    phone: "9862188000",
    bloodGroup: "A+",
    allergies: ["None known"],
    chronicConditions: ["Moderate-to-Severe Microcytic Anemia"],
    lastVisit: "22 Sep 2024",
    time: "07:20 AM",
    status: "Completed",
    triage: "Stable",
    activeCase: false,
    queueType: "today",
    category: "Hematology & Women's Health",
    nativeIntake: "সিঁড়ি দিয়ে উঠলে বুক ধড়ফড় করে, চোখ অন্ধকার হয়ে আসে, কাজ করতে পারি না।",
    englishIntake: "Palpitations when climbing stairs, eyes black out, complete fatigue while working.",
    intakeDetails: {
      duration: "1 month",
      severity: "Moderate",
      relatedSymptoms: "Pallor, nail brittleness (koilonychia)",
      selfMedication: "None",
      concerns: "Need blood transfusion?",
    },
    chiefComplaint: "Severe lethargy and breathlessness on climbing stairs; microcytic anemia workup.",
    keyFindings: [
      "Hemoglobin 7.8 g/dL recorded on clinic automated hemogram.",
      "Marked conjunctival and palmar pallor.",
      "Cardiovascular auscultation reveals mild systolic hemic murmur.",
    ],
    aiImpression: "Moderate-to-Severe Iron Deficiency Anemia. Injectable iron or high-dose oral IFA indicated.",
    suggestedQuestions: [
      "Any excessive menstrual blood loss or bleeding piles?",
      "Do you eat green leafy vegetables or iron-rich foods?",
    ],
    vitals: {
      bp: "110/70 mmHg",
      weight: "47 kg",
      hb: "7.8 g/dL",
      temp: "98.6 °F",
      pulse: "94 bpm",
      spo2: "99%",
    },
    prescriptions: [
      { id: "rx-rk-1", name: "Tab Ferrous Ascorbate + Folic Acid", dose: "1 tablet twice daily after meals", duration: "x 60 days", selected: true },
      { id: "rx-rk-2", name: "Tab Vitamin C (Ascorbic Acid) 500mg", dose: "1 tablet daily with iron to improve absorption", duration: "x 60 days", selected: true },
      { id: "rx-rk-3", name: "Tab Albendazole 400mg", dose: "1 tablet single dose at bedtime (deworming)", duration: "x 1 tab", selected: true },
    ],
    consultationsCount: 2,
    reportsCount: 2,
  },
  {
    id: "AV-2026-6671",
    altId: "AV-6671",
    name: "Bijoy Tripura",
    age: "60",
    gender: "Male",
    phone: "9862199000",
    bloodGroup: "O+",
    allergies: ["None known"],
    chronicConditions: ["None"],
    lastVisit: "01 Oct 2024",
    time: "07:10 AM",
    status: "Completed",
    triage: "Stable",
    activeCase: false,
    queueType: "today",
    category: "General Medicine / Post-Infection Follow-up",
    nativeIntake: "ম্যালেরিয়া ভালো হয়েছে, এখন খাবার রুচি ফিরছে কিন্তু সামান্য দুর্বল লাগে।",
    englishIntake: "Malaria resolved, appetite returning nicely, only slight remaining weakness.",
    intakeDetails: {
      duration: "7 days",
      severity: "Mild (Convalescent)",
      relatedSymptoms: "Post-infectious mild asthenia",
      selfMedication: "Completed Artemisinin combo course",
      concerns: "Safe to return to work?",
    },
    chiefComplaint: "Post-malaria recovery check; appetite returning, fever completely subsided.",
    keyFindings: [
      "Afebrile for 7 days post ACT regimen.",
      "Repeat peripheral blood smear negative for Plasmodium.",
      "Vitals completely normal.",
    ],
    aiImpression: "Convalescent state post Plasmodium Vivax Malaria. Routine recovery confirmed.",
    suggestedQuestions: [
      "Any lingering joint ache or dark urine?",
      "Are you sleeping inside insecticide-treated bed nets?",
    ],
    vitals: {
      bp: "122/78 mmHg",
      weight: "56 kg",
      hb: "11.4 g/dL",
      temp: "98.4 °F",
      pulse: "72 bpm",
      spo2: "99%",
    },
    prescriptions: [
      { id: "rx-bt-1", name: "Tab B-Complex with Zinc", dose: "1 capsule daily after lunch", duration: "x 30 days", selected: true },
    ],
    consultationsCount: 2,
    reportsCount: 2,
  },
  // Upcoming Patients (8)
  {
    id: "AV-2026-5512",
    name: "Subrata Paul",
    age: "42",
    gender: "Male",
    phone: "9862211000",
    bloodGroup: "B+",
    time: "Tomorrow 09:00 AM",
    status: "Scheduled",
    triage: "Stable",
    queueType: "upcoming",
    category: "Cardiology Review",
    chiefComplaint: "Post-angioplasty 6-month routine review and lipid profile check.",
    vitals: { bp: "126/80 mmHg", pulse: "74 bpm" },
  },
  {
    id: "AV-2026-5513",
    name: "Purnima Debbarma",
    age: "24",
    gender: "Female",
    phone: "9862222000",
    bloodGroup: "A+",
    pregnancy: "Pregnant (10 weeks)",
    pregnancyBadge: "1st Trimester (10w)",
    time: "Tomorrow 09:30 AM",
    status: "Scheduled",
    triage: "Stable",
    queueType: "upcoming",
    category: "Maternal & Antenatal (ANC)",
    chiefComplaint: "First trimester antenatal ultrasound review and hyperemesis management.",
    vitals: { bp: "114/72 mmHg", weight: "49 kg" },
  },
  {
    id: "AV-2026-5514",
    name: "Manik Sarkar",
    age: "58",
    gender: "Male",
    phone: "9862233000",
    bloodGroup: "O+",
    time: "Tomorrow 10:00 AM",
    status: "Scheduled",
    triage: "Stable",
    queueType: "upcoming",
    category: "Post-Op Surgical Review",
    chiefComplaint: "Inguinal hernia repair suture line inspection.",
    vitals: { bp: "132/84 mmHg" },
  },
  {
    id: "AV-2026-5515",
    name: "Anjali Jamatia",
    age: "33",
    gender: "Female",
    phone: "9862244000",
    bloodGroup: "B+",
    time: "Tomorrow 10:30 AM",
    status: "Scheduled",
    triage: "Stable",
    queueType: "upcoming",
    category: "Pediatric & Maternal",
    chiefComplaint: "Infant immunization guidance and postnatal mother check.",
    vitals: { bp: "118/76 mmHg" },
  },
  {
    id: "AV-2026-5516",
    name: "Samarjit Roy",
    age: "50",
    gender: "Male",
    phone: "9862255000",
    bloodGroup: "AB+",
    time: "Tomorrow 11:00 AM",
    status: "Scheduled",
    triage: "Stable",
    queueType: "upcoming",
    category: "Dyslipidemia Management",
    chiefComplaint: "Statin therapy monitoring and liver enzyme review.",
    vitals: { bp: "128/82 mmHg" },
  },
  {
    id: "AV-2026-5517",
    name: "Jharna Das",
    age: "28",
    gender: "Female",
    phone: "9862266000",
    bloodGroup: "O+",
    pregnancy: "Pregnant (26 weeks)",
    time: "Tomorrow 11:30 AM",
    status: "Scheduled",
    triage: "Moderate",
    queueType: "upcoming",
    category: "Maternal & Antenatal (ANC)",
    chiefComplaint: "Oral glucose tolerance test (OGTT) review for gestational diabetes.",
    vitals: { bp: "120/78 mmHg" },
  },
  {
    id: "AV-2026-5518",
    name: "Kanai Lal Reang",
    age: "64",
    gender: "Male",
    phone: "9862277000",
    bloodGroup: "A+",
    time: "Tomorrow 12:00 PM",
    status: "Scheduled",
    triage: "Stable",
    queueType: "upcoming",
    category: "Geriatric & Rheumatology",
    chiefComplaint: "Bilateral knee osteoarthritis pain management and physiotherapy review.",
    vitals: { bp: "134/86 mmHg" },
  },
  {
    id: "AV-2026-5519",
    name: "Madhuri Ghosh",
    age: "40",
    gender: "Female",
    phone: "9862288000",
    bloodGroup: "B+",
    time: "Tomorrow 12:30 PM",
    status: "Scheduled",
    triage: "Stable",
    queueType: "upcoming",
    category: "Neurology OPD",
    chiefComplaint: "Chronic migraine prophylactic medication titration.",
    vitals: { bp: "116/74 mmHg" },
  },
  // Follow-up Patients (4)
  {
    id: "AV-2026-6621",
    name: "Tanmay Barman",
    age: "36",
    gender: "Male",
    phone: "9862311000",
    bloodGroup: "O+",
    time: "In 3 Days",
    status: "Follow-up",
    triage: "Stable",
    queueType: "followup",
    category: "Gastroenterology",
    chiefComplaint: "Duodenal ulcer symptom check post H. pylori eradication therapy.",
    vitals: { bp: "120/80 mmHg" },
  },
  {
    id: "AV-2026-6622",
    name: "Lipika Sen",
    age: "30",
    gender: "Female",
    phone: "9862322000",
    bloodGroup: "B+",
    time: "In 5 Days",
    status: "Follow-up",
    triage: "Stable",
    queueType: "followup",
    category: "Postnatal Care",
    chiefComplaint: "Post-cesarean wound inspection and repeat hemoglobin check.",
    vitals: { bp: "116/76 mmHg" },
  },
  {
    id: "AV-2026-6623",
    name: "Gouranga Saha",
    age: "62",
    gender: "Male",
    phone: "9862333000",
    bloodGroup: "A+",
    time: "Next Week",
    status: "Follow-up",
    triage: "Stable",
    queueType: "followup",
    category: "Hypertension Clinic",
    chiefComplaint: "BP diary log review after starting Telmisartan 40mg.",
    vitals: { bp: "128/82 mmHg" },
  },
  {
    id: "AV-2026-6624",
    name: "Sharmila Deb",
    age: "22",
    gender: "Female",
    phone: "9862344000",
    bloodGroup: "AB+",
    time: "Next Week",
    status: "Follow-up",
    triage: "Stable",
    queueType: "followup",
    category: "General Medicine",
    chiefComplaint: "Viral bronchitis resolution check, chest clear.",
    vitals: { bp: "112/72 mmHg" },
  },
];

export const INITIAL_DOCUMENTS = [
  {
    id: "doc-1",
    patientId: "AV-2026-8921",
    altPatientId: "AV-8921",
    title: "Prescription - Dr. Roy",
    fileName: "Prescription_Dr_Roy_11Oct.pdf",
    category: "Prescription",
    date: "11 Oct 2024",
    pages: "2 pages",
    facility: "Bishalgarh Community Health Centre",
    verified: true,
    fileSize: "420 KB",
    type: "prescription",
  },
  {
    id: "doc-2",
    patientId: "AV-2026-8921",
    altPatientId: "AV-8921",
    title: "Blood Test Report",
    fileName: "Routine_ANC_Complete_Hemogram.pdf",
    category: "Lab Reports",
    date: "28 Sep 2024",
    pages: "3 pages",
    facility: "District Diagnostic Centre, Sepahijala",
    verified: true,
    fileSize: "890 KB",
    type: "lab",
  },
  {
    id: "doc-3",
    patientId: "AV-2026-8921",
    altPatientId: "AV-8921",
    title: "Chest X-Ray",
    fileName: "Chest_XRay_PA_Digital.jpg",
    category: "Imaging",
    date: "05 Oct 2024",
    pages: "1 image + report",
    facility: "Sepahijala District Hospital Radiology",
    verified: true,
    fileSize: "2.1 MB",
    type: "imaging",
  },
  {
    id: "doc-4",
    patientId: "AV-2026-8921",
    altPatientId: "AV-8921",
    title: "Tripura Mother & Child Protection (MCP) Card",
    fileName: "MCP_Card_Tripura_Mamta.pdf",
    category: "Prescription",
    date: "14 Jul 2024",
    pages: "4 pages",
    facility: "National Health Mission Tripura",
    verified: true,
    fileSize: "1.4 MB",
    type: "mcp",
  },
];

export function getPatientDocuments(patientId = "AV-2026-8921") {
  try {
    const raw = localStorage.getItem(STORAGE_DOCS_KEY);
    const list = raw ? JSON.parse(raw) : INITIAL_DOCUMENTS;
    const cleanId = String(patientId).toUpperCase().trim();
    return list.filter(
      (d) =>
        !patientId ||
        d.patientId?.toUpperCase() === cleanId ||
        d.altPatientId?.toUpperCase() === cleanId ||
        (cleanId.includes("8921") && (d.patientId?.includes("8921") || d.altPatientId?.includes("8921")))
    );
  } catch {
    return INITIAL_DOCUMENTS;
  }
}

export function addPatientDocument(doc) {
  try {
    const raw = localStorage.getItem(STORAGE_DOCS_KEY);
    const list = raw ? JSON.parse(raw) : INITIAL_DOCUMENTS;
    const newDoc = {
      id: `doc-${Date.now()}`,
      patientId: doc.patientId || "AV-2026-8921",
      date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      verified: true,
      pages: doc.pages || "1 page",
      ...doc,
    };
    const updated = [newDoc, ...list];
    localStorage.setItem(STORAGE_DOCS_KEY, JSON.stringify(updated));
    return newDoc;
  } catch {
    return doc;
  }
}

export function getAllPatients() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PATIENTS));
      return INITIAL_PATIENTS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length < INITIAL_PATIENTS.length) {
      // Merge initial patients to ensure the full rich queue is always present
      const map = new Map();
      INITIAL_PATIENTS.forEach((p) => map.set(p.id, p));
      parsed.forEach((p) => map.set(p.id, { ...map.get(p.id), ...p }));
      const merged = Array.from(map.values());
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      return merged;
    }
    return parsed;
  } catch {
    return INITIAL_PATIENTS;
  }
}

export function getPatientById(id) {
  if (!id) return null;
  const patients = getAllPatients();
  const cleanId = String(id).trim().toUpperCase();
  return (
    patients.find(
      (p) =>
        p.id?.toUpperCase() === cleanId ||
        p.altId?.toUpperCase() === cleanId ||
        p.patient_ref?.toUpperCase() === cleanId ||
        (cleanId.endsWith("8921") && p.id?.includes("8921"))
    ) || null
  );
}

export function getCurrentPatient() {
  try {
    const active = localStorage.getItem("aarogyaVaaniActiveUser");
    if (active) {
      const parsed = JSON.parse(active);
      const patId = parsed.patient_ref || parsed.patientId || parsed.id;
      if (patId) {
        const found = getPatientById(patId);
        if (found) return found;
      }
    }
  } catch {}
  return INITIAL_PATIENTS[0];
}

export function setCurrentPatient(patientOrId) {
  try {
    const patient = typeof patientOrId === "string" ? getPatientById(patientOrId) : patientOrId;
    if (patient) {
      localStorage.setItem("aarogyaVaaniActiveUser", JSON.stringify(patient));
      try {
        window.dispatchEvent(new CustomEvent("aarogya_patient_updated", { detail: patient }));
      } catch {}
      return patient;
    }
  } catch {}
  return null;
}

export function savePatient(newPatient) {
  const patients = getAllPatients();
  const patId = newPatient.patient_ref || newPatient.id || newPatient.patientId;
  const existingIndex = patients.findIndex(
    (p) => (p.patient_ref || p.id)?.toUpperCase() === patId?.toUpperCase()
  );
  let updated;
  if (existingIndex >= 0) {
    updated = [...patients];
    updated[existingIndex] = { ...updated[existingIndex], ...newPatient, id: patId };
  } else {
    updated = [{ ...newPatient, id: patId }, ...patients];
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  try {
    window.dispatchEvent(new CustomEvent("aarogya_patient_updated", { detail: newPatient }));
  } catch {}
  return newPatient;
}

export function updatePatientReview(patientId, doctorData) {
  const patients = getAllPatients();
  const cleanId = String(patientId).trim().toUpperCase();
  const updated = patients.map((p) => {
    if (
      p.id?.toUpperCase() === cleanId ||
      p.altId?.toUpperCase() === cleanId ||
      (cleanId.includes("8921") && p.id?.includes("8921"))
    ) {
      return {
        ...p,
        status: "Reviewed",
        doctorReview: {
          doctorName: doctorData.doctorName || "Dr. Sandeep Roy (Medical Officer)",
          facility: doctorData.facility || "Bishalgarh Community Health Centre",
          notes: doctorData.notes || "",
          prescription: doctorData.prescription || "",
          prescriptionsList: doctorData.prescriptionsList || p.prescriptions || [],
          reviewedAt: doctorData.reviewedAt || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      };
    }
    return p;
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

  const savedPatient = updated.find(
    (p) =>
      p.id?.toUpperCase() === cleanId ||
      p.altId?.toUpperCase() === cleanId ||
      (cleanId.includes("8921") && p.id?.includes("8921"))
  );

  // Sync active user if matching
  try {
    const active = localStorage.getItem("aarogyaVaaniActiveUser");
    if (active && savedPatient) {
      const parsed = JSON.parse(active);
      const activeId = parsed.patient_ref || parsed.patientId || parsed.id;
      if (activeId?.toUpperCase() === cleanId || (cleanId.includes("8921") && activeId?.includes("8921"))) {
        localStorage.setItem("aarogyaVaaniActiveUser", JSON.stringify(savedPatient));
      }
    }
    window.dispatchEvent(new CustomEvent("aarogya_patient_updated", { detail: savedPatient }));
  } catch {}

  return savedPatient;
}

export function generatePatientId() {
  const randNum = Math.floor(1000 + Math.random() * 9000);
  return `AV-2026-${randNum}`;
}

