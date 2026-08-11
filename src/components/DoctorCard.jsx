import React from 'react';
import { Star, Video, MapPin, Calendar, Clock } from 'lucide-react';

export default function DoctorCard({ doctor, onBook }) {
  return (
    <div className="doctor-card">
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <img src={doctor.avatar} alt={doctor.name} className="doctor-avatar" />
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{doctor.name}</h3>
          <div style={{ fontSize: '0.82rem', color: 'var(--primary-500)', fontWeight: 600 }}>
            {doctor.specialty}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {doctor.experience}
          </div>
        </div>
      </div>

      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <MapPin size={14} color="var(--text-subtle)" />
        <span>{doctor.hospital}</span>
      </div>

      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        padding: '0.6rem 0.85rem',
        background: 'var(--bg-primary)',
        borderRadius: 'var(--radius-md)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Star size={16} color="#f59e0b" fill="#f59e0b" />
          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{doctor.rating}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>({doctor.reviews} reviews)</span>
        </div>
        <div style={{ fontWeight: 700, color: '#34d399', fontSize: '0.95rem' }}>
          {doctor.fee}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
        <button 
          className="btn btn-primary" 
          style={{ flex: 1, padding: '0.55rem', fontSize: '0.82rem' }}
          onClick={() => onBook(doctor)}
        >
          <Calendar size={14} />
          <span>Book Slot</span>
        </button>
        {doctor.onlineConsult && (
          <button 
            className="btn btn-secondary"
            style={{ padding: '0.55rem', fontSize: '0.82rem' }}
            title="Video Consultation Available"
            onClick={() => onBook(doctor)}
          >
            <Video size={16} color="#38bdf8" />
          </button>
        )}
      </div>
    </div>
  );
}
