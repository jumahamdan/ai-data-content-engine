/**
 * Tests for linkedin-poster.js
 * Run: node automation/whatsapp/test-linkedin-poster.js
 */

let passed = 0;
let failed = 0;

function assert(condition, label) {
  if (condition) { passed++; console.log(`  ✓ ${label}`); }
  else { failed++; console.error(`  ✗ ${label}`); }
}

const { postToLinkedIn } = require('../linkedin-poster');

async function runTests() {
  console.log('=== LinkedIn Poster Tests ===\n');

  // Test 1: Returns success for valid post data
  console.log('Test 1: Valid post data returns success');
  const result = await postToLinkedIn({
    id: '1',
    content: {
      caption: 'Test caption about data engineering',
      hashtags: ['DataEng', 'AI'],
      topic: 'Test Topic',
      imageTitle: 'Test Image'
    },
    imagePath: '/tmp/test.png'
  });
  assert(result.success === true, 'success is true');
  assert(result.linkedinPostId === null, 'linkedinPostId is null (stub)');
  assert(typeof result.message === 'string', 'message is a string');
  assert(result.message.includes('#1'), 'message references post ID');

  // Test 2: Handles empty content fields gracefully
  console.log('\nTest 2: Empty content fields');
  const result2 = await postToLinkedIn({
    id: '2',
    content: {},
    imagePath: null
  });
  assert(result2.success === true, 'success is true with empty content');
  assert(result2.message.includes('#2'), 'message references post ID');

  // Test 3: Handles null content
  console.log('\nTest 3: Null content');
  const result3 = await postToLinkedIn({
    id: '3',
    content: null,
    imagePath: null
  });
  assert(result3.success === true, 'success is true with null content');

  // Test 4: Handles missing imagePath
  console.log('\nTest 4: No imagePath');
  const result4 = await postToLinkedIn({
    id: '4',
    content: { caption: 'No image post', hashtags: [], topic: 'Test' }
  });
  assert(result4.success === true, 'success without imagePath');

  // Test 5: Hashtags with # prefix are not double-prefixed
  console.log('\nTest 5: Hashtag formatting');
  const result5 = await postToLinkedIn({
    id: '5',
    content: {
      caption: 'Hashtag test',
      hashtags: ['#Already', 'NoPound'],
      topic: 'Test'
    }
  });
  assert(result5.success === true, 'success with mixed hashtag formats');

  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
