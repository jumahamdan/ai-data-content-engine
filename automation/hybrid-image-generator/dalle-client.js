/**
 * DALL-E API Client
 *
 * Handles image generation via OpenAI DALL-E 3 API with:
 * - Exponential backoff retry logic (2s, 4s, 8s, 16s)
 * - Environment flag to enable/disable API calls
 * - Detailed logging (latency, success/failure, prompts)
 * - Error handling and rate limit management
 *
 * Task 1.1: DALL-E Integration - Phase 1
 */

const https = require('https');
const fs = require('fs').promises;
const path = require('path');

class DalleClient {
  constructor(apiKey, options = {}) {
    this.apiKey = apiKey;
    this.enabled = options.enabled !== false; // Default true
    this.model = options.model || 'dall-e-3';
    this.quality = options.quality || 'standard';
    this.size = options.size || '1024x1024';
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
  }

  /**
   * Generate an image using DALL-E 3
   * @param {string} prompt - The image generation prompt
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} - Generated image data {url, revisedPrompt}
   */
  async generateImage(prompt, options = {}) {
    const startTime = Date.now();
    this.stats.totalCalls++;

    // Check if DALL-E is enabled
    if (!this.enabled) {
      this.stats.failedCalls++;
      this.log('DALL-E API is disabled (DALLE_ENABLED=false)');
      throw new Error('DALL-E_DISABLED');
    }

    if (!this.apiKey) {
      this.stats.failedCalls++;
      throw new Error('DALL-E API key not configured');
    }

    const requestData = {
      model: options.model || this.model,
      prompt: prompt,
      n: 1,
      size: options.size || this.size,
      quality: options.quality || this.quality,
      response_format: 'url'
    };
    this.log('Generating image...', {
      model: requestData.model,
      size: requestData.size,
      quality: requestData.quality,
      promptLength: prompt.length
    });

    if (this.verbose) {
      console.log(`[DALL-E] Prompt: "${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''}"`);
    }

    try {
      const result = await this._makeRequestWithRetry(requestData);
      const latency = Date.now() - startTime;

      this.stats.successfulCalls++;
      this.stats.totalLatency += latency;

      this.log('Image generated successfully', {
        latency: `${latency}ms`,
        revisedPrompt: result.data[0].revised_prompt ? 'yes' : 'no'
      });

      return {
        url: result.data[0].url,
        revisedPrompt: result.data[0].revised_prompt || prompt,
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
   * Download image from URL to local file
   * @param {string} imageUrl - DALL-E image URL
   * @param {string} outputPath - Local file path to save image
   * @returns {Promise<string>} - Path to saved file
   */
  async downloadImage(imageUrl, outputPath) {
    this.log(`Downloading image to ${path.basename(outputPath)}...`);

    return new Promise((resolve, reject) => {
      https
        .get(imageUrl, response => {
          if (response.statusCode !== 200) {
            reject(new Error(`Failed to download image: HTTP ${response.statusCode}`));
            return;
          }

          const chunks = [];
          response.on('data', chunk => chunks.push(chunk));
          response.on('end', async () => {
            try {
              const buffer = Buffer.concat(chunks);
              await fs.writeFile(outputPath, buffer);
              this.log(`Image saved: ${path.basename(outputPath)}`);
              resolve(outputPath);
            } catch (err) {
              reject(err);
            }
          });
        })
        .on('error', reject);
    });
  }

  /**
   * Generate and download image in one call
   * @param {string} prompt - Image generation prompt
   * @param {string} outputPath - Where to save the image
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} - {imagePath, revisedPrompt, latency}
   */
  async generateAndDownload(prompt, outputPath, options = {}) {
    const result = await this.generateImage(prompt, options);
    await this.downloadImage(result.url, outputPath);

    return {
      imagePath: outputPath,
      revisedPrompt: result.revisedPrompt,
      latency: result.latency
    };
  }

  /**
   * Make API request with exponential backoff retry logic
   * @private
   */
  async _makeRequestWithRetry(requestData, attemptNumber = 0) {
    try {
      return await this._makeRequest(requestData);
    } catch (error) {
      const isRateLimitError = error.statusCode === 429;
      const isServerError = error.statusCode >= 500;
      const shouldRetry = (isRateLimitError || isServerError) && attemptNumber < this.retryDelays.length;

      if (shouldRetry) {
        const delay = this.retryDelays[attemptNumber];
        this.log(
          `Retrying in ${delay}ms (attempt ${attemptNumber + 1}/${this.retryDelays.length})...`,
          {
            reason: isRateLimitError ? 'rate_limit' : 'server_error',
            statusCode: error.statusCode
          },
          'warn'
        );

        await this._sleep(delay);
        return this._makeRequestWithRetry(requestData, attemptNumber + 1);
      }

      throw error;
    }
  }

  /**
   * Make raw HTTPS request to DALL-E API
   * @private
   */
  _makeRequest(requestData) {
    return new Promise((resolve, reject) => {
      const payload = JSON.stringify(requestData);

      const options = {
        hostname: 'api.openai.com',
        path: '/v1/images/generations',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Length': Buffer.byteLength(payload)
        }
      };

      const req = https.request(options, res => {
        let data = '';
        res.on('data', chunk => (data += chunk));
        res.on('end', () => {
          if (res.statusCode === 200) {
            try {
              resolve(JSON.parse(data));
            } catch (err) {
              reject(new Error(`Failed to parse DALL-E response: ${err.message}`));
            }
          } else {
            const error = new Error(`DALL-E API error: ${res.statusCode}`);
            error.statusCode = res.statusCode;
            error.responseBody = data;

            try {
              const errorData = JSON.parse(data);
              error.message = errorData.error?.message || error.message;
            } catch (e) {
              // Keep original error message if JSON parsing fails
            }

            reject(error);
          }
        });
      });

      req.on('error', err => {
        reject(new Error(`Network error: ${err.message}`));
      });

      req.write(payload);
      req.end();
    });
  }

  /**
   * Sleep utility for retry delays
   * @private
   */
  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Logging utility with structured output
   * @private
   */
  log(message, data = null, level = 'info') {
    if (!this.verbose && level === 'info') return;

    const prefix =
      {
        info: '[DALL-E]',
        warn: '[DALL-E WARNING]',
        error: '[DALL-E ERROR]'
      }[level] || '[DALL-E]';

    if (data) {
      console.log(`${prefix} ${message}`, data);
    } else {
      console.log(`${prefix} ${message}`);
    }
  }

  /**
   * Get usage statistics
   * @returns {Object} Statistics object
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
 * Factory function to create a configured DALL-E client
 * Reads configuration from environment variables
 * Note: No longer reads DALLE_ENABLED - provider enablement is now controlled by IMAGE_PROVIDER
 * @param {Object} customConfig - Optional config overrides
 * @returns {DalleClient} Configured DALL-E client instance
 */
function createDalleClient(customConfig = {}) {
  const apiKey = customConfig.apiKey || process.env.OPENAI_API_KEY;

  const config = {
    model: process.env.DALLE_MODEL || 'dall-e-3',
    quality: process.env.DALLE_QUALITY || 'standard',
    size: process.env.DALLE_SIZE || '1024x1024',
    verbose: process.env.DALLE_VERBOSE !== 'false',
    ...customConfig
  };

  return new DalleClient(apiKey, config);
}

module.exports = {
  DalleClient,
  createDalleClient
};
