const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const fs = require('fs');
const admin = require('firebase-admin');
const { selectTopic } = require('./topic-selector');
const { generateContent } = require('./claude-client');
const { addToQueue } = require('../whatsapp/firestore-queue');
const { generateImage } = require('../hybrid-image-generator');
const { getThemeForPillar } = require('./pillar-theme-map');

const FIREBASE_PROJECT_ID = 'ai-content-engine-jh';
const STORAGE_BUCKET = `${FIREBASE_PROJECT_ID}.firebasestorage.app`;

/**
 * Generate a LinkedIn post image using hybrid compositor.
 * Produces Gemini abstract background + Puppeteer crisp text overlay.
 * @param {string} topic - The post topic
 * @param {string} category - Content pillar category for theme/layout mapping
 * @param {object|null} imageMetadata - Optional structured metadata from Claude (title, subtitle, sections, insight)
 * @returns {Promise<string|null>} Public URL of the uploaded image, or null on failure
 */
async function generatePostImage(topic, category, imageMetadata) {
  // 1. Look up theme + layout for this content pillar
  const { theme, layout } = getThemeForPillar(category);

  // 2. Build contentData from imageMetadata when available, falling back to basic structure
  let contentData;
  if (imageMetadata && imageMetadata.title && Array.isArray(imageMetadata.sections)) {
    // Rich metadata from Claude — use it
    contentData = {
      title: imageMetadata.title,
      subtitle: imageMetadata.subtitle || '',
      sections: imageMetadata.sections,
      insight: imageMetadata.insight || '',
      theme,
      layout
    };
    console.log(`Content Generator: Using Claude metadata (${imageMetadata.sections.length} sections)`);
  } else {
    // Fallback: use single layout to avoid rendering empty complex layouts
    contentData = {
      title: topic,
      subtitle: '',
      sections: [],
      insight: '',
      theme,
      layout: 'single'
    };
    console.log('Content Generator: No image metadata, falling back to single layout');
  }

  console.log(`Content Generator: Generating composite image (theme: ${theme}, layout: ${contentData.layout})...`);

  // 3. Call hybrid compositor
  const outputDir = path.join(__dirname, '..', 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const fileName = `post-${Date.now()}.png`;
  const localPath = path.join(outputDir, fileName);

  const result = await generateImage(contentData, {
    outputPath: localPath,
    verbose: false
  });

  if (!result.success) {
    throw new Error(`Hybrid compositor failed: ${result.error}`);
  }

  console.log(
    `Content Generator: Composite image generated (${result.metadata.latency.total}ms, theme: ${result.metadata.theme}, layout: ${result.metadata.layout})`
  );

  // 4. Upload to Firebase Storage (same as before)
  console.log('Content Generator: Uploading to Firebase Storage...');
  const bucket = admin.storage().bucket(STORAGE_BUCKET);
  const destination = `post-images/${fileName}`;

  try {
    await bucket.upload(localPath, {
      destination,
      metadata: {
        contentType: 'image/png',
        metadata: {
          topic,
          theme: result.metadata.theme,
          layout: result.metadata.layout,
          provider: result.metadata.provider,
          generatedAt: new Date().toISOString()
        }
      }
    });

    // Make publicly readable
    const file = bucket.file(destination);
    await file.makePublic();

    const publicUrl = `https://storage.googleapis.com/${STORAGE_BUCKET}/${destination}`;
    console.log(`Content Generator: Image uploaded → ${publicUrl}`);

    return publicUrl;
  } finally {
    // Clean up local file after upload to avoid accumulating images on disk
    fs.promises.unlink(localPath).catch(err => {
      console.warn(`Content Generator: Failed to delete local image: ${err.message}`);
    });
  }
}

/**
 * Generate a LinkedIn post: select topic, call Claude API, generate image, save to Firestore queue.
 * Designed to run as a standalone script from GitHub Actions or locally.
 * @returns {Promise<object>} The saved post object
 */
async function generatePost() {
  console.log('Content Generator: Starting...');

  // 1. Select topic
  const topic = await selectTopic();
  console.log(`Content Generator: Selected topic "${topic.topic}" (template: ${topic.template})`);

  // 2. Generate content via Claude API
  const content = await generateContent(topic);
  console.log(`Content Generator: Content generated (${content.caption.length} chars)`);

  // 3. Generate AI image (non-blocking — failure doesn't stop the pipeline)
  let imagePath = null;
  if (process.env.IMAGE_PROVIDER !== 'none') {
    try {
      imagePath = await generatePostImage(topic.topic, topic.category, content.imageMetadata);
    } catch (error) {
      console.warn(`Content Generator: Image generation error - ${error.message}. Continuing without image.`);
    }
  }

  // 4. Save to Firestore queue (also sends WhatsApp notification with image)
  const post = await addToQueue({
    content: {
      caption: content.caption,
      hashtags: content.hashtags,
      topic: topic.topic,
      template: topic.template,
      category: topic.category
    },
    imagePath
  });

  console.log(`Content Generator: Post #${post.id} saved to queue`);
  return post;
}

// Run as standalone script
if (require.main === module) {
  generatePost()
    .then(post => {
      console.log(`Content Generator: Done. Post #${post.id} is pending approval.`);
      process.exit(0);
    })
    .catch(error => {
      console.error(`Content Generator: Failed - ${error.message}`);
      process.exit(1);
    });
}

module.exports = { generatePost };
