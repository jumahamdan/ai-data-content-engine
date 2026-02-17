/**
 * Notebook Theme — Grid paper aesthetic with handwritten fonts and warm sketch colors.
 * Perfect for: Educational content, technical diagrams, sketch-style infographics.
 */
const { createTheme } = require('./theme-base');

module.exports = createTheme({
  name: 'notebook',

  background: {
    dallePrompt:
      'Cream-colored grid paper notebook page texture, light blue graph lines, slightly aged paper with subtle coffee stains, soft shadow at edges, no text no words no letters no numbers no writing no annotations, abstract paper texture only, 1024x1024',
    fallbackColor: '#f5f0e8'
  },

  typography: {
    titleFont: 'Caveat, cursive',
    bodyFont: 'Patrick Hand, cursive',
    titleColor: '#2c2c2c',
    bodyColor: '#444444',
    accentColor: '#3a7bd5'
  },

  illustrations: {
    style: 'hand-drawn sketch style, pencil lines on notebook paper, simple and clean',
    examples: ['data flow diagram', 'system architecture sketch', 'concept map', 'timeline', 'process flow']
  },

  css: {
    '--bg-primary': '#f5f0e8',
    '--bg-overlay': 'rgba(255,255,255,0.5)',
    '--text-primary': '#2c2c2c',
    '--text-secondary': '#444444',
    '--text-accent': '#3a7bd5',
    '--border-color': '#c0c0c0',
    '--font-title': 'Caveat, cursive',
    '--font-body': 'Patrick Hand, cursive',
    '--text-shadow': '1px 1px 2px rgba(0,0,0,0.1)',
    '--box-shadow': '0 2px 4px rgba(0,0,0,0.1)',
    '--section-bg': 'rgba(255,255,255,0.8)',
    '--section-border': '1px dashed #c0c0c0',
    '--bullet-color': '#3a7bd5',
    '--pros-bg': 'rgba(76, 175, 80, 0.08)',
    '--cons-bg': 'rgba(244, 67, 54, 0.08)',
    '--pros-border': '#4caf50',
    '--cons-border': '#f44336',
    // Legacy overrides that differ from auto-generated aliases
    '--title-color': '#2d2d2d',
    '--body-color': '#4a4a4a',
    '--body-font': 'Handlee, cursive'
  },

  colors: {
    primary: '#f5f0e8',
    secondary: '#e8dfd0',
    accent: '#3a7bd5',
    success: '#4caf50',
    warning: '#ff9800',
    error: '#f44336',
    textPrimary: '#2c2c2c',
    textSecondary: '#444444'
  },

  recommendedLayouts: ['notebook'],
  googleFonts: ['Caveat:wght@400;700', 'Patrick+Hand']
});
