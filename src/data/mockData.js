export const mockPatient = {
  id: "MRN-84920",
  name: "Sarah Jenkins",
  age: 58,
  gender: "Female",
  bloodGroup: "A+",
  height: "162 cm",
  weight: "74 kg",
  avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
  primaryDoctor: "Dr. Amanda Vance",
  emergencyContact: "+1 (555) 234-5678",
  currentToken: "A-047",
  queuePosition: 12,
  totalInQueue: 32,
  estimatedWaitMins: 18,
  opdDepartment: "Cardiology OPD",
  opdRoom: "Room 302 - West Wing",
  allergies: ["Penicillin", "Sulfa Drugs"],
  medicalHistory: ["Type 2 Diabetes (Diagnosed 2021)", "Hypertension", "Hyperlipidemia"],
  nextAppointment: {
    id: "APT-2026-089",
    date: "Tomorrow, Aug 14, 2026",
    time: "10:30 AM",
    doctor: "Dr. Amanda Vance",
    department: "Cardiology",
    hospital: "St. Jude Metropolitan Hospital",
    status: "Confirmed",
    prepInstructions: "Fast for 8 hours prior for blood work. Arrive 15 minutes early at Gate 3 with valid ID."
  }
};

export const mockClinicianPriorityPatients = [
  {
    mrn: "MRN-91204",
    name: "Robert Chen",
    age: 67,
    diseaseRiskScore: 92,
    diseaseRiskLevel: "High",
    readmissionRiskScore: 84,
    readmissionRiskLevel: "High",
    primaryCondition: "Acute Chest Pain & Severe BP",
    department: "Cardiology",
    vitals: { bp: "168/102 mmHg", bloodSugar: "215 mg/dL", hr: "104 bpm", spo2: "93%" },
    mainReasons: [
      { title: "Critical Systolic Blood Pressure", detail: "Systolic BP of 168 mmHg exceeds high risk threshold of 140 mmHg by +28 mmHg." },
      { title: "Elevated Fasting Blood Glucose", detail: "Glucose level of 215 mg/dL indicates uncontrolled metabolic state." },
      { title: "Age & Cardiac Pre-conditions", detail: "Age 67 with previous myocardial ischemia history." }
    ],
    triageUrgency: "Emergency",
    slotReserved: "09:00 AM (Priority Slot)"
  },
  {
    mrn: "MRN-84920",
    name: "Sarah Jenkins",
    age: 58,
    diseaseRiskScore: 78,
    diseaseRiskLevel: "High",
    readmissionRiskScore: 68,
    readmissionRiskLevel: "Medium",
    primaryCondition: "Type 2 Diabetes & Shortness of Breath",
    department: "Cardiology",
    vitals: { bp: "148/92 mmHg", bloodSugar: "186 mg/dL", hr: "88 bpm", spo2: "96%" },
    mainReasons: [
      { title: "Elevated Blood Glucose", detail: "Blood sugar level at 186 mg/dL elevates chronic diabetes complication risk." },
      { title: "Elevated Systolic Blood Pressure", detail: "Systolic BP 148 mmHg indicates Stage 2 hypertension." },
      { title: "Exertional Shortness of Breath", detail: "Recent onset of dyspnea during routine walking." }
    ],
    triageUrgency: "Urgent",
    slotReserved: "10:30 AM (Priority Slot)"
  },
  {
    mrn: "MRN-73419",
    name: "Marcus Vance",
    age: 62,
    diseaseRiskScore: 65,
    diseaseRiskLevel: "Medium",
    readmissionRiskScore: 72,
    readmissionRiskLevel: "High",
    primaryCondition: "Post-CHF Discharge Follow-up",
    department: "Cardiology",
    vitals: { bp: "135/85 mmHg", bloodSugar: "142 mg/dL", hr: "76 bpm", spo2: "97%" },
    mainReasons: [
      { title: "30-Day Post-Discharge Window", detail: "Discharged 12 days ago following CHF exacerbation." },
      { title: "Sub-optimal Medication Adherence", detail: "Self-reported missing 2 diuretics doses last week." }
    ],
    triageUrgency: "Urgent",
    slotReserved: "11:15 AM (Priority Slot)"
  },
  {
    mrn: "MRN-65821",
    name: "Elena Rostova",
    age: 44,
    diseaseRiskScore: 54,
    diseaseRiskLevel: "Medium",
    readmissionRiskScore: 32,
    readmissionRiskLevel: "Low",
    primaryCondition: "Frequent Dizziness & Fatigue",
    department: "Endocrinology",
    vitals: { bp: "124/80 mmHg", bloodSugar: "158 mg/dL", hr: "72 bpm", spo2: "98%" },
    mainReasons: [
      { title: "Postprandial Blood Glucose Elevation", detail: "158 mg/dL post-meal glucose." },
      { title: "Reported Chronic Fatigue", detail: "Fatigue persistent for > 2 weeks." }
    ],
    triageUrgency: "Standard",
    slotReserved: "01:30 PM"
  },
  {
    mrn: "MRN-52109",
    name: "David Miller",
    age: 35,
    diseaseRiskScore: 22,
    diseaseRiskLevel: "Low",
    readmissionRiskScore: 12,
    readmissionRiskLevel: "Low",
    primaryCondition: "Routine Annual Checkup",
    department: "General OPD",
    vitals: { bp: "118/76 mmHg", bloodSugar: "94 mg/dL", hr: "68 bpm", spo2: "99%" },
    mainReasons: [
      { title: "Optimal Vital Signs", detail: "All physiological vitals strictly within healthy baseline ranges." }
    ],
    triageUrgency: "Routine",
    slotReserved: "03:00 PM"
  }
];

export const mockMLRiskResults = {
  diseaseRisk: {
    level: "High Risk",
    score: 78,
    badgeClass: "badge-emergency",
    summary: "Moderate-to-high likelihood of cardiovascular exacerbation based on elevated blood sugar (186 mg/dL) and hypertension (148/92 mmHg)."
  },
  readmissionRisk: {
    level: "Medium Risk",
    score: 68,
    badgeClass: "badge-urgent",
    summary: "Estimated 68% probability of 30-day readmission without proactive medication adjustment and follow-up consultation."
  },
  mainReasons: [
    {
      id: "reason-1",
      title: "Elevated Blood Glucose Level (186 mg/dL)",
      impact: "+34% Risk",
      detail: "Fasting blood sugar of 186 mg/dL significantly exceeds normal threshold (70-99 mg/dL). High blood glucose causes vascular inflammation and accelerates arterial stiffening."
    },
    {
      id: "reason-2",
      title: "Stage 2 Systolic Blood Pressure (148 mmHg)",
      impact: "+26% Risk",
      detail: "Systolic blood pressure of 148 mmHg increases cardiac workload and raises 30-day risk of cardiovascular events."
    },
    {
      id: "reason-3",
      title: "Patient Age (58 years) & Co-morbidities",
      impact: "+18% Risk",
      detail: "Age 58 combined with existing Type 2 Diabetes and Hyperlipidemia diagnosis elevates baseline risk vector."
    },
    {
      id: "reason-4",
      title: "Reported Symptom: Exertional Shortness of Breath",
      impact: "+12% Risk",
      detail: "Tappable intake indicated shortness of breath during routine activity, warranting early clinical evaluation."
    }
  ]
};

export const mockDoctors = [
  {
    id: "doc-1",
    name: "Dr. Amanda Vance",
    specialty: "Senior Cardiologist",
    experience: "16+ Years Exp",
    hospital: "St. Jude Metropolitan Hospital",
    rating: 4.9,
    reviews: 480,
    fee: "$120",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200",
    availableSlots: ["09:00 AM (Priority)", "10:30 AM (Priority)", "02:00 PM", "04:15 PM"],
    onlineConsult: true
  },
  {
    id: "doc-2",
    name: "Dr. James Aris",
    specialty: "Endocrinologist & Diabetologist",
    experience: "14+ Years Exp",
    hospital: "City Heart & Metabolic Center",
    rating: 4.8,
    reviews: 360,
    fee: "$110",
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200",
    availableSlots: ["09:30 AM (Priority)", "11:15 AM", "03:30 PM"],
    onlineConsult: true
  },
  {
    id: "doc-3",
    name: "Dr. Maya Lin",
    specialty: "Internal Medicine Specialist",
    experience: "10+ Years Exp",
    hospital: "St. Jude Metropolitan Hospital",
    rating: 4.9,
    reviews: 290,
    fee: "$95",
    avatar: "https://images.unsplash.com/photo-1594824813570-889f81643c7b?auto=format&fit=crop&q=80&w=200",
    availableSlots: ["10:00 AM", "01:15 PM (Priority)", "04:45 PM"],
    onlineConsult: true
  }
];

export const mockAppointments = [
  {
    id: "apt-101",
    doctorName: "Dr. Amanda Vance",
    specialty: "Cardiologist",
    date: "Tomorrow, Aug 14",
    time: "10:30 AM",
    type: "In-Person Priority Visit",
    status: "Confirmed",
    isPriority: true,
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200"
  },
  {
    id: "apt-102",
    doctorName: "Dr. James Aris",
    specialty: "Endocrinologist",
    date: "Next Week, Aug 21",
    time: "02:15 PM",
    type: "Tele-Consultation",
    status: "Scheduled",
    isPriority: false,
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200"
  }
];

export const mockLiveQueueData = {
  token: "A-047",
  estimatedWaitMins: 18,
  queuePosition: 12,
  totalInQueue: 32,
  department: "Cardiology OPD - Room 302",
  doctor: "Dr. Amanda Vance",
  peopleAhead: 11,
  recentProgression: [
    { token: "A-044", status: "In Doctor Consultation (Room 302)", time: "Now" },
    { token: "A-045", status: "Called to Vitals Room B", time: "~4 mins" },
    { token: "A-046", status: "Waiting in Corridor", time: "~10 mins" },
    { token: "A-047", status: "YOU (Sarah Jenkins)", time: "~18 mins", isUser: true },
    { token: "A-048", status: "Checked In at Kiosk", time: "~25 mins" }
  ]
};

export const mockOCRReports = [
  {
    id: "ocr-101",
    fileName: "Lab_Result_Metabolic_Panel_Aug2026.png",
    uploadDate: "Aug 10, 2026",
    docType: "Blood Lab Report",
    extractedData: {
      patientName: "Sarah Jenkins",
      dateOfTest: "2026-08-09",
      labName: "Quest Diagnostics Lab #402",
      metrics: [
        { key: "Fasting Glucose", value: "186 mg/dL", range: "70-99 mg/dL", status: "High" },
        { key: "HbA1c", value: "7.8 %", range: "4.0-5.6 %", status: "High" },
        { key: "Systolic BP", value: "148 mmHg", range: "< 120 mmHg", status: "Elevated" },
        { key: "Diastolic BP", value: "92 mmHg", range: "< 80 mmHg", status: "Elevated" },
        { key: "Total Cholesterol", value: "215 mg/dL", range: "< 200 mg/dL", status: "High" },
        { key: "Serum Creatinine", value: "0.9 mg/dL", range: "0.6-1.1 mg/dL", status: "Normal" }
      ],
      diagnosesExtracted: ["Type 2 Diabetes Mellitus", "Essential Hypertension"]
    }
  },
  {
    id: "ocr-102",
    fileName: "Discharge_Summary_StJude_Jul2026.pdf",
    uploadDate: "Jul 15, 2026",
    docType: "Hospital Discharge Summary",
    extractedData: {
      patientName: "Sarah Jenkins",
      dateOfDischarge: "2026-07-14",
      attendingPhysician: "Dr. Amanda Vance",
      metrics: [
        { key: "Discharge BP", value: "132/84 mmHg", range: "Normal", status: "Normal" },
        { key: "Discharge HR", value: "72 bpm", range: "60-100 bpm", status: "Normal" }
      ],
      diagnosesExtracted: ["Congestive Heart Failure Exacerbation", "Fluid Retention"],
      dischargeMedications: ["Lisinopril 10mg Daily", "Furosemide 20mg Daily", "Metformin 500mg BID"]
    }
  }
];

export const mockDischargeData = {
  patientName: "Sarah Jenkins",
  mrn: "MRN-84920",
  dischargeDate: "Today (Aug 13, 2026)",
  dischargeDiagnosis: "Acute Decompensated Heart Failure (Stabilized)",
  readmissionRiskScore: 68,
  readmissionRiskLevel: "Medium-High Risk",
  recommendedFollowUpDate: "Aug 20, 2026 (7 Days Post-Discharge)",
  suggestedDepartment: "Cardiology Post-Discharge Clinic",
  suggestedDoctor: "Dr. Amanda Vance",
  remindersConfigured: [
    { type: "SMS Notification", target: "+1 (555) 234-5678", schedule: "3 Days & 1 Day Prior" },
    { type: "Patient Portal Push", target: "App Notification", schedule: "Daily Medication Log Prompt" }
  ],
  lowRiskPath: false
};

export const mockFairnessMetrics = {
  overallFairnessScore: "96.4% (Passed Bias Audit)",
  lastAuditDate: "Aug 12, 2026",
  demographicDisparity: [
    { category: "Age Group", subgroup: "18-40", sampleSize: 1240, predictedPositiveRate: "14.2%", actualRate: "14.0%", disparityRatio: "1.01", status: "PASS" },
    { category: "Age Group", subgroup: "41-65", sampleSize: 2850, predictedPositiveRate: "38.5%", actualRate: "38.1%", disparityRatio: "1.01", status: "PASS" },
    { category: "Age Group", subgroup: "65+", sampleSize: 1910, predictedPositiveRate: "58.2%", actualRate: "57.9%", disparityRatio: "1.00", status: "PASS" },
    { category: "Gender", subgroup: "Female", sampleSize: 3100, predictedPositiveRate: "34.1%", actualRate: "34.0%", disparityRatio: "1.00", status: "PASS" },
    { category: "Gender", subgroup: "Male", sampleSize: 2900, predictedPositiveRate: "35.8%", actualRate: "35.5%", disparityRatio: "1.01", status: "PASS" }
  ],
  equalizedOddsMetrics: {
    tprDifference: "0.012 (Threshold < 0.05)",
    fprDifference: "0.008 (Threshold < 0.05)"
  },
  mitigationTechnique: "Equalized Odds Post-Processing & Adversarial Debias Constraint Active"
};

export const mockRAGKnowledgeBase = [
  {
    topic: "Risk Score Explanation",
    keywords: ["risk", "score", "why", "high", "reasons"],
    response: "Your disease risk score of 78% is mainly driven by your elevated fasting blood glucose (186 mg/dL) and Stage 2 blood pressure (148/92 mmHg). The system recommends booking a priority consultation with Dr. Amanda Vance."
  },
  {
    topic: "Appointment Booking",
    keywords: ["book", "appointment", "schedule", "doctor", "slot"],
    response: "You can book an appointment directly from your Patient Home base or via the 'Book Appointment' button. High-risk scores automatically unlock reserved priority slots (15-20% of daily quota)."
  },
  {
    topic: "Queue Status",
    keywords: ["queue", "token", "wait", "time", "position"],
    response: "Your current active OPD Token is A-047 for Cardiology OPD Room 302. You are position #12 in line with an estimated wait time of ~18 minutes."
  },
  {
    topic: "Medical Advice Disclaimer",
    keywords: ["diagnose", "treatment", "medicine", "pill", "cure"],
    response: "Important: I am an AI assistant designed to support navigation and clarify your platform risk summaries. I do not provide diagnostic medical opinions. Please consult Dr. Amanda Vance for medical advice."
  }
];
