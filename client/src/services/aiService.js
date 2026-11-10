/**
 * AI & Clinical Decision Support API Client (Sprint 6)
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

export const aiService = {
  /**
   * Check AI Microservice Health
   */
  async checkHealth() {
    const response = await fetch(`${API_BASE_URL}/ai/health`);
    return response.json();
  },

  /**
   * Cardiovascular 10-Year Risk Estimation
   */
  async predictHeartRisk(data) {
    const response = await fetch(`${API_BASE_URL}/ai/predict/heart-risk`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error?.message || result.error || 'Failed to calculate heart risk');
    }
    return result;
  },

  /**
   * Type 2 Diabetes 10-Year FINDRISC Risk Estimation
   */
  async predictDiabetesRisk(data) {
    const response = await fetch(`${API_BASE_URL}/ai/predict/diabetes-risk`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error?.message || result.error || 'Failed to calculate diabetes risk');
    }
    return result;
  },

  /**
   * Medicine Packaging OCR & Candidate Formulary Matching
   */
  async matchMedicineOCR(text) {
    const response = await fetch(`${API_BASE_URL}/ai/ocr/medicine`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ text }),
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error?.message || result.error || 'Failed to process medicine OCR');
    }
    return result;
  },

  /**
   * Sprint 7: Submit and Persist Diabetes Current-Status Assessment (ML-DIA-01)
   */
  async submitDiabetesAssessment(data) {
    const response = await fetch(`${API_BASE_URL}/assessments/diabetes`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error?.message || result.error || 'Failed to submit diabetes assessment');
    }
    return result;
  },

  /**
   * Sprint 7: Submit and Persist Cardiovascular Current-Status Assessment (ML-CVD-01)
   */
  async submitCardiovascularAssessment(data) {
    const response = await fetch(`${API_BASE_URL}/assessments/cardiovascular`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error?.message || result.error || 'Failed to submit cardiovascular assessment');
    }
    return result;
  },

  /**
   * Sprint 7: Retrieve Patient Assessment History (ML-S7-06)
   */
  async getMyAssessmentHistory(taskId = null) {
    const url = taskId
      ? `${API_BASE_URL}/assessments/my-history?taskId=${taskId}`
      : `${API_BASE_URL}/assessments/my-history`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error?.message || result.error || 'Failed to fetch assessment history');
    }
    return result;
  },

  /**
   * Sprint 7: Clinician Retrieve Patient Assessment History (ML-S7-07)
   */
  async getPatientAssessmentHistory(patientId) {
    const response = await fetch(`${API_BASE_URL}/assessments/patient/${patientId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error?.message || result.error || 'Failed to fetch patient assessments');
    }
    return result;
  },

  /**
   * Sprint 7: Clinician Review & Add Clinical Notes (ML-S7-07)
   */
  async reviewAssessment(id, clinicianNotes) {
    const response = await fetch(`${API_BASE_URL}/assessments/${id}/review`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ clinicianNotes }),
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error?.message || result.error || 'Failed to save clinician review');
    }
    return result;
  },
};

export default aiService;
