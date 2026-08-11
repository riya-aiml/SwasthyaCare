import React, { useState } from 'react';
import { Search, Bell, UserCheck, ShieldCheck, Ticket, User, Stethoscope } from 'lucide-react';
import { mockPatient } from '../data/mockData';

export default function Header({ role, setRole, onBookClick }) {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'var(--bg-primary)', padding: '0.4rem 0.85rem', borderRadius: 'var(--radius-pill)', border: '1px solid var(--border-color)' }}>
          <Ticket size={16} color="var(--primary-500)" />
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary-700)' }}>Live Token: {mockPatient.currentToken}</span>
          <span className="badge badge-standard" style={{ fontSize: '0.72rem' }}>{mockPatient.queuePosition} ahead</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        {/* Role Switcher Toggle */}
        <div style={{
          background: 'var(--bg-primary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-pill)',
          padding: '0.25rem',
          display: 'flex',
          gap: '0.25rem'
        }}>
          <button
            className={`btn ${role === 'patient' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.35rem 0.85rem', fontSize: '0.78rem', borderRadius: 'var(--radius-pill)' }}
            onClick={() => setRole('patient')}
          >
            <User size={14} />
            <span>Patient View</span>
          </button>
          <button
            className={`btn ${role === 'clinician' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.35rem 0.85rem', fontSize: '0.78rem', borderRadius: 'var(--radius-pill)' }}
            onClick={() => setRole('clinician')}
          >
            <Stethoscope size={14} />
            <span>Clinician View</span>
          </button>
        </div>

        <button className="btn btn-primary" onClick={onBookClick}>
          + Book OPD Slot
        </button>

        <div style={{ position: 'relative' }}>
          <button 
            className="btn btn-secondary" 
            style={{ padding: '0.55rem', borderRadius: '50%' }}
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications"
          >
            <Bell size={18} />
          </button>

          {showNotifications && (
            <div style={{
              position: 'absolute',
              top: '48px',
              right: 0,
              width: '320px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: '1rem',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 60
            }}>
              <div style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.9rem' }}>System Notifications</div>
              <div style={{ fontSize: '0.82rem', padding: '0.6rem', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', marginBottom: '0.5rem' }}>
                🎟️ <strong>Token Update</strong>: Your token <strong>OPD-A42</strong> is 3 positions away in Room 104.
              </div>
              <div style={{ fontSize: '0.82rem', padding: '0.6rem', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)' }}>
                ⭐ <strong>Priority Reserved</strong>: 15-20% Priority slot reserved based on ML Heart Risk score.
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.25rem 0.6rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-pill)' }}>
          <img src={mockPatient.avatar} alt={mockPatient.name} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
          <div style={{ fontSize: '0.82rem' }}>
            <div style={{ fontWeight: 700, lineHeight: 1.1 }}>{mockPatient.name}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{role === 'patient' ? 'Patient Portal' : 'Dr. Ananya (Clinician)'}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
