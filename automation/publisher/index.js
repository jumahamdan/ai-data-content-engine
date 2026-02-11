const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { db, COLLECTION } = require('../whatsapp/firestore-queue');
const linkedin = require('./platforms/linkedin');
const admin = require('firebase-admin');

const platforms = [linkedin];

/**
 * Query Firestore for all posts with status "approved".
 * @returns {Promise<object[]>} Array of approved post documents
 */
async function getApprovedPosts() {
  const snapshot = await db.collection(COLLECTION).where('status', '==', 'approved').orderBy('createdAt', 'asc').get();

  return snapshot.docs.map(doc => ({ _ref: doc.ref, ...doc.data() }));
}

/**
 * Publish a single post to all enabled platforms and mark it as published.
 * @param {object} post - Firestore post document
 * @returns {Promise<void>}
 */
async function publishPost(post) {
  const postId = post.id;
  console.log(`Publisher: Publishing post #${postId}...`);

  const results = [];

  for (const platform of platforms) {
    try {
      const result = await platform.post(post.content, post.imagePath);
      results.push({ platform: platform.name, success: true, result });
      console.log(`Publisher: Post #${postId} published to ${platform.name}`);
    } catch (error) {
      results.push({ platform: platform.name, success: false, error: error.message });
      console.error(`Publisher: Failed to publish #${postId} to ${platform.name} — ${error.message}`);
    }
  }

  // Mark as published if at least one platform succeeded
  const anySuccess = results.some(r => r.success);
  if (anySuccess) {
    await post._ref.update({
      status: 'published',
      publishedAt: admin.firestore.Timestamp.fromDate(new Date()),
      publishResults: results
    });
    console.log(`Publisher: Post #${postId} marked as published`);
  } else {
    console.error(`Publisher: Post #${postId} failed on all platforms`);
  }
}

/**
 * Main entry point: find all approved posts and publish them.
 * @returns {Promise<number>} Number of posts published
 */
async function publishApproved() {
  console.log('Publisher: Checking for approved posts...');

  const posts = await getApprovedPosts();

  if (posts.length === 0) {
    console.log('Publisher: No approved posts to publish');
    return 0;
  }

  console.log(`Publisher: Found ${posts.length} approved post(s)`);

  let published = 0;
  for (const post of posts) {
    try {
      await publishPost(post);
      published++;
    } catch (error) {
      console.error(`Publisher: Error processing post #${post.id} — ${error.message}`);
    }
  }

  return published;
}

// Run as standalone script
if (require.main === module) {
  publishApproved()
    .then(count => {
      console.log(`Publisher: Done. ${count} post(s) published.`);
      process.exit(0);
    })
    .catch(error => {
      console.error(`Publisher: Failed — ${error.message}`);
      process.exit(1);
    });
}

module.exports = { publishApproved };
