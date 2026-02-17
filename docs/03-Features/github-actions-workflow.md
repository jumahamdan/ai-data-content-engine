# Feature: GitHub Actions Workflow

> **Status:** Complete (LinkedIn posting is MVP stub)
> **Priority:** High (Core MVP)
> **Branch:** `feature/github-actions-workflow`

---

## Overview

Replace local n8n workflow with GitHub Actions for fully serverless content generation and publishing. Runs on schedule without requiring any local infrastructure.

## Goals

1. Generate 2 posts daily (8am + 4pm CT)
2. Automatic WhatsApp notification on generation
3. Publish approved posts to LinkedIn
4. Zero local dependencies - runs entirely in cloud

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    GITHUB ACTIONS WORKFLOWS                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  automation.yml (generate job)     automation.yml (publish job)  │
│  ┌─────────────────────┐          ┌─────────────────────┐       │
│  │ Trigger: cron       │          │ Trigger: cron       │       │
│  │ 8:00 AM CT (14:00 Z)│          │ Every 15 minutes    │       │
│  │ 4:00 PM CT (22:00 Z)│          │                     │       │
│  ├─────────────────────┤          ├─────────────────────┤       │
│  │ 1. Select topic     │          │ 1. Query approved   │       │
│  │ 2. Generate content │          │ 2. Post to LinkedIn │       │
│  │ 3. Save to Firestore│          │ 3. Mark published   │       │
│  │ 4. Send WhatsApp    │          │                     │       │
│  └─────────────────────┘          └─────────────────────┘       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Implementation Tasks

### Phase 1: Content Generator Module

- [x] **Task 1.1:** Create `automation/content-generator/index.js`
  - Main entry point for content generation
  - Orchestrates topic selection → Claude API → Firestore

- [x] **Task 1.2:** Create `automation/content-generator/claude-client.js`
  - Wrapper for Claude/Anthropic API
  - Uses prompt templates from `prompts/` folder
  - Returns structured content (caption, hashtags, topic)

- [x] **Task 1.3:** Create `automation/content-generator/topic-selector.js`
  - Reads from `topics/topic-bank.json`
  - Tracks recently used topics (avoid repeats)
  - Returns topic with template name

- [x] **Task 1.4:** Test content generator locally

### Phase 2: Publisher Module

- [x] **Task 2.1:** Create `automation/publisher/index.js`
  - Query Firestore for approved posts
  - Call platform adapters to publish
  - Update status to `published`

- [x] **Task 2.2:** Create `automation/publisher/platforms/linkedin.js`
  - LinkedIn API integration
  - MVP: Log post (no actual posting)
  - Future: OAuth + real posting

- [x] **Task 2.3:** Test publisher locally

### Phase 3: GitHub Actions Workflows

- [x] **Task 3.1:** Create `.github/workflows/automation.yml` (consolidated generate + publish)

- [x] **Task 3.2:** Workflow dispatch dropdown (generate / publish / both)

- [x] **Task 3.3:** Add GitHub Secrets
  - `ANTHROPIC_API_KEY`
  - `FIREBASE_SERVICE_ACCOUNT` (base64 encoded)
  - `TWILIO_ACCOUNT_SID`
  - `TWILIO_AUTH_TOKEN`
  - `TWILIO_WHATSAPP_FROM`
  - `WHATSAPP_TO`

- [x] **Task 3.4:** Test workflows manually via workflow_dispatch

### Phase 4: Integration Testing

- [ ] **Task 4.1:** End-to-end test
  1. Trigger generate-content workflow
  2. Receive WhatsApp notification
  3. Approve via WhatsApp
  4. Verify status changes in Firestore
  5. Trigger publish-content workflow
  6. Verify post marked as published

- [ ] **Task 4.2:** Error handling verification
  - API failures gracefully logged
  - Partial failures don't break workflow
  - Notifications on errors (optional)

---

## File Structure

```
automation/
├── content-generator/
│   ├── index.js              # Main entry: generatePost()
│   ├── claude-client.js      # callClaude(prompt) → content
│   └── topic-selector.js     # selectTopic() → {topic, template}
│
├── publisher/
│   ├── index.js              # Main entry: publishApproved()
│   ├── firestore-client.js   # Shared Firestore utilities
│   └── platforms/
│       └── linkedin.js       # postToLinkedIn(content)
│
└── whatsapp/                 # ✅ Already built
    ├── firestore-queue.js
    └── twilio-client.js

.github/
└── workflows/
    ├── ci.yml              # Lint + format + SonarCloud on PRs
    └── automation.yml      # Generate + publish (cron/manual dispatch)
```

---

## GitHub Secrets Setup

### 1. ANTHROPIC_API_KEY
Get from: https://console.anthropic.com/
```
sk-ant-api03-...
```

### 2. FIREBASE_SERVICE_ACCOUNT
Base64 encode the service account JSON:
```powershell
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((Get-Content -Path "config/firebase-service-account.json" -Raw)))
```

### 3. Twilio Credentials
Get from: https://console.twilio.com/
- `TWILIO_ACCOUNT_SID`: ACxxxxxxx
- `TWILIO_AUTH_TOKEN`: xxxxxxx
- `TWILIO_WHATSAPP_FROM`: whatsapp:+14155238886
- `WHATSAPP_TO`: whatsapp:+1xxxxxxxxxx

---

## Content Generation Prompt

The generator uses prompts from `prompts/` folder based on topic template:

```javascript
// topic-selector returns:
{
  topic: "Why batch processing still matters in 2026",
  template: "interview-explainer",
  category: "data-engineering"
}

// claude-client loads: prompts/interview-explainer.md
// and generates LinkedIn-formatted content
```

---

## Schedule Configuration

| Time (CT) | Time (UTC) | Cron Expression | Purpose      |
| --------- | ---------- | --------------- | ------------ |
| 8:00 AM   | 14:00      | `0 14 * * *`    | Morning post |
| 4:00 PM   | 22:00      | `0 22 * * *`    | Evening post |

**Note:** CT = Central Time (America/Chicago). Adjust cron for daylight saving if needed.

---

## Error Handling

```javascript
// content-generator/index.js
try {
  const topic = await selectTopic();
  const content = await generateContent(topic);
  await saveToFirestore(content);
  await sendWhatsAppNotification(content);
} catch (error) {
  console.error('Generation failed:', error.message);
  // Optionally: send error notification
  process.exit(1); // Fail the workflow
}
```

---

## Testing Locally

```bash
# Set environment variables
export ANTHROPIC_API_KEY="sk-ant-..."
export FIREBASE_SERVICE_ACCOUNT="$(cat config/firebase-service-account.json | base64)"

# Or use .env file
cd automation
cp .env.example .env
# Edit .env with your values

# Test generation
node content-generator/index.js

# Test publishing
node publisher/index.js
```

---

## Future Enhancements

- [x] ~~Image generation with DALL-E or hybrid generator~~ (done — Gemini + DALL-E hybrid pipeline)
- [ ] LinkedIn OAuth & real posting (replace MVP stub)
- [ ] Multi-platform support (Instagram, Facebook)
- [ ] Analytics tracking
- [ ] A/B testing different content styles
- [ ] Automatic topic refinement based on engagement

---

## Claude AI Development Prompt

```
Follow the workflow in docs/04-Development/AI_AGENT_INSTRUCTIONS.md

I want to continue building the GitHub Actions workflow.
Read docs/03-Features/github-actions-workflow.md for task list.
Read docs/02-Architecture/system-architecture.md for system design.
```

---

[← Back to Architecture](../02-Architecture/system-architecture.md) | [← Back to README](../../README.md)
