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
import AIHealthAssistant from './components/AIHealthAssistant';
import {
  HeartPulse,
  LayoutDashboard,
  Stethoscope,
  Calendar,
  Clock,
  ClipboardList,
  Activity,
  Brain,
  ScanLine,
  User,
  LogOut,
  Building2,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Shield,
  Zap,
} from 'lucide-react';

function AppContent() {
  const { user, isAuthenticated, loading, logout, login } = useAuth();
  const [authView, setAuthView] = useState('login');
  const [currentView, setCurrentView] = useState('dashboard');
  const [switchLoading, setSwitchLoading] = useState(false);

  const demoAccounts = [
    {
      role: 'patient',
      label: 'Patient: Aarav Sharma',
      email: 'patient@swasthya.com',
      icon: User,
    },
    {
      role: 'doctor',
      label: 'Clinician: Dr. Rohan Verma',
      email: 'doctor@swasthya.com',
      icon: Stethoscope,
    },
    {
      role: 'hospital_management',
      label: 'Management: Pooja Nair',
      email: 'management@swasthya.com',
      icon: Building2,
    },
    {
      role: 'admin',
      label: 'Admin: Rajesh Gupta',
      email: 'admin@swasthya.com',
      icon: ShieldCheck,
    },
  ];

  const handleRoleQuickSwitch = async (email) => {
    if (user?.email === email) return;
    setSwitchLoading(true);
    try {
      await login(email, 'Password123');
      setCurrentView('dashboard');
    } catch (err) {
      console.error('Role switch failed:', err);
    } finally {
      setSwitchLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white font-sans">
        <div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-400 rounded-full animate-spin mb-4"></div>
        <div className="text-sm font-semibold tracking-wider uppercase text-teal-400">
          Connecting to SwasthyaCare Gateway...
        </div>
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

  const getRoleBadge = () => {
    switch (role) {
      case 'doctor':
        return {
          label: 'Cardiology Clinician',
          icon: Stethoscope,
          className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        };
      case 'admin':
        return {
          label: 'Platform Administrator',
          icon: ShieldCheck,
          className: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        };
      case 'hospital_management':
        return {
          label: 'Executive Leadership',
          icon: Building2,
          className: 'bg-purple-50 text-purple-700 border-purple-200',
        };
      default:
        return {
          label: 'Verified Patient',
          icon: User,
          className: 'bg-teal-50 text-teal-700 border-teal-200',
        };
    }
  };

  const badge = getRoleBadge();
  const BadgeIcon = badge.icon;

  const navItemClass = (viewName) => {
    const active = currentView === viewName;
    return `inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
      active
        ? 'bg-teal-700 text-white shadow-sm'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased flex flex-col">
      {/* 1. Top Enterprise Role Switcher Ribbon */}
      <div className="bg-slate-950 text-slate-200 px-4 py-2 border-b border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          {/* Status badge */}
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-semibold text-slate-300">
              Gateway Online (Port 3001) • AI Microservice v1.0.0
            </span>
          </div>

          {/* Quick Persona Switcher Chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mr-1">
              Test Personas:
            </span>
            {demoAccounts.map((acc) => {
              const AccIcon = acc.icon;
              const isSelected = user?.email === acc.email;
              return (
                <button
                  key={acc.email}
                  onClick={() => handleRoleQuickSwitch(acc.email)}
                  disabled={switchLoading}
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium transition-all ${
                    isSelected
                      ? 'bg-teal-500 text-white font-bold shadow-sm'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                  }`}
                >
                  <AccIcon className="w-3 h-3" />
                  <span>{acc.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Main Clinical Navigation Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo */}
            <div
              onClick={() => setCurrentView('dashboard')}
              className="flex items-center gap-2.5 cursor-pointer select-none"
            >
              <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-sm">
                <HeartPulse className="w-5 h-5" />
              </div>
              <div>
                <div className="text-lg font-black tracking-tight text-slate-900 leading-none">
                  SwasthyaCare
                </div>
                <div className="text-[10px] font-bold text-teal-700 tracking-wider uppercase mt-0.5">
                  Clinical Intelligence Platform
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200/80">
              <button
                onClick={() => setCurrentView('dashboard')}
                className={navItemClass('dashboard')}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Command Center</span>
              </button>

              {/* Patient Navigation */}
              {isPatient && (
                <>
                  <button
                    onClick={() => setCurrentView('directory')}
                    className={navItemClass('directory')}
                  >
                    <Stethoscope className="w-3.5 h-3.5" />
                    <span>Find Specialists</span>
                  </button>
                  <button
                    onClick={() => setCurrentView('appointments')}
                    className={navItemClass('appointments')}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>My Appointments</span>
                  </button>
                  <button
                    onClick={() => setCurrentView('followup')}
                    className={navItemClass('followup')}
                  >
                    <ClipboardList className="w-3.5 h-3.5" />
                    <span>Care & Recovery</span>
                  </button>
                </>
              )}

              {/* Doctor Navigation */}
              {isDoctor && (
                <>
                  <button
                    onClick={() => setCurrentView('queue')}
                    className={navItemClass('queue')}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Triage Queue</span>
                  </button>
                  <button
                    onClick={() => setCurrentView('availability')}
                    className={navItemClass('availability')}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Slot Schedule</span>
                  </button>
                  <button
                    onClick={() => setCurrentView('appointments')}
                    className={navItemClass('appointments')}
                  >
                    <ClipboardList className="w-3.5 h-3.5" />
                    <span>Consultations</span>
                  </button>
                  <button
                    onClick={() => setCurrentView('followup')}
                    className={navItemClass('followup')}
                  >
                    <Activity className="w-3.5 h-3.5" />
                    <span>Care Protocols</span>
                  </button>
                </>
              )}

              {/* Shared AI Tools */}
              <button
                onClick={() => setCurrentView('risk-assessment')}
                className={navItemClass('risk-assessment')}
              >
                <Brain className="w-3.5 h-3.5" />
                <span>AI Risk Scoring</span>
              </button>
              <button
                onClick={() => setCurrentView('ocr')}
                className={navItemClass('ocr')}
              >
                <ScanLine className="w-3.5 h-3.5" />
                <span>Medicine OCR</span>
              </button>

              {/* Directory for Management/Admin */}
              {(isManagement || isAdmin) && (
                <button
                  onClick={() => setCurrentView('directory')}
                  className={navItemClass('directory')}
                >
                  <Stethoscope className="w-3.5 h-3.5" />
                  <span>Doctors Directory</span>
                </button>
              )}
            </nav>

            {/* User Profile Pill & Actions */}
            <div className="flex items-center gap-3">
              <div
                onClick={() => setCurrentView('profile')}
                className="hidden sm:flex items-center gap-2.5 p-1.5 pl-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-white cursor-pointer transition-all shadow-sm"
              >
                <div className="text-right">
                  <div className="text-xs font-extrabold text-slate-900 leading-none">
                    {user?.firstName} {user?.lastName}
                  </div>
                  <div className="text-[10px] text-teal-700 font-semibold mt-0.5">
                    {badge.label}
                  </div>
                </div>
                <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  {user?.firstName?.[0] || 'U'}
                </div>
              </div>

              <button
                onClick={logout}
                title="Sign out of SwasthyaCare"
                className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden flex items-center gap-1 overflow-x-auto px-4 py-2 bg-slate-50 border-t border-slate-200 text-xs">
          <button onClick={() => setCurrentView('dashboard')} className={navItemClass('dashboard')}>
            Dashboard
          </button>
          {isPatient && (
            <>
              <button onClick={() => setCurrentView('directory')} className={navItemClass('directory')}>
                Specialists
              </button>
              <button onClick={() => setCurrentView('appointments')} className={navItemClass('appointments')}>
                Appointments
              </button>
              <button onClick={() => setCurrentView('followup')} className={navItemClass('followup')}>
                Care
              </button>
            </>
          )}
          {isDoctor && (
            <>
              <button onClick={() => setCurrentView('queue')} className={navItemClass('queue')}>
                Queue
              </button>
              <button onClick={() => setCurrentView('availability')} className={navItemClass('availability')}>
                Slots
              </button>
            </>
          )}
          <button onClick={() => setCurrentView('risk-assessment')} className={navItemClass('risk-assessment')}>
            AI Risk
          </button>
          <button onClick={() => setCurrentView('ocr')} className={navItemClass('ocr')}>
            OCR
          </button>
          <button onClick={() => setCurrentView('profile')} className={navItemClass('profile')}>
            Profile
          </button>
        </div>
      </header>

      {/* 3. Main Dashboard Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
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
        {currentView === 'directory' && <DoctorDirectory onBookingSuccess={() => setCurrentView('appointments')} />}
        {currentView === 'appointments' && (
          <AppointmentHistory onNavigateToDirectory={() => setCurrentView('directory')} />
        )}
        {currentView === 'followup' && isPatient && <PatientFollowUpView />}
        {currentView === 'followup' && isDoctor && <ClinicianFollowUpView />}
        {currentView === 'availability' && isDoctor && <DoctorAvailability />}
        {currentView === 'queue' && isDoctor && <DoctorAppointmentQueue />}
        {currentView === 'risk-assessment' && <RiskAssessmentView />}
        {currentView === 'ocr' && <MedicineOCRView />}
        {currentView === 'profile' && <UserProfile />}
      </main>

      {/* Floating Conversational AI Assistant (Sprint 11) */}
      <AIHealthAssistant currentTab={currentView} onNavigate={(tab) => setCurrentView(tab)} />

      {/* 4. Enterprise Healthcare Footer */}
      <footer className="mt-auto bg-white border-t border-slate-200 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-800">SwasthyaCare</span>
            <span>• Academic & Clinical Demonstration Platform</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>HIPAA-Compliant Architecture</span>
            <span>•</span>
            <span>Atomic CAS Scheduling</span>
            <span>•</span>
            <span>Pydantic v2 ML Boundary</span>
          </div>
        </div>
      </footer>
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
