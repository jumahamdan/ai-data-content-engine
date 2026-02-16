# AI & Data Content Engine

Serverless LinkedIn content automation: generates 2 posts/day using Claude API, queues in Firestore, approves via WhatsApp, publishes to LinkedIn. Zero local infrastructure — runs on GitHub Actions.

## Quick Start for New Sessions

```
Follow the workflow in docs/04-Development/AI_AGENT_INSTRUCTIONS.md

I want to [what] because [why].
```

### Starting a Feature Session

Every feature goes through **Step 0: Task Assessment** (scored 0–5):
- **Score 0–1 → Lightweight Workflow** — Plan, Build, PR in a single session
- **Score 2+ → GSD Mode** — Multi-phase workflow using `/gsd:*` commands with project overrides

See `docs/04-Development/AI_AGENT_INSTRUCTIONS.md` for the full routing logic and handoff templates.

## Tech Stack

- **Runtime:** Node.js 20
- **Orchestration:** GitHub Actions (cron + manual dispatch)
- **AI:** Claude API via `@anthropic-ai/sdk`
- **Database:** Firebase Firestore (collection: `pending_posts`)
- **Notifications:** Twilio WhatsApp
- **Images:** Gemini Flash + DALL-E 3 + Puppeteer compositor
- **Publishing:** LinkedIn API (MVP: stub logging)
- **Linting:** ESLint 8 (`eslint:recommended`)
- **Formatting:** Prettier 3
- **CI:** GitHub Actions (lint + format + SonarCloud on PRs)
- **Code Quality:** SonarCloud (static analysis, informational)

## Project Map

```
automation/
  content-generator/    Claude API content generation (index.js, claude-client.js, topic-selector.js)
  publisher/            Post publishing pipeline (index.js, platforms/linkedin.js)
  whatsapp/             Firestore queue + Twilio client
  whatsapp-function/    Deployed Twilio webhook (cloud function)
  hybrid-image-generator/    DALL-E + Gemini + Puppeteer image pipeline
  image-generator/      Puppeteer-based image generation
  .eslintrc.json        ESLint configuration
  .prettierrc.json      Prettier configuration
  .prettierignore       Files excluded from formatting
  .env                  Local secrets (gitignored)
  package.json          All Node.js dependencies

.github/
  workflows/
    ci.yml                CI checks (lint + format + SonarCloud) on PRs
    automation.yml        Content generation + publishing (cron disabled, manual dispatch)
  PULL_REQUEST_TEMPLATE.md
  ISSUE_TEMPLATE/
    bug_report.yml
    feature_request.yml

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
| `docs/03-Features/gemini-image-generator.md` | Gemini image provider: architecture, cost comparison, provider routing |
| `docs/03-Features/pipeline-image-integration.md` | Gemini images in content pipeline + Firebase Storage upload |
| `docs/03-Features/image-generator.md` | Image generator status summary and next steps |
| `docs/03-Features/workflow-improvements.md` | Workflow consolidation, SonarCloud, branch protection (COMPLETE) |
| `docs/03-Features/comment-replies.md` | LinkedIn comment automation (PLANNED — awaiting API access) |
| `docs/04-Development/AI_AGENT_INSTRUCTIONS.md` | Dual-workflow agent instructions (Lightweight + GSD routing) |
| `docs/04-Development/coding-standards.md` | Code style, error handling, git workflow, env vars |
| `docs/05-Testing/test-plans.md` | Test strategies and QA checklists |
| `docs/06-Operations/secrets-and-deployment.md` | GitHub Secrets setup, Firebase deploy, CI/CD |
| `docs/XX-Archive/` | Completed/deprecated docs moved here |

## Feature Status

| Feature | Status | Doc |
|---------|--------|-----|
| Content Generator (Claude API) | Done | `docs/03-Features/github-actions-workflow.md` |
| Publisher (LinkedIn MVP) | Done | `docs/03-Features/github-actions-workflow.md` |
| GitHub Actions Workflows | Done (cron enabled) | `docs/03-Features/github-actions-workflow.md` |
| WhatsApp Approval | Complete | `docs/03-Features/whatsapp-approval.md` |
| Hybrid Image Generator | Phases 1-5 done, multi-provider support | `docs/03-Features/hybrid-image-generator.md` |
| Gemini Image Generator | Complete | `docs/03-Features/gemini-image-generator.md` |
| Pipeline Image Integration | Complete | `docs/03-Features/pipeline-image-integration.md` |
| CI + Linting + SonarCloud | Done | `.github/workflows/ci.yml` |
| Workflow Improvements | Done | `docs/03-Features/workflow-improvements.md` |
| LinkedIn OAuth & Real Posting | Complete | `docs/03-Features/linkedin-oauth.md` |
| Comment Replies | Planned | `docs/03-Features/comment-replies.md` |

## GitHub Secrets (CI/CD)

`ANTHROPIC_API_KEY`, `FIREBASE_SERVICE_ACCOUNT`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM`, `WHATSAPP_TO`, `OPENAI_API_KEY`, `GEMINI_API_KEY`, `SONAR_TOKEN`, `LINKEDIN_ACCESS_TOKEN`

## Key Patterns

- **Firestore collection:** `pending_posts` — statuses: `pending` → `approved` → `published`
- **Topic rotation:** `topics/topic-bank.json` with history ring buffer at `automation/.topic-history.json`
- **Prompt templates:** Mustache files in `prompts/` keyed by topic category
- **Error handling:** Retry with exponential backoff for external APIs; log + continue for non-critical failures
- **MVP approach:** LinkedIn posting is stubbed (console log) until OAuth is configured
- **Branching:** Gitflow — features branch from `develop`, merge to `develop` via PR, `develop` merges to `main` for releases
- **CI checks:** ESLint + Prettier + SonarCloud run on all PRs to `develop` and `main`
- **Branch protection:** `develop` and `main` require PRs with passing CI; no direct pushes, no force pushes
- **GSD planning artifacts:** `.planning/` (gitignored) — used as a working scratchpad for complex features via `AI_AGENT_INSTRUCTIONS.md`
