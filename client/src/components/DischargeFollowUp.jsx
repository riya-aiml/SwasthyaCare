import React, { useState } from 'react';
import { ClipboardList, Bell, Calendar, CheckCircle2, ShieldCheck, AlertTriangle, ArrowRight, MessageSquare } from 'lucide-react';
import { mockDischargeData } from '../data/mockData';

export default function DischargeFollowUp({ onBookClick }) {
  const [dischargeInfo, setDischargeInfo] = useState(mockDischargeData);
  const [remindersSent, setRemindersSent] = useState(false);
  const [isLowRiskToggle, setIsLowRiskToggle] = useState(false);

  const currentRiskScore = isLowRiskToggle ? 14 : dischargeInfo.readmissionRiskScore;
  const currentRiskLevel = isLowRiskToggle ? "Low Risk" : dischargeInfo.readmissionRiskLevel;

  const handleTriggerReminders = () => {
    setRemindersSent(true);
  };

  return (
    <div className="grid-12" style={{ gap: '1.75rem' }}>
      {/* Header Title */}
      <div className="col-12">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--primary-600)', letterSpacing: '0.05em' }}>
              Automated Continuum of Care
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Post-Discharge Follow-Up Integration</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Auto-calculates readmission risk at discharge, configures automated SMS/Push reminders, and suggests priority follow-up.
            </p>
          </div>

          {/* Toggle for Low Risk Path Demo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'var(--bg-surface)', padding: '0.45rem 0.85rem', borderRadius: 'var(--radius-pill)', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>Simulate Risk State:</span>
            <button 
              className={`btn ${!isLowRiskToggle ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem', borderRadius: 'var(--radius-pill)' }}
              onClick={() => setIsLowRiskToggle(false)}
            >
              Medium-High Risk (68%)
            </button>
            <button 
              className={`btn ${isLowRiskToggle ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem', borderRadius: 'var(--radius-pill)' }}
              onClick={() => setIsLowRiskToggle(true)}
            >
              Low Risk (14%)
            </button>
          </div>
        </div>
      </div>

      {/* Discharge Summary Card */}
      <div className="col-6 card">
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem' }}>Discharge Summary & Risk Score</h3>

        <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', fontSize: '0.88rem' }}>
            <div>Patient Name: <strong>{dischargeInfo.patientName}</strong></div>
            <div>MRN: <strong>{dischargeInfo.mrn}</strong></div>
            <div>Discharge Date: <strong>{dischargeInfo.dischargeDate}</strong></div>
            <div>Primary Diagnosis: <strong>{dischargeInfo.dischargeDiagnosis}</strong></div>
          </div>
        </div>

        {/* Calculated Readmission Score */}
        <div style={{ background: isLowRiskToggle ? 'var(--teal-50)' : 'var(--primary-50)', border: isLowRiskToggle ? '1px solid var(--teal-100)' : '1px solid var(--primary-100)', padding: '1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>Calculated 30-Day Readmission Risk:</span>
            <span className={`badge ${isLowRiskToggle ? 'badge-routine' : 'badge-urgent'}`} style={{ fontSize: '0.9rem' }}>
              {currentRiskLevel} ({currentRiskScore}%)
            </span>
          </div>

          {!isLowRiskToggle ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--primary-800)', lineHeight: 1.5 }}>
              ⚠️ High-probability readmission vector detected. Automated 7-day post-discharge priority consultation and daily SMS check-in configured.
            </p>
          ) : (
            <p style={{ fontSize: '0.85rem', color: 'var(--teal-600)', lineHeight: 1.5 }}>
              ✅ Low readmission risk. System has routed patient to the <strong>Optional Follow-Up Path</strong> to prevent hospital over-scheduling.
            </p>
          )}
        </div>
      </div>

      {/* Auto-Suggested Follow-Up Appointment */}
      <div className="col-6 card">
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem' }}>Suggested Follow-Up & Reminders</h3>

        {!isLowRiskToggle ? (
          <div>
            <div style={{ border: '1px solid var(--primary-200)', borderRadius: 'var(--radius-md)', padding: '1.25rem', background: 'var(--primary-50)', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--primary-700)', fontWeight: 800, marginBottom: '0.4rem' }}>
                System Recommendation
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-800)', marginBottom: '0.5rem' }}>
                Priority Cardiology Clinic Visit
              </h4>
              <div style={{ fontSize: '0.88rem', color: 'var(--text-main)', marginBottom: '0.75rem' }}>
                Suggested Date: <strong>{dischargeInfo.recommendedFollowUpDate}</strong> • Doctor: <strong>{dischargeInfo.suggestedDoctor}</strong>
              </div>
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={onBookClick}>
                <Calendar size={16} />
                <span>Confirm & Reserve Suggested Slot</span>
              </button>
            </div>

            {/* Notification Reminders */}
            <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>Configured Follow-Up Reminders:</span>
                {remindersSent ? (
                  <span className="badge badge-routine"><CheckCircle2 size={13} /> Active</span>
                ) : (
                  <button className="btn btn-secondary" style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }} onClick={handleTriggerReminders}>
                    Enable SMS/Push
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                <div>📱 <strong>SMS:</strong> +1 (555) 234-5678 (3 Days & 1 Day prior to visit)</div>
                <div>🔔 <strong>App Push:</strong> Daily medication log & symptom check prompt</div>
              </div>
            </div>
          </div>
        ) : (
          /* Low-Risk Optional Path */
          <div style={{ border: '1px solid var(--teal-100)', borderRadius: 'var(--radius-md)', padding: '1.5rem', background: 'var(--teal-50)', textAlign: 'center' }}>
            <CheckCircle2 size={36} color="var(--teal-600)" style={{ margin: '0 auto 0.75rem auto' }} />
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--teal-600)', marginBottom: '0.5rem' }}>
              Unimportant / Optional Follow-Up Path
            </h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Because your 30-day readmission risk is minimal (14%), mandatory in-clinic follow-up is not required. You may book an optional telehealth check-in if symptoms arise.
            </p>
            <button className="btn btn-secondary" onClick={onBookClick}>
              Book Optional Telehealth Consultation
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
