/**
 * Test script to verify all WhatsApp approval system components.
 *
 * Checks:
 *  1. Twilio credentials valid
 *  2. Can send test message (skipped in --dry-run mode)
 *  3. Queue directory exists and is writable
 *  4. Webhook handler can start on test port
 *  5. Timeout checker initializes correctly
 *
 * Usage:
 *   node whatsapp/test-connection.js            # Full test (sends a message)
 *   node whatsapp/test-connection.js --dry-run   # Validate config only
 */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { validateEnv, createClient, sendToOwner } = require('./twilio-client');
const { PENDING_DIR } = require('./queue-manager');
const { startTimeoutChecker, stopTimeoutChecker } = require('./timeout-checker');

const DRY_RUN = process.argv.includes('--dry-run');

let passed = 0;
let failed = 0;

function pass(label) {
  console.log(`   ✓ ${label}`);
  passed++;
}

function fail(label, hint) {
  console.error(`   ✗ ${label}`);
  if (hint) console.error(`     Hint: ${hint}`);
  failed++;
}

async function main() {
  console.log('WhatsApp Approval System — Connection Test');
  console.log('='.repeat(50));
  if (DRY_RUN) console.log('  Mode: --dry-run (no messages will be sent)\n');

  // ── 1. Environment variables ──────────────────────
  console.log('\n1. Checking environment variables...');
  try {
    validateEnv();
    pass('All required variables set');
  } catch (error) {
    fail(error.message, 'Check automation/.env has TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM, WHATSAPP_TO');
  }

  // ── 2. Twilio credentials ────────────────────────
  console.log('\n2. Verifying Twilio credentials...');
  try {
    const client = createClient();
    const account = await client.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
    pass(`Account verified: ${account.friendlyName}`);
    pass(`Status: ${account.status}`);
  } catch (error) {
    fail(`Credential check failed: ${error.message}`, 'Verify TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env');
  }

  // ── 3. Send test message (skip in dry-run) ───────
  console.log('\n3. Sending test message...');
  if (DRY_RUN) {
    console.log('   — Skipped (dry-run mode)');
  } else {
    try {
      const message = await sendToOwner(
        '🔧 WhatsApp Connection Test\n\nIf you see this, your Twilio WhatsApp integration is working!'
      );
      pass(`Message sent (SID: ${message.sid})`);
      pass(`Status: ${message.status}`);
    } catch (error) {
      fail(`Send failed: ${error.message}`, 'Make sure you have joined the Twilio sandbox.');
    }
  }

  // ── 4. Queue directory ────────────────────────────
  console.log('\n4. Checking queue directory...');
  try {
    if (!fs.existsSync(PENDING_DIR)) {
      fs.mkdirSync(PENDING_DIR, { recursive: true });
      pass(`Queue directory created: ${PENDING_DIR}`);
    } else {
      pass(`Queue directory exists: ${PENDING_DIR}`);
    }

    // Test writability
    const testFile = path.join(PENDING_DIR, '.write-test');
    fs.writeFileSync(testFile, 'test', 'utf8');
    fs.unlinkSync(testFile);
    pass('Queue directory is writable');
  } catch (error) {
    fail(`Queue directory issue: ${error.message}`, 'Check filesystem permissions on automation/pending-posts/');
  }

  // ── 5. Webhook handler ────────────────────────────
  console.log('\n5. Checking webhook handler...');
  try {
    const { app } = require('./webhook-handler');
    const TEST_PORT = 19876; // Ephemeral port unlikely to conflict
    const server = await new Promise((resolve, reject) => {
      const s = app.listen(TEST_PORT, () => resolve(s));
      s.on('error', reject);
    });

    pass(`Webhook handler started on test port ${TEST_PORT}`);

    // Hit the /health endpoint
    const health = await new Promise((resolve, reject) => {
      http.get(`http://localhost:${TEST_PORT}/health`, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try { resolve(JSON.parse(data)); }
          catch (e) { reject(new Error('Invalid health response')); }
        });
      }).on('error', reject);
    });

    if (health.status === 'ok') {
      pass(`Health endpoint responds: status=${health.status}, pending=${health.pendingPosts}`);
    } else {
      fail('Health endpoint returned unexpected status');
    }

    server.close();
    pass('Webhook handler shut down cleanly');
  } catch (error) {
    fail(`Webhook handler error: ${error.message}`, 'Check that express is installed and webhook-handler.js has no syntax errors.');
  }

  // ── 6. Timeout checker ────────────────────────────
  console.log('\n6. Checking timeout checker...');
  try {
    const handle = startTimeoutChecker(999999); // Very long interval so it doesn't fire
    if (handle) {
      pass('Timeout checker started successfully');
    } else {
      fail('Timeout checker returned null handle');
    }
    stopTimeoutChecker();
    pass('Timeout checker stopped cleanly');
  } catch (error) {
    fail(`Timeout checker error: ${error.message}`, 'Check timeout-checker.js and its dependencies.');
  }

  // ── Summary ───────────────────────────────────────
  console.log('\n' + '='.repeat(50));
  console.log(`Results: ${passed} passed, ${failed} failed`);
  if (failed === 0) {
    console.log('All checks passed!');
  } else {
    console.log('Some checks failed — review hints above.');
    process.exit(1);
  }
}

main();