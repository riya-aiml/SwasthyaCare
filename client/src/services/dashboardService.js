/**
 * Dashboard API Service (Sprint 7: S7-01 to S7-04)
 * Provides role-specific dashboard fetching with JWT authentication.
 */

import { getAuthToken } from './authService';

const API_BASE_URL = '/api';

const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const dashboardService = {
  /**
   * Get Patient Dashboard Data (S7-01)
   */
  async getPatientDashboard() {
    const response = await fetch(`${API_BASE_URL}/dashboards/patient`, {
      headers: getAuthHeaders(),
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error?.message || 'Failed to load patient dashboard');
    }
    return result;
  },

  /**
   * Get Doctor Clinical Dashboard Data (S7-02)
   */
  async getDoctorDashboard() {
    const response = await fetch(`${API_BASE_URL}/dashboards/doctor`, {
      headers: getAuthHeaders(),
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error?.message || 'Failed to load doctor dashboard');
    }
    return result;
  },

  /**
   * Get Admin Platform Dashboard Data (S7-03)
   */
  async getAdminDashboard() {
    const response = await fetch(`${API_BASE_URL}/dashboards/admin`, {
      headers: getAuthHeaders(),
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error?.message || 'Failed to load admin dashboard');
    }
    return result;
  },

  /**
   * Get Hospital Management Aggregate Dashboard (S7-04)
   * Anonymized aggregate metrics only - no individual patient PII
   */
  async getManagementDashboard() {
    const response = await fetch(`${API_BASE_URL}/dashboards/management`, {
      headers: getAuthHeaders(),
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error?.message || 'Failed to load management dashboard');
    }
    return result;
  },
};

export default dashboardService;
