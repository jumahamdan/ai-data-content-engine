/**
 * Illustration Cache
 *
 * Manages illustration element generation and caching using DALL-E.
 * - Generates theme-specific illustrations (whiteboard marker style drawings)
 * - Caches with meaningful names and metadata
 * - Provides lookup by name and category
 * - Illustrations are generated once and reused forever
 *
 * Task 1.4: DALL-E Integration - Phase 1
 */

const fs = require('fs').promises;
const path = require('path');
const { resolveProviders, createProviderClient } = require('./provider-factory');

// Illustration categories and their style modifiers per theme
const ILLUSTRATION_STYLES = {
  'wb-glass-sticky': {
    baseStyle: 'hand-drawn whiteboard marker style, bold colored lines on transparent',
    categories: {
      building: 'marker-drawn outline of',
      icon: 'simple marker icon of',
      diagram: 'marker-drawn diagram showing',
      character: 'marker stick figure representing'
    }
  },
  'wb-glass-clean': {
    baseStyle: 'clean whiteboard marker drawing, teal and green tones, professional',
    categories: {
      building: 'clean marker outline of',
      icon: 'minimal marker icon of',
      diagram: 'clean marker diagram showing',
      character: 'marker character representing'
    }
  },
  'wb-standing-marker': {
    baseStyle: 'bold whiteboard marker drawing, thick colored lines, hand-drawn feel',
    categories: {
      building: 'bold marker drawing of',
      icon: 'bold marker icon of',
      diagram: 'bold marker diagram showing',
      character: 'bold marker figure representing'
    }
  },
  'wb-standing-minimal': {
    baseStyle: 'clean whiteboard marker drawing, thin lines, minimal and professional',
    categories: {
      building: 'minimal marker outline of',
      icon: 'thin marker icon of',
      diagram: 'minimal marker diagram showing',
      character: 'minimal marker figure representing'
    }
  }
};

class IllustrationCache {
  constructor(options = {}) {
    this.cacheDir = options.cacheDir || path.join(__dirname, 'cache', 'illustrations');
    this.verbose = options.verbose !== false;
    this.defaultSize = options.defaultSize || '1024x1024';

    // Provider configuration
    this.imageProvider = options.imageProvider || process.env.IMAGE_PROVIDER || 'auto';
    const { primary, fallback } = resolveProviders(this.imageProvider);
    this.primaryProvider = primary;
    this.fallbackProvider = fallback;

    // Create provider clients
    this.primaryClient = createProviderClient(this.primaryProvider, { verbose: this.verbose });
    this.fallbackClient = createProviderClient(this.fallbackProvider, { verbose: this.verbose });

    // Migration tracking
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
   * Get an illustration by name and theme
   * @param {string} name - Illustration name (e.g., "warehouse", "database")
   * @param {string} theme - Theme name (wb-glass-sticky, wb-glass-clean, wb-standing-marker, wb-standing-minimal)
   * @param {string} category - Category (building, icon, diagram, character)
   * @returns {Promise<Object>} - {imagePath, metadata, source}
   */
  async getIllustration(name, theme, category = 'icon') {
    // Run migration check on first call
    if (!this._migrationChecked) {
      await this._migrateCacheIfNeeded();
      this._migrationChecked = true;
    }

    this.stats.totalRequests++;

    // Check if IMAGE_PROVIDER=none
    if (this.imageProvider === 'none') {
      throw new Error('IMAGE_PROVIDER=none: AI illustration generation is disabled');
    }

    // Validate inputs
    if (!ILLUSTRATION_STYLES[theme]) {
      throw new Error(`Invalid theme: ${theme}. Valid themes: ${Object.keys(ILLUSTRATION_STYLES).join(', ')}`);
    }

    if (!ILLUSTRATION_STYLES[theme].categories[category]) {
      throw new Error(
        `Invalid category: ${category}. Valid categories: ${Object.keys(ILLUSTRATION_STYLES[theme].categories).join(', ')}`
      );
    }

    this.log(`Getting illustration: ${name} (${theme}/${category})`);

    // Check primary provider cache first
    const cachedPrimary = await this._getCachedIllustration(name, theme, category, this.primaryProvider);
    if (cachedPrimary) {
      this.stats.cacheHits++;
      this.log(`Using cached illustration from ${this.primaryProvider}: ${name}`, { theme, category });
      return {
        imagePath: cachedPrimary.imagePath,
        metadata: cachedPrimary.metadata,
        source: `cache-${this.primaryProvider}`
      };
    }

    // Check fallback provider cache
    const cachedFallback = await this._getCachedIllustration(name, theme, category, this.fallbackProvider);
    if (cachedFallback) {
      this.stats.cacheHits++;
      this.log(`Using cached illustration from ${this.fallbackProvider}: ${name}`, { theme, category });
      return {
        imagePath: cachedFallback.imagePath,
        metadata: cachedFallback.metadata,
        source: `cache-${this.fallbackProvider}`
      };
    }

    // Not in cache - cannot auto-generate without prompt
    this.stats.cacheMisses++;
    throw new Error(
      `Illustration not found in cache: ${name} (${theme}/${category}). Use generateIllustration() to create it.`
    );
  }

  /**
   * Generate a new illustration and cache it
   * @param {string} name - Unique name for the illustration
   * @param {string} description - What the illustration depicts (e.g., "data warehouse building")
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} - {imagePath, metadata, latency}
   */
  async generateIllustration(name, description, options = {}) {
    // Run migration check on first call
    if (!this._migrationChecked) {
      await this._migrateCacheIfNeeded();
      this._migrationChecked = true;
    }

    const theme = options.theme || 'wb-standing-minimal';
    const category = options.category || 'icon';
    const size = options.size || this.defaultSize;

    // Check if IMAGE_PROVIDER=none
    if (this.imageProvider === 'none') {
      throw new Error('IMAGE_PROVIDER=none: AI illustration generation is disabled');
    }

    // Validate inputs
    if (!ILLUSTRATION_STYLES[theme]) {
      throw new Error(`Invalid theme: ${theme}`);
    }

    if (!ILLUSTRATION_STYLES[theme].categories[category]) {
      throw new Error(`Invalid category: ${category}`);
    }

    this.log(`Generating illustration: ${name} (${theme}/${category})...`);

    const startTime = Date.now();

    // Determine which provider to use (primary if available, else fallback)
    const provider = this.primaryClient ? this.primaryProvider : this.fallbackProvider;
    const client = this.primaryClient || this.fallbackClient;

    if (!client) {
      throw new Error('No image generation provider available (IMAGE_PROVIDER=none or no API keys configured)');
    }

    try {
      // Build prompt
      const stylePrefix = ILLUSTRATION_STYLES[theme].categories[category];
      const baseStyle = ILLUSTRATION_STYLES[theme].baseStyle;
      const prompt = `${stylePrefix} ${description}, ${baseStyle}, isolated, no text, ${size}`;

      if (this.verbose) {
        console.log(`[ILLUS] Prompt: "${prompt}"`);
        console.log(`[ILLUS] Using provider: ${provider}`);
      }

      // Ensure cache directory exists (provider-separated)
      const categoryDir = path.join(this.cacheDir, provider, theme, category);
      await fs.mkdir(categoryDir, { recursive: true });

      // Generate filename
      const filename = `${this._sanitizeName(name)}.png`;
      const imagePath = path.join(categoryDir, filename);

      // Check if already exists
      try {
        await fs.access(imagePath);
        this.log(`Illustration already exists: ${name}`, { path: imagePath }, 'warn');

        // Load existing metadata
        const metadataPath = imagePath.replace('.png', '.json');
        let metadata = {};
        try {
          const metadataContent = await fs.readFile(metadataPath, 'utf-8');
          metadata = JSON.parse(metadataContent);
        } catch (e) {
          // Create metadata if missing
          metadata = {
            name,
            description,
            theme,
            category,
            size,
            generatedBy: provider,
            createdAt: new Date().toISOString()
          };
          await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
        }

        return {
          imagePath,
          metadata,
          source: 'existing',
          latency: Date.now() - startTime
        };
      } catch (error) {
        // File doesn't exist, proceed with generation
      }

      // Try primary provider
      let result = null;
      let usedProvider = provider;

      try {
        if (provider === 'gemini') {
          // Gemini: generateAndSave returns { imagePath, mimeType, textResponse, latency }
          result = await client.generateAndSave(prompt, imagePath);
        } else if (provider === 'dalle') {
          // DALL-E: generateAndDownload returns { imagePath, revisedPrompt, latency }
          result = await client.generateAndDownload(prompt, imagePath, { size });
        }
      } catch (primaryError) {
        this.log(`Primary provider ${provider} failed: ${primaryError.message}`, null, 'warn');

        // Try fallback provider if available
        if (this.fallbackClient && this.fallbackProvider !== provider) {
          this.log(`Trying fallback provider: ${this.fallbackProvider}`, null, 'warn');
          usedProvider = this.fallbackProvider;

          const fallbackCategoryDir = path.join(this.cacheDir, this.fallbackProvider, theme, category);
          await fs.mkdir(fallbackCategoryDir, { recursive: true });
          const fallbackImagePath = path.join(fallbackCategoryDir, filename);

          try {
            if (this.fallbackProvider === 'gemini') {
              result = await this.fallbackClient.generateAndSave(prompt, fallbackImagePath);
            } else if (this.fallbackProvider === 'dalle') {
              result = await this.fallbackClient.generateAndDownload(prompt, fallbackImagePath, { size });
            }
            // Update imagePath to fallback location
            result.imagePath = fallbackImagePath;
          } catch (fallbackError) {
            this.log(`Fallback provider ${this.fallbackProvider} also failed: ${fallbackError.message}`, null, 'error');
            throw primaryError; // Throw original error
          }
        } else {
          throw primaryError;
        }
      }

      if (!result) {
        throw new Error('Failed to generate illustration with any provider');
      }

      // Save metadata
      const metadata = {
        name,
        description,
        theme,
        category,
        size,
        prompt: result.revisedPrompt || prompt,
        createdAt: new Date().toISOString(),
        generatedBy: usedProvider
      };

      const metadataPath = result.imagePath.replace('.png', '.json');
      await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));

      this.stats.generated++;
      const latency = Date.now() - startTime;

      this.log(`Illustration generated successfully`, {
        name,
        theme,
        category,
        provider: usedProvider,
        latency: `${latency}ms`
      });

      return {
        imagePath: result.imagePath,
        metadata,
        source: 'generated',
        provider: usedProvider,
        latency
      };
    } catch (error) {
      this.stats.failed++;
      this.log(`Failed to generate illustration: ${name}: ${error.message}`, null, 'error');
      throw error;
    }
  }

  /**
   * List all cached illustrations
   * @param {string} theme - Optional theme filter
   * @param {string} category - Optional category filter
   * @returns {Promise<Array>} - Array of {name, theme, category, provider, metadata, imagePath}
   */
  async listIllustrations(theme = null, category = null) {
    const illustrations = [];

    const themes = theme ? [theme] : Object.keys(ILLUSTRATION_STYLES);
    const providers = ['dalle', 'gemini']; // Known providers

    for (const provider of providers) {
      for (const themeName of themes) {
        const themeDir = path.join(this.cacheDir, provider, themeName);

        try {
          await fs.access(themeDir);
        } catch (error) {
          continue; // Provider/theme directory doesn't exist
        }

        const categories = category ? [category] : Object.keys(ILLUSTRATION_STYLES[themeName].categories);

        for (const categoryName of categories) {
          const categoryDir = path.join(themeDir, categoryName);

          try {
            await fs.access(categoryDir);
            const files = await fs.readdir(categoryDir);
            const pngFiles = files.filter(f => f.endsWith('.png'));

            for (const file of pngFiles) {
              const imagePath = path.join(categoryDir, file);
              const metadataPath = imagePath.replace('.png', '.json');
              const name = file.replace('.png', '');

              let metadata = {};
              try {
                const metadataContent = await fs.readFile(metadataPath, 'utf-8');
                metadata = JSON.parse(metadataContent);
              } catch (e) {
                // No metadata file
                metadata = { name };
              }

              illustrations.push({
                name,
                theme: themeName,
                category: categoryName,
                provider,
                imagePath,
                metadata
              });
            }
          } catch (error) {
            // Category directory doesn't exist
            continue;
          }
        }
      }
    }

    return illustrations;
  }

  /**
   * Get cache statistics grouped by provider, theme, and category
   * @returns {Promise<Object>} - Cache statistics
   */
  async getCacheStats() {
    const stats = {
      total: 0,
      byProvider: {},
      byTheme: {}
    };

    const providers = ['dalle', 'gemini'];

    // Get stats by provider
    for (const provider of providers) {
      stats.byProvider[provider] = 0;
    }

    // Get stats by theme
    for (const theme of Object.keys(ILLUSTRATION_STYLES)) {
      stats.byTheme[theme] = {
        total: 0,
        byCategory: {},
        byProvider: {}
      };

      for (const provider of providers) {
        stats.byTheme[theme].byProvider[provider] = 0;
      }

      for (const category of Object.keys(ILLUSTRATION_STYLES[theme].categories)) {
        const illustrations = await this.listIllustrations(theme, category);
        stats.byTheme[theme].byCategory[category] = illustrations.length;
        stats.byTheme[theme].total += illustrations.length;
        stats.total += illustrations.length;

        // Count by provider
        for (const illus of illustrations) {
          if (illus.provider) {
            stats.byProvider[illus.provider] = (stats.byProvider[illus.provider] || 0) + 1;
            stats.byTheme[theme].byProvider[illus.provider] =
              (stats.byTheme[theme].byProvider[illus.provider] || 0) + 1;
          }
        }
      }
    }

    return stats;
  }

  /**
   * Delete a cached illustration
   * @param {string} name - Illustration name
   * @param {string} theme - Theme name
   * @param {string} category - Category name
   * @param {string} provider - Optional provider (searches all if not specified)
   * @returns {Promise<boolean>} - True if deleted
   */
  async deleteIllustration(name, theme, category, provider = null) {
    const providers = provider ? [provider] : ['dalle', 'gemini'];
    const filename = `${this._sanitizeName(name)}.png`;
    let deleted = false;

    for (const prov of providers) {
      const categoryDir = path.join(this.cacheDir, prov, theme, category);
      const imagePath = path.join(categoryDir, filename);
      const metadataPath = imagePath.replace('.png', '.json');

      try {
        await fs.unlink(imagePath);
        await fs.unlink(metadataPath).catch(() => {}); // Ignore if metadata doesn't exist
        this.log(`Deleted illustration: ${name} (${prov}/${theme}/${category})`);
        deleted = true;
      } catch (error) {
        if (error.code === 'ENOENT') {
          continue; // Doesn't exist in this provider
        }
        throw error;
      }
    }

    return deleted;
  }

  /**
   * Clear all cached illustrations for a theme/category
   * @param {string} theme - Optional theme, clears all if not specified
   * @param {string} category - Optional category, clears all in theme if not specified
   * @returns {Promise<number>} - Number of files deleted
   */
  async clearCache(theme = null, category = null) {
    let deletedCount = 0;

    const illustrations = await this.listIllustrations(theme, category);

    for (const illus of illustrations) {
      const deleted = await this.deleteIllustration(illus.name, illus.theme, illus.category);
      if (deleted) deletedCount++;
    }

    this.log(`Cleared ${deletedCount} illustrations`, { theme, category });
    return deletedCount;
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
      provider: {
        imageProvider: this.imageProvider,
        primary: this.primaryProvider,
        fallback: this.fallbackProvider
      }
    };

    // Add client stats if available
    if (this.primaryClient && typeof this.primaryClient.getStats === 'function') {
      stats.primaryClientStats = this.primaryClient.getStats();
    }
    if (this.fallbackClient && typeof this.fallbackClient.getStats === 'function') {
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

    // Reset client stats if available
    if (this.primaryClient && typeof this.primaryClient.resetStats === 'function') {
      this.primaryClient.resetStats();
    }
    if (this.fallbackClient && typeof this.fallbackClient.resetStats === 'function') {
      this.fallbackClient.resetStats();
    }
  }

  // ========== PRIVATE METHODS ==========

  /**
   * Migrate cache from old flat structure to provider-separated structure
   * @private
   */
  async _migrateCacheIfNeeded() {
    const flagPath = path.join(this.cacheDir, '.provider-migration-complete');

    // Check if migration already done
    try {
      await fs.access(flagPath);
      this.log('Cache migration already completed, skipping...');
      return;
    } catch (error) {
      // Flag doesn't exist, proceed with migration
    }

    this.log('Starting cache migration to provider-separated structure...');
    let totalMoved = 0;

    for (const theme of Object.keys(ILLUSTRATION_STYLES)) {
      const categories = Object.keys(ILLUSTRATION_STYLES[theme].categories);

      for (const category of categories) {
        const oldPath = path.join(this.cacheDir, theme, category);
        const newPath = path.join(this.cacheDir, 'dalle', theme, category);

        try {
          // Check if old directory exists
          await fs.access(oldPath);

          // Read files in old directory
          const files = await fs.readdir(oldPath);
          const relevantFiles = files.filter(f => f.endsWith('.png') || f.endsWith('.json'));

          if (relevantFiles.length === 0) {
            continue; // Nothing to migrate
          }

          // Create new directory
          await fs.mkdir(newPath, { recursive: true });

          // Move each file
          let movedCount = 0;
          for (const file of relevantFiles) {
            try {
              const oldFilePath = path.join(oldPath, file);
              const newFilePath = path.join(newPath, file);

              // Check if target already exists (idempotent)
              try {
                await fs.access(newFilePath);
                // Already exists, skip
                continue;
              } catch (e) {
                // Doesn't exist, proceed with move
              }

              await fs.rename(oldFilePath, newFilePath);
              movedCount++;
            } catch (fileError) {
              this.log(`Failed to move file ${file}: ${fileError.message}`, null, 'warn');
            }
          }

          if (movedCount > 0) {
            totalMoved += movedCount;
            this.log(`Migrated ${movedCount} files from ${theme}/${category} to dalle/${theme}/${category}`);
          }
        } catch (error) {
          if (error.code === 'ENOENT') {
            // Old directory doesn't exist, nothing to migrate
            continue;
          }
          this.log(`Error migrating ${theme}/${category}: ${error.message}`, null, 'warn');
        }
      }
    }

    // Write flag file
    await fs.writeFile(flagPath, new Date().toISOString());
    this.log(`Cache migration complete. Migrated ${totalMoved} files total.`);
  }

  /**
   * Get a cached illustration
   * @private
   */
  async _getCachedIllustration(name, theme, category, provider) {
    // If provider is null, return null
    if (!provider) {
      return null;
    }

    const categoryDir = path.join(this.cacheDir, provider, theme, category);
    const filename = `${this._sanitizeName(name)}.png`;
    const imagePath = path.join(categoryDir, filename);
    const metadataPath = imagePath.replace('.png', '.json');

    try {
      await fs.access(imagePath);

      // Load metadata
      let metadata = {};
      try {
        const metadataContent = await fs.readFile(metadataPath, 'utf-8');
        metadata = JSON.parse(metadataContent);
      } catch (e) {
        // No metadata file, create basic metadata
        metadata = { name, theme, category, provider };
      }

      return { imagePath, metadata };
    } catch (error) {
      return null; // Not in cache
    }
  }

  /**
   * Sanitize illustration name for filename
   * @private
   */
  _sanitizeName(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Logging utility
   * @private
   */
  log(message, data = null, level = 'info') {
    if (!this.verbose && level === 'info') return;

    const prefix =
      {
        info: '[ILLUS]',
        warn: '[ILLUS WARNING]',
        error: '[ILLUS ERROR]'
      }[level] || '[ILLUS]';

    if (data) {
      console.log(`${prefix} ${message}`, data);
    } else {
      console.log(`${prefix} ${message}`);
    }
  }
}

/**
 * Factory function to create a configured illustration cache
 */
function createIllustrationCache(customConfig = {}) {
  const cacheDir = customConfig.cacheDir || path.join(__dirname, 'cache', 'illustrations');

  const config = {
    cacheDir,
    verbose: process.env.ILLUS_VERBOSE !== 'false',
    ...customConfig
  };

  return new IllustrationCache(config);
}

module.exports = {
  IllustrationCache,
  createIllustrationCache,
  ILLUSTRATION_STYLES
};
