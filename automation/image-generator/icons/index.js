/**
 * SVG Icon Library for Data Engineering Infographics
 * All icons are 24x24 viewBox
 */

const icons = {
  database: `<svg viewBox="0 0 24 24" fill="{fill}" stroke="{stroke}" stroke-width="1.5">
    <ellipse cx="12" cy="5" rx="9" ry="3"/>
    <path d="M21 12c0 1.66-4.03 3-9 3s-9-1.34-9-3" fill="none"/>
    <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" fill="none"/>
  </svg>`,

  cloud: `<svg viewBox="0 0 24 24" fill="{fill}" stroke="{stroke}" stroke-width="1.5">
    <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z" fill="none"/>
  </svg>`,

  gear: `<svg viewBox="0 0 24 24" fill="none" stroke="{stroke}" stroke-width="1.5">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
  </svg>`,

  flow: `<svg viewBox="0 0 24 24" fill="none" stroke="{stroke}" stroke-width="2">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
  </svg>`,

  layers: `<svg viewBox="0 0 24 24" fill="none" stroke="{stroke}" stroke-width="2">
    <polygon points="12 2 2 7 12 12 22 7 12 2"/>
    <polyline points="2 17 12 22 22 17"/>
    <polyline points="2 12 12 17 22 12"/>
  </svg>`,

  document: `<svg viewBox="0 0 24 24" fill="none" stroke="{stroke}" stroke-width="1.5">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <line x1="10" y1="9" x2="8" y2="9"/>
  </svg>`,

  api: `<svg viewBox="0 0 24 24" fill="none" stroke="{stroke}" stroke-width="1.5">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <circle cx="8" cy="10" r="1" fill="{stroke}"/>
    <circle cx="12" cy="10" r="1" fill="{stroke}"/>
    <circle cx="16" cy="10" r="1" fill="{stroke}"/>
    <line x1="6" y1="14" x2="18" y2="14"/>
  </svg>`,

  network: `<svg viewBox="0 0 24 24" fill="none" stroke="{stroke}" stroke-width="1.5">
    <circle cx="12" cy="5" r="3"/>
    <circle cx="5" cy="19" r="3"/>
    <circle cx="19" cy="19" r="3"/>
    <line x1="12" y1="8" x2="5" y2="16"/>
    <line x1="12" y1="8" x2="19" y2="16"/>
  </svg>`,

  server: `<svg viewBox="0 0 24 24" fill="none" stroke="{stroke}" stroke-width="1.5">
    <rect x="2" y="2" width="20" height="8" rx="2"/>
    <rect x="2" y="14" width="20" height="8" rx="2"/>
    <circle cx="6" cy="6" r="1" fill="{stroke}"/>
    <circle cx="6" cy="18" r="1" fill="{stroke}"/>
  </svg>`,

  cpu: `<svg viewBox="0 0 24 24" fill="none" stroke="{stroke}" stroke-width="1.5">
    <rect x="4" y="4" width="16" height="16" rx="2"/>
    <rect x="9" y="9" width="6" height="6"/>
    <line x1="9" y1="1" x2="9" y2="4"/>
    <line x1="15" y1="1" x2="15" y2="4"/>
    <line x1="9" y1="20" x2="9" y2="23"/>
    <line x1="15" y1="20" x2="15" y2="23"/>
    <line x1="20" y1="9" x2="23" y2="9"/>
    <line x1="20" y1="14" x2="23" y2="14"/>
    <line x1="1" y1="9" x2="4" y2="9"/>
    <line x1="1" y1="14" x2="4" y2="14"/>
  </svg>`,

  lightning: `<svg viewBox="0 0 24 24" fill="{fill}" stroke="{stroke}" stroke-width="1">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>`,

  chart: `<svg viewBox="0 0 24 24" fill="none" stroke="{stroke}" stroke-width="2">
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/>
  </svg>`,

  lock: `<svg viewBox="0 0 24 24" fill="none" stroke="{stroke}" stroke-width="1.5">
    <rect x="3" y="11" width="18" height="11" rx="2"/>
    <path d="M7 11V7a5 5 0 0110 0v4"/>
  </svg>`,

  check: `<svg viewBox="0 0 24 24" fill="none" stroke="{stroke}" stroke-width="2.5">
    <polyline points="20 6 9 17 4 12"/>
  </svg>`,

  arrowRight: `<svg viewBox="0 0 24 24" fill="none" stroke="{stroke}" stroke-width="2">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>`,

  arrowDown: `<svg viewBox="0 0 24 24" fill="none" stroke="{stroke}" stroke-width="2">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <polyline points="19 12 12 19 5 12"/>
  </svg>`,

  brain: `<svg viewBox="0 0 24 24" fill="none" stroke="{stroke}" stroke-width="1.5">
    <path d="M12 4.5a2.5 2.5 0 00-4.96-.46 2.5 2.5 0 00-1.98 3 2.5 2.5 0 00-1.32 4.24 2.5 2.5 0 00.34 3.58 2.5 2.5 0 001.96 3.18A2.5 2.5 0 0012 19.5"/>
    <path d="M12 4.5a2.5 2.5 0 014.96-.46 2.5 2.5 0 011.98 3 2.5 2.5 0 011.32 4.24 2.5 2.5 0 01-.34 3.58 2.5 2.5 0 01-1.96 3.18A2.5 2.5 0 0112 19.5"/>
    <line x1="12" y1="4.5" x2="12" y2="19.5"/>
  </svg>`,

  robot: `<svg viewBox="0 0 24 24" fill="none" stroke="{stroke}" stroke-width="1.5">
    <rect x="3" y="8" width="18" height="12" rx="2"/>
    <line x1="12" y1="8" x2="12" y2="4"/>
    <circle cx="12" cy="2" r="2"/>
    <circle cx="9" cy="13" r="1" fill="{stroke}"/>
    <circle cx="15" cy="13" r="1" fill="{stroke}"/>
    <line x1="9" y1="17" x2="15" y2="17"/>
  </svg>`,

  sparkles: `<svg viewBox="0 0 24 24" fill="{fill}" stroke="{stroke}" stroke-width="1">
    <path d="M12 2l2 7h7l-5.5 4 2 7-5.5-4-5.5 4 2-7L3 9h7l2-7z"/>
  </svg>`,

  filter: `<svg viewBox="0 0 24 24" fill="none" stroke="{stroke}" stroke-width="2">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
  </svg>`,

  warehouse: `<svg viewBox="0 0 24 24" fill="none" stroke="{stroke}" stroke-width="1.5">
    <path d="M3 21V8l9-5 9 5v13"/>
    <rect x="9" y="13" width="6" height="8"/>
    <line x1="3" y1="21" x2="21" y2="21"/>
  </svg>`,

  lake: `<svg viewBox="0 0 24 24" fill="none" stroke="{stroke}" stroke-width="2">
    <path d="M2 12c1.5-2 3.5-2 5 0s3.5 2 5 0 3.5-2 5 0 3.5 2 5 0"/>
    <path d="M2 17c1.5-2 3.5-2 5 0s3.5 2 5 0 3.5-2 5 0 3.5 2 5 0"/>
    <path d="M2 7c1.5-2 3.5-2 5 0s3.5 2 5 0 3.5-2 5 0 3.5 2 5 0"/>
  </svg>`,

  mesh: `<svg viewBox="0 0 24 24" fill="none" stroke="{stroke}" stroke-width="1.5">
    <circle cx="6" cy="6" r="2"/>
    <circle cx="18" cy="6" r="2"/>
    <circle cx="6" cy="18" r="2"/>
    <circle cx="18" cy="18" r="2"/>
    <circle cx="12" cy="12" r="2"/>
    <line x1="6" y1="8" x2="6" y2="16"/>
    <line x1="18" y1="8" x2="18" y2="16"/>
    <line x1="8" y1="6" x2="16" y2="6"/>
    <line x1="8" y1="18" x2="16" y2="18"/>
    <line x1="8" y1="8" x2="10" y2="10"/>
    <line x1="14" y1="10" x2="16" y2="8"/>
    <line x1="8" y1="16" x2="10" y2="14"/>
    <line x1="14" y1="14" x2="16" y2="16"/>
  </svg>`,

  question: `<svg viewBox="0 0 24 24" fill="none" stroke="{stroke}" stroke-width="2">
    <circle cx="12" cy="12" r="10"/>
    <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/>
    <circle cx="12" cy="17" r="0.5" fill="{stroke}"/>
  </svg>`,

  lightbulb: `<svg viewBox="0 0 24 24" fill="none" stroke="{stroke}" stroke-width="1.5">
    <path d="M9 18h6M10 22h4"/>
    <path d="M12 2a7 7 0 017 7c0 2.38-1.19 4.47-3 5.74V17a1 1 0 01-1 1h-6a1 1 0 01-1-1v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 017-7z"/>
  </svg>`,

  target: `<svg viewBox="0 0 24 24" fill="none" stroke="{stroke}" stroke-width="2">
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="12" r="6"/>
    <circle cx="12" cy="12" r="2"/>
  </svg>`,

  wrench: `<svg viewBox="0 0 24 24" fill="none" stroke="{stroke}" stroke-width="2">
    <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
  </svg>`,

  refresh: `<svg viewBox="0 0 24 24" fill="none" stroke="{stroke}" stroke-width="2">
    <polyline points="23 4 23 10 17 10"/>
    <polyline points="1 20 1 14 7 14"/>
    <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
  </svg>`,

  zap: `<svg viewBox="0 0 24 24" fill="{fill}" stroke="{stroke}" stroke-width="1">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>`
};

/**
 * Get icon with colors applied
 * @param {string} name - Icon name
 * @param {string} fillColor - Fill color (default: none/transparent)
 * @param {string} strokeColor - Stroke color
 * @returns {string} SVG string with colors
 */
function getStyledIcon(name, fillColor = 'none', strokeColor = '#6366F1') {
  let icon = icons[name] || icons.sparkles;
  icon = icon.replace(/\{fill\}/g, fillColor);
  icon = icon.replace(/\{stroke\}/g, strokeColor);
  return icon;
}

/**
 * Get icon with default styling
 */
function getIcon(name) {
  return getStyledIcon(name, 'none', '#6366F1');
}

module.exports = {
  icons,
  getIcon,
  getStyledIcon
};
