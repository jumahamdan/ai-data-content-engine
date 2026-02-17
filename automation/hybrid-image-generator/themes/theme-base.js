/**
 * Central theme definitions and factory.
 *
 * All theme configs live here to eliminate cross-file duplication.
 * Individual theme files (chalkboard.js, etc.) re-export from this module.
 */

const DEFAULT_CSS = {
  '--canvas-width': '1080px',
  '--canvas-height': '1080px',
  '--padding': '60px',
  '--content-width': '960px',
  '--font-size-hero': '56px',
  '--font-size-title': '32px',
  '--font-size-body': '20px',
  '--font-size-small': '16px',
  '--line-height-title': '1.2',
  '--line-height-body': '1.6',
  '--spacing-xs': '8px',
  '--spacing-sm': '16px',
  '--spacing-md': '24px',
  '--spacing-lg': '32px',
  '--spacing-xl': '48px',
  '--icon-size': '80px',
  '--icon-spacing': '20px',
  '--bullet-size': '24px',
  '--column-gap': '40px'
};

function createTheme(config) {
  const css = { ...DEFAULT_CSS, ...config.css };
  css['--title-color'] = css['--title-color'] || css['--text-primary'];
  css['--body-color'] = css['--body-color'] || css['--text-secondary'];
  css['--accent-color'] = css['--accent-color'] || css['--text-accent'];
  css['--bg-color'] = css['--bg-color'] || css['--bg-primary'];
  css['--title-font'] = css['--title-font'] || css['--font-title'];
  css['--body-font'] = css['--body-font'] || css['--font-body'];
  return { ...config, css };
}

// ── Theme definitions ────────────────────────────────────────────────

const chalkboard = createTheme({
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

const watercolor = createTheme({
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

const tech = createTheme({
  name: 'tech',
  background: {
    dallePrompt:
      'Dark gradient background with subtle circuit board pattern, deep blue to purple, futuristic, no text, 1024x1024',
    fallbackColor: '#1a1a2e'
  },
  typography: {
    titleFont: 'Inter, sans-serif',
    bodyFont: 'Inter, sans-serif',
    titleColor: '#ffffff',
    bodyColor: '#b8b8b8',
    accentColor: '#00d4aa'
  },
  illustrations: {
    style: 'isometric 3D tech icons, glowing edges, dark background',
    examples: ['database cylinder', 'cloud servers', 'neural network', 'API gateway', 'microservices architecture']
  },
  css: {
    '--bg-primary': '#1a1a2e',
    '--bg-secondary': '#16213e',
    '--bg-overlay': 'linear-gradient(135deg, rgba(26,26,46,0.9) 0%, rgba(46,16,78,0.9) 100%)',
    '--text-primary': '#ffffff',
    '--text-secondary': '#b8b8b8',
    '--text-accent': '#00d4aa',
    '--border-color': 'rgba(0,212,170,0.3)',
    '--font-title': 'Inter, sans-serif',
    '--font-body': 'Inter, sans-serif',
    '--font-size-hero': '54px',
    '--font-size-body': '19px',
    '--font-size-small': '15px',
    '--font-weight-title': '700',
    '--font-weight-body': '400',
    '--text-shadow': '0 0 20px rgba(0,212,170,0.5)',
    '--box-shadow': '0 8px 24px rgba(0,0,0,0.4)',
    '--glow-shadow': '0 0 20px rgba(0,212,170,0.6)',
    '--section-bg': 'rgba(255,255,255,0.03)',
    '--section-border': '1px solid rgba(0,212,170,0.3)',
    '--icon-size': '90px',
    '--bullet-color': '#00d4aa',
    '--bullet-size': '22px',
    '--pros-bg': 'rgba(0,212,170,0.08)',
    '--cons-bg': 'rgba(255,71,87,0.08)',
    '--pros-border': '#00d4aa',
    '--cons-border': '#ff4757',
    '--grid-color': 'rgba(0,212,170,0.1)',
    '--gradient-start': '#1a1a2e',
    '--gradient-end': '#2e104e'
  },
  colors: {
    primary: '#1a1a2e',
    secondary: '#16213e',
    accent: '#00d4aa',
    success: '#00d4aa',
    warning: '#ffa502',
    error: '#ff4757',
    textPrimary: '#ffffff',
    textSecondary: '#b8b8b8',
    neonPurple: '#a537fd',
    neonBlue: '#5f27cd'
  },
  recommendedLayouts: ['single', 'comparison', 'evolution'],
  googleFonts: ['Inter:wght@400;600;700']
});

const notebook = createTheme({
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
    '--title-color': '#2c2c2c',
    '--body-color': '#444444'
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

const whiteboard = createTheme({
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

const denseInfographic = createTheme({
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
    '--title-color': '#1a1a2e',
    '--body-color': '#2d3436'
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

module.exports = {
  createTheme,
  DEFAULT_CSS,
  chalkboard,
  watercolor,
  tech,
  notebook,
  whiteboard,
  denseInfographic
};
