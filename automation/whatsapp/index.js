const { sendToOwner } = require('./twilio-client');

/**
 * Send a post preview to the owner's WhatsApp for approval.
 * @param {object} post - Post data from the queue
 * @param {string} post.id - Unique post ID
 * @param {object} post.content - Post content
 * @param {string} post.content.caption - LinkedIn caption text
 * @param {string[]} post.content.hashtags - Hashtag list
 * @param {string} post.content.imageTitle - Image title / topic
 * @param {string|null} imageUrl - Public URL of the image (Twilio fetches it)
 * @returns {Promise<object>} Twilio message object
 */
async function sendPreview(post, imageUrl = null) {
  const hashtags = (post.content.hashtags || []).map(h => (h.startsWith('#') ? h : `#${h}`)).join(' ');

  const caption = post.content.caption || '';
  const previewText = caption.length > 200 ? caption.substring(0, 200) + '...' : caption;

  const body = [
    `📋 Post #${post.id} - ${post.content.imageTitle || post.content.topic}`,
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    '',
    '📝 Caption Preview:',
    previewText,
    '',
    `🏷️ Hashtags:`,
    hashtags,
    '',
    imageUrl ? '🖼️ [Image attached]' : '🖼️ [No image]',
    '',
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    `Reply: YES ${post.id} to post | NO ${post.id} to skip`
  ].join('\n');

  return sendToOwner(body, imageUrl);
}

/**
 * Send a confirmation message after a post is approved/rejected.
 * @param {string} postId - The post ID
 * @param {'approved'|'rejected'|'timeout'} action - What happened
 * @returns {Promise<object>} Twilio message object
 */
async function sendConfirmation(postId, action) {
  const messages = {
    approved: `✅ Post #${postId} published to LinkedIn!`,
    rejected: `❌ Post #${postId} discarded.`,
    timeout: [
      `⏸️ Post #${postId} pending (no response in 60 min).`,
      `Reply YES ${postId} to post anyway, or NO ${postId} to discard.`
    ].join('\n')
  };

  const body = messages[action];
  if (!body) {
    throw new Error(`Unknown action: ${action}. Use approved, rejected, or timeout.`);
  }

  return sendToOwner(body);
}

/**
 * Send a list of pending posts.
 * @param {object[]} posts - Array of pending post objects
 * @returns {Promise<object>} Twilio message object
 */
async function sendPendingList(posts) {
  if (posts.length === 0) {
    return sendToOwner('📋 No pending posts.');
  }

  const lines = posts.map(p => {
    const age = getAge(p.createdAt);
    return `#${p.id} - ${p.content.imageTitle || p.content.topic} (${age})`;
  });

  const body = [
    `📋 Pending Posts (${posts.length}):`,
    '',
    ...lines,
    '',
    'Reply: YES <id> | NO <id> | YES ALL | NO ALL'
  ].join('\n');

  return sendToOwner(body);
}

/**
 * Human-readable age string from a date.
 */
function getAge(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

module.exports = {
  sendPreview,
  sendConfirmation,
  sendPendingList
};
