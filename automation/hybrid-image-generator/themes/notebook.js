/**
 * Notebook Theme Configuration
 *
 * Grid paper aesthetic with handwritten fonts and warm sketch colors
 * Perfect for: Educational content, technical diagrams, sketch-style infographics
 */

const notebookTheme = {
  /**
   * Theme identifier
   */
  name: 'notebook',

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
      'Cream-colored grid paper notebook page texture, light blue graph lines, slightly aged paper with subtle coffee stains, soft shadow at edges, no text no words no letters no numbers no writing no annotations, abstract paper texture only, 1024x1024',

    /**
     * Fallback color if generation fails
     */
    fallbackColor: '#f5f0e8'
  },

  /**
   * Typography configuration
   */
  typography: {
    /**
     * Font family for main titles
     * Handwritten style for authentic notebook feel
     */
    titleFont: 'Caveat, cursive',

    /**
     * Font family for body text and lists
     * Sketch-style handwriting
     */
    bodyFont: 'Patrick Hand, cursive',

    /**
     * Main title color (dark ink)
     */
    titleColor: '#2c2c2c',

    /**
     * Body text color (medium gray)
     */
    bodyColor: '#444444',

    /**
     * Accent color for highlights and emphasis (blue ink)
     */
    accentColor: '#3a7bd5'
  },

  /**
   * Illustration style for element generation
   */
  illustrations: {
    /**
     * Style description to append to illustration prompts
     */
    style: 'hand-drawn sketch style, pencil lines on notebook paper, simple and clean',

    /**
     * Example subjects that work well with this theme
     */
    examples: ['data flow diagram', 'system architecture sketch', 'concept map', 'timeline', 'process flow']
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
    '--bg-primary': '#f5f0e8', // Warm cream paper
    '--bg-overlay': 'rgba(255,255,255,0.5)', // Light overlay for depth
    '--text-primary': '#2c2c2c', // Dark ink
    '--text-secondary': '#444444', // Medium gray ink
    '--text-accent': '#3a7bd5', // Blue ink highlight
    '--border-color': '#c0c0c0', // Light gray borders

    // Typography
    '--font-title': 'Caveat, cursive',
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
    '--text-shadow': '1px 1px 2px rgba(0,0,0,0.1)', // Subtle text depth
    '--box-shadow': '0 2px 4px rgba(0,0,0,0.1)',

    // Component-specific
    '--section-bg': 'rgba(255,255,255,0.8)', // Paper-white sections
    '--section-border': '1px dashed #c0c0c0', // Hand-drawn style dashed borders
    '--icon-size': '80px',
    '--icon-spacing': '20px',

    // List styles
    '--bullet-color': '#3a7bd5', // Blue ink bullets
    '--bullet-size': '24px',

    // Comparison layout
    '--column-gap': '40px',
    '--pros-bg': 'rgba(76, 175, 80, 0.08)', // Very subtle green tint
    '--cons-bg': 'rgba(244, 67, 54, 0.08)', // Very subtle red tint
    '--pros-border': '#4caf50',
    '--cons-border': '#f44336',

    // Legacy template variable aliases (for backward compatibility)
    '--title-color': '#2d2d2d', // Alias for --text-primary
    '--body-color': '#4a4a4a', // Alias for --text-secondary
    '--accent-color': '#3a7bd5', // Alias for --text-accent
    '--bg-color': '#f5f0e8', // Alias for --bg-primary
    '--title-font': 'Caveat, cursive', // Alias for --font-title
    '--body-font': 'Handlee, cursive' // Alias for --font-body
  },

  /**
   * Color palette for themed elements
   * Used by compositor for dynamic styling
   */
  colors: {
    primary: '#f5f0e8', // Cream paper
    secondary: '#e8dfd0', // Darker aged paper
    accent: '#3a7bd5', // Blue ink
    success: '#4caf50', // Green for pros/positive
    warning: '#ff9800', // Orange for neutral
    error: '#f44336', // Red for cons/negative
    textPrimary: '#2c2c2c', // Dark ink
    textSecondary: '#444444' // Medium gray ink
  },

  /**
   * Layout preferences for this theme
   * Hints for the compositor about which layouts work best
   */
  recommendedLayouts: ['notebook'],

  /**
   * Google Fonts to load in templates
   */
  googleFonts: ['Caveat:wght@400;700', 'Patrick+Hand']
};

module.exports = notebookTheme;
