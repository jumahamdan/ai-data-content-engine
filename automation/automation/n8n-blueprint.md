# n8n Automation Blueprint

## 1. Overview

Your n8n workflow will run twice per day at **09:00** and **16:00** (CST), pull content specs and prompts from your GitHub repo, generate a caption and image, and publish a post to LinkedIn. Later, this can be extended to other platforms (Instagram, Facebook, etc.).

---

## 2. Workflow Nodes

### Cron Trigger

- **Configuration**: Two times: 09:00 and 16:00 America/Chicago
- **Purpose**: Starts the workflow twice daily

### Get Content Plan

Use a **Code node (JavaScript)** to:

- Read `schedule/linkedin.json` for timing info
- Pick one of your four templates (rotate sequentially)
- Load a topic from the relevant section of `topics/topic-bank.json` and remove it or track which topics have been used recently

### Fetch Prompt & Specs from GitHub

Use the **n8n HTTP Request node** (GitHub API) or a **GitHub node** to:

- Fetch the appropriate prompt file under `prompts/` (e.g., `prompts/interview-explainer.md`)
- Fetch tone and visual rules from `content-spec/`
- **Note**: This ensures any updates you push to your repo automatically sync with your workflow

### Generate Caption & Image Text

Use an **OpenAI node** to call the ChatGPT API:

- Provide the chosen prompt, the topic, and tone description
- Parse the returned JSON (caption and bullet points for the image)
- **Error Handling**: Add a conditional node—if the API call fails, send a fallback notification to your email or Slack

### Generate the Image

Use an **HTTP node** to call the Canva API (if available) or a preferred image service:

- Populate the title and bullets into a chosen template style (square 1080×1080)
- Save the resulting image to temporary storage (e.g., AWS S3, n8n's binary data, or GitHub)

### Post to LinkedIn

Use the **LinkedIn node** to:

- Upload the image
- Post the caption text with hashtags and reflective question
- **Error Handling**: If the post fails (e.g., API issues), send an alert or retry

### Log Post Results

Use a **Code or GitHub node** to:

- Append a record to a log file in your repo (e.g., `automation/post_log.json`) with:
  - Date
  - Template
  - Topic
  - Status
  - URL of the posted content
- **Purpose**: Makes future analytics or troubleshooting easier

### End Workflow

**Optional**: Send a summary via email or Slack summarizing what was posted

---

## 3. Future Extensions

### Approval Mode
Insert a manual approval step before the LinkedIn node, such as sending the draft to your Slack and waiting for confirmation.

### Platform Branching
Add separate LinkedIn, Instagram, and Facebook nodes with conditional logic to determine which post goes where.

### Analytics and Optimization
Use additional nodes to pull LinkedIn engagement data and refine your topic rotation.

---

## 4. Repository Integration Notes

- Your GitHub repository (`ai-data-content-engine`) holds all prompts, tone specs, and visual rules
- n8n will fetch and update these files via the GitHub API
- **Required**: Ensure your workflow has the appropriate GitHub token with read/write permissions
- **Benefit**: As you add or adjust topics and templates, just commit changes to the repo; the workflow will automatically pick them up on the next run

---

## 5. Implementation Checklist

- [ ] Set up n8n instance
- [ ] Configure Cron Trigger (09:00 and 16:00 CST)
- [ ] Create Code node for content plan logic
- [ ] Set up GitHub API credentials
- [ ] Configure OpenAI API credentials
- [ ] Set up Canva API or image generation service
- [ ] Configure LinkedIn API credentials
- [ ] Create post logging mechanism
- [ ] Test error handling flows
- [ ] Test complete workflow end-to-end

---

## 6. Required API Credentials

1. **GitHub Personal Access Token** - Read/write access to repository
2. **OpenAI API Key** - For caption and content generation
3. **LinkedIn API Credentials** - For posting content
4. **Canva API Key** (or alternative image service) - For image generation

---

## 7. Workflow Diagram

```
Cron Trigger (09:00, 16:00 CST)
    ↓
Get Content Plan (Code Node)
    ↓
Fetch Prompt & Specs (GitHub API)
    ↓
Generate Caption & Image Text (OpenAI)
    ↓
Generate Image (Canva API)
    ↓
Post to LinkedIn (LinkedIn Node)
    ↓
Log Post Results (GitHub API)
    ↓
End / Summary Notification
```
