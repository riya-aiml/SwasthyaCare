import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import DoctorDirectory from './components/DoctorDirectory';
import DoctorAvailability from './components/DoctorAvailability';
import DoctorAppointmentQueue from './components/DoctorAppointmentQueue';
import AppointmentHistory from './components/AppointmentHistory';
import PatientFollowUpView from './components/PatientFollowUpView';
import ClinicianFollowUpView from './components/ClinicianFollowUpView';
import RiskAssessmentView from './components/RiskAssessmentView';
import MedicineOCRView from './components/MedicineOCRView';
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

  const navBtnStyle = (viewName) => ({
    padding: '8px 14px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: currentView === viewName ? '#0d9488' : 'transparent',
    color: currentView === viewName ? '#ffffff' : '#64748b',
    fontWeight: '600',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Top Navbar */}
      <nav style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '24px' }}>🏥</span>
          <div>
            <span style={{ fontWeight: '700', fontSize: '18px', color: '#0f172a' }}>SwasthyaCare</span>
            <span style={{ marginLeft: '8px', fontSize: '11px', backgroundColor: '#0d9488', color: '#ffffff', padding: '2px 8px', borderRadius: '12px', fontWeight: '600' }}>Sprint 6: AI Core</span>
          </div>
        </div>

        {/* Navigation links based on role */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {isPatient && (
            <>
              <button onClick={() => setCurrentView('directory')} style={navBtnStyle('directory')}>
                🔍 Find Doctors
              </button>
              <button onClick={() => setCurrentView('appointments')} style={navBtnStyle('appointments')}>
                📋 My Appointments
              </button>
              <button onClick={() => setCurrentView('followup')} style={navBtnStyle('followup')}>
                🌿 Follow-Ups
              </button>
            </>
          )}

          {isDoctor && (
            <>
              <button onClick={() => setCurrentView('availability')} style={navBtnStyle('availability')}>
                📅 Schedule
              </button>
              <button onClick={() => setCurrentView('queue')} style={navBtnStyle('queue')}>
                ⏳ Requests
              </button>
              <button onClick={() => setCurrentView('appointments')} style={navBtnStyle('appointments')}>
                📋 All Appts
              </button>
              <button onClick={() => setCurrentView('followup')} style={navBtnStyle('followup')}>
                🌿 Care Plans
              </button>
            </>
          )}

          {/* AI Decision Support & OCR Tools (Both Roles) */}
          <button onClick={() => setCurrentView('risk-assessment')} style={navBtnStyle('risk-assessment')}>
            🧠 AI Risk Models
          </button>
          <button onClick={() => setCurrentView('ocr')} style={navBtnStyle('ocr')}>
            📷 Medicine OCR
          </button>

          <button onClick={() => setCurrentView('profile')} style={navBtnStyle('profile')}>
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
        {currentView === 'followup' && isPatient && <PatientFollowUpView />}
        {currentView === 'availability' && isDoctor && <DoctorAvailability />}
        {currentView === 'queue' && isDoctor && <DoctorAppointmentQueue />}
        {currentView === 'followup' && isDoctor && <ClinicianFollowUpView />}
        {currentView === 'risk-assessment' && <RiskAssessmentView />}
        {currentView === 'ocr' && <MedicineOCRView />}
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
