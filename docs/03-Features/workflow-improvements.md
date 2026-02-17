# Workflow Improvements

**Status:** Complete
**Branch:** feature/workflow-improvements
**PR:** [#9](https://github.com/jumahamdan/ai-data-content-engine/pull/9)

## Overview

Consolidate 3 GitHub Actions workflows into 2, add SonarCloud static analysis, modernize with npm caching and deterministic builds, and enforce branch protection rules on develop and main.

## Acceptance Criteria

- [x] 3 workflow files consolidated into 2 (`ci.yml` + `automation.yml`)
- [x] SonarCloud analysis runs on every PR (informational, not blocking)
- [x] `sonar-project.properties` configured for automation/ source directory
- [x] All workflows use `npm ci` + `npm cache` for deterministic, fast builds
- [x] Concurrency groups prevent stale/duplicate CI runs
- [x] Automation jobs (generate/publish) have `cancel-in-progress: false`
- [x] `workflow_dispatch` dropdown allows generate, publish, or both
- [x] Branch protection on `develop`: require PR + passing CI, no force push
- [x] Branch protection on `main`: require PR + passing CI, no force push
- [x] `SONAR_TOKEN` added as GitHub secret

## Tasks

| Task | Description | Status |
|------|-------------|--------|
| 1.0 | Create feature branch and feature doc | Complete |
| 1.1 | Create sonar-project.properties | Complete |
| 1.2 | Update ci.yml with concurrency + SonarCloud job | Complete |
| 1.3 | Create automation.yml (merged generate + publish) | Complete |
| 1.4 | Delete old workflow files | Complete |
| 1.5 | Set up branch protection rules via gh CLI | Complete |
| 1.6 | Update docs (CLAUDE.md, changelog, feature docs) | Complete |
| 1.7 | Push and create PR | Complete |

## Technical Notes

### Why 2 workflows, not 1
- CI (lint, format, SonarCloud) and automation (generate, publish) have different triggers, concurrency needs, and failure implications
- Branch protection required status checks only work correctly when the job always runs for the trigger type
- Combining would cause skipped jobs to appear in both PR checks and manual dispatch UI

### Concurrency design
- CI: `cancel-in-progress: true` — fast feedback, cancel stale runs
- Automation: `cancel-in-progress: false` — side-effectful operations (Firestore, WhatsApp) must not be interrupted

### SonarCloud
- Informational only (does not block PR merge)
- Runs after lint-and-format passes
- Updates baseline on push to develop/main

## Bugs / Issues

None yet.
