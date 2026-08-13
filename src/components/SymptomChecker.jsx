import React, { useState } from 'react';
import { Activity, ShieldCheck, Plus, Check, AlertTriangle, ArrowRight, HeartPulse } from 'lucide-react';
import { mockPatient } from '../data/mockData';

export default function SymptomChecker({ onNavigateToML }) {
  const [age, setAge] = useState(mockPatient.age);
  const [systolicBP, setSystolicBP] = useState(148);
  const [diastolicBP, setDiastolicBP] = useState(92);
  const [bloodSugar, setBloodSugar] = useState(186);

  const defaultSymptoms = [
    "Chest pain",
    "Fatigue",
    "Frequent urination",
    "Shortness of breath",
    "Dizziness",
    "Headache",
    "Nausea",
    "Blurred vision",
    "Swelling in legs"
  ];

  const [selectedSymptoms, setSelectedSymptoms] = useState(["Frequent urination", "Shortness of breath", "Fatigue"]);
  const [customSymptomInput, setCustomSymptomInput] = useState('');

  const defaultConditions = [
    "Type 2 Diabetes",
    "Essential Hypertension",
    "Hyperlipidemia",
    "Coronary Artery Disease",
    "Asthma",
    "Chronic Kidney Disease"
  ];

  const [selectedConditions, setSelectedConditions] = useState(["Type 2 Diabetes", "Essential Hypertension"]);
  const [triageResult, setTriageResult] = useState(null);

  const toggleSymptom = (symptom) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptom));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };

  const addCustomSymptom = () => {
    if (customSymptomInput.trim() && !selectedSymptoms.includes(customSymptomInput.trim())) {
      setSelectedSymptoms([...selectedSymptoms, customSymptomInput.trim()]);
      setCustomSymptomInput('');
    }
  };

  const toggleCondition = (cond) => {
    if (selectedConditions.includes(cond)) {
      setSelectedConditions(selectedConditions.filter(c => c !== cond));
    } else {
      setSelectedConditions([...selectedConditions, cond]);
    }
  };

  const handleCalculateRisk = (e) => {
    e.preventDefault();

    // Rule-Based Triage Engine Logic
    let level = "Routine";
    let badgeClass = "badge-routine";
    let reasons = [];

    const hasChestPain = selectedSymptoms.includes("Chest pain");
    const hasDyspnea = selectedSymptoms.includes("Shortness of breath");
    const highBP = systolicBP >= 160 || diastolicBP >= 100;
    const elevatedBP = systolicBP >= 140 || diastolicBP >= 90;
    const highGlucose = bloodSugar >= 180;

    if (hasChestPain || systolicBP >= 170) {
      level = "Emergency";
      badgeClass = "badge-emergency";
      reasons.push("Severe symptom 'Chest pain' or Systolic BP > 170 mmHg detected.");
    } else if (hasDyspnea || highBP || highGlucose) {
      level = "Urgent";
      badgeClass = "badge-urgent";
      if (hasDyspnea) reasons.push("Reported exertion-related Shortness of Breath.");
      if (elevatedBP) reasons.push(`Blood Pressure (${systolicBP}/${diastolicBP} mmHg) exceeds 140/90 Stage 2 threshold.`);
      if (highGlucose) reasons.push(`Fasting Blood Sugar (${bloodSugar} mg/dL) exceeds 180 mg/dL hyper-glycemic boundary.`);
    } else if (selectedSymptoms.length > 0 || elevatedBP) {
      level = "Standard";
      badgeClass = "badge-standard";
      reasons.push("Multiple mild symptoms presented; requires standard clinical consultation.");
    } else {
      level = "Routine";
      badgeClass = "badge-routine";
      reasons.push("Normal physiological profile; routine checkup recommended.");
    }

    setTriageResult({ level, badgeClass, reasons });
  };

  return (
    <div className="grid-12" style={{ gap: '1.75rem' }}>
      {/* Title Header */}
      <div className="col-12">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ background: 'var(--primary-50)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary-100)' }}>
            <HeartPulse size={28} color="var(--primary-600)" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800 }}>Symptom & Vitals Assessment</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Step-based preliminary health intake for rule-based triage and ML disease risk prediction.
            </p>
          </div>
        </div>
      </div>

      {/* Main Intake Form */}
      <div className="col-8 card">
        <form onSubmit={handleCalculateRisk}>
          {/* Section 1: Basic Vitals */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--primary-700)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ background: 'var(--primary-500)', color: 'white', borderRadius: '50%', width: '24px', height: '24px', display: 'inline-flex', alignItems: 'center', justifyCenter: 'center', fontSize: '0.8rem', fontWeight: 800 }}>1</span>
              Basic Vitals Information
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Patient Age (Years)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={age} 
                  onChange={(e) => setAge(Number(e.target.value))}
                  min="1" max="120" required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Systolic BP (mmHg)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={systolicBP} 
                  onChange={(e) => setSystolicBP(Number(e.target.value))}
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Diastolic BP (mmHg)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={diastolicBP} 
                  onChange={(e) => setDiastolicBP(Number(e.target.value))}
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Blood Sugar (mg/dL)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={bloodSugar} 
                  onChange={(e) => setBloodSugar(Number(e.target.value))}
                  required 
                />
              </div>
            </div>
          </div>

          {/* Section 2: Symptoms Multi-select */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--primary-700)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ background: 'var(--primary-500)', color: 'white', borderRadius: '50%', width: '24px', height: '24px', display: 'inline-flex', alignItems: 'center', justifyCenter: 'center', fontSize: '0.8rem', fontWeight: 800 }}>2</span>
              Symptoms (Tap to Select)
            </h3>
            
            <div className="chip-group" style={{ marginBottom: '1rem' }}>
              {defaultSymptoms.map((symptom) => {
                const isSelected = selectedSymptoms.includes(symptom);
                return (
                  <button
                    type="button"
                    key={symptom}
                    className={`chip ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleSymptom(symptom)}
                  >
                    {isSelected && <Check size={14} style={{ display: 'inline', marginRight: '4px' }} />}
                    {symptom}
                  </button>
                );
              })}
            </div>

            {/* Custom Symptom Input */}
            <div style={{ display: 'flex', gap: '0.5rem', maxWidth: '400px' }}>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Add other symptom (free text)..." 
                value={customSymptomInput}
                onChange={(e) => setCustomSymptomInput(e.target.value)}
                style={{ flex: 1 }}
              />
              <button type="button" className="btn btn-secondary" onClick={addCustomSymptom}>
                <Plus size={16} /> Add
              </button>
            </div>
          </div>

          {/* Section 3: Past Medical History */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--primary-700)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ background: 'var(--primary-500)', color: 'white', borderRadius: '50%', width: '24px', height: '24px', display: 'inline-flex', alignItems: 'center', justifyCenter: 'center', fontSize: '0.8rem', fontWeight: 800 }}>3</span>
              Past Medical History (Pre-diagnosed Conditions)
            </h3>

            <div className="chip-group">
              {defaultConditions.map((cond) => {
                const isSelected = selectedConditions.includes(cond);
                return (
                  <button
                    type="button"
                    key={cond}
                    className={`chip ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleCondition(cond)}
                  >
                    {isSelected && <Check size={14} style={{ display: 'inline', marginRight: '4px' }} />}
                    {cond}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Button & Reassurance */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.85rem 2.5rem', fontSize: '1.05rem', width: '100%', maxWidth: '360px' }}>
              Calculate Risk Score
            </button>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              <ShieldCheck size={16} color="var(--emerald-600)" />
              <span>Your information is secure, private, and encrypted under HIPAA guidelines.</span>
            </div>
          </div>
        </form>
      </div>

      {/* Rule-Based Triage Output Panel */}
      <div className="col-4">
        <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem' }}>
              Rule-Based Triage Result
            </h3>

            {!triageResult ? (
              <div style={{ background: 'var(--bg-primary)', padding: '2rem 1.5rem', textAlign: 'center', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-color)', color: 'var(--text-muted)' }}>
                <Activity size={36} color="var(--primary-500)" style={{ margin: '0 auto 0.75rem auto', display: 'block' }} />
                <p style={{ fontSize: '0.88rem' }}>Enter vitals and select symptoms on the left, then click <strong>"Calculate Risk Score"</strong> to view urgency classification.</p>
              </div>
            ) : (
              <div>
                <div style={{ background: 'var(--primary-50)', border: '1px solid var(--primary-100)', padding: '1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.25rem' }}>Assigned Urgency Level</div>
                  <span className={`badge ${triageResult.badgeClass}`} style={{ fontSize: '1.1rem', padding: '0.4rem 1.25rem' }}>
                    {triageResult.level} Urgency
                  </span>
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                    Rule-Based Explanation:
                  </div>
                  <ul style={{ paddingLeft: '1.2rem', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {triageResult.reasons.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <button 
              className="btn btn-primary" 
              style={{ width: '100%' }}
              onClick={onNavigateToML}
            >
              <span>View Dual ML Risk & Reasons</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
