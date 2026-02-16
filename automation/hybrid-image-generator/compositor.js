/**
 * Compositor Module
 *
 * Main Puppeteer rendering engine that:
 * 1. Loads HTML layout templates from layouts/ folder
 * 2. Injects theme CSS variables
 * 3. Replaces Mustache placeholders with content data
 * 4. Layers DALL-E background image behind content
 * 5. Positions illustration images in designated slots
 * 6. Renders to 1080x1080 PNG at 2x scale (2160x2160 actual)
 */

const fs = require('fs').promises;
const path = require('path');
const Mustache = require('mustache');
const puppeteer = require('puppeteer');
const { getTheme, getCSSVariables, getGoogleFontsURL } = require('./themes');

// Configuration constants
const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1080;
const SCALE_FACTOR = 2; // 2x rendering for crisp output (actual: 2160x2160)
const LAYOUTS_DIR = path.join(__dirname, 'layouts');

/**
 * Convert local file path to base64 data URL
 *
 * @param {string} filePath - Path to image file
 * @returns {Promise<string|null>} Data URL or null if failed
 */
async function fileToDataURL(filePath) {
  try {
    const buffer = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();

    // Map file extensions to MIME types
    const mimeTypes = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.webp': 'image/webp'
    };

    const mimeType = mimeTypes[ext] || 'image/png';
    return `data:${mimeType};base64,${buffer.toString('base64')}`;
  } catch (err) {
    console.error(`[Compositor] Failed to load image: ${filePath}`, err.message);
    return null;
  }
}

/**
 * Load HTML template from layouts directory
 *
 * @param {string} layoutName - Name of layout ('comparison', 'evolution', 'single')
 * @returns {Promise<string>} HTML template string
 */
async function loadTemplate(layoutName) {
  const templatePath = path.join(LAYOUTS_DIR, `${layoutName}.html`);

  try {
    const html = await fs.readFile(templatePath, 'utf-8');
    return html;
  } catch (err) {
    throw new Error(`Template '${layoutName}' not found at ${templatePath}: ${err.message}`);
  }
}

/**
 * Prepare template data by combining content with theme and converting images to data URLs
 *
 * @param {Object} config - Compositor configuration
 * @returns {Promise<Object>} { templateData, theme }
 */
async function prepareTemplateData(config) {
  const {
    theme: themeName,
    backgroundPath,
    title,
    subtitle,
    sections = [],
    illustrations = [],
    insight,
    layout
  } = config;

  // Load theme configuration
  const theme = getTheme(themeName);

  // Convert background image to data URL
  let backgroundUrl = '';
  if (backgroundPath) {
    backgroundUrl = await fileToDataURL(backgroundPath);
    if (!backgroundUrl) {
      console.warn('[Compositor] Background image failed to load, using fallback color');
      backgroundUrl = ''; // Will fall back to CSS background-color
    }
  }

  // Get Google Fonts URL for theme
  const googleFontsUrl = getGoogleFontsURL(themeName);

  // Convert illustration paths to data URLs
  const illustrationUrls = {};
  for (const ill of illustrations) {
    if (ill.path && ill.slot) {
      const dataUrl = await fileToDataURL(ill.path);
      if (dataUrl) {
        illustrationUrls[ill.slot] = dataUrl;
      }
    }
  }

  // Prepare base template data
  const templateData = {
    title,
    subtitle,
    googleFontsUrl,
    backgroundUrl,
    insight
  };

  // Layout-specific data preparation
  if (layout === 'comparison') {
    // Comparison layout: left and right sections
    templateData.leftSection = sections[0] || { title: '', items: [] };
    templateData.rightSection = sections[1] || { title: '', items: [] };
    templateData.illustration1Url = illustrationUrls['left'] || illustrationUrls['illustration1'];
    templateData.illustration2Url = illustrationUrls['right'] || illustrationUrls['illustration2'];
    templateData.leftLabel = sections[0]?.label || '';
    templateData.rightLabel = sections[1]?.label || '';
    templateData.showIllustrations = !!(templateData.illustration1Url || templateData.illustration2Url);
  } else if (layout === 'evolution') {
    // Evolution layout: multiple stages with progression
    templateData.stages = sections.map((section, index) => {
      // Transform string items to objects with text and icon properties
      const transformedItems = (section.items || []).map(item => {
        if (typeof item === 'string') {
          return { text: item, icon: '✓', iconType: 'check' };
        }
        return item;
      });

      return {
        ...section,
        items: transformedItems,
        illustrationUrl: illustrationUrls[`stage${index + 1}`] || illustrationUrls[section.slot],
        isLast: index === sections.length - 1
      };
    });
    templateData.showArrows = sections.length > 1;
    templateData.summary = insight;
  } else if (layout === 'single') {
    // Single layout: deep dive on one topic
    templateData.sections = sections;
    templateData.mainIllustrationUrl = illustrationUrls['main'] || illustrationUrls['center'];
    templateData.showMainIllustration = !!templateData.mainIllustrationUrl;
  } else if (layout === 'notebook') {
    // Notebook layout: sections displayed as cards in a grid
    // Cards get alternating accent colors for visual variety
    const sectionColors = ['#3a7bd5', '#e67e22', '#27ae60', '#8e44ad', '#e74c3c', '#f39c12'];
    templateData.sections = sections.map((section, index) => ({
      ...section,
      sectionColor: sectionColors[index % sectionColors.length]
    }));
  } else if (layout === 'whiteboard') {
    // Whiteboard layout: two-column comparison with bordered boxes and arrows
    function buildColumn(section, allSections, filterFn) {
      const rawBoxes = section.subsections || allSections.filter(filterFn).map(s => ({
        title: s.title,
        items: s.items || []
      }));
      // Add isLast flag for arrow rendering
      const boxes = rawBoxes.map((box, i) => ({
        ...box,
        isLast: i === rawBoxes.length - 1
      }));
      return {
        header: section.title || '',
        description: section.description || '',
        boxes
      };
    }

    if (sections.length >= 2) {
      templateData.leftColumn = buildColumn(sections[0], sections, (_, i) => i % 2 === 0);
      templateData.rightColumn = buildColumn(sections[1], sections, (_, i) => i % 2 === 1);
    } else {
      const boxes = sections.map((s, i) => ({ title: s.title, items: s.items || [], isLast: i === sections.length - 1 }));
      templateData.leftColumn = { header: '', description: '', boxes };
      templateData.rightColumn = { header: '', description: '', boxes: [] };
    }
  } else if (layout === 'dense-infographic') {
    // Dense infographic: numbered color-coded sections in grid
    const categoryColors = ['#27ae60', '#2980b9', '#e67e22', '#8e44ad', '#e17055', '#f39c12', '#1abc9c'];
    templateData.sections = sections.map((section, index) => ({
      ...section,
      sectionNumber: index + 1,
      categoryColor: categoryColors[index % categoryColors.length]
    }));
  }

  return { templateData, theme };
}

/**
 * Inject theme CSS variables into HTML body tag
 *
 * @param {string} html - HTML template string
 * @param {Object} theme - Theme configuration object
 * @returns {string} HTML with injected CSS variables
 */
function injectCSSVariables(html, theme) {
  const cssVars = getCSSVariables(theme.name);

  // Find <body> tag and inject style attribute with CSS variables
  const bodyTagRegex = /<body([^>]*)>/;
  const match = html.match(bodyTagRegex);

  if (match) {
    const existingAttrs = match[1];
    const styleAttr = `style="${cssVars}"`;
    const newBodyTag = `<body${existingAttrs} ${styleAttr}>`;
    html = html.replace(bodyTagRegex, newBodyTag);
  } else {
    console.warn('[Compositor] Could not find <body> tag to inject CSS variables');
  }

  return html;
}

/**
 * Render HTML to PNG using Puppeteer
 *
 * @param {string} html - Complete HTML string to render
 * @param {Object} options - Rendering options
 * @param {string} [options.outputPath] - Optional file path to save PNG
 * @param {boolean} [options.verbose] - Enable verbose logging
 * @returns {Promise<Buffer>} PNG image buffer
 */
async function renderToPNG(html, options = {}) {
  const { outputPath = null, verbose = false } = options;

  let browser;
  try {
    if (verbose) {
      console.log('[Compositor] Launching Puppeteer...');
    }

    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Set viewport with 2x scale for crisp rendering
    // Viewport: 1080x1080, rendered at 2x = actual 2160x2160 pixels
    await page.setViewport({
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      deviceScaleFactor: SCALE_FACTOR
    });

    if (verbose) {
      console.log(`[Compositor] Viewport set to ${CANVAS_WIDTH}x${CANVAS_HEIGHT} @ ${SCALE_FACTOR}x scale`);
    }

    // Set content and wait for images to load
    await page.setContent(html, {
      waitUntil: 'networkidle0' // Wait for all network requests (images) to finish
    });

    if (verbose) {
      console.log('[Compositor] Content loaded, rendering screenshot...');
    }

    // Take screenshot
    const screenshotOptions = {
      type: 'png',
      omitBackground: false,
      fullPage: false
    };

    if (outputPath) {
      screenshotOptions.path = outputPath;
    }

    const buffer = await page.screenshot(screenshotOptions);

    if (verbose) {
      console.log(`[Compositor] Screenshot rendered (${buffer.length} bytes)`);
      if (outputPath) {
        console.log(`[Compositor] Saved to: ${outputPath}`);
      }
    }

    await browser.close();

    return buffer;
  } catch (err) {
    if (browser) {
      await browser.close();
    }
    throw new Error(`Puppeteer rendering failed: ${err.message}`);
  }
}

/**
 * Main compositor function - Composes final image from layout template, theme, and content
 *
 * @param {Object} config - Configuration object
 * @param {string} config.layout - Layout type ('comparison', 'evolution', 'single')
 * @param {string} config.theme - Theme name ('chalkboard', 'watercolor', 'tech')
 * @param {string} config.backgroundPath - Path to background image file
 * @param {string} config.title - Main title text
 * @param {string} [config.subtitle] - Optional subtitle
 * @param {Array} config.sections - Content sections (structure varies by layout)
 * @param {Array} [config.illustrations] - Illustration images with slots [{ slot: 'left', path: '...' }]
 * @param {string} [config.insight] - Key insight/quote for bottom section
 * @param {string} [config.outputPath] - Optional output file path
 * @param {boolean} [config.verbose] - Enable verbose logging
 *
 * @returns {Promise<Buffer>} PNG image buffer (2160x2160 pixels)
 *
 * @example
 * const buffer = await compositeImage({
 *   layout: 'comparison',
 *   theme: 'chalkboard',
 *   backgroundPath: 'cache/backgrounds/chalkboard_001.png',
 *   title: 'Data Mesh vs Data Warehouse',
 *   sections: [
 *     { title: 'Features', items: ['Domain ownership', 'Data as product'] },
 *     { title: 'Challenges', items: ['Org change', 'Complexity'] }
 *   ],
 *   illustrations: [
 *     { slot: 'left', path: 'cache/illustrations/cafe.png' },
 *     { slot: 'right', path: 'cache/illustrations/warehouse.png' }
 *   ],
 *   insight: 'Data Mesh is not just technology—it's organizational change.',
 *   outputPath: 'test-outputs/comparison-test.png',
 *   verbose: true
 * });
 */
async function compositeImage(config) {
  const { layout, verbose = false } = config;

  if (verbose) {
    console.log('[Compositor] Starting image composition...');
    console.log(`[Compositor] Layout: ${layout}, Theme: ${config.theme}`);
  }

  try {
    // Step 1: Load HTML template
    if (verbose) console.log('[Compositor] Step 1: Loading template...');
    let html = await loadTemplate(layout);

    // Step 2: Prepare template data (load images, convert to data URLs)
    if (verbose) console.log('[Compositor] Step 2: Preparing template data...');
    const { templateData, theme } = await prepareTemplateData(config);

    // Step 3: Render Mustache template with data
    if (verbose) console.log('[Compositor] Step 3: Rendering Mustache template...');
    html = Mustache.render(html, templateData);

    // Step 4: Inject CSS variables from theme
    if (verbose) console.log('[Compositor] Step 4: Injecting CSS variables...');
    html = injectCSSVariables(html, theme);

    // Step 5: Render to PNG using Puppeteer
    if (verbose) console.log('[Compositor] Step 5: Rendering to PNG with Puppeteer...');
    const buffer = await renderToPNG(html, {
      outputPath: config.outputPath,
      verbose
    });

    if (verbose) {
      console.log('[Compositor] ✓ Image composition complete');
    }

    return buffer;
  } catch (err) {
    console.error('[Compositor] Composition failed:', err.message);
    throw err;
  }
}

// Export main function and utilities
module.exports = {
  // Main API
  compositeImage,

  // Utility functions (exported for testing)
  loadTemplate,
  prepareTemplateData,
  injectCSSVariables,
  renderToPNG,
  fileToDataURL,

  // Constants (exported for reference)
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  SCALE_FACTOR
};
