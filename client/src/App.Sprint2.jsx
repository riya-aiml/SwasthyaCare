import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import UserProfile from './components/UserProfile';
import HealthDashboard from './components/HealthDashboard';

/**
 * Main App Content (inside AuthProvider)
 */
function AppContent() {
  const { user, isAuthenticated, loading } = useAuth();
  const [authView, setAuthView] = useState('login'); // 'login' | 'register'
  const [currentView, setCurrentView] = useState('health'); // 'health' | 'profile'

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading SwasthyaCare...</p>
      </div>
    );
  }

  // Not authenticated: Show Login or Register
  if (!isAuthenticated) {
    if (authView === 'register') {
      return (
        <Register
          onSwitchToLogin={() => setAuthView('login')}
          onRegisterSuccess={() => setCurrentView('profile')}
        />
      );
    }
    return (
      <Login
        onSwitchToRegister={() => setAuthView('register')}
        onLoginSuccess={() => setCurrentView('profile')}
      />
    );
  }

  // Authenticated: Show Navigation and Views
  return (
    <div>
      {/* Top Navigation Bar */}
      <nav style={styles.navbar}>
        <div style={styles.navBrand}>
          <span style={styles.brandIcon}>🏥</span>
          <span style={styles.brandName}>SwasthyaCare</span>
          <span style={styles.badge}>Sprint 2</span>
        </div>

        <div style={styles.navLinks}>
          <button
            onClick={() => setCurrentView('health')}
            style={{
              ...styles.navButton,
              ...(currentView === 'health' ? styles.navButtonActive : {}),
            }}
          >
            📊 System Health
          </button>
          <button
            onClick={() => setCurrentView('profile')}
            style={{
              ...styles.navButton,
              ...(currentView === 'profile' ? styles.navButtonActive : {}),
            }}
          >
            👤 My Profile ({user?.firstName})
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main>
        {currentView === 'health' && <HealthDashboard />}
        {currentView === 'profile' && (
          <UserProfile onBackToDashboard={() => setCurrentView('health')} />
        )}
      </main>
    </div>
  );
}

/**
 * Main App Component with AuthProvider
 */
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

const styles = {
  loadingContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f7fafc',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid #e2e8f0',
    borderTop: '3px solid #667eea',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '16px',
  },
  navbar: {
    background: 'white',
    padding: '12px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    borderBottom: '1px solid #e2e8f0',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  navBrand: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  brandIcon: {
    fontSize: '24px',
  },
  brandName: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1a202c',
  },
  badge: {
    background: '#edf2f7',
    color: '#4a5568',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '600',
  },
  navLinks: {
    display: 'flex',
    gap: '12px',
  },
  navButton: {
    background: 'none',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#4a5568',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  navButtonActive: {
    background: '#667eea',
    color: 'white',
  },
};
