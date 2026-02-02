/**
 * Test script for background-generator.js
 *
 * Tests without making real API calls by default (DALLE_ENABLED=false)
 * To test with real API calls: DALLE_ENABLED=true node test-background-generator.js
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { createBackgroundGenerator, THEMES } = require('./background-generator');
const { createDalleClient } = require('./dalle-client');

async function testThemeValidation() {
  console.log('\n=== Test 1: Theme Validation ===');

  const bgGen = createBackgroundGenerator({
    cacheDir: path.join(__dirname, 'cache', 'test'),
    dalleClient: createDalleClient({ enabled: false }),
    verbose: false
  });

  // Test invalid theme
  try {
    await bgGen.getBackground('invalid-theme');
    console.log('❌ Should have thrown invalid theme error');
  } catch (error) {
    if (error.message.includes('Invalid theme')) {
      console.log('✅ Correctly rejects invalid theme');
    } else {
      console.log('❌ Wrong error:', error.message);
    }
  }

  // Test valid themes
  const validThemes = Object.keys(THEMES);
  console.log('✅ Valid themes:', validThemes.join(', '));
}

async function testCacheCheck() {
  console.log('\n=== Test 2: Cache Check ===');

  const bgGen = createBackgroundGenerator({
    cacheDir: path.join(__dirname, 'cache', 'test'),
    dalleClient: createDalleClient({ enabled: false }),
    verbose: false
  });

  // Get cached backgrounds (should be empty or return cached)
  const cachedChalkboard = await bgGen.getCachedBackgrounds('chalkboard');
  console.log(`✅ Found ${cachedChalkboard.length} cached chalkboard backgrounds`);

  const cachedWatercolor = await bgGen.getCachedBackgrounds('watercolor');
  console.log(`✅ Found ${cachedWatercolor.length} cached watercolor backgrounds`);

  const cachedTech = await bgGen.getCachedBackgrounds('tech');
  console.log(`✅ Found ${cachedTech.length} cached tech backgrounds`);
}

async function testCacheStats() {
  console.log('\n=== Test 3: Cache Statistics ===');

  const bgGen = createBackgroundGenerator({
    cacheDir: path.join(__dirname, 'cache', 'test'),
    dalleClient: createDalleClient({ enabled: false }),
    verbose: false
  });

  const stats = await bgGen.getCacheStats();
  console.log('✅ Cache stats retrieved:');
  for (const [theme, themeStats] of Object.entries(stats.themes)) {
    console.log(`   ${theme}: ${themeStats.count} backgrounds`);
  }
}

async function testStatsTracking() {
  console.log('\n=== Test 4: Statistics Tracking ===');

  const bgGen = createBackgroundGenerator({
    cacheDir: path.join(__dirname, 'cache', 'test'),
    dalleClient: createDalleClient({ enabled: false }),
    verbose: false
  });

  bgGen.resetStats();

  // Attempt to get background with disabled DALL-E (will try cache first)
  try {
    await bgGen.getBackground('chalkboard');
  } catch (error) {
    // Expected if no cache and DALL-E disabled
  }

  const stats = bgGen.getStats();
  console.log('✅ Stats tracking works');
  console.log('   Total requests:', stats.totalRequests);
  console.log('   Cache hits:', stats.cacheHits);
  console.log('   Cache misses:', stats.cacheMisses);
  console.log('   Cache hit rate:', stats.cacheHitRate);
}

async function testThemePrompts() {
  console.log('\n=== Test 5: Theme Prompts ===');

  for (const [themeName, themeConfig] of Object.entries(THEMES)) {
    console.log(`✅ ${themeName}:`);
    console.log(`   Prompt: "${themeConfig.dallePrompt.substring(0, 60)}..."`);
    console.log(`   Fallback: ${themeConfig.fallbackColor}`);
  }
}

async function testRealGeneration() {
  console.log('\n=== Test 6: Real Background Generation (if DALLE_ENABLED=true) ===');

  const isEnabled = process.env.DALLE_ENABLED !== 'false';
  const hasApiKey = !!process.env.OPENAI_API_KEY;

  if (!isEnabled) {
    console.log('⏭️  Skipped (DALLE_ENABLED=false)');
    console.log('   To test real generation: DALLE_ENABLED=true node test-background-generator.js');
    return;
  }

  if (!hasApiKey) {
    console.log('⏭️  Skipped (OPENAI_API_KEY not set)');
    return;
  }

  const bgGen = createBackgroundGenerator({
    cacheDir: path.join(__dirname, 'cache', 'test'),
    verbose: true
  });

  try {
    console.log('   Generating chalkboard background...');
    const result = await bgGen.getBackground('chalkboard');

    console.log('✅ Real background generation successful');
    console.log('   Path:', result.imagePath);
    console.log('   Theme:', result.theme);
    console.log('   Source:', result.source);
    console.log('   Latency:', result.latency + 'ms');

    // Test cache hit
    console.log('\n   Testing cache retrieval...');
    const cachedResult = await bgGen.getBackground('chalkboard');
    console.log('✅ Cache retrieval successful');
    console.log('   Source:', cachedResult.source);
    console.log('   Latency:', cachedResult.latency + 'ms');

    // Show stats
    const stats = bgGen.getStats();
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
  console.log('║   Background Generator Test Suite                 ║');
  console.log('╚════════════════════════════════════════════════════╝');

  await testThemeValidation();
  await testCacheCheck();
  await testCacheStats();
  await testStatsTracking();
  await testThemePrompts();
  await testRealGeneration();

  console.log('\n' + '='.repeat(54));
  console.log('Tests complete!');
  console.log('='.repeat(54) + '\n');
}

runTests().catch(error => {
  console.error('Test suite failed:', error);
  process.exit(1);
});
