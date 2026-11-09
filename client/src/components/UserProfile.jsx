import React from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * User Profile Component
 * Displays user information and provides logout functionality
 */
export default function UserProfile({ onBackToDashboard }) {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  if (!user) {
    return <div>Loading profile...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.avatar}>
            {user.firstName[0]}{user.lastName[0]}
          </div>
          <h2 style={styles.name}>{user.fullName}</h2>
          <span style={styles.roleBadge}>{user.role.toUpperCase()}</span>
        </div>

        <div style={styles.infoSection}>
          <h3 style={styles.sectionTitle}>Account Information</h3>

          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Email:</span>
            <span style={styles.infoValue}>{user.email}</span>
          </div>

          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Role:</span>
            <span style={styles.infoValue}>{user.role}</span>
          </div>

          {user.phoneNumber && (
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Phone:</span>
              <span style={styles.infoValue}>{user.phoneNumber}</span>
            </div>
          )}

          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Account Status:</span>
            <span style={{
              ...styles.infoValue,
              color: user.isActive ? '#48bb78' : '#e53e3e',
            }}>
              {user.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Member Since:</span>
            <span style={styles.infoValue}>
              {new Date(user.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div style={styles.buttonGroup}>
          {onBackToDashboard && (
            <button onClick={onBackToDashboard} style={styles.secondaryButton}>
              Back to Dashboard
            </button>
          )}
          <button onClick={handleLogout} style={styles.logoutButton}>
            🚪 Logout
          </button>
        </div>
      </div>
    </div>
  );
}

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
    maxWidth: '500px',
    width: '100%',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
    paddingBottom: '20px',
    borderBottom: '1px solid #e2e8f0',
  },
  avatar: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: '#667eea',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    fontWeight: '700',
    margin: '0 auto 16px',
  },
  name: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1a202c',
    margin: '0 0 8px',
  },
  roleBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    background: '#edf2f7',
    color: '#4a5568',
  },
  infoSection: {
    marginBottom: '30px',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#4a5568',
    marginBottom: '16px',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px 0',
    borderBottom: '1px solid #f7fafc',
  },
  infoLabel: {
    fontSize: '14px',
    color: '#718096',
  },
  infoValue: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#2d3748',
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
  },
  secondaryButton: {
    flex: 1,
    padding: '12px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    background: 'white',
    color: '#4a5568',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  logoutButton: {
    flex: 1,
    padding: '12px',
    border: 'none',
    borderRadius: '8px',
    background: '#e53e3e',
    color: 'white',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};
