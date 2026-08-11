import React, { useState } from 'react';
import { BrainCircuit, ShieldCheck, Calendar, Sparkles, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';
import { mockMLRiskScores, mockFairnessAudit, mockPrioritySlots } from '../data/mockData';

export default function MLRiskScoring() {
  const [selectedCondition, setSelectedCondition] = useState('heartDiseaseRisk');
  const [reservedSlot, setReservedSlot] = useState(false);

  const currentRisk = mockMLRiskScores[selectedCondition];

  return (
    <div className="grid-12">
      {/* Risk Model Selector & Card */}
      <div className="col-8 card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>ML Disease & Readmission Risk Classification</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Supervised risk prediction with model explainability & feature importance</p>
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-primary)', padding: '0.25rem', borderRadius: 'var(--radius-md)' }}>
            <button
              className={`btn ${selectedCondition === 'heartDiseaseRisk' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem' }}
              onClick={() => setSelectedCondition('heartDiseaseRisk')}
            >
              Heart Disease
            </button>
            <button
              className={`btn ${selectedCondition === 'diabetesRisk' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem' }}
              onClick={() => setSelectedCondition('diabetesRisk')}
            >
              Diabetes
            </button>
            <button
              className={`btn ${selectedCondition === 'readmissionRisk' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem' }}
              onClick={() => setSelectedCondition('readmissionRisk')}
            >
              Readmission
            </button>
          </div>
        </div>

        {/* Risk Score Highlight Box */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.08), rgba(13, 148, 136, 0.08))',
          border: '1px solid var(--primary-100)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem'
        }}>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>Predicted Risk Score</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: currentRisk.score > 75 ? '#dc2626' : '#0284c7', fontFamily: 'var(--font-heading)' }}>
              {currentRisk.score}%
              <span className={`badge ${currentRisk.score > 75 ? 'badge-emergency' : 'badge-standard'}`} style={{ marginLeft: '1rem', verticalAlign: 'middle' }}>
                {currentRisk.level}
              </span>
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-subtle)', marginTop: '0.2rem' }}>
              Model Classification Confidence: <strong>{currentRisk.confidence}</strong>
            </div>
          </div>

          <button 
            className="btn btn-primary"
            style={{ background: 'var(--emerald-500)', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }}
            onClick={() => setReservedSlot(true)}
          >
            <Calendar size={16} />
            <span>{reservedSlot ? '✓ Slot Reserved' : 'Reserve 15-20% Priority Slot'}</span>
          </button>
        </div>

        {/* Feature Importance Explainability */}
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.75rem' }}>Key Contributing Risk Factors (Explainability)</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.5rem' }}>
          {currentRisk.keyFactors.map((f, i) => (
            <div key={i} style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{f.factor}</span>
              <span style={{ fontWeight: 800, color: f.impact.includes('+') ? '#dc2626' : '#16a34a' }}>
                Impact Weight: {f.impact}
              </span>
            </div>
          ))}
        </div>

        <div style={{ background: 'var(--primary-50)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary-100)' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary-700)' }}>Clinical Decision Support Guidance:</div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-main)', marginTop: '0.25rem' }}>{currentRisk.recommendedAction}</p>
        </div>
      </div>

      {/* Demographic Fairness Check Layer */}
      <div className="col-4 card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <ShieldCheck size={22} color="var(--teal-500)" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Demographic Fairness Audit</h3>
        </div>

        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          Monitors prediction equity across age, gender, and socio-economic cohorts to prevent demographic bias.
        </p>

        <div style={{
          background: 'var(--teal-50)',
          border: '1px solid var(--teal-100)',
          borderRadius: 'var(--radius-md)',
          padding: '0.75rem',
          fontSize: '0.82rem',
          color: 'var(--teal-600)',
          fontWeight: 700,
          marginBottom: '1.25rem',
          textAlign: 'center'
        }}>
          {mockFairnessAudit.overallParityRatio} — {mockFairnessAudit.mitigationStatus}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {mockFairnessAudit.demographicDisparity.map((demo, idx) => (
            <div key={idx} style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.65rem 0.85rem',
              fontSize: '0.82rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                <span>{demo.group}</span>
                <span style={{ color: 'var(--emerald-600)' }}>{demo.disparityDelta} Delta</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginTop: '0.2rem', fontSize: '0.75rem' }}>
                <span>Predicted: {demo.predictedRiskRate}</span>
                <span>Baseline: {demo.baselineRate}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 15-20% Priority Reserved Slots Schedule */}
      <div className="col-12 card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>15–20% Reserved Priority Slots Allocation</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          {mockPrioritySlots.map((slot, idx) => (
            <div key={idx} style={{
              background: slot.isPriority ? 'var(--primary-50)' : 'var(--bg-primary)',
              border: slot.isPriority ? '1px solid var(--primary-500)' : '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>{slot.time}</span>
                <span className={`badge ${slot.isPriority ? 'badge-emergency' : 'badge-standard'}`}>
                  {slot.isPriority ? '⭐ Priority Reserved (15-20%)' : 'Standard'}
                </span>
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{slot.doctor}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{slot.status}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
