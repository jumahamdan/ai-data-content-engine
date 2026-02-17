/**
 * Tech Theme — Dark futuristic theme with glowing tech illustrations.
 * Perfect for: Cloud architecture, AI/ML topics, system design, modern tech stacks.
 */
const { createTheme } = require('./theme-base');

module.exports = createTheme({
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
    // Tech-specific effects
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
