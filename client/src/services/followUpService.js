/**
 * Follow-up & Post-Discharge Care API Client (Sprint 5)
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

export const followUpService = {
  /**
   * Clinician creates a new follow-up plan
   */
  async createPlan(planData) {
    const response = await fetch(`${API_BASE_URL}/follow-ups`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(planData),
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error?.message || 'Failed to create follow-up plan');
    }
    return result;
  },

  /**
   * Patient views their own follow-up plans
   */
  async getMyPlans(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/follow-ups/my-plans${query ? `?${query}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error?.message || 'Failed to fetch follow-up plans');
    }
    return result;
  },

  /**
   * Clinician views all care plans created by them
   */
  async getClinicianPlans(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/follow-ups/clinician/plans${query ? `?${query}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error?.message || 'Failed to fetch clinician plans');
    }
    return result;
  },

  /**
   * Get single plan with its recovery update history
   */
  async getPlanById(id) {
    const response = await fetch(`${API_BASE_URL}/follow-ups/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error?.message || 'Failed to fetch plan details');
    }
    return result;
  },

  /**
   * Patient submits daily/periodic recovery update
   */
  async submitRecoveryUpdate(planId, updateData) {
    const response = await fetch(`${API_BASE_URL}/follow-ups/${planId}/recovery-updates`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(updateData),
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error?.message || 'Failed to submit recovery update');
    }
    return result;
  },

  /**
   * Clinician reviews a patient recovery update
   */
  async reviewRecoveryUpdate(updateId, reviewData) {
    const response = await fetch(`${API_BASE_URL}/follow-ups/updates/${updateId}/review`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(reviewData),
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error?.message || 'Failed to review recovery update');
    }
    return result;
  },

  /**
   * Get scheduled reminder notification jobs
   */
  async getReminders(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/follow-ups/reminders${query ? `?${query}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error?.message || 'Failed to fetch reminders');
    }
    return result;
  },

  /**
   * Trigger processing of due reminder jobs
   */
  async triggerReminderProcessing() {
    const response = await fetch(`${API_BASE_URL}/follow-ups/reminders/process`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error?.message || 'Failed to process reminders');
    }
    return result;
  },
};

export default followUpService;
