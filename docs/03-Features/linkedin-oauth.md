# LinkedIn OAuth & Real Posting

**Status:** In Progress
**Branch:** feature/linkedin-oauth
**PR:** TBD

## Overview

Replace the MVP stub LinkedIn adapter (console log) with real LinkedIn posting via the REST API. Adds an OAuth 2.0 token acquisition script for initial setup and supports both text-only and image posts.

## Acceptance Criteria

- [x] OAuth helper script acquires access token via browser flow
- [x] LinkedIn adapter posts text content via Posts API when token is present
- [x] LinkedIn adapter uploads and attaches images from Firebase Storage URLs
- [x] MVP fallback preserved when no access token is configured
- [x] GitHub Actions workflow passes LINKEDIN_ACCESS_TOKEN to publish job
- [x] .env.example documents all LinkedIn-related variables
- [ ] Access token acquired and stored as GitHub secret
- [ ] E2E test: generate → approve → publish to LinkedIn

## Tasks

| Task | Description | Status |
|------|-------------|--------|
| 1.0 | Create feature doc and acceptance criteria | Complete |
| 1.1 | Create OAuth token acquisition script (Express callback server) | Complete |
| 1.2 | Replace LinkedIn adapter stub with real Posts API integration | Complete |
| 1.3 | Add image upload flow (initializeUpload → PUT binary → attach URN) | Complete |
| 1.4 | Update automation.yml to pass LINKEDIN_ACCESS_TOKEN to publish job | Complete |
| 1.5 | Update .env.example with LinkedIn OAuth variables | Complete |
| 1.6 | Run OAuth flow and acquire access token | Pending (manual) |
| 1.7 | Add LINKEDIN_ACCESS_TOKEN as GitHub secret | Pending (manual) |
| 1.8 | E2E test: generate + approve + publish | Pending (manual) |

## Technical Notes

### LinkedIn API
- **API version:** 202401 (versioned header)
- **Endpoint:** `POST https://api.linkedin.com/rest/posts`
- **Auth:** Bearer token via OAuth 2.0 Authorization Code flow
- **Scopes:** `w_member_social`, `openid`, `profile`
- **Image upload:** 3-step flow — initializeUpload → download source → PUT to LinkedIn upload URL

### OAuth Flow
- Script at `automation/linkedin-auth/get-token.js`
- Starts Express server on port 3000, builds auth URL, waits for callback
- Exchanges authorization code for access + refresh tokens
- Appends tokens to `automation/.env` automatically
- **Token TTL:** ~2 months (manual rotation required)

### LinkedIn App
- App name: "n8n Content Automation"
- Required product: "Share on LinkedIn"
- Redirect URL: `http://localhost:3000/callback`

### Files Changed
- `automation/linkedin-auth/get-token.js` — new OAuth helper script
- `automation/publisher/platforms/linkedin.js` — real API posting (replaces stub)
- `.github/workflows/automation.yml` — LINKEDIN_ACCESS_TOKEN env var
- `automation/.env.example` — LinkedIn OAuth section

## Security Notes

- Access token expires in ~2 months — needs manual rotation
- Refresh token (if provided) should also be stored as a GitHub secret
- All secrets exposed during development sessions must be rotated