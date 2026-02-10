# Feature: Image Generator

> **Status:** ⏸️ PAUSED - Need to build professional templates  
> **Branch:** `feature/hybrid-image-generator`  
> **Last Updated:** February 2, 2026

---

## Quick Summary

### What's Built (Phases 1-5 Complete) ✅
- DALL-E client with retry logic
- Background generator with caching
- Theme system (chalkboard, watercolor, tech)
- Basic layout templates (comparison, evolution, single)
- Compositor (Puppeteer rendering)
- Main API orchestrator
- Sample generation script
- Workflow integration with feature flag

### Commits on feature/hybrid-image-generator:
```
6f7268d docs: mark Phase 5 Main API & Integration as complete
d4a3370 Task 5.4: Create sample generation script for all combinations
b0264f1 Task 5.3: Integrate hybrid generator with test-workflow-local.js
28c61b8 Task 5.2: Update OpenAI prompt for image metadata
9ee2f61 Task 5.1: Create main API orchestrator (index.js)
```

### What's Next (When You Return)
1. **Review saved Akash AB reference images** (user will save to local folder)
2. **Build professional templates** matching his style (pro-comparison, pro-grid, pro-cheatsheet)
3. **Phase 6:** Caching & Optimization
4. **Phase 7:** Testing & Documentation

---

## What We Learned About Image Styles

### ✅ Styles That CAN Be Automated (HTML/CSS + Puppeteer)

| Style                 | Example                       | Good For                       |
| --------------------- | ----------------------------- | ------------------------------ |
| **Left vs Right**     | COUNT(*) infographic (❌ vs ✅) | Comparisons, wrong vs right    |
| **Multi-Column Grid** | AWS vs Azure vs GCP table     | Feature comparisons            |
| **Code snippets**     | SQL examples with results     | Technical tutorials            |
| **Cheat Sheet**       | PySpark quick reference       | Code references, syntax guides |

### ❌ Styles That CANNOT Be Automated

| Style                     | Why Not                                                 |
| ------------------------- | ------------------------------------------------------- |
| **Whiteboard/Hand-drawn** | Custom illustrations, stick figures, hand-placed arrows |
| **Complex flow diagrams** | Each one is unique, requires manual design              |

**For hand-drawn styles:** Use Excalidraw (free, easy), hire a Fiverr designer ($25-75), or skip for MVP.

### Canva Assessment
- **Magic Design/AI tools** = Still requires manual interaction
- **API** = Enterprise tier only ($$$)
- **Verdict:** Not practical for full automation

---

## Reference Image Styles

**Target styles to build:**
1. **Clean infographic** - Light background, color-coded sections (like COUNT(*) example)
2. **Comparison grid** - Multi-column with logos (like AWS/Azure/GCP)
3. **Cheat sheet** - Grid paper background, color-coded sections, code snippets (like PySpark example)

**NOT building (requires manual design):**
- Whiteboard "How modern data teams work" style

**Reference images to review:** User will save Akash AB's images to a local folder for template matching.

---

## Questions to Answer When You Return

- [ ] Do you want your name in the footer? ("Follow Juma Hamdan for...")
- [ ] Any brand colors you prefer?
- [ ] What content types do you post most? (comparisons, tutorials, tips?)
- [ ] Review saved reference images folder

---

## Architecture

```
Content from GPT-4
        ↓
┌─────────────────────────────────────────┐
│      HYBRID IMAGE GENERATOR             │
├─────────────────────────────────────────┤
│ 1. Select theme (chalkboard/watercolor) │
│ 2. Select layout (comparison/grid)      │
│ 3. Generate background (DALL-E/cache)   │
│ 4. Composite with Puppeteer             │
│ 5. Output 1080x1080 PNG                 │
└─────────────────────────────────────────┘
        ↓
   Final Image
```

---

## Theme Definitions

### Chalkboard
- Dark green textured background
- Chalk-style typography (Permanent Marker font)
- White/cream text, yellow accents

### Watercolor
- Light cream paper texture
- Elegant serif typography (Playfair Display)
- Dark text, blue accents

### Tech
- Dark gradient with circuit pattern
- Modern sans-serif (Inter)
- White text, cyan/green accents

---

## Layout Templates

### Comparison (Side-by-Side)
```
┌────────────────────────────────────┐
│             TITLE                  │
├─────────────────┬──────────────────┤
│  ❌ Wrong Way   │  ✅ Right Way    │
│  • Point 1      │  • Point 1       │
│  • Point 2      │  • Point 2       │
├─────────────────┴──────────────────┤
│         💡 Key Insight             │
└────────────────────────────────────┘
```

### Grid (Multi-Column)
```
┌────────────────────────────────────┐
│       AWS vs AZURE vs GCP          │
├──────────┬──────────┬──────────────┤
│   AWS    │  Azure   │    GCP       │
├──────────┼──────────┼──────────────┤
│ Service1 │ Service1 │  Service1    │
│ Service2 │ Service2 │  Service2    │
└──────────┴──────────┴──────────────┘
```

### Evolution (Horizontal Flow)
```
┌────────────────────────────────────┐
│             TITLE                  │
├────────────────────────────────────┤
│  [A] ───→ [B] ───→ [C]            │
│  Stage 1   Stage 2   Stage 3       │
└────────────────────────────────────┘
```

---

## File Structure

```
automation/hybrid-image-generator/
├── index.js                 # Main API ✅
├── dalle-client.js          # DALL-E wrapper ✅
├── background-generator.js  # Background caching ✅
├── illustration-cache.js    # Icon caching ✅
├── compositor.js            # Puppeteer rendering ✅
├── themes/                  # Theme definitions ✅
├── layouts/                 # HTML templates ✅
├── styles/                  # CSS ✅
├── cache/                   # Cached images
└── test-outputs/            # Generated samples
```

---

## Implementation Progress

### ✅ Phase 1: DALL-E Integration (Complete)
- [x] DALL-E client with retry logic
- [x] Background generator with caching
- [x] Illustration cache management

### ✅ Phase 2: Theme System (Complete)
- [x] Chalkboard theme
- [x] Watercolor theme
- [x] Tech theme

### ✅ Phase 3: Layout Templates (Complete)
- [x] Comparison layout
- [x] Evolution layout
- [x] Single layout

### ✅ Phase 4: Compositor (Complete)
- [x] Puppeteer rendering
- [x] Background layering
- [x] 1080x1080 @ 2x output

### ✅ Phase 5: Integration (Complete)
- [x] Main API orchestrator
- [x] OpenAI prompt updates
- [x] Workflow integration

### ⏸️ Phase 6: Professional Templates (PAUSED)
- [ ] Build COUNT(*) style template
- [ ] Build AWS/Azure/GCP grid template
- [ ] Add tech logo icon library

### ⏸️ Phase 7: Testing & Polish (PAUSED)
- [ ] Test all combinations
- [ ] Finalize branding
- [ ] Document topic-to-template mapping

---

## Cost Analysis

| Component                 | Cost       | Notes               |
| ------------------------- | ---------- | ------------------- |
| DALL-E background         | $0.04      | Per image           |
| GPT-4 content             | ~$0.02     | Already in workflow |
| **Per post (with cache)** | **~$0.04** | Backgrounds reused  |
| **Monthly (60 posts)**    | **~$2.50** | Minimal             |

---

## Next Session Prompt

When you return to this feature, use this prompt with Claude Code:

```
Read docs/03-Features/image-generator.md and docs/04-Development/coding-standards.md.

CONTEXT:
- Branch: feature/hybrid-image-generator
- Phases 1-5 complete (basic system works)
- Need: Professional HTML/CSS templates matching reference styles

TASK: Build two polished templates:
1. "pro-comparison" - Clean left vs right (like COUNT(*) infographic)
2. "pro-grid" - Multi-column comparison (like AWS vs Azure)

Requirements:
- Google Fonts (Inter, Fira Code)
- Clean spacing and typography
- Color-coded sections
- Footer with author name
- 1080x1080 output

Start by asking me about branding preferences before building.
```

---

[← Back to TODO](../01-Project/TODO.md) | [Development Guide](../04-Development/coding-standards.md)
