import React, { useState } from 'react';
import { Activity, ShieldAlert, CheckCircle, Info, ChevronRight, RotateCcw } from 'lucide-react';
import { mockTriageRules } from '../data/mockData';

export default function TriageEngine({ onNavigateToML }) {
  const [systolic, setSystolic] = useState(138);
  const [diastolic, setDiastolic] = useState(88);
  const [heartRate, setHeartRate] = useState(78);
  const [spo2, setSpo2] = useState(98);
  const [temp, setTemp] = useState(98.6);
  const [symptom, setSymptom] = useState('Chest Tightness / Mild Fluttering');
  const [duration, setDuration] = useState('1-2 Days');
  const [severity, setSeverity] = useState('Moderate');
  const [evaluated, setEvaluated] = useState(false);

  const calculateTriage = () => {
    // Rule-Based Decision Tree Logic
    if (systolic >= 160 || heartRate >= 120 || spo2 < 90 || symptom.includes('Severe Chest')) {
      return {
        level: 'Emergency',
        badgeClass: 'badge-emergency',
        matchedRule: 'TR-01: Severe Cardiovascular / Respiratory Distress Rule',
        explanation: `Assigned EMERGENCY urgency level because Systolic BP (${systolic} mmHg) or Heart Rate (${heartRate} bpm) exceeded critical safety threshold.`,
        action: 'Immediate Resuscitation & Emergency OPD Fast-Track (Token ER-01)'
      };
    }
    if (systolic >= 135 || temp >= 101 || spo2 < 95 || symptom.includes('Chest Tightness')) {
      return {
        level: 'Urgent',
        badgeClass: 'badge-urgent',
        matchedRule: 'TR-02: Acute Cardiac Warning & Elevated BP Rule',
        explanation: `Assigned URGENT level due to presenting symptom '${symptom}' combined with Systolic BP (${systolic} mmHg).`,
        action: 'Priority OPD Token (Fast-Tracked within 15 mins)'
      };
    }
    if (temp >= 99 || duration.includes('Week')) {
      return {
        level: 'Standard',
        badgeClass: 'badge-standard',
        matchedRule: 'TR-03: Standard Symptom Presentation Rule',
        explanation: 'Assigned STANDARD level for moderate persistent symptoms requiring clinician evaluation within normal OPD wait time.',
        action: 'Standard OPD Queue Allocation'
      };
    }
    return {
      level: 'Routine',
      badgeClass: 'badge-routine',
      matchedRule: 'TR-04: Routine Checkup & Follow-Up Rule',
      explanation: 'Assigned ROUTINE level for stable vital parameters and general follow-up complaint.',
      action: 'Scheduled Routine Slot'
    };
  };

  const result = calculateTriage();

  return (
    <div className="grid-12">
      <div className="col-12 card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ background: 'var(--primary-50)', color: 'var(--primary-500)', padding: '0.6rem', borderRadius: '12px' }}>
            <Activity size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Rule-Based Clinical Triage Engine</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Transparent decision-tree logic mapping vitals & symptoms to immediate urgency levels</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label">Systolic BP (mmHg)</label>
            <input 
              type="number" 
              className="form-input"
              value={systolic}
              onChange={(e) => setSystolic(Number(e.target.value))}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Diastolic BP (mmHg)</label>
            <input 
              type="number" 
              className="form-input"
              value={diastolic}
              onChange={(e) => setDiastolic(Number(e.target.value))}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Heart Rate (bpm)</label>
            <input 
              type="number" 
              className="form-input"
              value={heartRate}
              onChange={(e) => setHeartRate(Number(e.target.value))}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Oxygen Saturation SpO2 (%)</label>
            <input 
              type="number" 
              className="form-input"
              value={spo2}
              onChange={(e) => setSpo2(Number(e.target.value))}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Body Temp (°F)</label>
            <input 
              type="number" 
              step="0.1"
              className="form-input"
              value={temp}
              onChange={(e) => setTemp(Number(e.target.value))}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label">Primary Symptom</label>
            <select className="form-select" value={symptom} onChange={(e) => setSymptom(e.target.value)}>
              <option value="Chest Tightness / Mild Fluttering">Chest Tightness / Mild Fluttering</option>
              <option value="Severe Chest Pain & Radiating Arm Numbness">Severe Chest Pain & Radiating Arm Numbness</option>
              <option value="Shortness of Breath & Wheezing">Shortness of Breath & Wheezing</option>
              <option value="High Fever & Bodyache">High Fever & Bodyache</option>
              <option value="Routine Prescription Refill / Checkup">Routine Prescription Refill / Checkup</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Duration</label>
            <select className="form-select" value={duration} onChange={(e) => setDuration(e.target.value)}>
              <option value="Just today">Just started today</option>
              <option value="1-2 Days">1-2 Days</option>
              <option value="Past 1 Week">Past 1 Week</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Perceived Severity</label>
            <select className="form-select" value={severity} onChange={(e) => setSeverity(e.target.value)}>
              <option value="Mild">Mild</option>
              <option value="Moderate">Moderate</option>
              <option value="Severe">Severe</option>
            </select>
          </div>
        </div>

        <button className="btn btn-primary" style={{ width: '100%', padding: '0.85rem' }} onClick={() => setEvaluated(true)}>
          Evaluate Triage Rules & Generate Explanation
        </button>

        {evaluated && (
          <div style={{
            marginTop: '1.5rem',
            background: 'var(--bg-primary)',
            border: '1px solid var(--primary-100)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <ShieldAlert size={24} color={result.level === 'Emergency' ? '#ef4444' : '#0284c7'} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Triage Decision: <span className={`badge ${result.badgeClass}`}>{result.level}</span></h3>
              </div>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Rule ID: {result.matchedRule.split(':')[0]}</span>
            </div>

            <div style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary-700)', marginBottom: '0.35rem' }}>
                🔍 Transparent Logic Explanation:
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                {result.explanation}
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--emerald-600)' }}>
                Recommended Clinical Action: {result.action}
              </div>
              <button className="btn btn-primary" onClick={onNavigateToML}>
                <span>Proceed to ML Risk Scoring</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Rules Reference Table */}
      <div className="col-12 card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Configured Decision Tree Rules</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                <th style={{ padding: '0.6rem' }}>Rule ID & Name</th>
                <th style={{ padding: '0.6rem' }}>Condition Trigger</th>
                <th style={{ padding: '0.6rem' }}>Urgency Level</th>
                <th style={{ padding: '0.6rem' }}>Hospital Action</th>
              </tr>
            </thead>
            <tbody>
              {mockTriageRules.map(rule => (
                <tr key={rule.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.75rem', fontWeight: 700 }}>{rule.ruleName}</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>{rule.conditions}</td>
                  <td style={{ padding: '0.75rem' }}><span className={`badge ${rule.badgeClass}`}>{rule.urgency}</span></td>
                  <td style={{ padding: '0.75rem' }}>{rule.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
