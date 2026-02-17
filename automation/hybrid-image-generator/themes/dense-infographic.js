/**
 * Dense Infographic Theme — Packed multi-section aesthetic with color-coded categories.
 * Perfect for: Technical references, data concept cards, category breakdowns.
 */
const { createTheme } = require('./theme-base');

module.exports = createTheme({
  name: 'dense-infographic',

  background: {
    dallePrompt:
      'Light warm beige parchment paper texture with very subtle noise grain, slightly aged look, soft vignette at corners, no text no words no letters no writing no annotations, abstract paper texture only, 1024x1024',
    fallbackColor: '#faf6ef'
  },

  typography: {
    titleFont: 'Roboto Slab, serif',
    bodyFont: 'Roboto, sans-serif',
    titleColor: '#1a1a2e',
    bodyColor: '#2d3436',
    accentColor: '#e17055'
  },

  illustrations: {
    style: 'clean infographic icon style, flat design, color-coded categories',
    examples: ['category icons', 'data type symbols', 'platform logos', 'concept badges', 'status indicators']
  },

  css: {
    '--padding': '40px',
    '--content-width': '1000px',
    '--bg-primary': '#faf6ef',
    '--bg-overlay': 'rgba(0,0,0,0.03)',
    '--text-primary': '#1a1a2e',
    '--text-secondary': '#2d3436',
    '--text-accent': '#e17055',
    '--border-color': '#d4d4d4',
    '--font-title': 'Roboto Slab, serif',
    '--font-body': 'Roboto, sans-serif',
    '--font-size-hero': '44px',
    '--font-size-title': '22px',
    '--font-size-body': '15px',
    '--font-size-small': '12px',
    '--line-height-body': '1.5',
    '--spacing-xs': '6px',
    '--spacing-sm': '12px',
    '--spacing-md': '18px',
    '--spacing-lg': '24px',
    '--spacing-xl': '36px',
    '--text-shadow': 'none',
    '--box-shadow': '0 1px 3px rgba(0,0,0,0.12)',
    '--section-bg': 'rgba(255,255,255,0.7)',
    '--section-border': '1px solid #d4d4d4',
    '--icon-size': '60px',
    '--icon-spacing': '15px',
    '--bullet-color': '#e17055',
    '--bullet-size': '20px',
    '--column-gap': '30px',
    '--pros-bg': 'rgba(39, 174, 96, 0.1)',
    '--cons-bg': 'rgba(231, 76, 60, 0.1)',
    '--pros-border': '#27ae60',
    '--cons-border': '#e74c3c',
    // Legacy overrides that differ from auto-generated aliases
    '--title-color': '#2d3436',
    '--body-color': '#5d6166',
    '--title-font': 'Poppins, sans-serif'
  },

  colors: {
    primary: '#faf6ef',
    secondary: '#f0ebe3',
    accent: '#e17055',
    success: '#27ae60',
    warning: '#f39c12',
    error: '#e74c3c',
    textPrimary: '#1a1a2e',
    textSecondary: '#2d3436',
    categoryBlue: '#2980b9',
    categoryPurple: '#8e44ad',
    categoryGreen: '#27ae60',
    categoryGold: '#f39c12'
  },

  recommendedLayouts: ['dense-infographic'],
  googleFonts: ['Roboto+Slab:wght@400;700', 'Roboto:wght@400;500;700']
});
