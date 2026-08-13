import React, { useState } from 'react';
import { Bell, Ticket, User, Stethoscope, ShieldCheck, Calendar } from 'lucide-react';
import { mockPatient } from '../data/mockData';

export default function Header({ role, setRole, onBookClick }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <header className="header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        {role === 'patient' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'var(--primary-50)', padding: '0.4rem 0.85rem', borderRadius: 'var(--radius-pill)', border: '1px solid var(--primary-100)' }}>
            <Ticket size={16} color="var(--primary-500)" />
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary-700)' }}>Live Token: {mockPatient.currentToken}</span>
            <span className="badge badge-standard" style={{ fontSize: '0.72rem' }}>~{mockPatient.estimatedWaitMins}m wait</span>
          </div>
        )}

        {role === 'clinician' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.88rem', fontWeight: 600 }}>
            <Calendar size={16} />
            <span>Today: {todayStr} • Duty Department: Cardiology</span>
          </div>
        )}

        {role === 'admin' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--teal-600)', fontSize: '0.88rem', fontWeight: 700 }}>
            <ShieldCheck size={18} />
            <span>Fairness & Bias Governance Console</span>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Role Switcher Pill */}
        <div className="role-switcher">
          <button
            className={`role-btn ${role === 'patient' ? 'active' : ''}`}
            onClick={() => setRole('patient')}
          >
            <User size={13} style={{ display: 'inline', marginRight: '4px' }} />
            Patient View
          </button>
          <button
            className={`role-btn ${role === 'clinician' ? 'active' : ''}`}
            onClick={() => setRole('clinician')}
          >
            <Stethoscope size={13} style={{ display: 'inline', marginRight: '4px' }} />
            Clinician Dashboard
          </button>
          <button
            className={`role-btn ${role === 'admin' ? 'active' : ''}`}
            onClick={() => setRole('admin')}
          >
            <ShieldCheck size={13} style={{ display: 'inline', marginRight: '4px' }} />
            Bias Audit
          </button>
        </div>

        {role === 'patient' && (
          <button className="btn btn-primary" onClick={onBookClick}>
            + Book Appointment
          </button>
        )}

        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button 
            className="btn btn-secondary" 
            style={{ padding: '0.55rem', borderRadius: '50%', position: 'relative' }}
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications"
          >
            <Bell size={18} />
            <span style={{ position: 'absolute', top: 2, right: 2, width: 8, height: 8, borderRadius: '50%', background: 'var(--urgency-emergency)' }} />
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
              <div style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.9rem' }}>Notifications</div>
              <div style={{ fontSize: '0.82rem', padding: '0.6rem', background: 'var(--primary-50)', borderRadius: 'var(--radius-sm)', marginBottom: '0.5rem' }}>
                🎟️ <strong>Queue Update</strong>: Token <strong>A-047</strong> is 12th in queue for Cardiology Room 302.
              </div>
              <div style={{ fontSize: '0.82rem', padding: '0.6rem', background: 'var(--teal-50)', borderRadius: 'var(--radius-sm)' }}>
                ⭐ <strong>Priority Reserved</strong>: 15-20% Priority slot unlocked based on risk score.
              </div>
            </div>
          )}
        </div>

        {/* Profile indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.25rem 0.6rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-pill)' }}>
          <img src={role === 'clinician' ? "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200" : mockPatient.avatar} alt="Profile" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
          <div style={{ fontSize: '0.82rem' }}>
            <div style={{ fontWeight: 700, lineHeight: 1.1 }}>{role === 'clinician' ? 'Dr. Amanda Vance' : role === 'admin' ? 'Admin Compliance' : mockPatient.name}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{role === 'clinician' ? 'Cardiology Chief' : role === 'admin' ? 'Governance' : `MRN: ${mockPatient.id}`}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
