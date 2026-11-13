import chatService from './chat.service.js';

/**
 * Chat Controller (Sprint 11)
 * Express handler for conversational health assistant endpoints.
 */
class ChatController {
  /**
   * POST /api/chat/sessions
   * Creates a new chat session
   */
  async createSession(req, res, next) {
    try {
      const { title, language, metadata } = req.body;
      const session = await chatService.createSession(
        req.user._id,
        req.user.role,
        { title, language, metadata }
      );

      res.status(201).json({
        success: true,
        data: { session },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/chat/sessions
   * Lists active sessions for current user
   */
  async getSessions(req, res, next) {
    try {
      const { page, limit } = req.query;
      const result = await chatService.getUserSessions(req.user._id, {
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 20,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/chat/sessions/:id
   * Retrieves single session and message history
   */
  async getSession(req, res, next) {
    try {
      const { id } = req.params;
      const { limit } = req.query;
      const result = await chatService.getSessionWithMessages(
        id,
        req.user._id,
        { limit: limit ? parseInt(limit, 10) : 50 }
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/chat/sessions/:id
   * Soft-deletes a chat session
   */
  async deleteSession(req, res, next) {
    try {
      const { id } = req.params;
      const result = await chatService.deleteSession(id, req.user._id);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/chat/sessions/:id/messages
   * Posts user message and returns assistant response
   */
  async sendMessage(req, res, next) {
    try {
      const { id } = req.params;
      const { message, language } = req.body;

      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: { message: 'Message content is required.' },
        });
      }

      if (message.length > 2000) {
        return res.status(400).json({
          success: false,
          error: { message: 'Message length exceeds maximum 2000 characters.' },
        });
      }

      const result = await chatService.processUserMessage(
        id,
        req.user,
        message,
        language
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/chat/messages/:id/feedback
   * Submits user rating & comment on assistant response
   */
  async submitFeedback(req, res, next) {
    try {
      const { id } = req.params;
      const { rating, comment } = req.body;

      const result = await chatService.recordFeedback(id, req.user._id, {
        rating,
        comment,
      });

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/chat/messages/:id/confirm-action
   * Two-step confirmation for proposed appointment/action cards
   */
  async confirmAction(req, res, next) {
    try {
      const { id } = req.params;
      const { confirmed } = req.body;

      if (typeof confirmed !== 'boolean') {
        return res.status(400).json({
          success: false,
          error: { message: 'Boolean confirmed field is required.' },
        });
      }

      const result = await chatService.handleActionConfirmation(id, req.user._id, {
        confirmed,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/chat/tts
   * OpenAI Neural Human Speech (ChatGPT Voice Assistant Engine)
   * Uses OpenAI tts-1 / tts-1-hd with authentic human voices (nova, alloy, shimmer, echo)
   */
  async generateChatGPTTTS(req, res, next) {
    try {
      const { text, voice = 'nova', speed = 1.0, apiKey } = req.body;

      if (!text || !text.trim()) {
        return res.status(400).json({
          success: false,
          error: { message: 'Text content is required for voice synthesis.' },
        });
      }

      const effectiveApiKey = apiKey || process.env.OPENAI_API_KEY;

      if (!effectiveApiKey) {
        return res.status(400).json({
          success: false,
          isKeyMissing: true,
          error: {
            message: 'OpenAI API key is required for ChatGPT voice. Set OPENAI_API_KEY in server/.env or configure in voice settings.',
          },
        });
      }

      // Valid OpenAI ChatGPT voices: 'nova' (warm physician female), 'alloy' (neutral), 'shimmer' (expressive), 'echo' (warm male), 'onyx' (deep)
      const validVoices = ['nova', 'alloy', 'shimmer', 'echo', 'onyx', 'fable'];
      const selectedVoice = validVoices.includes(voice.toLowerCase()) ? voice.toLowerCase() : 'nova';

      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${effectiveApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'tts-1', // Official ChatGPT speech model (supports English, Hindi, and 50+ languages)
          voice: selectedVoice,
          input: text.slice(0, 4000), // Clean conversational slice
          speed: Math.max(0.75, Math.min(speed, 1.25)),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return res.status(response.status).json({
          success: false,
          error: { message: `OpenAI Speech error: ${errorText}` },
        });
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      res.set({
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.length,
        'Cache-Control': 'no-cache',
      });

      return res.send(buffer);
    } catch (error) {
      next(error);
    }
  }
}

export default new ChatController();
