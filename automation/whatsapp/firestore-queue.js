const admin = require('firebase-admin');
const path = require('node:path');

// Initialize Firebase Admin SDK
const serviceAccountPath = path.join(__dirname, '..', '..', 'config', 'firebase-service-account.json');
const serviceAccount = require(serviceAccountPath);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();
const COLLECTION = 'pending_posts';
const EXPIRY_DAYS = 7;

// Lazy-load Twilio client to avoid circular dependencies
let twilioClient = null;
function getTwilioClient() {
  if (!twilioClient) {
    twilioClient = require('./twilio-client');
  }
  return twilioClient;
}

/**
 * Generate the next available post ID by querying Firestore.
 * @returns {Promise<number>} Next available ID
 */
async function nextId() {
  const snapshot = await db.collection(COLLECTION).orderBy('numericId', 'desc').limit(1).get();

  if (snapshot.empty) return 1;
  const maxId = snapshot.docs[0].data().numericId || 0;
  return maxId + 1;
}

/**
 * Add a post to the Firestore pending queue.
 * @param {object} postData - Post content and metadata
 * @param {object} postData.content - Content object (caption, hashtags, imageTitle, etc.)
 * @param {string|null} postData.imagePath - Local path to generated image (or cloud URL)
 * @param {boolean} [notify=true] - Whether to send WhatsApp notification
 * @returns {Promise<object>} The saved post object with id and timestamps
 */
async function addToQueue(postData, notify = true) {
  const numericId = postData.id ? Number.parseInt(postData.id, 10) : await nextId();
  const id = String(numericId);
  const now = new Date();

  const post = {
    id,
    numericId,
    createdAt: admin.firestore.Timestamp.fromDate(now),
    status: 'pending',
    content: postData.content,
    imagePath: postData.imagePath || null,
    notifiedAt: null,
    timeoutNotifiedAt: null,
    expiresAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() + EXPIRY_DAYS * 24 * 60 * 60 * 1000))
  };

  await db.collection(COLLECTION).doc(id).set(post);
  console.log(`Firestore Queue: Post #${id} added (status: pending)`);

  // Send WhatsApp notification
  if (notify) {
    try {
      const twilio = getTwilioClient();
      const caption = postData.content?.caption || 'New post';
      const topic = postData.content?.topic || postData.content?.imageTitle || 'Untitled';
      const preview = caption.substring(0, 200) + (caption.length > 200 ? '...' : '');

      const message = `📝 New Post Ready for Review!\n━━━━━━━━━━━━━━━━\n#${id} - ${topic}\n\n${preview}\n\nReply: ${id} to preview\nYES ${id} to approve\nNO ${id} to reject`;

      // Only pass imagePath as media if it's a public HTTPS URL (Twilio requires https)
      const mediaUrl = postData.imagePath && postData.imagePath.startsWith('https') ? postData.imagePath : null;
      await twilio.sendToOwner(message, mediaUrl);

      // Mark as notified
      await db
        .collection(COLLECTION)
        .doc(id)
        .update({
          notifiedAt: admin.firestore.Timestamp.fromDate(new Date())
        });
      console.log(`Firestore Queue: WhatsApp notification sent for post #${id}`);
    } catch (err) {
      console.error(`Firestore Queue: Failed to send WhatsApp notification: ${err.message}`);
      // Don't throw - post was still added successfully
    }
  }

  return { ...post, createdAt: now.toISOString(), expiresAt: post.expiresAt.toDate().toISOString() };
}

/**
 * Get a single post by ID.
 * @param {string|number} id
 * @returns {Promise<object|null>} The post object, or null if not found
 */
async function getPost(id) {
  const doc = await db.collection(COLLECTION).doc(String(id)).get();
  if (!doc.exists) return null;

  const data = doc.data();
  return {
    ...data,
    createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
    expiresAt: data.expiresAt?.toDate?.()?.toISOString() || data.expiresAt,
    notifiedAt: data.notifiedAt?.toDate?.()?.toISOString() || data.notifiedAt,
    timeoutNotifiedAt: data.timeoutNotifiedAt?.toDate?.()?.toISOString() || data.timeoutNotifiedAt
  };
}

/**
 * Update a post's status and optional fields.
 * @param {string|number} id
 * @param {string} status - New status
 * @param {object} [additionalFields] - Extra fields to update
 * @returns {Promise<object|null>} Updated post or null if not found
 */
async function updateStatus(id, status, additionalFields = {}) {
  const docRef = db.collection(COLLECTION).doc(String(id));
  const doc = await docRef.get();

  if (!doc.exists) return null;

  const updates = { status, ...additionalFields };
  await docRef.update(updates);

  console.log(`Firestore Queue: Post #${id} updated to ${status}`);
  return getPost(id);
}

/**
 * List all pending posts.
 * @returns {Promise<object[]>} Array of pending posts
 */
async function listPending() {
  const snapshot = await db.collection(COLLECTION).where('status', '==', 'pending').orderBy('createdAt', 'desc').get();

  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
      expiresAt: data.expiresAt?.toDate?.()?.toISOString() || data.expiresAt
    };
  });
}

/**
 * Remove a post from the queue.
 * @param {string|number} id
 * @returns {Promise<boolean>} True if deleted
 */
async function removePost(id) {
  const docRef = db.collection(COLLECTION).doc(String(id));
  const doc = await docRef.get();

  if (!doc.exists) return false;

  await docRef.delete();
  console.log(`Firestore Queue: Post #${id} removed`);
  return true;
}

/**
 * Get posts that are about to expire (for timeout notifications).
 * @param {number} hoursBeforeExpiry - Hours before expiry to check
 * @returns {Promise<object[]>} Array of posts nearing expiry
 */
async function getExpiringPosts(hoursBeforeExpiry = 24) {
  const cutoff = new Date(Date.now() + hoursBeforeExpiry * 60 * 60 * 1000);

  const snapshot = await db
    .collection(COLLECTION)
    .where('status', '==', 'pending')
    .where('expiresAt', '<=', admin.firestore.Timestamp.fromDate(cutoff))
    .where('timeoutNotifiedAt', '==', null)
    .get();

  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
      expiresAt: data.expiresAt?.toDate?.()?.toISOString() || data.expiresAt
    };
  });
}

module.exports = {
  addToQueue,
  getPost,
  updateStatus,
  listPending,
  removePost,
  getExpiringPosts,
  nextId,
  db,
  COLLECTION
};
