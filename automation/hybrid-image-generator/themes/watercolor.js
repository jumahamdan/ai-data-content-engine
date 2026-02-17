/**
 * Watercolor Theme — Light, elegant theme with soft watercolor illustrations.
 * Perfect for: Professional storytelling, evolution flows, architectural comparisons.
 */
const { createTheme } = require('./theme-base');

module.exports = createTheme({
  name: 'watercolor',

  background: {
    dallePrompt:
      'Light cream paper texture background, subtle watercolor wash edges, soft warm lighting, no text, minimal, 1024x1024',
    fallbackColor: '#faf8f5'
  },

  typography: {
    titleFont: 'Playfair Display, serif',
    bodyFont: 'Open Sans, sans-serif',
    titleColor: '#2c3e50',
    bodyColor: '#34495e',
    accentColor: '#3498db'
  },

  illustrations: {
    style: 'soft watercolor illustration, pastel colors, architectural',
    examples: ['warehouse building', 'lake with data', 'modern office', 'cloud infrastructure', 'data pipeline flow']
  },

  css: {
    '--bg-primary': '#faf8f5',
    '--bg-overlay': 'rgba(243,239,233,0.8)',
    '--text-primary': '#2c3e50',
    '--text-secondary': '#34495e',
    '--text-accent': '#3498db',
    '--border-color': 'rgba(52,73,94,0.15)',
    '--font-title': 'Playfair Display, serif',
    '--font-body': 'Open Sans, sans-serif',
    '--font-size-hero': '52px',
    '--font-size-title': '30px',
    '--font-size-body': '18px',
    '--font-size-small': '14px',
    '--line-height-title': '1.3',
    '--line-height-body': '1.7',
    '--text-shadow': 'none',
    '--box-shadow': '0 2px 8px rgba(0,0,0,0.08)',
    '--section-bg': 'rgba(255,255,255,0.6)',
    '--section-border': '1px solid rgba(52,73,94,0.15)',
    '--icon-size': '100px',
    '--icon-spacing': '24px',
    '--bullet-color': '#3498db',
    '--bullet-size': '20px',
    '--column-gap': '48px',
    '--pros-bg': 'rgba(46,204,113,0.08)',
    '--cons-bg': 'rgba(231,76,60,0.08)',
    '--pros-border': '#2ecc71',
    '--cons-border': '#e74c3c',
    // Legacy overrides that differ from auto-generated aliases
    '--title-color': '#34495e',
    '--body-color': '#5d6d7e',
    '--body-font': 'Lora, serif'
  },

  colors: {
    primary: '#faf8f5',
    secondary: '#f3efe9',
    accent: '#3498db',
    success: '#2ecc71',
    warning: '#f39c12',
    error: '#e74c3c',
    textPrimary: '#2c3e50',
    textSecondary: '#34495e'
  },

  recommendedLayouts: ['evolution', 'comparison', 'single'],
  googleFonts: ['Playfair+Display:wght@400;700', 'Open+Sans:wght@400;600']
});
