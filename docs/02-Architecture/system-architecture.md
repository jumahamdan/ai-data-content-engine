# System Architecture

> **Last Updated:** February 2026

## Overview

The AI Content Engine is a **100% serverless** system for automated social media content generation and publishing with human-in-the-loop approval via WhatsApp.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         AI CONTENT ENGINE ARCHITECTURE                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌────────────────┐    ┌────────────────┐    ┌────────────────┐            │
│   │    GENERATE    │    │    APPROVE     │    │    PUBLISH     │            │
│   │  (scheduled)   │    │  (WhatsApp)    │    │  (on approval) │            │
│   ├────────────────┤    ├────────────────┤    ├────────────────┤            │
│   │ GitHub Actions │───▶│   Firestore    │───▶│ GitHub Actions │            │
│   │  8am + 4pm CT  │    │    (queue)     │    │ (every 15 min) │            │
│   │                │    │                │    │                │            │
│   │  Claude API    │    │       ▲        │    │  LinkedIn API  │            │
│   │  (content)     │    │       │        │    │  (future: IG)  │            │
│   └────────────────┘    │       │        │    └────────────────┘            │
│                         │ Twilio Function│                                   │
│                         │  (webhook)     │                                   │
│                         └───────┬────────┘                                   │
│                                 │                                            │
│                                 ▼                                            │
│                         ┌────────────────┐                                   │
│                         │   Your Phone   │                                   │
│                         │   (WhatsApp)   │                                   │
│                         └────────────────┘                                   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Components

### 1. Content Generator (GitHub Actions)
- **Trigger:** Scheduled cron (8:00 AM + 4:00 PM CT)
- **Process:**
  1. Select topic from topic bank
  2. Call Claude API with prompt template
  3. Generate image (optional)
  4. Save to Firestore with `status: pending`
  5. Send WhatsApp notification

### 2. Approval Queue (Firestore)
- **Collection:** `pending_posts`
- **Fields:**
  - `id` - Unique identifier
  - `status` - `pending` | `approved` | `rejected` | `published`
  - `content` - Caption, hashtags, topic
  - `imagePath` - Cloud storage URL (if applicable)
  - `createdAt` - Timestamp
  - `approvedAt` - When approved
  - `publishedAt` - When posted

### 3. WhatsApp Webhook (Twilio Functions)
- **URL:** `https://whatsapp-function-4488-dev.twil.io/incoming`
- **Commands:**
  - `list` - Show pending posts
  - `<id>` - View post details
  - `yes <id>` - Approve post
  - `no <id>` - Reject post
  - `status` - System health check

### 4. Publisher (GitHub Actions)
- **Trigger:** Every 15 minutes (checks for approved posts)
- **Process:**
  1. Query Firestore for `status: approved`
  2. Post to LinkedIn (and future platforms)
  3. Update status to `published`

## Data Flow

```
1. GENERATE (8am + 4pm CT)
   ┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
   │ GitHub Action│────▶│  Claude API  │────▶│  Firestore   │────▶│   WhatsApp   │
   │   (cron)     │     │  (generate)  │     │  (pending)   │     │ (notify you) │
   └──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘

2. APPROVE (anytime)
   ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
   │  Your Phone  │────▶│Twilio Function│────▶│  Firestore   │
   │  "yes 1"     │     │  (webhook)   │     │  (approved)  │
   └──────────────┘     └──────────────┘     └──────────────┘

3. PUBLISH (every 15 min)
   ┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
   │ GitHub Action│────▶│  Firestore   │────▶│ LinkedIn API │────▶│  Firestore   │
   │   (cron)     │     │  (approved)  │     │   (post)     │     │ (published)  │
   └──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
```

## Cloud Services

| Service                | Purpose             | Cost                 |
| ---------------------- | ------------------- | -------------------- |
| **GitHub Actions**     | Scheduled workflows | Free (2,000 min/mo)  |
| **Firebase Firestore** | Post queue database | Free (50K reads/day) |
| **Twilio Functions**   | WhatsApp webhook    | Free tier available  |
| **Twilio WhatsApp**    | Notifications       | ~$0.005/message      |
| **Claude API**         | Content generation  | ~$0.01/post          |
| **LinkedIn API**       | Publishing          | Free                 |

**Estimated monthly cost:** < $5 for typical usage

## Directory Structure

```
ai-data-content-engine/
├── .github/
│   └── workflows/
│       ├── generate-content.yml    # Morning + evening content generation
│       └── publish-content.yml     # Check for approved posts, publish
│
├── automation/
│   ├── content-generator/          # Claude API integration
│   │   ├── index.js                # Main generator
│   │   ├── claude-client.js        # API wrapper
│   │   └── topic-selector.js       # Topic rotation
│   │
│   ├── publisher/                  # Social media posting
│   │   ├── index.js                # Main publisher
│   │   └── platforms/
│   │       ├── linkedin.js         # LinkedIn API
│   │       ├── instagram.js        # (future)
│   │       └── facebook.js         # (future)
│   │
│   ├── whatsapp/                   # Approval system
│   │   ├── firestore-queue.js      # Queue management
│   │   └── twilio-client.js        # WhatsApp sending
│   │
│   ├── whatsapp-function/          # Deployed to Twilio
│   │   └── functions/incoming.js   # Webhook handler
│   │
│   └── image-generator/            # Post images
│       └── ...
│
├── config/                         # Credentials (gitignored)
│   └── firebase-service-account.json
│
├── content-spec/                   # Content guidelines
├── prompts/                        # AI prompt templates
├── topics/                         # Topic bank
└── docs/                           # Documentation
```

## Security

### Credentials (NEVER commit)
- `config/firebase-service-account.json` - Firestore access
- `automation/.env` - API keys
- GitHub Secrets - For Actions workflows

### GitHub Secrets Required
```
ANTHROPIC_API_KEY          # Claude API
FIREBASE_SERVICE_ACCOUNT   # Base64 encoded JSON
TWILIO_ACCOUNT_SID         # WhatsApp
TWILIO_AUTH_TOKEN          # WhatsApp
TWILIO_WHATSAPP_FROM       # Sandbox number
WHATSAPP_TO                # Your phone
LINKEDIN_ACCESS_TOKEN      # (future) LinkedIn posting
```

## Extending to Other Platforms

The architecture is designed for easy platform expansion:

```javascript
// publisher/platforms/instagram.js
module.exports = {
  name: 'instagram',
  post: async (content, imagePath) => {
    // Instagram Graph API implementation
  }
};

// Then add to publisher/index.js
const platforms = ['linkedin', 'instagram', 'facebook'];
```

Each platform adapter follows the same interface:
- `name` - Platform identifier
- `post(content, imagePath)` - Publish content
- `validate(content)` - Check content meets platform requirements

---

[← Back to README](../../README.md)
