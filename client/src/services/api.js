/**
 * API Service
 * Central module for all backend API calls.
 * Every request to our Express backend goes through here.
 */

const API_BASE_URL = '/api';

/**
 * Generic fetch wrapper with error handling
 * @param {string} endpoint - API endpoint (e.g., '/health')
 * @param {object} options - Fetch options (method, body, headers)
 * @returns {Promise<object>} - Parsed JSON response
 */
const apiRequest = async (endpoint, options = {}) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;

    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    const response = await fetch(url, config);

    // Parse the JSON response
    const data = await response.json();

    // If the response is not OK (status 200-299), throw an error
    if (!response.ok) {
      throw new Error(data.error?.message || `API Error: ${response.status}`);
    }

    return data;
  } catch (error) {
    // Network error or JSON parse error
    console.error(`API call failed: ${endpoint}`, error);
    throw error;
  }
};

/**
 * Health Check - checks if the backend is running
 * GET /api/health
 */
export const checkHealth = () => apiRequest('/health');

/**
 * Shorthand methods for common HTTP verbs
 * These will be used in later sprints for CRUD operations
 */
export const api = {
  get: (endpoint) => apiRequest(endpoint, { method: 'GET' }),
  post: (endpoint, body) => apiRequest(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: (endpoint, body) => apiRequest(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (endpoint) => apiRequest(endpoint, { method: 'DELETE' }),
};

export default api;
