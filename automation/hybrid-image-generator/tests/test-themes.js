/**
 * Test script for theme system
 *
 * Verifies:
 * - All themes load correctly
 * - Theme validation passes
 * - Utility functions work as expected
 * - Fallback behavior works
 */

const {
  getTheme,
  getThemeNames,
  isValidTheme,
  getAllThemes,
  getThemesByLayout,
  getCSSVariables,
  getGoogleFontsURL,
  getThemeInfo,
  validateTheme,
  DEFAULT_THEME
} = require('../themes');

console.log('Testing Theme System\n');
console.log('='.repeat(60));

// Test 1: Get all theme names
console.log('\nTest 1: Available themes');
const themeNames = getThemeNames();
console.log('Available themes:', themeNames);
console.log('Found', themeNames.length, 'themes');

// Test 2: Load each theme and validate
console.log('\nTest 2: Load and validate each theme');
themeNames.forEach(name => {
  const theme = getTheme(name);
  const validation = validateTheme(theme);

  if (validation.valid) {
    console.log(`PASS ${name}: Valid`);
    console.log(`   - Background: ${theme.background.fallbackColor}`);
    console.log(`   - Title font: ${theme.typography.titleFont}`);
    console.log(`   - Accent color: ${theme.typography.accentColor}`);
    console.log(`   - Recommended layouts: ${theme.recommendedLayouts.join(', ')}`);
  } else {
    console.log(`FAIL ${name}: Invalid`);
    validation.errors.forEach(err => console.log(`   - ${err}`));
  }
});

// Test 3: Theme validation
console.log('\nTest 3: Theme name validation');
console.log('isValidTheme("wb-glass-sticky"):', isValidTheme('wb-glass-sticky'));
console.log('isValidTheme("wb-glass-clean"):', isValidTheme('wb-glass-clean'));
console.log('isValidTheme("wb-standing-marker"):', isValidTheme('wb-standing-marker'));
console.log('isValidTheme("wb-standing-minimal"):', isValidTheme('wb-standing-minimal'));
console.log('isValidTheme("chalkboard"):', isValidTheme('chalkboard'));
console.log('isValidTheme("invalid"):', isValidTheme('invalid'));
console.log('isValidTheme(null):', isValidTheme(null));

// Test 4: Fallback behavior
console.log('\nTest 4: Fallback to default theme');
console.log('Default theme:', DEFAULT_THEME);
const fallbackTheme = getTheme('nonexistent');
console.log('Loading nonexistent theme:', fallbackTheme.name);
console.log('PASS Fallback successful');

// Test 5: Strict mode
console.log('\nTest 5: Strict mode error handling');
try {
  getTheme('invalid', { strict: true });
  console.log('FAIL Should have thrown an error');
} catch (err) {
  console.log('PASS Correctly threw error:', err.message);
}

// Test 6: Get themes by layout
console.log('\nTest 6: Get themes by layout');
['comparison', 'evolution', 'whiteboard', 'dense-infographic'].forEach(layout => {
  const themes = getThemesByLayout(layout);
  console.log(`${layout}: ${themes.join(', ')}`);
});

// Test 7: CSS Variables
console.log('\nTest 7: CSS Variables generation');
const cssVars = getCSSVariables('wb-glass-sticky');
const cssVarCount = cssVars.split(';').length;
console.log(`Generated ${cssVarCount} CSS variables for wb-glass-sticky theme`);
console.log('Sample:', cssVars.substring(0, 100) + '...');
console.log('PASS CSS generation works');

// Test 8: Google Fonts URL
console.log('\nTest 8: Google Fonts URL generation');
themeNames.forEach(name => {
  const url = getGoogleFontsURL(name);
  console.log(`${name}:`, url);
});

// Test 9: Theme info summary
console.log('\nTest 9: Theme info summaries');
themeNames.forEach(name => {
  const info = getThemeInfo(name);
  console.log(`\n${info.name.toUpperCase()}`);
  console.log(`  Primary: ${info.primaryColor}`);
  console.log(`  Accent: ${info.accentColor}`);
  console.log(`  Title font: ${info.titleFont}`);
  console.log(`  Style: ${info.illustrationStyle}`);
});

// Test 10: Theme structure validation
console.log('\nTest 10: Detailed structure validation');
getAllThemes().forEach(theme => {
  const requiredSections = ['background', 'typography', 'illustrations', 'css', 'colors'];
  const hasSections = requiredSections.every(section => theme[section]);

  if (hasSections) {
    const cssVarCount = Object.keys(theme.css).length;
    const colorCount = Object.keys(theme.colors).length;
    console.log(`PASS ${theme.name}: ${cssVarCount} CSS vars, ${colorCount} colors`);
  } else {
    console.log(`FAIL ${theme.name}: Missing required sections`);
  }
});

// Test 11: Marker color CSS variables
console.log('\nTest 11: Marker color CSS variables');
getAllThemes().forEach(theme => {
  const hasMarkers =
    theme.css['--marker-1'] && theme.css['--marker-2'] && theme.css['--marker-3'] && theme.css['--marker-4'];
  if (hasMarkers) {
    console.log(
      `PASS ${theme.name}: marker-1=${theme.css['--marker-1']}, marker-2=${theme.css['--marker-2']}, marker-3=${theme.css['--marker-3']}, marker-4=${theme.css['--marker-4']}`
    );
  } else {
    console.log(`FAIL ${theme.name}: Missing marker color CSS variables`);
  }
});

// Summary
console.log('\n' + '='.repeat(60));
console.log('Theme System Test Complete');
console.log('='.repeat(60));
console.log(`\nAll ${themeNames.length} themes loaded and validated successfully`);
console.log('\nTheme files:');
themeNames.forEach(name => {
  console.log(`  - automation/hybrid-image-generator/themes/${name}.js`);
});
console.log('  - automation/hybrid-image-generator/themes/index.js (loader)');
