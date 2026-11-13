/**
 * SwasthyaCare Chat Service (Sprint 11: S11-01, S11-02, S11-05)
 * Client-side interface to Express Gateway conversational endpoints.
 */

import { getAuthHeaders } from './authService.js';

const BASE_URL = '/api/chat';

/**
 * Handle API responses and throw formatted errors
 */
const handleResponse = async (res) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg = data.error?.message || data.message || `Request failed with status ${res.status}`;
    const err = new Error(errorMsg);
    err.status = res.status;
    err.details = data;
    throw err;
  }
  return data;
};

export const chatService = {
  /**
   * Create a new chat session
   */
  async createSession({ title, language = 'en', metadata = {} } = {}) {
    const res = await fetch(`${BASE_URL}/sessions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ title, language, metadata }),
    });
    return handleResponse(res);
  },

  /**
   * Get all active sessions for current user
   */
  async getSessions(page = 1, limit = 20) {
    const res = await fetch(`${BASE_URL}/sessions?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  /**
   * Get single session with message history
   */
  async getSession(sessionId, limit = 50) {
    const res = await fetch(`${BASE_URL}/sessions/${sessionId}?limit=${limit}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  /**
   * Soft-delete a chat session
   */
  async deleteSession(sessionId) {
    const res = await fetch(`${BASE_URL}/sessions/${sessionId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  /**
   * Send user message to session and receive assistant response
   */
  async sendMessage(sessionId, message, language = 'en') {
    const res = await fetch(`${BASE_URL}/sessions/${sessionId}/messages`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ message, language }),
    });
    return handleResponse(res);
  },

  /**
   * Submit helpful/unhelpful rating on assistant message
   */
  async submitFeedback(messageId, rating, comment = '') {
    const res = await fetch(`${BASE_URL}/messages/${messageId}/feedback`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ rating, comment }),
    });
    return handleResponse(res);
  },

  /**
   * Confirm or reject an action proposal (Two-step confirmation)
   */
  async confirmAction(messageId, confirmed) {
    const res = await fetch(`${BASE_URL}/messages/${messageId}/confirm-action`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ confirmed }),
    });
    return handleResponse(res);
  },
};

export default chatService;
