/**
 * SwasthyaCare Conversational AI Assistant Client (Sprint 11)
 * Tasks: S11-01, S11-02, S11-03, S11-04, S11-10
 */

import { getAuthToken } from './authService';

const API_BASE_URL = '/api/chat';

const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const chatService = {
  /**
   * Create a new chat session
   * POST /api/chat/sessions
   */
  async createSession(title = 'New Health Conversation') {
    const res = await fetch(`${API_BASE_URL}/sessions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ title }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Failed to create session');
    return data.data;
  },

  /**
   * List all sessions for current authenticated patient
   * GET /api/chat/sessions
   */
  async listSessions() {
    const res = await fetch(`${API_BASE_URL}/sessions`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Failed to list sessions');
    return data.data || [];
  },

  /**
   * Get single session details
   * GET /api/chat/sessions/:id
   */
  async getSession(sessionId) {
    const res = await fetch(`${API_BASE_URL}/sessions/${sessionId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Failed to get session');
    return data.data;
  },

  /**
   * Cascade delete a session (Right to Erasure)
   * DELETE /api/chat/sessions/:id
   */
  async deleteSession(sessionId) {
    const res = await fetch(`${API_BASE_URL}/sessions/${sessionId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Failed to delete session');
    return data;
  },

  /**
   * Get chronological messages for a session
   * GET /api/chat/sessions/:id/messages
   */
  async getSessionMessages(sessionId) {
    const res = await fetch(`${API_BASE_URL}/sessions/${sessionId}/messages`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Failed to get messages');
    return data.data || [];
  },

  /**
   * Send a message and receive grounded AI answer
   * POST /api/chat/sessions/:id/messages
   */
  async sendMessage(sessionId, message, locale = 'en') {
    const res = await fetch(`${API_BASE_URL}/sessions/${sessionId}/messages`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ message, locale }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Failed to send message');
    return data.data;
  },

  /**
   * Submit helpful/unhelpful rating on assistant message
   * POST /api/chat/messages/:id/feedback
   */
  async submitFeedback(messageId, rating, comment = '') {
    const res = await fetch(`${API_BASE_URL}/messages/${messageId}/feedback`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ rating, comment }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Failed to submit feedback');
    return data.data;
  },

  /**
   * Fetch quick-action chips for current tab
   * GET /api/chat/quick-actions?currentTab=...
   */
  async getQuickActions(currentTab = 'default') {
    const res = await fetch(`${API_BASE_URL}/quick-actions?currentTab=${encodeURIComponent(currentTab)}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Failed to fetch quick actions');
    return data.data?.chips || [];
  },
};

export default chatService;
