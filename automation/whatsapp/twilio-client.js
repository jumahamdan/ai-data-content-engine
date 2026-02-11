const twilio = require('twilio');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const REQUIRED_VARS = ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_WHATSAPP_FROM', 'WHATSAPP_TO'];

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

function validateEnv() {
  const missing = REQUIRED_VARS.filter(v => !process.env[v]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

function createClient() {
  validateEnv();
  return twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Send a WhatsApp message via Twilio with retry logic.
 * @param {string} to - Recipient in "whatsapp:+1..." format
 * @param {string} body - Message text
 * @param {string|null} mediaUrl - Optional public URL for image attachment
 * @returns {Promise<object>} Twilio message object
 */
async function sendMessage(to, body, mediaUrl = null) {
  const client = createClient();

  const params = {
    from: process.env.TWILIO_WHATSAPP_FROM,
    to,
    body
  };

  if (mediaUrl) {
    params.mediaUrl = [mediaUrl];
  }

  let lastError;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const message = await client.messages.create(params);
      console.log(`WhatsApp message sent (SID: ${message.sid})`);
      return message;
    } catch (error) {
      lastError = error;
      console.error(`Send attempt ${attempt}/${MAX_RETRIES} failed: ${error.message}`);
      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAY_MS * attempt);
      }
    }
  }

  throw new Error(`Failed to send WhatsApp message after ${MAX_RETRIES} attempts: ${lastError.message}`);
}

/**
 * Send a WhatsApp message to the default recipient (WHATSAPP_TO).
 */
async function sendToOwner(body, mediaUrl = null) {
  return sendMessage(process.env.WHATSAPP_TO, body, mediaUrl);
}

module.exports = {
  sendMessage,
  sendToOwner,
  validateEnv,
  createClient
};
