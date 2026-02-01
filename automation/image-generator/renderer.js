/**
 * Puppeteer-based HTML to PNG renderer
 * Renders HTML templates to 1080x1080 LinkedIn-ready images
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const IMAGE_WIDTH = 1080;
const IMAGE_HEIGHT = 1080;

/**
 * Render HTML string to PNG buffer
 * @param {string} htmlContent - Complete HTML to render
 * @param {object} options - Render options
 * @returns {Promise<Buffer>} PNG image buffer
 */
async function renderToBuffer(htmlContent, options = {}) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();

    await page.setViewport({
      width: IMAGE_WIDTH,
      height: IMAGE_HEIGHT,
      deviceScaleFactor: options.scale || 2 // 2x for retina-quality
    });

    // Load the HTML content
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0'
    });

    // Wait for fonts to load
    await page.evaluate(() => document.fonts.ready);

    // Take screenshot
    const buffer = await page.screenshot({
      type: 'png',
      clip: {
        x: 0,
        y: 0,
        width: IMAGE_WIDTH,
        height: IMAGE_HEIGHT
      }
    });

    return buffer;
  } finally {
    await browser.close();
  }
}

/**
 * Render HTML string to file
 * @param {string} htmlContent - Complete HTML to render
 * @param {string} outputPath - Path to save PNG
 * @param {object} options - Render options
 * @returns {Promise<string>} Saved file path
 */
async function renderToFile(htmlContent, outputPath, options = {}) {
  const buffer = await renderToBuffer(htmlContent, options);

  // Ensure output directory exists
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(outputPath, buffer);
  return outputPath;
}

/**
 * Read template file and inject CSS path
 * @param {string} templateName - Template name (card or diagram)
 * @returns {string} Template HTML with proper paths
 */
function loadTemplate(templateName) {
  const templatePath = path.join(__dirname, 'templates', `${templateName}.html`);
  let html = fs.readFileSync(templatePath, 'utf8');

  // Convert relative CSS path to absolute for Puppeteer
  const cssPath = path.join(__dirname, 'styles', 'base.css').replace(/\\/g, '/');
  html = html.replace('../styles/base.css', `file:///${cssPath}`);

  return html;
}

module.exports = {
  renderToBuffer,
  renderToFile,
  loadTemplate,
  IMAGE_WIDTH,
  IMAGE_HEIGHT
};
