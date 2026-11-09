import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';

export default function HealthChart({ data }) {
  const [metric, setMetric] = useState('heartRate');

  const metricConfigs = {
    heartRate: { name: 'Heart Rate (bpm)', color: '#f43f5e', fill: 'rgba(244, 63, 94, 0.2)' },
    bpSystolic: { name: 'Blood Pressure (mmHg)', color: '#0284c7', fill: 'rgba(2, 132, 199, 0.2)' },
    spo2: { name: 'Oxygen Saturation (%)', color: '#10b981', fill: 'rgba(16, 185, 129, 0.2)' },
    glucose: { name: 'Glucose (mg/dL)', color: '#f59e0b', fill: 'rgba(245, 158, 11, 0.2)' }
  };

  const currentConfig = metricConfigs[metric];

  return (
    <div className="card" style={{ gridColumn: 'span 8' }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '1.25rem'
      }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Telemetry Vitals History</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Real-time telemetry stream from connected wearable sensor</p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-surface)', padding: '0.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <button 
            className={`btn ${metric === 'heartRate' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem' }}
            onClick={() => setMetric('heartRate')}
          >
            Heart Rate
          </button>
          <button 
            className={`btn ${metric === 'bpSystolic' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem' }}
            onClick={() => setMetric('bpSystolic')}
          >
            BP
          </button>
          <button 
            className={`btn ${metric === 'spo2' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem' }}
            onClick={() => setMetric('spo2')}
          >
            SpO2
          </button>
          <button 
            className={`btn ${metric === 'glucose' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem' }}
            onClick={() => setMetric('glucose')}
          >
            Glucose
          </button>
        </div>
      </div>

      <div style={{ width: '100%', height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={currentConfig.color} stopOpacity={0.4}/>
                <stop offset="95%" stopColor={currentConfig.color} stopOpacity={0.0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
            <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
            <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} domain={['dataMin - 5', 'dataMax + 5']} />
            <Tooltip 
              contentStyle={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: 'var(--text-main)',
                fontSize: '13px'
              }}
            />
            <Area 
              type="monotone" 
              dataKey={metric} 
              name={currentConfig.name}
              stroke={currentConfig.color} 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#chartGradient)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
