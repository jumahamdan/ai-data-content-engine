/**
 * Test script for DALL-E client
 *
 * Tests without making real API calls by default (DALLE_ENABLED=false)
 * To test with real API calls, run: DALLE_ENABLED=true node test-dalle-client.js
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { createDalleClient } = require('./dalle-client');

async function testDisabledClient() {
  console.log('\n=== Test 1: DALL-E Disabled Mode ===');

  const client = createDalleClient({ enabled: false });

  try {
    await client.generateImage('Test prompt');
    console.log('❌ Should have thrown DALLE_DISABLED error');
  } catch (error) {
    if (error.message === 'DALL-E_DISABLED') {
      console.log('✅ Correctly throws error when disabled');
    } else {
      console.log('❌ Wrong error:', error.message);
    }
  }
}

async function testMissingApiKey() {
  console.log('\n=== Test 2: Missing API Key ===');

  const client = createDalleClient({ apiKey: null, enabled: true });

  try {
    await client.generateImage('Test prompt');
    console.log('❌ Should have thrown API key error');
  } catch (error) {
    if (error.message.includes('API key not configured')) {
      console.log('✅ Correctly throws error when API key missing');
    } else {
      console.log('❌ Wrong error:', error.message);
    }
  }
}

async function testStatsTracking() {
  console.log('\n=== Test 3: Statistics Tracking ===');

  const client = createDalleClient({ enabled: false, verbose: false });
  client.resetStats();

  // Attempt a generation (will fail due to disabled)
  try {
    await client.generateImage('Test prompt');
  } catch (error) {
    // Expected
  }

  const stats = client.getStats();
  if (stats.totalCalls === 1 && stats.failedCalls === 1) {
    console.log('✅ Stats tracking works correctly');
    console.log('   Stats:', stats);
  } else {
    console.log('❌ Stats tracking failed:', stats);
  }
}

async function testConfiguration() {
  console.log('\n=== Test 4: Configuration ===');

  const client = createDalleClient({
    model: 'dall-e-3',
    quality: 'hd',
    size: '1792x1024'
  });

  if (client.model === 'dall-e-3' && client.quality === 'hd' && client.size === '1792x1024') {
    console.log('✅ Custom configuration applied correctly');
  } else {
    console.log('❌ Configuration failed');
  }
}

async function testRealApiCall() {
  console.log('\n=== Test 5: Real API Call (if DALLE_ENABLED=true) ===');

  const isEnabled = process.env.DALLE_ENABLED !== 'false';
  const hasApiKey = !!process.env.OPENAI_API_KEY;

  if (!isEnabled) {
    console.log('⏭️  Skipped (DALLE_ENABLED=false)');
    console.log('   To test real API calls, run: DALLE_ENABLED=true node test-dalle-client.js');
    return;
  }

  if (!hasApiKey) {
    console.log('⏭️  Skipped (OPENAI_API_KEY not set)');
    return;
  }

  const client = createDalleClient();
  const outputDir = path.join(__dirname, 'cache', 'test');

  try {
    // Create output directory
    const fs = require('fs').promises;
    await fs.mkdir(outputDir, { recursive: true });

    console.log('   Generating test image...');
    const result = await client.generateAndDownload(
      'A simple watercolor illustration of a coffee cup, minimal, soft colors, isolated on white background',
      path.join(outputDir, 'test-image.png')
    );

    console.log('✅ Real API call successful');
    console.log('   Image saved:', result.imagePath);
    console.log('   Latency:', result.latency + 'ms');
    console.log('   Revised prompt:', result.revisedPrompt.substring(0, 80) + '...');

    const stats = client.getStats();
    console.log('   Stats:', stats);
  } catch (error) {
    console.log('❌ Real API call failed:', error.message);
  }
}

async function runTests() {
  console.log('╔════════════════════════════════════════════════════╗');
  console.log('║   DALL-E Client Test Suite                        ║');
  console.log('╚════════════════════════════════════════════════════╝');

  await testDisabledClient();
  await testMissingApiKey();
  await testStatsTracking();
  await testConfiguration();
  await testRealApiCall();

  console.log('\n' + '='.repeat(54));
  console.log('Tests complete!');
  console.log('='.repeat(54) + '\n');
}

runTests().catch(error => {
  console.error('Test suite failed:', error);
  process.exit(1);
});
