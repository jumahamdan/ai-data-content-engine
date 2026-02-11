/**
 * Tech Theme Configuration
 *
 * Dark futuristic theme with glowing tech illustrations
 * Perfect for: Cloud architecture, AI/ML topics, system design, modern tech stacks
 */

const techTheme = {
  /**
   * Theme identifier
   */
  name: 'tech',

  /**
   * Background configuration for DALL-E generation
   */
  background: {
    /**
     * DALL-E prompt for generating theme background
     * Size: 1024x1024, standard quality
     */
    dallePrompt:
      'Dark gradient background with subtle circuit board pattern, deep blue to purple, futuristic, no text, 1024x1024',

    /**
     * Fallback color if DALL-E generation fails
     */
    fallbackColor: '#1a1a2e'
  },

  /**
   * Typography configuration
   */
  typography: {
    /**
     * Font family for main titles
     * Fallback: sans-serif
     */
    titleFont: 'Inter, sans-serif',

    /**
     * Font family for body text and lists
     * Fallback: sans-serif
     */
    bodyFont: 'Inter, sans-serif',

    /**
     * Main title color (bright white)
     */
    titleColor: '#ffffff',

    /**
     * Body text color (light gray)
     */
    bodyColor: '#b8b8b8',

    /**
     * Accent color for highlights and emphasis (neon teal)
     */
    accentColor: '#00d4aa'
  },

  /**
   * Illustration style for DALL-E element generation
   */
  illustrations: {
    /**
     * Style description to append to illustration prompts
     */
    style: 'isometric 3D tech icons, glowing edges, dark background',

    /**
     * Example subjects that work well with this theme
     */
    examples: ['database cylinder', 'cloud servers', 'neural network', 'API gateway', 'microservices architecture']
  },

  /**
   * CSS variables for Puppeteer template rendering
   * These are injected into the HTML template as CSS custom properties
   */
  css: {
    // Layout & Structure
    '--canvas-width': '1080px',
    '--canvas-height': '1080px',
    '--padding': '60px',
    '--content-width': '960px', // 1080 - (60 * 2)

    // Colors
    '--bg-primary': '#1a1a2e', // Deep dark blue
    '--bg-secondary': '#16213e', // Slightly lighter dark blue
    '--bg-overlay': 'linear-gradient(135deg, rgba(26,26,46,0.9) 0%, rgba(46,16,78,0.9) 100%)', // Purple gradient overlay
    '--text-primary': '#ffffff', // Bright white
    '--text-secondary': '#b8b8b8', // Light gray
    '--text-accent': '#00d4aa', // Neon teal
    '--border-color': 'rgba(0,212,170,0.3)', // Glowing teal border

    // Typography
    '--font-title': 'Inter, sans-serif',
    '--font-body': 'Inter, sans-serif',
    '--font-size-hero': '54px', // Main title
    '--font-size-title': '32px', // Section titles
    '--font-size-body': '19px', // Body text
    '--font-size-small': '15px', // Captions, metadata
    '--line-height-title': '1.2',
    '--line-height-body': '1.6',
    '--font-weight-title': '700',
    '--font-weight-body': '400',

    // Spacing
    '--spacing-xs': '8px',
    '--spacing-sm': '16px',
    '--spacing-md': '24px',
    '--spacing-lg': '32px',
    '--spacing-xl': '48px',

    // Shadows & Effects
    '--text-shadow': '0 0 20px rgba(0,212,170,0.5)', // Neon glow on titles
    '--box-shadow': '0 8px 24px rgba(0,0,0,0.4)',
    '--glow-shadow': '0 0 20px rgba(0,212,170,0.6)', // Strong glow effect

    // Component-specific
    '--section-bg': 'rgba(255,255,255,0.03)', // Very subtle light sections
    '--section-border': '1px solid rgba(0,212,170,0.3)',
    '--icon-size': '90px',
    '--icon-spacing': '20px',

    // List styles
    '--bullet-color': '#00d4aa', // Neon teal bullets
    '--bullet-size': '22px',

    // Comparison layout
    '--column-gap': '40px',
    '--pros-bg': 'rgba(0,212,170,0.08)', // Subtle teal tint
    '--cons-bg': 'rgba(255,71,87,0.08)', // Subtle red tint
    '--pros-border': '#00d4aa',
    '--cons-border': '#ff4757',

    // Tech-specific effects
    '--grid-color': 'rgba(0,212,170,0.1)', // Circuit board grid
    '--gradient-start': '#1a1a2e',
    '--gradient-end': '#2e104e'
  },

  /**
   * Color palette for themed elements
   * Used by compositor for dynamic styling
   */
  colors: {
    primary: '#1a1a2e', // Deep dark blue
    secondary: '#16213e', // Dark blue
    accent: '#00d4aa', // Neon teal
    success: '#00d4aa', // Teal for pros/success
    warning: '#ffa502', // Bright orange for warnings
    error: '#ff4757', // Neon red for cons/errors
    textPrimary: '#ffffff', // Bright white
    textSecondary: '#b8b8b8', // Light gray
    neonPurple: '#a537fd', // Optional neon purple accent
    neonBlue: '#5f27cd' // Optional neon blue accent
  },

  /**
   * Layout preferences for this theme
   * Hints for the compositor about which layouts work best
   */
  recommendedLayouts: [
    'single', // Great for deep technical dives
    'comparison', // Side-by-side tech comparisons
    'evolution' // Technology evolution flows
  ],

  /**
   * Google Fonts to load in templates
   */
  googleFonts: ['Inter:wght@400;600;700']
};

module.exports = techTheme;
