import React, { useState } from 'react';
import { Heart, Activity, ChevronDown, ChevronUp, Calendar, ShieldCheck, ArrowRight } from 'lucide-react';
import { mockMLRiskResults } from '../data/mockData';

export default function MLRiskScoring({ onBookClick }) {
  const [expandedReason, setExpandedReason] = useState('reason-1');

  const toggleReason = (id) => {
    setExpandedReason(expandedReason === id ? null : id);
  };

  const disease = mockMLRiskResults.diseaseRisk;
  const readmission = mockMLRiskResults.readmissionRisk;
  const reasons = mockMLRiskResults.mainReasons;

  return (
    <div className="grid-12" style={{ gap: '1.75rem' }}>
      {/* Title Banner */}
      <div className="col-12 fade-slide-in stagger-1">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--primary-teal)', letterSpacing: '0.05em' }}>
              ML Prediction Model Output
            </div>
            <h1 className="font-patient-heading" style={{ fontSize: '1.85rem', fontWeight: 700 }}>
              Risk Assessment Results
            </h1>
          </div>
          <button className="btn btn-primary" onClick={onBookClick}>
            <Calendar size={16} />
            <span>Book Priority Appointment</span>
          </button>
        </div>
      </div>

      {/* Side-by-Side Result Cards — Sequential Staggered Entrance */}
      <div className="col-6 fade-slide-in stagger-2">
        <div className="card" style={{ height: '100%', borderLeft: '4px solid var(--risk-high)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                Machine Learning Model 1
              </div>
              <h3 className="font-patient-heading" style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: '2px' }}>
                Chronic Disease Risk
              </h3>
            </div>
            <span className="badge badge-high" style={{ fontSize: '0.9rem', padding: '0.35rem 0.85rem' }}>
              {disease.level} (<span className="font-mono-num">{disease.score}%</span>)
            </span>
          </div>

          <div style={{ background: 'var(--risk-high-bg)', padding: '1.1rem', borderRadius: 'var(--radius-patient)', border: '1px solid var(--risk-high-border)', marginBottom: '1.25rem' }}>
            <p style={{ fontSize: '0.92rem', color: 'var(--risk-high)', lineHeight: 1.5, fontWeight: 600 }}>
              "{disease.summary}"
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            <ShieldCheck size={16} color="var(--primary-teal)" />
            <span>Model confidence: <strong className="font-mono-num">92.4%</strong> • Trained on 50,000+ anonymized clinical records</span>
          </div>
        </div>
      </div>

      <div className="col-6 fade-slide-in stagger-2">
        <div className="card" style={{ height: '100%', borderLeft: '4px solid var(--risk-medium)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                Machine Learning Model 2
              </div>
              <h3 className="font-patient-heading" style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: '2px' }}>
                30-Day Readmission Risk
              </h3>
            </div>
            <span className="badge badge-medium" style={{ fontSize: '0.9rem', padding: '0.35rem 0.85rem' }}>
              {readmission.level} (<span className="font-mono-num">{readmission.score}%</span>)
            </span>
          </div>

          <div style={{ background: 'var(--risk-medium-bg)', padding: '1.1rem', borderRadius: 'var(--radius-patient)', border: '1px solid var(--risk-medium-border)', marginBottom: '1.25rem' }}>
            <p style={{ fontSize: '0.92rem', color: '#B87E2C', lineHeight: 1.5, fontWeight: 600 }}>
              "{readmission.summary}"
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            <ShieldCheck size={16} color="var(--risk-medium)" />
            <span>Predicts probability of hospital readmission within 30 days post-discharge</span>
          </div>
        </div>
      </div>

      {/* Main Reasons — Explainability Section Staggered Reveal */}
      <div className="col-12 card fade-slide-in stagger-3">
        <div style={{ marginBottom: '1.25rem' }}>
          <h3 className="font-patient-heading" style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.25rem' }}>
            Main Contributing Factors ("Main Reasons")
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            AI Transparency Guarantee: Clear plain-language drivers behind your calculated risk score.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {reasons.map((item) => {
            const isExpanded = expandedReason === item.id;
            return (
              <div 
                key={item.id} 
                style={{
                  border: isExpanded ? '1px solid var(--primary-teal)' : '1px solid #E2E8E8',
                  borderRadius: 'var(--radius-patient)',
                  background: isExpanded ? 'var(--primary-teal-light)' : 'var(--bg-patient)',
                  transition: 'var(--transition)'
                }}
              >
                <div 
                  onClick={() => toggleReason(item.id)}
                  style={{
                    padding: '1rem 1.25rem',
                    display: 'flex',
                    justify: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.98rem', color: 'var(--text-charcoal)' }}>
                      {item.title}
                    </span>
                    <span className="badge badge-standard font-mono-num" style={{ fontSize: '0.78rem' }}>
                      {item.impact}
                    </span>
                  </div>
                  {isExpanded ? <ChevronUp size={20} color="var(--primary-teal)" /> : <ChevronDown size={20} color="var(--text-muted)" />}
                </div>

                {isExpanded && (
                  <div style={{ padding: '0 1.25rem 1.25rem 1.25rem', borderTop: '1px solid rgba(46, 111, 114, 0.15)', paddingTop: '0.85rem', fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    {item.detail}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Primary Priority Booking CTA & Encouragement */}
      <div className="col-8 card fade-slide-in stagger-3" style={{ background: 'linear-gradient(135deg, var(--primary-teal-light), #FFFFFF)', border: '1px solid rgba(46, 111, 114, 0.2)' }}>
        <h3 className="font-patient-heading" style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--primary-teal-dark)', marginBottom: '0.5rem' }}>
          Reserve Your Priority Appointment
        </h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
          Based on your High Disease Risk (<span className="font-mono-num">78%</span>) and Medium Readmission Risk (<span className="font-mono-num">68%</span>), the system has unlocked <strong>15–20% reserved priority appointment slots</strong> for Dr. Amanda Vance within 24–48 hours.
        </p>

        <button className="btn btn-coral" style={{ padding: '0.75rem 1.75rem' }} onClick={onBookClick}>
          <Calendar size={18} />
          <span>Book Priority Appointment Slot Now</span>
        </button>
      </div>

      {/* Reassuring Encouragement Box */}
      <div className="col-4 card fade-slide-in stagger-3" style={{ background: 'var(--risk-low-bg)', border: '1px solid var(--risk-low-border)' }}>
        <h4 className="font-patient-heading" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--risk-low)', marginBottom: '0.5rem' }}>
          We're Here to Support You
        </h4>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1rem' }}>
          A high risk score is an early warning indicator to help you get timely preventive care — not a diagnosis.
        </p>
        <button style={{ background: 'none', border: 'none', color: 'var(--risk-low)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
          Explore Preventive Health Tips →
        </button>
      </div>
    </div>
  );
}
