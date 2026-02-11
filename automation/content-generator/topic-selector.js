const fs = require('fs');
const path = require('path');

const TOPIC_BANK_PATH = path.join(__dirname, '..', '..', 'topics', 'topic-bank.json');
const HISTORY_PATH = path.join(__dirname, '..', '.topic-history.json');
const MAX_HISTORY = 10; // Number of recent topics to avoid repeating

// Map topic-bank category keys to template names used by claude-client
const CATEGORY_TO_TEMPLATE = {
  interview_explainer: 'interview-explainer',
  architecture: 'architecture-comparison',
  optimization: 'optimization-story',
  layered: 'layered-mental-model'
};

/**
 * Load the topic bank from disk.
 * @returns {Object<string, string[]>} Category → topic list
 */
function loadTopicBank() {
  const raw = fs.readFileSync(TOPIC_BANK_PATH, 'utf-8');
  return JSON.parse(raw);
}

/**
 * Load the recently-used topic history.
 * @returns {string[]} List of recently used topic strings
 */
function loadHistory() {
  try {
    if (fs.existsSync(HISTORY_PATH)) {
      const raw = fs.readFileSync(HISTORY_PATH, 'utf-8');
      return JSON.parse(raw);
    }
  } catch {
    // Corrupted or missing history is fine — start fresh
  }
  return [];
}

/**
 * Save topic to history (ring buffer of MAX_HISTORY items).
 * @param {string} topic - The topic string that was just used
 */
function saveToHistory(topic) {
  const history = loadHistory();
  history.push(topic);

  // Keep only the most recent entries
  while (history.length > MAX_HISTORY) {
    history.shift();
  }

  fs.writeFileSync(HISTORY_PATH, JSON.stringify(history, null, 2));
}

/**
 * Select a topic that hasn't been used recently.
 * Picks randomly across all categories, avoiding recent repeats.
 * @returns {Promise<{ topic: string, template: string, category: string }>}
 */
async function selectTopic() {
  const topicBank = loadTopicBank();
  const history = loadHistory();
  const historySet = new Set(history);

  // Build a flat list of all available topics with metadata
  const allTopics = [];
  for (const [category, topics] of Object.entries(topicBank)) {
    const template = CATEGORY_TO_TEMPLATE[category];
    if (!template) {
      console.warn(`Topic Selector: Unknown category "${category}", skipping`);
      continue;
    }

    for (const topic of topics) {
      if (!historySet.has(topic)) {
        allTopics.push({ topic, template, category });
      }
    }
  }

  // If all topics have been used recently, reset history and use full bank
  if (allTopics.length === 0) {
    console.log('Topic Selector: All topics recently used, resetting history');
    fs.writeFileSync(HISTORY_PATH, JSON.stringify([]));

    for (const [category, topics] of Object.entries(topicBank)) {
      const template = CATEGORY_TO_TEMPLATE[category];
      if (!template) continue;
      for (const topic of topics) {
        allTopics.push({ topic, template, category });
      }
    }
  }

  // Pick a random topic
  const selected = allTopics[Math.floor(Math.random() * allTopics.length)];

  // Record it in history
  saveToHistory(selected.topic);

  console.log(`Topic Selector: Picked "${selected.topic}" (${selected.category}/${selected.template})`);
  return selected;
}

module.exports = { selectTopic, loadTopicBank, loadHistory };
