import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import OPDPortal from './components/OPDPortal';
import TriageEngine from './components/TriageEngine';
import MLRiskScoring from './components/MLRiskScoring';
import QueueTracker from './components/QueueTracker';
import DischargeFollowUp from './components/DischargeFollowUp';
import DocumentIntakeRAG from './components/DocumentIntakeRAG';
import NoShowPredictor from './components/NoShowPredictor';
import AppointmentBooking from './components/AppointmentBooking';
import { mockAppointments } from './data/mockData';

export default function App() {
  const [activeTab, setActiveTab] = useState('opd-portal');
  const [role, setRole] = useState('patient'); // 'patient' | 'clinician'
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [appointments, setAppointments] = useState(mockAppointments);

  const handleAddAppointment = (newApt) => {
    setAppointments([newApt, ...appointments]);
  };

  return (
    <div className="app-container">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        role={role}
      />

      <div className="main-content">
        <Header 
          role={role}
          setRole={setRole}
          onBookClick={() => setShowBookingModal(true)}
        />

        <main className="page-body">
          {activeTab === 'opd-portal' && (
            <OPDPortal 
              onTabSwitch={setActiveTab}
              onBookClick={() => setShowBookingModal(true)}
            />
          )}

          {activeTab === 'triage' && (
            <TriageEngine 
              onNavigateToML={() => setActiveTab('ml-risk')}
            />
          )}

          {activeTab === 'ml-risk' && (
            <MLRiskScoring />
          )}

          {activeTab === 'queue' && (
            <QueueTracker />
          )}

          {activeTab === 'discharge' && (
            <DischargeFollowUp />
          )}

          {activeTab === 'ocr-rag' && (
            <DocumentIntakeRAG />
          )}

          {activeTab === 'no-show' && (
            <NoShowPredictor />
          )}
        </main>
      </div>

      {showBookingModal && (
        <AppointmentBooking 
          onClose={() => setShowBookingModal(false)}
          onConfirm={handleAddAppointment}
        />
      )}
    </div>
  );
}
