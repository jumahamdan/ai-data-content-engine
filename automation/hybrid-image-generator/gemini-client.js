/**
 * Gemini API Client
 *
 * Handles image generation via Google Gemini API with:
 * - Exponential backoff retry logic (2s, 4s, 8s, 16s)
 * - Environment flag to enable/disable API calls
 * - Detailed logging (latency, success/failure, prompts)
 * - Error handling and rate limit management
 * - Statistics tracking for monitoring
 *
 * Phase 1: Gemini Client Module
 */

const fs = require('fs').promises;
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

class GeminiClient {
  /**
   * Create a new Gemini API client
   * @param {string} apiKey - Gemini API key
   * @param {Object} options - Client configuration options
   * @param {boolean} options.enabled - Whether API calls are enabled (default: true)
   * @param {string} options.model - Model name (default: 'gemini-2.5-flash-image')
   * @param {string} options.aspectRatio - Image aspect ratio (default: '1:1')
   * @param {string} options.imageSize - Image resolution (default: '1K')
   * @param {boolean} options.verbose - Enable verbose logging (default: true)
   */
  constructor(apiKey, options = {}) {
    this.apiKey = apiKey;
    this.enabled = options.enabled !== false; // Default true
    this.model = options.model || 'gemini-2.5-flash-image';
    this.aspectRatio = options.aspectRatio || '1:1';
    this.imageSize = options.imageSize || '1K';
    this.retryDelays = [2000, 4000, 8000, 16000]; // Exponential backoff in ms

    // Logging options
    this.verbose = options.verbose !== false; // Default true

    // Statistics
    this.stats = {
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      totalLatency: 0,
      cacheHits: 0
    };

    // SDK client initialized lazily on first request
    this.client = null;
  }

  /**
   * Generate an image using Gemini API
   * @param {string} prompt - The image generation prompt
   * @param {Object} options - Generation options
   * @param {string} options.model - Override model for this request
   * @param {string} options.aspectRatio - Override aspect ratio
   * @param {string} options.imageSize - Override image size
   * @returns {Promise<Object>} - Generated image data {buffer, mimeType, textResponse, latency}
   */
  async generateImage(prompt, options = {}) {
    const startTime = Date.now();
    this.stats.totalCalls++;

    // Check if Gemini is enabled
    if (!this.enabled) {
      this.stats.failedCalls++;
      this.log('Gemini API is disabled (GEMINI_ENABLED=false)');
      throw new Error('GEMINI_DISABLED');
    }

    if (!this.apiKey) {
      this.stats.failedCalls++;
      throw new Error('Gemini API key not configured');
    }

    const requestConfig = {
      model: options.model || this.model,
      contents: prompt,
      config: {
        imageConfig: {
          aspectRatio: options.aspectRatio || this.aspectRatio,
          imageSize: options.imageSize || this.imageSize
        }
      }
    };

    this.log('Generating image...', {
      model: requestConfig.model,
      aspectRatio: requestConfig.config.imageConfig.aspectRatio,
      imageSize: requestConfig.config.imageConfig.imageSize,
      promptLength: prompt.length
    });

    if (this.verbose) {
      console.log(`[Gemini] Prompt: "${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''}"`);
    }

    try {
      const response = await this._makeRequestWithRetry(requestConfig);
      const latency = Date.now() - startTime;

      // Check for candidates
      if (!response.candidates || response.candidates.length === 0) {
        this.stats.failedCalls++;
        this.log(
          'No candidates in response - prompt may have been blocked by safety filters',
          { latency: `${latency}ms` },
          'error'
        );
        throw new Error('No image generated -- prompt may have been blocked by safety filters');
      }

      // Parse response parts for image and text
      const parts = response.candidates[0].content.parts;
      let imageBuffer = null;
      let mimeType = 'image/png';
      let textResponse = null;

      for (const part of parts) {
        if (part.inlineData) {
          // Found image data
          imageBuffer = Buffer.from(part.inlineData.data, 'base64');
          mimeType = part.inlineData.mimeType || 'image/png';
        } else if (part.text) {
          // Found text response
          textResponse = part.text;
        }
      }

      if (!imageBuffer) {
        this.stats.failedCalls++;
        this.log('Response contained no image data', { latency: `${latency}ms` }, 'error');
        throw new Error('No image generated -- prompt may have been blocked by safety filters');
      }

      this.stats.successfulCalls++;
      this.stats.totalLatency += latency;

      this.log('Image generated successfully', {
        latency: `${latency}ms`,
        mimeType: mimeType,
        bufferSize: `${Math.round(imageBuffer.length / 1024)}KB`,
        textResponse: textResponse ? 'yes' : 'no'
      });

      return {
        buffer: imageBuffer,
        mimeType: mimeType,
        textResponse: textResponse,
        latency: latency
      };
    } catch (error) {
      const latency = Date.now() - startTime;
      this.stats.failedCalls++;

      this.log(
        'Image generation failed',
        {
          error: error.message,
          latency: `${latency}ms`
        },
        'error'
      );

      throw error;
    }
  }

  /**
   * Generate and save image to local file
   * @param {string} prompt - Image generation prompt
   * @param {string} outputPath - Local file path to save image
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} - {imagePath, mimeType, textResponse, latency}
   */
  async generateAndSave(prompt, outputPath, options = {}) {
    const result = await this.generateImage(prompt, options);

    // Ensure output directory exists
    await fs.mkdir(path.dirname(outputPath), { recursive: true });

    // Write buffer to file
    await fs.writeFile(outputPath, result.buffer);

    this.log(`Image saved: ${path.basename(outputPath)}`);

    return {
      imagePath: outputPath,
      mimeType: result.mimeType,
      textResponse: result.textResponse,
      latency: result.latency
    };
  }

  /**
   * Get or initialize the SDK client
   * @private
   * @returns {GoogleGenAI} SDK client instance
   */
  _getClient() {
    if (!this.client) {
      this.client = new GoogleGenAI({ apiKey: this.apiKey });
    }
    return this.client;
  }

  /**
   * Make API request with exponential backoff retry logic
   * @private
   * @param {Object} requestConfig - Request configuration
   * @param {number} attemptNumber - Current attempt number (for recursion)
   * @returns {Promise<Object>} - API response
   */
  async _makeRequestWithRetry(requestConfig, attemptNumber = 0) {
    try {
      const client = this._getClient();
      return await client.models.generateContent(requestConfig);
    } catch (error) {
      const isRateLimitError = error.status === 429;
      const isServerError = error.status >= 500;
      const isServiceUnavailable = error.status === 503;
      const shouldRetry =
        (isRateLimitError || isServerError || isServiceUnavailable) && attemptNumber < this.retryDelays.length;

      if (shouldRetry) {
        const delay = this.retryDelays[attemptNumber];
        this.log(
          `Retrying in ${delay}ms (attempt ${attemptNumber + 1}/${this.retryDelays.length})...`,
          {
            reason: isRateLimitError ? 'rate_limit' : 'server_error',
            status: error.status
          },
          'warn'
        );

        await this._sleep(delay);
        return this._makeRequestWithRetry(requestConfig, attemptNumber + 1);
      }

      throw error;
    }
  }

  /**
   * Sleep utility for retry delays
   * @private
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise<void>}
   */
  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Logging utility with structured output
   * @private
   * @param {string} message - Log message
   * @param {Object} data - Additional data to log
   * @param {string} level - Log level ('info', 'warn', 'error')
   */
  log(message, data = null, level = 'info') {
    if (!this.verbose && level === 'info') return;

    const prefix =
      {
        info: '[Gemini]',
        warn: '[Gemini WARNING]',
        error: '[Gemini ERROR]'
      }[level] || '[Gemini]';

    if (data) {
      console.log(`${prefix} ${message}`, data);
    } else {
      console.log(`${prefix} ${message}`);
    }
  }

  /**
   * Get usage statistics
   * @returns {Object} Statistics object with computed fields
   */
  getStats() {
    return {
      ...this.stats,
      averageLatency:
        this.stats.successfulCalls > 0 ? Math.round(this.stats.totalLatency / this.stats.successfulCalls) : 0,
      successRate:
        this.stats.totalCalls > 0
          ? ((this.stats.successfulCalls / this.stats.totalCalls) * 100).toFixed(1) + '%'
          : 'N/A'
    };
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      totalLatency: 0,
      cacheHits: 0
    };
  }
}

/**
 * Factory function to create a configured Gemini client
 * Reads configuration from environment variables
 * @param {Object} customConfig - Optional config overrides
 * @returns {GeminiClient} Configured Gemini client instance
 */
function createGeminiClient(customConfig = {}) {
  const apiKey = customConfig.apiKey || process.env.GEMINI_API_KEY;

  // Check GEMINI_ENABLED flag (default true)
  const enabled = process.env.GEMINI_ENABLED !== 'false';

  const config = {
    enabled: enabled,
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash-image',
    aspectRatio: process.env.GEMINI_ASPECT_RATIO || '1:1',
    imageSize: process.env.GEMINI_IMAGE_SIZE || '1K',
    verbose: process.env.GEMINI_VERBOSE !== 'false',
    ...customConfig
  };

  return new GeminiClient(apiKey, config);
}

module.exports = {
  GeminiClient,
  createGeminiClient
};
