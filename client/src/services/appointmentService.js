/**
 * Appointment Service
 * API client for appointment booking, approval/rejection, cancellation, and history
 */

const API_BASE_URL = 'http://localhost:3001/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const appointmentService = {
  /**
   * Patient requests an appointment for a specific slot
   */
  async requestAppointment(data) {
    const response = await fetch(`${API_BASE_URL}/appointments/request`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error?.message || 'Failed to request appointment');
    }
    return result;
  },

  /**
   * Get current user's appointments (Patient or Doctor)
   */
  async getMyAppointments(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/appointments/my-appointments${query ? `?${query}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error?.message || 'Failed to fetch appointments');
    }
    return result;
  },

  /**
   * Doctor views pending appointment requests assigned to them
   */
  async getPendingAppointments() {
    const response = await fetch(`${API_BASE_URL}/appointments/pending`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error?.message || 'Failed to fetch pending requests');
    }
    return result;
  },

  /**
   * Get single appointment details
   */
  async getAppointmentById(id) {
    const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error?.message || 'Failed to fetch appointment details');
    }
    return result;
  },

  /**
   * Doctor approves a pending appointment
   */
  async approveAppointment(id) {
    const response = await fetch(`${API_BASE_URL}/appointments/${id}/approve`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error?.message || 'Failed to approve appointment');
    }
    return result;
  },

  /**
   * Doctor rejects a pending appointment
   */
  async rejectAppointment(id, reason) {
    const response = await fetch(`${API_BASE_URL}/appointments/${id}/reject`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason }),
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error?.message || 'Failed to reject appointment');
    }
    return result;
  },

  /**
   * Patient or Doctor cancels an appointment
   */
  async cancelAppointment(id, reason) {
    const response = await fetch(`${API_BASE_URL}/appointments/${id}/cancel`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason }),
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error?.message || 'Failed to cancel appointment');
    }
    return result;
  },
};

export default appointmentService;
