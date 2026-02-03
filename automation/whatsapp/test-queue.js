/**
 * Test script for queue-manager.js
 * Run: node automation/whatsapp/test-queue.js
 */

const fs = require('fs');
const path = require('path');
const { addToQueue, getPost, updateStatus, listPending, deletePost, cleanupExpired, PENDING_DIR } = require('./queue-manager');

let passed = 0;
let failed = 0;

function assert(condition, label) {
  if (condition) {
    console.log(`  ✓ ${label}`);
    passed++;
  } else {
    console.error(`  ✗ ${label}`);
    failed++;
  }
}

function cleanup() {
  const files = fs.readdirSync(PENDING_DIR).filter(f => f.endsWith('.json'));
  for (const file of files) {
    fs.unlinkSync(path.join(PENDING_DIR, file));
  }
}

console.log('\n=== Queue Manager Tests ===\n');

// Clean slate
cleanup();

// --- Test addToQueue ---
console.log('addToQueue():');
const post1 = addToQueue({
  content: {
    caption: 'Medallion Architecture transforms data quality...',
    hashtags: ['DataEngineering', 'MedallionArchitecture'],
    imageTitle: 'Medallion Architecture',
    imageBullets: ['Bronze: Raw data', 'Silver: Cleaned', 'Gold: Business-ready'],
    imageType: 'diagram',
    template: 'architecture',
    topic: 'Medallion Architecture'
  },
  imagePath: 'pending-posts/1-image.png'
});
assert(post1.id === '1', 'First post gets id "1"');
assert(post1.status === 'pending', 'Status is pending');
assert(post1.createdAt !== null, 'Has createdAt timestamp');
assert(post1.expiresAt !== null, 'Has expiresAt timestamp');
assert(post1.content.caption.includes('Medallion'), 'Content preserved');
assert(post1.imagePath === 'pending-posts/1-image.png', 'Image path preserved');

const post2 = addToQueue({
  content: {
    caption: 'RAG vs Fine-tuning comparison...',
    hashtags: ['RAG', 'LLM'],
    imageTitle: 'RAG vs Fine-tuning',
    topic: 'RAG vs Fine-tuning'
  }
});
assert(post2.id === '2', 'Second post gets id "2"');

const post3 = addToQueue({
  id: '99',
  content: { caption: 'Custom ID test', hashtags: [], imageTitle: 'Custom', topic: 'Custom' }
});
assert(post3.id === '99', 'Custom ID is respected');

// --- Test getPost ---
console.log('\ngetPost():');
const fetched = getPost('1');
assert(fetched !== null, 'Found post #1');
assert(fetched.content.imageTitle === 'Medallion Architecture', 'Content matches');

const missing = getPost('9999');
assert(missing === null, 'Returns null for non-existent post');

// --- Test listPending ---
console.log('\nlistPending():');
const pending = listPending();
assert(pending.length === 3, 'All 3 posts are pending');
assert(pending[0].id === '1', 'Sorted by createdAt (first is #1)');

// --- Test updateStatus ---
console.log('\nupdateStatus():');
const approved = updateStatus('1', 'approved');
assert(approved.status === 'approved', 'Post #1 marked approved');

const pendingAfter = listPending();
assert(pendingAfter.length === 2, 'Only 2 pending after approving #1');

const rejected = updateStatus('2', 'rejected');
assert(rejected.status === 'rejected', 'Post #2 marked rejected');

const notFound = updateStatus('9999', 'approved');
assert(notFound === null, 'Returns null for non-existent post');

let invalidError = false;
try {
  updateStatus('99', 'invalid_status');
} catch (e) {
  invalidError = true;
}
assert(invalidError, 'Throws on invalid status');

// --- Test deletePost ---
console.log('\ndeletePost():');
const deleted = deletePost('99');
assert(deleted === true, 'Deleted post #99');

const deleteMissing = deletePost('9999');
assert(deleteMissing === false, 'Returns false for non-existent post');

const fileExists = fs.existsSync(path.join(PENDING_DIR, '99.json'));
assert(!fileExists, 'File removed from disk');

// --- Test cleanupExpired ---
console.log('\ncleanupExpired():');

// Create a post with old date
const oldPost = {
  id: '888',
  createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  status: 'pending',
  content: { caption: 'Old post', hashtags: [], imageTitle: 'Old', topic: 'Old' },
  imagePath: null,
  notifiedAt: null,
  timeoutNotifiedAt: null,
  expiresAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
};
fs.writeFileSync(path.join(PENDING_DIR, '888.json'), JSON.stringify(oldPost, null, 2));

const cleaned = cleanupExpired();
assert(cleaned >= 1, `Cleaned up ${cleaned} expired post(s)`);

const oldGone = getPost('888');
assert(oldGone === null, 'Expired post removed');

// --- Test file integrity ---
console.log('\nFile integrity:');
const post1File = path.join(PENDING_DIR, '1.json');
const raw = JSON.parse(fs.readFileSync(post1File, 'utf8'));
assert(raw.id === '1', 'JSON file has correct id');
assert(raw.status === 'approved', 'JSON file reflects updated status');

// Cleanup
cleanup();

// --- Summary ---
console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
process.exit(failed > 0 ? 1 : 0);
