/**
 * AI & Clinical Decision Support API Client (Sprint 6)
 */

const API_BASE_URL = 'http://localhost:3001/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
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
};

export default aiService;
