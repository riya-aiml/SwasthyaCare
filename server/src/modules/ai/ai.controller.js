/**
 * AI & Clinical Decision Support Controller (Sprint 6: S6-12)
 * Proxies authorized requests to the Python FastAPI microservice with timeout & fallback safety
 */

const AI_SERVICE_BASE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
const TIMEOUT_MS = 8000;

const fetchWithTimeout = async (url, options = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
};

/**
 * 1. POST /api/ai/predict/heart-risk
 */
export const predictHeartRisk = async (req, res) => {
  try {
    const response = await fetchWithTimeout(`${AI_SERVICE_BASE_URL}/api/v1/predict/heart-risk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        error: data.detail || 'Heart risk calculation failed',
      });
    }

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('predictHeartRisk proxy error:', error);
    // S6-12 Safe fallback on service timeout or failure
    res.status(503).json({
      success: false,
      error: {
        message: 'The AI clinical decision service is currently temporarily unavailable. Please consult your physician directly.',
        isServiceDown: true,
      },
    });
  }
};

/**
 * 2. POST /api/ai/predict/diabetes-risk
 */
export const predictDiabetesRisk = async (req, res) => {
  try {
    const response = await fetchWithTimeout(`${AI_SERVICE_BASE_URL}/api/v1/predict/diabetes-risk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        error: data.detail || 'Diabetes risk calculation failed',
      });
    }

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('predictDiabetesRisk proxy error:', error);
    res.status(503).json({
      success: false,
      error: {
        message: 'The AI clinical decision service is currently temporarily unavailable.',
        isServiceDown: true,
      },
    });
  }
};

/**
 * 3. POST /api/ai/ocr/medicine
 */
export const processMedicineOCR = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Medicine text is required' },
      });
    }

    const formData = new URLSearchParams();
    formData.append('text', text);

    const response = await fetchWithTimeout(`${AI_SERVICE_BASE_URL}/api/v1/ocr/medicine`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        error: data.detail || 'OCR extraction failed',
      });
    }

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('processMedicineOCR proxy error:', error);
    res.status(503).json({
      success: false,
      error: {
        message: 'The medicine recognition service is currently unavailable.',
        isServiceDown: true,
      },
    });
  }
};

/**
 * 4. GET /api/ai/health
 */
export const getAIServiceHealth = async (req, res) => {
  try {
    const response = await fetchWithTimeout(`${AI_SERVICE_BASE_URL}/health`);
    const data = await response.json();
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: {
        message: 'AI microservice unreachable',
        isServiceDown: true,
      },
    });
  }
};
