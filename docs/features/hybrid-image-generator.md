# Feature: Hybrid Image Generator (DALL-E + Puppeteer)

> **Status:** 🔄 Not Started  
> **Branch:** `feature/hybrid-image-generator`  
> **Replaces:** Current `automation/image-generator/` (keep as fallback)  
> **Priority:** MVP Enhancement

---

## Goal

Rebuild the image generator to produce professional, illustrated infographics like the LinkedIn examples — with hand-drawn visuals, textured backgrounds, and storytelling layouts. Uses DALL-E for creative illustrations + Puppeteer for crisp text overlay.

---

## Reference Examples

### Style 1: Chalkboard Educational
- Dark textured background (chalkboard)
- Hand-drawn café/building illustrations
- Chalk-style typography
- Two-column "Features vs Challenges"
- Warm, educational vibe

### Style 2: Light Illustrated Evolution
- Light cream/paper texture
- Watercolor buildings, lakes, warehouses
- Horizontal comparison flow (A → B → C)
- Pros/cons with ✓ ✗ indicators
- Professional storytelling

### Common Elements
- **Illustrated metaphors** (not flat icons)
- **Textured backgrounds** (not plain colors)
- **Comparison layouts** (side-by-side or evolution)
- **Color-coded sections**
- **Crisp, readable text**

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    HYBRID IMAGE GENERATION                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  INPUT: Content from OpenAI                                │
│  {                                                         │
│    title: "Data Mesh for Data Engineers",                  │
│    theme: "chalkboard" | "watercolor" | "tech",            │
│    metaphor: "cafés representing data domains",            │
│    sections: [                                             │
│      { title: "Key Features", items: [...], type: "pros" },│
│      { title: "Challenges", items: [...], type: "cons" }   │
│    ],                                                      │
│    layout: "comparison" | "evolution" | "single"           │
│  }                                                         │
│                                                             │
│  STEP 1: Generate Background (DALL-E 3)                    │
│  ────────────────────────────────────────                  │
│  Prompt: "Chalkboard texture background with hand-drawn    │
│  café buildings representing data domains, soft lighting,  │
│  no text, illustration style, 1024x1024"                   │
│  Output: background.png                                    │
│                                                             │
│  STEP 2: Generate Illustration Elements (DALL-E 3)         │
│  ────────────────────────────────────────                  │
│  Prompt: "Hand-drawn watercolor data warehouse building,   │
│  isometric view, soft colors, transparent background"      │
│  Output: icon_warehouse.png, icon_lake.png, etc.           │
│  (Cache these - reuse across posts)                        │
│                                                             │
│  STEP 3: Composite Final Image (Puppeteer)                 │
│  ────────────────────────────────────────                  │
│  - Load background image                                   │
│  - Position illustration elements                          │
│  - Overlay HTML/CSS text layout                            │
│  - Render to PNG (1080x1080 @ 2x)                          │
│  Output: final-post.png                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Theme Definitions

### Theme: Chalkboard
```json
{
  "name": "chalkboard",
  "background": {
    "dallePrompt": "Dark green chalkboard texture background, slightly dusty, soft lighting from top, no text or drawings, photorealistic, 1024x1024",
    "fallbackColor": "#2d4a3e"
  },
  "typography": {
    "titleFont": "Permanent Marker, cursive",
    "bodyFont": "Patrick Hand, cursive",
    "titleColor": "#ffffff",
    "bodyColor": "#e8e8e8",
    "accentColor": "#f4d03f"
  },
  "illustrations": {
    "style": "hand-drawn chalk sketch style, white lines on transparent",
    "examples": ["café storefront", "data pipeline arrows", "people icons"]
  }
}
```

### Theme: Watercolor
```json
{
  "name": "watercolor",
  "background": {
    "dallePrompt": "Light cream paper texture background, subtle watercolor wash edges, soft warm lighting, no text, minimal, 1024x1024",
    "fallbackColor": "#faf8f5"
  },
  "typography": {
    "titleFont": "Playfair Display, serif",
    "bodyFont": "Open Sans, sans-serif",
    "titleColor": "#2c3e50",
    "bodyColor": "#34495e",
    "accentColor": "#3498db"
  },
  "illustrations": {
    "style": "soft watercolor illustration, pastel colors, architectural",
    "examples": ["warehouse building", "lake with data", "modern office"]
  }
}
```

### Theme: Tech
```json
{
  "name": "tech",
  "background": {
    "dallePrompt": "Dark gradient background with subtle circuit board pattern, deep blue to purple, futuristic, no text, 1024x1024",
    "fallbackColor": "#1a1a2e"
  },
  "typography": {
    "titleFont": "Inter, sans-serif",
    "bodyFont": "Inter, sans-serif",
    "titleColor": "#ffffff",
    "bodyColor": "#b8b8b8",
    "accentColor": "#00d4aa"
  },
  "illustrations": {
    "style": "isometric 3D tech icons, glowing edges, dark background",
    "examples": ["database cylinder", "cloud servers", "neural network"]
  }
}
```

---

## Layout Templates

### Layout: Comparison (Side-by-Side)
```
┌─────────────────────────────────────────────────────────────┐
│                         TITLE                                │
├─────────────────────────────────────────────────────────────┤
│  [Illustration 1]              [Illustration 2]             │
│    Concept A                     Concept B                  │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐          ┌─────────────────┐          │
│  │  Key Features   │          │   Challenges    │          │
│  │  ✓ Point 1      │          │   ⚠ Point 1     │          │
│  │  ✓ Point 2      │          │   ⚠ Point 2     │          │
│  │  ✓ Point 3      │          │   ⚠ Point 3     │          │
│  └─────────────────┘          └─────────────────┘          │
├─────────────────────────────────────────────────────────────┤
│                    💡 Key Insight                            │
│              "Summary statement here"                        │
└─────────────────────────────────────────────────────────────┘
```

### Layout: Evolution (Horizontal Flow)
```
┌─────────────────────────────────────────────────────────────┐
│                         TITLE                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [Icon A]  ───→  [Icon B]  ───→  [Icon C]                  │
│  Stage 1         Stage 2         Stage 3                    │
│                                                             │
├───────────────┬───────────────┬─────────────────────────────┤
│  ✓ Pro 1      │  ✓ Pro 1      │  ✓ Pro 1                   │
│  ✓ Pro 2      │  ✓ Pro 2      │  ✓ Pro 2                   │
│  ✗ Con 1      │  ✗ Con 1      │  ✓ Pro 3                   │
│  ✗ Con 2      │  ✗ Con 2      │  ✓ Pro 4                   │
├───────────────┴───────────────┴─────────────────────────────┤
│              📌 "Evolution summary statement"                │
└─────────────────────────────────────────────────────────────┘
```

### Layout: Single (Deep Dive)
```
┌─────────────────────────────────────────────────────────────┐
│                         TITLE                                │
│                    [Main Illustration]                       │
│                      Subtitle/Metaphor                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Section 1: What is it?                                     │
│  • Point 1                                                  │
│  • Point 2                                                  │
│                                                             │
│  Section 2: Why it matters                                  │
│  • Point 1                                                  │
│  • Point 2                                                  │
│                                                             │
│  Section 3: Key takeaway                                    │
│  💡 "Insight quote here"                                    │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                    @your-handle                              │
└─────────────────────────────────────────────────────────────┘
```

---

## File Structure

```
automation/
├── hybrid-image-generator/
│   ├── index.js                 # Main API
│   ├── dalle-client.js          # DALL-E API wrapper
│   ├── background-generator.js  # Generate/cache backgrounds
│   ├── illustration-cache.js    # Cache reusable illustrations
│   ├── compositor.js            # Puppeteer compositing
│   ├── themes/
│   │   ├── chalkboard.js
│   │   ├── watercolor.js
│   │   └── tech.js
│   ├── layouts/
│   │   ├── comparison.html
│   │   ├── evolution.html
│   │   └── single.html
│   ├── styles/
│   │   └── base.css
│   └── cache/                   # Cached backgrounds & illustrations
│       └── .gitkeep
├── image-generator/             # Keep as fallback (current)
└── ...
```

---

## OpenAI Prompt Updates

Update the content generation prompt to include image metadata:

```
Generate a LinkedIn post with:
1. Caption (6-12 lines, ending with a thoughtful question)
2. Image metadata for infographic generation:
   - imageType: "comparison" | "evolution" | "single"
   - imageTheme: "chalkboard" | "watercolor" | "tech"
   - imageMetaphor: Brief visual metaphor (e.g., "cafés representing data domains")
   - imageSections: Array of sections with title, items, and type (pros/cons/neutral)
3. 5-8 relevant hashtags

Return as JSON:
{
  "caption": "...",
  "imageType": "comparison",
  "imageTheme": "chalkboard", 
  "imageMetaphor": "network of cafés managing their own data menus",
  "imageTitle": "Data Mesh for Data Engineers",
  "imageSections": [
    {
      "title": "Key Features",
      "type": "pros",
      "items": ["Domain ownership", "Data as product", "Self-serve platform"]
    },
    {
      "title": "Challenges",
      "type": "cons", 
      "items": ["Org change required", "Governance complexity"]
    }
  ],
  "imageInsight": "Data Mesh turns data engineering from a service desk into product engineering.",
  "hashtags": [...]
}
```

---

## Cost Analysis

| Component              | Cost        | Notes                       |
| ---------------------- | ----------- | --------------------------- |
| DALL-E 3 background    | $0.04       | 1024x1024, standard quality |
| DALL-E 3 illustrations | $0.04 × 2-3 | Cache and reuse             |
| OpenAI GPT-4 content   | $0.02       | Already in workflow         |
| **Per new post**       | **~$0.06**  | After illustrations cached  |
| **Monthly (60 posts)** | **~$3.60**  | Minimal                     |

### Caching Strategy
- **Backgrounds:** Generate 5-10 per theme, rotate randomly
- **Illustrations:** Generate icon library once (~$2-3), reuse forever
- **Net cost after caching:** ~$0.02-0.04 per post

---

## Environment Variables

Add to `automation/.env`:
```bash
# DALL-E (uses same OpenAI key)
DALLE_MODEL=dall-e-3
DALLE_QUALITY=standard
DALLE_SIZE=1024x1024
```

---

## Architectural Decisions

### Task 1.1 Implementation (Completed)

**Retry Logic:**
- Implemented exponential backoff: 2s, 4s, 8s, 16s (4 retries max)
- Retries on rate limits (429) and server errors (5xx)
- Logs retry attempts with reason and status code

**Environment Flags:**
- `DALLE_ENABLED=true/false` - Enable/disable API calls (default: true)
- `DALLE_VERBOSE=true/false` - Control logging verbosity (default: true)
- Test mode: Set `DALLE_ENABLED=false` to skip API calls during development

**Logging & Statistics:**
- Tracks: total calls, success/failure counts, latency, cache hits
- Logs: prompt length, model config, latency, revised prompts
- `getStats()` method for monitoring performance

**Transparent Backgrounds (MVP Decision):**
- DALL-E 3 doesn't support native transparency
- For MVP: Request illustrations on solid theme-matching backgrounds
- Phase 6 optimization: Add sharp-based background removal if needed
- This avoids complexity without impacting visual quality for MVP

**API Client Pattern:**
- Uses raw HTTPS (consistent with existing codebase)
- No external SDK dependencies beyond OpenAI key
- Factory function `createDalleClient()` for configuration

**Illustration Positioning Strategy:**
- Layout templates will define fixed positioning zones (top-left, top-right, center)
- Use CSS absolute positioning within templates
- Illustrations sized to fit zones (e.g., 200x200px for icons)
- Implementation details in Phase 3 (Layout Templates) and Phase 4 (Compositor)

---

## Implementation Tasks

### Phase 1: DALL-E Integration
- [x] Task 1.1: Create `automation/hybrid-image-generator/dalle-client.js` — DALL-E API wrapper
- [ ] Task 1.2: Create `automation/hybrid-image-generator/background-generator.js` — Generate backgrounds by theme
- [ ] Task 1.3: Test background generation for all 3 themes
- [ ] Task 1.4: Create `automation/hybrid-image-generator/illustration-cache.js` — Cache management

### Phase 2: Theme System
- [ ] Task 2.1: Create `themes/chalkboard.js` — Colors, fonts, DALL-E prompts
- [ ] Task 2.2: Create `themes/watercolor.js`
- [ ] Task 2.3: Create `themes/tech.js`
- [ ] Task 2.4: Create theme loader with fallback defaults

### Phase 3: Layout Templates
- [ ] Task 3.1: Create `layouts/comparison.html` — Side-by-side with background image support
- [ ] Task 3.2: Create `layouts/evolution.html` — Horizontal flow
- [ ] Task 3.3: Create `layouts/single.html` — Deep dive single topic
- [ ] Task 3.4: Create `styles/base.css` — Shared styles, Google Fonts

### Phase 4: Compositor
- [ ] Task 4.1: Create `automation/hybrid-image-generator/compositor.js` — Puppeteer rendering
- [ ] Task 4.2: Implement background image layering
- [ ] Task 4.3: Implement illustration positioning
- [ ] Task 4.4: Test full render pipeline

### Phase 5: Main API & Integration
- [ ] Task 5.1: Create `automation/hybrid-image-generator/index.js` — Main API
- [ ] Task 5.2: Update OpenAI prompt in workflow to include image metadata
- [ ] Task 5.3: Integrate with `test-workflow-local.js`
- [ ] Task 5.4: Generate sample outputs for each theme/layout combo

### Phase 6: Caching & Optimization
- [ ] Task 6.1: Pre-generate background library (5 per theme)
- [ ] Task 6.2: Pre-generate illustration icon library
- [ ] Task 6.3: Implement smart cache lookup
- [ ] Task 6.4: Add cache hit/miss logging

### Phase 7: Testing & Documentation
- [ ] Task 7.1: Create test script for all theme/layout combinations
- [ ] Task 7.2: Document which topics map to which themes
- [ ] Task 7.3: Update README with new image generation approach
- [ ] Task 7.4: Mark feature complete

---

## Fallback Strategy

If DALL-E fails or rate limits:
1. Use pre-cached backgrounds (stored locally)
2. Fall back to current image generator (solid colors + SVG icons)
3. Log warning but continue with post generation

---

## Future Enhancements

| Feature         | Description                            |
| --------------- | -------------------------------------- |
| More themes     | "Blueprint", "Newspaper", "Neon"       |
| Animated GIFs   | Frame sequence with CSS animation      |
| Custom branding | User-uploaded logo, colors             |
| A/B testing     | Track which themes get more engagement |

---

## 🤖 Claude AI Development Prompt

**Copy and paste this prompt to start working on this feature:**

---

```
You are helping me rebuild the image generator for the AI & Data Content Engine.

FIRST, read these documents:
1. docs/claude-development-guide.md (general development instructions)
2. docs/features/hybrid-image-generator.md (this feature's full specification)

PROJECT CONTEXT:
- Workspace: c:\Users\Juma Hamdan\GitHub\ai-data-content-engine
- Node.js automation scripts in automation/
- Goal: Professional illustrated infographics using DALL-E backgrounds + Puppeteer text
- Current generator in automation/image-generator/ stays as fallback

═══════════════════════════════════════════════════════════════
                    TASK STATUS
═══════════════════════════════════════════════════════════════

Phase 1: DALL-E Integration
  □ Task 1.1: Create dalle-client.js
  □ Task 1.2: Create background-generator.js
  □ Task 1.3: Test background generation
  □ Task 1.4: Create illustration-cache.js

Phase 2: Theme System
  □ Task 2.1: Create themes/chalkboard.js
  □ Task 2.2: Create themes/watercolor.js
  □ Task 2.3: Create themes/tech.js
  □ Task 2.4: Create theme loader

Phase 3: Layout Templates
  □ Task 3.1: Create layouts/comparison.html
  □ Task 3.2: Create layouts/evolution.html
  □ Task 3.3: Create layouts/single.html
  □ Task 3.4: Create styles/base.css

Phase 4: Compositor
  □ Task 4.1: Create compositor.js
  □ Task 4.2: Implement background layering
  □ Task 4.3: Implement illustration positioning
  □ Task 4.4: Test full render pipeline

Phase 5: Main API & Integration
  □ Task 5.1: Create index.js main API
  □ Task 5.2: Update OpenAI prompt for image metadata
  □ Task 5.3: Integrate with test-workflow-local.js
  □ Task 5.4: Generate sample outputs

Phase 6: Caching & Optimization
  □ Task 6.1: Pre-generate background library
  □ Task 6.2: Pre-generate illustration icons
  □ Task 6.3: Implement cache lookup
  □ Task 6.4: Add cache logging

Phase 7: Testing & Documentation
  □ Task 7.1: Create full test script
  □ Task 7.2: Document topic-to-theme mapping
  □ Task 7.3: Update README
  □ Task 7.4: Mark feature complete

═══════════════════════════════════════════════════════════════

RULES:

1. BRANCH: Create/checkout `feature/hybrid-image-generator`

2. ONE TASK AT A TIME: Complete fully, test, commit, then move on

3. COMMIT FORMAT: "Task X.X: <description>"

4. CRITICAL REVIEW: Before implementing, evaluate:
   - Is there a simpler approach?
   - What are the edge cases (API failures, rate limits)?
   - How do we handle caching efficiently?
   - If you see improvements, suggest them BEFORE coding

5. TESTING: Test each component before committing

6. SESSION END: Summarize progress, note next task

START: Review the architecture first. If you see improvements to the hybrid approach, suggest them. Then start with Task 1.1.
```

---

### Quick Start Commands

**New session:**
```
Read docs/features/hybrid-image-generator.md and docs/claude-development-guide.md.
Start with Task 1.1.
```

**Resume session:**
```
Read docs/features/hybrid-image-generator.md. I completed up to Task 2.2.
Continue with Task 2.3.
```

---

[← Back to TODO](../../TODO.md) | [Development Guide](../claude-development-guide.md)
