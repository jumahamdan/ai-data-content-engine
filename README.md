# AI & Data Content Engine

![Generate Content](https://github.com/jumahamdan/ai-data-content-engine/actions/workflows/generate-content.yml/badge.svg)
![Publish Content](https://github.com/jumahamdan/ai-data-content-engine/actions/workflows/publish-content.yml/badge.svg)

Automated LinkedIn content publishing system with WhatsApp approval workflow. Generates and posts 2x daily technical content about Data Engineering, AI/LLMs, RAG, and Architecture.

## 🏗️ Architecture

**100% Serverless** - No local server required!

```
GitHub Actions → Claude API → Firestore → WhatsApp → LinkedIn
   (schedule)     (generate)    (queue)    (approve)   (post)
```

See [docs/architecture.md](docs/architecture.md) for detailed system design.

## 🚀 Quick Start

### WhatsApp Commands

Send to WhatsApp Sandbox (`+1 415 523 8886`, join code: `join well-hospital`):

| Command    | Description                   |
| ---------- | ----------------------------- |
| `list`     | Show pending posts            |
| `status`   | Check system connectivity     |
| `<id>`     | View post details (e.g., `1`) |
| `yes <id>` | Approve a post                |
| `no <id>`  | Reject a post                 |
| `yes all`  | Approve all pending           |
| `no all`   | Reject all pending            |

### Manual Post Generation

```bash
cd automation
node content-generator/index.js
```

### Automated Schedule

Posts are generated automatically at:
- **8:00 AM CT** - Morning post
- **4:00 PM CT** - Evening post

## 📁 Project Structure

```
ai-data-content-engine/
├── .github/workflows/       # Automated workflows
├── automation/
│   ├── content-generator/   # Claude API integration
│   ├── publisher/           # LinkedIn posting
│   ├── whatsapp/            # Approval queue (Firestore)
│   ├── whatsapp-function/   # Twilio webhook (deployed)
│   └── image-generator/     # Post images
├── config/                  # Credentials (gitignored)
├── content-spec/            # Tone & style guidelines
├── prompts/                 # AI generation templates
├── topics/                  # Topic rotation bank
└── docs/                    # Documentation
```

## 📖 Documentation

| Document                                         | Description               |
| ------------------------------------------------ | ------------------------- |
| [Architecture](docs/architecture.md)             | System design & data flow |
| [Claude Guide](docs/claude-development-guide.md) | Development standards     |
| [Roadmap](docs/roadmap.md)                       | Feature phases            |

### Feature Specs

| Feature                                                             | Status        |
| ------------------------------------------------------------------- | ------------- |
| [WhatsApp Approval](docs/features/whatsapp-approval.md)             | ✅ Complete    |
| [GitHub Actions Workflow](docs/features/github-actions-workflow.md) | 🔄 In Progress |
| [Image Generator](docs/features/image-generator.md)                 | ✅ Complete    |

## ☁️ Cloud Services

| Service                | Purpose             | Status        |
| ---------------------- | ------------------- | ------------- |
| **Firebase Firestore** | Post queue          | ✅ Deployed    |
| **Twilio Functions**   | WhatsApp webhook    | ✅ Deployed    |
| **GitHub Actions**     | Scheduled workflows | 🔄 In Progress |
| **Claude API**         | Content generation  | 🔄 In Progress |
| **LinkedIn API**       | Publishing          | ⏳ Planned     |

## 🔑 Environment Setup

### Local Development

```bash
cd automation
cp .env.example .env
# Edit .env with your credentials
npm install
```

### GitHub Secrets (for Actions)

- `ANTHROPIC_API_KEY` - Claude API
- `FIREBASE_SERVICE_ACCOUNT` - Base64 encoded JSON
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`
- `TWILIO_WHATSAPP_FROM`, `WHATSAPP_TO`

## 🗺️ Roadmap

### Phase 1: MVP (Current)
- ✅ WhatsApp approval workflow
- ✅ Firestore queue
- 🔄 GitHub Actions automation
- ⏳ LinkedIn posting

### Phase 2: Multi-Platform
- Instagram + Facebook (Meta Graph API)
- Carousel support

### Phase 3: Advanced
- TikTok integration
- Video/animation content
- Analytics & optimization

---

Built with ❤️ for automating thought leadership content.
