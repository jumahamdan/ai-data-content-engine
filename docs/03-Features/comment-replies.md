# Feature: AI Comment Reply System

> **Status:** ⏳ Waiting for LinkedIn API Approval  
> **Branch:** `feature/comment-replies`  
> **Dependency:** WhatsApp Approval System (reuses infrastructure)  
> **API Required:** Community Management API (requested)  
> **Priority:** Phase 2 (after MVP)

---

## Goal

Automatically monitor LinkedIn post comments and generate personalized replies in your voice. All replies go through WhatsApp approval before posting to maintain authenticity and control.

---

## User Flow

```
┌─────────────────────────────────────────────────────────────┐
│                  COMMENT REPLY FLOW                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Poll LinkedIn API (every 30-60 min)                       │
│       │                                                     │
│       ▼                                                     │
│  Fetch new comments on recent posts                        │
│       │                                                     │
│       ▼                                                     │
│  For each new comment:                                     │
│       │                                                     │
│       ├── Analyze: question? compliment? disagreement?     │
│       │                                                     │
│       ▼                                                     │
│  Generate reply using GPT-4 + Voice Profile                │
│       │                                                     │
│       ▼                                                     │
│  Send to WhatsApp for approval                             │
│       │                                                     │
│       ├── "YES 47" → Post reply to LinkedIn                │
│       ├── "EDIT 47 <changes>" → Modify, then post          │
│       └── "SKIP 47" → Don't reply, log as skipped          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Voice Profile

GPT-4 uses this to generate replies that sound like you:

```markdown
# Juma's Reply Voice Profile

## Personality
- Friendly but professional
- Generous with knowledge — happy to explain
- Humble about experience — "in my experience" not "you should"
- Uses analogies to simplify complex topics
- Data engineering practitioner, not academic

## Response Patterns
- Acknowledge first: "Great question!" / "That's a fair point" / "Appreciate you sharing"
- Keep it concise: 2-4 sentences max
- End with engagement: follow-up question or offer to help
- Use "we" and "I've seen" more than "you should"

## Phrases I Use
- "In my experience..."
- "One thing that's worked well..."
- "That's a great callout—"
- "Happy to dig deeper if helpful"
- "The short answer is... but the nuance is..."
- "Depends on the context, but generally..."

## Things I Avoid
- Corporate buzzwords without substance
- Dismissing alternative viewpoints
- Long paragraphs in replies
- Overselling or self-promotion
- Generic responses like "Thanks for reading!"

## Emoji Usage
- Occasional, not excessive: 💡 🎯 👍
- Never more than 1-2 per reply
- Skip emojis for serious/technical responses
```

---

## Comment Classification

| Type               | Detection Signals                            | Response Strategy                     |
| ------------------ | -------------------------------------------- | ------------------------------------- |
| **Question**       | "how", "what", "why", "?", "can you explain" | Direct answer + offer to elaborate    |
| **Agreement**      | "great post", "love this", "so true", "💯"    | Thank briefly + add one insight       |
| **Disagreement**   | "but", "I disagree", "not always", "however" | Acknowledge validity + explain nuance |
| **Personal Story** | "I had similar", "at my company", "we tried" | Validate their experience + connect   |
| **Request**        | "can you share", "link?", "template?", "DM"  | Provide resource or invite DM         |
| **Spam/Promo**     | Off-topic, links, "check my profile"         | Skip (don't reply)                    |

---

## WhatsApp Message Format

### New Comment Notification
```
💬 New comment on "Data Mesh for Engineers"

@john_doe (Data Engineer at Acme):
"How do you handle data contracts across domains? 
We're struggling with schema versioning."

📝 Suggested reply:
"Great question! Schema versioning is key — we use 
a registry with semantic versioning. Breaking changes 
require a new major version + migration period. 
Happy to share our contract template if helpful 🎯"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Reply: YES 47 | EDIT 47 | SKIP 47
```

### Edit Flow
```
[You] EDIT 47 mention async validation

[Bot] ✏️ Updated reply for #47:
"Great question! Schema versioning is key — we use 
a registry with semantic versioning + async validation 
on write. Breaking changes require a new major version 
+ migration period. Happy to share our contract 
template if helpful 🎯"

Reply: YES 47 | SKIP 47
```

### Confirmation
```
✅ Reply #47 posted to LinkedIn!
```

### Batch Summary (Daily)
```
📊 Comment Summary (Today):

Replied: 5 comments
Skipped: 2 (spam)
Pending: 1

Most engaged post: "Data Mesh for Engineers" (23 comments)

Reply PENDING to see waiting comments.
```

---

## LinkedIn API Integration

### Required Scopes (from Community Management API)
```
r_organization_social    # Read comments, reactions
w_organization_social    # Post replies
```

### API Endpoints

```javascript
// Get comments on a post
GET https://api.linkedin.com/v2/socialActions/{shareUrn}/comments
Headers:
  Authorization: Bearer {access_token}
  X-Restli-Protocol-Version: 2.0.0

// Post a reply
POST https://api.linkedin.com/v2/socialActions/{shareUrn}/comments
Headers:
  Authorization: Bearer {access_token}
  Content-Type: application/json
Body:
{
  "actor": "urn:li:person:{personId}",
  "message": {
    "text": "Your reply text here"
  },
  "parentComment": "urn:li:comment:{parentCommentId}"  // For nested replies
}

// Get post URNs (to know which posts to check)
GET https://api.linkedin.com/v2/shares?q=owners&owners={personUrn}
```

### Polling Strategy
```
┌─────────────────────────────────────────────────────────────┐
│                  POLLING LOGIC                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Every 30 minutes:                                         │
│                                                             │
│  1. Get posts from last 7 days (active engagement window)  │
│                                                             │
│  2. For each post:                                         │
│     - Fetch comments                                       │
│     - Filter: created_after > last_poll_time              │
│     - Filter: not from self (don't reply to yourself)     │
│     - Filter: not already replied to                      │
│                                                             │
│  3. For each new comment:                                  │
│     - Generate reply                                       │
│     - Queue for WhatsApp approval                         │
│                                                             │
│  4. Update last_poll_time                                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Architecture

### File Structure
```
automation/
├── comment-replies/
│   ├── index.js                 # Main service
│   ├── linkedin-comments.js     # LinkedIn API client for comments
│   ├── comment-classifier.js    # Detect comment type
│   ├── reply-generator.js       # GPT-4 reply generation
│   ├── voice-profile.js         # Your tone/voice config
│   └── polling-scheduler.js     # Cron job for polling
├── whatsapp/                    # Reuse existing approval system
│   └── ...
└── data/
    ├── replied-comments.json    # Track which comments we've replied to
    └── voice-profile.md         # Your voice profile document
```

### Data Models

**Pending Reply:**
```json
{
  "id": "47",
  "postUrn": "urn:li:share:7159...",
  "postTitle": "Data Mesh for Engineers",
  "commentUrn": "urn:li:comment:7160...",
  "commentAuthor": {
    "name": "John Doe",
    "headline": "Data Engineer at Acme",
    "profileUrl": "https://linkedin.com/in/johndoe"
  },
  "commentText": "How do you handle data contracts across domains?",
  "commentType": "question",
  "suggestedReply": "Great question! Schema versioning is key...",
  "createdAt": "2026-02-01T15:30:00Z",
  "status": "pending",
  "repliedAt": null
}
```

**Replied Comment Log:**
```json
{
  "commentUrn": "urn:li:comment:7160...",
  "repliedAt": "2026-02-01T16:00:00Z",
  "replyText": "Great question! Schema versioning is key...",
  "wasEdited": false
}
```

---

## Environment Variables

Add to `automation/.env`:
```bash
# LinkedIn API (Community Management)
LINKEDIN_ACCESS_TOKEN=
LINKEDIN_PERSON_URN=urn:li:person:XXXXXX

# Comment Reply Settings
COMMENT_POLL_INTERVAL_MINUTES=30
COMMENT_LOOKBACK_DAYS=7
```

---

## Implementation Tasks

### Phase 1: LinkedIn Comment Client
- [ ] Task 1.1: Create `linkedin-comments.js` — Fetch comments from posts
- [ ] Task 1.2: Create `polling-scheduler.js` — Cron job every 30 min
- [ ] Task 1.3: Track replied comments to avoid duplicates
- [ ] Task 1.4: Test fetching comments from a real post

### Phase 2: Voice Profile & Classification
- [ ] Task 2.1: Create `voice-profile.js` — Load and format voice profile
- [ ] Task 2.2: Create `data/voice-profile.md` — Your actual voice profile
- [ ] Task 2.3: Create `comment-classifier.js` — Detect comment type
- [ ] Task 2.4: Test classification on sample comments

### Phase 3: Reply Generation
- [ ] Task 3.1: Create `reply-generator.js` — GPT-4 reply generation
- [ ] Task 3.2: Build prompt template with voice profile + comment context
- [ ] Task 3.3: Test reply quality across all comment types
- [ ] Task 3.4: Add reply length limits (max 280 chars or 3-4 sentences)

### Phase 4: WhatsApp Integration
- [ ] Task 4.1: Extend WhatsApp message parser for EDIT command
- [ ] Task 4.2: Add comment reply queue (separate from post queue)
- [ ] Task 4.3: Format comment preview messages
- [ ] Task 4.4: Handle YES/EDIT/SKIP for replies

### Phase 5: LinkedIn Posting
- [ ] Task 5.1: Implement `postReply()` in linkedin-comments.js
- [ ] Task 5.2: Handle nested replies (reply to specific comment)
- [ ] Task 5.3: Error handling (deleted comments, rate limits)
- [ ] Task 5.4: Log successful replies

### Phase 6: Testing & Polish
- [ ] Task 6.1: End-to-end test: poll → generate → approve → post
- [ ] Task 6.2: Add daily summary message
- [ ] Task 6.3: Update README with comment reply feature
- [ ] Task 6.4: Mark feature complete

---

## Rate Limits & Safety

| Concern              | Mitigation                                           |
| -------------------- | ---------------------------------------------------- |
| LinkedIn rate limits | Max 100 API calls/day; poll every 30 min = ~48 calls |
| Spam appearance      | All replies human-approved; natural response times   |
| Reply to trolls      | Classifier detects spam → auto-skip                  |
| Duplicate replies    | Track replied comments in JSON log                   |
| Token refresh        | LinkedIn tokens last 2 months; add refresh logic     |

---

## Future Enhancements

| Feature             | Description                                         |
| ------------------- | --------------------------------------------------- |
| Auto-approve simple | Auto-reply to "great post!" without approval        |
| Reply templates     | Pre-built responses for common questions            |
| Analytics           | Track which reply styles get most engagement        |
| Multi-language      | Detect comment language, reply in same language     |
| DM follow-up        | Offer to continue conversation in DM for complex Qs |

---

## 🤖 Claude AI Development Prompt

**Copy and paste this prompt when ready to build:**

---

```
You are helping me build the AI Comment Reply System for the AI & Data Content Engine.

FIRST, read these documents:
1. docs/04-Development/AI_AGENT_INSTRUCTIONS.md (session workflow)
2. docs/03-Features/comment-replies.md (this feature's full specification)

PROJECT CONTEXT:
- Workspace: c:\Users\Juma Hamdan\GitHub\ai-data-content-engine
- This feature monitors LinkedIn comments and generates personalized replies
- All replies go through WhatsApp approval (reuses existing infrastructure)
- LinkedIn Community Management API access required

DEPENDENCIES:
- WhatsApp approval system must be complete first
- LinkedIn API credentials in automation/.env

═══════════════════════════════════════════════════════════════
                    TASK STATUS
═══════════════════════════════════════════════════════════════

Phase 1: LinkedIn Comment Client
  □ Task 1.1: Create linkedin-comments.js
  □ Task 1.2: Create polling-scheduler.js
  □ Task 1.3: Track replied comments
  □ Task 1.4: Test fetching comments

Phase 2: Voice Profile & Classification
  □ Task 2.1: Create voice-profile.js
  □ Task 2.2: Create voice-profile.md
  □ Task 2.3: Create comment-classifier.js
  □ Task 2.4: Test classification

Phase 3: Reply Generation
  □ Task 3.1: Create reply-generator.js
  □ Task 3.2: Build prompt template
  □ Task 3.3: Test reply quality
  □ Task 3.4: Add length limits

Phase 4: WhatsApp Integration
  □ Task 4.1: Extend message parser for EDIT
  □ Task 4.2: Add comment reply queue
  □ Task 4.3: Format preview messages
  □ Task 4.4: Handle YES/EDIT/SKIP

Phase 5: LinkedIn Posting
  □ Task 5.1: Implement postReply()
  □ Task 5.2: Handle nested replies
  □ Task 5.3: Error handling
  □ Task 5.4: Log successful replies

Phase 6: Testing & Polish
  □ Task 6.1: End-to-end test
  □ Task 6.2: Add daily summary
  □ Task 6.3: Update README
  □ Task 6.4: Mark feature complete

═══════════════════════════════════════════════════════════════

RULES:

1. BRANCH: Create/checkout `feature/comment-replies`

2. DEPENDENCY: Ensure WhatsApp approval system is complete first

3. ONE TASK AT A TIME: Complete fully, test, commit, then move on

4. CRITICAL REVIEW: Before implementing, evaluate the approach

5. VOICE PROFILE: This is key to quality — spend time getting it right

START: Verify WhatsApp system is complete, then begin with Task 1.1.
```

---

[← Back to TODO](../01-Project/TODO.md) | [Development Guide](../04-Development/coding-standards.md)
