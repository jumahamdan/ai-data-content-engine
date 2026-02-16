const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

const MODEL = 'claude-sonnet-4-20250514';
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

// Map template names to prompt template filenames
const TEMPLATE_MAP = {
  'concept-breakdown': 'concept-breakdown.md',
  'architecture-comparison': 'architecture-comparison.md',
  'optimization-story': 'optimization-story.md',
  'layered-mental-model': 'layered-mental-model.md',
  'automation-guide': 'automation-guide.md',
  'practitioner-lesson': 'practitioner-lesson.md'
};

/**
 * Load a prompt template from the prompts/ folder and inject the topic.
 * @param {string} templateName - Template key (e.g. "concept-breakdown")
 * @param {string} topic - The topic to inject into the template
 * @returns {string} The filled prompt
 */
function loadPromptTemplate(templateName, topic) {
  const filename = TEMPLATE_MAP[templateName];
  if (!filename) {
    throw new Error(`Unknown template: "${templateName}". Valid templates: ${Object.keys(TEMPLATE_MAP).join(', ')}`);
  }

  const promptPath = path.join(__dirname, '..', '..', 'prompts', filename);
  let template = fs.readFileSync(promptPath, 'utf-8');

  // Replace placeholder token with the actual topic
  template = template.replace(/\{\{topic\}\}/g, topic);

  return template;
}

/**
 * Load tone and post-template guidelines from content-spec/.
 * @returns {string} Combined style guidelines
 */
function loadStyleGuidelines() {
  const specDir = path.join(__dirname, '..', '..', 'content-spec');

  const tone = fs.readFileSync(path.join(specDir, 'tone.md'), 'utf-8');
  const templates = fs.readFileSync(path.join(specDir, 'post-templates.md'), 'utf-8');

  return `${tone}\n\n${templates}`;
}

/**
 * Parse Claude's response into structured content.
 * Extracts caption text and hashtags from the generated post.
 * @param {string} text - Raw response text from Claude
 * @param {string} topic - The original topic (used as fallback imageTitle)
 * @returns {{ caption: string, hashtags: string[], imageTitle: string }}
 */
function parseResponse(text) {
  // Extract hashtags (words starting with #)
  const hashtagMatches = text.match(/#[A-Za-z]\w*/g) || [];
  const hashtags = [...new Set(hashtagMatches)];

  // Caption is the full text with hashtags removed from the end
  // Find where the trailing hashtag block starts
  const lines = text.trim().split('\n');
  const captionLines = [];
  let foundHashtagBlock = false;

  // Walk backwards to find the hashtag block at the end
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i].trim();
    if (line && /^#\w/.test(line.replace(/\s+/g, ' ').split(' ').pop())) {
      // Line contains hashtags — check if it's mostly hashtags
      const words = line.split(/\s+/);
      const hashtagWords = words.filter(w => /^#\w/.test(w));
      if (hashtagWords.length / words.length > 0.5) {
        foundHashtagBlock = true;
        continue;
      }
    }
    if (foundHashtagBlock || i < lines.length - 1) {
      // Once we've passed the hashtag block, keep everything
      captionLines.unshift(lines[i]);
      foundHashtagBlock = false;
    } else {
      captionLines.unshift(lines[i]);
    }
  }

  const caption = captionLines.join('\n').trim();

  // Generate an image title from the first meaningful line
  const firstLine = caption.split('\n').find(l => l.trim().length > 10) || caption.substring(0, 80);
  const imageTitle = firstLine.trim().substring(0, 100);

  return { caption, hashtags, imageTitle };
}

/**
 * Sleep helper for retry delays.
 * @param {number} ms
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate LinkedIn post content using Claude API.
 * @param {{ topic: string, template: string, category: string }} topicObj
 * @returns {Promise<{ caption: string, hashtags: string[], imageTitle: string }>}
 */
async function generateContent(topicObj) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY environment variable is not set');
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const promptTemplate = loadPromptTemplate(topicObj.template, topicObj.topic);
  const styleGuidelines = loadStyleGuidelines();

  const systemPrompt = [
    'You are a senior data and AI engineer writing LinkedIn content.',
    'Follow these style guidelines exactly:\n',
    styleGuidelines,
    '\nReturn ONLY the LinkedIn post content — no preamble, no explanation, no markdown code fences.',
    'End with 5-8 relevant hashtags on a new line.'
  ].join('\n');

  let lastError;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`Claude Client: Calling Claude API (attempt ${attempt}/${MAX_RETRIES})...`);

      const message = await client.messages.create({
        model: MODEL,
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: 'user', content: promptTemplate }]
      });

      const responseText = message.content
        .filter(block => block.type === 'text')
        .map(block => block.text)
        .join('\n');

      if (!responseText.trim()) {
        throw new Error('Claude returned an empty response');
      }

      const result = parseResponse(responseText);
      console.log(
        `Claude Client: Generated ${result.caption.length} char caption with ${result.hashtags.length} hashtags`
      );
      return result;
    } catch (error) {
      lastError = error;
      console.error(`Claude Client: Attempt ${attempt} failed — ${error.message}`);

      if (attempt < MAX_RETRIES) {
        const delay = RETRY_DELAY_MS * attempt;
        console.log(`Claude Client: Retrying in ${delay}ms...`);
        await sleep(delay);
      }
    }
  }

  throw new Error(`Claude API failed after ${MAX_RETRIES} attempts: ${lastError.message}`);
}

module.exports = { generateContent, loadPromptTemplate, parseResponse };
