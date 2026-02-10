# Changelog

Session-by-session record of shipped work. Most recent first.

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
