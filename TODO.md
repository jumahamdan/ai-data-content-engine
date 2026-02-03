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
- [x] **Image Generation System** (completed - see `automation/image-generator/`)
- [ ] Post images WITH captions to LinkedIn
- [ ] Expand topic bank (currently only 15 topics)
  - interview_explainer: 5 topics
  - architecture: 3 topics
  - optimization: 4 topics
  - layered: 3 topics

---

## Image Generation Instructions (COMPLETED)

> **Status**: Implemented in `automation/image-generator/`
>
> **Approach**: Puppeteer + HTML/CSS/SVG (as recommended)
>
> **Run tests**: `cd automation && npm run test-images`

### What Was Built

1. **Module Structure** (`automation/image-generator/`)
   - `index.js` - Main API with `generateImage()` and `generateImageToFile()`
   - `renderer.js` - Puppeteer screenshot engine (1080x1080, 2x scale)
   - `templates/card.html` - Bullet-point card layout
   - `templates/diagram.html` - Architecture/layered diagram layout
   - `styles/base.css` - Professional styling with color palette
   - `icons/index.js` - 30+ SVG icons for data engineering concepts
   - `workflow-integration.js` - Bridge between OpenAI output and image generator

2. **Image Types Supported**
   - **Cards**: Title + numbered bullets (for interview_explainer, optimization)
   - **Diagrams**: Horizontal comparison boxes OR vertical layered flows (for architecture, layered)

3. **Auto-Detection**
   - Template name auto-maps to image type if not explicitly provided
   - Icon detection from text content (e.g., "medallion" → layers icon)

4. **Workflow Integration**
   - Updated `test-workflow-local.js` to generate images
   - OpenAI prompt updated to request `imageType` field
   - Sample outputs in `automation/test-outputs/`

### Future Enhancements (Phase 3)
- GIF animation support (frame capture)
- MP4 video generation
- Dark theme toggle
- Custom font loading

---

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