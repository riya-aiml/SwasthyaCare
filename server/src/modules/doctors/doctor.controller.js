import DoctorProfile from './doctorProfile.model.js';
import AvailabilitySlot from './availabilitySlot.model.js';
import User from '../users/user.model.js';

/**
 * Doctor Controller
 * Handles doctor directory discovery, profile management, and availability slots
 */

/**
 * 1. GET /api/doctors
 * Public / Patient Directory: search and filter approved doctors
 */
export const getDoctorsDirectory = async (req, res) => {
  try {
    const { specialty, hospital, onlineOnly, search, page = 1, limit = 12 } = req.query;

    const query = { isApproved: true };

    if (specialty) {
      query.specialty = new RegExp(`^${specialty}$`, 'i');
    }

    if (hospital) {
      query.hospital = new RegExp(hospital, 'i');
    }

    if (onlineOnly === 'true') {
      query.isAvailableForOnlineConsult = true;
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { fullName: searchRegex },
        { specialty: searchRegex },
        { hospital: searchRegex },
        { department: searchRegex },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [doctors, total] = await Promise.all([
      DoctorProfile.find(query)
        .populate('user', 'email phoneNumber')
        .sort({ rating: -1, experienceYears: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      DoctorProfile.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: {
        doctors,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalDoctors: total,
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error('getDoctorsDirectory error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to retrieve doctor directory' },
    });
  }
};

/**
 * 2. GET /api/doctors/:id
 * Retrieve single doctor profile
 */
export const getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await DoctorProfile.findById(id).populate('user', 'email phoneNumber');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        error: { message: 'Doctor profile not found' },
      });
    }

    res.status(200).json({
      success: true,
      data: { doctor },
    });
  } catch (error) {
    console.error('getDoctorById error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to retrieve doctor profile' },
    });
  }
};

/**
 * 3. GET /api/doctors/profile/me
 * Doctor retrieves their own profile (auto-provisions if first time)
 */
export const getMyDoctorProfile = async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({
        success: false,
        error: { message: 'Access restricted to doctor accounts only' },
      });
    }

    let profile = await DoctorProfile.findOne({ user: req.user._id });

    // Auto-provision profile from User data if not yet created
    if (!profile) {
      profile = await DoctorProfile.create({
        user: req.user._id,
        fullName: req.user.fullName || `Dr. ${req.user.firstName} ${req.user.lastName}`,
        specialty: req.user.specialization || 'General Medicine',
        experienceYears: req.user.experience || 5,
        hospital: 'SwasthyaCare Central Medical Hospital',
        department: 'General OPD',
        consultationFee: 500,
        bio: 'Dedicated clinician providing compassionate patient-centered healthcare.',
      });
    }

    res.status(200).json({
      success: true,
      data: { profile },
    });
  } catch (error) {
    console.error('getMyDoctorProfile error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to get doctor profile' },
    });
  }
};

/**
 * 4. PUT /api/doctors/profile/me
 * Doctor updates their own profile
 */
export const updateMyDoctorProfile = async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({
        success: false,
        error: { message: 'Access restricted to doctor accounts only' },
      });
    }

    const allowedUpdates = [
      'specialty',
      'qualifications',
      'experienceYears',
      'hospital',
      'department',
      'roomNumber',
      'consultationFee',
      'bio',
      'isAvailableForOnlineConsult',
      'avatar',
      'languages',
    ];

    const updates = {};
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    // Always keep fullName in sync
    if (req.body.fullName) {
      updates.fullName = req.body.fullName;
    }

    const profile = await DoctorProfile.findOneAndUpdate(
      { user: req.user._id },
      { $set: updates },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Doctor profile updated successfully',
      data: { profile },
    });
  } catch (error) {
    console.error('updateMyDoctorProfile error:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Failed to update doctor profile' },
    });
  }
};

/**
 * 5. GET /api/doctors/:id/slots
 * List bookable availability slots for a doctor on a specific date (or next 7 days)
 */
export const getDoctorSlots = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, status = 'available' } = req.query;

    const doctor = await DoctorProfile.findById(id);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        error: { message: 'Doctor not found' },
      });
    }

    // Default to today if no date specified
    const todayStr = new Date().toISOString().split('T')[0];
    const queryDate = date || { $gte: todayStr };

    const query = {
      doctor: doctor._id,
      date: queryDate,
    };

    if (status !== 'all') {
      query.status = status;
      query.isBooked = false;
    }

    const slots = await AvailabilitySlot.find(query).sort({ date: 1, startTime: 1 });

    res.status(200).json({
      success: true,
      data: {
        doctor: {
          id: doctor._id,
          name: doctor.fullName,
          specialty: doctor.specialty,
          consultationFee: doctor.consultationFee,
        },
        slots,
      },
    });
  } catch (error) {
    console.error('getDoctorSlots error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to retrieve doctor slots' },
    });
  }
};

/**
 * 6. POST /api/doctors/availability
 * Doctor creates availability slot(s)
 * Acceptance Criteria:
 * - Doctors can manage ONLY their own availability
 * - Patients cannot create slots
 * - Rejects past dates
 * - Rejects startTime >= endTime
 * - Rejects overlapping or duplicate slots
 */
export const createAvailabilitySlot = async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({
        success: false,
        error: { message: 'Only authorized doctors can manage availability' },
      });
    }

    let doctor = await DoctorProfile.findOne({ user: req.user._id });
    if (!doctor) {
      doctor = await DoctorProfile.create({
        user: req.user._id,
        fullName: req.user.fullName || `Dr. ${req.user.firstName} ${req.user.lastName}`,
        specialty: req.user.specialization || 'General Medicine',
        experienceYears: req.user.experience || 5,
        hospital: 'SwasthyaCare Central Medical Hospital',
        department: 'General OPD',
        consultationFee: 500,
        bio: 'Dedicated clinician providing compassionate patient-centered healthcare.',
      });
    }

    const { date, startTime, endTime, durationMinutes = 30, isPriority = false, consultationType = 'both' } = req.body;

    // 1. Validate required fields
    if (!date || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        error: { message: 'Date (YYYY-MM-DD), startTime (HH:mm), and endTime (HH:mm) are required' },
      });
    }

    // 2. Reject past dates
    const todayStr = new Date().toISOString().split('T')[0];
    if (date < todayStr) {
      return res.status(400).json({
        success: false,
        error: { message: 'Cannot create availability slots for past dates' },
      });
    }

    // 3. Reject invalid time ordering
    if (startTime >= endTime) {
      return res.status(400).json({
        success: false,
        error: { message: 'startTime must precede endTime' },
      });
    }

    // 4. Reject duplicate or overlapping slots for this doctor
    const existingConflict = await AvailabilitySlot.findOne({
      doctor: doctor._id,
      date,
      $or: [
        { startTime: { $lt: endTime, $gte: startTime } },
        { endTime: { $gt: startTime, $lte: endTime } },
        { startTime: { $lte: startTime }, endTime: { $gte: endTime } },
      ],
    });

    if (existingConflict) {
      return res.status(409).json({
        success: false,
        error: {
          message: `Slot conflict: slot ${existingConflict.startTime}-${existingConflict.endTime} already exists on ${date}`,
        },
      });
    }

    const newSlot = await AvailabilitySlot.create({
      doctor: doctor._id,
      doctorUser: req.user._id,
      date,
      startTime,
      endTime,
      durationMinutes,
      isPriority,
      consultationType,
      status: 'available',
      isBooked: false,
    });

    res.status(201).json({
      success: true,
      message: 'Availability slot created successfully',
      data: { slot: newSlot },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        error: { message: 'A slot at this exact date and time already exists' },
      });
    }
    console.error('createAvailabilitySlot error:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Failed to create availability slot' },
    });
  }
};

/**
 * 7. DELETE /api/doctors/availability/:slotId
 * Doctor removes an unbooked availability slot
 */
export const deleteAvailabilitySlot = async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({
        success: false,
        error: { message: 'Only authorized doctors can manage availability' },
      });
    }

    const { slotId } = req.params;

    const slot = await AvailabilitySlot.findById(slotId);
    if (!slot) {
      return res.status(404).json({
        success: false,
        error: { message: 'Availability slot not found' },
      });
    }

    // Ensure doctor only manages their own slots
    if (slot.doctorUser.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: { message: 'You can only delete your own availability slots' },
      });
    }

    // Cannot delete a slot that has already been booked by a patient
    if (slot.isBooked || slot.status === 'booked') {
      return res.status(400).json({
        success: false,
        error: { message: 'Cannot delete a slot that has already been booked' },
      });
    }

    await AvailabilitySlot.findByIdAndDelete(slotId);

    res.status(200).json({
      success: true,
      message: 'Availability slot removed successfully',
    });
  } catch (error) {
    console.error('deleteAvailabilitySlot error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to delete availability slot' },
    });
  }
};

/**
 * 8. GET /api/doctors/availability/my-schedule
 * Doctor views their own upcoming availability schedule
 */
export const getMyDoctorSchedule = async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({
        success: false,
        error: { message: 'Access restricted to doctors' },
      });
    }

    const { fromDate } = req.query;
    const todayStr = fromDate || new Date().toISOString().split('T')[0];

    const slots = await AvailabilitySlot.find({
      doctorUser: req.user._id,
      date: { $gte: todayStr },
    })
      .populate('bookedByPatient', 'firstName lastName email phoneNumber')
      .sort({ date: 1, startTime: 1 });

    res.status(200).json({
      success: true,
      data: { slots },
    });
  } catch (error) {
    console.error('getMyDoctorSchedule error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch doctor schedule' },
    });
  }
};

/**
 * 9. POST /api/doctors/seed
 * Helper to seed initial sample doctors & slots for development
 */
export const seedSampleDoctors = async (req, res) => {
  try {
    const existingCount = await DoctorProfile.countDocuments();
    if (existingCount > 0) {
      return res.status(200).json({
        success: true,
        message: `Database already has ${existingCount} doctor profiles`,
      });
    }

    // Create doctor users & profiles
    const sampleDoctors = [
      {
        firstName: 'Amanda',
        lastName: 'Vance',
        email: 'dr.amanda.vance@swasthya.care',
        specialty: 'Senior Cardiologist',
        hospital: 'St. Jude Metropolitan Hospital',
        department: 'Cardiology OPD',
        experienceYears: 16,
        consultationFee: 750,
        rating: 4.9,
        reviewsCount: 480,
        avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200',
        bio: 'Interventional and preventive cardiologist specializing in coronary artery disease, hypertension, and advanced lipidology.',
      },
      {
        firstName: 'James',
        lastName: 'Aris',
        email: 'dr.james.aris@swasthya.care',
        specialty: 'Endocrinologist & Diabetologist',
        hospital: 'City Heart & Metabolic Center',
        department: 'Endocrinology OPD',
        experienceYears: 14,
        consultationFee: 650,
        rating: 4.8,
        reviewsCount: 360,
        avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200',
        bio: 'Specialist in glycemic control, metabolic syndrome, insulin resistance, and comprehensive diabetic risk mitigation.',
      },
      {
        firstName: 'Elena',
        lastName: 'Rostova',
        email: 'dr.elena.rostova@swasthya.care',
        specialty: 'Internal Medicine & Triage Specialist',
        hospital: 'Metro Health Pavilion',
        department: 'General OPD',
        experienceYears: 11,
        consultationFee: 500,
        rating: 4.7,
        reviewsCount: 290,
        avatar: 'https://images.unsplash.com/photo-1594824813580-0a374667d4bf?auto=format&fit=crop&q=80&w=200',
        bio: 'Acute diagnostic clinician with specialized expertise in multi-system triage, preventative screening, and geriatric care.',
      },
      {
        firstName: 'Marcus',
        lastName: 'Brody',
        email: 'dr.marcus.brody@swasthya.care',
        specialty: 'Cardiothoracic Consultant',
        hospital: 'University Heart Institute',
        department: 'Cardiology OPD',
        experienceYears: 20,
        consultationFee: 900,
        rating: 4.9,
        reviewsCount: 520,
        avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200',
        bio: 'Senior cardiothoracic surgeon and consultant focusing on post-operative rehabilitation, heart failure, and valve disease.',
      },
    ];

    const today = new Date();
    const createdDoctors = [];

    for (const doc of sampleDoctors) {
      let user = await User.findOne({ email: doc.email });
      if (!user) {
        user = await User.create({
          email: doc.email,
          password: 'DoctorPassword123',
          firstName: doc.firstName,
          lastName: doc.lastName,
          role: 'doctor',
          phoneNumber: '9876543200',
        });
      }

      const profile = await DoctorProfile.create({
        user: user._id,
        fullName: `Dr. ${doc.firstName} ${doc.lastName}`,
        specialty: doc.specialty,
        hospital: doc.hospital,
        department: doc.department,
        experienceYears: doc.experienceYears,
        consultationFee: doc.consultationFee,
        rating: doc.rating,
        reviewsCount: doc.reviewsCount,
        avatar: doc.avatar,
        bio: doc.bio,
      });

      createdDoctors.push(profile);

      // Create bookable slots for the next 3 days
      for (let dayOffset = 0; dayOffset <= 2; dayOffset++) {
        const slotDate = new Date(today);
        slotDate.setDate(today.getDate() + dayOffset);
        const dateStr = slotDate.toISOString().split('T')[0];

        const slotTimes = [
          { start: '09:00', end: '09:30', isPriority: true },
          { start: '10:00', end: '10:30', isPriority: false },
          { start: '11:15', end: '11:45', isPriority: false },
          { start: '14:00', end: '14:30', isPriority: false },
          { start: '15:30', end: '16:00', isPriority: true },
        ];

        for (const time of slotTimes) {
          await AvailabilitySlot.create({
            doctor: profile._id,
            doctorUser: user._id,
            date: dateStr,
            startTime: time.start,
            endTime: time.end,
            isPriority: time.isPriority,
            status: 'available',
            isBooked: false,
          });
        }
      }
    }

    res.status(201).json({
      success: true,
      message: `Seeded ${createdDoctors.length} sample doctors with availability slots`,
      data: { doctors: createdDoctors },
    });
  } catch (error) {
    console.error('seedSampleDoctors error:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Failed to seed sample doctors' },
    });
  }
};
