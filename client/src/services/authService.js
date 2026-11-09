/**
 * Authentication Service
 * Handles all authentication-related API calls and token management
 */

const API_BASE_URL = '/api/auth';

/**
 * Store token in localStorage
 * @param {string} token - JWT token
 */
export const setAuthToken = (token) => {
  localStorage.setItem('authToken', token);
};

/**
 * Get token from localStorage
 * @returns {string|null} JWT token or null
 */
export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

/**
 * Remove token from localStorage
 */
export const removeAuthToken = () => {
  localStorage.removeItem('authToken');
};

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  return !!getAuthToken();
};

/**
 * API request with authentication
 */
const authRequest = async (endpoint, options = {}) => {
  try {
    const token = getAuthToken();

    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    // Add Authorization header if token exists
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
    console.error('Auth API Error:', error);
    throw error;
  }
};

/**
 * Register a new user
 * @param {object} userData - User registration data
 * @returns {Promise<object>} User data and token
 */
export const register = async (userData) => {
  const response = await authRequest('/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });

  // Store token after successful registration
  if (response.data?.token) {
    setAuthToken(response.data.token);
  }

  return response;
};

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<object>} User data and token
 */
export const login = async (email, password) => {
  const response = await authRequest('/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  // Store token after successful login
  if (response.data?.token) {
    setAuthToken(response.data.token);
  }

  return response;
};

/**
 * Logout user
 */
export const logout = async () => {
  try {
    await authRequest('/logout', { method: 'POST' });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Always remove token on logout
    removeAuthToken();
  }
};

/**
 * Get current user profile
 * @returns {Promise<object>} User profile
 */
export const getCurrentUser = async () => {
  return await authRequest('/me', { method: 'GET' });
};

export default {
  register,
  login,
  logout,
  getCurrentUser,
  isAuthenticated,
  getAuthToken,
  setAuthToken,
  removeAuthToken,
};
