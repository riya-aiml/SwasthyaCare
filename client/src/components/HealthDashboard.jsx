import React, { useState, useEffect } from 'react';
import { checkHealth } from '../services/api';

/**
 * Sprint 1 Health Dashboard
 * Simple component to demonstrate frontend-backend-database connection
 */
export default function HealthDashboard() {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch health data when component loads
  useEffect(() => {
    fetchHealth();
  }, []);

  const fetchHealth = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await checkHealth();
      setHealthData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🏥 SwasthyaCare - Sprint 1</h1>
        <h2 style={styles.subtitle}>System Health Check</h2>

        {loading && (
          <div style={styles.loading}>
            <div style={styles.spinner}></div>
            <p>Checking backend connection...</p>
          </div>
        )}

        {error && (
          <div style={styles.error}>
            <h3>❌ Connection Failed</h3>
            <p>{error}</p>
            <p style={styles.errorHelp}>
              Make sure the backend server is running on port 3001
            </p>
            <button onClick={fetchHealth} style={styles.button}>
              Retry Connection
            </button>
          </div>
        )}

        {healthData && !loading && !error && (
          <div style={styles.success}>
            <h3>✅ System Status: Operational</h3>

            <div style={styles.infoGrid}>
              <div style={styles.infoCard}>
                <div style={styles.label}>Service</div>
                <div style={styles.value}>{healthData.service}</div>
              </div>

              <div style={styles.infoCard}>
                <div style={styles.label}>Version</div>
                <div style={styles.value}>{healthData.version}</div>
              </div>

              <div style={styles.infoCard}>
                <div style={styles.label}>Environment</div>
                <div style={styles.value}>{healthData.environment}</div>
              </div>

              <div style={styles.infoCard}>
                <div style={styles.label}>Database Status</div>
                <div style={styles.value}>{healthData.database?.status}</div>
              </div>
            </div>

            <div style={styles.timestampBox}>
              <strong>Last Checked:</strong> {new Date(healthData.timestamp).toLocaleString()}
            </div>

            <button onClick={fetchHealth} style={styles.button}>
              🔄 Refresh Status
            </button>
          </div>
        )}

        <div style={styles.footer}>
          <div style={styles.statusDot}></div>
          <span>Sprint 1 - Foundation Complete</span>
        </div>
      </div>
    </div>
  );
}

// Simple inline styles for Sprint 1
const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  card: {
    background: 'white',
    borderRadius: '16px',
    padding: '40px',
    maxWidth: '800px',
    width: '100%',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1a202c',
    marginBottom: '8px',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: '18px',
    color: '#718096',
    marginBottom: '30px',
    textAlign: 'center',
    fontWeight: '400',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '4px solid #e2e8f0',
    borderTop: '4px solid #667eea',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 20px',
  },
  error: {
    background: '#fee',
    padding: '30px',
    borderRadius: '8px',
    textAlign: 'center',
    border: '2px solid #fcc',
  },
  errorHelp: {
    fontSize: '14px',
    color: '#666',
    marginTop: '10px',
  },
  success: {
    padding: '20px',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '20px',
    margin: '30px 0',
  },
  infoCard: {
    background: '#f7fafc',
    padding: '20px',
    borderRadius: '8px',
    textAlign: 'center',
    border: '1px solid #e2e8f0',
  },
  label: {
    fontSize: '12px',
    color: '#718096',
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: '8px',
  },
  value: {
    fontSize: '18px',
    color: '#1a202c',
    fontWeight: '700',
  },
  timestampBox: {
    background: '#edf2f7',
    padding: '15px',
    borderRadius: '8px',
    textAlign: 'center',
    marginBottom: '20px',
    fontSize: '14px',
    color: '#4a5568',
  },
  button: {
    background: '#667eea',
    color: 'white',
    border: 'none',
    padding: '12px 30px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    width: '100%',
    transition: 'background 0.3s',
  },
  footer: {
    marginTop: '30px',
    paddingTop: '20px',
    borderTop: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    fontSize: '14px',
    color: '#718096',
  },
  statusDot: {
    width: '10px',
    height: '10px',
    background: '#48bb78',
    borderRadius: '50%',
    animation: 'pulse 2s ease-in-out infinite',
  },
};
