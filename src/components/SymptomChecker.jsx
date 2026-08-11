import React, { useState } from 'react';
import { Heart, ShieldAlert, Sparkles, ArrowRight, RotateCcw, Stethoscope } from 'lucide-react';

export default function SymptomChecker({ onBookDoctor }) {
  const [step, setStep] = useState(1);
  const [primarySymptom, setPrimarySymptom] = useState('');
  const [severity, setSeverity] = useState('Mild');
  const [duration, setDuration] = useState('1-2 Days');
  const [associated, setAssociated] = useState([]);

  const commonSymptoms = [
    'Chest Tightness / Fluttering',
    'Mild Headache & Fatigue',
    'Shortness of Breath',
    'Acidity / Indigestion',
    'Dizziness or Lightheadedness',
    'Joint Pain & Stiffness'
  ];

  const handleSymptomToggle = (sym) => {
    if (associated.includes(sym)) {
      setAssociated(associated.filter(s => s !== sym));
    } else {
      setAssociated([...associated, sym]);
    }
  };

  const getTriageResult = () => {
    if (primarySymptom.includes('Chest') || severity === 'Severe') {
      return {
        urgency: 'Moderate to High',
        badgeClass: 'status-alert',
        recommendation: 'Cardiology Assessment Recommended',
        summary: 'Your reported symptoms indicate potential cardiovascular stress. We recommend a tele-consultation with Dr. Ananya Sharma or an ECG check.',
        specialist: 'Cardiologist'
      };
    }
    return {
      urgency: 'Low Risk',
      badgeClass: 'status-normal',
      recommendation: 'General Wellness Care & Hydration',
      summary: 'Symptoms appear mild and non-critical. Maintain adequate fluid intake and rest. Schedule a general physician checkup if symptoms persist past 3 days.',
      specialist: 'General Physician'
    };
  };

  const resetForm = () => {
    setStep(1);
    setPrimarySymptom('');
    setSeverity('Mild');
    setAssociated([]);
  };

  return (
    <div className="card" style={{ gridColumn: 'span 12' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '0.6rem', borderRadius: '12px' }}>
          <Sparkles size={24} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>AI Patient Intake & Symptom Triage</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Guided symptom evaluation aligned with clinical triage guidelines</p>
        </div>
      </div>

      {step === 1 && (
        <div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.75rem' }}>Step 1: Select your main health complaint</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {commonSymptoms.map(sym => (
              <button
                key={sym}
                className={`btn ${primarySymptom === sym ? 'btn-primary' : 'btn-secondary'}`}
                style={{ textAlign: 'left', justifyContent: 'flex-start', padding: '0.75rem 1rem' }}
                onClick={() => setPrimarySymptom(sym)}
              >
                {sym}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              className="btn btn-primary"
              disabled={!primarySymptom}
              onClick={() => setStep(2)}
            >
              <span>Next: Symptom Details</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '1rem' }}>Step 2: How severe is the discomfort?</h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">Severity Level</label>
              <select 
                className="form-select"
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
              >
                <option value="Mild">Mild (Noticeable but does not affect daily work)</option>
                <option value="Moderate">Moderate (Interferes with routine activity)</option>
                <option value="Severe">Severe (Intense discomfort / Requires urgent care)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Duration</label>
              <select 
                className="form-select"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              >
                <option value="Just today">Just started today</option>
                <option value="1-2 Days">1-2 Days</option>
                <option value="Past 1 Week">Past 1 Week</option>
                <option value="More than a month">More than a month</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button className="btn btn-secondary" onClick={() => setStep(1)}>Back</button>
            <button className="btn btn-primary" onClick={() => setStep(3)}>
              <span>Generate Clinical Assessment</span>
              <Sparkles size={16} />
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-glow)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <ShieldAlert size={22} color={getTriageResult().urgency.includes('High') ? '#f43f5e' : '#10b981'} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{getTriageResult().recommendation}</h3>
            </div>
            <span className={`status-badge ${getTriageResult().badgeClass}`}>
              Urgency Level: {getTriageResult().urgency}
            </span>
          </div>

          <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: 1.6 }}>
            {getTriageResult().summary}
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => onBookDoctor(getTriageResult().specialist)}>
              <Stethoscope size={16} />
              <span>Book Consultation with {getTriageResult().specialist}</span>
            </button>
            <button className="btn btn-secondary" onClick={resetForm}>
              <RotateCcw size={16} />
              <span>Start New Checkup</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
