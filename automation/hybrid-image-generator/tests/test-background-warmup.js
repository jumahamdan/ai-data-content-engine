/**
 * Test script for background warmup functionality
 *
 * This script pre-generates backgrounds for all themes
 * Use this to populate the cache before running the main workflow
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const { createBackgroundGenerator, THEMES } = require('../background-generator');

async function main() {
  console.log('========================================');
  console.log('Background Generator Warmup Test');
  console.log('========================================\n');

  // Get count from command line or default to 3
  const countPerTheme = parseInt(process.argv[2]) || 3;

  console.log(`📋 Themes: ${Object.keys(THEMES).join(', ')}`);
  console.log(`🔥 Generating ${countPerTheme} backgrounds per theme\n`);

  // Use test cache for testing
  const testCacheDir = path.join(__dirname, '..', 'cache', 'test');
  console.log(`📁 Cache directory: ${testCacheDir}\n`);

  const bgGen = createBackgroundGenerator({
    cacheDir: testCacheDir,
    verbose: true
  });

  // Clear existing cache first (optional)
  const shouldClear = process.argv.includes('--clear');
  if (shouldClear) {
    console.log('🗑️  Clearing existing cache...\n');
    const deletedCount = await bgGen.clearCache();
    console.log(`✓ Cleared ${deletedCount} cached backgrounds\n`);
  }

  // Run warmup
  console.log('🚀 Starting warmup...\n');
  const results = await bgGen.warmup(countPerTheme);

  console.log('\n========================================');
  console.log('Warmup Results');
  console.log('========================================');
  console.log(`Total: ${results.total}`);
  console.log(`Success: ${results.success}`);
  console.log(`Failed: ${results.failed}`);
  console.log();

  console.log('By Theme:');
  for (const [theme, stats] of Object.entries(results.themes)) {
    console.log(`  ${theme}:`);
    console.log(`    Generated: ${stats.generated}`);
    console.log(`    Failed: ${stats.failed}`);
  }
  console.log();

  // Show cache stats
  console.log('========================================');
  console.log('Final Cache Status');
  console.log('========================================');
  const cacheStats = await bgGen.getCacheStats();
  for (const [theme, stats] of Object.entries(cacheStats.themes)) {
    console.log(`${theme}: ${stats.count} backgrounds cached`);
  }

  console.log('\n✓ Warmup complete!');
  console.log('\nUsage:');
  console.log('  node test-background-warmup.js [count]     # Generate [count] per theme (default: 3)');
  console.log('  node test-background-warmup.js 5 --clear   # Clear cache then generate 5 per theme');
}

// Run warmup
main().catch(error => {
  console.error('\n❌ Warmup failed:', error);
  process.exit(1);
});
