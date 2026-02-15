/**
 * Gemini Image Generation - Integration Test Suite
 *
 * Tests the full Gemini image pipeline: provider routing, client creation,
 * background generation, and fallback behavior.
 *
 * Tests 1-5 work offline (no API keys needed).
 * Test 6 requires GEMINI_API_KEY for live generation.
 *
 * Usage:
 *   node test-gemini-images.js              # Offline tests only
 *   GEMINI_API_KEY=xxx node test-gemini-images.js  # All tests including live
 *
 * Phase 3: Configuration + Testing
 */

const path = require('path');
const fs = require('fs').promises;
require('dotenv').config({ path: path.join(__dirname, '.env') });

const {
  getImageProviderConfig,
  resolveProviders,
  createProviderClient
} = require('./hybrid-image-generator/provider-factory');
const { createGeminiClient } = require('./hybrid-image-generator/gemini-client');
const { createBackgroundGenerator } = require('./hybrid-image-generator/background-generator');

/**
 * Test 1: Provider Factory - Config Validation
 */
async function testProviderConfigValidation() {
  console.log('\n' + '-'.repeat(60));
  console.log('[Gemini Integration Test] Test 1: Provider Factory - Config Validation');
  console.log('-'.repeat(60));

  const originalProvider = process.env.IMAGE_PROVIDER;
  let passed = true;

  try {
    // Test 1.1: 'gemini' provider
    process.env.IMAGE_PROVIDER = 'gemini';
    const geminiConfig = getImageProviderConfig();
    if (geminiConfig.provider !== 'gemini') {
      console.log('[Gemini Integration Test] ✗ FAIL: Expected provider=gemini, got', geminiConfig.provider);
      passed = false;
    } else {
      console.log('[Gemini Integration Test] ✓ IMAGE_PROVIDER=gemini validated');
    }

    // Test 1.2: 'dalle' provider
    process.env.IMAGE_PROVIDER = 'dalle';
    const dalleConfig = getImageProviderConfig();
    if (dalleConfig.provider !== 'dalle') {
      console.log('[Gemini Integration Test] ✗ FAIL: Expected provider=dalle, got', dalleConfig.provider);
      passed = false;
    } else {
      console.log('[Gemini Integration Test] ✓ IMAGE_PROVIDER=dalle validated');
    }

    // Test 1.3: 'auto' provider
    process.env.IMAGE_PROVIDER = 'auto';
    const autoConfig = getImageProviderConfig();
    if (autoConfig.provider !== 'auto') {
      console.log('[Gemini Integration Test] ✗ FAIL: Expected provider=auto, got', autoConfig.provider);
      passed = false;
    } else {
      console.log('[Gemini Integration Test] ✓ IMAGE_PROVIDER=auto validated');
    }

    // Test 1.4: 'none' provider
    process.env.IMAGE_PROVIDER = 'none';
    const noneConfig = getImageProviderConfig();
    if (noneConfig.provider !== 'none') {
      console.log('[Gemini Integration Test] ✗ FAIL: Expected provider=none, got', noneConfig.provider);
      passed = false;
    } else {
      console.log('[Gemini Integration Test] ✓ IMAGE_PROVIDER=none validated');
    }

    // Test 1.5: Invalid provider should throw
    process.env.IMAGE_PROVIDER = 'invalid';
    try {
      getImageProviderConfig();
      console.log('[Gemini Integration Test] ✗ FAIL: Should have thrown error for invalid provider');
      passed = false;
    } catch (error) {
      if (error.message.includes('Invalid IMAGE_PROVIDER')) {
        console.log('[Gemini Integration Test] ✓ Invalid provider correctly rejected');
      } else {
        console.log('[Gemini Integration Test] ✗ FAIL: Wrong error message:', error.message);
        passed = false;
      }
    }

    if (passed) {
      console.log('[Gemini Integration Test] ✓ PASS: Config validation works correctly');
    } else {
      console.log('[Gemini Integration Test] ✗ FAIL: Some config validations failed');
    }
  } finally {
    // Restore original value
    if (originalProvider !== undefined) {
      process.env.IMAGE_PROVIDER = originalProvider;
    } else {
      delete process.env.IMAGE_PROVIDER;
    }
  }

  return passed;
}

/**
 * Test 2: Provider Factory - Resolution Logic
 */
async function testProviderResolution() {
  console.log('\n' + '-'.repeat(60));
  console.log('[Gemini Integration Test] Test 2: Provider Factory - Resolution Logic');
  console.log('-'.repeat(60));

  let passed = true;
  const originalGeminiKey = process.env.GEMINI_API_KEY;
  const originalOpenAIKey = process.env.OPENAI_API_KEY;

  try {
    // Test 2.1: 'gemini' resolves to primary=gemini, fallback=dalle
    const geminiResult = resolveProviders('gemini');
    if (geminiResult.primary !== 'gemini' || geminiResult.fallback !== 'dalle') {
      console.log('[Gemini Integration Test] ✗ FAIL: gemini resolution incorrect:', geminiResult);
      passed = false;
    } else {
      console.log('[Gemini Integration Test] ✓ gemini -> primary=gemini, fallback=dalle');
    }

    // Test 2.2: 'dalle' resolves to primary=dalle, fallback=gemini
    const dalleResult = resolveProviders('dalle');
    if (dalleResult.primary !== 'dalle' || dalleResult.fallback !== 'gemini') {
      console.log('[Gemini Integration Test] ✗ FAIL: dalle resolution incorrect:', dalleResult);
      passed = false;
    } else {
      console.log('[Gemini Integration Test] ✓ dalle -> primary=dalle, fallback=gemini');
    }

    // Test 2.3: 'none' resolves to null/null
    const noneResult = resolveProviders('none');
    if (noneResult.primary !== null || noneResult.fallback !== null) {
      console.log('[Gemini Integration Test] ✗ FAIL: none resolution incorrect:', noneResult);
      passed = false;
    } else {
      console.log('[Gemini Integration Test] ✓ none -> primary=null, fallback=null');
    }

    // Test 2.4: 'auto' with both keys -> primary should be gemini (cheaper)
    process.env.GEMINI_API_KEY = 'test-gemini-key';
    process.env.OPENAI_API_KEY = 'test-openai-key';
    const autoBothResult = resolveProviders('auto');
    if (autoBothResult.primary !== 'gemini' || autoBothResult.fallback !== 'dalle') {
      console.log('[Gemini Integration Test] ✗ FAIL: auto with both keys should prefer gemini:', autoBothResult);
      passed = false;
    } else {
      console.log('[Gemini Integration Test] ✓ auto (both keys) -> primary=gemini');
    }

    // Test 2.5: 'auto' with only OPENAI_API_KEY
    delete process.env.GEMINI_API_KEY;
    const autoOpenAIResult = resolveProviders('auto');
    if (autoOpenAIResult.primary !== 'dalle' || autoOpenAIResult.fallback !== 'gemini') {
      console.log(
        '[Gemini Integration Test] ✗ FAIL: auto with only OPENAI_API_KEY should use dalle:',
        autoOpenAIResult
      );
      passed = false;
    } else {
      console.log('[Gemini Integration Test] ✓ auto (only OPENAI_API_KEY) -> primary=dalle');
    }

    // Test 2.6: 'auto' with no keys
    delete process.env.OPENAI_API_KEY;
    const autoNoKeysResult = resolveProviders('auto');
    if (autoNoKeysResult.primary !== null || autoNoKeysResult.fallback !== null) {
      console.log('[Gemini Integration Test] ✗ FAIL: auto with no keys should be null/null:', autoNoKeysResult);
      passed = false;
    } else {
      console.log('[Gemini Integration Test] ✓ auto (no keys) -> primary=null, fallback=null');
    }

    if (passed) {
      console.log('[Gemini Integration Test] ✓ PASS: Provider resolution works correctly');
    } else {
      console.log('[Gemini Integration Test] ✗ FAIL: Some resolution tests failed');
    }
  } finally {
    // Restore original env vars
    if (originalGeminiKey !== undefined) {
      process.env.GEMINI_API_KEY = originalGeminiKey;
    } else {
      delete process.env.GEMINI_API_KEY;
    }
    if (originalOpenAIKey !== undefined) {
      process.env.OPENAI_API_KEY = originalOpenAIKey;
    } else {
      delete process.env.OPENAI_API_KEY;
    }
  }

  return passed;
}

/**
 * Test 3: Provider Client Creation
 */
async function testProviderClientCreation() {
  console.log('\n' + '-'.repeat(60));
  console.log('[Gemini Integration Test] Test 3: Provider Client Creation');
  console.log('-'.repeat(60));

  let passed = true;

  try {
    // Test 3.1: Create Gemini client
    const geminiClient = createProviderClient('gemini');
    if (!geminiClient || typeof geminiClient.generateImage !== 'function') {
      console.log('[Gemini Integration Test] ✗ FAIL: Gemini client missing generateImage method');
      passed = false;
    } else {
      console.log('[Gemini Integration Test] ✓ createProviderClient(gemini) returns valid client');
    }

    // Test 3.2: Create DALL-E client
    const dalleClient = createProviderClient('dalle');
    if (!dalleClient || typeof dalleClient.generateImage !== 'function') {
      console.log('[Gemini Integration Test] ✗ FAIL: DALL-E client missing generateImage method');
      passed = false;
    } else {
      console.log('[Gemini Integration Test] ✓ createProviderClient(dalle) returns valid client');
    }

    // Test 3.3: Create null provider
    const nullClient = createProviderClient(null);
    if (nullClient !== null) {
      console.log('[Gemini Integration Test] ✗ FAIL: createProviderClient(null) should return null');
      passed = false;
    } else {
      console.log('[Gemini Integration Test] ✓ createProviderClient(null) returns null');
    }

    // Test 3.4: Unknown provider should throw
    try {
      createProviderClient('unknown');
      console.log('[Gemini Integration Test] ✗ FAIL: Should have thrown error for unknown provider');
      passed = false;
    } catch (error) {
      if (error.message.includes('Unknown provider')) {
        console.log('[Gemini Integration Test] ✓ Unknown provider correctly throws error');
      } else {
        console.log('[Gemini Integration Test] ✗ FAIL: Wrong error message:', error.message);
        passed = false;
      }
    }

    if (passed) {
      console.log('[Gemini Integration Test] ✓ PASS: Client creation works correctly');
    } else {
      console.log('[Gemini Integration Test] ✗ FAIL: Some client creation tests failed');
    }
  } catch (error) {
    console.log('[Gemini Integration Test] ✗ FAIL: Unexpected error:', error.message);
    passed = false;
  }

  return passed;
}

/**
 * Test 4: Gemini Client Offline Validation
 */
async function testGeminiClientOffline() {
  console.log('\n' + '-'.repeat(60));
  console.log('[Gemini Integration Test] Test 4: Gemini Client Offline Validation');
  console.log('-'.repeat(60));

  let passed = true;

  try {
    // Test 4.1: Disabled client
    const disabledClient = createGeminiClient({ enabled: false });
    console.log('[Gemini Integration Test] Created disabled Gemini client');

    try {
      await disabledClient.generateImage('test prompt');
      console.log('[Gemini Integration Test] ✗ FAIL: Should have thrown GEMINI_DISABLED error');
      passed = false;
    } catch (error) {
      if (error.message === 'GEMINI_DISABLED') {
        console.log('[Gemini Integration Test] ✓ Disabled client correctly throws GEMINI_DISABLED');
      } else {
        console.log('[Gemini Integration Test] ✗ FAIL: Wrong error message:', error.message);
        passed = false;
      }
    }

    // Test 4.2: Client with null API key
    const originalKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    try {
      const noKeyClient = createGeminiClient({ enabled: true });
      console.log('[Gemini Integration Test] Created client with null API key');

      try {
        await noKeyClient.generateImage('test prompt');
        console.log('[Gemini Integration Test] ✗ FAIL: Should have thrown API key error');
        passed = false;
      } catch (error) {
        if (error.message === 'Gemini API key not configured') {
          console.log('[Gemini Integration Test] ✓ Missing API key correctly throws error');
        } else {
          console.log('[Gemini Integration Test] ✗ FAIL: Wrong error message:', error.message);
          passed = false;
        }
      }
    } finally {
      // Restore original key
      if (originalKey !== undefined) {
        process.env.GEMINI_API_KEY = originalKey;
      }
    }

    if (passed) {
      console.log('[Gemini Integration Test] ✓ PASS: Gemini client offline validation works correctly');
    } else {
      console.log('[Gemini Integration Test] ✗ FAIL: Some offline validation tests failed');
    }
  } catch (error) {
    console.log('[Gemini Integration Test] ✗ FAIL: Unexpected error:', error.message);
    passed = false;
  }

  return passed;
}

/**
 * Test 5: Background Generator Provider Routing
 */
async function testBackgroundGeneratorRouting() {
  console.log('\n' + '-'.repeat(60));
  console.log('[Gemini Integration Test] Test 5: Background Generator Provider Routing');
  console.log('-'.repeat(60));

  const originalProvider = process.env.IMAGE_PROVIDER;
  let passed = true;

  try {
    // Set provider to 'none' to short-circuit image generation
    process.env.IMAGE_PROVIDER = 'none';

    const bgGen = createBackgroundGenerator({
      cacheDir: path.join(__dirname, 'hybrid-image-generator', 'cache', 'test'),
      verbose: false
    });

    console.log('[Gemini Integration Test] Created BackgroundGenerator with IMAGE_PROVIDER=none');

    const result = await bgGen.getBackground('chalkboard');

    console.log('[Gemini Integration Test] getBackground result:', JSON.stringify(result));

    if (result.success === false) {
      console.log('[Gemini Integration Test] ✓ PASS: IMAGE_PROVIDER=none short-circuits correctly');
    } else {
      console.log('[Gemini Integration Test] ✗ FAIL: Expected success=false, got:', result);
      passed = false;
    }
  } catch (error) {
    console.log('[Gemini Integration Test] ✗ FAIL: Unexpected error:', error.message);
    passed = false;
  } finally {
    // Restore original provider
    if (originalProvider !== undefined) {
      process.env.IMAGE_PROVIDER = originalProvider;
    } else {
      delete process.env.IMAGE_PROVIDER;
    }
  }

  return passed;
}

/**
 * Test 6: Live Gemini Image Generation (conditional)
 */
async function testLiveGeminiGeneration() {
  console.log('\n' + '-'.repeat(60));
  console.log('[Gemini Integration Test] Test 6: Live Gemini Image Generation (conditional)');
  console.log('-'.repeat(60));

  if (!process.env.GEMINI_API_KEY) {
    console.log('[Gemini Integration Test] SKIP: GEMINI_API_KEY not set -- set in automation/.env for live test');
    return 'skipped';
  }

  const originalProvider = process.env.IMAGE_PROVIDER;
  let passed = true;

  try {
    // Set provider to 'gemini'
    process.env.IMAGE_PROVIDER = 'gemini';

    // Test 6.1: Background generation with Gemini
    console.log('[Gemini Integration Test] Testing background generation with Gemini...');
    const bgGen = createBackgroundGenerator({
      cacheDir: path.join(__dirname, 'hybrid-image-generator', 'cache', 'test'),
      verbose: true
    });

    const bgResult = await bgGen.getBackground('chalkboard');

    console.log('[Gemini Integration Test] Background generation complete');
    console.log('[Gemini Integration Test]   Success:', bgResult.success);
    console.log('[Gemini Integration Test]   Source:', bgResult.source);
    console.log('[Gemini Integration Test]   Provider:', bgResult.provider);
    console.log('[Gemini Integration Test]   Theme:', bgResult.theme);
    console.log('[Gemini Integration Test]   Latency:', bgResult.latency + 'ms');

    if (bgResult.imagePath) {
      const bgStats = await fs.stat(bgResult.imagePath);
      const bgSizeKB = Math.round(bgStats.size / 1024);
      console.log('[Gemini Integration Test]   File size:', bgSizeKB + 'KB');

      if (bgStats.size === 0) {
        console.log('[Gemini Integration Test] ✗ FAIL: Background file is empty');
        passed = false;
      }
    } else {
      console.log('[Gemini Integration Test] ✗ FAIL: No imagePath returned');
      passed = false;
    }

    // Test 6.2: Direct Gemini client test
    console.log('[Gemini Integration Test] Testing direct Gemini client...');
    const directClient = createGeminiClient();
    const outputDir = path.join(__dirname, 'test-outputs');
    await fs.mkdir(outputDir, { recursive: true });
    const outputPath = path.join(outputDir, 'gemini-integration-' + Date.now() + '.png');

    const directResult = await directClient.generateAndSave(
      'A simple blue circle on a white background, minimal, clean',
      outputPath
    );

    console.log('[Gemini Integration Test] Direct generation complete');
    console.log('[Gemini Integration Test]   File path:', directResult.imagePath);
    console.log('[Gemini Integration Test]   Latency:', directResult.latency + 'ms');

    const directStats = await fs.stat(outputPath);
    const directSizeKB = Math.round(directStats.size / 1024);
    console.log('[Gemini Integration Test]   File size:', directSizeKB + 'KB');

    if (directStats.size === 0) {
      console.log('[Gemini Integration Test] ✗ FAIL: Direct generation file is empty');
      passed = false;
    }

    if (passed) {
      console.log('[Gemini Integration Test] ✓ PASS: Live Gemini generation successful');
    } else {
      console.log('[Gemini Integration Test] ✗ FAIL: Some live generation tests failed');
    }
  } catch (error) {
    console.log('[Gemini Integration Test] ✗ FAIL: Live generation failed:', error.message);
    if (error.status) {
      console.log('[Gemini Integration Test]   Error status:', error.status);
    }
    passed = false;
  } finally {
    // Restore original provider
    if (originalProvider !== undefined) {
      process.env.IMAGE_PROVIDER = originalProvider;
    } else {
      delete process.env.IMAGE_PROVIDER;
    }
  }

  return passed;
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   Gemini Image Generation - Integration Test Suite        ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  let passed = 0;
  let failed = 0;
  let skipped = 0;

  // Run tests
  const test1 = await testProviderConfigValidation();
  test1 ? passed++ : failed++;

  const test2 = await testProviderResolution();
  test2 ? passed++ : failed++;

  const test3 = await testProviderClientCreation();
  test3 ? passed++ : failed++;

  const test4 = await testGeminiClientOffline();
  test4 ? passed++ : failed++;

  const test5 = await testBackgroundGeneratorRouting();
  test5 ? passed++ : failed++;

  const test6 = await testLiveGeminiGeneration();
  if (test6 === 'skipped') {
    skipped++;
  } else {
    test6 ? passed++ : failed++;
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('[Gemini Integration Test] === Test Suite Complete ===');
  console.log('[Gemini Integration Test] Passed:', passed);
  console.log('[Gemini Integration Test] Failed:', failed);
  console.log('[Gemini Integration Test] Skipped:', skipped);
  console.log('='.repeat(60) + '\n');

  process.exit(failed > 0 ? 1 : 0);
}

// Run tests if called directly
if (require.main === module) {
  runTests().catch(error => {
    console.error('[Gemini Integration Test] Test suite failed:', error);
    process.exit(1);
  });
}

module.exports = { runTests };
