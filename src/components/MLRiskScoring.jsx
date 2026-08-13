import React, { useState } from 'react';
import { Heart, Activity, AlertTriangle, ChevronDown, ChevronUp, Calendar, ShieldCheck, ArrowRight, CheckCircle2, HelpCircle } from 'lucide-react';
import { mockMLRiskResults, mockPatient } from '../data/mockData';

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
      <div className="col-12">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--primary-600)', letterSpacing: '0.05em' }}>
              ML Prediction Model Output
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Risk Assessment Results</h1>
          </div>
          <button className="btn btn-primary" onClick={onBookClick}>
            <Calendar size={16} />
            <span>Book Priority Appointment</span>
          </button>
        </div>
      </div>

      {/* Side-by-Side Result Cards */}
      <div className="col-6">
        <div className="card" style={{ height: '100%', borderLeft: '4px solid var(--urgency-emergency)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                Structured Machine Learning Model 1
              </div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: '2px' }}>
                Chronic Disease Risk
              </h3>
            </div>
            <span className={`badge ${disease.badgeClass}`} style={{ fontSize: '0.9rem', padding: '0.35rem 0.85rem' }}>
              {disease.level} ({disease.score}%)
            </span>
          </div>

          <div style={{ background: 'var(--primary-50)', padding: '1.1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary-100)', marginBottom: '1.25rem' }}>
            <p style={{ fontSize: '0.92rem', color: 'var(--primary-800)', lineHeight: 1.5, fontWeight: 600 }}>
              "{disease.summary}"
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            <ShieldCheck size={16} color="var(--primary-600)" />
            <span>Model confidence: 92.4% • Trained on 50,000+ anonymized clinical records</span>
          </div>
        </div>
      </div>

      <div className="col-6">
        <div className="card" style={{ height: '100%', borderLeft: '4px solid var(--urgency-urgent)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                Structured Machine Learning Model 2
              </div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: '2px' }}>
                30-Day Readmission Risk
              </h3>
            </div>
            <span className={`badge ${readmission.badgeClass}`} style={{ fontSize: '0.9rem', padding: '0.35rem 0.85rem' }}>
              {readmission.level} ({readmission.score}%)
            </span>
          </div>

          <div style={{ background: 'var(--teal-50)', padding: '1.1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--teal-100)', marginBottom: '1.25rem' }}>
            <p style={{ fontSize: '0.92rem', color: 'var(--teal-600)', lineHeight: 1.5, fontWeight: 600 }}>
              "{readmission.summary}"
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            <ShieldCheck size={16} color="var(--teal-600)" />
            <span>Predicts likelihood of hospital readmission within 30 days post-discharge</span>
          </div>
        </div>
      </div>

      {/* Main Reasons — Explainability Section */}
      <div className="col-12 card">
        <div style={{ marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.25rem' }}>
            Main Contributing Factors ("Main Reasons")
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            AI Transparency & Explainability Guarantee: Clear plain-language drivers behind your calculated risk score.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {reasons.map((item) => {
            const isExpanded = expandedReason === item.id;
            return (
              <div 
                key={item.id} 
                style={{
                  border: isExpanded ? '1px solid var(--primary-500)' : '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  background: isExpanded ? 'var(--primary-50)' : 'var(--bg-primary)',
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
                    <span style={{ fontWeight: 800, fontSize: '0.98rem', color: 'var(--text-main)' }}>
                      {item.title}
                    </span>
                    <span className="badge badge-standard" style={{ fontSize: '0.78rem' }}>
                      {item.impact}
                    </span>
                  </div>
                  {isExpanded ? <ChevronUp size={20} color="var(--primary-600)" /> : <ChevronDown size={20} color="var(--text-muted)" />}
                </div>

                {isExpanded && (
                  <div style={{ padding: '0 1.25rem 1.25rem 1.25rem', borderTop: '1px solid var(--primary-100)', paddingTop: '0.85rem', fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    {item.detail}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Primary Priority Booking CTA & Supportive Closing */}
      <div className="col-8 card" style={{ background: 'linear-gradient(135deg, var(--primary-50), #ffffff)', border: '1px solid var(--primary-200)' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-800)', marginBottom: '0.5rem' }}>
          Reserve Your Priority Appointment
        </h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
          Based on your High Disease Risk (78%) and Medium Readmission Risk (68%), the system has unlocked <strong>15–20% reserved priority appointment slots</strong> for Dr. Amanda Vance within 24–48 hours.
        </p>

        <button className="btn btn-primary" style={{ padding: '0.75rem 1.75rem' }} onClick={onBookClick}>
          <Calendar size={18} />
          <span>Book Priority Appointment Slot Now</span>
        </button>
      </div>

      {/* Reassuring Closing Box */}
      <div className="col-4 card" style={{ background: 'var(--teal-50)', border: '1px solid var(--teal-100)' }}>
        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--teal-600)', marginBottom: '0.5rem' }}>
          We're Here to Support You
        </h4>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1rem' }}>
          A high risk score is an early warning indicator to help you get timely preventive care — not a diagnosis.
        </p>
        <button style={{ background: 'none', border: 'none', color: 'var(--teal-600)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
          Explore Preventive Health Tips →
        </button>
      </div>
    </div>
  );
}
