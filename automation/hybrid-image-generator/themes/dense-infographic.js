/**
 * Dense Infographic Theme Configuration
 *
 * Packed multi-section aesthetic with color-coded categories
 * Perfect for: Technical references, data concept cards, category breakdowns
 */

const denseInfographicTheme = {
  /**
   * Theme identifier
   */
  name: 'dense-infographic',

  /**
   * Background configuration for Gemini generation
   */
  background: {
    /**
     * Gemini prompt for generating theme background
     * Size: 1024x1024
     * CRITICAL: No text/words/letters allowed - purely abstract texture
     */
    dallePrompt:
      'Light warm beige parchment paper texture with very subtle noise grain, slightly aged look, soft vignette at corners, no text no words no letters no writing no annotations, abstract paper texture only, 1024x1024',

    /**
     * Fallback color if generation fails
     */
    fallbackColor: '#faf6ef'
  },

  /**
   * Typography configuration
   */
  typography: {
    /**
     * Font family for main titles
     * Authoritative slab serif
     */
    titleFont: 'Roboto Slab, serif',

    /**
     * Font family for body text and lists
     * Dense readable sans-serif
     */
    bodyFont: 'Roboto, sans-serif',

    /**
     * Main title color (very dark navy)
     */
    titleColor: '#1a1a2e',

    /**
     * Body text color (dark gray)
     */
    bodyColor: '#2d3436',

    /**
     * Accent color for highlights and emphasis (warm orange)
     */
    accentColor: '#e17055'
  },

  /**
   * Illustration style for element generation
   */
  illustrations: {
    /**
     * Style description to append to illustration prompts
     */
    style: 'clean infographic icon style, flat design, color-coded categories',

    /**
     * Example subjects that work well with this theme
     */
    examples: ['category icons', 'data type symbols', 'platform logos', 'concept badges', 'status indicators']
  },

  /**
   * CSS variables for Puppeteer template rendering
   * These are injected into the HTML template as CSS custom properties
   */
  css: {
    // Layout & Structure
    '--canvas-width': '1080px',
    '--canvas-height': '1080px',
    '--padding': '40px', // Tighter padding for dense content
    '--content-width': '1000px', // 1080 - (40 * 2)

    // Colors
    '--bg-primary': '#faf6ef', // Warm parchment
    '--bg-overlay': 'rgba(0,0,0,0.03)', // Subtle overlay
    '--text-primary': '#1a1a2e', // Very dark navy
    '--text-secondary': '#2d3436', // Dark gray
    '--text-accent': '#e17055', // Warm orange
    '--border-color': '#d4d4d4', // Light gray borders

    // Typography
    '--font-title': 'Roboto Slab, serif',
    '--font-body': 'Roboto, sans-serif',
    '--font-size-hero': '44px', // Smaller main title for dense layout
    '--font-size-title': '22px', // Smaller section titles
    '--font-size-body': '15px', // Smaller body text
    '--font-size-small': '12px', // Smaller captions
    '--line-height-title': '1.2',
    '--line-height-body': '1.5', // Tighter line height

    // Spacing
    '--spacing-xs': '6px',
    '--spacing-sm': '12px',
    '--spacing-md': '18px',
    '--spacing-lg': '24px',
    '--spacing-xl': '36px',

    // Shadows & Effects
    '--text-shadow': 'none',
    '--box-shadow': '0 1px 3px rgba(0,0,0,0.12)',

    // Component-specific
    '--section-bg': 'rgba(255,255,255,0.7)', // Light sections
    '--section-border': '1px solid #d4d4d4',
    '--icon-size': '60px', // Smaller icons for density
    '--icon-spacing': '15px',

    // List styles
    '--bullet-color': '#e17055', // Orange bullets
    '--bullet-size': '20px',

    // Comparison layout
    '--column-gap': '30px',
    '--pros-bg': 'rgba(39, 174, 96, 0.1)', // Green tint
    '--cons-bg': 'rgba(231, 76, 60, 0.1)', // Red tint
    '--pros-border': '#27ae60',
    '--cons-border': '#e74c3c'
  },

  /**
   * Color palette for themed elements
   * Used by compositor for dynamic styling
   */
  colors: {
    primary: '#faf6ef', // Warm parchment
    secondary: '#f0ebe3', // Darker parchment
    accent: '#e17055', // Warm orange
    success: '#27ae60', // Green category
    warning: '#f39c12', // Gold category
    error: '#e74c3c', // Red category
    textPrimary: '#1a1a2e', // Very dark navy
    textSecondary: '#2d3436', // Dark gray
    // Additional category colors
    categoryBlue: '#2980b9',
    categoryPurple: '#8e44ad',
    categoryGreen: '#27ae60',
    categoryGold: '#f39c12'
  },

  /**
   * Layout preferences for this theme
   * Hints for the compositor about which layouts work best
   */
  recommendedLayouts: ['dense-infographic'],

  /**
   * Google Fonts to load in templates
   */
  googleFonts: ['Roboto+Slab:wght@400;700', 'Roboto:wght@400;500;700']
};

module.exports = denseInfographicTheme;
