import React, { useState } from 'react';
import { FileText, Download, Upload, ShieldCheck, HardDrive } from 'lucide-react';
import { mockMedicalRecords } from '../data/mockData';

export default function MedicalRecords() {
  const [records, setRecords] = useState(mockMedicalRecords);
  const [downloading, setDownloading] = useState(null);

  const handleSimulateDownload = (rec) => {
    setDownloading(rec.id);
    setTimeout(() => {
      setDownloading(null);
      alert(`Downloaded ${rec.fileName} successfully! Encrypted with patient key.`);
    }, 1200);
  };

  return (
    <div className="card" style={{ gridColumn: 'span 12' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Encrypted Health Records Vault</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Lab reports, diagnostic imaging & doctor prescriptions</p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" style={{ fontSize: '0.82rem' }}>
            <HardDrive size={16} color="#10b981" />
            <span>PWA Offline Sync Enabled</span>
          </button>
          <button className="btn btn-primary" style={{ fontSize: '0.82rem' }}>
            <Upload size={16} />
            <span>Upload New Report</span>
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {records.map((rec) => (
          <div key={rec.id} style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(2, 132, 199, 0.15)',
                color: 'var(--primary-500)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FileText size={22} />
              </div>

              <div>
                <h4 style={{ fontSize: '0.98rem', fontWeight: 700 }}>{rec.title}</h4>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', gap: '0.75rem' }}>
                  <span>👨‍⚕️ {rec.doctor}</span>
                  <span>📅 {rec.date}</span>
                  <span>🏷️ {rec.category}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>{rec.size}</span>
              <button 
                className="btn btn-secondary"
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}
                onClick={() => handleSimulateDownload(rec)}
              >
                <Download size={14} />
                <span>{downloading === rec.id ? 'Decrypting...' : 'Download PDF'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
