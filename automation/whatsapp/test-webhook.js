/**
 * Test script for webhook-handler.js
 * Tests the Express endpoint, command routing, and Twilio signature validation.
 * Does NOT require Twilio credentials — mocks the WhatsApp send functions.
 */

const http = require('http');
const querystring = require('querystring');
const twilio = require('twilio');

// Disable signature validation for command-routing tests (enabled in signature-specific tests)
process.env.WEBHOOK_VALIDATE_SIGNATURE = 'false';

let passed = 0;
let failed = 0;
const results = [];

function assert(condition, label) {
  if (condition) {
    passed++;
    results.push(`  ✓ ${label}`);
  } else {
    failed++;
    results.push(`  ✗ ${label}`);
  }
}

// ─── Mock Twilio and WhatsApp modules before requiring webhook-handler ───

// Track all messages sent via mocked functions
const sentMessages = [];

// Mock twilio-client
require.cache[require.resolve('./twilio-client')] = {
  id: require.resolve('./twilio-client'),
  filename: require.resolve('./twilio-client'),
  loaded: true,
  exports: {
    sendToOwner: async (body, mediaUrl) => {
      sentMessages.push({ body, mediaUrl });
      return { sid: 'MOCK_SID' };
    },
    sendMessage: async (to, body, mediaUrl) => {
      sentMessages.push({ to, body, mediaUrl });
      return { sid: 'MOCK_SID' };
    },
    validateEnv: () => {},
    createClient: () => ({})
  }
};

// Mock whatsapp/index.js (sendConfirmation, sendPendingList)
require.cache[require.resolve('./index')] = {
  id: require.resolve('./index'),
  filename: require.resolve('./index'),
  loaded: true,
  exports: {
    sendPreview: async (post, imageUrl) => {
      sentMessages.push({ type: 'preview', post, imageUrl });
      return { sid: 'MOCK_SID' };
    },
    sendConfirmation: async (postId, action) => {
      sentMessages.push({ type: 'confirmation', postId, action });
      return { sid: 'MOCK_SID' };
    },
    sendPendingList: async (posts) => {
      sentMessages.push({ type: 'pendingList', posts });
      return { sid: 'MOCK_SID' };
    }
  }
};

const { app } = require('./webhook-handler');
const queue = require('./queue-manager');

// ─── Test helpers ───

let server;
let baseUrl;

function startServer() {
  return new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      resolve();
    });
  });
}

function stopServer() {
  return new Promise((resolve) => {
    if (server) server.close(resolve);
    else resolve();
  });
}

/**
 * Send a simulated Twilio webhook POST request.
 * @param {string} body - Message body
 * @param {string} from - Sender number
 * @param {object} opts - Extra options
 * @param {object} opts.extraHeaders - Additional HTTP headers to include
 */
function sendWebhook(body, from = 'whatsapp:+15551234567', opts = {}) {
  return new Promise((resolve, reject) => {
    const params = { Body: body, From: from };
    const data = querystring.stringify(params);
    const url = new URL(process.env.WEBHOOK_PATH || '/whatsapp/incoming', baseUrl);

    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(data),
      ...(opts.extraHeaders || {})
    };

    const req = http.request(url, {
      method: 'POST',
      headers
    }, (res) => {
      let responseBody = '';
      res.on('data', chunk => responseBody += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: responseBody }));
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Small delay to let async handlers finish
function wait(ms = 100) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── Seed test data ───

function seedTestPosts() {
  // Clean any existing test posts
  const pending = queue.listPending();
  for (const p of pending) {
    queue.deletePost(p.id);
  }

  queue.addToQueue({
    id: '100',
    content: {
      caption: 'Test caption for post 100',
      hashtags: ['DataEngineering'],
      imageTitle: 'Test Topic 100',
      topic: 'Test Topic 100'
    }
  });

  queue.addToQueue({
    id: '101',
    content: {
      caption: 'Test caption for post 101',
      hashtags: ['AI'],
      imageTitle: 'Test Topic 101',
      topic: 'Test Topic 101'
    }
  });
}

// ─── Tests ───

async function runTests() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║   Webhook Handler Tests                ║');
  console.log('╚════════════════════════════════════════╝\n');

  await startServer();
  console.log(`Test server running on ${baseUrl}\n`);

  // ── Test 1: Endpoint responds with TwiML ──
  console.log('Test 1: POST endpoint returns TwiML response');
  sentMessages.length = 0;
  const res1 = await sendWebhook('list');
  assert(res1.status === 200, 'Returns 200 status');
  assert(res1.body.includes('<Response>'), 'Returns TwiML XML');
  await wait();

  // ── Test 2: Invalid command sends error ──
  console.log('\nTest 2: Invalid command sends error message');
  sentMessages.length = 0;
  await sendWebhook('foobar');
  await wait();
  assert(sentMessages.length > 0, 'Sends a response message');
  assert(sentMessages[0].body.includes('Unknown command'), 'Error mentions unknown command');

  // ── Test 3: Empty message sends error ──
  console.log('\nTest 3: Empty message sends error');
  sentMessages.length = 0;
  await sendWebhook('');
  await wait();
  assert(sentMessages.length > 0, 'Sends a response message');
  assert(sentMessages[0].body.includes('Empty message'), 'Error mentions empty message');

  // ── Test 4: List command ──
  console.log('\nTest 4: List command');
  seedTestPosts();
  sentMessages.length = 0;
  await sendWebhook('list');
  await wait();
  assert(sentMessages.length > 0, 'Sends a response');
  assert(sentMessages[0].type === 'pendingList', 'Calls sendPendingList');
  assert(sentMessages[0].posts.length === 2, 'Lists 2 pending posts');

  // ── Test 5: Approve command ──
  console.log('\nTest 5: Approve command (yes 100)');
  seedTestPosts();
  sentMessages.length = 0;
  await sendWebhook('yes 100');
  await wait();
  const post100 = queue.getPost('100');
  assert(post100.status === 'approved', 'Post #100 status updated to approved');
  assert(sentMessages.some(m => m.type === 'confirmation' && m.action === 'approved'), 'Sends approval confirmation');

  // ── Test 6: Reject command ──
  console.log('\nTest 6: Reject command (no 101)');
  sentMessages.length = 0;
  await sendWebhook('no 101');
  await wait();
  const post101 = queue.getPost('101');
  assert(post101.status === 'rejected', 'Post #101 status updated to rejected');
  assert(sentMessages.some(m => m.type === 'confirmation' && m.action === 'rejected'), 'Sends rejection confirmation');

  // ── Test 7: Approve non-existent post ──
  console.log('\nTest 7: Approve non-existent post');
  sentMessages.length = 0;
  await sendWebhook('yes 999');
  await wait();
  assert(sentMessages.length > 0, 'Sends a response');
  assert(sentMessages[0].body.includes('not found'), 'Reports post not found');

  // ── Test 8: Approve already-approved post ──
  console.log('\nTest 8: Approve already-approved post');
  sentMessages.length = 0;
  await sendWebhook('yes 100');
  await wait();
  assert(sentMessages.length > 0, 'Sends a response');
  assert(sentMessages[0].body.includes('already approved'), 'Reports already approved');

  // ── Test 9: Status command ──
  console.log('\nTest 9: Status command');
  seedTestPosts();
  sentMessages.length = 0;
  await sendWebhook('status');
  await wait();
  assert(sentMessages.length > 0, 'Sends a response');
  assert(sentMessages[0].body.includes('System Status'), 'Contains status header');
  assert(sentMessages[0].body.includes('Pending posts'), 'Contains pending count');

  // ── Test 10: Approve all ──
  console.log('\nTest 10: Approve all (yes all)');
  seedTestPosts();
  sentMessages.length = 0;
  await sendWebhook('yes all');
  await wait();
  const p100 = queue.getPost('100');
  const p101after = queue.getPost('101');
  assert(p100.status === 'approved', 'Post #100 approved');
  assert(p101after.status === 'approved', 'Post #101 approved');
  assert(sentMessages.some(m => m.body && m.body.includes('approved')), 'Sends batch approval message');

  // ── Test 11: Reject all ──
  console.log('\nTest 11: Reject all (no all)');
  seedTestPosts();
  sentMessages.length = 0;
  await sendWebhook('no all');
  await wait();
  const p100r = queue.getPost('100');
  const p101r = queue.getPost('101');
  assert(p100r.status === 'rejected', 'Post #100 rejected');
  assert(p101r.status === 'rejected', 'Post #101 rejected');
  assert(sentMessages.some(m => m.body && m.body.includes('rejected')), 'Sends batch rejection message');

  // ── Test 12: Approve all with no pending posts ──
  console.log('\nTest 12: Approve all with no pending posts');
  // Posts from test 11 are already rejected, so no pending
  sentMessages.length = 0;
  await sendWebhook('yes all');
  await wait();
  assert(sentMessages.some(m => m.body && m.body.includes('No pending')), 'Reports no pending posts');

  // ── Test 13: Case insensitivity ──
  console.log('\nTest 13: Case insensitivity');
  seedTestPosts();
  sentMessages.length = 0;
  await sendWebhook('YES 100');
  await wait();
  const p100case = queue.getPost('100');
  assert(p100case.status === 'approved', 'YES (uppercase) works');

  // ── Cleanup from command tests ──
  queue.deletePost('100');
  queue.deletePost('101');

  // ═══════════════════════════════════════════
  //  Signature Validation Tests
  // ═══════════════════════════════════════════
  console.log('\n── Signature Validation Tests ──');

  // Enable signature validation for these tests
  process.env.WEBHOOK_VALIDATE_SIGNATURE = 'true';
  const testAuthToken = 'test_auth_token_for_signature';
  process.env.TWILIO_AUTH_TOKEN = testAuthToken;

  const webhookPath = process.env.WEBHOOK_PATH || '/whatsapp/incoming';
  const webhookUrl = `${baseUrl}${webhookPath}`;

  // ── Test 14: Reject request with no signature header ──
  console.log('\nTest 14: Reject request with no X-Twilio-Signature header');
  sentMessages.length = 0;
  const res14 = await sendWebhook('list');
  assert(res14.status === 403, 'Returns 403 status');
  assert(res14.body.includes('<Response>'), 'Returns TwiML even on rejection');
  await wait();

  // ── Test 15: Reject request with invalid signature ──
  console.log('\nTest 15: Reject request with invalid signature');
  sentMessages.length = 0;
  const res15 = await sendWebhook('list', 'whatsapp:+15551234567', {
    extraHeaders: { 'X-Twilio-Signature': 'invalid_signature_value' }
  });
  assert(res15.status === 403, 'Returns 403 for invalid signature');
  await wait();

  // ── Test 16: Accept request with valid Twilio signature ──
  console.log('\nTest 16: Accept request with valid Twilio signature');
  sentMessages.length = 0;
  const validParams = { Body: 'status', From: 'whatsapp:+15551234567' };
  const validSignature = twilio.getExpectedTwilioSignature(testAuthToken, webhookUrl, validParams);
  const res16 = await sendWebhook('status', 'whatsapp:+15551234567', {
    extraHeaders: { 'X-Twilio-Signature': validSignature }
  });
  assert(res16.status === 200, 'Returns 200 for valid signature');
  assert(res16.body.includes('<Response>'), 'Returns TwiML response');
  await wait();
  assert(sentMessages.length > 0, 'Command was processed after valid signature');

  // ── Test 17: Skip validation when WEBHOOK_VALIDATE_SIGNATURE=false ──
  console.log('\nTest 17: Skip validation when WEBHOOK_VALIDATE_SIGNATURE=false');
  process.env.WEBHOOK_VALIDATE_SIGNATURE = 'false';
  sentMessages.length = 0;
  const res17 = await sendWebhook('status');
  assert(res17.status === 200, 'Returns 200 with validation disabled');
  await wait();
  assert(sentMessages.length > 0, 'Command processed without signature');

  // ── Test 18: Reject when auth token is missing ──
  console.log('\nTest 18: Reject when TWILIO_AUTH_TOKEN is missing');
  process.env.WEBHOOK_VALIDATE_SIGNATURE = 'true';
  const savedToken = process.env.TWILIO_AUTH_TOKEN;
  delete process.env.TWILIO_AUTH_TOKEN;
  sentMessages.length = 0;
  const res18 = await sendWebhook('list', 'whatsapp:+15551234567', {
    extraHeaders: { 'X-Twilio-Signature': 'some_signature' }
  });
  assert(res18.status === 403, 'Returns 403 when auth token missing');
  process.env.TWILIO_AUTH_TOKEN = savedToken;
  await wait();

  // Restore validation disabled for any further tests
  process.env.WEBHOOK_VALIDATE_SIGNATURE = 'false';

  await stopServer();

  // ── Summary ──
  console.log('\n' + results.join('\n'));
  console.log(`\n${'═'.repeat(40)}`);
  console.log(`Results: ${passed} passed, ${failed} failed (${passed + failed} total)`);
  console.log('═'.repeat(40));

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(err => {
  console.error('Test runner error:', err);
  process.exit(1);
});
