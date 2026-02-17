/**
 * Whiteboard Theme — Clean white aesthetic with bordered sections and professional fonts.
 * Perfect for: Comparisons, side-by-side analysis, corporate presentations.
 */
const { createTheme } = require('./theme-base');

module.exports = createTheme({
  name: 'whiteboard',

  background: {
    dallePrompt:
      'Clean white dry-erase whiteboard surface texture, very subtle gray smudge marks from previous erasing, slight glossy reflection, whiteboard markers tray shadow at bottom edge, no text no words no letters no writing no annotations, abstract surface texture only, 1024x1024',
    fallbackColor: '#f8f8f8'
  },

  typography: {
    titleFont: 'Nunito, sans-serif',
    bodyFont: 'Open Sans, sans-serif',
    titleColor: '#1a1a1a',
    bodyColor: '#333333',
    accentColor: '#e67e22'
  },

  illustrations: {
    style: 'clean whiteboard marker drawing style, bold lines, simple and professional',
    examples: ['comparison chart', 'venn diagram', 'process flow', 'organizational chart', 'mind map']
  },

  css: {
    '--bg-primary': '#f8f8f8',
    '--bg-overlay': 'rgba(0,0,0,0.02)',
    '--text-primary': '#1a1a1a',
    '--text-secondary': '#333333',
    '--text-accent': '#e67e22',
    '--border-color': '#333333',
    '--font-title': 'Nunito, sans-serif',
    '--font-body': 'Open Sans, sans-serif',
    '--text-shadow': 'none',
    '--box-shadow': '0 2px 8px rgba(0,0,0,0.1)',
    '--section-bg': 'rgba(255,255,255,0.95)',
    '--section-border': '2px solid #333333',
    '--bullet-color': '#e67e22',
    '--pros-bg': 'rgba(41, 128, 185, 0.05)',
    '--cons-bg': 'rgba(230, 126, 34, 0.05)',
    '--pros-border': '#2980b9',
    '--cons-border': '#e67e22'
  },

  colors: {
    primary: '#f8f8f8',
    secondary: '#e8e8e8',
    accent: '#e67e22',
    success: '#2980b9',
    warning: '#f39c12',
    error: '#c0392b',
    textPrimary: '#1a1a1a',
    textSecondary: '#333333'
  },

  recommendedLayouts: ['whiteboard'],
  googleFonts: ['Nunito:wght@400;600;700', 'Open+Sans:wght@400;600']
});
