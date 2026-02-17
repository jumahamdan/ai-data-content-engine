# Roadmap

## Phase 1: MVP (Current)

### Complete

- WhatsApp approval workflow (Twilio Functions + Firestore)
- Post queue in Firestore (cloud-based)
- Image generation (Puppeteer HTML/CSS + Gemini AI + DALL-E hybrid pipeline)
- Content generator (Claude API + topic rotation + prompt templates)
- Publisher module (Firestore query → LinkedIn stub → status update)
- GitHub Actions automation (generate + publish via manual dispatch, cron ready)
- CI pipeline (ESLint + Prettier + SonarCloud)
- Branch protection (develop + main: require PRs, passing CI, no force push)
- Gemini AI images integrated into content pipeline + Firebase Storage upload

### Remaining

- LinkedIn OAuth & real posting (stub → real API)
- End-to-end testing
- Expand topic bank

**Schedule:** 2 posts/day (8am + 4pm CT) — cron disabled until LinkedIn is live

---

## Phase 2: Multi-Platform

- [ ] Instagram integration (Meta Graph API)
- [ ] Facebook integration (Meta Graph API)
- [ ] Carousel/multi-image support
- [ ] Platform-specific content formatting
- [ ] Unified analytics dashboard

---

## Phase 3: Advanced Content

- [ ] TikTok integration (slideshow/video)
- [ ] Lightweight animation (mp4/gif) for diagrams
- [ ] Enhanced AI image generation (style references, example-based)
- [ ] Video content from text posts

---

## Phase 4: Optimization

- [ ] Weekly analytics & topic refinement
- [ ] A/B testing different content styles
- [ ] Engagement-based topic selection
- [ ] Automatic hashtag optimization
- [ ] Best posting time analysis

---

## Architecture Evolution

```
Phase 1 (MVP):     GitHub Actions → Firestore → LinkedIn (stub)
Phase 2:           + Instagram, Facebook adapters
Phase 3:           + Video generation pipeline
Phase 4:           + Analytics feedback loop
```

---

[← Back to README](../../README.md)
