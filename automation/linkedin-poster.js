const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

/**
 * Post content to LinkedIn (stub).
 * In production, this will call the LinkedIn API with OAuth.
 * Currently logs the action and returns a mock success response.
 *
 * @param {object} postData - The full post object from the queue
 * @param {string} postData.id - Post ID
 * @param {object} postData.content - Content with caption, hashtags, etc.
 * @param {string|null} postData.imagePath - Local path to image
 * @returns {Promise<{success: boolean, linkedinPostId: string|null, message: string}>}
 */
async function postToLinkedIn(postData) {
  const content = postData.content || {};
  const caption = content.caption || '';
  const hashtags = (content.hashtags || []).map(h => (h.startsWith('#') ? h : `#${h}`)).join(' ');

  console.log('─'.repeat(50));
  console.log(`LinkedIn Poster: Publishing post #${postData.id}`);
  console.log(`  Topic: ${content.topic || content.imageTitle || 'Unknown'}`);
  console.log(`  Caption length: ${caption.length} chars`);
  console.log(`  Hashtags: ${hashtags || 'none'}`);
  console.log(`  Image: ${postData.imagePath || 'none'}`);
  console.log('─'.repeat(50));
  console.log('LinkedIn Poster: [STUB] Post would be published here');

  return {
    success: true,
    linkedinPostId: null,
    message: `[STUB] Post #${postData.id} would be published to LinkedIn`
  };
}

module.exports = { postToLinkedIn };
