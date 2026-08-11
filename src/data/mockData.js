export const mockPatient = {
  id: "P-88402",
  name: "Priya Malhotra",
  age: 48,
  gender: "Female",
  bloodGroup: "O+",
  height: "165 cm",
  weight: "68 kg",
  avatar: "/images/patient.png",
  primaryDoctor: "Dr. Ananya Sharma",
  emergencyContact: "+91 98765 43210",
  currentToken: "OPD-A42",
  queuePosition: 3,
  estimatedWaitMins: 14,
  opdRoom: "Room 104 (Cardiology Block)",
  allergies: ["Penicillin", "Dust Mites"],
  medicalHistory: ["Hypertension (Diagnosed 2023)", "Mild Asthma"]
};

export const mockDoctors = [
  {
    id: "doc-1",
    name: "Dr. Ananya Sharma",
    specialty: "Cardiologist",
    experience: "12+ Years Exp",
    hospital: "Apex Heart & Medical Center",
    rating: 4.9,
    reviews: 320,
    fee: "₹800",
    avatar: "/images/doctor-female.png",
    availableSlots: ["09:30 AM", "11:00 AM", "03:00 PM", "05:30 PM"],
    onlineConsult: true
  },
  {
    id: "doc-2",
    name: "Dr. Rajesh Verma",
    specialty: "Neurologist & Internal Medicine",
    experience: "15+ Years Exp",
    hospital: "City Care Super Specialty Hospital",
    rating: 4.8,
    reviews: 410,
    fee: "₹1,000",
    avatar: "/images/doctor-male.png",
    availableSlots: ["10:00 AM", "02:15 PM", "04:00 PM"],
    onlineConsult: true
  },
  {
    id: "doc-3",
    name: "Dr. Meera Patel",
    specialty: "Dermatologist",
    experience: "9+ Years Exp",
    hospital: "Skin & Aesthetics Clinic",
    rating: 4.9,
    reviews: 285,
    fee: "₹700",
    avatar: "/images/doctor-female.png",
    availableSlots: ["11:30 AM", "04:30 PM"],
    onlineConsult: true
  }
];

export const mockAppointments = [
  {
    id: "apt-101",
    doctorName: "Dr. Ananya Sharma",
    specialty: "Cardiologist",
    date: "Tomorrow, Aug 12",
    time: "11:00 AM",
    type: "Tele-Consultation",
    status: "Confirmed",
    avatar: "/images/doctor-female.png"
  },
  {
    id: "apt-102",
    doctorName: "Dr. Rajesh Verma",
    specialty: "Neurologist",
    date: "Friday, Aug 15",
    time: "02:15 PM",
    type: "In-Person Clinic Visit",
    status: "Scheduled",
    avatar: "/images/doctor-male.png"
  }
];

export const mockTriageRules = [
  {
    id: "TR-01",
    ruleName: "Severe Cardiovascular Distress Rule",
    conditions: "Chest tightness OR Systolic BP > 160 OR Heart Rate > 120",
    urgency: "Emergency",
    badgeClass: "badge-emergency",
    action: "Immediate Resuscitation / Priority ER Admission"
  },
  {
    id: "TR-02",
    ruleName: "Acute Cardiac Warning & Elevated BP Rule",
    conditions: "SpO2 < 92% OR Temp > 102°F with Shortness of Breath",
    urgency: "Urgent",
    badgeClass: "badge-urgent",
    action: "Priority OPD Token (Fast-Tracked within 15 mins)"
  },
  {
    id: "TR-03",
    ruleName: "Standard Symptom Presentation Rule",
    conditions: "Moderate Fever (99-101°F) OR Joint Pain > 3 Days",
    urgency: "Standard",
    badgeClass: "badge-standard",
    action: "Standard OPD Queue Allocation"
  },
  {
    id: "TR-04",
    ruleName: "Routine Checkup & Prescription Refill Rule",
    conditions: "No acute distress, routine follow-up or lab consultation",
    urgency: "Routine",
    badgeClass: "badge-routine",
    action: "Scheduled Appointment Slot"
  }
];

export const mockMLRiskScores = {
  heartDiseaseRisk: {
    score: 84,
    level: "High Risk",
    confidence: "92.4%",
    keyFactors: [
      { factor: "Systolic Blood Pressure (138 mmHg)", impact: "+32%" },
      { factor: "Fasting Blood Sugar (134 mg/dL)", impact: "+26%" },
      { factor: "Family Cardiac History", impact: "+18%" }
    ],
    recommendedAction: "Reserve 15-20% Priority Slot for Specialist Cardiologist Evaluation within 48 Hours."
  },
  diabetesRisk: {
    score: 72,
    level: "Moderate-High Risk",
    confidence: "88.1%",
    keyFactors: [
      { factor: "BMI Index (25.0)", impact: "+24%" },
      { factor: "HbA1c Equivalent (6.4%)", impact: "+38%" }
    ],
    recommendedAction: "Schedule Endocrinology Fasting Glucose Test."
  },
  readmissionRisk: {
    score: 28,
    level: "Low-Moderate Risk",
    confidence: "91.0%",
    keyFactors: [
      { factor: "Post-Discharge Medication Adherence", impact: "-15%" },
      { factor: "Vital Signs Stability Index", impact: "-12%" }
    ],
    recommendedAction: "Automated 7-Day Push Reminder & Self-Intake Monitoring."
  }
};

export const mockFairnessAudit = {
  overallParityRatio: "0.98 (Balanced)",
  demographicDisparity: [
    { group: "Age 18 - 35", predictedRiskRate: "42.1%", baselineRate: "41.8%", disparityDelta: "+0.3%" },
    { group: "Age 36 - 60", predictedRiskRate: "44.5%", baselineRate: "44.2%", disparityDelta: "+0.3%" },
    { group: "Age 60+", predictedRiskRate: "45.8%", baselineRate: "45.6%", disparityDelta: "+0.2%" },
    { group: "Female Patients", predictedRiskRate: "43.8%", baselineRate: "43.6%", disparityDelta: "+0.2%" },
    { group: "Male Patients", predictedRiskRate: "44.2%", baselineRate: "44.0%", disparityDelta: "+0.2%" }
  ],
  mitigationStatus: "Fairness Layer Active — Equalized Odds Constraint Enforced"
};

export const mockPrioritySlots = [
  { time: "09:30 AM", doctor: "Dr. Ananya Sharma", status: "Reserved for ML High-Risk Patient (P-88402)", isPriority: true },
  { time: "10:15 AM", doctor: "Dr. Ananya Sharma", status: "Standard OPD Booking", isPriority: false },
  { time: "11:00 AM", doctor: "Dr. Rajesh Verma", status: "Reserved for ML High-Risk Readmission", isPriority: true },
  { time: "02:30 PM", doctor: "Dr. Meera Patel", status: "Standard OPD Booking", isPriority: false }
];

export const mockLiveQueue = [
  { token: "OPD-A39", status: "In Consultation (Room 104)", doctor: "Dr. Ananya Sharma", timeRemaining: "2 mins" },
  { token: "OPD-A40", status: "Vitals Counter Checked", doctor: "Dr. Ananya Sharma", timeRemaining: "6 mins" },
  { token: "OPD-A41", status: "Waiting in Lobby", doctor: "Dr. Ananya Sharma", timeRemaining: "10 mins" },
  { token: "OPD-A42", status: "YOU (Priya Malhotra)", doctor: "Dr. Ananya Sharma", timeRemaining: "14 mins", isUser: true },
  { token: "OPD-A43", status: "Checked In", doctor: "Dr. Ananya Sharma", timeRemaining: "22 mins" }
];

export const mockHospitalWayfinding = [
  { step: 1, location: "Main Hospital Entrance", instruction: "Scan QR Code or Check-in at Kiosk 2", time: "1 min" },
  { step: 2, location: "Triage & Vitals Counter B", instruction: "Get Blood Pressure & Temperature Recorded", time: "3 mins" },
  { step: 3, location: "Cardiology OPD Waiting Lounge", instruction: "Proceed to 1st Floor, Room 104", time: "2 mins" },
  { step: 4, location: "Doctor Consultation Room 104", instruction: "Meet Dr. Ananya Sharma when Token OPD-A42 is called", time: "Current" }
];

export const mockOCRDocuments = [
  {
    id: "doc-101",
    title: "Prescription_Cardiology_Apex.pdf",
    uploadDate: "Aug 02, 2026",
    ocrExtracted: {
      medications: ["Telmisartan 40mg (1-0-0)", "Metoprolol 25mg (1-0-1)"],
      diagnosis: "Essential Hypertension with mild exertional dyspnea",
      labRecommendation: "Repeat Lipid Profile & Serum Creatinine in 4 weeks"
    }
  },
  {
    id: "doc-102",
    title: "Lab_Report_Lipid_Panel_July2026.png",
    uploadDate: "Jul 24, 2026",
    ocrExtracted: {
      totalCholesterol: "210 mg/dL (Elevated)",
      hdl: "48 mg/dL (Normal)",
      ldl: "135 mg/dL (Borderline High)",
      triglycerides: "165 mg/dL"
    }
  }
];

export const mockRAGIndex = [
  { query: "Has this patient had high blood pressure before?", answer: "Yes. Document 'Prescription_Cardiology_Apex.pdf' notes Essential Hypertension diagnosed in 2023 with Telmisartan 40mg prescription." },
  { query: "What are the patient's drug allergies?", answer: "Patient Priya Malhotra has documented allergies to Penicillin and Dust Mites." },
  { query: "What was the latest cholesterol reading?", answer: "On July 24, 2026, Total Cholesterol was 210 mg/dL (Elevated) and LDL was 135 mg/dL." }
];

export const mockNoShowPredictions = [
  { appointmentId: "APT-901", patientName: "Rohan Gupta", slot: "Today, 03:00 PM", noShowProbability: "74% (High Risk No-Show)", actionSuggested: "Send SMS Confirmation & Offer Slot to Priority High-Risk Queue" },
  { appointmentId: "APT-902", patientName: "Priya Malhotra", slot: "Tomorrow, 11:00 AM", noShowProbability: "8% (Low Risk)", actionSuggested: "Confirmed Slot" }
];
