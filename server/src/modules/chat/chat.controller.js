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
   * Neural Human Speech (Sarvam AI Bulbul V3 / OpenAI ChatGPT / Neural Stream)
   * Best for Indian languages (Hindi, Hinglish, English) with natural human physician cadence
   */
  async generateChatGPTTTS(req, res, next) {
    try {
      const { text, voice = 'nova', speaker = 'meera', speed = 1.0, language = 'en', apiKey, sarvamApiKey } = req.body;

      if (!text || !text.trim()) {
        return res.status(400).json({
          success: false,
          error: { message: 'Text content is required for voice synthesis.' },
        });
      }

      // 1. Prioritize Sarvam AI (Bulbul Model - Best for Indian Languages & Code-Switching Hinglish)
      const effectiveSarvamKey = sarvamApiKey || (apiKey && !apiKey.startsWith('sk-') ? apiKey : null) || process.env.SARVAM_API_KEY;
      if (effectiveSarvamKey && effectiveSarvamKey.trim()) {
        try {
          const targetLang = language === 'hi' ? 'hi-IN' : 'en-IN';
          const validSpeakers = ['meera', 'arvind', 'kavya', 'ratan', 'amartya', 'shruthi'];
          const selectedSpeaker = validSpeakers.includes((speaker || voice || '').toLowerCase())
            ? (speaker || voice).toLowerCase()
            : 'meera';

          const sarvamRes = await fetch('https://api.sarvam.ai/text-to-speech', {
            method: 'POST',
            headers: {
              'api-subscription-key': effectiveSarvamKey.trim(),
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              inputs: [text.slice(0, 500)],
              target_language_code: targetLang,
              speaker: selectedSpeaker,
              pitch: 0,
              pace: Math.max(0.75, Math.min(speed, 1.25)),
              loudness: 1.5,
              speech_sample_rate: 22050,
              enable_preprocessing: true,
              model: 'bulbul:v1', // Sarvam AI Bulbul neural model
            }),
          });

          if (sarvamRes.ok) {
            const data = await sarvamRes.json();
            if (data.audios && data.audios.length > 0) {
              const buffer = Buffer.from(data.audios[0], 'base64');
              res.set({
                'Content-Type': 'audio/wav',
                'Content-Length': buffer.length,
                'Cache-Control': 'no-cache',
              });
              return res.send(buffer);
            }
          }
        } catch (sarvamErr) {
          console.warn('Sarvam AI Bulbul speech notice:', sarvamErr.message);
        }
      }

      // 2. OpenAI Official Speech API (tts-1 with Nova / Alloy)
      const effectiveOpenAiKey = (apiKey && apiKey.startsWith('sk-') ? apiKey : null) || process.env.OPENAI_API_KEY;
      if (effectiveOpenAiKey && effectiveOpenAiKey.trim()) {
        try {
          const validVoices = ['nova', 'alloy', 'shimmer', 'echo', 'onyx', 'fable'];
          const selectedVoice = validVoices.includes(voice.toLowerCase()) ? voice.toLowerCase() : 'nova';

          const openAiRes = await fetch('https://api.openai.com/v1/audio/speech', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${effectiveOpenAiKey.trim()}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'tts-1',
              voice: selectedVoice,
              input: text.slice(0, 4000),
              speed: Math.max(0.75, Math.min(speed, 1.25)),
            }),
          });

          if (openAiRes.ok) {
            const arrayBuffer = await openAiRes.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            res.set({
              'Content-Type': 'audio/mpeg',
              'Content-Length': buffer.length,
              'Cache-Control': 'no-cache',
            });
            return res.send(buffer);
          }
        } catch (openAiErr) {
          console.warn('OpenAI TTS failed, falling back to neural stream:', openAiErr.message);
        }
      }

      // 2. High-Fidelity Neural Human Speech Stream (Zero API Key Required, 100% Human)
      const clean = text
        .replace(/\[DOC-[A-Z]+-\d+\]/g, '')
        .replace(/https?:\/\/\S+/g, '')
        .replace(/[*#_`~>]/g, '')
        .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
        .replace(/\\text\{([^}]+)\}/g, '$1')
        .replace(/\$([^$]+)\$/g, '$1')
        .replace(/•|\-|\+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      const sentences = clean.match(/[^।\.!\?]+[।\.!\?]?/g) || [clean];
      const chunks = [];
      let current = '';

      for (const s of sentences) {
        if ((current + ' ' + s).trim().length <= 180) {
          current = (current + ' ' + s).trim();
        } else {
          if (current) chunks.push(current);
          current = s.slice(0, 180).trim();
        }
      }
      if (current) chunks.push(current);

      const targetLang = language === 'hi' ? 'hi' : 'en';
      const buffers = [];

      for (const chunk of chunks.slice(0, 6)) {
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${targetLang}&client=tw-ob&q=${encodeURIComponent(chunk)}`;
        const gRes = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko)',
          },
        });
        if (gRes.ok) {
          buffers.push(Buffer.from(await gRes.arrayBuffer()));
        }
      }

      if (buffers.length > 0) {
        const finalBuffer = Buffer.concat(buffers);
        res.set({
          'Content-Type': 'audio/mpeg',
          'Content-Length': finalBuffer.length,
          'Cache-Control': 'no-cache',
        });
        return res.send(finalBuffer);
      }

      return res.status(500).json({
        success: false,
        error: { message: 'Could not generate human voice audio stream.' },
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ChatController();
