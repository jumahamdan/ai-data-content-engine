/**
 * LinkedIn platform adapter.
 *
 * When LINKEDIN_ACCESS_TOKEN is set, posts to LinkedIn via the REST API.
 * Otherwise falls back to MVP mode (console log).
 *
 * Uses LinkedIn Posts API (versioned) with "Share on LinkedIn" product.
 * Supports text-only posts and posts with images.
 */

const name = 'linkedin';

const LINKEDIN_API_VERSION = '202601';

// ---------------------------------------------------------------------------
// LinkedIn API helpers
// ---------------------------------------------------------------------------

/**
 * Make an authenticated request to the LinkedIn API.
 */
async function linkedinFetch(url, accessToken, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'LinkedIn-Version': LINKEDIN_API_VERSION,
      'X-Restli-Protocol-Version': '2.0.0',
      ...options.headers
    }
  });

  // 204 No Content (success with no body)
  if (response.status === 204) return null;

  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }

  if (!response.ok) {
    const msg = data?.message || data?.error_description || JSON.stringify(data);
    throw new Error(`LinkedIn API ${response.status}: ${msg}`);
  }

  return data;
}

/**
 * Get the authenticated user's person URN.
 * Uses the OpenID Connect userinfo endpoint.
 */
async function getPersonUrn(accessToken) {
  const data = await linkedinFetch('https://api.linkedin.com/v2/userinfo', accessToken);
  if (!data?.sub) {
    throw new Error('Could not retrieve LinkedIn person ID from /v2/userinfo');
  }
  return `urn:li:person:${data.sub}`;
}

/**
 * Upload an image to LinkedIn from a public URL.
 *
 * Flow:
 *   1. Initialize upload → get uploadUrl + image URN
 *   2. Download image from source URL
 *   3. PUT image binary to LinkedIn's uploadUrl
 *   4. Return the image URN for use in the post
 */
async function uploadImage(accessToken, ownerUrn, imageUrl) {
  console.log(`LinkedIn: Uploading image from ${imageUrl}`);

  // Step 1: Initialize upload
  const initData = await linkedinFetch('https://api.linkedin.com/rest/images?action=initializeUpload', accessToken, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      initializeUploadRequest: { owner: ownerUrn }
    })
  });

  const uploadUrl = initData?.value?.uploadUrl;
  const imageUrn = initData?.value?.image;
  if (!uploadUrl || !imageUrn) {
    throw new Error('LinkedIn image upload initialization failed — no uploadUrl or image URN');
  }

  // Step 2: Download image from source
  const imageResponse = await fetch(imageUrl);
  if (!imageResponse.ok) {
    throw new Error(`Failed to download image from ${imageUrl}: ${imageResponse.status}`);
  }
  const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

  // Step 3: Upload binary to LinkedIn
  const uploadResponse = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/octet-stream'
    },
    body: imageBuffer
  });

  if (!uploadResponse.ok) {
    const errText = await uploadResponse.text();
    throw new Error(`LinkedIn image upload failed: ${uploadResponse.status} ${errText}`);
  }

  console.log(`LinkedIn: Image uploaded → ${imageUrn}`);
  return imageUrn;
}

// ---------------------------------------------------------------------------
// Main post function
// ---------------------------------------------------------------------------

/**
 * Post content to LinkedIn.
 *
 * @param {object} content - Post content { caption, hashtags, topic }
 * @param {string|null} imagePath - Public URL to post image
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

  // --- Real LinkedIn posting ---

  // Get the author's person URN
  const personUrn = await getPersonUrn(accessToken);
  console.log(`LinkedIn: Posting as ${personUrn}`);

  // Format post text: caption + hashtags
  const hashtags = Array.isArray(content.hashtags) ? content.hashtags.join(' ') : '';
  const commentary = content.caption + (hashtags ? '\n\n' + hashtags : '');

  // Build the post payload
  const postBody = {
    author: personUrn,
    commentary,
    visibility: 'PUBLIC',
    distribution: {
      feedDistribution: 'MAIN_FEED',
      targetEntities: [],
      thirdPartyDistributionChannels: []
    },
    lifecycleState: 'PUBLISHED',
    isReshareDisabledByAuthor: false
  };

  // Upload image if available
  if (imagePath && imagePath.startsWith('http')) {
    try {
      const imageUrn = await uploadImage(accessToken, personUrn, imagePath);
      postBody.content = {
        media: {
          title: content.topic || 'Post image',
          id: imageUrn
        }
      };
    } catch (err) {
      console.warn(`LinkedIn: Image upload failed — posting without image. ${err.message}`);
    }
  }

  // Create the post
  await linkedinFetch('https://api.linkedin.com/rest/posts', accessToken, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(postBody)
  });

  // LinkedIn returns 201 with empty body on success
  console.log('LinkedIn: Post published successfully');
  return { posted: true, message: 'Published to LinkedIn' };
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
