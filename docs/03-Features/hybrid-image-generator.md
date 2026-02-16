# Feature: Hybrid Image Generator (v2.0)

> **Status:** ✅ Complete (v2.0 Image Quality Overhaul)
> **Branch:** `feature/image-quality-overhaul`
> **Replaces:** Legacy `automation/image-generator/` (deleted in Phase 5 housekeeping)
> **Priority:** MVP Enhancement
>
> **See also:** [Gemini Image Generator](gemini-image-generator.md) -- Gemini provider integration for cost-optimized image generation

---

## Goal

Generate professional, illustrated infographics with AI-generated abstract backgrounds + crisp HTML/CSS text overlays. Uses Gemini (default) or DALL-E for visual backgrounds paired with Puppeteer-rendered layouts for readable, multi-section infographics.

**Key Design Principle:** AI-generated text is illegible. We use Gemini/DALL-E for abstract visual backgrounds (no text) and HTML/CSS for all text overlay to ensure crisp, readable typography.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│             v2.0 HYBRID IMAGE GENERATION FLOW                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  INPUT: Content from Claude API + Pillar-Theme Mapping     │
│  ─────────────────────────────────────────────────────────  │
│  Content Generator selects topic + pillar category          │
│         ↓                                                   │
│  pillar-theme-map.js maps category → theme/layout           │
│         ↓                                                   │
│  Claude generates structured IMAGE_DATA metadata            │
│    {                                                        │
│      title: "Data Mesh for Data Engineers",                │
│      subtitle: "Key Concepts",                             │
│      sections: [                                           │
│        { title: "Domain", items: ["Ownership", "Autonomy"] }│
│      ],                                                    │
│      insight: "Think products not pipelines."              │
│    }                                                       │
│         ↓                                                   │
│  STEP 1: Generate Background (Gemini Flash or DALL-E 3)    │
│  ────────────────────────────────────────────────────────   │
│  Prompt: "Abstract chalkboard texture background, soft     │
│  lighting, no text, illustration style, 1024x1024"         │
│  Output: background.png (cached, reused)                   │
│         ↓                                                   │
│  STEP 2: Composite Final Image (Puppeteer)                 │
│  ────────────────────────────────────────────────────────   │
│  - Load background image                                   │
│  - Render HTML layout template with theme CSS              │
│  - Overlay structured content (title, sections, insight)   │
│  - Export to PNG (1080x1080 @ 2x)                          │
│  Output: post-<timestamp>.png                              │
│         ↓                                                   │
│  STEP 3: Upload to Firebase Storage                        │
│  ────────────────────────────────────────────────────────   │
│  - Attach metadata: theme, layout, provider                │
│  - Return public URL                                       │
│  Output: https://firebasestorage.googleapis.com/...        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Theme Definitions

v2.0 includes **6 visual themes**, each with color palette, typography, and recommended layouts.

| Theme             | Primary Color | Style                     | Recommended Layouts          |
| ----------------- | ------------- | ------------------------- | ---------------------------- |
| chalkboard        | #2d4a3e       | Chalk on dark green       | comparison, single           |
| watercolor        | #faf8f5       | Soft pastel on cream      | comparison, evolution        |
| tech              | #1a1a2e       | Neon on dark blue         | evolution, dense-infographic |
| notebook          | #f5f0e8       | Handwritten on grid paper | notebook                     |
| whiteboard        | #ffffff       | Clean marker on white     | evolution, comparison        |
| dense-infographic | #1a1a2e       | Multi-section data viz    | dense-infographic            |

### Theme: Chalkboard

```json
{
  "name": "chalkboard",
  "background": {
    "geminiPrompt": "Dark green chalkboard texture background, slightly dusty, soft lighting from top, no text or drawings, photorealistic, 1024x1024",
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
    "geminiPrompt": "Light cream paper texture background, subtle watercolor wash edges, soft warm lighting, no text, minimal, 1024x1024",
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
    "geminiPrompt": "Dark gradient background with subtle circuit board pattern, deep blue to purple, futuristic, no text, 1024x1024",
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

### Theme: Notebook

Clean grid paper background with handwritten typography and card-based layouts. Compact spacing with rounded borders. Best for step-by-step guides and automation tutorials.

Theme file: `automation/hybrid-image-generator/themes/notebook.js`

### Theme: Whiteboard

Clean white background with marker-style text, bordered boxes, and conceptual arrows. Professional presentation style with color-coded sections. Ideal for architecture comparisons and evolution flows.

Theme file: `automation/hybrid-image-generator/themes/whiteboard.js`

### Theme: Dense Infographic

Dark background with multi-section layouts, color-coded borders, numbered circles, and packed information. Supports 4-6 section layouts with optional subsections. Best for complex mental models and governance frameworks.

Theme file: `automation/hybrid-image-generator/themes/dense-infographic.js`

---

## Layout Templates

v2.0 includes **6 HTML layout templates** for different content structures.

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

Template file: `automation/hybrid-image-generator/layouts/comparison.html`

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

Template file: `automation/hybrid-image-generator/layouts/evolution.html`

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

Template file: `automation/hybrid-image-generator/layouts/single.html`

### Layout: Notebook

```
┌─────────────────────────────────────────────────────────────┐
│  Grid Paper Background                   TITLE              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────┐  ┌──────────────────────┐        │
│  │  Step 1              │  │  Step 2              │        │
│  │  • Item 1            │  │  • Item 1            │        │
│  │  • Item 2            │  │  • Item 2            │        │
│  └──────────────────────┘  └──────────────────────┘        │
│                                                             │
│  ┌──────────────────────┐  ┌──────────────────────┐        │
│  │  Step 3              │  │  Step 4              │        │
│  │  • Item 1            │  │  • Item 1            │        │
│  │  • Item 2            │  │  • Item 2            │        │
│  └──────────────────────┘  └──────────────────────┘        │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│              ✏️ "Key takeaway statement"                     │
└─────────────────────────────────────────────────────────────┘
```

Card-based layout with handwritten font, grid paper background, compact spacing. Ideal for automation guides and step-by-step workflows.

Template file: `automation/hybrid-image-generator/layouts/notebook.html`

### Layout: Whiteboard

```
┌─────────────────────────────────────────────────────────────┐
│                         TITLE                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐               ┌─────────────────┐     │
│  │  Architecture A  │   ────────→   │  Architecture B  │     │
│  │  ─────────────── │               │  ─────────────── │     │
│  │  • Feature 1     │               │  • Feature 1     │     │
│  │  • Feature 2     │               │  • Feature 2     │     │
│  │                  │               │                  │     │
│  │  Sub-area:       │               │  Sub-area:       │     │
│  │  • Detail 1      │               │  • Detail 1      │     │
│  └─────────────────┘               └─────────────────┘     │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│              🎯 Key Takeaway: "Insight statement"            │
└─────────────────────────────────────────────────────────────┘
```

Professional presentation style with bordered boxes, arrows, color-coded sections, and optional subsections. Ideal for architecture comparisons.

Template file: `automation/hybrid-image-generator/layouts/whiteboard.html`

### Layout: Dense Infographic

```
┌─────────────────────────────────────────────────────────────┐
│                         TITLE                                │
│                       Subtitle                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ① Section 1           ② Section 2                          │
│  • Point 1             • Point 1                            │
│  • Point 2             • Point 2                            │
│                                                             │
│  ③ Section 3           ④ Section 4                          │
│  • Point 1             • Point 1                            │
│  • Point 2             • Point 2                            │
│                                                             │
│  ⑤ Section 5           ⑥ Section 6                          │
│  • Point 1             • Point 1                            │
│  • Point 2             • Point 2                            │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│              💡 Key Takeaway: "Insight statement"            │
└─────────────────────────────────────────────────────────────┘
```

Supports 4-6 sections with numbered circles, color-coded borders (CSS nth-child rotation), and packed information. Ideal for governance frameworks and layered mental models.

Template file: `automation/hybrid-image-generator/layouts/dense-infographic.html`

---

## Pillar-to-Theme Mapping

v2.0 automatically maps content pillar categories to appropriate theme/layout combinations via `automation/content-generator/pillar-theme-map.js`.

| Pillar                 | Theme             | Layout            | Rationale                            |
| ---------------------- | ----------------- | ----------------- | ------------------------------------ |
| pipelines_architecture | whiteboard        | evolution         | Sequential flow progression          |
| cloud_lakehouse        | whiteboard        | comparison        | Side-by-side architecture comparison |
| ai_data_workflows      | tech              | dense-infographic | Dense technical content              |
| automation_reliability | notebook          | notebook          | Sketch note guide style              |
| governance_trust       | dense-infographic | dense-infographic | Multi-section layered models         |
| real_world_lessons     | chalkboard        | single            | Single narrative practitioner story  |

**Fallback:** Unknown categories default to `chalkboard` theme with `single` layout.

**Usage:**

```javascript
const { getThemeForPillar } = require("./pillar-theme-map");
const { theme, layout } = getThemeForPillar("pipelines_architecture");
// Returns: { theme: 'whiteboard', layout: 'evolution' }
```

---

## Claude IMAGE_DATA Integration

v2.0 integrates structured metadata generation from Claude API for rich multi-section infographics.

### Data Flow

1. **Prompt Templates** - All 6 Claude prompt templates (`prompts/*.md`) include IMAGE_DATA instruction blocks tailored to their target layout
2. **Claude Response** - Claude appends structured JSON after hashtags in a fenced code block
3. **parseResponse Extraction** - `automation/content-generator/claude-client.js` extracts IMAGE_DATA, validates minimum fields (title, sections array), strips from caption
4. **Pipeline Wire-through** - `automation/content-generator/index.js` builds rich contentData from imageMetadata
5. **Graceful Fallback** - If IMAGE_DATA is missing or invalid, falls back to title-only layout (no crash)

### IMAGE_DATA Structure

```json
{
  "title": "Data Mesh for Data Engineers",
  "subtitle": "Key Concepts",
  "sections": [
    {
      "title": "Domain Ownership",
      "items": ["Product thinking", "Autonomy", "Accountability"]
    },
    {
      "title": "Self-Serve Platform",
      "items": [
        "Infrastructure as code",
        "Centralized tools",
        "Federated governance"
      ]
    }
  ],
  "insight": "Data Mesh turns data engineering from a service desk into product engineering."
}
```

**Template-specific requirements:**

- **evolution**: 3-4 sections (stages)
- **comparison/whiteboard**: 2 sections, optional subsections field
- **dense-infographic**: 4-6 sections
- **notebook**: 3-5 sections (cards)
- **single**: 1-2 sections (deep dive)

---

## File Structure

```
automation/
├── hybrid-image-generator/
│   ├── index.js                 # Main API (generateImage)
│   ├── background-generator.js  # Generate/cache backgrounds (multi-provider)
│   ├── compositor.js            # Puppeteer compositing
│   ├── provider-factory.js      # IMAGE_PROVIDER routing
│   ├── gemini-client.js         # Gemini API wrapper
│   ├── dalle-client.js          # DALL-E API wrapper (legacy)
│   ├── illustration-cache.js    # Cache reusable illustrations
│   ├── themes/
│   │   ├── index.js             # Theme loader
│   │   ├── chalkboard.js
│   │   ├── watercolor.js
│   │   ├── tech.js
│   │   ├── notebook.js
│   │   ├── whiteboard.js
│   │   └── dense-infographic.js
│   ├── layouts/
│   │   ├── comparison.html
│   │   ├── evolution.html
│   │   ├── single.html
│   │   ├── notebook.html
│   │   ├── whiteboard.html
│   │   └── dense-infographic.html
│   ├── styles/
│   │   └── base.css
│   ├── scripts/
│   │   ├── generate-samples.js             # Generate all pillar/theme/layout samples
│   │   └── generate-illustration-library.js # Pre-generate illustration cache
│   ├── tests/
│   │   ├── test-background-migration.js
│   │   ├── test-cache-separation.js
│   │   ├── test-gemini-client.js
│   │   ├── test-integration.js
│   │   ├── test-provider-factory.js
│   │   ├── test-provider-routing.js
│   │   ├── test-theme-layouts.js
│   │   └── test-workflow-local.js
│   ├── cache/
│   │   ├── backgrounds/
│   │   │   ├── gemini/
│   │   │   └── dalle/
│   │   └── illustrations/
│   │       ├── gemini/
│   │       └── dalle/
│   └── test-outputs/              # Generated sample images
├── content-generator/
│   ├── pillar-theme-map.js        # Pillar → theme/layout mapping
│   ├── index.js                   # Uses hybrid compositor
│   └── claude-client.js           # IMAGE_DATA extraction
└── ...
```

---

## Implementation Timeline

### v1.0 (Phases 1-4) - Complete

- Phase 1: DALL-E integration, background generator, illustration cache
- Phase 2: Theme system (chalkboard, watercolor, tech)
- Phase 3: Layout templates (comparison, evolution, single)
- Phase 4: Puppeteer compositor, main API, integration

### v2.0 (Phases 5-8) - Complete

- Phase 5: Deleted legacy image-generator, reorganized tests/scripts into subfolders
- Phase 6: Created 3 new themes (notebook, whiteboard, dense-infographic) with HTML layouts
- Phase 7: Created pillar-theme-map.js, rewired content pipeline to use hybrid compositor, added IMAGE_DATA to all 6 Claude prompt templates
- Phase 8: Sample generation for all 6 pillar/theme/layout combinations, updated feature documentation

---

## Cost Analysis

| Component              | Cost (Gemini) | Cost (DALL-E) | Notes                           |
| ---------------------- | ------------- | ------------- | ------------------------------- |
| Background generation  | $0.039        | $0.04         | 1024x1024, Gemini Flash default |
| Claude content         | $0.02         | $0.02         | Already in workflow             |
| **Per new post**       | **~$0.059**   | **~$0.06**    | After backgrounds cached        |
| **Monthly (60 posts)** | **~$3.54**    | **~$3.60**    | Minimal                         |

**Cost savings:** Gemini Flash is ~51% cheaper per image ($0.039 vs $0.08 for DALL-E 3).

**Caching Strategy:**

- Backgrounds generated on-demand, cached by theme/provider
- Illustrations (deprecated in v2.0) were pre-generated and reused
- Net cost after caching: ~$0.039-0.059 per post

---

## Environment Variables

Add to `automation/.env`:

```bash
# Image provider selection
IMAGE_PROVIDER=gemini  # Options: gemini (default), dalle, auto, none

# Gemini configuration (default provider)
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-2.5-flash-image
GEMINI_VERBOSE=true

# DALL-E configuration (legacy)
OPENAI_API_KEY=your_api_key_here
DALLE_MODEL=dall-e-3
DALLE_QUALITY=standard
DALLE_SIZE=1024x1024
DALLE_VERBOSE=true
```

**IMAGE_PROVIDER modes:**

- `gemini` - Use Gemini Flash exclusively (cost-effective)
- `dalle` - Use DALL-E 3 exclusively (higher quality)
- `auto` - Intelligent provider selection with fallback chain
- `none` - Skip AI generation, use CSS fallback backgrounds

---

## Architectural Decisions

### AI Text vs HTML/CSS Text

- **Decision:** Use Gemini/DALL-E for abstract backgrounds only, no text
- **Rationale:** AI-generated text is illegible at infographic scale; HTML/CSS guarantees crisp typography
- **Implementation:** All layouts use Puppeteer HTML templates with Google Fonts

### Theme-Layout Pairings

- **Decision:** Pillar categories auto-map to default theme/layout combinations
- **Rationale:** Consistent visual identity per content type; reduces decision overhead
- **Implementation:** `pillar-theme-map.js` with fallback to chalkboard/single

### Claude Metadata Extraction

- **Decision:** Extract IMAGE_DATA from Claude response, strip from caption, validate minimum fields
- **Rationale:** Structured metadata enables rich multi-section layouts without manual formatting
- **Implementation:** `parseResponse()` in claude-client.js validates title + sections array, returns null on failure

### Graceful Fallback

- **Decision:** Pipeline never crashes if IMAGE_DATA is missing; degrades to title-only layout
- **Rationale:** Ensures continuous operation even if Claude omits metadata or format changes
- **Implementation:** `generatePostImage()` checks for null imageMetadata, builds basic contentData

### Provider Routing

- **Decision:** Single IMAGE_PROVIDER env var replaces DALLE_ENABLED/GEMINI_ENABLED flags
- **Rationale:** Simplifies configuration, supports auto mode with intelligent fallback
- **Implementation:** `provider-factory.js` handles routing, `background-generator.js` supports multi-provider cache

---

## Testing

### Unit Tests

- `test-gemini-client.js` - Gemini API wrapper
- `test-provider-factory.js` - Provider routing logic
- `test-theme-layouts.js` - Theme/layout rendering

### Integration Tests

- `test-integration.js` - Full pipeline (IMAGE_PROVIDER modes)
- `test-provider-routing.js` - Provider fallback chain
- `test-cache-separation.js` - Multi-provider cache isolation

### Manual Tests

- `test-workflow-local.js` - End-to-end content generation
- `scripts/generate-samples.js` - All 6 pillar/theme/layout combinations

---

## Future Enhancements

| Feature         | Description                            |
| --------------- | -------------------------------------- |
| A/B testing     | Track which themes get more engagement |
| Animated GIFs   | Frame sequence with CSS animation      |
| Custom branding | User-uploaded logo, colors             |
| More themes     | "Blueprint", "Newspaper", "Neon"       |

---

[← Back to TODO](../01-Project/TODO.md) | [Development Guide](../04-Development/coding-standards.md)
