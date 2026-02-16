/**
 * Watercolor Theme Configuration
 *
 * Light, elegant theme with soft watercolor illustrations
 * Perfect for: Professional storytelling, evolution flows, architectural comparisons
 */

const watercolorTheme = {
  /**
   * Theme identifier
   */
  name: 'watercolor',

  /**
   * Background configuration for DALL-E generation
   */
  background: {
    /**
     * DALL-E prompt for generating theme background
     * Size: 1024x1024, standard quality
     */
    dallePrompt:
      'Light cream paper texture background, subtle watercolor wash edges, soft warm lighting, no text, minimal, 1024x1024',

    /**
     * Fallback color if DALL-E generation fails
     */
    fallbackColor: '#faf8f5'
  },

  /**
   * Typography configuration
   */
  typography: {
    /**
     * Font family for main titles
     * Fallback: serif
     */
    titleFont: 'Playfair Display, serif',

    /**
     * Font family for body text and lists
     * Fallback: sans-serif
     */
    bodyFont: 'Open Sans, sans-serif',

    /**
     * Main title color (dark blue-gray)
     */
    titleColor: '#2c3e50',

    /**
     * Body text color (medium blue-gray)
     */
    bodyColor: '#34495e',

    /**
     * Accent color for highlights and emphasis (soft blue)
     */
    accentColor: '#3498db'
  },

  /**
   * Illustration style for DALL-E element generation
   */
  illustrations: {
    /**
     * Style description to append to illustration prompts
     */
    style: 'soft watercolor illustration, pastel colors, architectural',

    /**
     * Example subjects that work well with this theme
     */
    examples: ['warehouse building', 'lake with data', 'modern office', 'cloud infrastructure', 'data pipeline flow']
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
    '--bg-primary': '#faf8f5', // Cream paper
    '--bg-overlay': 'rgba(243,239,233,0.8)', // Subtle warm overlay
    '--text-primary': '#2c3e50', // Dark blue-gray
    '--text-secondary': '#34495e', // Medium blue-gray
    '--text-accent': '#3498db', // Soft blue
    '--border-color': 'rgba(52,73,94,0.15)', // Light border

    // Typography
    '--font-title': 'Playfair Display, serif',
    '--font-body': 'Open Sans, sans-serif',
    '--font-size-hero': '52px', // Main title
    '--font-size-title': '30px', // Section titles
    '--font-size-body': '18px', // Body text
    '--font-size-small': '14px', // Captions, metadata
    '--line-height-title': '1.3',
    '--line-height-body': '1.7',

    // Spacing
    '--spacing-xs': '8px',
    '--spacing-sm': '16px',
    '--spacing-md': '24px',
    '--spacing-lg': '32px',
    '--spacing-xl': '48px',

    // Shadows & Effects
    '--text-shadow': 'none', // Clean, no shadows for watercolor
    '--box-shadow': '0 2px 8px rgba(0,0,0,0.08)', // Subtle paper depth

    // Component-specific
    '--section-bg': 'rgba(255,255,255,0.6)', // Soft white sections
    '--section-border': '1px solid rgba(52,73,94,0.15)',
    '--icon-size': '100px',
    '--icon-spacing': '24px',

    // List styles
    '--bullet-color': '#3498db', // Blue bullets/checkmarks
    '--bullet-size': '20px',

    // Comparison layout
    '--column-gap': '48px',
    '--pros-bg': 'rgba(46,204,113,0.08)', // Very subtle green wash
    '--cons-bg': 'rgba(231,76,60,0.08)', // Very subtle red wash
    '--pros-border': '#2ecc71',
    '--cons-border': '#e74c3c',

    // Legacy template variable aliases (for backward compatibility)
    '--title-color': '#34495e', // Alias for --text-primary
    '--body-color': '#5d6d7e', // Alias for --text-secondary
    '--accent-color': '#3498db', // Alias for --text-accent
    '--bg-color': '#faf8f5', // Alias for --bg-primary
    '--title-font': 'Playfair Display, serif', // Alias for --font-title
    '--body-font': 'Lora, serif' // Alias for --font-body
  },

  /**
   * Color palette for themed elements
   * Used by compositor for dynamic styling
   */
  colors: {
    primary: '#faf8f5', // Cream paper
    secondary: '#f3efe9', // Slightly darker cream
    accent: '#3498db', // Soft blue
    success: '#2ecc71', // Watercolor green for pros
    warning: '#f39c12', // Warm orange for neutral
    error: '#e74c3c', // Soft red for cons
    textPrimary: '#2c3e50', // Dark blue-gray
    textSecondary: '#34495e' // Medium blue-gray
  },

  /**
   * Layout preferences for this theme
   * Hints for the compositor about which layouts work best
   */
  recommendedLayouts: [
    'evolution', // Horizontal flow works beautifully with watercolor
    'comparison', // Professional side-by-side
    'single' // Storytelling deep dives
  ],

  /**
   * Google Fonts to load in templates
   */
  googleFonts: ['Playfair+Display:wght@400;700', 'Open+Sans:wght@400;600']
};

module.exports = watercolorTheme;
