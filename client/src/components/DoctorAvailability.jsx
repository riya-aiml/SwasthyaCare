import React, { useState, useEffect } from 'react';
import { getMySchedule, createAvailabilitySlot, deleteAvailabilitySlot } from '../services/doctorService';
import { Calendar, Clock, Plus, Trash2, X } from 'lucide-react';

/**
 * Doctor Availability Management Component
 * Allows doctors to create and manage their availability slots
 */
export default function DoctorAvailability() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    durationMinutes: 30,
    isPriority: false,
    consultationType: 'both',
  });

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getMySchedule();
      setSlots(response.data.slots);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      await createAvailabilitySlot(formData);
      setShowAddForm(false);
      setFormData({
        date: '',
        startTime: '',
        endTime: '',
        durationMinutes: 30,
        isPriority: false,
        consultationType: 'both',
      });
      fetchSchedule();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (slotId) => {
    if (!window.confirm('Are you sure you want to delete this slot?')) return;

    try {
      await deleteAvailabilitySlot(slotId);
      fetchSchedule();
    } catch (err) {
      setError(err.message);
    }
  };

  const groupSlotsByDate = () => {
    const grouped = {};
    slots.forEach((slot) => {
      if (!grouped[slot.date]) {
        grouped[slot.date] = [];
      }
      grouped[slot.date].push(slot);
    });
    return grouped;
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  };

  const groupedSlots = groupSlotsByDate();

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>📅 My Availability Schedule</h1>
          <p style={styles.subtitle}>Manage your appointment slots</p>
        </div>
        <button onClick={() => setShowAddForm(true)} style={styles.addButton}>
          <Plus size={20} /> Add Slot
        </button>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {showAddForm && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Add Availability Slot</h2>
              <button onClick={() => setShowAddForm(false)} style={styles.closeButton}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Date *</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  style={styles.input}
                />
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Start Time *</label>
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    required
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>End Time *</label>
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    required
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Consultation Type</label>
                <select
                  name="consultationType"
                  value={formData.consultationType}
                  onChange={handleInputChange}
                  style={styles.select}
                >
                  <option value="both">In-Person & Video</option>
                  <option value="in-person">In-Person Only</option>
                  <option value="video">Video Only</option>
                </select>
              </div>

              <div style={styles.checkboxGroup}>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="isPriority"
                    checked={formData.isPriority}
                    onChange={handleInputChange}
                    style={styles.checkbox}
                  />
                  <span>Mark as Priority Slot</span>
                </label>
              </div>

              <div style={styles.buttonRow}>
                <button type="button" onClick={() => setShowAddForm(false)} style={styles.cancelButton}>
                  Cancel
                </button>
                <button type="submit" style={styles.submitButton}>
                  Create Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div style={styles.loading}>Loading schedule...</div>
      ) : Object.keys(groupedSlots).length === 0 ? (
        <div style={styles.empty}>
          <Calendar size={48} color="#cbd5e0" />
          <p>No availability slots yet.</p>
          <p style={styles.emptySubtext}>Click "Add Slot" to create your schedule.</p>
        </div>
      ) : (
        <div style={styles.scheduleContainer}>
          {Object.keys(groupedSlots)
            .sort()
            .map((date) => (
              <div key={date} style={styles.dateGroup}>
                <h3 style={styles.dateHeader}>{formatDate(date)}</h3>
                <div style={styles.slotsGrid}>
                  {groupedSlots[date]
                    .sort((a, b) => a.startTime.localeCompare(b.startTime))
                    .map((slot) => (
                      <div
                        key={slot._id}
                        style={{
                          ...styles.slotCard,
                          ...(slot.isBooked ? styles.slotBooked : {}),
                        }}
                      >
                        <div style={styles.slotTime}>
                          <Clock size={16} />
                          <span>
                            {slot.startTime} - {slot.endTime}
                          </span>
                        </div>

                        <div style={styles.slotBadges}>
                          {slot.isPriority && <span style={styles.priorityBadge}>Priority</span>}
                          {slot.isBooked && <span style={styles.bookedBadge}>Booked</span>}
                          {!slot.isBooked && <span style={styles.availableBadge}>Available</span>}
                        </div>

                        <div style={styles.slotType}>{slot.consultationType}</div>

                        {slot.isBooked && slot.bookedByPatient && (
                          <div style={styles.patientInfo}>
                            Patient: {slot.bookedByPatient.firstName} {slot.bookedByPatient.lastName}
                          </div>
                        )}

                        {!slot.isBooked && (
                          <button
                            onClick={() => handleDelete(slot._id)}
                            style={styles.deleteButton}
                            title="Delete slot"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '24px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1a202c',
    marginBottom: '4px',
  },
  subtitle: {
    fontSize: '16px',
    color: '#718096',
  },
  addButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  error: {
    background: '#fee',
    color: '#c53030',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '16px',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: '#718096',
  },
  empty: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#718096',
  },
  emptySubtext: {
    fontSize: '14px',
    color: '#a0aec0',
  },
  scheduleContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
  },
  dateGroup: {
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #e2e8f0',
  },
  dateHeader: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1a202c',
    marginBottom: '16px',
    paddingBottom: '12px',
    borderBottom: '2px solid #e2e8f0',
  },
  slotsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '16px',
  },
  slotCard: {
    background: '#f7fafc',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    padding: '16px',
    position: 'relative',
  },
  slotBooked: {
    background: '#fff5f5',
    borderColor: '#fc8181',
  },
  slotTime: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#1a202c',
    marginBottom: '12px',
  },
  slotBadges: {
    display: 'flex',
    gap: '8px',
    marginBottom: '8px',
    flexWrap: 'wrap',
  },
  priorityBadge: {
    padding: '4px 8px',
    background: '#fef3c7',
    color: '#92400e',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '600',
  },
  bookedBadge: {
    padding: '4px 8px',
    background: '#fc8181',
    color: 'white',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '600',
  },
  availableBadge: {
    padding: '4px 8px',
    background: '#9ae6b4',
    color: '#22543d',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '600',
  },
  slotType: {
    fontSize: '13px',
    color: '#718096',
    marginBottom: '8px',
  },
  patientInfo: {
    fontSize: '12px',
    color: '#4a5568',
    background: '#fff',
    padding: '8px',
    borderRadius: '6px',
    marginTop: '8px',
  },
  deleteButton: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    background: '#feb2b2',
    border: 'none',
    borderRadius: '6px',
    padding: '6px',
    cursor: 'pointer',
    color: '#c53030',
  },
  modal: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modalContent: {
    background: 'white',
    borderRadius: '16px',
    maxWidth: '500px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    borderBottom: '1px solid #e2e8f0',
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: '600',
    margin: 0,
  },
  closeButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#718096',
  },
  form: {
    padding: '20px',
  },
  formGroup: {
    marginBottom: '16px',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: '6px',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    boxSizing: 'border-box',
  },
  select: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    background: 'white',
    boxSizing: 'border-box',
  },
  checkboxGroup: {
    marginBottom: '20px',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    cursor: 'pointer',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
  },
  buttonRow: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    padding: '10px 20px',
    background: '#f7fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  submitButton: {
    padding: '10px 20px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};
