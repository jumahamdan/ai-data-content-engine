# Changelog

Session-by-session record of shipped work. Most recent first.

---

## 2026-02-15 — LinkedIn OAuth & Real Posting

**Branch:** `feature/linkedin-oauth`

### Shipped
- OAuth 2.0 token acquisition script (`automation/linkedin-auth/get-token.js`) — Express callback server, auto-saves tokens to .env
- Replaced MVP stub LinkedIn adapter with real Posts API integration (versioned, 202401)
- Image upload flow: initializeUpload → download from Firebase Storage → PUT to LinkedIn → attach URN
- MVP fallback preserved when no LINKEDIN_ACCESS_TOKEN is set
- GitHub Actions `automation.yml` updated with LINKEDIN_ACCESS_TOKEN for publish job
- `.env.example` updated with LinkedIn OAuth variables

---

## 2026-02-15 — Workflow Improvements + SonarCloud + Branch Protection

**Branch:** `feature/workflow-improvements`

### Shipped
- Consolidated 3 workflow files into 2: `ci.yml` (lint + format + SonarCloud) and `automation.yml` (generate + publish)
- Added SonarCloud static analysis to CI pipeline (informational, runs after lint passes)
- Added `sonar-project.properties` targeting `automation/` source directory
- All workflows now use `npm ci` + npm cache for deterministic, fast builds
- Added concurrency groups: CI cancels stale runs, automation queues without canceling
- `automation.yml` has `workflow_dispatch` dropdown: generate, publish, or both
- Branch protection on `develop` and `main`: require PRs with passing CI, enforce for admins, no force push
- Deleted `generate-content.yml` and `publish-content.yml` (replaced by `automation.yml`)

---

## 2026-02-15 — Deploy + WhatsApp Fix

**Branch:** `develop`

### Shipped
- Deployed updated `incoming.js` to Twilio via CLI (`npm run deploy`)
- Fixed Twilio error 21617: view command exceeded WhatsApp's 1600-char message limit
- Caption now smart-trimmed to fit within 1400-char budget (accounts for emoji/unicode overhead)
- Image attachment confirmed working on WhatsApp sandbox
- Feature doc status updated to Complete

---

## 2026-02-14 — Pipeline Image Integration

**Branch:** `feature/pipeline-image-integration`

### Shipped
- Content generator now creates Gemini AI images for each post (full AI visuals, not Puppeteer composites)
- Images uploaded to Firebase Storage with public URLs
- WhatsApp notification sends image as MMS media alongside the text preview
- WhatsApp view command (`<id>`) now returns full caption + attached image (was truncated at 1200 chars, no image)
- `firestore-queue.js` only passes `mediaUrl` to Twilio when it's an https URL
- IMAGE_PROVIDER=none disables image generation; failures are non-blocking

---

## 2026-02-14 -- Gemini Image Generator Integration

**Branch:** `feature/gemini-image-generator`

### Shipped
- Added Google Gemini as image generation provider (`gemini-client.js`, `provider-factory.js`)
- Created IMAGE_PROVIDER env var replacing DALLE_ENABLED/GEMINI_ENABLED flags
- Provider routing: gemini, dalle, auto, none modes with 4-tier fallback chain
- Provider-separated cache structure with automatic one-time migration
- Cross-provider cache lookup optimization (reuse DALL-E cache from Gemini mode)
- BackgroundGenerator and IllustrationCache refactored for multi-provider support
- Orchestrator handles IMAGE_PROVIDER=none gracefully with CSS fallback
- Integration test suite (5 offline + 1 live test)
- Complete feature documentation at docs/03-Features/gemini-image-generator.md
- Updated .env.example, secrets docs, and generate-content.yml workflow
- Cost savings: ~51% per image ($0.039 Gemini Flash vs $0.08 DALL-E)

---

## 2026-02-09 — GitHub Best Practices + CI Pipeline

**Branch:** `feature/github-best-practices`

### Shipped
- Added ESLint (`eslint:recommended`) and Prettier to `automation/`
- Added `lint`, `lint:fix`, `format`, and `format:check` npm scripts
- Auto-fixed all existing code to pass lint and format checks
- Created CI workflow (`.github/workflows/ci.yml`) running lint + format on PRs
- Added PR template and issue templates (bug report, feature request)
- Adopted Gitflow branching: `main` + `develop` + `feature/*`
- Updated all development docs (CLAUDE.md, AI_AGENT_INSTRUCTIONS.md, coding-standards.md)

---

## 2026-02-09 — Phase 4 Testing + Docs Reorganization

**Branch:** `feature/github-actions-automation`

### Shipped
- Publisher module tested end-to-end (Firestore query → MVP LinkedIn log → status update)
- Content generator validated (topic selection → prompt loading → Claude API call with retries)
- Fixed `hashtags.join` crash in LinkedIn adapter (non-array hashtags from old Firestore data)
- Added missing Firestore composite index (`status ASC + createdAt ASC`) and deployed
- Added `ANTHROPIC_API_KEY` and `FIREBASE_SERVICE_ACCOUNT` to GitHub Secrets
- Disabled cron schedules on both workflows (manual dispatch only until billing resolved)
- Reorganized docs/ into numbered folder structure
- Created `CLAUDE.md`, `AI_AGENT_INSTRUCTIONS.md`

### Blocked
- Content generator cannot complete: Anthropic API account needs credits

---

## 2026-02-08 — Phases 1-3: Content Generator, Publisher, GitHub Actions

**Branch:** `feature/github-actions-automation`

### Shipped
- Content generator module (`content-generator/index.js`, `claude-client.js`, `topic-selector.js`)
- Publisher module (`publisher/index.js`, `platforms/linkedin.js`)
- GitHub Actions workflows (`generate-content.yml`, `publish-content.yml`)
- README badges and secrets documentation

---

## Prior Work

- WhatsApp approval system (complete)
- Hybrid image generator (Phases 1-5)
- Firebase Firestore queue integration
- Topic bank and prompt templates
