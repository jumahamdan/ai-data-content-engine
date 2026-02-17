/**
 * Shared theme defaults and factory.
 * Each theme overrides only the values that differ from these defaults.
 */

const DEFAULT_CSS = {
  // Layout & Structure
  '--canvas-width': '1080px',
  '--canvas-height': '1080px',
  '--padding': '60px',
  '--content-width': '960px',

  // Typography sizes
  '--font-size-hero': '56px',
  '--font-size-title': '32px',
  '--font-size-body': '20px',
  '--font-size-small': '16px',
  '--line-height-title': '1.2',
  '--line-height-body': '1.6',

  // Spacing
  '--spacing-xs': '8px',
  '--spacing-sm': '16px',
  '--spacing-md': '24px',
  '--spacing-lg': '32px',
  '--spacing-xl': '48px',

  // Component-specific
  '--icon-size': '80px',
  '--icon-spacing': '20px',
  '--bullet-size': '24px',
  '--column-gap': '40px'
};

/**
 * Build a complete theme config by merging overrides onto defaults.
 * Generates legacy CSS aliases automatically from typography/color values.
 */
function createTheme(config) {
  const css = { ...DEFAULT_CSS, ...config.css };

  // Auto-generate legacy aliases from the primary CSS values
  css['--title-color'] = css['--title-color'] || css['--text-primary'];
  css['--body-color'] = css['--body-color'] || css['--text-secondary'];
  css['--accent-color'] = css['--accent-color'] || css['--text-accent'];
  css['--bg-color'] = css['--bg-color'] || css['--bg-primary'];
  css['--title-font'] = css['--title-font'] || css['--font-title'];
  css['--body-font'] = css['--body-font'] || css['--font-body'];

  return { ...config, css };
}

module.exports = { createTheme, DEFAULT_CSS };
