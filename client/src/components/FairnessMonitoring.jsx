import React from 'react';
import { ShieldCheck, AlertCircle, BarChart2, CheckCircle2, RefreshCw, Lock } from 'lucide-react';
import { mockFairnessMetrics } from '../data/mockData';

export default function FairnessMonitoring() {
  const metrics = mockFairnessMetrics;

  return (
    <div className="grid-12" style={{ gap: '1.75rem' }}>
      {/* Title Header */}
      <div className="col-12">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--teal-600)', letterSpacing: '0.05em' }}>
              AI Governance & Clinical Compliance
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Model Fairness & Demographic Bias Audit</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Real-time monitoring of ML classification predictions across demographic attributes to prevent disparity or silent bias.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--teal-50)', border: '1px solid var(--teal-100)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-pill)', color: 'var(--teal-600)', fontWeight: 700, fontSize: '0.88rem' }}>
            <CheckCircle2 size={18} />
            <span>Audit Status: {metrics.overallFairnessScore}</span>
          </div>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="col-4 card" style={{ borderLeft: '4px solid var(--teal-500)' }}>
        <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Demographic Parity Ratio</div>
        <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--teal-600)', margin: '0.2rem 0' }}>1.01</div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>Balanced across all age & gender cohorts (Threshold 0.8 - 1.25)</div>
      </div>

      <div className="col-4 card" style={{ borderLeft: '4px solid var(--primary-500)' }}>
        <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Equalized Odds TPR Diff</div>
        <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--primary-700)', margin: '0.2rem 0' }}>{metrics.equalizedOddsMetrics.tprDifference}</div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>True Positive Rate disparity strictly below 0.05 limit</div>
      </div>

      <div className="col-4 card" style={{ borderLeft: '4px solid var(--emerald-500)' }}>
        <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Active Bias Mitigation</div>
        <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--emerald-600)', margin: '0.5rem 0' }}>Enforced</div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>Post-processing classification threshold optimization</div>
      </div>

      {/* Disparity Table */}
      <div className="col-12 card">
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem' }}>
          Demographic Subgroup Prediction Disparity Log
        </h3>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Demographic Subgroup</th>
                <th>Sample Size</th>
                <th>Predicted High-Risk %</th>
                <th>Actual Ground Truth %</th>
                <th>Disparity Ratio</th>
                <th>Fairness Check</th>
              </tr>
            </thead>
            <tbody>
              {metrics.demographicDisparity.map((item, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 700 }}>{item.category}</td>
                  <td>{item.subgroup}</td>
                  <td>{item.sampleSize.toLocaleString()}</td>
                  <td><strong>{item.predictedPositiveRate}</strong></td>
                  <td>{item.actualRate}</td>
                  <td><strong>{item.disparityRatio}</strong></td>
                  <td>
                    <span className="badge badge-routine" style={{ fontSize: '0.8rem' }}>
                      <CheckCircle2 size={13} /> {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
