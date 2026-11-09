import React, { useState, useEffect } from 'react';
import { getDoctors, getDoctorSlots } from '../services/doctorService';
import { Star, MapPin, Calendar, Video, Clock } from 'lucide-react';
import AppointmentBookingModal from './AppointmentBookingModal';

/**
 * Doctor Directory Component
 * Allows patients to browse, search, and view available doctors
 */
export default function DoctorDirectory({ onDoctorSelect }) {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [slots, setSlots] = useState([]);
  const [bookingSlot, setBookingSlot] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, [specialty]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (specialty) params.specialty = specialty;
      if (searchTerm) params.search = searchTerm;
      params.limit = 20;

      const response = await getDoctors(params);
      setDoctors(response.data.doctors);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchDoctors();
  };

  const handleViewSlots = async (doctor) => {
    try {
      setSelectedDoctor(doctor);
      const response = await getDoctorSlots(doctor._id);
      setSlots(response.data.slots);
    } catch (err) {
      console.error('Failed to load slots:', err);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (selectedDoctor && slots.length > 0) {
    return (
      <div style={styles.container}>
        <button onClick={() => setSelectedDoctor(null)} style={styles.backButton}>
          ← Back to Directory
        </button>

        <div style={styles.doctorHeader}>
          <img src={selectedDoctor.avatar} alt={selectedDoctor.fullName} style={styles.avatarLarge} />
          <div>
            <h2 style={styles.doctorName}>{selectedDoctor.fullName}</h2>
            <p style={styles.specialty}>{selectedDoctor.specialty}</p>
            <p style={styles.hospital}>
              <MapPin size={16} /> {selectedDoctor.hospital}
            </p>
            <div style={styles.rating}>
              <Star size={16} fill="#f59e0b" color="#f59e0b" />
              <span>{selectedDoctor.rating} ({selectedDoctor.reviewsCount} reviews)</span>
            </div>
          </div>
        </div>

        {bookingSuccess && (
          <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>✅ Appointment requested successfully! You can track its status in "My Appointments".</span>
            <button onClick={() => setBookingSuccess(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>×</button>
          </div>
        )}

        <h3 style={styles.slotsTitle}>Available Appointment Slots</h3>
        <div style={styles.slotsGrid}>
          {slots.map((slot) => (
            <div key={slot._id} style={styles.slotCard}>
              <div style={styles.slotDate}>{formatDate(slot.date)}</div>
              <div style={styles.slotTime}>
                <Clock size={14} /> {slot.startTime} - {slot.endTime}
              </div>
              {slot.isPriority && <span style={styles.priorityBadge}>Priority</span>}
              {slot.consultationType === 'video' && <Video size={14} color="#3b82f6" />}
              <button
                onClick={() => setBookingSlot(slot)}
                style={styles.bookButton}
              >
                Book Slot
              </button>
            </div>
          ))}
        </div>

        {bookingSlot && (
          <AppointmentBookingModal
            slot={bookingSlot}
            doctor={selectedDoctor}
            onClose={() => setBookingSlot(null)}
            onSuccess={() => {
              setBookingSlot(null);
              setBookingSuccess(true);
              handleViewSlots(selectedDoctor);
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🩺 Find a Doctor</h1>
      <p style={styles.subtitle}>Browse our network of experienced healthcare professionals</p>

      <form onSubmit={handleSearch} style={styles.searchForm}>
        <input
          type="text"
          placeholder="Search by name, specialty, or hospital..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
        <button type="submit" style={styles.searchButton}>Search</button>
      </form>

      <div style={styles.filterRow}>
        <select
          value={specialty}
          onChange={(e) => setSpecialty(e.target.value)}
          style={styles.select}
        >
          <option value="">All Specialties</option>
          <option value="Senior Cardiologist">Cardiology</option>
          <option value="Endocrinologist">Endocrinology</option>
          <option value="Internal Medicine">Internal Medicine</option>
        </select>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {loading ? (
        <div style={styles.loading}>Loading doctors...</div>
      ) : (
        <div style={styles.doctorsGrid}>
          {doctors.map((doctor) => (
            <div key={doctor._id} style={styles.doctorCard}>
              <div style={styles.cardHeader}>
                <img src={doctor.avatar} alt={doctor.fullName} style={styles.avatar} />
                <div style={styles.doctorInfo}>
                  <h3 style={styles.doctorNameCard}>{doctor.fullName}</h3>
                  <p style={styles.specialtyCard}>{doctor.specialty}</p>
                  <p style={styles.experience}>{doctor.experienceYears}+ Years Experience</p>
                </div>
              </div>

              <div style={styles.hospitalRow}>
                <MapPin size={14} color="#718096" />
                <span style={styles.hospitalText}>{doctor.hospital}</span>
              </div>

              <div style={styles.statsRow}>
                <div style={styles.ratingBox}>
                  <Star size={14} fill="#f59e0b" color="#f59e0b" />
                  <span>{doctor.rating}</span>
                  <span style={styles.reviews}>({doctor.reviewsCount})</span>
                </div>
                <div style={styles.fee}>₹{doctor.consultationFee}</div>
              </div>

              <div style={styles.cardActions}>
                <button onClick={() => handleViewSlots(doctor)} style={styles.viewSlotsButton}>
                  <Calendar size={16} /> View Available Slots
                </button>
                {doctor.isAvailableForOnlineConsult && (
                  <div style={styles.videoBadge}>
                    <Video size={14} /> Video
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && doctors.length === 0 && (
        <div style={styles.noResults}>
          No doctors found. Try adjusting your search or filters.
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '24px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1a202c',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '16px',
    color: '#718096',
    marginBottom: '24px',
  },
  searchForm: {
    display: 'flex',
    gap: '12px',
    marginBottom: '16px',
  },
  searchInput: {
    flex: 1,
    padding: '12px 16px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
  },
  searchButton: {
    padding: '12px 24px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  filterRow: {
    marginBottom: '24px',
  },
  select: {
    padding: '10px 16px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    background: 'white',
  },
  error: {
    background: '#fee',
    color: '#c53030',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '16px',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: '#718096',
  },
  doctorsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '20px',
  },
  doctorCard: {
    background: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '20px',
    transition: 'box-shadow 0.2s',
    cursor: 'pointer',
  },
  cardHeader: {
    display: 'flex',
    gap: '12px',
    marginBottom: '16px',
  },
  avatar: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  doctorInfo: {
    flex: 1,
  },
  doctorNameCard: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1a202c',
    margin: '0 0 4px 0',
  },
  specialtyCard: {
    fontSize: '14px',
    color: '#667eea',
    fontWeight: '500',
    margin: '0 0 4px 0',
  },
  experience: {
    fontSize: '12px',
    color: '#718096',
    margin: 0,
  },
  hospitalRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '12px',
  },
  hospitalText: {
    fontSize: '13px',
    color: '#718096',
  },
  statsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    background: '#f7fafc',
    borderRadius: '8px',
    marginBottom: '16px',
  },
  ratingBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '14px',
    fontWeight: '600',
  },
  reviews: {
    fontSize: '12px',
    color: '#718096',
    fontWeight: '400',
  },
  fee: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#48bb78',
  },
  cardActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  viewSlotsButton: {
    flex: 1,
    padding: '10px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
  },
  videoBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '8px',
    background: '#eff6ff',
    color: '#3b82f6',
    borderRadius: '6px',
    fontSize: '12px',
  },
  noResults: {
    textAlign: 'center',
    padding: '40px',
    color: '#718096',
  },
  backButton: {
    padding: '8px 16px',
    background: '#f7fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    cursor: 'pointer',
    marginBottom: '20px',
  },
  doctorHeader: {
    display: 'flex',
    gap: '20px',
    marginBottom: '32px',
    padding: '20px',
    background: 'white',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
  },
  avatarLarge: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  doctorName: {
    fontSize: '28px',
    fontWeight: '700',
    margin: '0 0 8px 0',
  },
  specialty: {
    fontSize: '16px',
    color: '#667eea',
    fontWeight: '500',
    margin: '0 0 8px 0',
  },
  hospital: {
    fontSize: '14px',
    color: '#718096',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    margin: '0 0 8px 0',
  },
  rating: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '14px',
    fontWeight: '600',
  },
  slotsTitle: {
    fontSize: '20px',
    fontWeight: '600',
    marginBottom: '16px',
  },
  slotsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '16px',
  },
  slotCard: {
    background: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '16px',
    textAlign: 'center',
  },
  slotDate: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1a202c',
    marginBottom: '8px',
  },
  slotTime: {
    fontSize: '14px',
    color: '#667eea',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    marginBottom: '8px',
  },
  priorityBadge: {
    display: 'inline-block',
    padding: '4px 8px',
    background: '#fef3c7',
    color: '#92400e',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '600',
    marginBottom: '8px',
  },
  bookButton: {
    width: '100%',
    padding: '8px',
    background: '#48bb78',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '8px',
  },
};
