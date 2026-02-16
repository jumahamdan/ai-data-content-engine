/**
 * Chalkboard Theme Configuration
 *
 * Dark educational theme with hand-drawn chalk illustrations
 * Perfect for: Educational content, feature comparisons, technical concepts
 */

const chalkboardTheme = {
  /**
   * Theme identifier
   */
  name: 'chalkboard',

  /**
   * Background configuration for DALL-E generation
   */
  background: {
    /**
     * DALL-E prompt for generating theme background
     * Size: 1024x1024, standard quality
     */
    dallePrompt:
      'Dark green chalkboard texture background, slightly dusty, soft lighting from top, no text or drawings, photorealistic, 1024x1024',

    /**
     * Fallback color if DALL-E generation fails
     */
    fallbackColor: '#2d4a3e'
  },

  /**
   * Typography configuration
   */
  typography: {
    /**
     * Font family for main titles
     * Fallback: cursive
     */
    titleFont: 'Permanent Marker, cursive',

    /**
     * Font family for body text and lists
     * Fallback: cursive
     */
    bodyFont: 'Patrick Hand, cursive',

    /**
     * Main title color (white chalk)
     */
    titleColor: '#ffffff',

    /**
     * Body text color (light gray chalk)
     */
    bodyColor: '#e8e8e8',

    /**
     * Accent color for highlights and emphasis (yellow chalk)
     */
    accentColor: '#f4d03f'
  },

  /**
   * Illustration style for DALL-E element generation
   */
  illustrations: {
    /**
     * Style description to append to illustration prompts
     */
    style: 'hand-drawn chalk sketch style, white lines on transparent',

    /**
     * Example subjects that work well with this theme
     */
    examples: ['café storefront', 'data pipeline arrows', 'people icons', 'building sketch', 'server rack drawing']
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
    '--bg-primary': '#2d4a3e', // Dark green chalkboard
    '--bg-overlay': 'rgba(0,0,0,0.3)', // Subtle overlay for depth
    '--text-primary': '#ffffff', // White chalk
    '--text-secondary': '#e8e8e8', // Light gray chalk
    '--text-accent': '#f4d03f', // Yellow chalk highlight
    '--border-color': 'rgba(255,255,255,0.2)', // Subtle white borders

    // Typography
    '--font-title': 'Permanent Marker, cursive',
    '--font-body': 'Patrick Hand, cursive',
    '--font-size-hero': '56px', // Main title
    '--font-size-title': '32px', // Section titles
    '--font-size-body': '20px', // Body text
    '--font-size-small': '16px', // Captions, metadata
    '--line-height-title': '1.2',
    '--line-height-body': '1.6',

    // Spacing
    '--spacing-xs': '8px',
    '--spacing-sm': '16px',
    '--spacing-md': '24px',
    '--spacing-lg': '32px',
    '--spacing-xl': '48px',

    // Shadows & Effects
    '--text-shadow': '2px 2px 4px rgba(0,0,0,0.5)', // Chalk depth effect
    '--box-shadow': '0 4px 6px rgba(0,0,0,0.3)',

    // Component-specific
    '--section-bg': 'rgba(255,255,255,0.05)', // Subtle section backgrounds
    '--section-border': '2px solid rgba(255,255,255,0.2)',
    '--icon-size': '80px',
    '--icon-spacing': '20px',

    // List styles
    '--bullet-color': '#f4d03f', // Yellow checkmarks/bullets
    '--bullet-size': '24px',

    // Comparison layout
    '--column-gap': '40px',
    '--pros-bg': 'rgba(76, 175, 80, 0.1)', // Subtle green tint
    '--cons-bg': 'rgba(244, 67, 54, 0.1)', // Subtle red tint
    '--pros-border': '#4caf50',
    '--cons-border': '#f44336',

    // Legacy template variable aliases (for backward compatibility)
    '--title-color': '#ffffff', // Alias for --text-primary
    '--body-color': '#e8e8e8', // Alias for --text-secondary
    '--accent-color': '#f4d03f', // Alias for --text-accent
    '--bg-color': '#2d4a3e', // Alias for --bg-primary
    '--title-font': 'Permanent Marker, cursive', // Alias for --font-title
    '--body-font': 'Patrick Hand, cursive' // Alias for --font-body
  },

  /**
   * Color palette for themed elements
   * Used by compositor for dynamic styling
   */
  colors: {
    primary: '#2d4a3e', // Chalkboard green
    secondary: '#1a2e25', // Darker green
    accent: '#f4d03f', // Yellow chalk
    success: '#4caf50', // Green for pros/positive
    warning: '#ff9800', // Orange for neutral
    error: '#f44336', // Red for cons/negative
    textPrimary: '#ffffff', // White chalk
    textSecondary: '#e8e8e8' // Light gray chalk
  },

  /**
   * Layout preferences for this theme
   * Hints for the compositor about which layouts work best
   */
  recommendedLayouts: [
    'comparison', // Side-by-side works great with chalkboard
    'single' // Deep dive educational content
  ],

  /**
   * Google Fonts to load in templates
   */
  googleFonts: ['Permanent+Marker', 'Patrick+Hand']
};

module.exports = chalkboardTheme;
