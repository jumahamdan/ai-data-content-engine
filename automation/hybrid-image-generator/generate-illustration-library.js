/**
 * Generate Illustration Library
 *
 * Pre-generates a library of common illustrations for all themes.
 * These are reused across all posts to minimize DALL-E API costs.
 *
 * Usage:
 *   DALLE_ENABLED=true node generate-illustration-library.js
 *   DALLE_ENABLED=true node generate-illustration-library.js --theme watercolor
 *   DALLE_ENABLED=true node generate-illustration-library.js --clear
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { createIllustrationCache } = require('./illustration-cache');

// Common illustration library organized by category
const ILLUSTRATION_LIBRARY = {
  // Data architecture buildings
  building: [
    { name: 'data-warehouse', description: 'modern data warehouse building with server racks visible through windows' },
    { name: 'data-lake', description: 'lakehouse building beside a serene lake with data flowing in' },
    { name: 'database-building', description: 'cylindrical database building with organized shelves' },
    { name: 'cloud-datacenter', description: 'cloud-shaped datacenter building floating above ground' },
    { name: 'modern-office', description: 'modern tech office building with glass walls' },
    { name: 'cafe-storefront', description: 'cozy café storefront with welcoming entrance' }
  ],

  // Tech icons and symbols
  icon: [
    { name: 'database-cylinder', description: 'database cylinder icon with stacked disks' },
    { name: 'cloud-servers', description: 'cloud icon with servers inside' },
    { name: 'neural-network', description: 'neural network with connected nodes' },
    { name: 'api-gateway', description: 'gateway or door icon representing API' },
    { name: 'data-pipeline', description: 'pipeline or conveyor belt moving data' },
    { name: 'analytics-chart', description: 'bar chart or analytics graph' },
    { name: 'machine-learning', description: 'brain icon with circuit patterns' },
    { name: 'data-stream', description: 'flowing stream or river of data' },
    { name: 'security-lock', description: 'padlock or shield icon for security' },
    { name: 'code-brackets', description: 'code brackets or terminal window' }
  ],

  // Diagrams and flows
  diagram: [
    { name: 'data-flow-arrows', description: 'arrows showing data flow from left to right' },
    { name: 'circular-process', description: 'circular diagram showing continuous process' },
    { name: 'hierarchy-tree', description: 'tree structure showing hierarchy' },
    { name: 'network-nodes', description: 'network of connected nodes' }
  ],

  // People and characters
  character: [
    { name: 'data-engineer', description: 'person working with data pipelines' },
    { name: 'data-scientist', description: 'person analyzing data charts' },
    { name: 'developer', description: 'person coding on laptop' },
    { name: 'team-collaboration', description: 'small group of people collaborating' }
  ]
};

async function generateLibrary(options = {}) {
  console.log('╔════════════════════════════════════════════════════╗');
  console.log('║   Illustration Library Generator                  ║');
  console.log('╚════════════════════════════════════════════════════╝\n');

  const targetTheme = options.theme || null;
  const shouldClear = options.clear || false;

  // Check environment
  const isEnabled = process.env.DALLE_ENABLED !== 'false';
  const hasApiKey = !!process.env.OPENAI_API_KEY;

  if (!isEnabled) {
    console.log('❌ DALLE_ENABLED is false. Set DALLE_ENABLED=true to generate illustrations.');
    console.log('   Usage: DALLE_ENABLED=true node generate-illustration-library.js');
    process.exit(1);
  }

  if (!hasApiKey) {
    console.log('❌ OPENAI_API_KEY not set in automation/.env');
    console.log('   Add your OpenAI API key to automation/.env:');
    console.log('   OPENAI_API_KEY=sk-...');
    process.exit(1);
  }

  const cache = createIllustrationCache({
    verbose: true
  });

  // Clear cache if requested
  if (shouldClear) {
    console.log('🗑️  Clearing existing illustration cache...\n');
    const deleted = await cache.clearCache(targetTheme);
    console.log(`✓ Cleared ${deleted} illustrations\n`);
  }

  // Determine themes to generate
  const themes = targetTheme ? [targetTheme] : ['chalkboard', 'watercolor', 'tech'];

  console.log('📋 Generation plan:');
  console.log(`   Themes: ${themes.join(', ')}`);
  let totalCount = 0;
  for (const category of Object.keys(ILLUSTRATION_LIBRARY)) {
    const count = ILLUSTRATION_LIBRARY[category].length;
    console.log(`   ${category}: ${count} illustrations`);
    totalCount += count;
  }
  console.log(`   Total per theme: ${totalCount}`);
  console.log(`   Grand total: ${totalCount * themes.length}\n`);

  const costPerImage = 0.04;
  const estimatedCost = (totalCount * themes.length * costPerImage).toFixed(2);
  console.log(`💰 Estimated cost: $${estimatedCost} (${totalCount * themes.length} × $${costPerImage})\n`);

  // Confirm
  console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');
  await new Promise(resolve => setTimeout(resolve, 5000));

  console.log('🚀 Starting generation...\n');

  const results = {
    total: 0,
    success: 0,
    failed: 0,
    skipped: 0,
    byTheme: {}
  };

  const startTime = Date.now();

  // Generate for each theme
  for (const theme of themes) {
    console.log(`\n${'='.repeat(54)}`);
    console.log(`Theme: ${theme.toUpperCase()}`);
    console.log('='.repeat(54));

    results.byTheme[theme] = {
      success: 0,
      failed: 0,
      skipped: 0
    };

    // Generate for each category
    for (const [category, illustrations] of Object.entries(ILLUSTRATION_LIBRARY)) {
      console.log(`\n  Category: ${category} (${illustrations.length} illustrations)`);

      for (const illus of illustrations) {
        results.total++;

        try {
          console.log(`\n    [${results.total}/${totalCount * themes.length}] Generating: ${illus.name}...`);

          const result = await cache.generateIllustration(illus.name, illus.description, {
            theme,
            category,
            size: '1024x1024'
          });

          if (result.source === 'existing') {
            results.skipped++;
            results.byTheme[theme].skipped++;
            console.log(`    ⏭️  Already exists`);
          } else {
            results.success++;
            results.byTheme[theme].success++;
            console.log(`    ✅ Generated (${result.latency}ms)`);
          }
        } catch (error) {
          results.failed++;
          results.byTheme[theme].failed++;
          console.log(`    ❌ Failed: ${error.message}`);
        }

        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  const totalTime = Date.now() - startTime;
  const avgTime = results.success > 0 ? Math.round(totalTime / results.success) : 0;

  console.log('\n' + '='.repeat(54));
  console.log('Generation Complete');
  console.log('='.repeat(54));
  console.log(`Total time: ${(totalTime / 1000 / 60).toFixed(1)} minutes`);
  console.log(`Avg time per illustration: ${avgTime}ms`);
  console.log(`\nResults:`);
  console.log(`  Total: ${results.total}`);
  console.log(`  Success: ${results.success}`);
  console.log(`  Skipped (already exist): ${results.skipped}`);
  console.log(`  Failed: ${results.failed}`);

  console.log(`\nBy Theme:`);
  for (const [theme, stats] of Object.entries(results.byTheme)) {
    console.log(`  ${theme}:`);
    console.log(`    Success: ${stats.success}`);
    console.log(`    Skipped: ${stats.skipped}`);
    console.log(`    Failed: ${stats.failed}`);
  }

  const actualCost = (results.success * costPerImage).toFixed(2);
  console.log(`\n💰 Actual cost: $${actualCost} (${results.success} × $${costPerImage})`);

  // Show cache stats
  console.log('\n' + '='.repeat(54));
  console.log('Final Cache Status');
  console.log('='.repeat(54));
  const cacheStats = await cache.getCacheStats();
  console.log(`Total illustrations cached: ${cacheStats.total}`);
  for (const [theme, themeStats] of Object.entries(cacheStats.byTheme)) {
    console.log(`  ${theme}: ${themeStats.total} total`);
  }

  console.log('\n✓ Library generation complete!');
  console.log('\nThese illustrations are now cached and will be reused across all posts.');
}

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  theme: null,
  clear: args.includes('--clear')
};

// Check for --theme flag
const themeIndex = args.indexOf('--theme');
if (themeIndex !== -1 && args[themeIndex + 1]) {
  options.theme = args[themeIndex + 1];
}

// Run generator
generateLibrary(options).catch(error => {
  console.error('\n❌ Library generation failed:', error);
  process.exit(1);
});
