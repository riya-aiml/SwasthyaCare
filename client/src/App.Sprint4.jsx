import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import DoctorDirectory from './components/DoctorDirectory';
import DoctorAvailability from './components/DoctorAvailability';
import DoctorAppointmentQueue from './components/DoctorAppointmentQueue';
import AppointmentHistory from './components/AppointmentHistory';
import UserProfile from './components/UserProfile';

function AppContent() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [authView, setAuthView] = useState('login');
  const [currentView, setCurrentView] = useState('directory');

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontFamily: 'sans-serif' }}>
        <div>Loading SwasthyaCare...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (authView === 'register') {
      return (
        <Register
          onSwitchToLogin={() => setAuthView('login')}
          onRegisterSuccess={() => setCurrentView('directory')}
        />
      );
    }
    return (
      <Login
        onSwitchToRegister={() => setAuthView('register')}
        onLoginSuccess={() => setCurrentView('directory')}
      />
    );
  }

  const isPatient = user?.role === 'patient';
  const isDoctor = user?.role === 'doctor';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Top Navbar */}
      <nav style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '24px' }}>🏥</span>
          <div>
            <span style={{ fontWeight: '700', fontSize: '18px', color: '#0f172a' }}>SwasthyaCare</span>
            <span style={{ marginLeft: '8px', fontSize: '11px', backgroundColor: '#0d9488', color: '#ffffff', padding: '2px 8px', borderRadius: '12px', fontWeight: '600' }}>Sprint 4</span>
          </div>
        </div>

        {/* Navigation links based on role */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {isPatient && (
            <>
              <button
                onClick={() => setCurrentView('directory')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: currentView === 'directory' ? '#0d9488' : 'transparent',
                  color: currentView === 'directory' ? '#ffffff' : '#64748b',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                🔍 Find Doctors
              </button>
              <button
                onClick={() => setCurrentView('appointments')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: currentView === 'appointments' ? '#0d9488' : 'transparent',
                  color: currentView === 'appointments' ? '#ffffff' : '#64748b',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                📋 My Appointments
              </button>
            </>
          )}

          {isDoctor && (
            <>
              <button
                onClick={() => setCurrentView('availability')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: currentView === 'availability' ? '#0d9488' : 'transparent',
                  color: currentView === 'availability' ? '#ffffff' : '#64748b',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                📅 My Schedule
              </button>
              <button
                onClick={() => setCurrentView('queue')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: currentView === 'queue' ? '#0d9488' : 'transparent',
                  color: currentView === 'queue' ? '#ffffff' : '#64748b',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                ⏳ Pending Requests
              </button>
              <button
                onClick={() => setCurrentView('appointments')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: currentView === 'appointments' ? '#0d9488' : 'transparent',
                  color: currentView === 'appointments' ? '#ffffff' : '#64748b',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                📋 All Appointments
              </button>
            </>
          )}

          <button
            onClick={() => setCurrentView('profile')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: currentView === 'profile' ? '#0d9488' : 'transparent',
              color: currentView === 'profile' ? '#ffffff' : '#64748b',
              fontWeight: '600',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            👤 Profile
          </button>
        </div>

        {/* User info and Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>
              {user?.firstName} {user?.lastName}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', textTransform: 'capitalize' }}>
              {isDoctor ? '👨‍⚕️ Doctor' : '👤 Patient'}
            </div>
          </div>
          <button
            onClick={logout}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#f1f5f9',
              color: '#334155',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer',
            }}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main View Container */}
      <div style={{ maxWidth: '1200px', margin: '24px auto', padding: '0 20px' }}>
        {currentView === 'directory' && isPatient && <DoctorDirectory />}
        {currentView === 'appointments' && <AppointmentHistory />}
        {currentView === 'availability' && isDoctor && <DoctorAvailability />}
        {currentView === 'queue' && isDoctor && <DoctorAppointmentQueue />}
        {currentView === 'profile' && <UserProfile />}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
