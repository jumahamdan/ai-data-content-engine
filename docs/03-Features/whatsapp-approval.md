# Feature: WhatsApp Post Approval System

> **Status:** ✅ Complete
> **Branch:** `feature/whatsapp-approval`
> **Integration:** Twilio WhatsApp API
> **Priority:** MVP Blocker

---

## Goal

Add a WhatsApp-based approval flow so you can preview and approve/reject posts before they go live on LinkedIn. Posts queue up if you're busy, and you can selectively approve them later.

---

## Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                     WHATSAPP APPROVAL SYSTEM                       │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│   Cron / n8n Trigger                                               │
│       │                                                            │
│       ▼                                                            │
│   Generate Content (OpenAI)                                        │
│       │                                                            │
│       ▼                                                            │
│   Generate Image (Puppeteer)                                       │
│       │                                                            │
│       ▼                                                            │
│   ┌─────────────────────────────┐                                  │
│   │  queue-manager.js           │ ← File-based JSON queue          │
│   │  addToQueue(post)           │   pending-posts/<id>.json        │
│   └──────────────┬──────────────┘                                  │
│                  │                                                  │
│                  ▼                                                  │
│   ┌─────────────────────────────┐                                  │
│   │  index.js                   │                                  │
│   │  sendPreview(post, imgUrl)  │ → Twilio WhatsApp API            │
│   └──────────────┬──────────────┘       │                          │
│                  │                      │                          │
│                  ▼                      ▼                          │
│            User's WhatsApp ◄────── Preview message                 │
│                  │                                                  │
│         User replies "YES 47"                                      │
│                  │                                                  │
│                  ▼                                                  │
│   ┌─────────────────────────────┐                                  │
│   │  webhook-handler.js         │ ← Express server on :3000       │
│   │  POST /whatsapp/incoming    │   Validates Twilio signature     │
│   └──────────────┬──────────────┘                                  │
│                  │                                                  │
│                  ▼                                                  │
│   ┌─────────────────────────────┐                                  │
│   │  message-parser.js          │                                  │
│   │  parseCommand("YES 47")     │ → { command: 'approve', id: 47 }│
│   └──────────────┬──────────────┘                                  │
│                  │                                                  │
│          ┌───────┴───────┐                                         │
│          ▼               ▼                                         │
│   ┌────────────┐  ┌────────────┐                                   │
│   │ Approve    │  │ Reject     │                                   │
│   │ update     │  │ update     │                                   │
│   │ status     │  │ status     │                                   │
│   └─────┬──────┘  └────────────┘                                   │
│         │                                                          │
│         ▼                                                          │
│   ┌─────────────────────────────┐                                  │
│   │  linkedin-poster.js         │ → LinkedIn API (stub for now)    │
│   │  postToLinkedIn(post)       │                                  │
│   └─────────────────────────────┘                                  │
│                                                                    │
│   ┌─────────────────────────────┐                                  │
│   │  timeout-checker.js         │ ← Runs every 5 min              │
│   │  Posts pending > 60 min     │   Sends reminder notification    │
│   │  get timeout notification   │                                  │
│   └─────────────────────────────┘                                  │
│                                                                    │
│   ┌─────────────────────────────┐                                  │
│   │  twilio-client.js           │ ← SDK wrapper with retry logic  │
│   │  sendMessage / sendToOwner  │   3 retries, exponential backoff│
│   └─────────────────────────────┘                                  │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### File Structure

```
automation/
├── whatsapp/
│   ├── index.js              # sendPreview, sendConfirmation, sendPendingList
│   ├── twilio-client.js      # Twilio SDK wrapper (retry, validation)
│   ├── message-parser.js     # Parse WhatsApp commands
│   ├── queue-manager.js      # File-based pending post queue
│   ├── webhook-handler.js    # Express server for Twilio webhooks
│   ├── timeout-checker.js    # Periodic timeout notification checker
│   ├── test-connection.js    # Component connectivity test
│   ├── test-linkedin-poster.js  # LinkedIn poster stub test
│   └── test-e2e-flow.js     # Full end-to-end flow test
├── linkedin-poster.js        # LinkedIn API stub (postToLinkedIn)
├── pending-posts/            # Queue storage (gitignored)
│   └── .gitkeep
└── ...
```

---

## Setup Instructions

### 1. Create Twilio Account
1. Go to https://www.twilio.com/try-twilio
2. Sign up (free trial includes WhatsApp sandbox)
3. Verify your phone number

### 2. Enable WhatsApp Sandbox
1. Go to Console → Messaging → Try it out → Send a WhatsApp message
2. Follow instructions to join sandbox (send "join <sandbox-word>" to Twilio number)
3. Note your Twilio WhatsApp number: `whatsapp:+14155238886` (sandbox)

### 3. Get Credentials
1. Go to Console → Account → API keys & tokens
2. Copy **Account SID** and **Auth Token**
3. Add to `automation/.env`:
   ```
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=your_auth_token_here
   TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
   WHATSAPP_TO=whatsapp:+1YOURNUMBER
   ```

### 4. Configure Webhook (for receiving replies)
1. Go to Console → Messaging → Settings → WhatsApp Sandbox Settings
2. Set "When a message comes in" webhook URL to your server
3. Options for webhook hosting:
   - **ngrok** (local development): `ngrok http 3000`
   - **Cloudflare Tunnel** (free, persistent)
   - **Deploy webhook to Vercel/Railway** (production)

### 5. Test Connection
```bash
cd automation
node whatsapp/test-connection.js            # Full test (sends a message)
node whatsapp/test-connection.js --dry-run   # Validate config only
```

---

## Usage Guide

### WhatsApp Commands

| Command    | Action                             |
| ---------- | ---------------------------------- |
| `yes 47`   | Approve and post #47 to LinkedIn   |
| `no 47`    | Discard post #47                   |
| `list`     | Show all pending posts             |
| `yes all`  | Approve and post all pending       |
| `no all`   | Discard all pending                |
| `status`   | Show system status and queue count |

**Note:** Commands are case-insensitive. "YES 47", "yes 47", "Yes 47" all work.

### Post Lifecycle

1. **Generated** — Content + image created by workflow
2. **Pending** — Added to queue, preview sent to WhatsApp
3. **Approved** → Posted to LinkedIn (stub), removed from queue
4. **Rejected** → Discarded, removed from queue
5. **Timed out** → Reminder sent after 60 min, stays pending for later action
6. **Expired** → Auto-cleaned after 7 days

### Message Format Examples

**Preview Message:**
```
📋 Post #47 - Medallion Architecture
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 Caption Preview:
The Bronze-Silver-Gold pattern transformed how we think about data quality...

🏷️ Hashtags:
#DataEngineering #MedallionArchitecture #DataLakehouse

🖼️ [Image attached]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Reply: YES 47 to post | NO 47 to skip
```

**Confirmation Messages:**
```
✅ Post #47 published to LinkedIn!
❌ Post #47 discarded.
⏸️ Post #47 pending (no response in 60 min).
   Reply YES 47 to post anyway, or NO 47 to discard.
```

---

## Testing Instructions

### Quick smoke test (no external services)
```bash
cd automation
node whatsapp/test-e2e-flow.js
```
Runs the full queue → parse → approve → LinkedIn → cleanup flow locally. Outputs step-by-step progress and PASS/FAIL.

### LinkedIn poster stub test
```bash
node whatsapp/test-linkedin-poster.js
```
Creates mock posts and verifies the stub returns the expected response shape.

### Full component connectivity test
```bash
node whatsapp/test-connection.js --dry-run   # Config validation only
node whatsapp/test-connection.js              # Sends a real test message
```
Checks environment variables, Twilio credentials, queue directory, webhook handler, and timeout checker.

### All automated tests
```bash
npm test
```

---

## Troubleshooting

| Issue                                 | Solution                                                             |
| ------------------------------------- | -------------------------------------------------------------------- |
| "Twilio credentials invalid"          | Check `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN` in `.env`         |
| "WhatsApp message not received"       | Ensure you've joined the Twilio sandbox                              |
| "Webhook not receiving messages"      | Check ngrok/tunnel is running, URL is correct in Twilio console      |
| "Image not attaching"                 | Ensure image URL is publicly accessible (Twilio fetches it)          |
| "Queue file corrupted"               | Delete the specific JSON file in `pending-posts/`                    |
| "Port 3000 already in use"           | Change `WEBHOOK_PORT` in `.env` or stop the other process            |
| "Signature validation failed"        | Set `WEBHOOK_URL` in `.env` or set `WEBHOOK_VALIDATE_SIGNATURE=false`|
| "Timeout notifications not sending"  | Check that `notifiedAt` is set on the post (preview was sent)        |
| Tests show 0 pending but posts exist | Run `node -e "require('./whatsapp/queue-manager').cleanupExpired()"` |

---

## Environment Variables Reference

| Variable                       | Required | Default                  | Description                              |
| ------------------------------ | -------- | ------------------------ | ---------------------------------------- |
| `TWILIO_ACCOUNT_SID`           | Yes      | —                        | Twilio Account SID                       |
| `TWILIO_AUTH_TOKEN`            | Yes      | —                        | Twilio Auth Token                        |
| `TWILIO_WHATSAPP_FROM`         | Yes      | —                        | Twilio WhatsApp sender (sandbox number)  |
| `WHATSAPP_TO`                  | Yes      | —                        | Your WhatsApp number (recipient)         |
| `WEBHOOK_PORT`                 | No       | `3000`                   | Port for the webhook Express server      |
| `WEBHOOK_PATH`                 | No       | `/whatsapp/incoming`     | Path for the Twilio webhook endpoint     |
| `WEBHOOK_URL`                  | No       | auto-detected            | Full webhook URL (for signature check)   |
| `WEBHOOK_VALIDATE_SIGNATURE`   | No       | `true`                   | Set `false` to skip signature validation |

---

## Implementation Phases (Completed)

### Phase 1: Twilio Integration ✅
- [x] Task 1.1: Create `twilio-client.js` — SDK wrapper with retry logic
- [x] Task 1.2: Create `whatsapp/index.js` — sendPreview, sendConfirmation, sendPendingList
- [x] Task 1.3: Test sending WhatsApp with image
- [x] Task 1.4: Update `.env.example` with Twilio variables

### Phase 2: Queue System ✅
- [x] Task 2.1: Create `queue-manager.js` — File-based pending queue
- [x] Task 2.2: Implement addToQueue, getPost, updateStatus, listPending, deletePost
- [x] Task 2.3: Create `pending-posts/` directory (gitignored)
- [x] Task 2.4: Add auto-cleanup for posts older than 7 days

### Phase 3: Command Parser ✅
- [x] Task 3.1: Create `message-parser.js` — Parse incoming commands
- [x] Task 3.2: Handle: yes/no <id>, list, yes/no all, status
- [x] Task 3.3: Case-insensitive matching and error handling

### Phase 4: Webhook Handler ✅
- [x] Task 4.1: Create `webhook-handler.js` — Express server for Twilio webhook
- [x] Task 4.2: Validate Twilio request signature (security)
- [x] Task 4.3: Process incoming messages and trigger appropriate actions
- [x] Task 4.4: Add `/health` endpoint for monitoring

### Phase 5: Workflow Integration ✅
- [x] Task 5.1: Update workflow to queue posts for WhatsApp approval
- [x] Task 5.2: Add timeout logic (60 min → notify user post was skipped)
- [x] Task 5.3: Create LinkedIn poster stub and integrate
- [x] Task 5.4: Update n8n workflow JSON with approval nodes

### Phase 6: Testing & Documentation ✅
- [x] Task 6.1: Enhance test-connection.js with full component checks + --dry-run
- [x] Task 6.2: Create test-linkedin-poster.js — manual integration test
- [x] Task 6.3: Create test-e2e-flow.js — end-to-end flow test
- [x] Task 6.4: Update documentation (this file)
- [x] Task 6.5: Update README.md with feature section
- [x] Task 6.6: Final validation

---

## Future Enhancements (Post-MVP)

| Feature             | Description                             | Complexity |
| ------------------- | --------------------------------------- | ---------- |
| Edit/Regenerate     | `redo 47` to regenerate with same topic | Medium     |
| Feedback-based redo | `redo 47 make it shorter`               | High       |
| Scheduled approval  | `yes 47 at 5pm`                         | Medium     |
| Batch preview       | Preview next 5 posts at once            | Low        |
| Web dashboard       | Edit posts in browser                   | High       |
| LinkedIn OAuth      | Replace poster stub with real API       | Medium     |

---

[← Back to TODO](../../TODO.md) | [Development Guide](../claude-development-guide.md)
