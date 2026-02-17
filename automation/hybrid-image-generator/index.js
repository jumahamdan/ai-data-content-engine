/**
 * Hybrid Image Generator - Main API
 *
 * Orchestrates the full pipeline:
 * 1. Content validation and auto-selection (theme/layout)
 * 2. Background generation (DALL-E/Gemini/none via IMAGE_PROVIDER with fallback)
 * 3. Illustration lookup (optional, provider-aware)
 * 4. Final composition (Puppeteer rendering)
 *
 * Usage:
 *   const { generateImage } = require('./hybrid-image-generator');
 *
 *   const result = await generateImage({
 *     title: 'Data Mesh vs Data Warehouse',
 *     sections: [...],
 *     theme: 'chalkboard',  // optional, auto-selected
 *     layout: 'comparison', // optional, auto-selected
 *     outputPath: './output.png'
 *   });
 *
 * Task 5.1: Main API & Integration - Phase 5
 */

const { createBackgroundGenerator } = require('./background-generator');
const { compositeImage } = require('./compositor');
const { getThemeNames, isValidTheme } = require('./themes');
const { createIllustrationCache } = require('./illustration-cache');

// Constants
const DEFAULT_THEME = 'chalkboard';
const DEFAULT_LAYOUT = 'single';
const VALID_LAYOUTS = ['comparison', 'evolution', 'single', 'notebook', 'whiteboard', 'dense-infographic'];

/**
 * Auto-select theme based on content metadata
 *
 * @param {Object} contentData - Content data with optional hints
 * @returns {string} Selected theme name
 */
function autoSelectTheme(contentData) {
  const { imageTheme, imageMood, content, title } = contentData;

  // Priority 1: Explicit theme from metadata
  if (imageTheme && isValidTheme(imageTheme)) {
    return imageTheme;
  }

  // Priority 2: Mood-based mapping
  const moodMap = {
    educational: 'chalkboard',
    professional: 'watercolor',
    technical: 'tech',
    modern: 'tech',
    traditional: 'watercolor',
    casual: 'chalkboard'
  };

  if (imageMood && moodMap[imageMood.toLowerCase()]) {
    return moodMap[imageMood.toLowerCase()];
  }

  // Priority 3: Content analysis (keywords in title/content)
  const combinedText = `${title || ''} ${content || ''}`.toLowerCase();

  if (combinedText.includes('architecture') || combinedText.includes('design pattern')) {
    return 'watercolor';
  }
  if (combinedText.includes('api') || combinedText.includes('system') || combinedText.includes('cloud')) {
    return 'tech';
  }
  if (combinedText.includes('explain') || combinedText.includes('introduction') || combinedText.includes('basics')) {
    return 'chalkboard';
  }

  // Default: chalkboard (most versatile)
  return DEFAULT_THEME;
}

/**
 * Auto-select layout based on content structure
 *
 * @param {Object} contentData - Content data
 * @returns {string} Selected layout name
 */
function autoSelectLayout(contentData) {
  const { imageType, layout, sections = [] } = contentData;

  // Priority 1: Explicit layout from metadata
  if (imageType && VALID_LAYOUTS.includes(imageType)) {
    return imageType;
  }
  if (layout && VALID_LAYOUTS.includes(layout)) {
    return layout;
  }

  // Priority 2: Structure analysis
  if (sections.length === 0) {
    return 'single'; // No sections = deep dive
  }

  // Check if sections have comparison indicators (pros/cons)
  const hasComparison = sections.some(
    s =>
      s.type === 'pros' ||
      s.type === 'cons' ||
      s.title?.toLowerCase().includes('vs') ||
      s.title?.toLowerCase().includes('features') ||
      s.title?.toLowerCase().includes('challenges')
  );

  if (hasComparison && sections.length <= 2) {
    return 'comparison'; // 2 sections with pros/cons = comparison
  }

  // Check for evolution/progression indicators
  const hasProgression = sections.some(
    s =>
      s.title?.toLowerCase().includes('stage') ||
      s.title?.toLowerCase().includes('phase') ||
      s.title?.toLowerCase().includes('step')
  );

  if (hasProgression && sections.length >= 2) {
    return 'evolution'; // Multiple stages = evolution
  }

  // Default based on section count
  if (sections.length >= 3) {
    return 'evolution'; // 3+ sections = horizontal flow
  }
  if (sections.length === 2) {
    return 'comparison'; // 2 sections = side-by-side
  }

  return DEFAULT_LAYOUT; // Single as fallback
}

/**
 * Validate and normalize content data
 *
 * @param {Object} contentData - Raw content data
 * @returns {Object} Normalized content data
 * @throws {Error} If validation fails
 */
function validateContentData(contentData) {
  if (!contentData || typeof contentData !== 'object') {
    throw new Error('Content data must be an object');
  }

  const { title, sections = [] } = contentData;

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    throw new Error('Content data must include a non-empty title');
  }

  // Normalize sections (preserve extra properties like subsections, description)
  const normalizedSections = sections.map((section, index) => {
    if (!section.title && !section.items) {
      throw new Error(`Section ${index} must have at least a title or items`);
    }

    return {
      ...section,
      title: section.title || '',
      items: Array.isArray(section.items) ? section.items : [],
      type: section.type || 'neutral',
      label: section.label || ''
    };
  });

  return {
    ...contentData,
    title: title.trim(),
    sections: normalizedSections,
    subtitle: contentData.subtitle?.trim() || '',
    insight: contentData.insight?.trim() || contentData.imageInsight?.trim() || ''
  };
}

/**
 * Resolve illustration paths from content data
 *
 * @param {Object} contentData - Content data with optional illustration hints
 * @param {string} theme - Selected theme
 * @param {Object} illustrationCache - Illustration cache instance
 * @returns {Promise<Array>} Array of illustration objects with paths
 */
async function resolveIllustrations(contentData, theme, illustrationCache) {
  const { illustrations = [], imageIllustrations = [] } = contentData;
  const resolvedIllustrations = [];

  // Merge illustrations from both sources
  const allIllustrations = [...illustrations, ...imageIllustrations];

  for (const illus of allIllustrations) {
    try {
      // If path is already provided, use it
      if (illus.path) {
        resolvedIllustrations.push({
          slot: illus.slot || 'main',
          path: illus.path
        });
        continue;
      }

      // If name is provided, lookup in cache
      if (illus.name) {
        const cached = await illustrationCache.getIllustration(illus.name, theme, illus.category || 'icon');

        resolvedIllustrations.push({
          slot: illus.slot || 'main',
          path: cached.imagePath
        });
      }
    } catch (error) {
      // Illustration not found - skip with warning
      console.warn(`[HybridGen] Illustration not found: ${illus.name || illus.slot}. Skipping.`);
    }
  }

  return resolvedIllustrations;
}

/**
 * Generate a hybrid image from content data
 *
 * @param {Object} contentData - Content data object
 * @param {string} contentData.title - Main title (required)
 * @param {string} [contentData.subtitle] - Optional subtitle
 * @param {Array} [contentData.sections] - Content sections
 * @param {string} [contentData.insight] - Key insight/quote
 * @param {string} [contentData.theme] - Theme override (auto-selected if not provided)
 * @param {string} [contentData.layout] - Layout override (auto-selected if not provided)
 * @param {Array} [contentData.illustrations] - Illustration hints
 * @param {Object} options - Generation options
 * @param {string} [options.outputPath] - Optional output file path
 * @param {boolean} [options.verbose] - Enable verbose logging
 * @param {boolean} [options.forceBackground] - Force background regeneration (ignore cache)
 * @param {Object} [options.backgroundGenerator] - Custom background generator instance
 * @param {Object} [options.illustrationCache] - Custom illustration cache instance
 *
 * @returns {Promise<Object>} Result object with image buffer and metadata
 *
 * @example
 * const result = await generateImage({
 *   title: 'Data Mesh for Data Engineers',
 *   subtitle: 'Understanding distributed data architecture',
 *   sections: [
 *     { title: 'Key Features', type: 'pros', items: ['Domain ownership', 'Data as product'] },
 *     { title: 'Challenges', type: 'cons', items: ['Org change', 'Complexity'] }
 *   ],
 *   insight: 'Data Mesh turns data engineering from a service desk into product engineering.',
 *   theme: 'chalkboard', // optional
 *   layout: 'comparison'  // optional
 * }, {
 *   outputPath: './test-outputs/data-mesh.png',
 *   verbose: true
 * });
 */
async function generateImage(contentData, options = {}) {
  const startTime = Date.now();
  const verbose = options.verbose !== false;

  if (verbose) {
    console.log('[HybridGen] ========================================');
    console.log('[HybridGen] Starting hybrid image generation...');
  }

  try {
    // Step 1: Validate and normalize content data
    if (verbose) console.log('[HybridGen] Step 1: Validating content data...');
    const normalizedData = validateContentData(contentData);

    // Step 2: Auto-select theme and layout
    if (verbose) console.log('[HybridGen] Step 2: Auto-selecting theme and layout...');
    const theme = contentData.theme || autoSelectTheme(normalizedData);
    const layout = contentData.layout || autoSelectLayout(normalizedData);

    if (verbose) {
      console.log(`[HybridGen]   Theme: ${theme} ${contentData.theme ? '(explicit)' : '(auto-selected)'}`);
      console.log(`[HybridGen]   Layout: ${layout} ${contentData.layout ? '(explicit)' : '(auto-selected)'}`);
    }

    // Validate theme and layout
    if (!isValidTheme(theme)) {
      throw new Error(`Invalid theme: ${theme}. Valid themes: ${getThemeNames().join(', ')}`);
    }
    if (!VALID_LAYOUTS.includes(layout)) {
      throw new Error(`Invalid layout: ${layout}. Valid layouts: ${VALID_LAYOUTS.join(', ')}`);
    }

    // Step 3: Generate or retrieve background
    if (verbose) console.log('[HybridGen] Step 3: Getting background image...');
    const backgroundGenerator = options.backgroundGenerator || createBackgroundGenerator({ verbose });
    const backgroundResult = await backgroundGenerator.getBackground(theme, {
      force: options.forceBackground || false
    });

    // Handle IMAGE_PROVIDER=none or failure
    let backgroundPath = null;
    if (backgroundResult.success !== false && backgroundResult.imagePath) {
      backgroundPath = backgroundResult.imagePath;
      if (verbose) {
        console.log(`[HybridGen]   Background: ${backgroundResult.source} (${backgroundResult.latency}ms)`);
      }
    } else {
      if (verbose) {
        console.log(
          `[HybridGen] No AI background available (provider: ${backgroundResult.source || 'none'}), using CSS fallback`
        );
      }
    }

    // Step 4: Resolve illustrations (optional)
    if (verbose) console.log('[HybridGen] Step 4: Resolving illustrations...');
    const illustrationCache = options.illustrationCache || createIllustrationCache({ verbose });
    const illustrations = await resolveIllustrations(normalizedData, theme, illustrationCache);

    if (verbose) {
      console.log(`[HybridGen]   Illustrations: ${illustrations.length} found`);
    }

    // Step 5: Composite final image
    if (verbose) console.log('[HybridGen] Step 5: Compositing final image...');
    const buffer = await compositeImage({
      layout,
      theme,
      backgroundPath, // May be null if IMAGE_PROVIDER=none
      title: normalizedData.title,
      subtitle: normalizedData.subtitle,
      sections: normalizedData.sections,
      illustrations,
      insight: normalizedData.insight,
      outputPath: options.outputPath,
      verbose
    });

    const totalTime = Date.now() - startTime;

    if (verbose) {
      console.log('[HybridGen] ========================================');
      console.log(`[HybridGen] ✓ Image generated successfully (${totalTime}ms)`);
      if (options.outputPath) {
        console.log(`[HybridGen] Saved to: ${options.outputPath}`);
      }
    }

    // Return result with metadata
    return {
      success: true,
      buffer,
      imagePath: options.outputPath || null,
      metadata: {
        theme,
        layout,
        title: normalizedData.title,
        backgroundSource: backgroundResult.source,
        provider: backgroundResult.provider || (backgroundResult.source || '').replace(/^cache-/, '') || 'unknown',
        illustrationCount: illustrations.length,
        generatedAt: new Date().toISOString(),
        latency: {
          total: totalTime,
          background: backgroundResult.latency
        }
      }
    };
  } catch (error) {
    const totalTime = Date.now() - startTime;

    console.error('[HybridGen] ✗ Image generation failed:', error.message);

    return {
      success: false,
      error: error.message,
      metadata: {
        generatedAt: new Date().toISOString(),
        latency: {
          total: totalTime
        }
      }
    };
  }
}

/**
 * Quick generation helper with minimal configuration
 *
 * @param {string} title - Image title
 * @param {Array} sections - Content sections
 * @param {string} outputPath - Output file path
 * @returns {Promise<Object>} Generation result
 *
 * @example
 * await quickGenerate(
 *   'Comparison Title',
 *   [
 *     { title: 'Features', items: ['A', 'B'] },
 *     { title: 'Challenges', items: ['X', 'Y'] }
 *   ],
 *   './output.png'
 * );
 */
async function quickGenerate(title, sections, outputPath) {
  return generateImage({ title, sections }, { outputPath, verbose: true });
}

/**
 * Batch generation helper for multiple images
 *
 * @param {Array} contentDataArray - Array of content data objects
 * @param {Object} options - Shared options for all images
 * @returns {Promise<Array>} Array of generation results
 *
 * @example
 * const results = await batchGenerate([
 *   { title: 'Image 1', sections: [...], outputPath: './img1.png' },
 *   { title: 'Image 2', sections: [...], outputPath: './img2.png' }
 * ], { verbose: true });
 */
async function batchGenerate(contentDataArray, options = {}) {
  const results = [];
  const verbose = options.verbose !== false;

  if (verbose) {
    console.log(`[HybridGen] Batch generating ${contentDataArray.length} images...`);
  }

  // Create shared instances for better caching
  const backgroundGenerator = createBackgroundGenerator({ verbose });
  const illustrationCache = createIllustrationCache({ verbose });

  for (let i = 0; i < contentDataArray.length; i++) {
    const contentData = contentDataArray[i];

    if (verbose) {
      console.log(`\n[HybridGen] Generating ${i + 1}/${contentDataArray.length}...`);
    }

    const result = await generateImage(contentData, {
      ...options,
      backgroundGenerator, // Reuse instance for caching
      illustrationCache, // Reuse instance for caching
      outputPath: contentData.outputPath
    });

    results.push(result);
  }

  if (verbose) {
    const successCount = results.filter(r => r.success).length;
    const failedCount = results.length - successCount;
    console.log(`\n[HybridGen] Batch complete: ${successCount} succeeded, ${failedCount} failed`);
  }

  return results;
}

/**
 * Get generation statistics from last run
 *
 * @param {Object} backgroundGenerator - Background generator instance
 * @returns {Object} Statistics object
 */
function getStats(backgroundGenerator) {
  if (!backgroundGenerator) {
    return { error: 'No background generator instance provided' };
  }

  return backgroundGenerator.getStats();
}

// Export main API
module.exports = {
  // Main functions
  generateImage,
  quickGenerate,
  batchGenerate,
  getStats,

  // Helper functions (exported for advanced usage)
  autoSelectTheme,
  autoSelectLayout,
  validateContentData,
  resolveIllustrations,

  // Constants
  DEFAULT_THEME,
  DEFAULT_LAYOUT,
  VALID_LAYOUTS
};
