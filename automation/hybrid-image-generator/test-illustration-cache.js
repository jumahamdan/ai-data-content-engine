/**
 * Test script for illustration-cache.js
 *
 * Tests without making real API calls by default (DALLE_ENABLED=false)
 * To test with real API calls: DALLE_ENABLED=true node test-illustration-cache.js
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { createIllustrationCache, ILLUSTRATION_STYLES } = require('./illustration-cache');
const { createDalleClient } = require('./dalle-client');

async function testStylesAndCategories() {
  console.log('\n=== Test 1: Styles and Categories ===');

  console.log('✅ Available themes and categories:');
  for (const [theme, config] of Object.entries(ILLUSTRATION_STYLES)) {
    console.log(`\n   ${theme}:`);
    console.log(`   Base style: "${config.baseStyle}"`);
    console.log(`   Categories: ${Object.keys(config.categories).join(', ')}`);
  }
}

async function testInputValidation() {
  console.log('\n=== Test 2: Input Validation ===');

  const cache = createIllustrationCache({
    cacheDir: path.join(__dirname, 'cache', 'test-illustrations'),
    dalleClient: createDalleClient({ enabled: false }),
    verbose: false
  });

  // Test invalid theme
  try {
    await cache.getIllustration('test', 'invalid-theme', 'icon');
    console.log('❌ Should have thrown invalid theme error');
  } catch (error) {
    if (error.message.includes('Invalid theme')) {
      console.log('✅ Correctly rejects invalid theme');
    }
  }

  // Test invalid category
  try {
    await cache.getIllustration('test', 'chalkboard', 'invalid-category');
    console.log('❌ Should have thrown invalid category error');
  } catch (error) {
    if (error.message.includes('Invalid category')) {
      console.log('✅ Correctly rejects invalid category');
    }
  }

  // Test missing illustration
  try {
    await cache.getIllustration('nonexistent', 'watercolor', 'icon');
    console.log('❌ Should have thrown not found error');
  } catch (error) {
    if (error.message.includes('not found in cache')) {
      console.log('✅ Correctly throws error for missing illustration');
    }
  }
}

async function testListIllustrations() {
  console.log('\n=== Test 3: List Illustrations ===');

  const cache = createIllustrationCache({
    cacheDir: path.join(__dirname, 'cache', 'test-illustrations'),
    dalleClient: createDalleClient({ enabled: false }),
    verbose: false
  });

  // List all illustrations
  const all = await cache.listIllustrations();
  console.log(`✅ Found ${all.length} total illustrations in cache`);

  // List by theme
  const watercolor = await cache.listIllustrations('watercolor');
  console.log(`✅ Found ${watercolor.length} watercolor illustrations`);

  // List by theme and category
  const chalkboardIcons = await cache.listIllustrations('chalkboard', 'icon');
  console.log(`✅ Found ${chalkboardIcons.length} chalkboard icons`);
}

async function testCacheStats() {
  console.log('\n=== Test 4: Cache Statistics ===');

  const cache = createIllustrationCache({
    cacheDir: path.join(__dirname, 'cache', 'test-illustrations'),
    dalleClient: createDalleClient({ enabled: false }),
    verbose: false
  });

  const stats = await cache.getCacheStats();
  console.log('✅ Cache statistics:');
  console.log(`   Total: ${stats.total} illustrations`);
  for (const [theme, themeStats] of Object.entries(stats.byTheme)) {
    console.log(`   ${theme}: ${themeStats.total} total`);
    for (const [category, count] of Object.entries(themeStats.byCategory)) {
      if (count > 0) {
        console.log(`     - ${category}: ${count}`);
      }
    }
  }
}

async function testStatsTracking() {
  console.log('\n=== Test 5: Statistics Tracking ===');

  const cache = createIllustrationCache({
    cacheDir: path.join(__dirname, 'cache', 'test-illustrations'),
    dalleClient: createDalleClient({ enabled: false }),
    verbose: false
  });

  cache.resetStats();

  // Attempt to get non-existent illustration
  try {
    await cache.getIllustration('test', 'watercolor', 'icon');
  } catch (error) {
    // Expected
  }

  const stats = cache.getStats();
  console.log('✅ Stats tracking works');
  console.log('   Total requests:', stats.totalRequests);
  console.log('   Cache hits:', stats.cacheHits);
  console.log('   Cache misses:', stats.cacheMisses);
  console.log('   Generated:', stats.generated);
  console.log('   Cache hit rate:', stats.cacheHitRate);
}

async function testNameSanitization() {
  console.log('\n=== Test 6: Name Sanitization ===');

  const cache = createIllustrationCache({
    cacheDir: path.join(__dirname, 'cache', 'test-illustrations'),
    dalleClient: createDalleClient({ enabled: false }),
    verbose: false
  });

  // Test that names with spaces/special chars are sanitized
  const testName = 'Data Warehouse Building #1';
  const sanitized = cache._sanitizeName(testName);
  console.log(`✅ Name sanitization: "${testName}" → "${sanitized}"`);

  if (sanitized === 'data-warehouse-building-1') {
    console.log('✅ Sanitization works correctly');
  } else {
    console.log('❌ Unexpected sanitized name:', sanitized);
  }
}

async function testRealGeneration() {
  console.log('\n=== Test 7: Real Illustration Generation (if DALLE_ENABLED=true) ===');

  const isEnabled = process.env.DALLE_ENABLED !== 'false';
  const hasApiKey = !!process.env.OPENAI_API_KEY;

  if (!isEnabled) {
    console.log('⏭️  Skipped (DALLE_ENABLED=false)');
    console.log('   To test real generation: DALLE_ENABLED=true node test-illustration-cache.js');
    return;
  }

  if (!hasApiKey) {
    console.log('⏭️  Skipped (OPENAI_API_KEY not set)');
    return;
  }

  const cache = createIllustrationCache({
    cacheDir: path.join(__dirname, 'cache', 'test-illustrations'),
    verbose: true
  });

  try {
    console.log('   Generating test illustration...');
    const result = await cache.generateIllustration(
      'test-warehouse',
      'simple data warehouse building',
      {
        theme: 'watercolor',
        category: 'building',
        size: '1024x1024'
      }
    );

    console.log('✅ Real illustration generation successful');
    console.log('   Name:', result.metadata.name);
    console.log('   Theme:', result.metadata.theme);
    console.log('   Category:', result.metadata.category);
    console.log('   Path:', result.imagePath);
    console.log('   Source:', result.source);
    console.log('   Latency:', result.latency + 'ms');

    // Test cache retrieval
    console.log('\n   Testing cache retrieval...');
    const cached = await cache.getIllustration('test-warehouse', 'watercolor', 'building');
    console.log('✅ Cache retrieval successful');
    console.log('   Source:', cached.source);

    // Show stats
    const stats = cache.getStats();
    console.log('\n   Stats:');
    console.log('   Total requests:', stats.totalRequests);
    console.log('   Cache hits:', stats.cacheHits);
    console.log('   Generated:', stats.generated);
    console.log('   Cache hit rate:', stats.cacheHitRate);
  } catch (error) {
    console.log('❌ Real generation failed:', error.message);
  }
}

async function runTests() {
  console.log('╔════════════════════════════════════════════════════╗');
  console.log('║   Illustration Cache Test Suite                   ║');
  console.log('╚════════════════════════════════════════════════════╝');

  await testStylesAndCategories();
  await testInputValidation();
  await testListIllustrations();
  await testCacheStats();
  await testStatsTracking();
  await testNameSanitization();
  await testRealGeneration();

  console.log('\n' + '='.repeat(54));
  console.log('Tests complete!');
  console.log('='.repeat(54) + '\n');
}

runTests().catch(error => {
  console.error('Test suite failed:', error);
  process.exit(1);
});
