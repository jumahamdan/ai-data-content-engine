const fs = require('fs');
const path = require('path');

const PENDING_DIR = path.join(__dirname, '..', 'pending-posts');
const EXPIRY_DAYS = 7;

/**
 * Ensure the pending-posts directory exists.
 */
function ensureDir() {
  if (!fs.existsSync(PENDING_DIR)) {
    fs.mkdirSync(PENDING_DIR, { recursive: true });
  }
}

/**
 * Path to a post's JSON file.
 */
function postPath(id) {
  return path.join(PENDING_DIR, `${id}.json`);
}

/**
 * Generate the next available post ID by scanning existing files.
 * Returns 1 if no posts exist, otherwise max(existing) + 1.
 */
function nextId() {
  ensureDir();
  const files = fs.readdirSync(PENDING_DIR).filter(f => f.endsWith('.json'));
  if (files.length === 0) return 1;

  const ids = files.map(f => parseInt(path.basename(f, '.json'), 10)).filter(n => !isNaN(n));
  return ids.length === 0 ? 1 : Math.max(...ids) + 1;
}

/**
 * Add a post to the pending queue.
 * @param {object} postData - Post content and metadata
 * @param {object} postData.content - Content object (caption, hashtags, imageTitle, etc.)
 * @param {string|null} postData.imagePath - Local path to generated image
 * @returns {object} The saved post object with id and timestamps
 */
function addToQueue(postData) {
  ensureDir();

  const id = String(postData.id || nextId());
  const now = new Date().toISOString();

  const post = {
    id,
    createdAt: now,
    status: 'pending',
    content: postData.content,
    imagePath: postData.imagePath || null,
    notifiedAt: null,
    timeoutNotifiedAt: null,
    expiresAt: new Date(Date.now() + EXPIRY_DAYS * 24 * 60 * 60 * 1000).toISOString()
  };

  fs.writeFileSync(postPath(id), JSON.stringify(post, null, 2), 'utf8');
  console.log(`Queue: Post #${id} added (status: pending)`);
  return post;
}

/**
 * Get a single post by ID.
 * @param {string|number} id
 * @returns {object|null} The post object, or null if not found
 */
function getPost(id) {
  const filePath = postPath(String(id));
  if (!fs.existsSync(filePath)) return null;

  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    console.error(`Queue: Failed to read post #${id}: ${err.message}`);
    return null;
  }
}

/**
 * Update the status of a post.
 * @param {string|number} id
 * @param {'pending'|'approved'|'rejected'|'expired'} status
 * @returns {object|null} Updated post, or null if not found
 */
function updateStatus(id, status) {
  const validStatuses = ['pending', 'approved', 'rejected', 'expired'];
  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid status: ${status}. Must be one of: ${validStatuses.join(', ')}`);
  }

  const post = getPost(id);
  if (!post) return null;

  post.status = status;

  if (status === 'pending' && !post.notifiedAt) {
    post.notifiedAt = new Date().toISOString();
  }

  fs.writeFileSync(postPath(String(id)), JSON.stringify(post, null, 2), 'utf8');
  console.log(`Queue: Post #${id} status → ${status}`);
  return post;
}

/**
 * List all pending posts (status === 'pending'), sorted by createdAt ascending.
 * @returns {object[]} Array of pending post objects
 */
function listPending() {
  ensureDir();
  const files = fs.readdirSync(PENDING_DIR).filter(f => f.endsWith('.json'));

  const posts = [];
  for (const file of files) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(PENDING_DIR, file), 'utf8'));
      if (data.status === 'pending') {
        posts.push(data);
      }
    } catch (err) {
      console.error(`Queue: Failed to read ${file}: ${err.message}`);
    }
  }

  return posts.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
}

/**
 * Delete a post from the queue.
 * @param {string|number} id
 * @returns {boolean} True if deleted, false if not found
 */
function deletePost(id) {
  const filePath = postPath(String(id));
  if (!fs.existsSync(filePath)) return false;

  fs.unlinkSync(filePath);
  console.log(`Queue: Post #${id} deleted`);
  return true;
}

/**
 * Remove posts older than EXPIRY_DAYS (7 days).
 * Called on initialization to keep the queue clean.
 * @returns {number} Number of posts cleaned up
 */
function cleanupExpired() {
  ensureDir();
  const files = fs.readdirSync(PENDING_DIR).filter(f => f.endsWith('.json'));
  let cleaned = 0;

  for (const file of files) {
    try {
      const filePath = path.join(PENDING_DIR, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const age = Date.now() - new Date(data.createdAt).getTime();
      const maxAge = EXPIRY_DAYS * 24 * 60 * 60 * 1000;

      if (age > maxAge) {
        fs.unlinkSync(filePath);
        console.log(`Queue: Cleaned up expired post #${data.id} (${file})`);
        cleaned++;
      }
    } catch (err) {
      console.error(`Queue: Failed to process ${file} during cleanup: ${err.message}`);
    }
  }

  if (cleaned > 0) {
    console.log(`Queue: Cleaned up ${cleaned} expired post(s)`);
  }
  return cleaned;
}

// Run cleanup on module load
cleanupExpired();

module.exports = {
  addToQueue,
  getPost,
  updateStatus,
  listPending,
  deletePost,
  cleanupExpired,
  nextId,
  PENDING_DIR
};
