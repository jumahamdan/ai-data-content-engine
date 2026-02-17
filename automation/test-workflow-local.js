const https = require('https');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Image generator integration
const { generateImage: generateHybridImage } = require('./hybrid-image-generator');

// WhatsApp approval queue
const queue = require('./whatsapp/queue-manager');
const { sendPreview } = require('./whatsapp/index');

const CONFIG = {
  githubToken: process.env.GITHUB_TOKEN,
  openaiKey: process.env.OPENAI_API_KEY,
  owner: 'jumahamdan',
  repo: 'ai-data-content-engine'
};

if (!CONFIG.githubToken) {
  console.error('ERROR: GITHUB_TOKEN not set');
  process.exit(1);
}
if (!CONFIG.openaiKey) {
  console.error('ERROR: OPENAI_API_KEY not set');
  process.exit(1);
}

const STATE = { lastTemplateIndex: 0, usedTopics: {} };
const TEMPLATE_ROTATION = ['interview_explainer', 'architecture', 'optimization', 'layered'];

async function fetchGitHubFile(filePath) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${filePath}`,
      method: 'GET',
      headers: {
        'User-Agent': 'Node.js',
        Authorization: `token ${CONFIG.githubToken}`,
        Accept: 'application/vnd.github.v3+json'
      }
    };
    https
      .get(options, res => {
        let data = '';
        res.on('data', chunk => (data += chunk));
        res.on('end', () => {
          if (res.statusCode === 200) {
            const json = JSON.parse(data);
            let content = Buffer.from(json.content, 'base64').toString('utf8');
            // Remove BOM if present
            if (content.charCodeAt(0) === 0xfeff) {
              content = content.slice(1);
            }
            resolve(content);
          } else {
            reject(new Error(`GitHub API error: ${res.statusCode}`));
          }
        });
      })
      .on('error', reject);
  });
}

async function callOpenAI(systemPrompt, userPrompt) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 800
    });
    const options = {
      hostname: 'api.openai.com',
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${CONFIG.openaiKey}`,
        'Content-Length': Buffer.byteLength(payload)
      }
    };
    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`OpenAI API error: ${res.statusCode} - ${data}`));
        }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function planContent() {
  console.log('Planning content...');
  const topicBankRaw = await fetchGitHubFile('topics/topic-bank.json');
  const topicBank = JSON.parse(topicBankRaw);
  console.log('Fetched topic bank');
  const currentTemplateIndex = (STATE.lastTemplateIndex + 1) % TEMPLATE_ROTATION.length;
  const currentTemplate = TEMPLATE_ROTATION[currentTemplateIndex];
  console.log(`Selected template: ${currentTemplate}`);
  const availableTopics = topicBank[currentTemplate];
  const recentlyUsed = STATE.usedTopics[currentTemplate] || [];
  const freshTopics = availableTopics.filter(t => !recentlyUsed.includes(t));
  const topicsToUse = freshTopics.length > 0 ? freshTopics : availableTopics;
  const selectedTopic = topicsToUse[0];
  console.log(`Selected topic: ${selectedTopic}`);
  if (!STATE.usedTopics[currentTemplate]) STATE.usedTopics[currentTemplate] = [];
  STATE.usedTopics[currentTemplate].push(selectedTopic);
  if (STATE.usedTopics[currentTemplate].length > 3) STATE.usedTopics[currentTemplate].shift();
  STATE.lastTemplateIndex = currentTemplateIndex;
  return {
    template: currentTemplate,
    topic: selectedTopic,
    promptFile: {
      interview_explainer: 'prompts/interview-explainer.md',
      architecture: 'prompts/architecture-comparison.md',
      optimization: 'prompts/optimization-story.md',
      layered: 'prompts/layered-mental-model.md'
    }[currentTemplate]
  };
}

async function generateContent(plan) {
  console.log('\nGenerating content...');
  console.log('Fetching templates...');
  const [promptTemplate, tone, visualRules] = await Promise.all([
    fetchGitHubFile(plan.promptFile),
    fetchGitHubFile('content-spec/tone.md'),
    fetchGitHubFile('content-spec/visual-rules.md')
  ]);
  console.log('Templates fetched');
  const systemPrompt =
    'You are a LinkedIn content creator for a senior data/AI engineer. Generate professional, educational content following the provided template and tone.';
  const userPrompt = `Template:\n${promptTemplate}\n\nTone:\n${tone}\n\nVisual Rules:\n${visualRules}\n\nTopic: ${plan.topic}\n\nGenerate a LinkedIn post with:\n1. Caption (6-12 lines, ending with a thoughtful question)\n2. Image metadata for hybrid infographic generation:\n   - imageType: "card" for simple bullet lists, "diagram" for comparisons (legacy - kept for backwards compatibility)\n   - imageLayout: "comparison" (side-by-side), "evolution" (horizontal flow), or "single" (deep dive)\n   - imageTheme: "chalkboard" (educational), "watercolor" (professional), or "tech" (technical)\n   - imageTitle: concise title (max 10 words)\n   - imageBullets: 3-5 bullet points (max 36 chars each) - legacy format\n   - imageSections: Array of structured sections with:\n     * title: Section heading\n     * type: "pros", "cons", or "neutral"\n     * items: Array of bullet points (max 36 chars each)\n   - imageInsight: Key takeaway quote (1-2 sentences)\n   - imageMood: "educational", "professional", or "technical" (used for theme selection)\n3. 5-8 relevant hashtags\n\nGuidelines for new image fields:\n- For comparison posts (A vs B, pros/cons): use imageLayout="comparison" with 2 sections\n- For evolution posts (stages, progression): use imageLayout="evolution" with 2-4 sections\n- For explanatory posts (deep dive): use imageLayout="single" with 2-3 sections\n- Match imageTheme to content mood: chalkboard=casual/educational, watercolor=professional/architectural, tech=technical/modern\n\nReturn as JSON: {"caption": "...", "imageType": "card"|"diagram", "imageLayout": "comparison"|"evolution"|"single", "imageTheme": "chalkboard"|"watercolor"|"tech", "imageTitle": "...", "imageBullets": [...], "imageSections": [{"title": "...", "type": "pros"|"cons"|"neutral", "items": [...]}], "imageInsight": "...", "imageMood": "...", "hashtags": [...]}`;
  console.log('Calling OpenAI...');
  const response = await callOpenAI(systemPrompt, userPrompt);
  const aiContent = response.choices[0].message.content;
  console.log('AI response received');
  let contentData;
  try {
    const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
    contentData = JSON.parse(jsonMatch ? jsonMatch[0] : aiContent);
  } catch (e) {
    console.error('Failed to parse:', aiContent);
    throw e;
  }
  return {
    ...contentData,
    fullCaption: `${contentData.caption}\n\n${contentData.hashtags.map(h => '#' + h).join(' ')}`,
    topic: plan.topic,
    template: plan.template,
    timestamp: new Date().toISOString()
  };
}

async function main() {
  console.log('Starting LinkedIn Content Engine\n');
  try {
    const plan = await planContent();
    const content = await generateContent(plan);
    console.log('\nGenerated Content:');
    console.log('='.repeat(80));
    console.log(`Template: ${content.template}`);
    console.log(`Topic: ${content.topic}`);
    console.log('='.repeat(80));
    console.log('\nCAPTION:');
    console.log(content.caption);
    console.log('\nIMAGE:');
    console.log(`Type: ${content.imageType || 'auto'}`);
    console.log(`Title: ${content.imageTitle}`);
    console.log('Bullets:');
    content.imageBullets.forEach((bullet, i) => console.log(`  ${i + 1}. ${bullet}`));
    console.log('\nHASHTAGS:');
    console.log(content.hashtags.map(h => '#' + h).join(' '));

    // Generate the image
    console.log('\n' + '-'.repeat(40));
    console.log('Generating image...');
    const sanitizedTopic = content.topic.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    console.log('Using hybrid image generator...');

    // Prepare content data for hybrid generator
    const hybridContentData = {
      title: content.imageTitle,
      subtitle: content.imageSubtitle || '',
      sections: content.imageSections || [],
      insight: content.imageInsight || '',
      theme: content.imageTheme,
      layout: content.imageLayout,
      imageMood: content.imageMood
    };

    const outputPath = path.join(__dirname, 'test-outputs', `${sanitizedTopic}-${Date.now()}.png`);

    const hybridResult = await generateHybridImage(hybridContentData, {
      outputPath,
      verbose: true
    });

    if (!hybridResult.success) {
      throw new Error(`Image generation failed: ${hybridResult.error}`);
    }

    const imageResult = {
      imagePath: hybridResult.imagePath,
      imageType: hybridResult.metadata.layout,
      theme: hybridResult.metadata.theme,
      latency: hybridResult.metadata.latency.total
    };
    console.log(`Image generated: ${imageResult.imagePath}`);
    console.log(`Theme: ${imageResult.theme}, Layout: ${imageResult.imageType}`);
    console.log(`Generation time: ${imageResult.latency}ms`);

    // Add image path to content
    content.imagePath = imageResult.imagePath;

    // Queue post for WhatsApp approval instead of direct posting
    console.log('\n' + '-'.repeat(40));
    console.log('Queuing post for WhatsApp approval...');

    const post = queue.addToQueue({
      content: content,
      imagePath: imageResult.imagePath || null
    });

    // Set notifiedAt (timeout checker uses this to measure elapsed time)
    post.notifiedAt = new Date().toISOString();

    // Determine public image URL for Twilio
    // Local file paths cannot be fetched by Twilio; pass null for local dev
    let imageUrl = null;
    const imgPath = imageResult.imagePath || '';
    if (imgPath && !imgPath.startsWith('/') && !imgPath.match(/^[A-Z]:\\/i)) {
      // Looks like a URL already
      imageUrl = imgPath;
    } else if (imgPath) {
      console.log('Note: Image is a local file path — Twilio cannot fetch it.');
      console.log('      Preview will be sent without image attachment.');
      console.log('      For production, upload images to a public URL first.');
    }

    // Send WhatsApp preview
    try {
      await sendPreview(post, imageUrl);
      console.log(`WhatsApp preview sent for post #${post.id}`);
    } catch (err) {
      console.error(`Failed to send WhatsApp preview: ${err.message}`);
      console.log('Post is still queued — approve via WhatsApp commands.');
    }

    // Persist notifiedAt update to post file
    const postFilePath = path.join(queue.PENDING_DIR, `${post.id}.json`);
    fs.writeFileSync(postFilePath, JSON.stringify(post, null, 2), 'utf8');

    // Also save to test-output.json for backwards compatibility
    const outputFile = path.join(__dirname, 'test-output.json');
    fs.writeFileSync(outputFile, JSON.stringify(content, null, 2));

    console.log('\n' + '='.repeat(80));
    console.log('\nSUCCESS!');
    console.log(`Post #${post.id} queued for approval`);
    console.log(`Reply YES ${post.id} or NO ${post.id} via WhatsApp`);
    console.log(`Saved to: ${outputFile}`);
  } catch (error) {
    console.error('\nERROR:', error.message);
    process.exit(1);
  }
}

main();
