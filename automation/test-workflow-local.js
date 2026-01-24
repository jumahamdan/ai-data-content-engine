const https = require('https');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

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
        'Authorization': `token ${CONFIG.githubToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    };
    https.get(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          const json = JSON.parse(data);
          let content = Buffer.from(json.content, 'base64').toString('utf8');
          // Remove BOM if present
          if (content.charCodeAt(0) === 0xFEFF) {
            content = content.slice(1);
          }
          resolve(content);
        } else {
          reject(new Error(`GitHub API error: ${res.statusCode}`));
        }
      });
    }).on('error', reject);
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
        'Authorization': `Bearer ${CONFIG.openaiKey}`,
        'Content-Length': Buffer.byteLength(payload)
      }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
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
    promptFile: `prompts/${currentTemplate.replace('_', '-')}.md`
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
  const systemPrompt = 'You are a LinkedIn content creator for a senior data/AI engineer. Generate professional, educational content following the provided template and tone.';
  const userPrompt = `Template:\n${promptTemplate}\n\nTone:\n${tone}\n\nVisual Rules:\n${visualRules}\n\nTopic: ${plan.topic}\n\nGenerate a LinkedIn post with:\n1. Caption (6-12 lines, ending with a thoughtful question)\n2. Image text with title and 3-5 bullet points\n3. 5-8 relevant hashtags\n\nReturn as JSON: {"caption": "...", "imageTitle": "...", "imageBullets": [...], "hashtags": [...]}`;
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
    console.log(`Title: ${content.imageTitle}`);
    console.log('Bullets:');
    content.imageBullets.forEach((bullet, i) => console.log(`  ${i + 1}. ${bullet}`));
    console.log('\nHASHTAGS:');
    console.log(content.hashtags.map(h => '#' + h).join(' '));
    console.log('\n' + '='.repeat(80));
    console.log('\nSUCCESS!');
    const outputFile = path.join(__dirname, 'test-output.json');
    fs.writeFileSync(outputFile, JSON.stringify(content, null, 2));
    console.log(`\nSaved to: ${outputFile}`);
  } catch (error) {
    console.error('\nERROR:', error.message);
    process.exit(1);
  }
}

main();