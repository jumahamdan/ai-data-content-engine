/**
 * Tests for timeout-checker.js
 * Run: node automation/whatsapp/test-timeout-checker.js
 */

const fs = require('fs');
const path = require('path');

let passed = 0;
let failed = 0;
const results = [];
const sentMessages = [];

function assert(condition, label) {
  if (condition) {
    passed++;
    results.push(`  ✓ ${label}`);
  } else {
    failed++;
    results.push(`  ✗ ${label}`);
  }
}

// Mock twilio-client before requiring anything that uses it
require.cache[require.resolve('./twilio-client')] = {
  id: require.resolve('./twilio-client'),
  filename: require.resolve('./twilio-client'),
  loaded: true,
  exports: {
    sendToOwner: async (body, mediaUrl) => {
      sentMessages.push({ body, mediaUrl });
      return { sid: 'MOCK_SID' };
    },
    sendMessage: async () => ({ sid: 'MOCK_SID' }),
    validateEnv: () => {},
    createClient: () => ({})
  }
};

// Mock whatsapp/index.js
require.cache[require.resolve('./index')] = {
  id: require.resolve('./index'),
  filename: require.resolve('./index'),
  loaded: true,
  exports: {
    sendPreview: async () => ({ sid: 'MOCK_SID' }),
    sendConfirmation: async (postId, action) => {
      sentMessages.push({ type: 'confirmation', postId, action });
      return { sid: 'MOCK_SID' };
    },
    sendPendingList: async () => ({ sid: 'MOCK_SID' })
  }
};

const queue = require('./queue-manager');
const { checkTimeouts, startTimeoutChecker, stopTimeoutChecker, TIMEOUT_MS } = require('./timeout-checker');

function cleanup() {
  const files = fs.readdirSync(queue.PENDING_DIR).filter(f => f.endsWith('.json'));
  for (const file of files) {
    fs.unlinkSync(path.join(queue.PENDING_DIR, file));
  }
}

async function runTests() {
  console.log('=== Timeout Checker Tests ===\n');

  // ── Test 1: No pending posts ──
  console.log('Test 1: No pending posts');
  cleanup();
  sentMessages.length = 0;
  const count1 = await checkTimeouts();
  assert(count1 === 0, 'Returns 0 when no pending posts');
  assert(sentMessages.length === 0, 'No messages sent');

  // ── Test 2: Post within timeout window ──
  console.log('\nTest 2: Post within timeout window (30 min ago)');
  cleanup();
  queue.addToQueue({
    id: '200',
    content: { caption: 'Recent post', hashtags: [], imageTitle: 'Recent', topic: 'Recent' }
  });
  // Set notifiedAt to 30 minutes ago
  const postFile200 = path.join(queue.PENDING_DIR, '200.json');
  const data200 = JSON.parse(fs.readFileSync(postFile200, 'utf8'));
  data200.notifiedAt = new Date(Date.now() - 30 * 60 * 1000).toISOString();
  fs.writeFileSync(postFile200, JSON.stringify(data200, null, 2));

  sentMessages.length = 0;
  const count2 = await checkTimeouts();
  assert(count2 === 0, 'Returns 0 for recent post');
  assert(sentMessages.length === 0, 'No timeout notification sent');

  // ── Test 3: Post past timeout window ──
  console.log('\nTest 3: Post past timeout window (65 min ago)');
  cleanup();
  queue.addToQueue({
    id: '201',
    content: { caption: 'Old post', hashtags: [], imageTitle: 'Old', topic: 'Old' }
  });
  const postFile201 = path.join(queue.PENDING_DIR, '201.json');
  const data201 = JSON.parse(fs.readFileSync(postFile201, 'utf8'));
  data201.notifiedAt = new Date(Date.now() - 65 * 60 * 1000).toISOString();
  fs.writeFileSync(postFile201, JSON.stringify(data201, null, 2));

  sentMessages.length = 0;
  const count3 = await checkTimeouts();
  assert(count3 === 1, 'Returns 1 for timed-out post');
  assert(sentMessages.length === 1, 'Sends 1 timeout notification');
  assert(sentMessages[0].type === 'confirmation', 'Uses sendConfirmation');
  assert(sentMessages[0].action === 'timeout', 'Action is timeout');
  assert(sentMessages[0].postId === '201', 'Correct post ID');

  // Verify timeoutNotifiedAt was set
  const updated201 = JSON.parse(fs.readFileSync(postFile201, 'utf8'));
  assert(updated201.timeoutNotifiedAt !== null, 'timeoutNotifiedAt is set');

  // ── Test 4: Already-notified post is not re-notified ──
  console.log('\nTest 4: Already timeout-notified post (idempotency)');
  sentMessages.length = 0;
  const count4 = await checkTimeouts();
  assert(count4 === 0, 'Returns 0 (already notified)');
  assert(sentMessages.length === 0, 'No duplicate notification');

  // ── Test 5: Post with null notifiedAt is skipped ──
  console.log('\nTest 5: Post with null notifiedAt');
  cleanup();
  queue.addToQueue({
    id: '202',
    content: { caption: 'Never notified', hashtags: [], imageTitle: 'X', topic: 'X' }
  });
  // notifiedAt is null by default from addToQueue
  sentMessages.length = 0;
  const count5 = await checkTimeouts();
  assert(count5 === 0, 'Skips post with null notifiedAt');
  assert(sentMessages.length === 0, 'No messages sent');

  // ── Test 6: Multiple pending posts, mixed states ──
  console.log('\nTest 6: Multiple posts — only expired ones get notified');
  cleanup();

  // Post A: notified 65 min ago (should timeout)
  queue.addToQueue({ id: '300', content: { caption: 'A', hashtags: [], imageTitle: 'A', topic: 'A' } });
  const fileA = path.join(queue.PENDING_DIR, '300.json');
  const dataA = JSON.parse(fs.readFileSync(fileA, 'utf8'));
  dataA.notifiedAt = new Date(Date.now() - 65 * 60 * 1000).toISOString();
  fs.writeFileSync(fileA, JSON.stringify(dataA, null, 2));

  // Post B: notified 10 min ago (should NOT timeout)
  queue.addToQueue({ id: '301', content: { caption: 'B', hashtags: [], imageTitle: 'B', topic: 'B' } });
  const fileB = path.join(queue.PENDING_DIR, '301.json');
  const dataB = JSON.parse(fs.readFileSync(fileB, 'utf8'));
  dataB.notifiedAt = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  fs.writeFileSync(fileB, JSON.stringify(dataB, null, 2));

  // Post C: notified 120 min ago (should timeout)
  queue.addToQueue({ id: '302', content: { caption: 'C', hashtags: [], imageTitle: 'C', topic: 'C' } });
  const fileC = path.join(queue.PENDING_DIR, '302.json');
  const dataC = JSON.parse(fs.readFileSync(fileC, 'utf8'));
  dataC.notifiedAt = new Date(Date.now() - 120 * 60 * 1000).toISOString();
  fs.writeFileSync(fileC, JSON.stringify(dataC, null, 2));

  sentMessages.length = 0;
  const count6 = await checkTimeouts();
  assert(count6 === 2, 'Returns 2 (only expired posts)');
  assert(sentMessages.length === 2, 'Sends 2 timeout notifications');

  // ── Test 7: start/stop checker ──
  console.log('\nTest 7: Start and stop checker');
  cleanup();
  const handle = startTimeoutChecker(60000);
  assert(handle !== null, 'Returns interval handle');
  stopTimeoutChecker();

  // Starting again should work
  const handle2 = startTimeoutChecker(60000);
  assert(handle2 !== null, 'Can restart after stopping');
  stopTimeoutChecker();

  // ── Test 8: TIMEOUT_MS constant ──
  console.log('\nTest 8: Constants');
  assert(TIMEOUT_MS === 60 * 60 * 1000, 'TIMEOUT_MS is 60 minutes');

  cleanup();

  console.log('\n' + results.join('\n'));
  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(err => {
  console.error('Test runner error:', err);
  process.exit(1);
});
