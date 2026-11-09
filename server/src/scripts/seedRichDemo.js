import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/swasthyacare';

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB for rich demo seeding');

  const db = mongoose.connection.db;
  const hashedPassword = await bcrypt.hash('Password123', 10);

  // 1. Ensure core demo users
  const demoUsers = [
    {
      email: 'patient@swasthya.com',
      password: hashedPassword,
      firstName: 'Aarav',
      lastName: 'Sharma',
      role: 'patient',
      phone: '+91 98765 43210',
      isActive: true,
      profile: {
        dateOfBirth: '1988-04-12',
        gender: 'male',
        bloodGroup: 'O+',
        allergies: ['Penicillin'],
        emergencyContact: { name: 'Priya Sharma', relationship: 'Spouse', phone: '+91 98765 43219' },
      },
    },
    {
      email: 'doctor@swasthya.com',
      password: hashedPassword,
      firstName: 'Dr. Rohan',
      lastName: 'Verma',
      role: 'doctor',
      phone: '+91 98123 45678',
      isActive: true,
    },
    {
      email: 'management@swasthya.com',
      password: hashedPassword,
      firstName: 'Pooja',
      lastName: 'Nair',
      role: 'hospital_management',
      phone: '+91 98234 56789',
      isActive: true,
    },
    {
      email: 'admin@swasthya.com',
      password: hashedPassword,
      firstName: 'Rajesh',
      lastName: 'Gupta',
      role: 'admin',
      phone: '+91 98345 67890',
      isActive: true,
    },
  ];

  const userDocs = {};
  for (const u of demoUsers) {
    const existing = await db.collection('users').findOne({ email: u.email });
    if (existing) {
      await db.collection('users').updateOne({ _id: existing._id }, { $set: u });
      userDocs[u.email] = existing._id;
    } else {
      const res = await db.collection('users').insertOne({ ...u, createdAt: new Date(), updatedAt: new Date() });
      userDocs[u.email] = res.insertedId;
    }
  }

  // 2. Doctor Profiles
  const doctorUserId = userDocs['doctor@swasthya.com'];
  let docProfile = await db.collection('doctorprofiles').findOne({ user: doctorUserId });
  const docProfileData = {
    user: doctorUserId,
    fullName: 'Dr. Rohan Verma',
    specialty: 'Cardiology',
    qualifications: ['MBBS', 'MD (Cardiology)', 'FACC (USA)'],
    experienceYears: 16,
    hospital: 'Apex Heart & Multispecialty Hospital',
    consultationFee: 1200,
    languagesSpoken: ['English', 'Hindi'],
    bio: 'Senior Interventional Cardiologist specializing in preventive cardiovascular wellness, hypertension management, and ischemic heart disease rehabilitation.',
    isActive: true,
    isVerified: true,
  };

  let doctorProfileId;
  if (docProfile) {
    await db.collection('doctorprofiles').updateOne({ _id: docProfile._id }, { $set: docProfileData });
    doctorProfileId = docProfile._id;
  } else {
    const ins = await db.collection('doctorprofiles').insertOne({ ...docProfileData, createdAt: new Date() });
    doctorProfileId = ins.insertedId;
  }

  // 3. Create bookable availability slots for today and next 7 days
  const today = new Date();
  const slotsToCreate = [];

  for (let i = 0; i <= 7; i++) {
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + i);
    const dateStr = targetDate.toISOString().split('T')[0];

    const times = [
      { start: '09:00', end: '09:30' },
      { start: '09:30', end: '10:00' },
      { start: '10:00', end: '10:30' },
      { start: '11:00', end: '11:30' },
      { start: '14:00', end: '14:30' },
      { start: '15:00', end: '15:30' },
      { start: '16:00', end: '16:30' },
    ];

    for (const t of times) {
      slotsToCreate.push({
        doctor: doctorProfileId,
        doctorUser: doctorUserId,
        date: dateStr,
        startTime: t.start,
        endTime: t.end,
        durationMinutes: 30,
        status: 'available',
        isBooked: false,
        isPriority: false,
        consultationType: 'both',
        bookedByPatient: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }

  // Upsert slots without duplicating
  for (const s of slotsToCreate) {
    const existingSlot = await db.collection('availabilityslots').findOne({
      doctor: doctorProfileId,
      date: s.date,
      startTime: s.startTime,
    });
    if (!existingSlot) {
      await db.collection('availabilityslots').insertOne(s);
    }
  }

  // 4. Seed realistic Appointments for Patient Aarav Sharma
  const patientUserId = userDocs['patient@swasthya.com'];

  // Pick a couple slots for appointments
  const availableSlots = await db.collection('availabilityslots').find({
    doctor: doctorProfileId,
    status: 'available',
    isBooked: false,
  }).limit(4).toArray();

  if (availableSlots.length >= 3) {
    // 1. Confirmed Upcoming Appointment
    const slot1 = availableSlots[0];
    await db.collection('availabilityslots').updateOne(
      { _id: slot1._id },
      { $set: { status: 'booked', isBooked: true, bookedByPatient: patientUserId } }
    );
    await db.collection('appointments').insertOne({
      patient: patientUserId,
      doctor: doctorUserId,
      doctorProfile: doctorProfileId,
      availabilitySlot: slot1._id,
      appointmentDate: slot1.date,
      appointmentTime: slot1.startTime,
      status: 'APPROVED',
      consultationType: 'in-person',
      reason: 'Routine quarterly cardiovascular wellness checkup and blood pressure assessment.',
      symptoms: ['Mild exertional fatigue', 'Occasional palpitations'],
      reviewedBy: doctorUserId,
      reviewedAt: new Date(),
      createdAt: new Date(Date.now() - 86400000),
      updatedAt: new Date(),
    });

    // 2. Pending Approval Appointment
    const slot2 = availableSlots[1];
    await db.collection('availabilityslots').updateOne(
      { _id: slot2._id },
      { $set: { status: 'reserved', isBooked: false, bookedByPatient: patientUserId } }
    );
    await db.collection('appointments').insertOne({
      patient: patientUserId,
      doctor: doctorUserId,
      doctorProfile: doctorProfileId,
      availabilitySlot: slot2._id,
      appointmentDate: slot2.date,
      appointmentTime: slot2.startTime,
      status: 'PENDING',
      consultationType: 'video',
      reason: 'Medication titration review following new statin prescription.',
      symptoms: ['Morning dizziness'],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 3. Past Completed Appointment
    const slot3 = availableSlots[2];
    await db.collection('appointments').insertOne({
      patient: patientUserId,
      doctor: doctorUserId,
      doctorProfile: doctorProfileId,
      availabilitySlot: slot3._id,
      appointmentDate: '2026-10-15',
      appointmentTime: '10:00',
      status: 'COMPLETED',
      consultationType: 'in-person',
      reason: 'Post-angioplasty stent review and ECG monitoring.',
      symptoms: [],
      reviewedBy: doctorUserId,
      reviewedAt: new Date('2026-10-14'),
      createdAt: new Date('2026-10-10'),
      updatedAt: new Date('2026-10-15'),
    });
  }

  // 5. Seed Post-Discharge Care Plan for Aarav Sharma
  const existingPlan = await db.collection('followupplans').findOne({ patient: patientUserId });
  if (!existingPlan) {
    const planRes = await db.collection('followupplans').insertOne({
      patient: patientUserId,
      doctor: doctorUserId,
      doctorProfile: doctorProfileId,
      diagnosis: 'Acute Coronary Syndrome — Post-PCI with Stent Placement',
      dischargeDate: new Date(Date.now() - 4 * 86400000),
      followUpDate: new Date(Date.now() + 10 * 86400000),
      instructions: 'Maintain low-sodium diet (< 2g/day). Perform 30 minutes of mild walking daily. Record blood pressure twice daily before morning medications.',
      medications: [
        {
          name: 'Aspirin (Ecosprin)',
          dosage: '75 mg',
          frequency: 'Once daily after breakfast',
          durationDays: 90,
          specialInstructions: 'Do not discontinue without cardiologist approval',
        },
        {
          name: 'Ticagrelor (Brilinta)',
          dosage: '90 mg',
          frequency: 'Twice daily',
          durationDays: 90,
          specialInstructions: 'Antiplatelet therapy — report any unusual bleeding',
        },
        {
          name: 'Atorvastatin',
          dosage: '40 mg',
          frequency: 'Once daily at bedtime',
          durationDays: 90,
          specialInstructions: 'Lipid stabilization',
        },
        {
          name: 'Metoprolol Succinate',
          dosage: '25 mg',
          frequency: 'Once daily in morning',
          durationDays: 60,
          specialInstructions: 'Pulse rate controller',
        },
      ],
      targetMetrics: {
        bloodPressureTarget: '< 120/80 mmHg',
        bloodGlucoseTarget: '80-120 mg/dL',
        maxHeartRateTarget: '105 bpm',
      },
      warningSymptoms: [
        'Chest discomfort radiating to jaw or left arm',
        'Severe shortness of breath when resting',
        'Persistent lightheadedness or syncope',
      ],
      status: 'ACTIVE',
      totalCheckIns: 4,
      adherenceRate: 100,
      createdAt: new Date(Date.now() - 4 * 86400000),
      updatedAt: new Date(),
    });

    // Add recovery update check-ins
    await db.collection('recoveryupdates').insertMany([
      {
        plan: planRes.insertedId,
        patient: patientUserId,
        dayNumber: 1,
        painScore: 2,
        energyLevel: 'moderate',
        medicationsTaken: true,
        vitalSigns: { systolicBp: 122, diastolicBp: 78, heartRate: 72, temperature: 98.4 },
        hasWarningSymptoms: false,
        notes: 'Feeling stable, minor puncture site tenderness healing normally.',
        clinicianReview: { status: 'NORMAL', reviewedAt: new Date(Date.now() - 3 * 86400000) },
        createdAt: new Date(Date.now() - 3 * 86400000),
      },
      {
        plan: planRes.insertedId,
        patient: patientUserId,
        dayNumber: 2,
        painScore: 1,
        energyLevel: 'good',
        medicationsTaken: true,
        vitalSigns: { systolicBp: 118, diastolicBp: 76, heartRate: 68, temperature: 98.6 },
        hasWarningSymptoms: false,
        notes: 'Completed 20-minute slow indoor walk without chest tightness.',
        clinicianReview: { status: 'NORMAL', reviewedAt: new Date(Date.now() - 2 * 86400000) },
        createdAt: new Date(Date.now() - 2 * 86400000),
      },
      {
        plan: planRes.insertedId,
        patient: patientUserId,
        dayNumber: 3,
        painScore: 1,
        energyLevel: 'good',
        medicationsTaken: true,
        vitalSigns: { systolicBp: 124, diastolicBp: 80, heartRate: 70, temperature: 98.5 },
        hasWarningSymptoms: false,
        notes: 'Good appetite, strictly adhered to prescribed low-sodium meal plan.',
        clinicianReview: { status: 'NORMAL', reviewedAt: new Date(Date.now() - 1 * 86400000) },
        createdAt: new Date(Date.now() - 1 * 86400000),
      },
    ]);
  }

  console.log('✅ Rich demo data seeded successfully!');
  console.log('Demo Credentials (Password: Password123 for all):');
  console.log('  👤 Patient:   patient@swasthya.com');
  console.log('  👨‍⚕️ Doctor:    doctor@swasthya.com');
  console.log('  📊 Management: management@swasthya.com');
  console.log('  🛡️ Admin:     admin@swasthya.com');

  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
