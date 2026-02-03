const express = require('express');
const twilio = require('twilio');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { parseCommand } = require('./message-parser');
const queue = require('./queue-manager');
const { sendConfirmation, sendPendingList } = require('./index');
const { sendToOwner } = require('./twilio-client');

const PORT = parseInt(process.env.WEBHOOK_PORT, 10) || 3000;
const WEBHOOK_PATH = process.env.WEBHOOK_PATH || '/whatsapp/incoming';

const app = express();

// Twilio sends form-urlencoded POST data
app.use(express.urlencoded({ extended: false }));

/**
 * Middleware: Validate Twilio request signature.
 * Uses X-Twilio-Signature header + TWILIO_AUTH_TOKEN to verify
 * that requests genuinely come from Twilio.
 *
 * Controlled by WEBHOOK_VALIDATE_SIGNATURE env var (default: true).
 * Set to 'false' for local development without ngrok.
 */
function validateTwilioSignature(req, res, next) {
  if (process.env.WEBHOOK_VALIDATE_SIGNATURE === 'false') {
    return next();
  }

  const signature = req.headers['x-twilio-signature'];
  if (!signature) {
    console.warn('Webhook: Missing X-Twilio-Signature header — rejected');
    return res.status(403).type('text/xml').send('<Response></Response>');
  }

  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!authToken) {
    console.error('Webhook: TWILIO_AUTH_TOKEN not set — cannot validate signature');
    return res.status(403).type('text/xml').send('<Response></Response>');
  }

  // Build the full URL Twilio used to sign the request.
  // WEBHOOK_URL overrides auto-detection (needed behind proxies/ngrok).
  const webhookUrl = process.env.WEBHOOK_URL
    || `${req.protocol}://${req.get('host')}${req.originalUrl}`;

  const isValid = twilio.validateRequest(authToken, signature, webhookUrl, req.body);
  if (!isValid) {
    console.warn('Webhook: Invalid Twilio signature — rejected');
    return res.status(403).type('text/xml').send('<Response></Response>');
  }

  next();
}

/**
 * Twilio webhook endpoint — receives incoming WhatsApp messages.
 * Extracts Body and From, parses the command, and routes to the handler.
 * Responds with empty TwiML (actual replies sent via Twilio API).
 */
app.post(WEBHOOK_PATH, validateTwilioSignature, async (req, res) => {
  const messageBody = req.body.Body || '';
  const sender = req.body.From || '';

  console.log(`Webhook: Received from ${sender}: "${messageBody}"`);

  // Respond immediately with empty TwiML to acknowledge receipt
  res.type('text/xml');
  res.send('<Response></Response>');

  // Parse and handle the command asynchronously
  try {
    const parsed = parseCommand(messageBody);

    if (!parsed.valid) {
      await sendToOwner(parsed.error);
      return;
    }

    await handleCommand(parsed);
  } catch (err) {
    console.error(`Webhook: Error handling message: ${err.message}`);
    try {
      await sendToOwner('An error occurred processing your command. Please try again.');
    } catch (sendErr) {
      console.error(`Webhook: Failed to send error response: ${sendErr.message}`);
    }
  }
});

/**
 * Route a parsed command to the appropriate handler.
 */
async function handleCommand(parsed) {
  switch (parsed.command) {
    case 'approve':
      await handleApprove(parsed.postId);
      break;
    case 'reject':
      await handleReject(parsed.postId);
      break;
    case 'list':
      await handleList();
      break;
    case 'status':
      await handleStatus();
      break;
    case 'approve_all':
      await handleApproveAll();
      break;
    case 'reject_all':
      await handleRejectAll();
      break;
    default:
      await sendToOwner(`Unknown command: ${parsed.command}`);
  }
}

/**
 * Approve a single post: update status, post to LinkedIn (stub), confirm.
 */
async function handleApprove(postId) {
  const post = queue.getPost(postId);
  if (!post) {
    await sendToOwner(`Post #${postId} not found.`);
    return;
  }
  if (post.status !== 'pending') {
    await sendToOwner(`Post #${postId} is already ${post.status}.`);
    return;
  }

  queue.updateStatus(postId, 'approved');

  // TODO: Post to LinkedIn (stub — will be implemented in Phase 5)
  console.log(`Webhook: Post #${postId} approved — LinkedIn posting stub`);

  await sendConfirmation(postId, 'approved');
}

/**
 * Reject a single post: update status, confirm.
 */
async function handleReject(postId) {
  const post = queue.getPost(postId);
  if (!post) {
    await sendToOwner(`Post #${postId} not found.`);
    return;
  }
  if (post.status !== 'pending') {
    await sendToOwner(`Post #${postId} is already ${post.status}.`);
    return;
  }

  queue.updateStatus(postId, 'rejected');
  await sendConfirmation(postId, 'rejected');
}

/**
 * List all pending posts.
 */
async function handleList() {
  const pending = queue.listPending();
  await sendPendingList(pending);
}

/**
 * Send queue status: pending count, total posts, uptime.
 */
async function handleStatus() {
  const pending = queue.listPending();
  const uptime = process.uptime();
  const hours = Math.floor(uptime / 3600);
  const mins = Math.floor((uptime % 3600) / 60);

  const body = [
    '📊 System Status',
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    `Pending posts: ${pending.length}`,
    `Server uptime: ${hours}h ${mins}m`,
    `Webhook: active`,
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
  ].join('\n');

  await sendToOwner(body);
}

/**
 * Approve all pending posts.
 */
async function handleApproveAll() {
  const pending = queue.listPending();
  if (pending.length === 0) {
    await sendToOwner('No pending posts to approve.');
    return;
  }

  for (const post of pending) {
    queue.updateStatus(post.id, 'approved');
    // TODO: Post to LinkedIn (stub)
    console.log(`Webhook: Post #${post.id} approved — LinkedIn posting stub`);
  }

  await sendToOwner(`✅ ${pending.length} post(s) approved and queued for LinkedIn.`);
}

/**
 * Reject all pending posts.
 */
async function handleRejectAll() {
  const pending = queue.listPending();
  if (pending.length === 0) {
    await sendToOwner('No pending posts to reject.');
    return;
  }

  for (const post of pending) {
    queue.updateStatus(post.id, 'rejected');
  }

  await sendToOwner(`❌ ${pending.length} post(s) rejected.`);
}

// Start server only when run directly (not when required for testing)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`WhatsApp webhook server running on port ${PORT}`);
    console.log(`Webhook endpoint: POST http://localhost:${PORT}${WEBHOOK_PATH}`);
  });
}

module.exports = { app, handleCommand, validateTwilioSignature };
