/**
 * WhatsApp Message Parser
 * Parses incoming WhatsApp messages into structured commands.
 *
 * Supported commands:
 *   yes <id>   → approve a specific post
 *   no <id>    → reject a specific post
 *   yes all    → approve all pending posts
 *   no all     → reject all pending posts
 *   list       → show all pending posts
 *   status     → show system status
 */

/**
 * Parse a WhatsApp message body into a command object.
 * @param {string} messageBody - Raw message text from WhatsApp
 * @returns {{ command: string, postId: string|null, valid: boolean, error: string|null }}
 */
function parseCommand(messageBody) {
  if (!messageBody || typeof messageBody !== 'string') {
    return {
      command: null,
      postId: null,
      valid: false,
      error: 'Empty message. Valid commands: yes <id>, no <id>, list, status, yes all, no all'
    };
  }

  const trimmed = messageBody.trim().toLowerCase();

  if (!trimmed) {
    return {
      command: null,
      postId: null,
      valid: false,
      error: 'Empty message. Valid commands: yes <id>, no <id>, list, status, yes all, no all'
    };
  }

  const parts = trimmed.split(/\s+/);
  const keyword = parts[0];

  // Single-word commands: list, status
  if (keyword === 'list') {
    return { command: 'list', postId: null, valid: true, error: null };
  }

  if (keyword === 'status') {
    return { command: 'status', postId: null, valid: true, error: null };
  }

  // Two-word commands: yes/no + id or "all"
  if (keyword === 'yes' || keyword === 'no') {
    if (parts.length < 2) {
      return {
        command: null,
        postId: null,
        valid: false,
        error: `Please specify a post ID. Example: ${keyword} 47`
      };
    }

    const target = parts[1];

    if (target === 'all') {
      return {
        command: keyword === 'yes' ? 'approve_all' : 'reject_all',
        postId: null,
        valid: true,
        error: null
      };
    }

    // Validate post ID is a positive integer
    const id = parseInt(target, 10);
    if (isNaN(id) || id <= 0 || String(id) !== target) {
      return {
        command: null,
        postId: null,
        valid: false,
        error: `Post ID must be a number. Example: ${keyword} 47`
      };
    }

    return {
      command: keyword === 'yes' ? 'approve' : 'reject',
      postId: String(id),
      valid: true,
      error: null
    };
  }

  // Unknown command
  return {
    command: null,
    postId: null,
    valid: false,
    error: `Unknown command: "${keyword}". Valid commands: yes <id>, no <id>, list, status, yes all, no all`
  };
}

module.exports = { parseCommand };
