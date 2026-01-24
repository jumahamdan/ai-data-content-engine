# n8n Automation Blueprint

## 1. Overview

Your n8n workflow runs twice per day at **09:00** and **16:00** (CST), pulls content specs and prompts from your GitHub repo, generates a caption using OpenAI, and publishes a text post to LinkedIn.

**Current Mode**: Text-only posts (MVP)
**Future**: Add image generation via Canva or similar service

---

## 2. Workflow Nodes

### Schedule Trigger
- **Configuration**: Two times: 09:00 and 16:00 America/Chicago
- **Purpose**: Starts the workflow twice daily

### Get State
- **Purpose**: Stores template rotation index and recently used topics
- **Note**: Currently uses hardcoded state; replace with Redis/database for persistence across restarts

### Fetch Topics
- **Purpose**: Gets topic bank from GitHub repo
- **File**: `topics/topic-bank.json`

### Plan Content
Uses a **Code node (JavaScript)** to:
- Pick one of four templates (rotates sequentially: interview_explainer → architecture → optimization → layered)
- Select a topic from the relevant section of `topics/topic-bank.json`
- Track which topics have been used recently (avoids repeats)

### Fetch Prompt & Tone from GitHub
Uses **GitHub nodes** to:
- Fetch the appropriate prompt file under `prompts/` (e.g., `prompts/interview-explainer.md`)
- Fetch tone guidelines from `content-spec/tone.md`
- **Benefit**: Any updates you push to your repo automatically sync with your workflow

### Generate Content
Uses an **OpenAI node** to call GPT-4:
- Provides the chosen prompt, topic, and tone description
- Returns JSON with caption and hashtags
- **Error Handling**: Conditional node sends alert if API call fails

### Parse Content
Uses a **Code node** to:
- Extract JSON from OpenAI response
- Build full caption with hashtags appended
- Validate required fields

### Post to LinkedIn
Uses the **LinkedIn node** to:
- Post the text caption with hashtags
- **Note**: Text-only for MVP; image support can be added later

### Build Log Entry & Log to GitHub
Uses **Code and GitHub nodes** to:
- Append a record to `automation/post_log.json` with:
  - Timestamp
  - Template used
  - Topic
  - Status
  - LinkedIn post ID
  - Caption preview
  - Hashtags
- **Purpose**: Makes future analytics or troubleshooting easier

---

## 3. Workflow Diagram

```
Schedule Trigger (09:00, 16:00 CST)
    ↓
┌───────────────┬───────────────┐
│   Get State   │  Fetch Topics │
└───────┬───────┴───────┬───────┘
        └───────┬───────┘
                ↓
         Plan Content
                ↓
    ┌───────────┴───────────┐
    │                       │
Fetch Prompt           Fetch Tone
    │                       │
    └───────────┬───────────┘
                ↓
        Generate Content (OpenAI)
                ↓
          Parse Content
                ↓
        Post to LinkedIn
                ↓
        Build Log Entry
                ↓
        Log to GitHub
```

---

## 4. Required Credentials

| Credential | Purpose | Scopes Needed |
|------------|---------|---------------|
| GitHub OAuth2 | Fetch files, update log | `repo` or `public_repo` |
| OpenAI API | Generate content | N/A (API key) |
| LinkedIn OAuth2 | Post content | `openid profile email w_member_social` |

**Important**: Do NOT include `w_organization_social` in LinkedIn scopes unless posting to company pages.

---

## 5. Implementation Checklist

- [x] Set up n8n instance
- [x] Configure Schedule Trigger (09:00 and 16:00 CST)
- [x] Create Code node for content plan logic
- [x] Set up GitHub API credentials
- [x] Configure OpenAI API credentials
- [ ] Configure LinkedIn API credentials (fix scope issue)
- [x] Create post logging mechanism
- [ ] Test error handling flows
- [ ] Test complete workflow end-to-end
- [ ] Enable workflow for production

---

## 6. Future Enhancements

### Phase 2: Image Support
- Add Canva API or alternative image service
- Modify LinkedIn node to include `mediaUrl` parameter

### Phase 3: Approval Mode
- Insert manual approval step before LinkedIn node
- Send draft to Slack and wait for confirmation

### Phase 4: Multi-Platform
- Add Instagram, Facebook nodes with conditional logic
- Adjust caption format for each platform

### Phase 5: Analytics
- Pull LinkedIn engagement data
- Refine topic rotation based on performance
