import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import PatientHome from './components/PatientHome';
import SymptomChecker from './components/SymptomChecker';
import MLRiskScoring from './components/MLRiskScoring';
import ClinicianDashboard from './components/ClinicianDashboard';
import QueueTracker from './components/QueueTracker';
import DischargeFollowUp from './components/DischargeFollowUp';
import DocumentIntakeRAG from './components/DocumentIntakeRAG';
import FairnessMonitoring from './components/FairnessMonitoring';
import AppointmentBooking from './components/AppointmentBooking';
import AIHealthAssistant from './components/AIHealthAssistant';

export default function App() {
  const [activeTab, setActiveTab] = useState('patient-home');
  const [role, setRole] = useState('patient'); // 'patient' | 'clinician' | 'admin'
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);

  // When switching roles, adjust default view & surface styling
  const handleRoleChange = (newRole) => {
    setRole(newRole);
    if (newRole === 'patient') {
      setActiveTab('patient-home');
    } else if (newRole === 'clinician') {
      setActiveTab('clinician-dashboard');
    } else if (newRole === 'admin') {
      setActiveTab('fairness');
    }
  };

  const containerClass = role === 'clinician' ? 'app-container clinician-view' : 'app-container patient-view';

  return (
    <div className={containerClass}>
      {/* Left Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        role={role}
      />

      {/* Main Container */}
      <div className="main-content">
        <Header 
          role={role}
          setRole={handleRoleChange}
          onBookClick={() => setShowBookingModal(true)}
        />

        <main className="page-body">
          {/* Patient Views */}
          {activeTab === 'patient-home' && (
            <PatientHome 
              onTabSwitch={setActiveTab}
              onBookClick={() => setShowBookingModal(true)}
            />
          )}

          {activeTab === 'triage' && (
            <SymptomChecker 
              onNavigateToML={() => setActiveTab('ml-risk')}
            />
          )}

          {activeTab === 'ml-risk' && (
            <MLRiskScoring 
              onBookClick={() => setShowBookingModal(true)}
            />
          )}

          {activeTab === 'queue' && (
            <QueueTracker 
              onTabSwitch={setActiveTab}
            />
          )}

          {/* Clinician View */}
          {activeTab === 'clinician-dashboard' && (
            <ClinicianDashboard />
          )}

          {/* Feature Views */}
          {activeTab === 'discharge' && (
            <DischargeFollowUp 
              onBookClick={() => setShowBookingModal(true)}
            />
          )}

          {activeTab === 'ocr-rag' && (
            <DocumentIntakeRAG />
          )}

          {activeTab === 'fairness' && (
            <FairnessMonitoring />
          )}
        </main>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <AppointmentBooking 
          onClose={() => setShowBookingModal(false)}
          onConfirm={(newApt) => {
            console.log('Appointment booked:', newApt);
          }}
        />
      )}

      {/* Floating AI Assistant Chat Widget */}
      <AIHealthAssistant 
        isOpen={isAiAssistantOpen}
        setIsOpen={setIsAiAssistantOpen}
      />
    </div>
  );
}
