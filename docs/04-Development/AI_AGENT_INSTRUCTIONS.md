# AI Agent Instructions

> **How to use:** Start every Claude Code session with:
> ```
> Follow the workflow in docs/04-Development/AI_AGENT_INSTRUCTIONS.md
>
> I want to [what] because [why].
> ```

---

## Session Rules

- **One feature at a time** — don't switch features within a session
- **Token budget** — keep usage under 60%; end session when the feature PR is merged
- **CLAUDE.md is already loaded** — use the docs index to navigate, don't scan the whole repo
- **Quality gates are non-negotiable** — lint + format must pass before every commit, regardless of workflow mode

---

## Step 0: Task Assessment (always do this first)

Score the task on 5 dimensions (0 = lightweight, 1 = complex):

| Dimension | 0 (Lightweight) | 1 (Complex) |
|-----------|-----------------|-------------|
| **Scope** | Single concern | Multiple concerns |
| **Sessions** | Fits in 1 session | Spans 2+ sessions |
| **Research** | Known patterns | New packages / unfamiliar domain |
| **Sub-features** | One deliverable | Multiple distinct deliverables |
| **Unknowns** | Clear implementation path | Needs investigation |

**Sum the 5 scores (total 0–5), then route:**

| Score | Route |
|-------|-------|
| 0–1 | Lightweight Workflow |
| 2+ | GSD Mode |

**Present the assessment to the user and wait for confirmation before proceeding.**

---

## Lightweight Workflow

For tasks scoring 0–1. Three phases: Plan, Build, Finish.

### Phase 1: Plan

1. **Research existing code** — read relevant source files, feature docs, and architecture docs
2. **Propose acceptance criteria** — clear, testable conditions for "done"
3. **Task breakdown** — ordered list of implementation tasks (Task 1.1, 1.2, etc.)
4. **Wait for user approval** before proceeding
5. **Create branch:**
   ```bash
   git checkout develop && git pull origin develop
   git checkout -b feature/<feature-name>
   ```
6. **Create feature doc** at `docs/03-Features/<feature-name>.md` (see Feature Doc Format below)
7. **Commit docs:**
   ```
   Task 1.0: Add feature doc and acceptance criteria for <feature-name>
   ```

### Phase 2: Build

Work through tasks one at a time:

1. **Read** relevant source files before changing anything
2. **Implement** the task
3. **Run quality gates:**
   ```bash
   cd automation && npm run lint
   cd automation && npm run format:check
   ```
4. **Commit** immediately after each task passes:
   ```
   Task X.X: <imperative description of what was done>
   ```
5. **Update** the task status in the feature doc (Pending → Complete)

### Phase 3: Finish and PR

1. **Pre-PR checks:**
   - All tasks complete and checked off in feature doc
   - `cd automation && npm run lint` passes with zero errors
   - `cd automation && npm run format:check` passes
   - No uncommitted changes
   - Feature doc status updated to Complete

2. **Push and create PR targeting `develop`:**
   ```bash
   git push -u origin feature/<feature-name>
   gh pr create --base develop --title "<feature-name>: <summary>" --body "..."
   ```

3. **Monitor CI pipeline** — wait for the `Lint & Format Check` job to pass

4. **Review automated suggestions** — SonarCloud, Copilot code review, etc.
   - Evaluate each finding (not all are valid)
   - Fix real issues, dismiss false positives
   - Push fixes as new commits (don't amend)

5. **Update docs:**
   - Feature doc status → Complete
   - `docs/01-Project/changelog.md` → add entry for this session
   - `CLAUDE.md` Feature Status table → update if needed

---

## GSD Mode

For tasks scoring 2+. Uses the GSD (Get Shit Done) workflow system with this project's overrides.

### Project Overrides (GSD must follow these)

1. **Branch convention:** Always branch from `develop` using this project's naming (`feature/<name>`, `fix/<name>`, `refactor/<name>`). Never use GSD phase branches.
2. **Feature doc required:** `docs/03-Features/<feature-name>.md` must always be created as the committed source of truth. `.planning/` is just a working scratchpad (gitignored).
3. **Quality gates:** Run `cd automation && npm run lint` and `cd automation && npm run format:check` before every commit.
4. **Commit messages:** Use this project's `Task X.X: <description>` format, not GSD's `type(phase-plan):` format.
5. **Documentation updates:** Feature doc statuses, `CLAUDE.md` Feature Status table, `docs/01-Project/changelog.md`.
6. **PR creation:** GSD doesn't create PRs — always finish with Phase 3 (Finish and PR) above.

### GSD Step-by-Step

#### Step 1: Map Codebase (one-time per local working copy)

The agent runs `/gsd:map-codebase` to analyze the project structure. This only needs to happen once per local clone — results persist in `.planning/codebase/` for that working copy (fresh clones or new machines will need to re-run this).

#### Step 2: Create Milestone

The agent runs `/gsd:new-milestone` with the feature requirements. GSD will:
- Gather context through adaptive questioning
- Create a milestone with phased breakdown
- Store planning artifacts in `.planning/`

#### Step 3: Plan + Execute Each Phase

For each phase in the milestone:
1. Agent runs `/gsd:plan-phase N` — creates a detailed execution plan
2. Agent runs `/gsd:execute-phase N` — implements the plan with atomic commits
3. Agent runs quality gates after each commit (project override #3)

#### Step 4: Verify + PR

1. Agent runs `/gsd:verify-work` to validate the implementation
2. Agent follows **Phase 3: Finish and PR** (see Lightweight Workflow above)

### Handoff Prompts

**The user should never type GSD commands.** The agent manages everything internally. At every session boundary, the agent outputs a ready-to-paste handoff prompt.

#### Handoff after Step 1 (Map Codebase):
```
Follow the workflow in docs/04-Development/AI_AGENT_INSTRUCTIONS.md

Feature: <feature-name>
Branch: feature/<feature-name>
Mode: GSD (score: X/5)
Status: Codebase mapped. Ready to create milestone.
Next: Run /gsd:new-milestone with these requirements: <requirements>
```

#### Handoff after Step 2 (Create Milestone):
```
Follow the workflow in docs/04-Development/AI_AGENT_INSTRUCTIONS.md

Feature: <feature-name>
Branch: feature/<feature-name>
Mode: GSD (score: X/5)
Status: Milestone created with N phases.
Completed: Codebase mapping, milestone planning
Next: Run /gsd:plan-phase 1 then /gsd:execute-phase 1
Context: <any decisions, blockers, or notes>
```

#### Handoff after Step 3 (Phase N complete):
```
Follow the workflow in docs/04-Development/AI_AGENT_INSTRUCTIONS.md

Feature: <feature-name>
Branch: feature/<feature-name>
Mode: GSD (score: X/5)
Status: Phase N of M complete.
Completed: <list of completed phases and what they did>
Next: Run /gsd:plan-phase N+1 then /gsd:execute-phase N+1
Context: <bugs found, decisions made, blockers>
```

#### Handoff after Step 4 (All phases done):
```
Follow the workflow in docs/04-Development/AI_AGENT_INSTRUCTIONS.md

Feature: <feature-name>
Branch: feature/<feature-name>
Mode: GSD (score: X/5)
Status: All phases complete. Ready for verification and PR.
Completed: <summary of all phases>
Next: Run /gsd:verify-work, then Phase 3 (Finish and PR)
Context: <any final notes>
```

---

## Continuation Prompts (Lightweight Mode)

When a lightweight session ends before the feature is complete, output this handoff:

```
Follow the workflow in docs/04-Development/AI_AGENT_INSTRUCTIONS.md

Feature: <feature-name>
Branch: feature/<feature-name>
Feature doc: docs/03-Features/<feature-name>.md
Mode: Lightweight
Last completed: Task X.X — <description>
Next task: Task X.X — <description>
Context: <any bugs, decisions, or blockers>
```

---

## Code Quality Standards

These are this project's quality gates. They must pass before every commit.

### Linting (ESLint 8)
```bash
cd automation && npm run lint        # must pass with zero errors
cd automation && npm run lint:fix    # auto-fix what's possible
```
- Config: [automation/.eslintrc.json](../../automation/.eslintrc.json)
- Extends `eslint:recommended`
- Key rules: `no-var` (error), `prefer-const` (warn), `eqeqeq` (error), `no-throw-literal` (error)
- Unused function parameters with `_` prefix are allowed (via `argsIgnorePattern: '^_'`)

### Formatting (Prettier 3)
```bash
cd automation && npm run format:check   # must pass
cd automation && npm run format         # auto-format
```
- Config: [automation/.prettierrc.json](../../automation/.prettierrc.json)
- Single quotes, no trailing commas, 2-space indent, 120 char width, semicolons, auto line endings

### CI Pipeline
- Runs on all PRs to `develop` and `main`
- Job: `Lint & Format Check` (Node.js 20, `npm run lint` + `npm run format:check`)
- PR also reviewed by GitHub Copilot and SonarCloud (when configured)

### Code Style
- `const`/`let` only, never `var`
- Async/await over raw `.then()` chains
- Error handling at system boundaries (API calls, file I/O, DB queries)
- No secrets in code — use env vars
- No dead code left behind
- Functions are focused and single-purpose
- Descriptive names for variables, functions, and files

### Pre-Commit Checklist
- [ ] `cd automation && npm run lint` — zero errors
- [ ] `cd automation && npm run format:check` — passes
- [ ] No `var` — uses `const` or `let`
- [ ] Async/await (no raw `.then()` chains)
- [ ] Error handling at external boundaries
- [ ] No secrets in code
- [ ] No dead code left behind

---

## Feature Doc Format

Create at `docs/03-Features/<feature-name>.md`:

```markdown
# <Feature Name>

**Status:** In Progress | Complete
**Branch:** feature/<feature-name>
**PR:** #N (added when PR is created)

## Overview

Brief description of what this feature does and why it's needed.

## Acceptance Criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Tasks

| Task | Description | Status |
|------|-------------|--------|
| 1.0 | Create feature doc and acceptance criteria | Complete |
| 1.1 | ... | Pending |
| 1.2 | ... | Pending |

## Technical Notes

Implementation details, architecture decisions, dependencies.

## Bugs / Issues

Track any bugs or issues discovered during development.
```

---

## File Conventions

| Area | Location | Notes |
|------|----------|-------|
| Automation code | `automation/` | All Node.js modules |
| Workflows | `.github/workflows/` | GitHub Actions YAML |
| Prompt templates | `prompts/` | Mustache templates for Claude API |
| Topics | `topics/topic-bank.json` | Content topic rotation bank |
| Content spec | `content-spec/` | Tone guide + post structure rules |
| Firebase config | Root (`firebase.json`, etc.) | Firestore rules, indexes |
| Credentials | `config/` (gitignored) | Service accounts, never committed |
| Environment | `automation/.env` (gitignored) | Local dev secrets |
| Feature docs | `docs/03-Features/` | One doc per feature |
| GSD scratchpad | `.planning/` (gitignored) | GSD working artifacts, not committed |

---

## Quick Commands

```bash
# Install dependencies
cd automation && npm install

# Lint
cd automation && npm run lint
cd automation && npm run lint:fix

# Format
cd automation && npm run format:check
cd automation && npm run format

# Test (integration — requires API keys and external services, may have side effects)
cd automation && npm test

# Deploy Firestore indexes
firebase deploy --only firestore:indexes
```
