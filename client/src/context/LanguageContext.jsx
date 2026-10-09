import React, { createContext, useContext, useState, useEffect } from "react";

const LanguageContext = createContext();

export const TRANSLATIONS = {
  en: {
    // Brand & Header
    govTitle: "National Health Mission",
    nhmTitle: "National Health Mission",
    deptTitle: "Department of Health & Family Welfare",
    brandName: "AarogyaVaani",
    online: "Online",
    offlineMode: "Offline Mode",
    alerts: "Emergency Alerts",
    back: "Back",
    dashboard: "Dashboard",
    staff: "Staff",

    // Roles & Facilities
    healthWorker: "ASHA / ANM Health Worker",
    doctor: "Medical Officer (Doctor)",
    facilityDefault: "Bishalgarh CHC, Sepahijala",

    // Landing Page
    landingTitle: "Voice-First Offline Clinical Intake",
    landingSubtitle: "Designed for Primary Health Centres (PHCs) & Rural Sub-Centres",
    landingDesc: "Captures complete patient medical and antenatal histories before consultation, running 100% offline and triaging maternal danger signs immediately.",
    startIntake: "Start Voice Intake",
    startIntakeSub: "Maternal Antenatal & Outpatient",
    doctorPortal: "Doctor Review Portal",
    doctorPortalSub: "Clinical Charts & EMR Approval",
    dangerTriage: "Emergency Danger Triage",
    dangerTriageSub: "Nurse Red-Flag Safety Queue",
    syncCenter: "Offline Sync Center",
    syncCenterSub: "ABDM Gateway & Local Database",
    numbersTitle: "Rural Primary Healthcare Challenges",
    numbersDesc: "Verified metrics from Census, NFHS-5, and NHSRC rural health dossiers.",
    statConsultation: "Average Consultation Time",
    statConsultationSub: "Only ~2 minutes per patient",
    statRural: "Rural Population",
    statRuralSub: "73.8% of citizens live in rural areas",
    statLanguage: "Primary Mother Tongues",
    statLanguageSub: "Native Bengali, Hindi & Regional Languages",
    statInstitutional: "Public Facility Deliveries",
    statInstitutionalSub: "90.7% deliveries happen in public hospitals",
    statAshas: "ASHA Network in Place",
    statAshasSub: "Over 7,000 Frontline Health Workers active",
    statOffline: "Zero Internet Needed",
    statOfflineSub: "100% functional on offline tablets",
    workflowTitle: "How an Intake Visit Works",
    workflowDesc: "Simple four-step guided flow for patient and health worker.",
    step1Title: "Language & Audio Consent",
    step1Desc: "Short spoken audio prompt explains data privacy under DPDP Act 2023. Patient consents by voice or touch.",
    step2Title: "Voice & Touch Questions",
    step2Desc: "Questions are spoken aloud in mother tongue. Answer naturally by voice or by tapping big pictures.",
    step3Title: "Real-Time Danger Triage",
    step3Desc: "Fixed medical rules check every answer. Severe signs (preeclampsia, bleeding) alert the nurse instantly.",
    step4Title: "Doctor Summary & ABDM Sync",
    step4Desc: "Structured draft is reviewed and signed by the doctor, read back to the patient, and synced when online.",

    // Login Page
    loginTitle: "Staff Portal Access",
    loginDesc: "Select designation and health centre to access the clinical intake kiosk.",
    selectRole: "1. Select Designation",
    ashaDesc: "Patient intake, voice guidance, and danger-sign triage assistance.",
    docDesc: "Clinical review, summary edits, digital sign-off, and eSanjeevani handoff.",
    selectDistrict: "District",
    selectFacility: "Health Facility",
    staffId: "Staff Health ID",
    pin: "4-Digit Security PIN",
    loginButton: "Enter Kiosk Dashboard",
    offlineNotice: "This kiosk operates fully without internet. Records sync automatically once network returns.",

    // Dashboard
    dashboardTitle: "PHC Kiosk Dashboard",
    todayIntake: "Today's Intakes",
    todayIntakeSub: "Patient sessions completed today",
    pendingReview: "Pending Reviews",
    pendingReviewSub: "Awaiting Medical Officer sign-off",
    urgentAlerts: "Urgent Red Flags",
    urgentAlertsSub: "Critical maternal danger signs",
    offlineRecords: "Waiting to Sync",
    offlineRecordsSub: "Stored safely on this tablet",
    recentIntakes: "Recent Patient Intakes",
    newPatientBtn: "New Patient Intake",
    viewAll: "View All",

    // New Patient
    newPatientTitle: "New Patient Registration",
    newPatientDesc: "Register basic patient identity. An ASHA or ANM can assist non-literate patients.",
    clinicalModule: "Clinical Intake Module",
    maternalModule: "Maternal & Antenatal (ANC)",
    maternalModuleSub: "Flagship pregnancy screening, fetal movement, preeclampsia & bleeding danger signs.",
    generalModule: "General Outpatient (OPD)",
    generalModuleSub: "Pain assessment (SOCRATES), fever, cough, blood pressure, and chronic illnesses.",
    ashaAssistMode: "ASHA Health Worker Assist Mode",
    ashaAssistDesc: "ASHA guides the patient and enters touch responses.",
    abhaId: "ABHA Health Account ID",
    rchId: "RCH / MCP Mother-Child Card Number",
    fullName: "Patient Full Name",
    age: "Age (Years)",
    phone: "Mobile Phone",
    village: "Village / Para",
    proceedConsent: "Proceed to Audio Consent",

    // Consent
    consentTitle: "Patient Informed Audio Consent",
    consentDesc: "Digital Personal Data Protection (DPDP) Act 2023 Compliance",
    listenNotice: "Listen to the audio explanation to give consent:",
    audioNoticeText: "Hello. Your health information is being recorded solely for the doctor's consultation. All data remains encrypted on this device. Do you agree to proceed?",
    playAudio: "Play Audio Explanation",
    pauseAudio: "Pause Audio",
    playingAudio: "Playing aloud...",
    rule1Title: "No Automated Diagnosis",
    rule1Desc: "The app never makes a diagnosis. The doctor reviews and approves everything.",
    rule2Title: "Audio Automatically Purged",
    rule2Desc: "Raw voice recordings are transient and deleted once the intake is saved.",
    rule3Title: "Withdrawable Anytime",
    rule3Desc: "The patient can refuse or withdraw consent at any time.",
    giveConsent: "I Give Consent",
    declineConsent: "Decline Consent",

    // Interview
    interviewTitle: "Voice & Touch Intake",
    interviewSubtitle: "Guided Antenatal Clinical Interview",
    listenQuestion: "Listen to Question",
    speakAnswer: "Tap to Speak Answer",
    listening: "Listening now...",
    yes: "Yes",
    no: "No",
    next: "Next Question",
    finish: "Finish Interview",

    // Danger Check
    dangerCheckTitle: "Automated Safety Check",
    dangerCheckSubtitle: "Rule-Based Clinical Triage & Red-Flag Screening",
    dangerDetected: "Urgent Danger Signs Detected!",
    dangerDetectedDesc: "Medical safety rules identified emergency symptoms requiring immediate nurse attention.",
    dangerClear: "No Emergency Danger Signs Detected",
    dangerClearDesc: "Patient is clear for routine doctor consultation.",
    continueSummary: "Continue to Clinical Summary",

    // Danger Alerts
    dangerAlertsTitle: "Emergency Red-Flag Triage",
    dangerAlertsSubtitle: "Maternal Danger Alert & Nurse Response Queue",
    testSiren: "Test Nurse Buzzer",
    silenceSiren: "Silence Siren",
    acknowledge: "Acknowledge Alert",
    acknowledged: "Nurse Acknowledged",
    dial108: "Dial 108 Ambulance",
    allocateBed: "Allocate Emergency Bed",
    openChart: "Open Clinical Chart",

    // Doctor Review
    doctorReviewTitle: "Doctor Clinical Review & Sign-Off",
    doctorReviewSubtitle: "Medical Officer Evaluation & EMR Approval",
    chiefComplaint: "1. Chief Complaint",
    hpi: "2. History of Present Illness & Pregnancy Info",
    pastHistory: "3. Past Medical & Obstetric History",
    medicinesAllergies: "4. Current Medicines & Allergies",
    doctorPlan: "5. Doctor's Clinical Plan & Prescription",
    readBack: "Audio Read-Back to Patient",
    readBackStopping: "Stop Read-Back",
    approveSign: "Approve & Digitally Sign",
    teleconsultHandoff: "Handoff to eSanjeevani Teleconsultation",
    printSlip: "Print Clinical Summary",

    // Sync Status
    syncTitle: "Offline Data & ABDM Cloud Sync",
    syncSubtitle: "National Digital Health Mission Gateway Status",
    localReady: "Local Database Ready",
    recordsWaiting: "Records Waiting",
    recordsSynced: "Synced to Cloud",
    syncNow: "Sync All Records to ABDM",
    syncing: "Syncing Records...",
    allSynced: "All Records Synced",
    toggleOffline: "Simulate Offline Mode",
    toggleOnline: "Switch to Online Mode",

    // Patients & Details
    patientsTitle: "Patient Registry Directory",
    patientsSubtitle: "Primary Health Centre Patient Register",
    searchPlaceholder: "Search by Name, ABHA ID, or Village...",
    allPatients: "All Patients",
    urgent: "Urgent",
    completed: "Completed",
    pending: "Pending Review",
    profileTitle: "Patient Health Record Profile",
    gestationalWeeks: "Gestational Age",
    bloodPressure: "Blood Pressure",
    hemoglobin: "Hemoglobin",
    fetalHeartRate: "Fetal Heart Rate",
    ancTimeline: "ANC Visit Timeline",
    medications: "Prescribed Medications",

    // Reports OCR
    reportsTitle: "Prescription & MCP Card OCR",
    reportsSubtitle: "Intelligent Document Capture & Extraction",
    scanButton: "Scan / Upload Document",
    extractedMeds: "Extracted Medications",
    extractedLabs: "Extracted Lab Results",
    attachToChart: "Attach to Doctor Review",

    // Settings
    settingsTitle: "Kiosk & System Settings",
    settingsSubtitle: "Language, Speech Rate, and Accessibility",
    saveSettings: "Save Settings",
    clearCache: "Clear Local Cache",
    largeText: "Large Text Mode",
    highContrast: "High Contrast Mode",
    voiceSpeed: "Voice Playback Speed",

    // Summary
    summaryTitle: "Patient Intake Summary",
    summarySubtitle: "Structured Clinical Intake Responses & Flags",
    structuredHistory: "Structured History",
    interviewResponses: "Interview Responses",
    continueDoctorReview: "Continue to Doctor Review",
    urgentFlagPresent: "Urgent Safety Flag Present",
    noDangerFlagged: "No Danger Signs Flagged",
    intakeType: "Intake Type",

    // Active Sessions
    activeSessionsTitle: "Active Kiosk Sessions",
    activeSessionsSubtitle: "In-Progress Offline Patient Intakes on this Tablet",
    activeNow: "Active Now",
    resumeIntake: "Resume Voice Intake",
    discardSession: "Discard Session",
    noActiveSessions: "No active sessions in progress",
    startNewIntake: "Start New Patient Intake",

    // Staff ID
    staffIdTitle: "Staff Digital Health ID",
    staffIdSubtitle: "National Health Mission Tripura Healthcare Workforce Registry",
    verifiedStaff: "Verified NHM Healthcare Staff",
    printIdCard: "Print Health ID Card",
    viewProfile: "View Profile",
  },

  bn: {
    // Brand & Header
    govTitle: "জাতীয় স্বাস্থ্য মিশন",
    nhmTitle: "জাতীয় স্বাস্থ্য মিশন",
    deptTitle: "স্বাস্থ্য ও পরিবার কল্যাণ দপ্তর",
    brandName: "আরোগ্যবাণী",
    online: "অনলাইন",
    offlineMode: "অফলাইন মোড",
    alerts: "জরুরী সতর্কতা",
    back: "পেছনে",
    dashboard: "ড্যাশবোর্ড",
    staff: "কর্মী",

    // Roles & Facilities
    healthWorker: "আশা / এএনএম স্বাস্থ্যকর্মী",
    doctor: "মেডিকেল অফিসার (চিকিৎসক)",
    facilityDefault: "বিশালগড় সিএইচসি, সিপাহীজলা",

    // Landing Page
    landingTitle: "ভয়েস-ভিত্তিক অফলাইন ক্লিনিক্যাল ইনটেক",
    landingSubtitle: "প্রাথমিক স্বাস্থ্যকেন্দ্র (PHC) ও গ্রামীণ সাব-সেন্টারের জন্য তৈরি",
    landingDesc: "ডাক্তারবাবুর পরামর্শের পূর্বেই গর্ভবতী ও অন্যান্য রোগীর সম্পূর্ণ ইতিহাস রেকর্ড করে এবং অবিলম্বে বিপদ লক্ষণ শনাক্ত করে।",
    startIntake: "রোগীর ভয়েস পরীক্ষা",
    startIntakeSub: "গর্ভকালীন ও সাধারণ রোগী ইনটেক",
    doctorPortal: "চিকিৎসক পোর্টাল",
    doctorPortalSub: "ক্লিনিক্যাল চার্ট ও অনুমোদন",
    dangerTriage: "জরুরী বিপদ ট্রায়াজ",
    dangerTriageSub: "নার্স রেড-ফ্ল্যাগ সেফটি কিউ",
    syncCenter: "অফলাইন সিঙ্ক সেন্টার",
    syncCenterSub: "আয়ুষ্মান ভারত ও লোকাল ডাটাবেস",
    numbersTitle: "গ্রামীণ প্রাথমিক স্বাস্থ্য ব্যবস্থার চ্যালেঞ্জ",
    numbersDesc: "জনগণনা, এনএফএইচএস-৫ এবং এনএইচএসআরসি প্রতিবেদনের তথ্য।",
    statConsultation: "গড় পরামর্শ সময়",
    statConsultationSub: "রোগী প্রতি মাত্র ~২ মিনিট",
    statRural: "গ্রামীণ জনসংখ্যা",
    statRuralSub: "৭৩.৮% মানুষ গ্রামে বসবাস করেন",
    statLanguage: "প্রধান মাতৃভাষা",
    statLanguageSub: "বাংলা, হিন্দি ও স্থানীয় আঞ্চলিক ভাষা",
    statInstitutional: "সরকারি কেন্দ্রে প্রসব",
    statInstitutionalSub: "৯০.৭% প্রসব সরকারি হাসপাতালে হয়",
    statAshas: "স্বাস্থ্যকর্মী নেটওয়ার্ক",
    statAshasSub: "৭,০০০ এর বেশি স্বাস্থ্যকর্মী সক্রিয়",
    statOffline: "ইন্টারনেট প্রয়োজন নেই",
    statOfflineSub: "১০০% অফলাইন ট্যাবলেটে কার্যকর",
    workflowTitle: "কিয়স্ক যেভাবে কাজ করে",
    workflowDesc: "রোগী ও স্বাস্থ্যকর্মীর জন্য সহজ ৪-ধাপের প্রক্রিয়া।",
    step1Title: "ভাষা ও অডিও সম্মতি",
    step1Desc: "ডিপিডিপি আইন ২০২৩ এর অধীনে অডিও শুনে ভয়েস বা স্পর্শে সম্মতি জানান।",
    step2Title: "ভয়েস ও ছবি ভিত্তিক প্রশ্ন",
    step2Desc: "প্রতিটি প্রশ্ন বাংলায় বলা হয়। মুখে কথা বলে বা বড় ছবিতে স্পর্শ করে উত্তর দিন।",
    step3Title: "তাৎক্ষণিক বিপদ লক্ষণ ট্রায়াজ",
    step3Desc: "তীব্র মাথাব্যথা বা রক্তপাতের মতো লক্ষণ দেখা দিলে সঙ্গে সঙ্গে নার্সকে সতর্ক করে।",
    step4Title: "ডাক্তারের রিপোর্ট ও ক্লাউড সিঙ্ক",
    step4Desc: "ডাক্তারবাবু কয়েক সেকেন্ডে রিপোর্ট দেখে সই করেন এবং অনলাইনে গেলে সিঙ্ক হয়।",

    // Login Page
    loginTitle: "অফিসিয়াল স্টাফ লগইন",
    loginDesc: "স্বাস্থ্য কিয়স্কে প্রবেশ করতে পদবী এবং স্বাস্থ্য কেন্দ্র নির্বাচন করুন।",
    selectRole: "১. পদবী নির্বাচন করুন",
    ashaDesc: "রোগী ইনটেক, ভয়েস প্রশ্ন পরিচালনা এবং বিপদ সংকেত সতর্কতা।",
    docDesc: "ক্লিনিক্যাল হিস্ট্রি সম্পাদনা, ডিজিটাল স্বাক্ষর এবং ই-সঞ্জীবনী হস্তান্তর।",
    selectDistrict: "জেলা",
    selectFacility: "স্বাস্থ্য কেন্দ্র",
    staffId: "স্টাফ হেলথ আইডি",
    pin: "৪-সংখ্যার নিরাপত্তা পিন",
    loginButton: "কিয়স্ক ড্যাশবোর্ডে প্রবেশ করুন",
    offlineNotice: "এই কিয়স্ক ইন্টারনেট ছাড়াই পুরোপুরি চলে। নেটওয়ার্ক ফিরলে তথ্য স্বয়ংক্রিয়ভাবে ক্লাউডে সিঙ্ক হবে।",

    // Dashboard
    dashboardTitle: "স্বাস্থ্যকেন্দ্র কিয়স্ক ড্যাশবোর্ড",
    todayIntake: "আজকের মোট রোগী",
    todayIntakeSub: "আজকে সম্পন্ন হওয়া সেশন",
    pendingReview: "পর্যালোচনা বাকী",
    pendingReviewSub: "চিকিৎসকের অনুমোদনের অপেক্ষায়",
    urgentAlerts: "জরুরী বিপদ সতর্কতা",
    urgentAlertsSub: "চিহ্নিত গর্ভকালীন বিপদ লক্ষণ",
    offlineRecords: "সিঙ্ক অপেক্ষমান",
    offlineRecordsSub: "এই ট্যাবলেটে সংরক্ষিত রয়েছে",
    recentIntakes: "সাম্প্রতিক রোগী তালিকা",
    newPatientBtn: "নতুন রোগী নিবন্ধন",
    viewAll: "সমস্ত দেখুন",

    // New Patient
    newPatientTitle: "নতুন রোগী নিবন্ধন",
    newPatientDesc: "রোগীর মৌলিক তথ্য লিখুন। অশিক্ষিত রোগীর ক্ষেত্রে আশা কর্মী সাহায্য করবেন।",
    clinicalModule: "ক্লিনিক্যাল মডিউল নির্বাচন",
    maternalModule: "গর্ভকালীন সেবা (ANC)",
    maternalModuleSub: "গর্ভের মাস, শিশুর নড়াচড়া, রক্তচাপ ও রক্তপাত পরীক্ষা।",
    generalModule: "সাধারণ বহির্বিভাগ (OPD)",
    generalModuleSub: "ব্যথা (SOCRATES), জ্বর, কাশি ও রক্তচাপ পরীক্ষা।",
    ashaAssistMode: "আশা স্বাস্থ্যকর্মী সহায়তা মোড",
    ashaAssistDesc: "আশা কর্মী রোগীর পাশে বসে প্রশ্ন ও স্পর্শ পরিচালনা করবেন।",
    abhaId: "আভা (ABHA) হেলথ আইডি",
    rchId: "মা ও শিশু সুরক্ষা কার্ড (RCH) নম্বর",
    fullName: "রোগীর পুরো নাম",
    age: "বয়স (বছর)",
    phone: "মোবাইল নম্বর",
    village: "গ্রাম / পাড়া",
    proceedConsent: "সম্মতি ও পরীক্ষায় এগিয়ে যান",

    // Consent
    consentTitle: "রোগীর অডিও সম্মতি",
    consentDesc: "ডিজিটাল পার্সোনাল ডেটা প্রটেকশন (DPDP) আইন ২০২৩ মান্যতা",
    listenNotice: "সম্মতি প্রদানের জন্য অডিও বার্তাটি শুনুন:",
    audioNoticeText: "নমস্কার। আপনার স্বাস্থ্য পরীক্ষা এবং ডাক্তারের সুবিধার জন্য তথ্য রেকর্ড করা হচ্ছে। এই তথ্য সম্পূর্ণ গোপন থাকবে। আপনি কি সম্মত আছেন?",
    playAudio: "অডিও বার্তা শুনুন",
    pauseAudio: "অডিও থামান",
    playingAudio: "অডিও বাজছে...",
    rule1Title: "কোনো স্বয়ংক্রিয় রোগ নির্ণয় নয়",
    rule1Desc: "অ্যাপ নিজে রোগ নির্ণয় করে না, ডাক্তারবাবু সবকিছু খতিয়ে দেখবেন।",
    rule2Title: "অডিও স্বয়ংক্রিয় মুছে ফেলা",
    rule2Desc: "রেকর্ড সংরক্ষিত হলে ভয়েস অডিও স্থায়ীভাবে মুছে ফেলা হয়।",
    rule3Title: "যে কোনো সময় প্রত্যাহার",
    rule3Desc: "রোগী যেকোনো সময় সম্মতি প্রত্যাহার করতে পারেন।",
    giveConsent: "আমি সম্মত আছি",
    declineConsent: "সম্মতি প্রত্যাহার",

    // Interview
    interviewTitle: "ভয়েস ও স্পর্শ পরীক্ষা",
    interviewSubtitle: "গর্ভকালীন ক্লিনিক্যাল ইন্টারভিউ",
    listenQuestion: "প্রশ্নটি শুনুন",
    speakAnswer: "কথা বলে উত্তর দিন",
    listening: "শুনছি...",
    yes: "হ্যাঁ",
    no: "না",
    next: "পরবর্তী প্রশ্ন",
    finish: "পরীক্ষা সম্পন্ন",

    // Danger Check
    dangerCheckTitle: "স্বয়ংক্রিয় সুরক্ষা চেক",
    dangerCheckSubtitle: "নিয়ম-ভিত্তিক রেড-ফ্ল্যাগ স্ক্রীনিং",
    dangerDetected: "জরুরী বিপদ লক্ষণ চিহ্নিত!",
    dangerDetectedDesc: "চিকিৎসা নির্দেশিকা অনুযায়ী অবিলম্বে নার্স বা ডাক্তারের মনোযোগ প্রয়োজন।",
    dangerClear: "কোনো বিপদ লক্ষণ পাওয়া যায়নি",
    dangerClearDesc: "রোগী স্বাভাবিক ডাক্তার পর্যালোচনার জন্য প্রস্তুত।",
    continueSummary: "রোগীর সারসংক্ষেপে যান",

    // Danger Alerts
    dangerAlertsTitle: "জরুরী বিপদ লক্ষণ ট্রায়াজ",
    dangerAlertsSubtitle: "মায়ের বিপদ সংকেত ও নার্স রেসপন্স কিউ",
    testSiren: "বাজার পরীক্ষা করুন",
    silenceSiren: "বাজার বন্ধ করুন",
    acknowledge: "স্বীকৃতি দিন",
    acknowledged: "নার্স স্বীকৃতি দিয়েছেন",
    dial108: "১০৮ অ্যাম্বুলেন্স কল",
    allocateBed: "লেবার বেড বরাদ্দ",
    openChart: "ক্লিনিক্যাল চার্ট খুলুন",

    // Doctor Review
    doctorReviewTitle: "চিকিৎসক পর্যালোচনা ও অনুমোদন",
    doctorReviewSubtitle: "মেডিকেল অফিসার মূল্যায়ন ও ডিজিটাল স্বাক্ষর",
    chiefComplaint: "১. প্রধান উপসর্গ",
    hpi: "২. বর্তমান রোগের ইতিহাস ও গর্ভকালীন তথ্য",
    pastHistory: "৩. পূর্ববর্তী রোগ ও প্রসব ইতিহাস",
    medicinesAllergies: "৪. বর্তমান ঔষধ ও অ্যালার্জি",
    doctorPlan: "৫. চিকিৎসকের সিদ্ধান্ত ও ব্যবস্থা",
    readBack: "রোগীকে বাংলায় পড়ে শোনান",
    readBackStopping: "শোনানো থামান",
    approveSign: "অনুমোদন ও ডিজিটাল স্বাক্ষর",
    teleconsultHandoff: "ই-সঞ্জীবনী টেলিমেডিসিনে প্রেরণ",
    printSlip: "প্রেসক্রিপশন প্রিন্ট",

    // Sync Status
    syncTitle: "অফলাইন ডেটা ও ক্লাউড সিঙ্ক",
    syncSubtitle: "জাতীয় ডিজিটাল স্বাস্থ্য মিশন গেটওয়ে স্থিতি",
    localReady: "লোকাল ডাটাবেস প্রস্তুত",
    recordsWaiting: "রেকর্ড অপেক্ষমান",
    recordsSynced: "ক্লাউডে সংরক্ষিত",
    syncNow: "এখনই সিঙ্ক করুন",
    syncing: "সিঙ্ক হচ্ছে...",
    allSynced: "সব রেকর্ড সিঙ্ক সম্পন্ন",
    toggleOffline: "অফলাইন মোড সিমুলেট",
    toggleOnline: "অনলাইন মোডে ফিরুন",

    // Patients & Details
    patientsTitle: "রোগী রেজিস্টার",
    patientsSubtitle: "প্রাথমিক স্বাস্থ্যকেন্দ্রের রোগী তালিকা",
    searchPlaceholder: "নাম, আভা আইডি বা গ্রাম দিয়ে খুঁজুন...",
    allPatients: "সমস্ত রোগী",
    urgent: "জরুরী",
    completed: "সম্পন্ন",
    pending: "পর্যালোচনা বাকী",
    profileTitle: "রোগীর স্বাস্থ্য রেকর্ড প্রোফাইল",
    gestationalWeeks: "গর্ভকালীন সপ্তাহ",
    bloodPressure: "রক্তচাপ",
    hemoglobin: "হিমোগ্লোবিন",
    fetalHeartRate: "ভ্রূণের হৃদস্পন্দন",
    ancTimeline: "পূর্ববর্তী চেকআপ হিস্ট্রি",
    medications: "নির্ধারিত ঔষধ",

    // Reports OCR
    reportsTitle: "প্রেসক্রিপশন ও কার্ড স্ক্যানার",
    reportsSubtitle: "হাতে লেখা প্রেসক্রিপশন ও ল্যাব ডেটা স্ক্যান",
    scanButton: "ডকুমেন্ট স্ক্যান / আপলোড",
    extractedMeds: "শনাক্তকৃত ঔষধ",
    extractedLabs: "শনাক্তকৃত ল্যাব রিপোর্ট",
    attachToChart: "ডাক্তারের চার্টে যুক্ত করুন",

    settingsTitle: "কিয়স্ক সেটিংস",
    settingsSubtitle: "ভাষা, ভয়েস গতি ও অ্যাক্সেসিবিলিটি",
    saveSettings: "সেটিংস সংরক্ষণ",
    clearCache: "ক্যাশে মুছে ফেলুন",
    largeText: "বড় লেখা মোড",
    highContrast: "উচ্চ বৈসাদৃশ্য মোড",
    voiceSpeed: "ভয়েস পড়ার গতি",

    // Summary
    summaryTitle: "রোগীর সারসংক্ষেপ",
    summarySubtitle: "গঠনমূলক ক্লিনিক্যাল ইনটেক তথ্য ও বিপদ সংকেত",
    structuredHistory: "সংগঠিত ইতিহাস",
    interviewResponses: "ইন্টারভিউ উত্তরসমূহ",
    continueDoctorReview: "ডাক্তার পর্যালোচনায় যান",
    urgentFlagPresent: "জরুরী সুরক্ষা সতর্কতা বিদ্যমান",
    noDangerFlagged: "কোনো বিপদ লক্ষণ পাওয়া যায়নি",
    intakeType: "ইনটেক ধরন",

    // Active Sessions
    activeSessionsTitle: "চলমান সেশন ও ইন্টারভিউ",
    activeSessionsSubtitle: "এই ট্যাবলেটে সংরক্ষিত চলমান রোগী ইনটেক",
    activeNow: "বর্তমানে সক্রিয়",
    resumeIntake: "ভয়েস ইনটেক পুনরায় শুরু করুন",
    discardSession: "সেশন বাতিল করুন",
    noActiveSessions: "কোনো চলমান সেশন নেই",
    startNewIntake: "নতুন রোগী ইনটেক শুরু করুন",

    // Staff ID
    staffIdTitle: "স্বাস্থ্যকর্মী পরিচয়পত্র",
    staffIdSubtitle: "জাতীয় স্বাস্থ্য মিশন ত্রিপুরা ওয়ার্কফোর্স রেজিস্ট্রি",
    verifiedStaff: "যাচাইকৃত এনএইচএম স্বাস্থ্যকর্মী",
    printIdCard: "পরিচয়পত্র প্রিন্ট করুন",
    viewProfile: "প্রোফাইল দেখুন",
  },

  hi: {
    // Brand & Header
    govTitle: "राष्ट्रीय स्वास्थ्य मिशन",
    nhmTitle: "राष्ट्रीय स्वास्थ्य मिशन",
    deptTitle: "स्वास्थ्य एवं परिवार कल्याण विभाग",
    brandName: "आरोग्यवाणी",
    online: "ऑनलाइन",
    offlineMode: "ऑफलाइन मोड",
    alerts: "आपातकालीन अलर्ट",
    back: "पीछे",
    dashboard: "डैशबोर्ड",
    staff: "स्टाफ",

    healthWorker: "आशा / एएनएम स्वास्थ्य कार्यकर्ता",
    doctor: "चिकित्सा अधिकारी (डॉक्टर)",
    facilityDefault: "बिशालगढ़ सीएचसी, सिपाहीजला",

    landingTitle: "वॉइस-फर्स्ट ऑफलाइन क्लीनिकल इनटेक",
    landingSubtitle: "प्राथमिक स्वास्थ्य केंद्रों (PHC) व ग्रामीण उप-केंद्रों के लिए",
    landingDesc: "डॉक्टर के परामर्श से पहले गर्भवती और अन्य मरीजों का पूरा इतिहास दर्ज करता है और खतरे के लक्षणों को तुरंत पहचानता है।",
    startIntake: "मरीज की वॉइस जांच शुरू करें",
    startIntakeSub: "गर्भावस्था व सामान्य ओपीडी इनटेक",
    doctorPortal: "डॉक्टर समीक्षा पोर्टल",
    doctorPortalSub: "क्लीनिकल चार्ट व डिजिटल हस्ताक्षर",
    dangerTriage: "आपातकालीन डेंजर ट्रायज",
    dangerTriageSub: "नर्स रेड-फ्लैग सुरक्षा कतार",
    syncCenter: "ऑफलाइन सिंक केंद्र",
    syncCenterSub: "आयुष्मान भारत व लोकल डेटाबेस",
    numbersTitle: "ग्रामीण प्राथमिक स्वास्थ्य व्यवस्था की चुनौतियां",
    numbersDesc: "जनगणना, एनएफएचएस-5 और एनएचएसआरसी के सत्यापित आंकड़े।",
    statConsultation: "औसत परामर्श समय",
    statConsultationSub: "प्रति मरीज केवल ~2 मिनट",
    statRural: "ग्रामीण आबादी",
    statRuralSub: "73.8% आबादी ग्रामीण क्षेत्रों में",
    statLanguage: "प्रमुख मातृभाषाएं",
    statLanguageSub: "हिंदी, बंगाली व स्थानीय क्षेत्रीय भाषाएं",
    statInstitutional: "सरकारी केंद्रों में प्रसव",
    statInstitutionalSub: "90.7% प्रसव सरकारी अस्पतालों में",
    statAshas: "सक्रिय स्वास्थ्य कार्यकर्ता नेटवर्क",
    statAshasSub: "7,000 से अधिक स्वास्थ्य कार्यकर्ता सक्रिय",
    statOffline: "इंटरनेट की जरूरत नहीं",
    statOfflineSub: "100% ऑफलाइन टैबलेट पर सक्षम",
    workflowTitle: "कियोस्क कैसे काम करता है",
    workflowDesc: "मरीज और आशा कार्यकर्ता के लिए आसान 4-चरणीय प्रक्रिया।",
    step1Title: "भाषा और ऑडियो सहमति",
    step1Desc: "डीपीडीपी कानून 2023 के तहत आवाज सुनकर आवाज या स्पर्श से सहमति दें।",
    step2Title: "आवाज और चित्र आधारित सवाल",
    step2Desc: "सवाल आवाज में पूछे जाते हैं। बोलकर या चित्रों पर टैप करके जवाब दें।",
    step3Title: "तत्काल खतरे के लक्षण अलर्ट",
    step3Desc: "तेज सिरदर्द, ब्लीडिंग आदि खतरे के लक्षण दिखने पर तुरंत नर्स को अलर्ट भेजा जाता है।",
    step4Title: "डॉक्टर समीक्षा व क्लाउड सिंक",
    step4Desc: "डॉक्टर सारांश की समीक्षा करते हैं, मरीज को पढ़कर सुनाते हैं, और नेटवर्क पर सिंक होता है।",

    loginTitle: "स्टाफ लॉगिन पोर्टल",
    loginDesc: "कियोस्क में प्रवेश करने के लिए पद और स्वास्थ्य केंद्र चुनें।",
    selectRole: "1. पद चुनें",
    ashaDesc: "मरीज इनटेक, वॉइस सवाल और खतरे के लक्षणों की पहचान।",
    docDesc: "क्लीनिकल हिस्ट्री संपादन, डिजिटल हस्ताक्षर और ई-संजीवनी टेलीकंसल्ट।",
    selectDistrict: "जिला",
    selectFacility: "स्वास्थ्य केंद्र",
    staffId: "स्टाफ हेल्थ आईडी",
    pin: "4-अंकों का सुरक्षा पिन",
    loginButton: "कियोस्क डैशबोर्ड में प्रवेश करें",
    offlineNotice: "यह कियोस्क बिना इंटरनेट के पूरी तरह काम करता है।",

    dashboardTitle: "स्वास्थ्य केंद्र कियोस्क डैशबोर्ड",
    todayIntake: "आज के कुल मरीज",
    todayIntakeSub: "आज पूरे हुए सत्र",
    pendingReview: "समीक्षा लंबित",
    pendingReviewSub: "डॉक्टर की मंजूरी की प्रतीक्षा",
    urgentAlerts: "आपातकालीन खतरे",
    urgentAlertsSub: "गर्भावस्था खतरे के लक्षण",
    offlineRecords: "सिंक लंबित",
    offlineRecordsSub: "टैबलेट पर सुरक्षित संग्रहीत",
    recentIntakes: "हाल के मरीज",
    newPatientBtn: "नया मरीज पंजीकरण",
    viewAll: "सभी देखें",

    newPatientTitle: "नया मरीज पंजीकरण",
    newPatientDesc: "मरीज की बुनियादी जानकारी भरें।",
    clinicalModule: "क्लीनिकल मॉड्यूल चुनें",
    maternalModule: "मातृ एवं गर्भावस्था (ANC)",
    maternalModuleSub: "गर्भावस्था के महीने, हलचल, बीपी और खतरे के लक्षण।",
    generalModule: "सामान्य ओपीडी (OPD)",
    generalModuleSub: "दर्द (SOCRATES), बुखार, खांसी और बीपी जांच।",
    ashaAssistMode: "आशा कार्यकर्ता सहायता मोड",
    ashaAssistDesc: "आशा मरीज के साथ बैठकर स्क्रीन ऑपरेट करेंगी।",
    abhaId: "आभा (ABHA) हेल्थ आईडी",
    rchId: "आरसीएच / एमसीपी कार्ड नंबर",
    fullName: "मरीज का पूरा नाम",
    age: "उम्र (वर्ष)",
    phone: "मोबाइल नंबर",
    village: "गांव / पारा",
    proceedConsent: "ऑडियो सहमति पर आगे बढ़ें",

    consentTitle: "मरीज की ऑडियो सहमति",
    consentDesc: "डीपीडीपी कानून 2023 अनुपालन",
    listenNotice: "सहमति के लिए ऑडियो संदेश सुनें:",
    audioNoticeText: "नमस्ते। आपकी स्वास्थ्य जांच और डॉक्टर की सुविधा के लिए जानकारी दर्ज की जा रही है। यह जानकारी पूरी तरह सुरक्षित रहेगी। क्या आप सहमत हैं?",
    playAudio: "ऑडियो सुनें",
    pauseAudio: "ऑडियो रोकें",
    playingAudio: "ऑडियो बज रहा है...",
    rule1Title: "कोई स्वचालित निदान नहीं",
    rule1Desc: "ऐप कोई निदान नहीं बनाता, डॉक्टर सब जांचेंगे।",
    rule2Title: "ऑडियो स्वतः हटाना",
    rule2Desc: "इनटेक पूरा होते ही वॉइस ऑडियो हटा दिया जाता है।",
    rule3Title: "कभी भी वापस लेने योग्य",
    rule3Desc: "मरीज कभी भी सहमति वापस ले सकता है।",
    giveConsent: "मैं सहमत हूँ",
    declineConsent: "सहमति अस्वीकार",

    interviewTitle: "वॉइस व टच जांच",
    interviewSubtitle: "गर्भावस्था क्लीनिकल इनटेक",
    listenQuestion: "सवाल सुनें",
    speakAnswer: "बोलकर जवाब दें",
    listening: "सुन रहे हैं...",
    yes: "हाँ",
    no: "नहीं",
    next: "अगला सवाल",
    finish: "जांच समाप्त",

    dangerCheckTitle: "स्वचालित सुरक्षा जांच",
    dangerCheckSubtitle: "नियम-आधारित खतरे की पहचान",
    dangerDetected: "खतरे के लक्षण पहचाने गए!",
    dangerDetectedDesc: "तुरंत नर्स या डॉक्टर का ध्यान अपेक्षित है।",
    dangerClear: "कोई खतरे का लक्षण नहीं मिला",
    dangerClearDesc: "मरीज सामान्य डॉक्टर समीक्षा के लिए तैयार है।",
    continueSummary: "मरीज सारांश पर जाएं",

    dangerAlertsTitle: "आपातकालीन डेंजर ट्रायज",
    dangerAlertsSubtitle: "मातृ खतरे के लक्षण व नर्स कतार",
    testSiren: "सायरन टेस्ट",
    silenceSiren: "सायरन बंद",
    acknowledge: "स्वीकृति दें",
    acknowledged: "नर्स द्वारा स्वीकृत",
    dial108: "108 एम्बुलेंस डायल",
    allocateBed: "लेबर बेड आवंटित",
    openChart: "क्लीनिकल चार्ट खोलें",

    doctorReviewTitle: "डॉक्टर समीक्षा व डिजिटल हस्ताक्षर",
    doctorReviewSubtitle: "चिकित्सा अधिकारी मूल्यांकन व अनुमोदन",
    chiefComplaint: "1. मुख्य समस्या",
    hpi: "2. वर्तमान बीमारी व गर्भावस्था जानकारी",
    pastHistory: "3. पिछला स्वास्थ्य व प्रसव इतिहास",
    medicinesAllergies: "4. वर्तमान दवाएं व एलर्जी",
    doctorPlan: "5. डॉक्टर का उपचार व निर्देश",
    readBack: "मरीज को पढ़कर सुनाएं",
    readBackStopping: "रोकें",
    approveSign: "अनुमोदन व डिजिटल हस्ताक्षर",
    teleconsultHandoff: "ई-संजीवनी टेलीकंसल्ट भेजें",
    printSlip: "पर्चा प्रिंट करें",

    syncTitle: "ऑफलाइन डेटा व क्लाउड सिंक",
    syncSubtitle: "राष्ट्रीय डिजिटल स्वास्थ्य मिशन गेटवे",
    localReady: "लोकल डेटाबेस तैयार",
    recordsWaiting: "प्रतीक्षारत रिकॉर्ड",
    recordsSynced: "क्लाउड पर सुरक्षित",
    syncNow: "अभी सिंक करें",
    syncing: "सिंक हो रहा है...",
    allSynced: "सभी रिकॉर्ड सिंक हो गए",
    toggleOffline: "ऑफलाइन मोड टेस्ट",
    toggleOnline: "ऑनलाइन मोड में आएं",

    patientsTitle: "मरीज रजिस्टर",
    patientsSubtitle: "प्राथमिक स्वास्थ्य केंद्र मरीज सूची",
    searchPlaceholder: "नाम, आभा आईडी या गांव खोजें...",
    allPatients: "सभी मरीज",
    urgent: "आपातकालीन",
    completed: "पूर्ण",
    pending: "समीक्षा लंबित",
    profileTitle: "मरीज स्वास्थ्य रिकॉर्ड प्रोफाइल",
    gestationalWeeks: "गर्भावस्था सप्ताह",
    bloodPressure: "रक्तचाप",
    hemoglobin: "हीमोग्लोबिन",
    fetalHeartRate: "शिशु हृदय गति",
    ancTimeline: "पिछली जांच टाइमलाइन",
    medications: "निर्धारित दवाएं",

    reportsTitle: "पर्चा व एमसीपी कार्ड स्कैनर",
    reportsSubtitle: "हस्तलिखित पर्चे व लैब परिणाम स्कैन",
    scanButton: "दस्तावेज़ स्कैन / अपलोड",
    extractedMeds: "पहचानी गई दवाएं",
    extractedLabs: "पहचाने गए लैब परिणाम",
    attachToChart: "डॉक्टर चार्ट में जोड़ें",

    settingsTitle: "कियोस्क सेटिंग्स",
    settingsSubtitle: "भाषा, आवाज गति व सुलभता",
    saveSettings: "सेटिंग्स सहेजें",
    clearCache: "कैश हटाएं",
    largeText: "बड़ा टेक्स्ट मोड",
    highContrast: "हाई कंट्रास्ट मोड",
    voiceSpeed: "आवाज की गति",

    // Summary
    summaryTitle: "मरीज का सारांश",
    summarySubtitle: "संरचित क्लीनिकल इनटेक जानकारी व खतरे के संकेत",
    structuredHistory: "संरचित इतिहास",
    interviewResponses: "पूछे गए प्रश्नों के उत्तर",
    continueDoctorReview: "डॉक्टर समीक्षा की ओर बढ़ें",
    urgentFlagPresent: "आपातकालीन सुरक्षा चेतावनी मौजूद",
    noDangerFlagged: "खतरे का कोई लक्षण नहीं मिला",
    intakeType: "इनटेक प्रकार",

    // Active Sessions
    activeSessionsTitle: "सक्रिय सत्र व इंटरव्यू",
    activeSessionsSubtitle: "इस टैबलेट पर प्रगति पर मरीज इनटेक",
    activeNow: "सक्रिय सत्र",
    resumeIntake: "वॉइस इनटेक पुनः शुरू करें",
    discardSession: "सत्र हटाएं",
    noActiveSessions: "कोई सक्रिय सत्र उपलब्ध नहीं है",
    startNewIntake: "नया मरीज इनटेक शुरू करें",

    // Staff ID
    staffIdTitle: "स्वास्थ्य कार्यकर्ता डिजिटल पहचान पत्र",
    staffIdSubtitle: "राष्ट्रीय स्वास्थ्य मिशन वर्कफोर्स रजिस्ट्री",
    verifiedStaff: "सत्यापित एनएचएम स्वास्थ्य कार्यकर्ता",
    printIdCard: "पहचान पत्र प्रिंट करें",
    viewProfile: "प्रोफाइल देखें",
  },

};


export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    const stored = localStorage.getItem("aarogyaVaaniLanguage");
    return stored === "kok" ? "en" : stored || "en";
  });

  const setLanguage = (langKey) => {
    const validLang = langKey === "kok" ? "en" : langKey;
    setLanguageState(validLang);
    localStorage.setItem("aarogyaVaaniLanguage", validLang);
    window.dispatchEvent(new Event("languageChange"));
  };

  useEffect(() => {
    const handleStorage = () => {
      const stored = localStorage.getItem("aarogyaVaaniLanguage");
      if (stored && stored !== language) {
        setLanguageState(stored);
      }
    };
    window.addEventListener("storage", handleStorage);
    window.addEventListener("languageChange", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("languageChange", handleStorage);
    };
  }, [language]);

  const t = (key) => {
    const currentDict = TRANSLATIONS[language] || TRANSLATIONS.en;
    return currentDict[key] || TRANSLATIONS.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
