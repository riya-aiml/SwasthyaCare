import React from 'react';
import { HeartPulse, Activity, Wind, Droplets, Thermometer, TrendingUp } from 'lucide-react';

const iconMap = {
  HeartPulse,
  Activity,
  Wind,
  Droplets,
  Thermometer
};

export default function VitalsCard({ vitals }) {
  return (
    <div className="vitals-grid">
      {vitals.map((item) => {
        const IconComponent = iconMap[item.iconName] || Activity;
        return (
          <div key={item.id} className="vital-card">
            <div className="vital-header">
              <div 
                className="vital-icon-box"
                style={{ background: item.bgColor, color: item.color }}
              >
                <IconComponent size={24} />
              </div>
              <span className={`status-badge status-${item.status}`}>
                ● {item.statusText}
              </span>
            </div>

            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                {item.title}
              </div>
              <div className="vital-val" style={{ marginTop: '0.2rem' }}>
                {item.value}
                <span className="vital-unit">{item.unit}</span>
              </div>
            </div>

            <div style={{ 
              fontSize: '0.78rem', 
              color: 'var(--text-subtle)', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.35rem',
              marginTop: 'auto'
            }}>
              <TrendingUp size={14} color="#10b981" />
              <span>{item.trend}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
