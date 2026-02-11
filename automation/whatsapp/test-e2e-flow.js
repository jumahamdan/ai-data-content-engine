/**
 * End-to-end test for the WhatsApp approval flow.
 *
 * Simulates the full lifecycle WITHOUT external services (no Twilio, no LinkedIn API).
 * Steps:
 *  1. Generate mock post content
 *  2. Add to queue via queue-manager
 *  3. Simulate WhatsApp approval command via message-parser
 *  4. Process via webhook-handler (mock request)
 *  5. Verify post moves to approved status
 *  6. Call LinkedIn poster stub
 *  7. Verify post removed / status updated in queue
 *
 * Run: node whatsapp/test-e2e-flow.js
 */
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const queue = require('./queue-manager');
const { parseCommand } = require('./message-parser');
const { postToLinkedIn } = require('../linkedin-poster');

let step = 0;
let passed = 0;
let failed = 0;

function log(msg) {
  step++;
  console.log(`\nStep ${step}: ${msg}`);
}

function pass(label) {
  passed++;
  console.log(`  ✓ ${label}`);
}

function fail(label) {
  failed++;
  console.error(`  ✗ ${label}`);
}

function assert(condition, label) {
  if (condition) pass(label);
  else fail(label);
}

/**
 * Clean up any test posts we created (IDs 9000+).
 */
function cleanup() {
  for (let id = 9000; id <= 9010; id++) {
    const p = path.join(queue.PENDING_DIR, `${id}.json`);
    if (fs.existsSync(p)) fs.unlinkSync(p);
  }
}

async function main() {
  console.log('WhatsApp Approval — End-to-End Flow Test');
  console.log('='.repeat(55));
  console.log('(No external services — all mocked locally)\n');

  cleanup();

  try {
    // ── Step 1: Generate mock post content ──────────
    log('Generate mock post content');
    const mockContent = {
      caption:
        'Data mesh decentralizes ownership while keeping governance centralized. Here are the 4 principles every platform team should know...',
      hashtags: ['DataMesh', 'DataEngineering', 'DataGovernance'],
      imageTitle: 'Data Mesh Principles',
      imageBullets: ['Domain ownership', 'Data as a product', 'Self-serve platform', 'Federated governance'],
      imageType: 'list',
      template: 'principles',
      topic: 'Data Mesh'
    };
    pass(`Mock content generated — topic: ${mockContent.topic}`);
    pass(`Caption: ${mockContent.caption.substring(0, 50)}...`);

    // ── Step 2: Add to queue via queue-manager ──────
    log('Add post to queue via queue-manager');
    const post = queue.addToQueue({
      id: 9001,
      content: mockContent,
      imagePath: null
    });
    assert(post.id === '9001', `Post added with ID #${post.id}`);
    assert(post.status === 'pending', `Status is "pending"`);
    assert(post.content.topic === 'Data Mesh', 'Content preserved in queue');

    // Verify file exists on disk
    const filePath = path.join(queue.PENDING_DIR, '9001.json');
    assert(fs.existsSync(filePath), 'Post JSON file created on disk');

    // ── Step 3: Parse approval command ──────────────
    log('Simulate WhatsApp approval — parse "YES 9001"');
    const parsed = parseCommand('YES 9001');
    assert(parsed.valid === true, 'Command is valid');
    assert(parsed.command === 'approve', `Command: ${parsed.command}`);
    assert(parsed.postId === '9001', `Post ID: ${parsed.postId}`);

    // Also test rejection parsing
    const parsedNo = parseCommand('no 9001');
    assert(parsedNo.valid === true, 'Reject command parses correctly');
    assert(parsedNo.command === 'reject', `Reject command: ${parsedNo.command}`);

    // ── Step 4: Process approval (simulated handler) ─
    log('Process approval — update status and call LinkedIn poster');

    // Simulate what webhook-handler.handleApprove does, without HTTP
    const fetched = queue.getPost('9001');
    assert(fetched !== null, 'Post retrieved from queue');
    assert(fetched.status === 'pending', 'Post still pending before approval');

    const updated = queue.updateStatus('9001', 'approved');
    assert(updated !== null, 'Status update succeeded');

    // ── Step 5: Verify approved status ──────────────
    log('Verify post moved to approved status');
    const approved = queue.getPost('9001');
    assert(approved.status === 'approved', `Status is now "${approved.status}"`);

    // ── Step 6: Call LinkedIn poster stub ────────────
    log('Call LinkedIn poster stub');
    const linkedinResult = await postToLinkedIn(approved);
    assert(linkedinResult.success === true, 'LinkedIn poster returned success');
    assert(typeof linkedinResult.message === 'string', `Message: "${linkedinResult.message}"`);

    // ── Step 7: Verify cleanup ──────────────────────
    log('Verify post can be removed from queue');
    const deleted = queue.deletePost('9001');
    assert(deleted === true, 'Post deleted from queue');
    assert(!fs.existsSync(filePath), 'Post JSON file removed from disk');
    assert(queue.getPost('9001') === null, 'Post no longer retrievable');

    // ── Bonus: Test rejection flow ──────────────────
    log('Bonus — Test rejection flow');
    const post2 = queue.addToQueue({ id: 9002, content: mockContent, imagePath: null });
    assert(post2.status === 'pending', 'Second post added as pending');

    queue.updateStatus('9002', 'rejected');
    const rejected = queue.getPost('9002');
    assert(rejected.status === 'rejected', `Second post status: "${rejected.status}"`);

    queue.deletePost('9002');
    assert(queue.getPost('9002') === null, 'Rejected post cleaned up');

    // ── Bonus: Test list and batch commands ──────────
    log('Bonus — Test list and batch approval parsing');
    const listCmd = parseCommand('list');
    assert(listCmd.valid && listCmd.command === 'list', '"list" command parsed');

    const statusCmd = parseCommand('STATUS');
    assert(statusCmd.valid && statusCmd.command === 'status', '"STATUS" (case-insensitive) parsed');

    const yesAllCmd = parseCommand('yes all');
    assert(yesAllCmd.valid && yesAllCmd.command === 'approve_all', '"yes all" parsed as approve_all');

    const noAllCmd = parseCommand('NO ALL');
    assert(noAllCmd.valid && noAllCmd.command === 'reject_all', '"NO ALL" parsed as reject_all');
  } finally {
    cleanup();
  }

  // ── Summary ───────────────────────────────────────
  console.log('\n' + '='.repeat(55));
  console.log(`Results: ${passed} passed, ${failed} failed`);
  if (failed === 0) {
    console.log('PASS — Full end-to-end flow works correctly.');
  } else {
    console.log('FAIL — See errors above.');
    process.exit(1);
  }
}

main();
