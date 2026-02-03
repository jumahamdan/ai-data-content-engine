/**
 * Manual integration test for the LinkedIn poster stub.
 *
 * Creates a mock post object, calls postToLinkedIn(), and verifies it
 * returns the expected success response with a mock URN.
 * Displays logged output for visual verification.
 *
 * Run: node whatsapp/test-linkedin-poster.js
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { postToLinkedIn } = require('../linkedin-poster');

let passed = 0;
let failed = 0;

function assert(condition, label) {
  if (condition) { passed++; console.log(`  ✓ ${label}`); }
  else { failed++; console.error(`  ✗ ${label}`); }
}

async function main() {
  console.log('LinkedIn Poster — Manual Integration Test');
  console.log('='.repeat(50));

  // ── 1. Create mock post ───────────────────────────
  const mockPost = {
    id: '99',
    createdAt: new Date().toISOString(),
    status: 'approved',
    content: {
      caption: 'The Bronze-Silver-Gold pattern transformed how we think about data quality. Here is why Medallion Architecture matters for modern data teams...',
      hashtags: ['DataEngineering', 'MedallionArchitecture', 'DataLakehouse'],
      imageTitle: 'Medallion Architecture',
      imageBullets: [
        'Bronze: Raw ingestion layer',
        'Silver: Cleaned and conformed',
        'Gold: Business-ready aggregates'
      ],
      imageType: 'diagram',
      template: 'architecture',
      topic: 'Medallion Architecture'
    },
    imagePath: 'pending-posts/99-image.png'
  };

  console.log('\n1. Mock post created:');
  console.log(`   ID:       #${mockPost.id}`);
  console.log(`   Topic:    ${mockPost.content.topic}`);
  console.log(`   Caption:  ${mockPost.content.caption.substring(0, 60)}...`);
  console.log(`   Hashtags: ${mockPost.content.hashtags.join(', ')}`);
  console.log(`   Image:    ${mockPost.imagePath}`);

  // ── 2. Call postToLinkedIn (visual output below) ──
  console.log('\n2. Calling postToLinkedIn()...\n');
  let result;
  try {
    result = await postToLinkedIn(mockPost);
  } catch (error) {
    console.error(`  ✗ FAIL — postToLinkedIn threw: ${error.message}`);
    process.exit(1);
  }

  // ── 3. Verify response ────────────────────────────
  console.log('\n3. Verifying response...');
  assert(result.success === true, 'result.success is true');
  assert(typeof result.message === 'string' && result.message.length > 0, `result.message: "${result.message}"`);
  assert(result.linkedinPostId === null, 'result.linkedinPostId is null (stub — expected)');

  // ── 4. Edge cases ─────────────────────────────────
  console.log('\n4. Edge case: empty content fields...');
  const emptyResult = await postToLinkedIn({ id: '100', content: {}, imagePath: null });
  assert(emptyResult.success === true, 'success with empty content');
  assert(emptyResult.message.includes('#100'), 'message references post ID');

  console.log('\n5. Edge case: hashtags with mixed # prefixes...');
  const hashResult = await postToLinkedIn({
    id: '101',
    content: { caption: 'Test', hashtags: ['#Already', 'NoPound'], topic: 'Test' }
  });
  assert(hashResult.success === true, 'success with mixed hashtag formats');

  // ── Summary ───────────────────────────────────────
  console.log('\n' + '='.repeat(50));
  console.log(`Results: ${passed} passed, ${failed} failed`);
  if (failed === 0) {
    console.log('PASS — LinkedIn poster stub works correctly.');
  } else {
    console.log('FAIL — See errors above.');
    process.exit(1);
  }
}

main();
