# Workflow Improvements

**Status:** In Progress
**Branch:** feature/workflow-improvements
**PR:** TBD

## Overview

Consolidate 3 GitHub Actions workflows into 2, add SonarCloud static analysis, modernize with npm caching and deterministic builds, and enforce branch protection rules on develop and main.

## Acceptance Criteria

- [ ] 3 workflow files consolidated into 2 (ci.yml + automation.yml)
- [ ] SonarCloud analysis runs on every PR (informational, not blocking)
- [ ] sonar-project.properties configured for automation/ source directory
- [ ] All workflows use npm ci + npm cache for deterministic, fast builds
- [ ] Concurrency groups prevent stale/duplicate CI runs
- [ ] Automation jobs (generate/publish) have cancel-in-progress: false
- [ ] workflow_dispatch dropdown allows generate, publish, or both
- [ ] Branch protection on develop: require PR + passing CI, no force push
- [ ] Branch protection on main: require PR + passing CI, no force push
- [ ] SONAR_TOKEN added as GitHub secret

## Tasks

| Task | Description | Status |
|------|-------------|--------|
| 1.0 | Create feature branch and feature doc | Complete |
| 1.1 | Create sonar-project.properties | Pending |
| 1.2 | Update ci.yml with concurrency + SonarCloud job | Pending |
| 1.3 | Create automation.yml (merged generate + publish) | Pending |
| 1.4 | Delete old workflow files | Pending |
| 1.5 | Set up branch protection rules via gh CLI | Pending |
| 1.6 | Update docs (CLAUDE.md, changelog, feature docs) | Pending |
| 1.7 | Push and create PR | Pending |

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
