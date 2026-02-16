# Content Strategy Reframe

**Status:** In Progress
**Branch:** feature/content-strategy-reframe
**PR:** TBD

## Overview

Reframe the content engine from "interview prep" positioning to "practitioner sharing real-world lessons." Expand the topic bank from 4 categories / 15 topics to 6 pillars / 30 topics, rewrite prompt templates to remove interview framing, and add guardrails to prevent generic influencer tone.

## Acceptance Criteria

- [ ] Topic bank has 6 categories with 5 topics each (30 total)
- [ ] No "interview" framing in any prompt template or content spec
- [ ] Each pillar maps to a prompt template via topic-selector.js and claude-client.js
- [ ] `concept-breakdown.md` replaces `interview-explainer.md`
- [ ] Two new prompt templates: `automation-guide.md` and `practitioner-lesson.md`
- [ ] `tone.md` includes practitioner guardrails and banned phrases
- [ ] `post-templates.md` documents all 6 content formats
- [ ] MAX_HISTORY increased to 20
- [ ] Lint + format pass with zero errors

## Tasks

| Task | Description | Status |
|------|-------------|--------|
| 1.0 | Create feature doc and acceptance criteria | Complete |
| 1.1 | Replace topic-bank.json with 6 categories / 30 topics | Pending |
| 1.2 | Rename interview-explainer.md to concept-breakdown.md, rewrite | Pending |
| 1.3 | Create automation-guide.md and practitioner-lesson.md | Pending |
| 1.4 | Update topic-selector.js mappings and MAX_HISTORY | Pending |
| 1.5 | Update claude-client.js TEMPLATE_MAP | Pending |
| 1.6 | Update tone.md with guardrails | Pending |
| 1.7 | Update post-templates.md with 6 formats | Pending |

## Technical Notes

- Category-to-template mapping is 1:1 (each pillar gets one default prompt format)
- Hot takes are topics within each category — Claude adapts tone based on topic phrasing
- Existing architecture-comparison.md, optimization-story.md, and layered-mental-model.md are kept as-is
- The `governance_trust` → `layered-mental-model` and `ai_data_workflows` → `optimization-story` mappings are pragmatic reuse; can be refined later with dedicated templates
