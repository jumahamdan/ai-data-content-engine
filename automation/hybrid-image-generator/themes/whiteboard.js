/**
 * Whiteboard Theme Configuration
 *
 * Clean white aesthetic with bordered sections and professional fonts
 * Perfect for: Comparisons, side-by-side analysis, corporate presentations
 */

const whiteboardTheme = {
  /**
   * Theme identifier
   */
  name: 'whiteboard',

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
      'Clean white dry-erase whiteboard surface texture, very subtle gray smudge marks from previous erasing, slight glossy reflection, whiteboard markers tray shadow at bottom edge, no text no words no letters no writing no annotations, abstract surface texture only, 1024x1024',

    /**
     * Fallback color if generation fails
     */
    fallbackColor: '#f8f8f8'
  },

  /**
   * Typography configuration
   */
  typography: {
    /**
     * Font family for main titles
     * Clean readable sans-serif
     */
    titleFont: 'Nunito, sans-serif',

    /**
     * Font family for body text and lists
     * Professional open sans
     */
    bodyFont: 'Open Sans, sans-serif',

    /**
     * Main title color (near-black)
     */
    titleColor: '#1a1a1a',

    /**
     * Body text color (dark gray)
     */
    bodyColor: '#333333',

    /**
     * Accent color for highlights and emphasis (orange marker)
     */
    accentColor: '#e67e22'
  },

  /**
   * Illustration style for element generation
   */
  illustrations: {
    /**
     * Style description to append to illustration prompts
     */
    style: 'clean whiteboard marker drawing style, bold lines, simple and professional',

    /**
     * Example subjects that work well with this theme
     */
    examples: ['comparison chart', 'venn diagram', 'process flow', 'organizational chart', 'mind map']
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
    '--bg-primary': '#f8f8f8', // Near-white whiteboard
    '--bg-overlay': 'rgba(0,0,0,0.02)', // Very subtle overlay
    '--text-primary': '#1a1a1a', // Near-black marker
    '--text-secondary': '#333333', // Dark gray marker
    '--text-accent': '#e67e22', // Orange marker highlight
    '--border-color': '#333333', // Dark borders

    // Typography
    '--font-title': 'Nunito, sans-serif',
    '--font-body': 'Open Sans, sans-serif',
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
    '--text-shadow': 'none', // Clean, no shadows
    '--box-shadow': '0 2px 8px rgba(0,0,0,0.1)',

    // Component-specific
    '--section-bg': 'rgba(255,255,255,0.95)', // Bright white sections
    '--section-border': '2px solid #333333', // Bold solid borders
    '--icon-size': '80px',
    '--icon-spacing': '20px',

    // List styles
    '--bullet-color': '#e67e22', // Orange marker bullets
    '--bullet-size': '24px',

    // Comparison layout
    '--column-gap': '40px',
    '--pros-bg': 'rgba(41, 128, 185, 0.05)', // Very subtle blue tint
    '--cons-bg': 'rgba(230, 126, 34, 0.05)', // Very subtle orange tint
    '--pros-border': '#2980b9', // Blue marker
    '--cons-border': '#e67e22' // Orange marker
  },

  /**
   * Color palette for themed elements
   * Used by compositor for dynamic styling
   */
  colors: {
    primary: '#f8f8f8', // Near-white
    secondary: '#e8e8e8', // Light gray
    accent: '#e67e22', // Orange marker
    success: '#2980b9', // Blue marker
    warning: '#f39c12', // Yellow marker
    error: '#c0392b', // Red marker
    textPrimary: '#1a1a1a', // Near-black
    textSecondary: '#333333' // Dark gray
  },

  /**
   * Layout preferences for this theme
   * Hints for the compositor about which layouts work best
   */
  recommendedLayouts: ['whiteboard'],

  /**
   * Google Fonts to load in templates
   */
  googleFonts: ['Nunito:wght@400;600;700', 'Open+Sans:wght@400;600']
};

module.exports = whiteboardTheme;
