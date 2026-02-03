const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { selectTopic } = require('./topic-selector');
const { generateContent } = require('./claude-client');
const { addToQueue } = require('../whatsapp/firestore-queue');

/**
 * Generate a LinkedIn post: select topic, call Claude API, save to Firestore queue.
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

  // 3. Save to Firestore queue (also sends WhatsApp notification)
  const post = await addToQueue({
    content: {
      caption: content.caption,
      hashtags: content.hashtags,
      topic: topic.topic,
      template: topic.template,
      category: topic.category
    },
    imagePath: null
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
