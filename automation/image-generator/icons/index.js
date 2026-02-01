/**
 * SVG Icon Library for Data Engineering Infographics
 * All icons are 24x24 viewBox, can be scaled via CSS
 */

const icons = {
  // Data storage
  database: `<svg viewBox="0 0 24 24" fill="currentColor">
    <ellipse cx="12" cy="5" rx="9" ry="3"/>
    <path d="M21 12c0 1.66-4.03 3-9 3s-9-1.34-9-3"/>
    <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/>
  </svg>`,

  // Cloud services
  cloud: `<svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z"/>
  </svg>`,

  // Processing/compute
  gear: `<svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 15a3 3 0 100-6 3 3 0 000 6z"/>
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
  </svg>`,

  // Data flow / streaming
  flow: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
  </svg>`,

  // Layers / stacking
  layers: `<svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
    <path d="M2 17l10 5 10-5"/>
    <path d="M2 12l10 5 10-5"/>
  </svg>`,

  // Document / file
  document: `<svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
    <path d="M14 2v6h6"/>
    <path d="M16 13H8"/>
    <path d="M16 17H8"/>
    <path d="M10 9H8"/>
  </svg>`,

  // API / connections
  api: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <path d="M8 10h.01M12 10h.01M16 10h.01"/>
  </svg>`,

  // Network / connections
  network: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="12" cy="5" r="3"/>
    <circle cx="5" cy="19" r="3"/>
    <circle cx="19" cy="19" r="3"/>
    <path d="M12 8v4M8.5 14.5L5.5 16.5M15.5 14.5l3 2"/>
    <circle cx="12" cy="12" r="2"/>
  </svg>`,

  // Server
  server: `<svg viewBox="0 0 24 24" fill="currentColor">
    <rect x="2" y="2" width="20" height="8" rx="2"/>
    <rect x="2" y="14" width="20" height="8" rx="2"/>
    <path d="M6 6h.01M6 18h.01"/>
  </svg>`,

  // CPU / Processing
  cpu: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <rect x="4" y="4" width="16" height="16" rx="2"/>
    <rect x="9" y="9" width="6" height="6"/>
    <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3"/>
  </svg>`,

  // Lightning / speed
  lightning: `<svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
  </svg>`,

  // Chart / analytics
  chart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M18 20V10M12 20V4M6 20v-6"/>
  </svg>`,

  // Lock / security
  lock: `<svg viewBox="0 0 24 24" fill="currentColor">
    <rect x="3" y="11" width="18" height="11" rx="2"/>
    <path d="M7 11V7a5 5 0 0110 0v4"/>
  </svg>`,

  // Check / success
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M20 6L9 17l-5-5"/>
  </svg>`,

  // Arrow right
  arrowRight: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>`,

  // Arrow down
  arrowDown: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M12 5v14M5 12l7 7 7-7"/>
  </svg>`,

  // Brain / AI
  brain: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M12 2a5 5 0 015 5c0 1.1-.4 2.1-1 3 2.3.5 4 2.5 4 5a5 5 0 01-8 4V8a5 5 0 015-5"/>
    <path d="M12 2a5 5 0 00-5 5c0 1.1.4 2.1 1 3-2.3.5-4 2.5-4 5a5 5 0 008 4V8a5 5 0 00-5-5"/>
    <path d="M12 8v11"/>
  </svg>`,

  // Robot / automation
  robot: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <rect x="3" y="8" width="18" height="12" rx="2"/>
    <path d="M12 8V5M9 13h.01M15 13h.01"/>
    <path d="M10 17h4"/>
    <circle cx="12" cy="2" r="2"/>
  </svg>`,

  // Sparkles / magic
  sparkles: `<svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z"/>
  </svg>`,

  // Filter / transform
  filter: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/>
  </svg>`,

  // Warehouse
  warehouse: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M3 21V8l9-5 9 5v13"/>
    <path d="M9 21V12h6v9"/>
  </svg>`,

  // Lake / water (data lake)
  lake: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M2 12c1.5-2 3.5-2 5 0s3.5 2 5 0 3.5-2 5 0 3.5 2 5 0"/>
    <path d="M2 17c1.5-2 3.5-2 5 0s3.5 2 5 0 3.5-2 5 0 3.5 2 5 0"/>
    <path d="M2 7c1.5-2 3.5-2 5 0s3.5 2 5 0 3.5-2 5 0 3.5 2 5 0"/>
  </svg>`,

  // Mesh / interconnected
  mesh: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="6" cy="6" r="2"/>
    <circle cx="18" cy="6" r="2"/>
    <circle cx="6" cy="18" r="2"/>
    <circle cx="18" cy="18" r="2"/>
    <circle cx="12" cy="12" r="2"/>
    <path d="M6 8v8M18 8v8M8 6h8M8 18h8M8 8l2 2M14 8l-2 2M8 16l2-2M14 16l-2-2"/>
  </svg>`,

  // Bronze medal (medallion)
  bronze: `<svg viewBox="0 0 24 24" fill="#CD7F32">
    <circle cx="12" cy="12" r="10"/>
    <text x="12" y="16" text-anchor="middle" font-size="10" fill="white" font-weight="bold">B</text>
  </svg>`,

  // Silver medal
  silver: `<svg viewBox="0 0 24 24" fill="#C0C0C0">
    <circle cx="12" cy="12" r="10"/>
    <text x="12" y="16" text-anchor="middle" font-size="10" fill="white" font-weight="bold">S</text>
  </svg>`,

  // Gold medal
  gold: `<svg viewBox="0 0 24 24" fill="#FFD700">
    <circle cx="12" cy="12" r="10"/>
    <text x="12" y="16" text-anchor="middle" font-size="10" fill="white" font-weight="bold">G</text>
  </svg>`,

  // Question mark (interview)
  question: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="12" cy="12" r="10"/>
    <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/>
    <path d="M12 17h.01"/>
  </svg>`,

  // Lightbulb / idea
  lightbulb: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M9 18h6M10 22h4"/>
    <path d="M12 2a7 7 0 017 7c0 2.38-1.19 4.47-3 5.74V17a1 1 0 01-1 1h-6a1 1 0 01-1-1v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 017-7z"/>
  </svg>`,

  // Target / accuracy
  target: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="12" r="6"/>
    <circle cx="12" cy="12" r="2"/>
  </svg>`,

  // Wrench / optimization
  wrench: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
  </svg>`,

  // Refresh / sync
  refresh: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M23 4v6h-6M1 20v-6h6"/>
    <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
  </svg>`,

  // Zap / performance
  zap: `<svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
  </svg>`
};

// Color-coded icons for specific use cases
const coloredIcons = {
  bronzeLayer: (color = '#CD7F32') => `<svg viewBox="0 0 24 24" fill="${color}"><circle cx="12" cy="12" r="10"/><path fill="white" d="M8 8h8v2H10v2h4v2H10v2h6v2H8z"/></svg>`,
  silverLayer: (color = '#C0C0C0') => `<svg viewBox="0 0 24 24" fill="${color}"><circle cx="12" cy="12" r="10"/><path fill="white" d="M9 8h6v2h-4v2h3v2h-3v2h4v2H9z"/></svg>`,
  goldLayer: (color = '#FFD700') => `<svg viewBox="0 0 24 24" fill="${color}"><circle cx="12" cy="12" r="10"/><path fill="white" d="M9 8h6v2h-2v6h-2v-6H9z"/></svg>`
};

/**
 * Get an icon by name
 * @param {string} name - Icon name
 * @param {string} color - Optional color override
 * @returns {string} SVG string
 */
function getIcon(name, color = null) {
  const icon = icons[name];
  if (!icon) {
    console.warn(`Icon "${name}" not found, using default`);
    return icons.sparkles;
  }
  if (color) {
    return icon.replace(/currentColor/g, color);
  }
  return icon;
}

/**
 * Get icon with specific color styling
 * @param {string} name - Icon name
 * @param {string} fillColor - Fill color
 * @param {string} strokeColor - Stroke color (for outline icons)
 */
function getStyledIcon(name, fillColor = '#6366F1', strokeColor = '#6366F1') {
  let icon = icons[name] || icons.sparkles;
  icon = icon.replace(/fill="currentColor"/g, `fill="${fillColor}"`);
  icon = icon.replace(/stroke="currentColor"/g, `stroke="${strokeColor}"`);
  return icon;
}

module.exports = {
  icons,
  coloredIcons,
  getIcon,
  getStyledIcon
};
