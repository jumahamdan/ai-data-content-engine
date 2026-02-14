/**
 * Provider Factory Module
 *
 * Centralizes IMAGE_PROVIDER routing logic for Gemini/DALL-E image generation.
 * Provides shared utilities for resolving providers, validating configuration,
 * and creating client instances.
 *
 * Phase 2: Provider Abstraction + Integration
 */

const { createGeminiClient } = require('./gemini-client');
const { createDalleClient } = require('./dalle-client');

/**
 * Get and validate IMAGE_PROVIDER environment variable
 * @returns {Object} - { provider: string } where provider is one of: 'gemini', 'dalle', 'none', 'auto'
 * @throws {Error} If IMAGE_PROVIDER is set to an invalid value
 */
function getImageProviderConfig() {
  const provider = process.env.IMAGE_PROVIDER || 'auto';
  const validValues = ['gemini', 'dalle', 'none', 'auto'];

  if (!validValues.includes(provider)) {
    throw new Error(
      `Invalid IMAGE_PROVIDER: ${provider}. Valid values: gemini, dalle, none, auto`
    );
  }

  return { provider };
}

/**
 * Resolve primary and fallback providers based on IMAGE_PROVIDER value
 * @param {string} imageProvider - One of: 'gemini', 'dalle', 'none', 'auto'
 * @returns {Object} - { primary: string|null, fallback: string|null }
 *
 * Resolution logic:
 * - 'gemini' -> primary: 'gemini', fallback: 'dalle'
 * - 'dalle' -> primary: 'dalle', fallback: 'gemini'
 * - 'none' -> primary: null, fallback: null
 * - 'auto' -> checks API keys to determine primary/fallback:
 *   - GEMINI_API_KEY present -> primary: 'gemini', fallback: 'dalle'
 *   - else OPENAI_API_KEY present -> primary: 'dalle', fallback: 'gemini'
 *   - else neither -> primary: null, fallback: null
 */
function resolveProviders(imageProvider) {
  switch (imageProvider) {
    case 'gemini':
      return { primary: 'gemini', fallback: 'dalle' };

    case 'dalle':
      return { primary: 'dalle', fallback: 'gemini' };

    case 'none':
      return { primary: null, fallback: null };

    case 'auto':
      // Auto mode: check GEMINI_API_KEY first (Gemini is cheaper ~$0.039/image)
      if (process.env.GEMINI_API_KEY) {
        return { primary: 'gemini', fallback: 'dalle' };
      } else if (process.env.OPENAI_API_KEY) {
        return { primary: 'dalle', fallback: 'gemini' };
      } else {
        // No API keys configured
        return { primary: null, fallback: null };
      }

    default:
      // This should never happen if getImageProviderConfig validates first
      return { primary: null, fallback: null };
  }
}

/**
 * Create a provider client instance
 * @param {string|null} providerName - One of: 'gemini', 'dalle', or null
 * @param {Object} options - Configuration options to pass to the client factory
 * @returns {GeminiClient|DalleClient|null} - Client instance or null
 * @throws {Error} If providerName is not recognized
 *
 * Note: Does not check for API key presence - individual clients handle missing keys
 * gracefully (lazy init for Gemini, constructor check for DALL-E).
 */
function createProviderClient(providerName, options = {}) {
  if (providerName === null) {
    return null;
  }

  switch (providerName) {
    case 'gemini':
      return createGeminiClient(options);

    case 'dalle':
      return createDalleClient(options);

    default:
      throw new Error(`Unknown provider: ${providerName}`);
  }
}

module.exports = {
  getImageProviderConfig,
  resolveProviders,
  createProviderClient
};
