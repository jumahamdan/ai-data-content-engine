# Pipeline Image Integration

**Status:** In Progress
**Branch:** feature/pipeline-image-integration
**PR:** #8

## Overview

Integrates Gemini AI image generation directly into the content pipeline. When a post is generated, Gemini creates a professional infographic-style image, uploads it to Firebase Storage, and passes the public URL through to WhatsApp notifications. Also fixes the post preview (view) command to display the attached image.

## Acceptance Criteria

- [x] Content generator calls Gemini to create an AI image for each post
- [x] Image is uploaded to Firebase Storage with a public URL
- [x] WhatsApp notification includes the image as media
- [x] WhatsApp only sends image media when the URL is a public https URL
- [x] Post preview (view command) attaches the image and shows full caption
- [x] Pipeline continues without image if generation fails (non-blocking)
- [x] IMAGE_PROVIDER=none disables image generation

## Tasks

| Task | Description | Status |
|------|-------------|--------|
| 1.0 | Create feature doc and acceptance criteria | Complete |
| 1.1 | Fix handleView in incoming.js — attach image + full caption | Complete |
| 1.2 | Lint/format all changes | Complete |
| 1.3 | Commit, push, and create PR to develop | Complete |

## Technical Notes

### Architecture change
The content pipeline now uses Gemini directly (`createGeminiClient` -> `generateAndSave`) instead of the hybrid compositor (Puppeteer text overlay). The hybrid-image-generator module is still available for structured layouts but the main pipeline bypasses it for full AI visuals.

### Files modified
- `automation/content-generator/index.js` — Added `generatePostImage()`, Firebase Storage upload, passes public URL to queue
- `automation/whatsapp/firestore-queue.js` — Only passes `mediaUrl` to Twilio when it's an https URL
- `automation/whatsapp-function/functions/incoming.js` — Fix `handleView` to attach image and show full caption

### Storage
- Firebase Storage bucket: `ai-content-engine-jh.firebasestorage.app`
- Images stored at: `post-images/post-<timestamp>.png`
- Made publicly readable via `file.makePublic()`

## Bugs / Issues

- **WhatsApp preview truncation (fixed):** The `handleView` command in the Twilio function truncated captions at 1200 chars and did not attach the stored image. Fixed to include image as TwiML media and show full caption.