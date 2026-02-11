/**
 * Background Generator
 *
 * Manages themed background generation and caching using DALL-E.
 * - Generates backgrounds for chalkboard, watercolor, and tech themes
 * - Caches backgrounds locally to minimize API calls
 * - Returns random cached background when available
 * - Pre-generates backgrounds with warmup function
 *
 * Task 1.2: DALL-E Integration - Phase 1
 */

const fs = require('fs').promises;
const path = require('path');
const { createDalleClient } = require('./dalle-client');

// Theme definitions with DALL-E prompts
const THEMES = {
  chalkboard: {
    name: 'chalkboard',
    dallePrompt:
      'Dark green chalkboard texture background, slightly dusty, soft lighting from top, no text or drawings, photorealistic, 1024x1024',
    fallbackColor: '#2d4a3e'
  },
  watercolor: {
    name: 'watercolor',
    dallePrompt:
      'Light cream paper texture background, subtle watercolor wash edges, soft warm lighting, no text, minimal, 1024x1024',
    fallbackColor: '#faf8f5'
  },
  tech: {
    name: 'tech',
    dallePrompt:
      'Dark gradient background with subtle circuit board pattern, deep blue to purple, futuristic, no text, 1024x1024',
    fallbackColor: '#1a1a2e'
  }
};

class BackgroundGenerator {
  constructor(options = {}) {
    this.cacheDir = options.cacheDir || path.join(__dirname, 'cache', 'backgrounds');
    this.dalleClient = options.dalleClient || createDalleClient();
    this.verbose = options.verbose !== false;

    // Statistics
    this.stats = {
      totalRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      generated: 0,
      failed: 0
    };
  }

  /**
   * Get a background image for the specified theme
   * @param {string} theme - Theme name (chalkboard, watercolor, tech)
   * @param {Object} options - Options
   * @param {boolean} options.force - Force generation even if cache exists
   * @returns {Promise<Object>} - {imagePath, theme, source, latency}
   */
  async getBackground(theme, options = {}) {
    const startTime = Date.now();
    this.stats.totalRequests++;

    // Validate theme
    if (!THEMES[theme]) {
      this.stats.failed++;
      throw new Error(`Invalid theme: ${theme}. Valid themes: ${Object.keys(THEMES).join(', ')}`);
    }

    this.log(`Getting background for theme: ${theme}`);

    // Try cache first unless force=true
    if (!options.force) {
      try {
        const cachedBackground = await this._getCachedBackground(theme);
        if (cachedBackground) {
          this.stats.cacheHits++;
          const latency = Date.now() - startTime;

          this.log(`Using cached background`, {
            theme,
            file: path.basename(cachedBackground),
            latency: `${latency}ms`
          });

          return {
            imagePath: cachedBackground,
            theme,
            source: 'cache',
            latency
          };
        }
      } catch (error) {
        this.log(`Cache lookup failed: ${error.message}`, null, 'warn');
      }
    }

    // Generate new background
    this.stats.cacheMisses++;
    return this._generateBackground(theme);
  }

  /**
   * Pre-generate backgrounds for all themes
   * @param {number} countPerTheme - Number of backgrounds to generate per theme (default: 3)
   * @returns {Promise<Object>} - Summary of generation results
   */
  async warmup(countPerTheme = 3) {
    this.log(`Starting warmup: generating ${countPerTheme} backgrounds per theme...`);
    const startTime = Date.now();

    const results = {
      total: 0,
      success: 0,
      failed: 0,
      themes: {}
    };

    for (const theme of Object.keys(THEMES)) {
      this.log(`Warming up theme: ${theme} (${countPerTheme} backgrounds)...`);
      results.themes[theme] = {
        generated: 0,
        failed: 0
      };

      for (let i = 0; i < countPerTheme; i++) {
        try {
          results.total++;
          await this._generateBackground(theme);
          results.success++;
          results.themes[theme].generated++;

          this.log(`Generated ${i + 1}/${countPerTheme} for ${theme}`);
        } catch (error) {
          results.failed++;
          results.themes[theme].failed++;
          this.log(
            `Failed to generate background ${i + 1}/${countPerTheme} for ${theme}: ${error.message}`,
            null,
            'error'
          );
        }
      }
    }

    const totalTime = Date.now() - startTime;
    const avgTime = results.success > 0 ? Math.round(totalTime / results.success) : 0;

    this.log(`Warmup complete`, {
      totalTime: `${(totalTime / 1000).toFixed(1)}s`,
      avgTimePerImage: `${avgTime}ms`,
      success: results.success,
      failed: results.failed
    });

    return results;
  }

  /**
   * Get all cached backgrounds for a theme
   * @param {string} theme - Theme name
   * @returns {Promise<Array<string>>} - Array of file paths
   */
  async getCachedBackgrounds(theme) {
    if (!THEMES[theme]) {
      throw new Error(`Invalid theme: ${theme}`);
    }

    const themeDir = path.join(this.cacheDir, theme);

    try {
      await fs.access(themeDir);
      const files = await fs.readdir(themeDir);
      const pngFiles = files.filter(f => f.endsWith('.png'));
      return pngFiles.map(f => path.join(themeDir, f));
    } catch (error) {
      if (error.code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  /**
   * Clear cache for a specific theme or all themes
   * @param {string} theme - Optional theme name, clears all if not specified
   * @returns {Promise<number>} - Number of files deleted
   */
  async clearCache(theme = null) {
    let deletedCount = 0;

    if (theme) {
      // Clear specific theme
      if (!THEMES[theme]) {
        throw new Error(`Invalid theme: ${theme}`);
      }

      const themeDir = path.join(this.cacheDir, theme);
      try {
        const files = await fs.readdir(themeDir);
        for (const file of files) {
          await fs.unlink(path.join(themeDir, file));
          deletedCount++;
        }
        this.log(`Cleared cache for theme: ${theme} (${deletedCount} files)`);
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
      }
    } else {
      // Clear all themes
      for (const themeName of Object.keys(THEMES)) {
        const themeDir = path.join(this.cacheDir, themeName);
        try {
          const files = await fs.readdir(themeDir);
          for (const file of files) {
            await fs.unlink(path.join(themeDir, file));
            deletedCount++;
          }
        } catch (error) {
          if (error.code !== 'ENOENT') throw error;
        }
      }
      this.log(`Cleared all caches (${deletedCount} files)`);
    }

    return deletedCount;
  }

  /**
   * Get cache statistics
   * @returns {Promise<Object>} - Cache statistics per theme
   */
  async getCacheStats() {
    const stats = {
      themes: {}
    };

    for (const theme of Object.keys(THEMES)) {
      const cached = await this.getCachedBackgrounds(theme);
      stats.themes[theme] = {
        count: cached.length,
        files: cached.map(p => path.basename(p))
      };
    }

    return stats;
  }

  /**
   * Get usage statistics
   * @returns {Object} - Statistics object
   */
  getStats() {
    const hitRate =
      this.stats.totalRequests > 0 ? ((this.stats.cacheHits / this.stats.totalRequests) * 100).toFixed(1) + '%' : 'N/A';

    return {
      ...this.stats,
      cacheHitRate: hitRate,
      dalleStats: this.dalleClient.getStats()
    };
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      totalRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      generated: 0,
      failed: 0
    };
    this.dalleClient.resetStats();
  }

  // ========== PRIVATE METHODS ==========

  /**
   * Get a random cached background for the theme
   * @private
   */
  async _getCachedBackground(theme) {
    const cached = await this.getCachedBackgrounds(theme);

    if (cached.length === 0) {
      return null;
    }

    // Return random background from cache
    const randomIndex = Math.floor(Math.random() * cached.length);
    return cached[randomIndex];
  }

  /**
   * Generate a new background using DALL-E
   * @private
   */
  async _generateBackground(theme) {
    const startTime = Date.now();
    const themeConfig = THEMES[theme];

    this.log(`Generating new background for theme: ${theme}...`);

    try {
      // Ensure cache directory exists
      const themeDir = path.join(this.cacheDir, theme);
      await fs.mkdir(themeDir, { recursive: true });

      // Generate filename with timestamp
      const timestamp = Date.now();
      const filename = `${theme}_${timestamp}.png`;
      const outputPath = path.join(themeDir, filename);

      // Generate via DALL-E
      const result = await this.dalleClient.generateAndDownload(themeConfig.dallePrompt, outputPath);

      this.stats.generated++;
      const latency = Date.now() - startTime;

      this.log(`Background generated successfully`, {
        theme,
        file: filename,
        latency: `${latency}ms`
      });

      return {
        imagePath: result.imagePath,
        theme,
        source: 'generated',
        revisedPrompt: result.revisedPrompt,
        latency
      };
    } catch (error) {
      this.stats.failed++;
      this.log(`Failed to generate background for ${theme}: ${error.message}`, null, 'error');
      throw error;
    }
  }

  /**
   * Logging utility
   * @private
   */
  log(message, data = null, level = 'info') {
    if (!this.verbose && level === 'info') return;

    const prefix =
      {
        info: '[BG-GEN]',
        warn: '[BG-GEN WARNING]',
        error: '[BG-GEN ERROR]'
      }[level] || '[BG-GEN]';

    if (data) {
      console.log(`${prefix} ${message}`, data);
    } else {
      console.log(`${prefix} ${message}`);
    }
  }
}

/**
 * Factory function to create a configured background generator
 */
function createBackgroundGenerator(customConfig = {}) {
  const cacheDir = customConfig.cacheDir || path.join(__dirname, 'cache', 'backgrounds');

  const config = {
    cacheDir,
    verbose: process.env.BG_VERBOSE !== 'false',
    ...customConfig
  };

  return new BackgroundGenerator(config);
}

module.exports = {
  BackgroundGenerator,
  createBackgroundGenerator,
  THEMES
};
