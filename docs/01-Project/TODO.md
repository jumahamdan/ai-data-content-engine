# TODO

## MVP (Phase 1) - NEARLY COMPLETE

### Complete

- [x] WhatsApp approval workflow (Twilio Functions)
- [x] Firestore queue (cloud-based, replaces n8n)
- [x] Image generation system (Puppeteer + Gemini AI + DALL-E hybrid)
- [x] WhatsApp commands: list, status, view, approve, reject
- [x] Content generator (Claude API + topic rotation + prompt templates)
- [x] Publisher module (Firestore query → platform adapters → status update)
- [x] GitHub Actions workflows (automation.yml: generate + publish jobs)
- [x] CI pipeline (ESLint + Prettier + SonarCloud)
- [x] Branch protection on develop and main
- [x] Gemini AI image generation integrated into pipeline
- [x] Firebase Storage upload for post images

- [x] LinkedIn OAuth & real posting (OAuth 2.0 + Posts API v202601)
- [x] End-to-end testing (generate → WhatsApp approve/reject → publish to LinkedIn)

### Remaining

- [ ] Expand topic bank

**Schedule:** 2 posts/day (8am + 4pm CT) — cron enabled

---

## Backlog

- [ ] Image quality overhaul — generated images still don't match reference style (dense, hand-drawn whiteboard feel with side annotations, full canvas coverage, strong visual hierarchy). Needs: layout CSS rework, annotation rendering, content density tuning, and reference image comparison testing.
- [ ] Error alerting (Slack/email on failures)
- [ ] Dashboard for monitoring posts
- [ ] Backup/archive of generated content
- [ ] Comment reply automation (awaiting LinkedIn API access)
- [ ] Example-based image generation (use reference images for AI style matching)

---

## Phase 2 - Multi-Platform

- [ ] Instagram posting (Meta Graph API)
- [ ] Facebook posting (Meta Graph API)
- [ ] Platform-specific formatting
- [ ] Carousel/multi-image support

## Phase 3 - Advanced Content

- [ ] TikTok integration
- [ ] Video/animation generation
- [ ] Enhanced image styles

## Phase 4 - Optimization

- [ ] Analytics collection
- [ ] Topic refinement based on engagement
- [ ] A/B testing for post formats
- [ ] Best posting time analysis

---

[← Back to README](../../README.md)
