/**
 * Background Generator
 *
 * Manages themed background generation and caching using DALL-E.
 * - Generates backgrounds for 4 whiteboard themes (wb-glass-sticky, wb-glass-clean, wb-standing-marker, wb-standing-minimal)
 * - Caches backgrounds locally to minimize API calls
 * - Returns random cached background when available
 * - Pre-generates backgrounds with warmup function
 *
 * Task 1.2: DALL-E Integration - Phase 1
 */

const fs = require('fs').promises;
const path = require('path');
const { resolveProviders, createProviderClient } = require('./provider-factory');

// Theme definitions with DALL-E prompts (whiteboard family)
const THEMES = {
  'wb-glass-sticky': {
    name: 'wb-glass-sticky',
    dallePrompt:
      'Photorealistic glass whiteboard mounted on a modern office wall with chrome mounting clips at the four corners. The glass surface is clean and white with very subtle reflections. A modern open-plan office with plants and desks is softly blurred behind the glass. Warm natural lighting from overhead. No text, no writing, no drawings, no annotations, no sticky notes, no markers. Completely blank glass surface only. Professional corporate environment. 1024x1024',
    fallbackColor: '#f4f4f6'
  },
  'wb-glass-clean': {
    name: 'wb-glass-clean',
    dallePrompt:
      'Clean glass or acrylic whiteboard panel mounted on a light gray office wall with small chrome clips at top corners. The surface is pristine white with a very faint glossy sheen and subtle light reflection from overhead fluorescent lights. Blurred modern office background visible through the edges. No text, no writing, no drawings, no annotations. Completely blank clean surface. Minimalist professional setting. 1024x1024',
    fallbackColor: '#f6f6f8'
  },
  'wb-standing-marker': {
    name: 'wb-standing-marker',
    dallePrompt:
      'Freestanding whiteboard on a metal frame in a bright office or classroom. The whiteboard surface is clean white with a thin aluminum frame border visible at the edges. A narrow marker tray with colored dry-erase markers sits at the bottom edge. Background shows blurred office chairs, desks, and warm lighting. No text, no writing, no drawings, no annotations on the board surface. Completely blank white surface. Photorealistic. 1024x1024',
    fallbackColor: '#fafafa'
  },
  'wb-standing-minimal': {
    name: 'wb-standing-minimal',
    dallePrompt:
      'Large wall-mounted dry-erase whiteboard with clean white surface, very subtle gray smudge marks from previous erasing barely visible. Thin silver aluminum frame at edges. Bottom edge has a narrow marker tray casting a slight shadow upward. Plain office wall visible at frame edges. Soft even overhead lighting. No text, no writing, no drawings, no annotations. Completely blank surface only. Corporate meeting room setting. 1024x1024',
    fallbackColor: '#f8f8f8'
  }
};

class BackgroundGenerator {
  constructor(options = {}) {
    this.cacheDir = options.cacheDir || path.join(__dirname, 'cache', 'backgrounds');
    this.verbose = options.verbose !== false;

    // Provider configuration
    this.imageProvider = options.imageProvider || process.env.IMAGE_PROVIDER || 'auto';
    const providers = resolveProviders(this.imageProvider);
    this.primaryProvider = providers.primary;
    this.fallbackProvider = providers.fallback;

    // Create provider clients
    this.primaryClient = this.primaryProvider ? createProviderClient(this.primaryProvider, options) : null;
    this.fallbackClient = this.fallbackProvider ? createProviderClient(this.fallbackProvider, options) : null;

    // Backward-compatible alias (deprecated - use primaryClient/fallbackClient)
    this.dalleClient = this.primaryClient || this.fallbackClient;

    // Migration flag
    this._migrationChecked = false;

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
   * @param {string} theme - Theme name (wb-glass-sticky, wb-glass-clean, wb-standing-marker, wb-standing-minimal)
   * @param {Object} options - Options
   * @param {boolean} options.force - Force generation even if cache exists
   * @returns {Promise<Object>} - {imagePath, theme, source, latency} or {success: false, theme, source}
   */
  async getBackground(theme, options = {}) {
    const startTime = Date.now();
    this.stats.totalRequests++;

    // Run migration check on first call only
    if (!this._migrationChecked) {
      await this._migrateCacheIfNeeded();
      this._migrationChecked = true;
    }

    // Validate theme
    if (!THEMES[theme]) {
      this.stats.failed++;
      throw new Error(`Invalid theme: ${theme}. Valid themes: ${Object.keys(THEMES).join(', ')}`);
    }

    this.log(`Getting background for theme: ${theme} (provider: ${this.imageProvider})`);

    // If IMAGE_PROVIDER=none, return immediately
    if (this.imageProvider === 'none') {
      this.stats.failed++;
      return {
        success: false,
        theme,
        source: 'none'
      };
    }

    // Try cache first unless force=true
    if (!options.force) {
      // Check primary provider cache
      if (this.primaryProvider) {
        try {
          const cachedBackground = await this._getCachedBackground(theme, this.primaryProvider);
          if (cachedBackground) {
            this.stats.cacheHits++;
            const latency = Date.now() - startTime;

            this.log(`Using cached background from ${this.primaryProvider}`, {
              theme,
              file: path.basename(cachedBackground),
              latency: `${latency}ms`
            });

            return {
              imagePath: cachedBackground,
              theme,
              source: `cache-${this.primaryProvider}`,
              latency
            };
          }
        } catch (error) {
          this.log(`Primary cache lookup failed: ${error.message}`, null, 'warn');
        }
      }

      // Check fallback provider cache (cross-cache lookup)
      if (this.fallbackProvider) {
        try {
          const cachedBackground = await this._getCachedBackground(theme, this.fallbackProvider);
          if (cachedBackground) {
            this.stats.cacheHits++;
            const latency = Date.now() - startTime;

            this.log(`Using cached background from ${this.fallbackProvider} (fallback cache)`, {
              theme,
              file: path.basename(cachedBackground),
              latency: `${latency}ms`
            });

            return {
              imagePath: cachedBackground,
              theme,
              source: `cache-${this.fallbackProvider}`,
              latency
            };
          }
        } catch (error) {
          this.log(`Fallback cache lookup failed: ${error.message}`, null, 'warn');
        }
      }
    }

    // Cache miss - try primary API
    this.stats.cacheMisses++;

    if (this.primaryClient) {
      this.log(`Trying primary provider API: ${this.primaryProvider}`);
      const result = await this._generateBackground(theme, this.primaryProvider, this.primaryClient);
      if (result.success !== false) {
        return result;
      }
      this.log(`Primary provider ${this.primaryProvider} failed, trying fallback...`, null, 'warn');
    } else {
      this.log(`Primary provider ${this.primaryProvider} has no client (missing API key)`, null, 'warn');
    }

    // Try fallback API
    if (this.fallbackClient) {
      this.log(`Trying fallback provider API: ${this.fallbackProvider}`);
      const result = await this._generateBackground(theme, this.fallbackProvider, this.fallbackClient);
      if (result.success !== false) {
        return result;
      }
      this.log(`Fallback provider ${this.fallbackProvider} also failed`, null, 'error');
    } else {
      this.log(`Fallback provider ${this.fallbackProvider} has no client (missing API key)`, null, 'warn');
    }

    // Both failed
    this.stats.failed++;
    return {
      success: false,
      theme,
      source: 'all-failed'
    };
  }

  /**
   * Pre-generate backgrounds for all themes
   * @param {number} countPerTheme - Number of backgrounds to generate per theme (default: 3)
   * @returns {Promise<Object>} - Summary of generation results
   */
  async warmup(countPerTheme = 3) {
    if (!this.primaryClient) {
      this.log('Warmup skipped: no primary client available (missing API key)', null, 'warn');
      return {
        total: 0,
        success: 0,
        failed: 0,
        themes: {},
        skipped: true
      };
    }

    this.log(`Starting warmup: generating ${countPerTheme} backgrounds per theme using ${this.primaryProvider}...`);
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
          const result = await this._generateBackground(theme, this.primaryProvider, this.primaryClient);
          if (result.success !== false) {
            results.success++;
            results.themes[theme].generated++;
            this.log(`Generated ${i + 1}/${countPerTheme} for ${theme}`);
          } else {
            results.failed++;
            results.themes[theme].failed++;
            this.log(`Failed to generate background ${i + 1}/${countPerTheme} for ${theme}`, null, 'error');
          }
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
   * @param {string} provider - Optional provider name (gemini, dalle). If not specified, aggregates across all providers.
   * @returns {Promise<Array<string>>} - Array of file paths
   */
  async getCachedBackgrounds(theme, provider = null) {
    if (!THEMES[theme]) {
      throw new Error(`Invalid theme: ${theme}`);
    }

    if (provider) {
      // Provider-specific lookup
      const themeDir = path.join(this.cacheDir, provider, theme);

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
    } else {
      // Aggregate across all providers (backward compatibility)
      const allFiles = [];
      const providers = ['gemini', 'dalle'];

      for (const prov of providers) {
        const themeDir = path.join(this.cacheDir, prov, theme);
        try {
          await fs.access(themeDir);
          const files = await fs.readdir(themeDir);
          const pngFiles = files.filter(f => f.endsWith('.png'));
          allFiles.push(...pngFiles.map(f => path.join(themeDir, f)));
        } catch (error) {
          if (error.code !== 'ENOENT') throw error;
        }
      }

      return allFiles;
    }
  }

  /**
   * Clear cache for a specific theme or all themes
   * @param {string} theme - Optional theme name, clears all if not specified
   * @returns {Promise<number>} - Number of files deleted
   */
  async clearCache(theme = null) {
    let deletedCount = 0;
    const providers = ['gemini', 'dalle'];

    if (theme) {
      // Clear specific theme across all providers
      if (!THEMES[theme]) {
        throw new Error(`Invalid theme: ${theme}`);
      }

      for (const provider of providers) {
        const themeDir = path.join(this.cacheDir, provider, theme);
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
      this.log(`Cleared cache for theme: ${theme} (${deletedCount} files)`);
    } else {
      // Clear all themes across all providers
      for (const provider of providers) {
        for (const themeName of Object.keys(THEMES)) {
          const themeDir = path.join(this.cacheDir, provider, themeName);
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
      }
      this.log(`Cleared all caches (${deletedCount} files)`);
    }

    return deletedCount;
  }

  /**
   * Get cache statistics
   * @returns {Promise<Object>} - Cache statistics per theme and provider
   */
  async getCacheStats() {
    const stats = {
      themes: {}
    };
    const providers = ['gemini', 'dalle'];

    for (const theme of Object.keys(THEMES)) {
      stats.themes[theme] = {
        total: 0,
        providers: {}
      };

      for (const provider of providers) {
        const cached = await this.getCachedBackgrounds(theme, provider);
        stats.themes[theme].providers[provider] = {
          count: cached.length,
          files: cached.map(p => path.basename(p))
        };
        stats.themes[theme].total += cached.length;
      }
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

    const stats = {
      ...this.stats,
      cacheHitRate: hitRate,
      imageProvider: this.imageProvider,
      primaryProvider: this.primaryProvider,
      fallbackProvider: this.fallbackProvider
    };

    // Add primary client stats
    if (this.primaryClient && this.primaryClient.getStats) {
      stats.primaryClientStats = this.primaryClient.getStats();
    }

    // Add fallback client stats
    if (this.fallbackClient && this.fallbackClient.getStats) {
      stats.fallbackClientStats = this.fallbackClient.getStats();
    }

    return stats;
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
    if (this.primaryClient && this.primaryClient.resetStats) {
      this.primaryClient.resetStats();
    }
    if (this.fallbackClient && this.fallbackClient.resetStats) {
      this.fallbackClient.resetStats();
    }
  }

  // ========== PRIVATE METHODS ==========

  /**
   * Migrate cache from old flat structure to provider-separated structure
   * One-time migration: cache/backgrounds/{theme}/ -> cache/backgrounds/dalle/{theme}/
   * @private
   */
  async _migrateCacheIfNeeded() {
    const flagPath = path.join(this.cacheDir, '.provider-migration-complete');

    // Check flag file - if exists, migration already done
    try {
      await fs.access(flagPath);
      this.log('Cache migration already complete (flag file exists)', null, 'info');
      return;
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      // Flag doesn't exist, proceed with migration
    }

    this.log('Starting cache migration from flat structure to provider-separated structure...');
    let totalMoved = 0;

    for (const theme of Object.keys(THEMES)) {
      const oldDir = path.join(this.cacheDir, theme);
      const newDir = path.join(this.cacheDir, 'dalle', theme);

      try {
        // Check if old directory exists
        await fs.access(oldDir);

        // Read files from old directory
        const files = await fs.readdir(oldDir);
        const pngFiles = files.filter(f => f.endsWith('.png'));

        if (pngFiles.length === 0) {
          this.log(`Theme ${theme}: no PNG files to migrate`);
          continue;
        }

        // Create new directory
        await fs.mkdir(newDir, { recursive: true });

        // Move each PNG file
        let movedCount = 0;
        for (const file of pngFiles) {
          const oldPath = path.join(oldDir, file);
          const newPath = path.join(newDir, file);

          try {
            await fs.rename(oldPath, newPath);
            movedCount++;
          } catch (error) {
            this.log(`Warning: Failed to move ${file} for theme ${theme}: ${error.message}`, null, 'warn');
          }
        }

        totalMoved += movedCount;
        this.log(`Theme ${theme}: migrated ${movedCount} files`);
      } catch (error) {
        if (error.code === 'ENOENT') {
          // Old directory doesn't exist - nothing to migrate for this theme
          this.log(`Theme ${theme}: no old directory found, skipping`);
        } else {
          this.log(`Warning: Error migrating theme ${theme}: ${error.message}`, null, 'warn');
        }
      }
    }

    // Write flag file
    await fs.writeFile(flagPath, new Date().toISOString());
    this.log(`Cache migration complete: ${totalMoved} files moved to dalle/ subdirectory`);
  }

  /**
   * Get a random cached background for the theme
   * @private
   * @param {string} theme - Theme name
   * @param {string} provider - Provider name (gemini, dalle)
   * @returns {Promise<string|null>} - Path to cached image or null
   */
  async _getCachedBackground(theme, provider) {
    const cached = await this.getCachedBackgrounds(theme, provider);

    if (cached.length === 0) {
      return null;
    }

    // Return random background from cache
    const randomIndex = Math.floor(Math.random() * cached.length);
    return cached[randomIndex];
  }

  /**
   * Generate a new background using specified provider
   * @private
   * @param {string} theme - Theme name
   * @param {string} providerName - Provider name (gemini, dalle)
   * @param {Object} client - Provider client instance
   * @returns {Promise<Object>} - {imagePath, theme, source, latency, provider} or {success: false}
   */
  async _generateBackground(theme, providerName, client) {
    const startTime = Date.now();
    const themeConfig = THEMES[theme];

    this.log(`Generating new background for theme: ${theme} using ${providerName}...`);

    try {
      // Ensure cache directory exists (provider-separated)
      const themeDir = path.join(this.cacheDir, providerName, theme);
      await fs.mkdir(themeDir, { recursive: true });

      // Generate filename with timestamp
      const timestamp = Date.now();
      const filename = `${theme}_${timestamp}.png`;
      const outputPath = path.join(themeDir, filename);

      // Generate via provider
      let result;
      if (providerName === 'gemini') {
        // Gemini: generateAndSave returns { imagePath, mimeType, textResponse, latency }
        result = await client.generateAndSave(themeConfig.dallePrompt, outputPath);
      } else if (providerName === 'dalle') {
        // DALL-E: generateAndDownload returns { imagePath, revisedPrompt, latency }
        result = await client.generateAndDownload(themeConfig.dallePrompt, outputPath);
      } else {
        throw new Error(`Unknown provider: ${providerName}`);
      }

      this.stats.generated++;
      const latency = Date.now() - startTime;

      this.log(`Background generated successfully via ${providerName}`, {
        theme,
        file: filename,
        latency: `${latency}ms`
      });

      return {
        imagePath: result.imagePath,
        theme,
        source: `generated-${providerName}`,
        latency,
        provider: providerName
      };
    } catch (error) {
      this.log(`Failed to generate background for ${theme} via ${providerName}: ${error.message}`, null, 'error');
      return { success: false };
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
