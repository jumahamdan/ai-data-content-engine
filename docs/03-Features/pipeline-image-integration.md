# Pipeline Image Integration

**Status:** Complete (v2.0)
**Branch:** feature/image-quality-overhaul
**PR:** #8

## Overview

Integrates hybrid image generation directly into the content pipeline. When a post is generated, the hybrid compositor creates a professional infographic-style image (Gemini/DALL-E background + Puppeteer text overlay), uploads it to Firebase Storage, and passes the public URL through to WhatsApp notifications. Also fixes the post preview (view) command to display the attached image.

## Acceptance Criteria

- [x] Content generator calls hybrid compositor to create composite images for each post
- [x] Image is uploaded to Firebase Storage with a public URL
- [x] WhatsApp notification includes the image as media
- [x] WhatsApp only sends image media when the URL is a public https URL
- [x] Post preview (view command) attaches the image and shows full caption
- [x] Pipeline continues without image if generation fails (non-blocking)
- [x] IMAGE_PROVIDER=none disables image generation

## Tasks

| Task | Description                                                 | Status   |
| ---- | ----------------------------------------------------------- | -------- |
| 1.0  | Create feature doc and acceptance criteria                  | Complete |
| 1.1  | Fix handleView in incoming.js — attach image + full caption | Complete |
| 1.2  | Lint/format all changes                                     | Complete |
| 1.3  | Commit, push, and create PR to develop                      | Complete |

## Technical Notes

### Architecture change

The content pipeline now uses the hybrid compositor (`generateImage` from hybrid-image-generator) for all image generation. Each content pillar maps to a specific theme/layout via pillar-theme-map.js. Claude generates structured IMAGE_DATA metadata that flows through to the compositor for rich multi-section infographics.

The hybrid compositor combines:

- AI-generated abstract backgrounds (Gemini Flash or DALL-E 3)
- Puppeteer-rendered HTML/CSS text overlays for crisp, readable typography
- Theme-specific styling and layout templates

This replaces the earlier approach of using raw Gemini images with AI-generated text (which was illegible).

### Files modified

- `automation/content-generator/index.js` — Added `generatePostImage()`, uses hybrid compositor, Firebase Storage upload, passes public URL to queue
- `automation/content-generator/pillar-theme-map.js` — Maps 6 content pillars to theme/layout pairings
- `automation/content-generator/claude-client.js` — Extracts IMAGE_DATA metadata, strips from caption
- `prompts/*.md` (6 files) — Added IMAGE_DATA instruction blocks tailored to each layout
- `automation/whatsapp/firestore-queue.js` — Only passes `mediaUrl` to Twilio when it's an https URL
- `automation/whatsapp-function/functions/incoming.js` — Fix `handleView` to attach image and show full caption

### IMAGE_DATA metadata flow

1. Claude generates structured IMAGE_DATA JSON block (title, subtitle, sections, insight)
2. parseResponse extracts and validates IMAGE_DATA, strips from caption
3. generatePostImage builds rich contentData from imageMetadata
4. Hybrid compositor renders multi-section infographic with theme styling
5. Graceful fallback to title-only layout if IMAGE_DATA is missing (no crash)

### Storage

- Firebase Storage bucket: `ai-content-engine-jh.firebasestorage.app`
- Images stored at: `post-images/post-<timestamp>.png`
- Made publicly readable via `file.makePublic()`
- Metadata includes: topic, theme, layout, provider, generatedAt

## Bugs / Issues

- **WhatsApp preview truncation (fixed):** The `handleView` command in the Twilio function truncated captions at 1200 chars and did not attach the stored image. Fixed to include image as TwiML media and show full caption.
