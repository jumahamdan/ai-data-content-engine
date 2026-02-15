const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const fs = require('fs');
const admin = require('firebase-admin');
const { selectTopic } = require('./topic-selector');
const { generateContent } = require('./claude-client');
const { addToQueue } = require('../whatsapp/firestore-queue');
const { createGeminiClient } = require('../hybrid-image-generator/gemini-client');

const FIREBASE_PROJECT_ID = 'ai-content-engine-jh';
const STORAGE_BUCKET = `${FIREBASE_PROJECT_ID}.firebasestorage.app`;

/**
 * Generate a LinkedIn post image using Gemini AI.
 * Creates a visual that captures the topic's essence — not a text overlay.
 * @param {string} topic - The post topic
 * @param {string} caption - The post caption (for context)
 * @returns {Promise<string|null>} Public URL of the uploaded image, or null on failure
 */
async function generatePostImage(topic, _caption) {
  const gemini = createGeminiClient();

  // Build a prompt that creates an engaging LinkedIn visual
  const prompt = `Create a professional, visually striking LinkedIn post image about "${topic}".
The image should be a clean infographic-style visual that captures the key concept.
Use modern design with clear visual hierarchy, subtle gradients, and professional colors.
Include a short title "${topic}" prominently.
Make it eye-catching for a LinkedIn feed. No stock photo look — make it informative and visual.`;

  const outputDir = path.join(__dirname, '..', 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const fileName = `post-${Date.now()}.png`;
  const localPath = path.join(outputDir, fileName);

  console.log('Content Generator: Generating AI image with Gemini...');
  const result = await gemini.generateAndSave(prompt, localPath);
  console.log(`Content Generator: Image generated locally (${result.latency}ms)`);

  // Upload to Firebase Storage for a public URL
  console.log('Content Generator: Uploading to Firebase Storage...');
  const bucket = admin.storage().bucket(STORAGE_BUCKET);
  const destination = `post-images/${fileName}`;

  try {
    await bucket.upload(localPath, {
      destination,
      metadata: {
        contentType: 'image/png',
        metadata: { topic, generatedAt: new Date().toISOString() }
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
      imagePath = await generatePostImage(topic.topic, content.caption);
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
