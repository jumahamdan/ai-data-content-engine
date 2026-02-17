# Claude Code Development Guide

> **Purpose:** Standard instructions for Claude Code when working on any feature in this project.
> **Usage:** Reference this file at the start of any Claude session.

---

## Project Overview

**AI & Data Content Engine** — A 100% serverless LinkedIn content publishing system that generates and posts 2x/day technical content about Data Engineering, AI/LLMs, RAG, and Architecture.

**Tech Stack:**
- Node.js (automation scripts)
- GitHub Actions (scheduled workflows - replaces n8n)
- Claude API (content generation)
- Puppeteer (image generation)
- Twilio Functions (WhatsApp webhook)
- Firebase Firestore (cloud queue)

**Key Directories:**
```
automation/
├── content-generator/   # Claude API integration (to build)
├── publisher/           # LinkedIn posting (to build)
├── whatsapp/            # Firestore queue + Twilio client
├── whatsapp-function/   # Deployed Twilio webhook
└── hybrid-image-generator/  # DALL-E + Gemini + Puppeteer image pipeline

.github/workflows/       # GitHub Actions (to build)
config/                  # Credentials (gitignored)
content-spec/            # Tone, visual rules, post templates
prompts/                 # AI generation templates
topics/                  # Topic rotation bank
docs/                    # Architecture, roadmap, feature specs
docs/03-Features/           # Individual feature documentation
```

---

## Architecture

See [System Architecture](../02-Architecture/system-architecture.md) for full system design.

```
GitHub Actions → Claude API → Firestore → WhatsApp → LinkedIn
   (schedule)     (generate)    (queue)    (approve)   (post)
```

**Key principle:** Everything runs in the cloud. No local server required.

---

## Session Workflow

### Starting a Session

1. **Read the feature doc first:**
   ```
   Read docs/03-Features/<feature-name>.md and follow the Claude AI Development Prompt section.
   ```

2. **Check current state:**
   - Review the task list in the feature doc
   - Identify the next unchecked task
   - Check git status and current branch

3. **Create/checkout feature branch:**
   ```bash
   git checkout -b feature/<feature-name>
   # or
   git checkout feature/<feature-name>
   ```

### During Development

1. **One task at a time** — Complete fully before moving on
2. **Commit after each task** — Clear, descriptive messages
3. **Test before committing** — Run relevant test scripts
4. **Update task checkbox** — Mark ☑ in the feature doc when done

### Ending a Session

1. Summarize what was completed
2. Update task checkboxes in feature doc
3. Commit all changes
4. Note which task is next for the user

---

## Code Standards

### File Organization
- Keep modules focused and single-purpose
- Use descriptive file names (e.g., `whatsapp-approval-service.js`)
- Group related files in subdirectories

### Code Style
- Use `const`/`let`, never `var`
- Async/await over raw Promises
- Meaningful variable names
- Comments for complex logic only

### Error Handling
- Always handle errors gracefully
- Log errors with context
- Provide user-friendly messages
- Never expose sensitive data in errors

### Dependencies
- Add to `automation/package.json`
- Document why each dependency is needed
- Prefer well-maintained packages

---

## Linting & Formatting

### ESLint
- Config: `automation/.eslintrc.json`
- Run: `cd automation && npm run lint`
- Auto-fix: `cd automation && npm run lint:fix`
- All code must pass lint with zero errors before committing

### Prettier
- Config: `automation/.prettierrc.json`
- Run check: `cd automation && npm run format:check`
- Auto-format: `cd automation && npm run format`
- Style: single quotes, no trailing commas, 2-space indent, 120 char line width, semicolons

---

## Git Workflow

### Branch Model (Gitflow)

- `main` — production releases only. Protected branch.
- `develop` — integration branch. All feature PRs target this.
- `feature/<name>` — feature branches, created from `develop`
- `fix/<name>` — bug fixes, created from `develop` (or `main` for hotfixes)
- `refactor/<name>` — code improvements, created from `develop`

### Workflow
1. Create feature branch from `develop`
2. Develop, commit with `Task X.X:` format
3. Push and create PR targeting `develop`
4. CI runs lint + format checks automatically
5. After review and CI pass, merge to `develop`
6. Periodically, `develop` is merged to `main` for releases

### Commit Messages
```
Task X.X: <brief description>

# Examples:
Task 1.1: Create WhatsApp service module
Task 2.3: Add pending post queue logic
Fix: Handle timeout edge case in approval flow
```

### Before PR
- All tasks complete and checked off
- `cd automation && npm run lint` passes with zero errors
- `cd automation && npm run format:check` passes
- Tests passing
- No uncommitted changes
- Feature doc status updated to ✅ Complete

### Branch Protection (configured in GitHub UI)

**`main`:**
- Require PR before merging (no direct pushes)
- Require at least 1 approval
- Require CI status checks to pass (`Lint & Format Check`)
- Require branch to be up to date before merging
- No force pushes, no deletions

**`develop`:**
- Require PR before merging
- Require CI status checks to pass (`Lint & Format Check`)

---

## Testing

### Running Tests
```bash
cd automation
npm test                    # Run all tests
npm run test-images         # Test image generation
node test-workflow-local.js # Test full workflow
```

### Test Output Location
- `automation/test-outputs/` — Generated images, logs

### What to Test
- Happy path (expected inputs)
- Edge cases (empty data, timeouts)
- Error conditions (API failures, invalid input)

---

## Environment Variables

**Location:** `automation/.env` (gitignored)

**Template:** `automation/.env.example`

**Required Variables:**
```bash
# Claude API (content generation)
ANTHROPIC_API_KEY=sk-ant-...

# Twilio (WhatsApp)
TWILIO_ACCOUNT_SID=ACxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxx
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
WHATSAPP_TO=whatsapp:+1xxxxxxxxxx

# LinkedIn (future)
LINKEDIN_ACCESS_TOKEN=...
```

**Firebase:** Uses service account JSON at `config/firebase-service-account.json`

**GitHub Secrets (for Actions):**
- `ANTHROPIC_API_KEY`
- `FIREBASE_SERVICE_ACCOUNT` (base64 encoded JSON)
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`
- `TWILIO_WHATSAPP_FROM`, `WHATSAPP_TO`

**Never commit real credentials!**

---

## Critical Review Checkpoint

> **Before implementing, Claude should evaluate:**

### 1. Architecture Review
- Does this approach fit the existing codebase?
- Are there simpler alternatives?
- What are the trade-offs?

### 2. Dependency Check
- Is this dependency necessary?
- Is it well-maintained?
- Are there lighter alternatives?

### 3. Edge Cases
- What happens if the API is down?
- What if the user doesn't respond?
- What if data is malformed?

### 4. Security Review
- Are credentials handled safely?
- Is user input validated?
- Are errors logged without exposing secrets?

### 5. Improvement Suggestions
If you see a better way to implement something:
1. Explain the alternative approach
2. List pros and cons vs. the documented approach
3. Ask the user which direction to take
4. Document the decision in the feature doc

---

## Troubleshooting

### Common Issues

| Issue                     | Solution                                           |
| ------------------------- | -------------------------------------------------- |
| `GITHUB_TOKEN not set`    | Check `automation/.env` exists and has valid token |
| `Cannot find module`      | Run `cd automation && npm install`                 |
| `Puppeteer launch failed` | May need to install Chrome/Chromium dependencies   |
| `OpenAI API error 429`    | Rate limited — wait and retry                      |
| `BOM parse error`         | Run BOM stripping script (see housekeeping)        |

### Debug Mode
```bash
# Add DEBUG=true to see verbose output
DEBUG=true node test-workflow-local.js
```

---

## Documentation Updates

When completing a feature:

1. **Update feature doc** — Change status from 🔄 to ✅
2. **Update TODO.md** — Mark feature complete, add any new items
3. **Update README.md** — If feature changes how to use the project
4. **Update roadmap.md** — If phase is completed

---

## Quick Reference

### Start a Feature
```
Read docs/03-Features/<name>.md and follow the Claude AI Development Prompt.
Tasks 1.1-X.X are complete. Start with Task X.X: <description>.
```

### Resume a Feature
```
Read docs/03-Features/<name>.md. I left off at Task X.X. Continue from there.
```

### Review Before Implementing
```
Before building, review the approach in docs/03-Features/<name>.md.
If you see improvements, suggest them before coding.
```

---

[← Back to README](../../README.md)
