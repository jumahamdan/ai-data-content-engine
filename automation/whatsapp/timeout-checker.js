const fs = require('fs');
const path = require('path');
const queue = require('./queue-manager');
const { sendConfirmation } = require('./index');

const TIMEOUT_MS = 60 * 60 * 1000; // 60 minutes
const CHECK_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

let intervalHandle = null;

/**
 * Check all pending posts for timeout.
 * If a post was notified > 60 min ago and has not received a timeout
 * notification yet, send a timeout notification and record the timestamp.
 *
 * @returns {Promise<number>} Number of posts that timed out
 */
async function checkTimeouts() {
  const pending = queue.listPending();
  let timedOut = 0;

  for (const post of pending) {
    // Skip posts that were never sent to the user
    if (!post.notifiedAt) continue;

    // Skip posts that already received a timeout notification
    if (post.timeoutNotifiedAt) continue;

    const notifiedAge = Date.now() - new Date(post.notifiedAt).getTime();
    if (notifiedAge >= TIMEOUT_MS) {
      console.log(`Timeout: Post #${post.id} has been pending for ${Math.round(notifiedAge / 60000)} min`);

      try {
        await sendConfirmation(post.id, 'timeout');
      } catch (err) {
        console.error(`Timeout: Failed to send timeout notification for #${post.id}: ${err.message}`);
        continue;
      }

      // Update timeoutNotifiedAt on the post file
      const updated = queue.getPost(post.id);
      if (updated) {
        updated.timeoutNotifiedAt = new Date().toISOString();
        fs.writeFileSync(path.join(queue.PENDING_DIR, `${post.id}.json`), JSON.stringify(updated, null, 2), 'utf8');
        console.log(`Timeout: Post #${post.id} timeout notification sent`);
      }

      timedOut++;
    }
  }

  if (timedOut > 0) {
    console.log(`Timeout: ${timedOut} post(s) timed out`);
  }

  return timedOut;
}

/**
 * Start the periodic timeout checker.
 * @param {number} [intervalMs] - Override interval (useful for testing)
 * @returns {object} The interval handle
 */
function startTimeoutChecker(intervalMs = CHECK_INTERVAL_MS) {
  if (intervalHandle) {
    console.log('Timeout: Checker already running');
    return intervalHandle;
  }

  console.log(`Timeout: Starting checker (interval: ${intervalMs / 1000}s, timeout: ${TIMEOUT_MS / 60000}min)`);

  // Run immediately on start, then on interval
  checkTimeouts().catch(err => {
    console.error(`Timeout: Initial check failed: ${err.message}`);
  });

  intervalHandle = setInterval(() => {
    checkTimeouts().catch(err => {
      console.error(`Timeout: Periodic check failed: ${err.message}`);
    });
  }, intervalMs);

  return intervalHandle;
}

/**
 * Stop the periodic timeout checker.
 */
function stopTimeoutChecker() {
  if (intervalHandle) {
    clearInterval(intervalHandle);
    intervalHandle = null;
    console.log('Timeout: Checker stopped');
  }
}

module.exports = {
  checkTimeouts,
  startTimeoutChecker,
  stopTimeoutChecker,
  TIMEOUT_MS,
  CHECK_INTERVAL_MS
};
