/**
 * Gemini Client Test Suite
 *
 * Tests the GeminiClient module with both offline and live API tests.
 * Tests 1-4 work without an API key. Test 5 requires GEMINI_API_KEY.
 *
 * Phase 1: Gemini Client Module
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const fs = require('fs').promises;
const { createGeminiClient, GeminiClient } = require('./gemini-client');

/**
 * Main test suite runner
 * @returns {Promise<Object>} Test results {passed, failed, skipped}
 */
async function main() {
  console.log('='.repeat(60));
  console.log('[Gemini Test] === Gemini Client Test Suite ===');
  console.log('='.repeat(60));

  let passed = 0;
  let failed = 0;
  let skipped = 0;

  // Test 1: Module loading and factory creation
  console.log('\n' + '-'.repeat(40));
  console.log('[Gemini Test] Test 1: Module loading and factory creation');
  console.log('-'.repeat(40));

  try {
    const client = createGeminiClient();
    console.log('[Gemini Test] Client created via factory');
    console.log('[Gemini Test]   model:', client.model);
    console.log('[Gemini Test]   aspectRatio:', client.aspectRatio);
    console.log('[Gemini Test]   imageSize:', client.imageSize);
    console.log('[Gemini Test]   enabled:', client.enabled);
    console.log('[Gemini Test]   verbose:', client.verbose);

    if (
      typeof client.generateImage === 'function' &&
      typeof client.generateAndSave === 'function' &&
      typeof client.getStats === 'function'
    ) {
      console.log('[Gemini Test] ✓ PASS: Module loaded and factory works correctly');
      passed++;
    } else {
      console.log('[Gemini Test] ✗ FAIL: Missing expected methods');
      failed++;
    }
  } catch (error) {
    console.log('[Gemini Test] ✗ FAIL:', error.message);
    failed++;
  }

  // Test 2: Disabled client behavior
  console.log('\n' + '-'.repeat(40));
  console.log('[Gemini Test] Test 2: Disabled client behavior');
  console.log('-'.repeat(40));

  try {
    const client = new GeminiClient('test-key', { enabled: false });
    console.log('[Gemini Test] Created disabled client');

    try {
      await client.generateImage('test prompt');
      console.log('[Gemini Test] ✗ FAIL: Should have thrown GEMINI_DISABLED error');
      failed++;
    } catch (error) {
      if (error.message === 'GEMINI_DISABLED') {
        console.log('[Gemini Test] ✓ PASS: Correctly threw GEMINI_DISABLED error');
        passed++;
      } else {
        console.log('[Gemini Test] ✗ FAIL: Wrong error message:', error.message);
        failed++;
      }
    }
  } catch (error) {
    console.log('[Gemini Test] ✗ FAIL:', error.message);
    failed++;
  }

  // Test 3: Missing API key behavior
  console.log('\n' + '-'.repeat(40));
  console.log('[Gemini Test] Test 3: Missing API key behavior');
  console.log('-'.repeat(40));

  try {
    const client = new GeminiClient(null, { enabled: true });
    console.log('[Gemini Test] Created client with null API key');

    try {
      await client.generateImage('test prompt');
      console.log('[Gemini Test] ✗ FAIL: Should have thrown API key error');
      failed++;
    } catch (error) {
      if (error.message === 'Gemini API key not configured') {
        console.log('[Gemini Test] ✓ PASS: Correctly threw API key error');
        passed++;
      } else {
        console.log('[Gemini Test] ✗ FAIL: Wrong error message:', error.message);
        failed++;
      }
    }
  } catch (error) {
    console.log('[Gemini Test] ✗ FAIL:', error.message);
    failed++;
  }

  // Test 4: Statistics tracking
  console.log('\n' + '-'.repeat(40));
  console.log('[Gemini Test] Test 4: Statistics tracking');
  console.log('-'.repeat(40));

  try {
    const client = new GeminiClient('test-key', { enabled: false });
    console.log('[Gemini Test] Created client for stats testing');

    // Make a call that will fail (disabled)
    try {
      await client.generateImage('test prompt');
    } catch (error) {
      // Expected to fail
    }

    const stats = client.getStats();
    console.log('[Gemini Test] Stats after failed call:', JSON.stringify(stats));

    if (stats.totalCalls === 1 && stats.failedCalls === 1 && stats.successfulCalls === 0) {
      console.log('[Gemini Test] ✓ Stats correctly tracked failed call');

      // Test reset
      client.resetStats();
      const resetStats = client.getStats();
      console.log('[Gemini Test] Stats after reset:', JSON.stringify(resetStats));

      if (resetStats.totalCalls === 0 && resetStats.failedCalls === 0) {
        console.log('[Gemini Test] ✓ PASS: Statistics tracking and reset work correctly');
        passed++;
      } else {
        console.log('[Gemini Test] ✗ FAIL: Stats not properly reset');
        failed++;
      }
    } else {
      console.log('[Gemini Test] ✗ FAIL: Stats not correctly tracked');
      failed++;
    }
  } catch (error) {
    console.log('[Gemini Test] ✗ FAIL:', error.message);
    failed++;
  }

  // Test 5: Live API test (conditional)
  console.log('\n' + '-'.repeat(40));
  console.log('[Gemini Test] Test 5: Live API test (conditional)');
  console.log('-'.repeat(40));

  if (!process.env.GEMINI_API_KEY) {
    console.log('[Gemini Test] SKIP: GEMINI_API_KEY not configured -- set it in automation/.env to run live test');
    skipped++;
  } else {
    try {
      const client = createGeminiClient();
      console.log('[Gemini Test] Created client with real API key');
      console.log('[Gemini Test] Attempting live image generation...');

      const outputDir = path.join(__dirname, 'test-outputs');
      const outputPath = path.join(outputDir, 'gemini-test-' + Date.now() + '.png');

      const result = await client.generateAndSave(
        'A simple blue circle on a white background, minimal, clean',
        outputPath
      );

      console.log('[Gemini Test] Image generation complete');
      console.log('[Gemini Test]   File path:', result.imagePath);
      console.log('[Gemini Test]   Latency:', result.latency + 'ms');
      console.log('[Gemini Test]   MIME type:', result.mimeType);
      console.log('[Gemini Test]   Text response:', result.textResponse ? 'yes' : 'no');

      // Verify file exists and has content
      const fileStats = await fs.stat(outputPath);
      const fileSizeKB = Math.round(fileStats.size / 1024);
      console.log('[Gemini Test]   File size:', fileSizeKB + 'KB');

      if (fileStats.size > 0) {
        console.log('[Gemini Test] ✓ PASS: Live API test successful');
        passed++;
      } else {
        console.log('[Gemini Test] ✗ FAIL: Generated file is empty');
        failed++;
      }
    } catch (error) {
      console.log('[Gemini Test] ✗ FAIL: Live API test failed:', error.message);
      if (error.status) {
        console.log('[Gemini Test]   Error status:', error.status);
      }
      failed++;
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('[Gemini Test] === Test Suite Complete ===');
  console.log('[Gemini Test] Passed:', passed);
  console.log('[Gemini Test] Failed:', failed);
  console.log('[Gemini Test] Skipped:', skipped);
  console.log('='.repeat(60));

  return { passed, failed, skipped };
}

// Standalone runner
if (require.main === module) {
  main()
    .then(result => {
      console.log(
        '\n[Gemini Test] Done:',
        result.passed,
        'passed,',
        result.failed,
        'failed,',
        result.skipped,
        'skipped'
      );
      process.exit(result.failed > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('[Gemini Test] Test suite failed:', error.message);
      process.exit(1);
    });
}

module.exports = { main };
