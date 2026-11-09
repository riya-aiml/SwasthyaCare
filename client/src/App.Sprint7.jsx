import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import PatientDashboardView from './components/PatientDashboardView';
import DoctorDashboardView from './components/DoctorDashboardView';
import AdminDashboardView from './components/AdminDashboardView';
import ManagementDashboardView from './components/ManagementDashboardView';
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
  const [currentView, setCurrentView] = useState('dashboard');

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontFamily: 'sans-serif' }}>
        <div>Loading SwasthyaCare Platform...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (authView === 'register') {
      return (
        <Register
          onSwitchToLogin={() => setAuthView('login')}
          onRegisterSuccess={() => setCurrentView('dashboard')}
        />
      );
    }
    return (
      <Login
        onSwitchToRegister={() => setAuthView('register')}
        onLoginSuccess={() => setCurrentView('dashboard')}
      />
    );
  }

  const role = user?.role || 'patient';
  const isPatient = role === 'patient';
  const isDoctor = role === 'doctor';
  const isAdmin = role === 'admin';
  const isManagement = role === 'hospital_management';

  const navBtnStyle = (viewName) => ({
    padding: '7px 13px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: currentView === viewName ? '#0d9488' : 'transparent',
    color: currentView === viewName ? '#ffffff' : '#64748b',
    fontWeight: '600',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all 0.15s ease-in-out',
  });

  const getRoleBadge = () => {
    switch (role) {
      case 'doctor':
        return { label: '👨‍⚕️ Clinician', bg: '#f0fdf4', color: '#166534' };
      case 'admin':
        return { label: '🛡️ Administrator', bg: '#eef2ff', color: '#3730a3' };
      case 'hospital_management':
        return { label: '📊 Management', bg: '#ecfdf5', color: '#065f46' };
      default:
        return { label: '👤 Patient', bg: '#f8fafc', color: '#334155' };
    }
  };

  const badge = getRoleBadge();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Unified Top Navigation */}
      <nav style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '12px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => setCurrentView('dashboard')}>
          <span style={{ fontSize: '24px' }}>🏥</span>
          <div>
            <div style={{ fontWeight: '800', fontSize: '18px', color: '#0f172a', letterSpacing: '-0.02em' }}>
              SwasthyaCare
            </div>
            <div style={{ fontSize: '10px', color: '#0d9488', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Integrated Healthcare Platform
            </div>
          </div>
        </div>

        {/* Role-Specific Navigation Links */}
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Universal Dashboard Link */}
          <button onClick={() => setCurrentView('dashboard')} style={navBtnStyle('dashboard')}>
            🏠 Dashboard
          </button>

          {/* Patient Views */}
          {isPatient && (
            <>
              <button onClick={() => setCurrentView('directory')} style={navBtnStyle('directory')}>
                🔍 Find Doctors
              </button>
              <button onClick={() => setCurrentView('appointments')} style={navBtnStyle('appointments')}>
                📋 Appointments
              </button>
              <button onClick={() => setCurrentView('followup')} style={navBtnStyle('followup')}>
                🌿 Follow-Ups
              </button>
            </>
          )}

          {/* Doctor Views */}
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

          {/* Management / Admin shared */}
          {(isManagement || isAdmin) && (
            <button onClick={() => setCurrentView('directory')} style={navBtnStyle('directory')}>
              🔍 Doctors Directory
            </button>
          )}

          {/* AI Tools */}
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

        {/* User Identity & Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>
              {user?.firstName} {user?.lastName}
            </div>
            <span style={{
              display: 'inline-block',
              fontSize: '11px',
              backgroundColor: badge.bg,
              color: badge.color,
              padding: '1px 8px',
              borderRadius: '12px',
              fontWeight: '700',
              marginTop: '2px',
            }}>
              {badge.label}
            </span>
          </div>
          <button
            onClick={logout}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#f8fafc',
              color: '#475569',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Container */}
      <main style={{ maxWidth: '1240px', margin: '24px auto', padding: '0 20px' }}>
        {/* Dynamic Role Dashboard View */}
        {currentView === 'dashboard' && isPatient && (
          <PatientDashboardView onNavigate={(view) => setCurrentView(view)} />
        )}
        {currentView === 'dashboard' && isDoctor && (
          <DoctorDashboardView onNavigate={(view) => setCurrentView(view)} />
        )}
        {currentView === 'dashboard' && isAdmin && (
          <AdminDashboardView onNavigate={(view) => setCurrentView(view)} />
        )}
        {currentView === 'dashboard' && isManagement && (
          <ManagementDashboardView onNavigate={(view) => setCurrentView(view)} />
        )}

        {/* Sub-Views */}
        {currentView === 'directory' && <DoctorDirectory />}
        {currentView === 'appointments' && <AppointmentHistory />}
        {currentView === 'followup' && isPatient && <PatientFollowUpView />}
        {currentView === 'followup' && isDoctor && <ClinicianFollowUpView />}
        {currentView === 'availability' && isDoctor && <DoctorAvailability />}
        {currentView === 'queue' && isDoctor && <DoctorAppointmentQueue />}
        {currentView === 'risk-assessment' && <RiskAssessmentView />}
        {currentView === 'ocr' && <MedicineOCRView />}
        {currentView === 'profile' && <UserProfile />}
      </main>
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
