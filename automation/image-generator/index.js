/**
 * LinkedIn Image Generator
 * Generates professional infographic images for LinkedIn posts
 *
 * Supports image types:
 * - card: Simple bullet-point cards (title + 3-5 bullets)
 * - diagram: Architecture diagrams (flow layouts, comparisons, layers)
 * - cheatsheet: Table/grid comparisons with code snippets
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
      padding: 48px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .title {
      font-size: 52px;
      font-weight: 800;
      line-height: 1.15;
      margin-bottom: 32px;
      color: #1F2937;
    }

    .header-icon {
      width: 72px;
      height: 72px;
      margin-bottom: 20px;
      color: #6366F1;
    }

    .header-icon svg {
      width: 100%;
      height: 100%;
    }

    /* Card styles */
    .card-content {
      display: flex;
      flex-direction: column;
    }

    .bullet-list {
      list-style: none;
    }

    .bullet-item {
      display: flex;
      align-items: center;
      gap: 24px;
      padding: 28px 0;
      border-bottom: 2px solid #E5E7EB;
      font-size: 30px;
      line-height: 1.3;
    }

    .bullet-item:last-child {
      border-bottom: none;
    }

    .bullet-number {
      flex-shrink: 0;
      width: 52px;
      height: 52px;
      background: #6366F1;
      color: white;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 26px;
    }

    .bullet-text {
      flex: 1;
      color: #374151;
    }

    /* Diagram styles */
    .diagram-title {
      text-align: center;
      margin-bottom: 32px;
    }

    .diagram-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .flow-horizontal {
      display: flex;
      gap: 24px;
      align-items: stretch;
    }

    .flow-vertical {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .section-box {
      flex: 1;
      background: white;
      border-radius: 20px;
      padding: 28px;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
      border-top: 6px solid #6366F1;
      display: flex;
      flex-direction: column;
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 20px;
    }

    .section-icon {
      width: 36px;
      height: 36px;
      color: #6366F1;
    }

    .section-icon svg {
      width: 100%;
      height: 100%;
    }

    .section-title {
      font-size: 26px;
      font-weight: 700;
      color: #1F2937;
    }

    .section-items {
      list-style: none;
      flex: 1;
    }

    .section-item {
      font-size: 20px;
      line-height: 1.5;
      padding: 10px 0;
      color: #4B5563;
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }

    .section-item::before {
      content: "";
      width: 8px;
      height: 8px;
      background: #6366F1;
      border-radius: 50%;
      margin-top: 10px;
      flex-shrink: 0;
    }

    /* Layer box (vertical stacked) */
    .layer-box {
      background: white;
      border-radius: 16px;
      padding: 28px 32px;
      box-shadow: 0 3px 16px rgba(0, 0, 0, 0.07);
      display: flex;
      align-items: center;
      gap: 24px;
      border-left: 6px solid #6366F1;
    }

    .layer-icon {
      width: 52px;
      height: 52px;
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
      font-size: 26px;
      font-weight: 700;
      margin-bottom: 6px;
      color: #1F2937;
    }

    .layer-description {
      font-size: 19px;
      color: #6B7280;
    }

    .arrow-connector {
      display: flex;
      align-items: center;
      justify-content: center;
      color: #9CA3AF;
      padding: 8px 0;
    }

    .arrow-connector svg {
      width: 32px;
      height: 32px;
    }

    /* Cheatsheet/Table styles */
    .cheatsheet-container {
      width: 100%;
      height: 100%;
      padding: 40px;
      display: flex;
      flex-direction: column;
    }

    .cheatsheet-header {
      text-align: center;
      margin-bottom: 24px;
    }

    .cheatsheet-title {
      font-size: 42px;
      font-weight: 800;
      margin-bottom: 8px;
    }

    .cheatsheet-title .highlight {
      color: #3B82F6;
    }

    .cheatsheet-title .highlight-orange {
      color: #F97316;
    }

    .cheatsheet-title .highlight-green {
      color: #22C55E;
    }

    .cheatsheet-subtitle {
      display: inline-block;
      background: #F3F4F6;
      padding: 6px 20px;
      border-radius: 20px;
      font-size: 18px;
      color: #6B7280;
      font-weight: 500;
    }

    .cheatsheet-table {
      flex: 1;
      display: flex;
      flex-direction: column;
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
    }

    .table-header {
      display: flex;
    }

    .table-header-cell {
      flex: 1;
      padding: 16px 12px;
      text-align: center;
      font-weight: 700;
      font-size: 18px;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .table-header-cell.label-col {
      flex: 0 0 140px;
      background: #374151;
    }

    .table-header-cell.col-blue { background: #3B82F6; }
    .table-header-cell.col-orange { background: #F97316; }
    .table-header-cell.col-green { background: #22C55E; }
    .table-header-cell.col-purple { background: #6366F1; }
    .table-header-cell.col-cyan { background: #06B6D4; }

    .table-header-cell svg {
      width: 20px;
      height: 20px;
    }

    .table-body {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .table-row {
      display: flex;
      border-bottom: 1px solid #E5E7EB;
    }

    .table-row:last-child {
      border-bottom: none;
    }

    .table-row:nth-child(even) {
      background: #F9FAFB;
    }

    .table-cell {
      flex: 1;
      padding: 12px;
      font-size: 14px;
      display: flex;
      align-items: center;
      border-right: 1px solid #E5E7EB;
    }

    .table-cell:last-child {
      border-right: none;
    }

    .table-cell.label-col {
      flex: 0 0 140px;
      font-weight: 600;
      color: #374151;
      background: #F9FAFB;
      font-size: 13px;
    }

    .table-cell code {
      font-family: 'Consolas', 'Monaco', monospace;
      font-size: 13px;
      color: #1F2937;
      word-break: break-word;
    }

    .table-cell .code-highlight {
      color: #059669;
    }

    .table-cell .code-string {
      color: #D97706;
    }

    .table-footer {
      display: flex;
      padding: 12px;
      gap: 12px;
      justify-content: center;
    }

    .footer-badge {
      padding: 8px 20px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      color: white;
    }

    .footer-badge.blue { background: #3B82F6; }
    .footer-badge.orange { background: #F97316; }
    .footer-badge.green { background: #22C55E; }
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
  </div>
</body>
</html>`;
}

/**
 * Build cheatsheet/table HTML
 * Perfect for comparison tables like "SQL vs Pandas vs PySpark"
 */
function buildCheatsheetHtml(data) {
  const { title, subtitle, columns = [], rows = [], footerLabels = [] } = data;

  // Build title with colored words
  let titleHtml = escapeHtml(title);
  columns.forEach((col, i) => {
    const colorClass = i === 0 ? 'highlight' : i === 1 ? 'highlight-orange' : 'highlight-green';
    titleHtml = titleHtml.replace(new RegExp(`\\b${escapeHtml(col.title)}\\b`, 'gi'),
      `<span class="${colorClass}">${escapeHtml(col.title)}</span>`);
  });

  // Header cells
  const headerCellsHtml = columns.map((col, i) => {
    const colorClass = `col-${col.color || COLOR_ORDER[i % COLOR_ORDER.length]}`;
    const iconHtml = col.icon ? getStyledIcon(col.icon, 'white', 'white') : '';
    return `<div class="table-header-cell ${colorClass}">${iconHtml}${escapeHtml(col.title)}</div>`;
  }).join('');

  // Data rows
  const rowsHtml = rows.map(row => {
    const cellsHtml = row.values.map(val => {
      // Format code with syntax highlighting
      let formatted = escapeHtml(val);
      // Highlight strings in quotes
      formatted = formatted.replace(/"([^"]*)"/g, '<span class="code-string">"$1"</span>');
      formatted = formatted.replace(/'([^']*)'/g, '<span class="code-string">\'$1\'</span>');
      return `<div class="table-cell"><code>${formatted}</code></div>`;
    }).join('');

    return `
      <div class="table-row">
        <div class="table-cell label-col">${escapeHtml(row.label)}</div>
        ${cellsHtml}
      </div>
    `;
  }).join('');

  // Footer badges
  const footerHtml = footerLabels.length > 0 ? `
    <div class="table-footer">
      ${footerLabels.map((label, i) => {
        const color = columns[i]?.color || COLOR_ORDER[i % COLOR_ORDER.length];
        return `<div class="footer-badge ${color}">${escapeHtml(label)}</div>`;
      }).join('')}
    </div>
  ` : '';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>${getBaseStyles()}</style>
</head>
<body>
  <div class="cheatsheet-container">
    <div class="cheatsheet-header">
      <h1 class="cheatsheet-title">${titleHtml}</h1>
      ${subtitle ? `<span class="cheatsheet-subtitle">${escapeHtml(subtitle)}</span>` : ''}
    </div>
    <div class="cheatsheet-table">
      <div class="table-header">
        <div class="table-header-cell label-col">Operation</div>
        ${headerCellsHtml}
      </div>
      <div class="table-body">
        ${rowsHtml}
      </div>
      ${footerHtml}
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
 * Generate a cheatsheet/table image
 */
async function generateCheatsheet(input) {
  const { title, subtitle, columns = [], rows = [], footerLabels = [] } = input;
  const html = buildCheatsheetHtml({ title, subtitle, columns, rows, footerLabels });
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
    imageColumns = [],
    imageRows = [],
    imageSubtitle = '',
    footerLabels = [],
    template: templateName
  } = input;

  const isLayered = templateName === 'layered' ||
    imageTitle.toLowerCase().includes('layer');

  if (imageType === 'cheatsheet') {
    const buffer = await generateCheatsheet({
      title: imageTitle,
      subtitle: imageSubtitle,
      columns: imageColumns,
      rows: imageRows,
      footerLabels
    });
    return { buffer, type: 'cheatsheet' };
  } else if (imageType === 'diagram') {
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
  generateCheatsheet,
  detectIcon,
  SECTION_COLORS,
  TOPIC_ICONS
};
