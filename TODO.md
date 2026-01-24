# TODO

## MVP (Phase 1) - IN PROGRESS

### Done
- [x] n8n workflow structure
- [x] Schedule trigger (9am, 4pm CT)
- [x] Fetch topics from GitHub
- [x] Template/topic rotation with persistence
- [x] Fetch prompt templates from GitHub
- [x] Generate text content via OpenAI (caption + hashtags)
- [x] Post TEXT to LinkedIn
- [x] Log posts to GitHub

### Remaining for MVP
- [ ] Generate images (DALL-E or similar)
- [ ] Post images WITH captions to LinkedIn
- [ ] Expand topic bank (currently only 15 topics)
  - interview_explainer: 5 topics
  - architecture: 3 topics
  - optimization: 4 topics
  - layered: 3 topics
- [ ] Define Canva templates (assets/canva-templates.md is empty)

## Phase 2 - Multi-Platform Expansion
- [ ] Add Instagram posting (Meta Graph API)
- [ ] Add Facebook posting (Meta Graph API)
- [ ] Add carousel/multi-image support
- [ ] Platform-specific caption formatting

## Phase 3 - Video Content
- [ ] Add TikTok (slideshow/video)
- [ ] Add Snapchat support
- [ ] Lightweight animation (mp4/gif) for diagrams
- [ ] Video generation from static images

## Phase 4 - Analytics & Refinement
- [ ] Approval workflow (optional human review)
- [ ] Weekly analytics collection
- [ ] Topic refinement based on engagement
- [ ] A/B testing for post formats

## Backlog
- [ ] Error alerting (Slack/email on failures)
- [ ] Dashboard for monitoring posts
- [ ] Backup/archive of generated content
- [ ] Retry logic improvements