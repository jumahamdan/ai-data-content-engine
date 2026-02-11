# AI Agent Instructions

> **How to use:** Start every Claude Code session with:
> ```
> Follow the workflow in docs/04-Development/AI_AGENT_INSTRUCTIONS.md
>
> I want to [what] because [why].
> ```

---

## Session Workflow

### 1. Orientation (do this first, every session)

```
Read CLAUDE.md                          → project map + doc index
Read docs/04-Development/coding-standards.md → code style + patterns
Read the relevant feature doc in docs/03-Features/
```

- Check `git status` and current branch
- Review the feature doc's task list — find the next unchecked task

### 2. Branch Setup

```bash
# Always create a new branch from develop
git checkout develop
git pull origin develop
git checkout -b feature/<feature-name>
```

> **Note:** PRs should target `develop` unless it is a hotfix (which targets `main`).

Branch naming:
| Type     | Pattern                       | Example                          |
|----------|-------------------------------|----------------------------------|
| Feature  | `feature/<feature-name>`      | `feature/comment-replies`        |
| Fix      | `fix/<issue-description>`     | `fix/hashtags-array-crash`       |
| Refactor | `refactor/<area>`             | `refactor/publisher-error-handling` |

### 3. Task-Level Development

Work on **one task at a time**. For each task:

1. **Read** the relevant source files before changing anything
2. **Implement** the task
3. **Test** locally — run the module, check output
4. **Check quality:**
   - Run `cd automation && npm run lint` (must pass with zero errors)
   - Run `cd automation && npm run format:check` (must pass)
   - No code duplication (extract shared logic if repeated 3+ times)
   - Proper error handling at system boundaries
   - No hardcoded secrets or credentials
5. **Commit** immediately after each task passes:
   ```
   Task X.X: <brief description of what was done>
   ```
6. **Update** the task checkbox in the feature doc

### 4. PR and Session End

When all tasks for the feature are complete:

1. Push the branch:
   ```bash
   git push -u origin feature/<feature-name>
   ```

2. Create a PR **targeting `develop`** with this format:
   ```
   ## Summary
   - What was built and why

   ## Changes
   - Task-by-task list of what was done

   ## Test plan
   - How to verify each change works
   ```

3. Watch the CI run. If lint, format, SonarCloud, or Copilot flags issues:
   - Evaluate each finding (not all are valid)
   - Fix real issues, dismiss false positives
   - Push fixes as new commits (don't amend)

4. Update docs:
   - Feature doc status → `✅ Complete`
   - `docs/01-Project/changelog.md` → add entry for this session
   - `docs/01-Project/roadmap.md` → update if a phase milestone was reached

---

## Code Quality Checklist

Run through this before every commit:

- [ ] No `var` — use `const` or `let`
- [ ] Async/await (not raw `.then()` chains)
- [ ] Error handling at external boundaries (API calls, file I/O, DB queries)
- [ ] No secrets in code (use env vars or config files)
- [ ] No dead code left behind
- [ ] Functions are focused and single-purpose
- [ ] Descriptive names (variables, functions, files)

---

## Commit Message Format

```
Task X.X: <imperative description>

# Examples:
Task 1.1: Create content generator orchestrator
Task 2.3: Add Firestore composite index for approved posts query
Fix: Handle non-array hashtags in LinkedIn adapter
Refactor: Extract shared Firestore client from publisher
```

---

## File Conventions

| Area                  | Location                        | Notes                              |
|-----------------------|---------------------------------|------------------------------------|
| Automation code       | `automation/`                   | All Node.js modules                |
| Workflows             | `.github/workflows/`            | GitHub Actions YAML                |
| Prompt templates      | `prompts/`                      | Mustache templates for Claude API  |
| Topics                | `topics/topic-bank.json`        | Content topic rotation bank        |
| Content spec          | `content-spec/`                 | Tone guide + post structure rules  |
| Firebase config       | Root (`firebase.json`, etc.)    | Firestore rules, indexes           |
| Credentials           | `config/` (gitignored)          | Service accounts, never committed  |
| Environment           | `automation/.env` (gitignored)  | Local dev secrets                  |

---

## Environment Variables

**Local:** `automation/.env` (copy from `automation/.env.example`)

**CI/CD:** GitHub repository secrets

| Secret                     | Purpose                    | Where used             |
|----------------------------|----------------------------|------------------------|
| `ANTHROPIC_API_KEY`        | Claude API for generation  | generate-content.yml   |
| `FIREBASE_SERVICE_ACCOUNT` | Base64 service account JSON| Both workflows         |
| `TWILIO_ACCOUNT_SID`       | WhatsApp notifications     | Both workflows         |
| `TWILIO_AUTH_TOKEN`        | WhatsApp notifications     | Both workflows         |
| `TWILIO_WHATSAPP_FROM`     | Sender number              | Both workflows         |
| `WHATSAPP_TO`              | Recipient number           | Both workflows         |

---

## Quick Commands

```bash
# Install dependencies
cd automation && npm install

# Lint code
cd automation && npm run lint

# Auto-fix lint issues
cd automation && npm run lint:fix

# Check formatting
cd automation && npm run format:check

# Auto-format code
cd automation && npm run format

# Test content generator
node content-generator/index.js

# Test publisher
node publisher/index.js

# Test image generation
npm run test-images

# Deploy Firestore indexes
firebase deploy --only firestore:indexes
```
