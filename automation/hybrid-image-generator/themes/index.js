/**
 * Theme Loader
 *
 * Central module for loading and managing visual themes.
 * Provides theme lookup with fallback defaults.
 */

const chalkboard = require('./chalkboard');
const watercolor = require('./watercolor');
const tech = require('./tech');

/**
 * Registry of all available themes
 * Key: theme name, Value: theme configuration object
 */
const THEMES = {
  chalkboard,
  watercolor,
  tech
};

/**
 * Default theme to use when requested theme is not found
 */
const DEFAULT_THEME = 'chalkboard';

/**
 * Get a theme by name with fallback to default
 *
 * @param {string} themeName - Name of the theme to load ('chalkboard', 'watercolor', 'tech')
 * @param {Object} options - Configuration options
 * @param {boolean} options.strict - If true, throw error for invalid theme instead of falling back
 * @returns {Object} Theme configuration object
 *
 * @example
 * const theme = getTheme('watercolor');
 * console.log(theme.typography.titleFont); // 'Playfair Display, serif'
 *
 * @example
 * // With strict mode
 * try {
 *   const theme = getTheme('invalid', { strict: true });
 * } catch (err) {
 *   console.error('Theme not found:', err.message);
 * }
 */
function getTheme(themeName, options = {}) {
  const { strict = false } = options;

  // Normalize theme name (lowercase, trim whitespace)
  const normalizedName = themeName ? themeName.toLowerCase().trim() : null;

  // Check if theme exists
  if (normalizedName && THEMES[normalizedName]) {
    return THEMES[normalizedName];
  }

  // Strict mode: throw error
  if (strict) {
    const availableThemes = getThemeNames().join(', ');
    throw new Error(
      `Theme '${themeName}' not found. Available themes: ${availableThemes}`
    );
  }

  // Fallback mode: return default theme with warning
  if (normalizedName && !THEMES[normalizedName]) {
    console.warn(
      `[Theme Loader] Theme '${themeName}' not found. Falling back to '${DEFAULT_THEME}'.`
    );
  }

  return THEMES[DEFAULT_THEME];
}

/**
 * Get all available theme names
 *
 * @returns {string[]} Array of theme names
 *
 * @example
 * const themes = getThemeNames();
 * console.log(themes); // ['chalkboard', 'watercolor', 'tech']
 */
function getThemeNames() {
  return Object.keys(THEMES);
}

/**
 * Check if a theme name is valid
 *
 * @param {string} themeName - Theme name to validate
 * @returns {boolean} True if theme exists, false otherwise
 *
 * @example
 * isValidTheme('watercolor'); // true
 * isValidTheme('invalid');    // false
 */
function isValidTheme(themeName) {
  if (!themeName) return false;
  const normalizedName = themeName.toLowerCase().trim();
  return THEMES.hasOwnProperty(normalizedName);
}

/**
 * Get all themes as an array
 *
 * @returns {Object[]} Array of theme configuration objects
 *
 * @example
 * const allThemes = getAllThemes();
 * allThemes.forEach(theme => {
 *   console.log(theme.name, theme.colors.primary);
 * });
 */
function getAllThemes() {
  return Object.values(THEMES);
}

/**
 * Get theme by recommended layout
 *
 * @param {string} layout - Layout type ('comparison', 'evolution', 'single')
 * @returns {string[]} Array of theme names that recommend this layout
 *
 * @example
 * const themes = getThemesByLayout('evolution');
 * console.log(themes); // ['watercolor', 'tech']
 */
function getThemesByLayout(layout) {
  return getAllThemes()
    .filter(theme => theme.recommendedLayouts.includes(layout))
    .map(theme => theme.name);
}

/**
 * Get CSS variables as a style string for injection
 *
 * @param {string} themeName - Theme name
 * @returns {string} CSS variables formatted for inline styles or style tags
 *
 * @example
 * const cssVars = getCSSVariables('tech');
 * // Returns: "--canvas-width: 1080px; --canvas-height: 1080px; ..."
 */
function getCSSVariables(themeName) {
  const theme = getTheme(themeName);
  return Object.entries(theme.css)
    .map(([key, value]) => `${key}: ${value}`)
    .join('; ');
}

/**
 * Get Google Fonts URL for a theme
 *
 * @param {string} themeName - Theme name
 * @returns {string} Google Fonts CSS import URL
 *
 * @example
 * const fontUrl = getGoogleFontsURL('watercolor');
 * // Returns: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Open+Sans:wght@400;600&display=swap"
 */
function getGoogleFontsURL(themeName) {
  const theme = getTheme(themeName);
  const families = theme.googleFonts.join('&family=');
  return `https://fonts.googleapis.com/css2?family=${families}&display=swap`;
}

/**
 * Get theme metadata summary
 *
 * @param {string} themeName - Theme name
 * @returns {Object} Summary of theme properties
 *
 * @example
 * const info = getThemeInfo('chalkboard');
 * console.log(info);
 * // {
 * //   name: 'chalkboard',
 * //   primaryColor: '#2d4a3e',
 * //   accentColor: '#f4d03f',
 * //   titleFont: 'Permanent Marker, cursive',
 * //   recommendedLayouts: ['comparison', 'single']
 * // }
 */
function getThemeInfo(themeName) {
  const theme = getTheme(themeName);
  return {
    name: theme.name,
    primaryColor: theme.colors.primary,
    accentColor: theme.colors.accent,
    titleFont: theme.typography.titleFont,
    bodyFont: theme.typography.bodyFont,
    recommendedLayouts: theme.recommendedLayouts,
    illustrationStyle: theme.illustrations.style
  };
}

/**
 * Validate theme configuration structure
 *
 * @param {Object} theme - Theme object to validate
 * @returns {Object} Validation result { valid: boolean, errors: string[] }
 *
 * @example
 * const result = validateTheme(myTheme);
 * if (!result.valid) {
 *   console.error('Theme validation failed:', result.errors);
 * }
 */
function validateTheme(theme) {
  const errors = [];

  // Required top-level properties
  const requiredProps = ['name', 'background', 'typography', 'illustrations', 'css', 'colors'];
  requiredProps.forEach(prop => {
    if (!theme[prop]) {
      errors.push(`Missing required property: ${prop}`);
    }
  });

  // Background validation
  if (theme.background) {
    if (!theme.background.dallePrompt) {
      errors.push('Missing background.dallePrompt');
    }
    if (!theme.background.fallbackColor) {
      errors.push('Missing background.fallbackColor');
    }
  }

  // Typography validation
  if (theme.typography) {
    ['titleFont', 'bodyFont', 'titleColor', 'bodyColor', 'accentColor'].forEach(prop => {
      if (!theme.typography[prop]) {
        errors.push(`Missing typography.${prop}`);
      }
    });
  }

  // Colors validation
  if (theme.colors) {
    ['primary', 'accent', 'textPrimary'].forEach(prop => {
      if (!theme.colors[prop]) {
        errors.push(`Missing colors.${prop}`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// Export functions and constants
module.exports = {
  // Main functions
  getTheme,
  getThemeNames,
  isValidTheme,
  getAllThemes,

  // Utility functions
  getThemesByLayout,
  getCSSVariables,
  getGoogleFontsURL,
  getThemeInfo,
  validateTheme,

  // Direct theme access (for advanced use)
  themes: THEMES,

  // Constants
  DEFAULT_THEME
};
