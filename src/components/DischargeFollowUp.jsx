import React, { useState } from 'react';
import { HeartHandshake, Calendar, Send, CheckCircle2, AlertCircle, PhoneCall } from 'lucide-react';
import { mockPatient } from '../data/mockData';

export default function DischargeFollowUp() {
  const [readmissionScore, setReadmissionScore] = useState(28);
  const [followUpDate, setFollowUpDate] = useState('2026-08-20');
  const [messageSent, setMessageSent] = useState(false);

  const handleTriggerFollowUp = () => {
    setMessageSent(true);
    setTimeout(() => {
      setMessageSent(false);
      alert(`Automated follow-up SMS and App Notification dispatched to ${mockPatient.name}!`);
    }, 1500);
  };

  return (
    <div className="grid-12">
      <div className="col-8 card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ background: 'var(--teal-50)', color: 'var(--teal-500)', padding: '0.6rem', borderRadius: '12px' }}>
            <HeartHandshake size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Post-Discharge Follow-Up Integration</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Automated readmission risk calculation & intelligent appointment scheduling</p>
          </div>
        </div>

        <div style={{
          background: 'var(--bg-primary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>30-Day Hospital Readmission Risk Score</div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: readmissionScore > 50 ? '#dc2626' : '#10b981' }}>
                {readmissionScore}% <span className="badge badge-routine" style={{ fontSize: '0.85rem', verticalAlign: 'middle' }}>Low-Moderate Risk</span>
              </div>
            </div>
            <span className="badge badge-standard">Auto-Calculated on Discharge</span>
          </div>

          <div style={{ fontSize: '0.88rem', color: 'var(--text-main)', marginBottom: '1rem' }}>
            System Recommendation: <strong>Schedule 7-Day Follow-Up Tele-Consultation with Dr. Ananya Sharma on {followUpDate}.</strong>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn btn-primary" onClick={handleTriggerFollowUp}>
              <Send size={16} />
              <span>{messageSent ? 'Sending Reminders...' : 'Dispatch Automated SMS & App Reminder'}</span>
            </button>
            <button className="btn btn-secondary" onClick={() => alert('Discharge fast-path triggered for low-risk patient.')}>
              Bypass Follow-Up (Low Risk Fast-Path)
            </button>
          </div>
        </div>

        {/* SMS / App Notification Preview */}
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.75rem' }}>Automated Patient Reminder Preview</h3>
        <div style={{
          background: 'var(--bg-primary)',
          border: '1px border-glow',
          borderRadius: 'var(--radius-md)',
          padding: '1rem',
          fontSize: '0.88rem',
          lineHeight: 1.5
        }}>
          📱 <strong>SMS Preview to {mockPatient.emergencyContact}:</strong>
          <p style={{ marginTop: '0.4rem', color: 'var(--text-muted)' }}>
            "Dear {mockPatient.name}, your Swasthya Care medical team has auto-scheduled your follow-up checkup on {followUpDate} at 10:00 AM. Tap to confirm or reschedule: https://swasthya.care/apt/followup-991"
          </p>
        </div>
      </div>

      <div className="col-4 card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Readmission Predictors</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.82rem' }}>
          <div style={{ background: 'var(--bg-primary)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontWeight: 700 }}>Medication Adherence Index</div>
            <div style={{ color: 'var(--emerald-600)' }}>94% Compliance (Low Risk)</div>
          </div>
          <div style={{ background: 'var(--bg-primary)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontWeight: 700 }}>Post-Op Vital Stability</div>
            <div style={{ color: 'var(--emerald-600)' }}>Stable BP & SpO2</div>
          </div>
          <div style={{ background: 'var(--bg-primary)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontWeight: 700 }}>Home Support & Mobility</div>
            <div style={{ color: 'var(--text-muted)' }}>Assisted Mobility</div>
          </div>
        </div>
      </div>
    </div>
  );
}
