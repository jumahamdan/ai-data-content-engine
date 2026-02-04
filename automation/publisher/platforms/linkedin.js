/**
 * LinkedIn platform adapter.
 *
 * MVP: Logs the post content to console (no actual API call).
 * Future: OAuth2 + LinkedIn API v2 posting.
 */

const name = 'linkedin';

/**
 * Post content to LinkedIn.
 * Currently logs the post for verification. Real API integration
 * will use LINKEDIN_ACCESS_TOKEN from environment.
 *
 * @param {object} content - Post content { caption, hashtags, topic }
 * @param {string|null} imagePath - Path or URL to post image
 * @returns {Promise<{ posted: boolean, message: string }>}
 */
async function post(content, imagePath) {
  const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;

  if (!accessToken) {
    // MVP mode: log the post instead of publishing
    console.log('LinkedIn: [MVP MODE] No access token — logging post instead of publishing');
    console.log('LinkedIn: --- Post Preview ---');
    console.log(content.caption);
    const hashtags = Array.isArray(content.hashtags) ? content.hashtags : [];
    if (hashtags.length > 0) {
      console.log(`LinkedIn: Hashtags: ${hashtags.join(' ')}`);
    }
    if (imagePath) {
      console.log(`LinkedIn: Image: ${imagePath}`);
    }
    console.log('LinkedIn: --- End Preview ---');

    return { posted: false, message: 'MVP mode — logged to console' };
  }

  // Future: Real LinkedIn API posting
  // Uses LinkedIn API v2 (ugcPosts endpoint)
  // Requires OAuth2 access token with w_member_social scope
  throw new Error('LinkedIn API posting not yet implemented. Set LINKEDIN_ACCESS_TOKEN when ready.');
}

/**
 * Validate that content meets LinkedIn requirements.
 * @param {object} content - Post content
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validate(content) {
  const errors = [];

  if (!content.caption) {
    errors.push('Caption is required');
  } else if (content.caption.length > 3000) {
    errors.push(`Caption too long: ${content.caption.length}/3000 characters`);
  }

  return { valid: errors.length === 0, errors };
}

module.exports = { name, post, validate };
