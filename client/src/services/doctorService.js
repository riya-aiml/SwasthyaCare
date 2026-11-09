/**
 * Doctor Service
 * Handles all doctor-related API calls
 */

import { getAuthToken } from './authService';

const API_BASE_URL = '/api/doctors';

const apiRequest = async (endpoint, options = {}) => {
  try {
    const token = getAuthToken();

    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Request failed');
    }

    return data;
  } catch (error) {
    console.error('Doctor API Error:', error);
    throw error;
  }
};

/**
 * Get all doctors (directory with search/filter)
 */
export const getDoctors = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return await apiRequest(`${queryString ? '?' + queryString : ''}`);
};

/**
 * Get single doctor by ID
 */
export const getDoctorById = async (doctorId) => {
  return await apiRequest(`/${doctorId}`);
};

/**
 * Get doctor's available slots
 */
export const getDoctorSlots = async (doctorId, params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return await apiRequest(`/${doctorId}/slots${queryString ? '?' + queryString : ''}`);
};

/**
 * Get my doctor profile (for doctors only)
 */
export const getMyDoctorProfile = async () => {
  return await apiRequest('/profile/me');
};

/**
 * Update my doctor profile (for doctors only)
 */
export const updateMyDoctorProfile = async (updates) => {
  return await apiRequest('/profile/me', {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
};

/**
 * Get my schedule (for doctors only)
 */
export const getMySchedule = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return await apiRequest(`/availability/my-schedule${queryString ? '?' + queryString : ''}`);
};

/**
 * Create availability slot (for doctors only)
 */
export const createAvailabilitySlot = async (slotData) => {
  return await apiRequest('/availability', {
    method: 'POST',
    body: JSON.stringify(slotData),
  });
};

/**
 * Delete availability slot (for doctors only)
 */
export const deleteAvailabilitySlot = async (slotId) => {
  return await apiRequest(`/availability/${slotId}`, {
    method: 'DELETE',
  });
};

export default {
  getDoctors,
  getDoctorById,
  getDoctorSlots,
  getMyDoctorProfile,
  updateMyDoctorProfile,
  getMySchedule,
  createAvailabilitySlot,
  deleteAvailabilitySlot,
};
