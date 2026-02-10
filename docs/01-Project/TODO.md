# TODO

## MVP (Phase 1) - IN PROGRESS

### ✅ Complete
- [x] WhatsApp approval workflow (Twilio Functions)
- [x] Firestore queue (cloud-based, replaces n8n)
- [x] Image generation system (`automation/image-generator/`)
- [x] WhatsApp commands: list, status, approve, reject

### 🔄 In Progress
- [ ] GitHub Actions: Content generation workflow
- [ ] GitHub Actions: Publisher workflow
- [ ] Claude API integration (replaces OpenAI)

### ⏳ Remaining
- [ ] LinkedIn OAuth & real posting
- [ ] End-to-end testing
- [ ] Expand topic bank

**Schedule:** 2 posts/day (8am + 4pm CT)

---

## Current Focus: GitHub Actions Workflow

See [docs/features/github-actions-workflow.md](docs/features/github-actions-workflow.md) for detailed tasks.

### Content Generator
- [ ] Task 1.1: Create `content-generator/index.js`
- [ ] Task 1.2: Create `content-generator/claude-client.js`
- [ ] Task 1.3: Create `content-generator/topic-selector.js`
- [ ] Task 1.4: Test locally

### Publisher
- [ ] Task 2.1: Create `publisher/index.js`
- [ ] Task 2.2: Create `publisher/platforms/linkedin.js`
- [ ] Task 2.3: Test locally

### GitHub Actions
- [ ] Task 3.1: Create `generate-content.yml`
- [ ] Task 3.2: Create `publish-content.yml`
- [ ] Task 3.3: Add GitHub Secrets
- [ ] Task 3.4: Test workflows

---

## ✅ Completed Features

### Image Generation System
> **Location**: `automation/image-generator/`
>
> **Run tests**: `cd automation && npm run test-images`

- Cards: Title + numbered bullets
- Diagrams: Horizontal comparison OR vertical layered flows
- Auto-detection of template type from content
- 30+ SVG icons for data engineering concepts

### WhatsApp Approval System
> **Location**: `automation/whatsapp/` + `automation/whatsapp-function/`

- Cloud-based queue in Firestore
- Twilio Functions webhook (deployed)
- Commands: list, status, view, approve, reject
- Automatic notifications when posts are added

---

## Future Phases

### Phase 2 - Multi-Platform
- [ ] Instagram posting (Meta Graph API)
- [ ] Facebook posting (Meta Graph API)
- [ ] Platform-specific formatting
- [ ] Carousel/multi-image support

### Phase 3 - Advanced Content
- [ ] TikTok integration
- [ ] Video/animation generation
- [ ] AI image generation (DALL-E)

### Phase 4 - Optimization
- [ ] Analytics collection
- [ ] Topic refinement based on engagement
- [ ] A/B testing for post formats
- [ ] Best posting time analysis

---

## Backlog
- [ ] Error alerting (Slack/email on failures)
- [ ] Dashboard for monitoring posts
- [ ] Backup/archive of generated content
- [ ] Comment reply automation