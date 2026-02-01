/**
 * LinkedIn Image Generator
 * Generates professional infographic images for LinkedIn posts
 *
 * Supports two image types:
 * - card: Simple bullet-point cards (title + 3-5 bullets)
 * - diagram: Architecture diagrams (flow layouts, comparisons, layers)
 */

const path = require('path');
const fs = require('fs');
const { renderToBuffer, renderToFile, loadTemplate } = require('./renderer');
const { getIcon, getStyledIcon } = require('./icons');

// Color schemes for sections
const SECTION_COLORS = ['purple', 'orange', 'green', 'blue', 'cyan'];

// Icon mapping for common data engineering concepts
const TOPIC_ICONS = {
  // Architectures
  'medallion': 'layers',
  'warehouse': 'warehouse',
  'lakehouse': 'lake',
  'data mesh': 'mesh',
  'hybrid': 'network',

  // Layers
  'bronze': 'database',
  'silver': 'filter',
  'gold': 'sparkles',
  'raw': 'document',
  'curated': 'check',
  'aggregated': 'chart',

  // Processing
  'etl': 'flow',
  'elt': 'flow',
  'streaming': 'lightning',
  'batch': 'server',
  'cdc': 'refresh',

  // AI/ML
  'rag': 'brain',
  'agent': 'robot',
  'llm': 'sparkles',
  'embedding': 'target',
  'chunking': 'filter',

  // General
  'optimization': 'wrench',
  'performance': 'zap',
  'security': 'lock',
  'api': 'api',
  'cloud': 'cloud',

  // Interview/educational
  'interview': 'question',
  'tip': 'lightbulb',
  'explain': 'lightbulb'
};

/**
 * Detect appropriate icon based on text content
 * @param {string} text - Text to analyze
 * @returns {string} Icon name
 */
function detectIcon(text) {
  const lowerText = text.toLowerCase();
  for (const [keyword, icon] of Object.entries(TOPIC_ICONS)) {
    if (lowerText.includes(keyword)) {
      return icon;
    }
  }
  return 'sparkles'; // default
}

/**
 * Simple template engine - replaces {{variables}} with values
 * Supports:
 * - {{variable}} - simple replacement
 * - {{{variable}}} - HTML (unescaped)
 * - {{#if var}}...{{/if}} - conditionals
 * - {{#each array}}...{{/each}} - loops
 * - {{@index}}, {{@indexPlusOne}} - loop indices
 * - {{this}} - current item in loop
 */
function renderTemplate(template, data) {
  let html = template;

  // Handle {{#each array}}...{{/each}}
  html = html.replace(/\{\{#each\s+(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g, (match, arrayName, content) => {
    const array = data[arrayName];
    if (!Array.isArray(array)) return '';

    return array.map((item, index) => {
      let itemContent = content;
      // Replace {{this}} with item value (for simple arrays)
      itemContent = itemContent.replace(/\{\{this\}\}/g, typeof item === 'string' ? item : '');
      // Replace {{@index}} and {{@indexPlusOne}}
      itemContent = itemContent.replace(/\{\{@index\}\}/g, index);
      itemContent = itemContent.replace(/\{\{@indexPlusOne\}\}/g, index + 1);
      // Replace {{@last}} check
      itemContent = itemContent.replace(/\{\{#unless\s+@last\}\}([\s\S]*?)\{\{\/unless\}\}/g,
        index === array.length - 1 ? '' : '$1');
      // Replace {{../variable}} with parent data
      itemContent = itemContent.replace(/\{\{\.\.\/([\w.]+)\}\}/g, (m, key) => {
        return data[key] !== undefined ? data[key] : '';
      });
      // For object items, replace {{property}}
      if (typeof item === 'object') {
        for (const [key, value] of Object.entries(item)) {
          const escapedValue = typeof value === 'string' ? escapeHtml(value) : value;
          itemContent = itemContent.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), escapedValue);
          itemContent = itemContent.replace(new RegExp(`\\{\\{\\{${key}\\}\\}\\}`, 'g'), value);
        }
      }
      return itemContent;
    }).join('');
  });

  // Handle {{#if variable}}...{{/if}}
  html = html.replace(/\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, varName, content) => {
    return data[varName] ? content : '';
  });

  // Handle {{{unescaped}}} - HTML content
  html = html.replace(/\{\{\{(\w+)\}\}\}/g, (match, key) => {
    return data[key] !== undefined ? data[key] : '';
  });

  // Handle {{escaped}}
  html = html.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const value = data[key];
    return value !== undefined ? escapeHtml(String(value)) : '';
  });

  return html;
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Generate a card image (title + bullet points)
 * @param {object} input - Card data
 * @param {string} input.title - Card title
 * @param {string[]} input.bullets - Bullet point texts
 * @param {string} input.theme - "light" or "dark"
 * @param {boolean} input.useNumbers - Use numbers instead of icons
 * @param {string} input.headerIcon - Optional header icon name
 * @returns {Promise<Buffer>} PNG buffer
 */
async function generateCard(input) {
  const { title, bullets = [], theme = 'light', useNumbers = true, headerIcon = null } = input;

  // Prepare bullet data with icons
  const bulletData = bullets.map((text, i) => ({
    text,
    icon: getStyledIcon(detectIcon(text))
  }));

  const templateData = {
    theme: theme === 'dark' ? 'dark' : '',
    title,
    subtitle: input.subtitle || '',
    bullets: bulletData,
    useNumbers,
    headerIcon: headerIcon ? getStyledIcon(headerIcon) : null
  };

  const template = loadTemplate('card');
  const html = renderTemplate(template, templateData);

  return renderToBuffer(html);
}

/**
 * Generate a diagram image (architecture comparison, layers, flows)
 * @param {object} input - Diagram data
 * @param {string} input.title - Diagram title
 * @param {object[]} input.sections - Sections/boxes to display
 * @param {boolean} input.isLayered - Use vertical layered layout
 * @param {string} input.theme - "light" or "dark"
 * @returns {Promise<Buffer>} PNG buffer
 */
async function generateDiagram(input) {
  const { title, sections = [], isLayered = false, theme = 'light' } = input;

  // Prepare section data with colors and icons
  const sectionData = sections.map((section, i) => ({
    title: section.title,
    items: section.items || [],
    description: section.description || '',
    icon: getStyledIcon(section.icon || detectIcon(section.title)),
    color: section.color || SECTION_COLORS[i % SECTION_COLORS.length]
  }));

  const templateData = {
    theme: theme === 'dark' ? 'dark' : '',
    title,
    subtitle: input.subtitle || '',
    sections: sectionData,
    isLayered
  };

  const template = loadTemplate('diagram');
  const html = renderTemplate(template, templateData);

  return renderToBuffer(html);
}

/**
 * Main image generation function
 * @param {object} input - Image generation input
 * @param {string} input.imageType - "card" or "diagram"
 * @param {string} input.imageTitle - Image title
 * @param {string[]} input.imageBullets - Bullet points (for cards)
 * @param {object[]} input.imageSections - Sections (for diagrams)
 * @param {string} input.theme - "light" or "dark"
 * @param {string} input.template - Original template name (interview_explainer, architecture, etc.)
 * @returns {Promise<{buffer: Buffer, type: string}>}
 */
async function generateImage(input) {
  const {
    imageType,
    imageTitle,
    imageBullets = [],
    imageSections = [],
    theme = 'light',
    template: templateName
  } = input;

  // Determine if diagram should be layered based on template
  const isLayered = templateName === 'layered' ||
    imageTitle.toLowerCase().includes('layer') ||
    imageTitle.toLowerCase().includes('medallion');

  if (imageType === 'diagram') {
    // For diagrams, use sections if provided, otherwise convert bullets to sections
    let sections = imageSections;
    if (!sections.length && imageBullets.length) {
      // Convert bullets to simple sections
      sections = imageBullets.map((bullet, i) => ({
        title: bullet,
        items: [],
        color: SECTION_COLORS[i % SECTION_COLORS.length]
      }));
    }

    const buffer = await generateDiagram({
      title: imageTitle,
      sections,
      isLayered,
      theme
    });

    return { buffer, type: 'diagram' };
  } else {
    // Default to card
    const buffer = await generateCard({
      title: imageTitle,
      bullets: imageBullets,
      theme,
      useNumbers: true,
      headerIcon: detectIcon(imageTitle)
    });

    return { buffer, type: 'card' };
  }
}

/**
 * Generate image and save to file
 * @param {object} input - Image input (same as generateImage)
 * @param {string} outputPath - Path to save the image
 * @returns {Promise<{path: string, type: string}>}
 */
async function generateImageToFile(input, outputPath) {
  const result = await generateImage(input);

  // Ensure output directory exists
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(outputPath, result.buffer);

  return { path: outputPath, type: result.type };
}

module.exports = {
  generateImage,
  generateImageToFile,
  generateCard,
  generateDiagram,
  detectIcon,
  SECTION_COLORS,
  TOPIC_ICONS
};
