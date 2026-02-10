# AI & Data Content Engine

Serverless LinkedIn content automation: generates 2 posts/day using Claude API, queues in Firestore, approves via WhatsApp, publishes to LinkedIn. Zero local infrastructure — runs on GitHub Actions.

## Quick Start for New Sessions

```
Follow the workflow in docs/04-Development/AI_AGENT_INSTRUCTIONS.md

I want to [what] because [why].
```

## Tech Stack

- **Runtime:** Node.js 20
- **Orchestration:** GitHub Actions (cron + manual dispatch)
- **AI:** Claude API via `@anthropic-ai/sdk`
- **Database:** Firebase Firestore (collection: `pending_posts`)
- **Notifications:** Twilio WhatsApp
- **Images:** DALL-E 3 + Puppeteer compositor
- **Publishing:** LinkedIn API (MVP: stub logging)

## Project Map

```
automation/
  content-generator/    Claude API content generation (index.js, claude-client.js, topic-selector.js)
  publisher/            Post publishing pipeline (index.js, platforms/linkedin.js)
  whatsapp/             Firestore queue + Twilio client
  whatsapp-function/    Deployed Twilio webhook (cloud function)
  image-generator/      Puppeteer-based image generation
  .env                  Local secrets (gitignored)
  package.json          All Node.js dependencies

.github/workflows/
  generate-content.yml  Content generation workflow (cron disabled, manual dispatch)
  publish-content.yml   Publishing workflow (cron disabled, manual dispatch)

config/                 Firebase service account (gitignored)
content-spec/           tone.md, post-templates.md — voice and structure rules
prompts/                Mustache templates for Claude API (4 templates)
topics/                 topic-bank.json — topic rotation bank
```

## Documentation Index

| Path | Contents |
|------|----------|
| `docs/01-Project/roadmap.md` | 4-phase roadmap (MVP → Multi-Platform → Advanced → Optimization) |
| `docs/01-Project/changelog.md` | Session-by-session record of shipped work |
| `docs/01-Project/TODO.md` | Active task tracking and backlog |
| `docs/02-Architecture/system-architecture.md` | Full system design, data flow, cloud services |
| `docs/03-Features/github-actions-workflow.md` | GitHub Actions replacement for n8n (Phases 1-3 done, Phase 4 testing) |
| `docs/03-Features/whatsapp-approval.md` | WhatsApp approval system (COMPLETE) |
| `docs/03-Features/hybrid-image-generator.md` | DALL-E + Puppeteer image pipeline (Phases 1-5 done) |
| `docs/03-Features/image-generator.md` | Image generator status summary and next steps |
| `docs/03-Features/comment-replies.md` | LinkedIn comment automation (PLANNED — awaiting API access) |
| `docs/04-Development/AI_AGENT_INSTRUCTIONS.md` | Standard workflow for every Claude Code session |
| `docs/04-Development/coding-standards.md` | Code style, error handling, git workflow, env vars |
| `docs/05-Testing/test-plans.md` | Test strategies and QA checklists |
| `docs/06-Operations/secrets-and-deployment.md` | GitHub Secrets setup, Firebase deploy, CI/CD |
| `docs/XX-Archive/` | Completed/deprecated docs moved here |

## Feature Status

| Feature | Status | Doc |
|---------|--------|-----|
| Content Generator (Claude API) | Done | `docs/03-Features/github-actions-workflow.md` |
| Publisher (LinkedIn MVP) | Done | `docs/03-Features/github-actions-workflow.md` |
| GitHub Actions Workflows | Done (cron disabled) | `docs/03-Features/github-actions-workflow.md` |
| WhatsApp Approval | Complete | `docs/03-Features/whatsapp-approval.md` |
| Hybrid Image Generator | Phases 1-5 done | `docs/03-Features/hybrid-image-generator.md` |
| Comment Replies | Planned | `docs/03-Features/comment-replies.md` |

## GitHub Secrets (CI/CD)

`ANTHROPIC_API_KEY`, `FIREBASE_SERVICE_ACCOUNT`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM`, `WHATSAPP_TO`, `OPENAI_API_KEY`

## Key Patterns

- **Firestore collection:** `pending_posts` — statuses: `pending` → `approved` → `published`
- **Topic rotation:** `topics/topic-bank.json` with history ring buffer at `automation/.topic-history.json`
- **Prompt templates:** Mustache files in `prompts/` keyed by topic category
- **Error handling:** Retry with exponential backoff for external APIs; log + continue for non-critical failures
- **MVP approach:** LinkedIn posting is stubbed (console log) until OAuth is configured
