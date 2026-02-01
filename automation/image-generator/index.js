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
const { renderToBuffer, renderToFile } = require('./renderer');
const { getIcon, getStyledIcon } = require('./icons');

// Color schemes for sections
const SECTION_COLORS = {
  purple: { bg: '#EEF2FF', border: '#6366F1', text: '#4338CA' },
  orange: { bg: '#FFF7ED', border: '#F97316', text: '#C2410C' },
  green: { bg: '#F0FDF4', border: '#22C55E', text: '#15803D' },
  blue: { bg: '#EFF6FF', border: '#3B82F6', text: '#1D4ED8' },
  cyan: { bg: '#ECFEFF', border: '#06B6D4', text: '#0E7490' }
};

const COLOR_ORDER = ['purple', 'orange', 'green', 'blue', 'cyan'];

// Icon mapping for common data engineering concepts
const TOPIC_ICONS = {
  'medallion': 'layers', 'warehouse': 'warehouse', 'lakehouse': 'lake',
  'data mesh': 'mesh', 'hybrid': 'network', 'bronze': 'database',
  'silver': 'filter', 'gold': 'sparkles', 'raw': 'document',
  'curated': 'check', 'aggregated': 'chart', 'etl': 'flow',
  'elt': 'flow', 'streaming': 'lightning', 'batch': 'server',
  'cdc': 'refresh', 'rag': 'brain', 'agent': 'robot',
  'llm': 'sparkles', 'embedding': 'target', 'chunking': 'filter',
  'optimization': 'wrench', 'performance': 'zap', 'security': 'lock',
  'api': 'api', 'cloud': 'cloud', 'interview': 'question',
  'tip': 'lightbulb', 'explain': 'lightbulb', 'sql': 'database',
  'window': 'chart', 'ingestion': 'document', 'vector': 'database',
  'retrieval': 'brain', 'generation': 'sparkles'
};

/**
 * Detect appropriate icon based on text content
 */
function detectIcon(text) {
  const lowerText = text.toLowerCase();
  for (const [keyword, icon] of Object.entries(TOPIC_ICONS)) {
    if (lowerText.includes(keyword)) {
      return icon;
    }
  }
  return 'sparkles';
}

/**
 * Get base CSS styles (inlined for Puppeteer)
 */
function getBaseStyles() {
  return `
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      width: 1080px;
      height: 1080px;
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      background: linear-gradient(135deg, #FAFBFC 0%, #F3F4F6 100%);
      color: #1F2937;
      overflow: hidden;
    }

    .container {
      width: 100%;
      height: 100%;
      padding: 60px;
      display: flex;
      flex-direction: column;
    }

    .title {
      font-size: 48px;
      font-weight: 800;
      line-height: 1.2;
      margin-bottom: 40px;
      color: #1F2937;
    }

    .header-icon {
      width: 64px;
      height: 64px;
      margin-bottom: 24px;
      color: #6366F1;
    }

    .header-icon svg {
      width: 100%;
      height: 100%;
    }

    /* Card styles */
    .card-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .bullet-list {
      list-style: none;
    }

    .bullet-item {
      display: flex;
      align-items: flex-start;
      gap: 20px;
      padding: 20px 0;
      border-bottom: 1px solid #E5E7EB;
      font-size: 26px;
      line-height: 1.4;
    }

    .bullet-item:last-child {
      border-bottom: none;
    }

    .bullet-number {
      flex-shrink: 0;
      width: 44px;
      height: 44px;
      background: #6366F1;
      color: white;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 22px;
    }

    .bullet-text {
      flex: 1;
      color: #374151;
      padding-top: 6px;
    }

    /* Diagram styles */
    .diagram-title {
      text-align: center;
      margin-bottom: 40px;
    }

    .diagram-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .flow-horizontal {
      display: flex;
      gap: 20px;
      align-items: stretch;
      flex: 1;
    }

    .flow-vertical {
      display: flex;
      flex-direction: column;
      gap: 12px;
      flex: 1;
    }

    .section-box {
      flex: 1;
      background: white;
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      border-top: 5px solid #6366F1;
      display: flex;
      flex-direction: column;
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }

    .section-icon {
      width: 32px;
      height: 32px;
      color: #6366F1;
    }

    .section-icon svg {
      width: 100%;
      height: 100%;
    }

    .section-title {
      font-size: 22px;
      font-weight: 700;
      color: #1F2937;
    }

    .section-items {
      list-style: none;
      flex: 1;
    }

    .section-item {
      font-size: 17px;
      line-height: 1.5;
      padding: 6px 0;
      color: #4B5563;
      display: flex;
      align-items: flex-start;
      gap: 10px;
    }

    .section-item::before {
      content: "";
      width: 6px;
      height: 6px;
      background: #6366F1;
      border-radius: 50%;
      margin-top: 8px;
      flex-shrink: 0;
    }

    /* Layer box (vertical stacked) */
    .layer-box {
      background: white;
      border-radius: 14px;
      padding: 20px 28px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
      display: flex;
      align-items: center;
      gap: 20px;
      border-left: 5px solid #6366F1;
    }

    .layer-icon {
      width: 44px;
      height: 44px;
      flex-shrink: 0;
      color: #6366F1;
    }

    .layer-icon svg {
      width: 100%;
      height: 100%;
    }

    .layer-content {
      flex: 1;
    }

    .layer-title {
      font-size: 22px;
      font-weight: 700;
      margin-bottom: 4px;
      color: #1F2937;
    }

    .layer-description {
      font-size: 16px;
      color: #6B7280;
    }

    .arrow-connector {
      display: flex;
      align-items: center;
      justify-content: center;
      color: #9CA3AF;
      padding: 4px 0;
    }

    .arrow-connector svg {
      width: 28px;
      height: 28px;
    }

    /* Footer */
    .footer {
      margin-top: auto;
      padding-top: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .footer-brand {
      font-size: 16px;
      color: #9CA3AF;
      font-weight: 500;
    }

    .footer-handle {
      font-size: 18px;
      color: #6366F1;
      font-weight: 600;
    }
  `;
}

/**
 * Build card HTML directly (no template engine)
 */
function buildCardHtml(data) {
  const { title, bullets = [], headerIcon } = data;

  const headerIconHtml = headerIcon
    ? `<div class="header-icon">${getStyledIcon(headerIcon, '#6366F1', '#6366F1')}</div>`
    : '';

  const bulletsHtml = bullets.map((text, i) => `
    <li class="bullet-item">
      <span class="bullet-number">${i + 1}</span>
      <span class="bullet-text">${escapeHtml(text)}</span>
    </li>
  `).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>${getBaseStyles()}</style>
</head>
<body>
  <div class="container">
    <div class="card-header">
      ${headerIconHtml}
      <h1 class="title">${escapeHtml(title)}</h1>
    </div>
    <div class="card-content">
      <ul class="bullet-list">
        ${bulletsHtml}
      </ul>
    </div>
    <div class="footer">
      <span class="footer-brand">Data & AI Insights</span>
      <span class="footer-handle">@jumahamdan</span>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Build diagram HTML (horizontal comparison)
 */
function buildDiagramHtml(data) {
  const { title, sections = [] } = data;

  const sectionsHtml = sections.map((section, i) => {
    const colorKey = COLOR_ORDER[i % COLOR_ORDER.length];
    const colors = SECTION_COLORS[colorKey];
    const iconHtml = getStyledIcon(section.icon || detectIcon(section.title), colors.border, colors.border);

    const itemsHtml = (section.items || []).map(item => `
      <li class="section-item">${escapeHtml(item)}</li>
    `).join('');

    return `
      <div class="section-box" style="border-top-color: ${colors.border}; background: ${colors.bg};">
        <div class="section-header">
          <div class="section-icon" style="color: ${colors.border};">${iconHtml}</div>
          <h3 class="section-title" style="color: ${colors.text};">${escapeHtml(section.title)}</h3>
        </div>
        <ul class="section-items">
          ${itemsHtml}
        </ul>
      </div>
    `;
  }).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>${getBaseStyles()}</style>
</head>
<body>
  <div class="container">
    <div class="diagram-title">
      <h1 class="title">${escapeHtml(title)}</h1>
    </div>
    <div class="diagram-container">
      <div class="flow-horizontal">
        ${sectionsHtml}
      </div>
    </div>
    <div class="footer">
      <span class="footer-brand">Data & AI Insights</span>
      <span class="footer-handle">@jumahamdan</span>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Build layered diagram HTML (vertical stacked)
 */
function buildLayeredHtml(data) {
  const { title, sections = [] } = data;
  const arrowSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12l7 7 7-7"/></svg>';

  const layersHtml = sections.map((section, i) => {
    const colorKey = COLOR_ORDER[i % COLOR_ORDER.length];
    const colors = SECTION_COLORS[colorKey];
    const iconHtml = getStyledIcon(section.icon || detectIcon(section.title), colors.border, colors.border);

    const layerHtml = `
      <div class="layer-box" style="border-left-color: ${colors.border}; background: ${colors.bg};">
        <div class="layer-icon" style="color: ${colors.border};">${iconHtml}</div>
        <div class="layer-content">
          <div class="layer-title" style="color: ${colors.text};">${escapeHtml(section.title)}</div>
          ${section.description ? `<div class="layer-description">${escapeHtml(section.description)}</div>` : ''}
        </div>
      </div>
    `;

    // Add arrow between layers (except after last)
    if (i < sections.length - 1) {
      return layerHtml + `<div class="arrow-connector">${arrowSvg}</div>`;
    }
    return layerHtml;
  }).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>${getBaseStyles()}</style>
</head>
<body>
  <div class="container">
    <div class="diagram-title">
      <h1 class="title">${escapeHtml(title)}</h1>
    </div>
    <div class="diagram-container">
      <div class="flow-vertical">
        ${layersHtml}
      </div>
    </div>
    <div class="footer">
      <span class="footer-brand">Data & AI Insights</span>
      <span class="footer-handle">@jumahamdan</span>
    </div>
  </div>
</body>
</html>`;
}

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Generate a card image
 */
async function generateCard(input) {
  const { title, bullets = [], headerIcon } = input;
  const html = buildCardHtml({
    title,
    bullets,
    headerIcon: headerIcon || detectIcon(title)
  });
  return renderToBuffer(html);
}

/**
 * Generate a diagram image
 */
async function generateDiagram(input) {
  const { title, sections = [], isLayered = false } = input;

  const html = isLayered
    ? buildLayeredHtml({ title, sections })
    : buildDiagramHtml({ title, sections });

  return renderToBuffer(html);
}

/**
 * Main image generation function
 */
async function generateImage(input) {
  const {
    imageType,
    imageTitle,
    imageBullets = [],
    imageSections = [],
    template: templateName
  } = input;

  const isLayered = templateName === 'layered' ||
    imageTitle.toLowerCase().includes('layer');

  if (imageType === 'diagram') {
    let sections = imageSections;
    if (!sections.length && imageBullets.length) {
      // Convert bullets to sections
      sections = imageBullets.map((bullet, i) => {
        const parts = bullet.split(':');
        return {
          title: parts[0].trim(),
          items: parts.length > 1 ? [parts.slice(1).join(':').trim()] : [],
          description: parts.length > 1 ? parts.slice(1).join(':').trim() : ''
        };
      });
    }

    const buffer = await generateDiagram({
      title: imageTitle,
      sections,
      isLayered
    });
    return { buffer, type: 'diagram' };
  } else {
    const buffer = await generateCard({
      title: imageTitle,
      bullets: imageBullets
    });
    return { buffer, type: 'card' };
  }
}

/**
 * Generate image and save to file
 */
async function generateImageToFile(input, outputPath) {
  const result = await generateImage(input);

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
