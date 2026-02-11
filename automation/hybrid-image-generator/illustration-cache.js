/**
 * Illustration Cache
 *
 * Manages illustration element generation and caching using DALL-E.
 * - Generates theme-specific illustrations (chalk sketches, watercolor, tech icons)
 * - Caches with meaningful names and metadata
 * - Provides lookup by name and category
 * - Illustrations are generated once and reused forever
 *
 * Task 1.4: DALL-E Integration - Phase 1
 */

const fs = require('fs').promises;
const path = require('path');
const { createDalleClient } = require('./dalle-client');

// Illustration categories and their style modifiers per theme
const ILLUSTRATION_STYLES = {
  chalkboard: {
    baseStyle: 'hand-drawn chalk sketch style, white lines, simple line art',
    categories: {
      building: 'chalk outline drawing of',
      icon: 'simple chalk icon of',
      diagram: 'chalk diagram showing',
      character: 'chalk stick figure representing'
    }
  },
  watercolor: {
    baseStyle: 'soft watercolor illustration, pastel colors, architectural style',
    categories: {
      building: 'watercolor painting of',
      icon: 'watercolor icon of',
      diagram: 'watercolor illustration showing',
      character: 'watercolor character representing'
    }
  },
  tech: {
    baseStyle: 'isometric 3D tech icon, glowing edges, modern style',
    categories: {
      building: 'isometric 3D tech building of',
      icon: 'isometric tech icon of',
      diagram: '3D isometric diagram showing',
      character: 'isometric tech character representing'
    }
  }
};

class IllustrationCache {
  constructor(options = {}) {
    this.cacheDir = options.cacheDir || path.join(__dirname, 'cache', 'illustrations');
    this.dalleClient = options.dalleClient || createDalleClient();
    this.verbose = options.verbose !== false;
    this.defaultSize = options.defaultSize || '1024x1024';

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
   * @param {string} theme - Theme name (chalkboard, watercolor, tech)
   * @param {string} category - Category (building, icon, diagram, character)
   * @returns {Promise<Object>} - {imagePath, metadata, source}
   */
  async getIllustration(name, theme, category = 'icon') {
    this.stats.totalRequests++;

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

    // Check cache first
    const cached = await this._getCachedIllustration(name, theme, category);
    if (cached) {
      this.stats.cacheHits++;
      this.log(`Using cached illustration: ${name}`, { theme, category });
      return {
        imagePath: cached.imagePath,
        metadata: cached.metadata,
        source: 'cache'
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
    const theme = options.theme || 'watercolor';
    const category = options.category || 'icon';
    const size = options.size || this.defaultSize;

    // Validate inputs
    if (!ILLUSTRATION_STYLES[theme]) {
      throw new Error(`Invalid theme: ${theme}`);
    }

    if (!ILLUSTRATION_STYLES[theme].categories[category]) {
      throw new Error(`Invalid category: ${category}`);
    }

    this.log(`Generating illustration: ${name} (${theme}/${category})...`);

    const startTime = Date.now();

    try {
      // Build DALL-E prompt
      const stylePrefix = ILLUSTRATION_STYLES[theme].categories[category];
      const baseStyle = ILLUSTRATION_STYLES[theme].baseStyle;
      const prompt = `${stylePrefix} ${description}, ${baseStyle}, isolated, no text, ${size}`;

      if (this.verbose) {
        console.log(`[ILLUS] Prompt: "${prompt}"`);
      }

      // Ensure cache directory exists
      const categoryDir = path.join(this.cacheDir, theme, category);
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

      // Generate via DALL-E
      const result = await this.dalleClient.generateAndDownload(prompt, imagePath, { size });

      // Save metadata
      const metadata = {
        name,
        description,
        theme,
        category,
        size,
        prompt: result.revisedPrompt,
        createdAt: new Date().toISOString(),
        generatedBy: 'dalle-3'
      };

      const metadataPath = imagePath.replace('.png', '.json');
      await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));

      this.stats.generated++;
      const latency = Date.now() - startTime;

      this.log(`Illustration generated successfully`, {
        name,
        theme,
        category,
        latency: `${latency}ms`
      });

      return {
        imagePath,
        metadata,
        source: 'generated',
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
   * @returns {Promise<Array>} - Array of {name, theme, category, metadata, imagePath}
   */
  async listIllustrations(theme = null, category = null) {
    const illustrations = [];

    const themes = theme ? [theme] : Object.keys(ILLUSTRATION_STYLES);

    for (const themeName of themes) {
      const themeDir = path.join(this.cacheDir, themeName);

      try {
        await fs.access(themeDir);
      } catch (error) {
        continue; // Theme directory doesn't exist
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

    return illustrations;
  }

  /**
   * Get cache statistics grouped by theme and category
   * @returns {Promise<Object>} - Cache statistics
   */
  async getCacheStats() {
    const stats = {
      total: 0,
      byTheme: {}
    };

    for (const theme of Object.keys(ILLUSTRATION_STYLES)) {
      stats.byTheme[theme] = {
        total: 0,
        byCategory: {}
      };

      for (const category of Object.keys(ILLUSTRATION_STYLES[theme].categories)) {
        const illustrations = await this.listIllustrations(theme, category);
        stats.byTheme[theme].byCategory[category] = illustrations.length;
        stats.byTheme[theme].total += illustrations.length;
        stats.total += illustrations.length;
      }
    }

    return stats;
  }

  /**
   * Delete a cached illustration
   * @param {string} name - Illustration name
   * @param {string} theme - Theme name
   * @param {string} category - Category name
   * @returns {Promise<boolean>} - True if deleted
   */
  async deleteIllustration(name, theme, category) {
    const categoryDir = path.join(this.cacheDir, theme, category);
    const filename = `${this._sanitizeName(name)}.png`;
    const imagePath = path.join(categoryDir, filename);
    const metadataPath = imagePath.replace('.png', '.json');

    try {
      await fs.unlink(imagePath);
      await fs.unlink(metadataPath).catch(() => {}); // Ignore if metadata doesn't exist
      this.log(`Deleted illustration: ${name} (${theme}/${category})`);
      return true;
    } catch (error) {
      if (error.code === 'ENOENT') {
        return false; // Doesn't exist
      }
      throw error;
    }
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
   * Get a cached illustration
   * @private
   */
  async _getCachedIllustration(name, theme, category) {
    const categoryDir = path.join(this.cacheDir, theme, category);
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
        metadata = { name, theme, category };
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
