/**
 * Chalkboard Theme — Dark educational theme with hand-drawn chalk illustrations.
 * Perfect for: Educational content, feature comparisons, technical concepts.
 */
const { createTheme } = require('./theme-base');

module.exports = createTheme({
  name: 'chalkboard',

  background: {
    dallePrompt:
      'Dark green chalkboard texture background, slightly dusty, soft lighting from top, no text or drawings, photorealistic, 1024x1024',
    fallbackColor: '#2d4a3e'
  },

  typography: {
    titleFont: 'Permanent Marker, cursive',
    bodyFont: 'Patrick Hand, cursive',
    titleColor: '#ffffff',
    bodyColor: '#e8e8e8',
    accentColor: '#f4d03f'
  },

  illustrations: {
    style: 'hand-drawn chalk sketch style, white lines on transparent',
    examples: ['café storefront', 'data pipeline arrows', 'people icons', 'building sketch', 'server rack drawing']
  },

  css: {
    '--bg-primary': '#2d4a3e',
    '--bg-overlay': 'rgba(0,0,0,0.3)',
    '--text-primary': '#ffffff',
    '--text-secondary': '#e8e8e8',
    '--text-accent': '#f4d03f',
    '--border-color': 'rgba(255,255,255,0.2)',
    '--font-title': 'Permanent Marker, cursive',
    '--font-body': 'Patrick Hand, cursive',
    '--text-shadow': '2px 2px 4px rgba(0,0,0,0.5)',
    '--box-shadow': '0 4px 6px rgba(0,0,0,0.3)',
    '--section-bg': 'rgba(255,255,255,0.05)',
    '--section-border': '2px solid rgba(255,255,255,0.2)',
    '--bullet-color': '#f4d03f',
    '--pros-bg': 'rgba(76, 175, 80, 0.1)',
    '--cons-bg': 'rgba(244, 67, 54, 0.1)',
    '--pros-border': '#4caf50',
    '--cons-border': '#f44336'
  },

  colors: {
    primary: '#2d4a3e',
    secondary: '#1a2e25',
    accent: '#f4d03f',
    success: '#4caf50',
    warning: '#ff9800',
    error: '#f44336',
    textPrimary: '#ffffff',
    textSecondary: '#e8e8e8'
  },

  recommendedLayouts: ['comparison', 'single'],
  googleFonts: ['Permanent+Marker', 'Patrick+Hand']
});
