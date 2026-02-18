# Feature: Hybrid Image Generator (v3.0)

> **Status:** Complete (v3.0 Whiteboard Theme Overhaul)
> **Branch:** `feature/whiteboard-theme-overhaul`
> **Replaces:** Legacy `automation/image-generator/` (deleted in Phase 5 housekeeping)
> **Priority:** MVP Enhancement
>
> **See also:** [Gemini Image Generator](gemini-image-generator.md) -- Gemini provider integration for cost-optimized image generation

---

## Goal

Generate professional whiteboard-style infographics with AI-generated backgrounds + crisp HTML/CSS text overlays. Uses Gemini (default) or DALL-E for photorealistic whiteboard backgrounds paired with Puppeteer-rendered layouts for readable, multi-section infographics.

**Key Design Principle:** AI-generated text is illegible. We use Gemini/DALL-E for photorealistic whiteboard backgrounds (no text) and HTML/CSS for all text overlay to ensure crisp, readable typography with a handwritten marker aesthetic.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│             v3.0 HYBRID IMAGE GENERATION FLOW                │
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
│  Prompt: "Photorealistic glass/standing whiteboard in       │
│  modern office, no text, blank surface, 1024x1024"         │
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

v3.0 includes **4 whiteboard themes** — a cohesive family of glass-mounted and standing whiteboard styles inspired by real LinkedIn whiteboard explainer images.

| Theme              | Accent Color | Style                           | Fonts                                  | Recommended Layouts          |
| ------------------ | ------------ | ------------------------------- | -------------------------------------- | ---------------------------- |
| wb-glass-sticky    | #5b4a9e      | Glass whiteboard, sticky notes  | Architects Daughter + Patrick Hand     | whiteboard, comparison       |
| wb-glass-clean     | #1a8a6a      | Glass whiteboard, minimal clean | Architects Daughter + Nunito           | dense-infographic, evolution |
| wb-standing-marker | #c0392b      | Standing board, bold markers    | Caveat + Patrick Hand                  | evolution, dense-infographic |
| wb-standing-minimal| #2c3e50      | Standing board, clean corporate | Architects Daughter + Nunito           | comparison, whiteboard       |

### Marker Color Palettes

Each theme defines 4 marker colors used for color-coded sections via CSS custom properties (`--marker-1` through `--marker-4`):

| Theme              | Marker 1  | Marker 2  | Marker 3  | Marker 4  |
| ------------------ | --------- | --------- | --------- | --------- |
| wb-glass-sticky    | #7c5cbf   | #2e8b57   | #2980b9   | #d4762c   |
| wb-glass-clean     | #1a8a6a   | #27ae60   | #8e44ad   | #e67e22   |
| wb-standing-marker | #c0392b   | #2471a3   | #229954   | #d4762c   |
| wb-standing-minimal| #2c3e50   | #1a8a6a   | #6c3483   | #b9770e   |

### Theme: wb-glass-sticky

Glass-mounted whiteboard with sticky-note accents. Chrome mounting clips, modern office backdrop visible behind glass. Purple accent with handwritten fonts.

- **Background prompt:** Photorealistic glass whiteboard mounted on modern office wall with chrome clips. Clean white surface with subtle reflections. Blurred office backdrop.
- **Fallback color:** `#f4f4f6`
- **Theme file:** `automation/hybrid-image-generator/themes/wb-glass-sticky.js`

### Theme: wb-glass-clean

Glass whiteboard, minimal and clean. Pristine surface with faint glossy sheen. Teal accent with mixed handwritten/sans-serif fonts.

- **Background prompt:** Clean glass or acrylic whiteboard panel on light gray wall with chrome clips. Pristine white with faint glossy sheen. Minimalist professional setting.
- **Fallback color:** `#f6f6f8`
- **Theme file:** `automation/hybrid-image-generator/themes/wb-glass-clean.js`

### Theme: wb-standing-marker

Freestanding whiteboard with bold marker style. Metal frame, marker tray with colored dry-erase markers. Red accent with bold handwritten fonts.

- **Background prompt:** Freestanding whiteboard on metal frame in bright office. Clean white surface with aluminum frame border. Marker tray at bottom edge.
- **Fallback color:** `#fafafa`
- **Theme file:** `automation/hybrid-image-generator/themes/wb-standing-marker.js`

### Theme: wb-standing-minimal

Wall-mounted dry-erase whiteboard, clean corporate. Thin silver frame, subtle erasing marks. Dark slate accent with mixed handwritten/sans-serif fonts.

- **Background prompt:** Large wall-mounted dry-erase whiteboard with very subtle gray smudge marks. Thin silver aluminum frame. Corporate meeting room setting.
- **Fallback color:** `#f8f8f8`
- **Theme file:** `automation/hybrid-image-generator/themes/wb-standing-minimal.js`

### Common CSS Styling

All whiteboard themes share these design principles:

- **Overlay:** `rgba(255,255,255,0.05)` — minimal, backgrounds are already light
- **Section backgrounds:** `rgba(255,255,255,0.88-0.95)` depending on theme
- **Border radius:** `3px` max — marker-drawn boxes have nearly square corners
- **No text shadows** — whiteboard text doesn't have shadows
- **Box shadows:** subtle `0 1px 3px rgba(0,0,0,0.08)` or none

---

## Layout Templates

v3.0 includes **4 HTML layout templates** for different content structures. All layouts use marker color rotation via `nth-child` and CSS custom properties from the active theme.

### Layout: Comparison (Side-by-Side)

```
┌─────────────────────────────────────────────────────────────┐
│                         TITLE                                │
│                    ─────────────────                          │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐          ┌─────────────────┐          │
│  │  Concept A       │          │  Concept B       │          │
│  │  (marker-1 top)  │          │  (marker-2 top)  │          │
│  │  ● Point 1       │          │  ● Point 1       │          │
│  │  ● Point 2       │          │  ● Point 2       │          │
│  │  ● Point 3       │          │  ● Point 3       │          │
│  └─────────────────┘          └─────────────────┘          │
├─────────────────────────────────────────────────────────────┤
│              "Key insight statement here"                     │
└─────────────────────────────────────────────────────────────┘
```

- Color-coded column headers using `--marker-1` and `--marker-2`
- No illustrations — whiteboard comparisons use text only
- Flat insight section with marker-drawn border-top separator
- Template: `automation/hybrid-image-generator/layouts/comparison.html`

### Layout: Evolution (Vertical Flowchart)

```
┌─────────────────────────────────────────────────────────────┐
│                         TITLE                                │
│                    ─────────────────                          │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐        │
│  │ Stage 1: Traditional DB  (marker-1 left border) │        │
│  │ ✓ Monolithic  ✓ ACID  ✓ Limited scale           │        │
│  └─────────────────────────────────────────────────┘        │
│                         │                                    │
│                         ▼                                    │
│  ┌─────────────────────────────────────────────────┐        │
│  │ Stage 2: Data Warehouse  (marker-2 left border) │        │
│  │ ✓ Centralized  ✓ ETL  ✓ Analytics              │        │
│  └─────────────────────────────────────────────────┘        │
│                         │                                    │
│                         ▼                                    │
│  ┌─────────────────────────────────────────────────┐        │
│  │ Stage 3: Lakehouse  (marker-3 left border)      │        │
│  │ ✓ Unified  ✓ Flexible  ✓ Cloud-native           │        │
│  └─────────────────────────────────────────────────┘        │
├─────────────────────────────────────────────────────────────┤
│              "Evolution summary statement"                    │
└─────────────────────────────────────────────────────────────┘
```

- **Vertical top-to-bottom** flowchart (converted from horizontal in v2.0)
- CSS-drawn downward arrows between stages using `::before`/`::after` pseudo-elements
- Marker color rotation on left border via `nth-child(4n+X)` using `--marker-1` through `--marker-4`
- Supports optional `{{annotation}}` callout text per stage
- Template: `automation/hybrid-image-generator/layouts/evolution.html`

### Layout: Whiteboard (Two-Column Structured)

```
┌─────────────────────────────────────────────────────────────┐
│                         TITLE                                │
│                    ─────────────────                          │
├─────────────────────────────────────────────────────────────┤
│  Column A (marker-1)         Column B (marker-2)            │
│  ┌─────────────────┐        ┌─────────────────┐            │
│  │  Sub-area 1     │        │  Sub-area 1     │            │
│  │  • Detail 1     │        │  • Detail 1     │            │
│  │  • Detail 2     │        │  • Detail 2     │            │
│  └────────┬────────┘        └────────┬────────┘            │
│           ↓                          ↓                      │
│  ┌─────────────────┐        ┌─────────────────┐            │
│  │  Sub-area 2     │        │  Sub-area 2     │            │
│  │  • Detail 1     │        │  • Detail 1     │            │
│  └─────────────────┘        └─────────────────┘            │
├─────────────────────────────────────────────────────────────┤
│              "Key insight statement"                          │
└─────────────────────────────────────────────────────────────┘
```

- Two-column comparison with bordered boxes and downward arrows
- Color-coded columns using theme marker colors
- Supports subsections within each column
- Template: `automation/hybrid-image-generator/layouts/whiteboard.html`

### Layout: Dense Infographic (Multi-Section Grid)

```
┌─────────────────────────────────────────────────────────────┐
│                         TITLE                                │
│                       Subtitle                               │
│                    ─────────────────                          │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐       ┌──────────────────┐           │
│  │ 1. Section One    │       │ 2. Section Two    │           │
│  │ (marker-1 top)    │       │ (marker-2 top)    │           │
│  │ • Point 1         │       │ • Point 1         │           │
│  │ • Point 2         │       │ • Point 2         │           │
│  └──────────────────┘       └──────────────────┘           │
│  ┌──────────────────┐       ┌──────────────────┐           │
│  │ 3. Section Three  │       │ 4. Section Four   │           │
│  │ (marker-3 top)    │       │ (marker-4 top)    │           │
│  │ • Point 1         │       │ • Point 1         │           │
│  │ • Point 2         │       │ • Point 2         │           │
│  └──────────────────┘       └──────────────────┘           │
├─────────────────────────────────────────────────────────────┤
│              "Key insight statement"                          │
└─────────────────────────────────────────────────────────────┘
```

- Numbered sections with bold text prefix ("1.", "2.") instead of circular badges
- Full-border boxes with colored `border-top: 4px` rotating through `--marker-1` to `--marker-4`
- Supports 4-6 sections in a 2-column grid
- Template: `automation/hybrid-image-generator/layouts/dense-infographic.html`

---

## Pillar-to-Theme Mapping

v3.0 automatically maps content pillar categories to whiteboard theme/layout combinations via `automation/content-generator/pillar-theme-map.js`.

| Pillar                 | Theme              | Layout            | Rationale                                      |
| ---------------------- | ------------------ | ----------------- | ---------------------------------------------- |
| pipelines_architecture | wb-standing-marker | evolution         | Sequential flows as vertical flowchart          |
| cloud_lakehouse        | wb-standing-minimal| comparison        | Architecture comparisons as side-by-side columns|
| ai_data_workflows      | wb-glass-clean     | dense-infographic | Dense AI/ML content in multi-section grid       |
| automation_reliability | wb-standing-marker | dense-infographic | Operational checklists as numbered sections     |
| governance_trust       | wb-glass-sticky    | whiteboard        | Governance models with sticky-note elements     |
| real_world_lessons     | wb-glass-clean     | evolution         | Practitioner stories as vertical progression    |

**Fallback:** Unknown categories default to `wb-standing-minimal` theme with `comparison` layout.

**Usage:**

```javascript
const { getThemeForPillar } = require("./pillar-theme-map");
const { theme, layout } = getThemeForPillar("pipelines_architecture");
// Returns: { theme: 'wb-standing-marker', layout: 'evolution' }
```

---

## Claude IMAGE_DATA Integration

Structured metadata generation from Claude API for rich multi-section infographics.

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

- **evolution**: 3-4 sections (stages), optional `label` field per stage
- **comparison/whiteboard**: 2 sections, optional `subsections` field
- **dense-infographic**: 4-6 sections

---

## File Structure

```
automation/
├── hybrid-image-generator/
│   ├── index.js                 # Main API (generateImage, batchGenerate, quickGenerate)
│   ├── background-generator.js  # Generate/cache backgrounds (multi-provider)
│   ├── compositor.js            # Puppeteer compositing
│   ├── provider-factory.js      # IMAGE_PROVIDER routing
│   ├── gemini-client.js         # Gemini API wrapper
│   ├── dalle-client.js          # DALL-E API wrapper (legacy)
│   ├── illustration-cache.js    # Cache reusable illustrations
│   ├── themes/
│   │   ├── index.js             # Theme loader + registry
│   │   ├── theme-base.js        # Theme factory + all 4 theme definitions
│   │   ├── wb-glass-sticky.js   # Glass whiteboard with sticky-note accents
│   │   ├── wb-glass-clean.js    # Glass whiteboard, minimal clean
│   │   ├── wb-standing-marker.js # Standing board, bold markers
│   │   └── wb-standing-minimal.js # Standing board, clean corporate
│   ├── layouts/
│   │   ├── comparison.html      # Side-by-side columns
│   │   ├── evolution.html       # Vertical flowchart
│   │   ├── whiteboard.html      # Two-column structured
│   │   └── dense-infographic.html # Multi-section grid
│   ├── styles/
│   │   └── base.css
│   ├── scripts/
│   │   ├── generate-samples.js             # Generate all pillar/theme/layout samples
│   │   └── generate-illustration-library.js # Pre-generate illustration cache
│   ├── tests/
│   │   ├── test-themes.js
│   │   ├── test-main-api.js
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

### v3.0 (Whiteboard Theme Overhaul) - Complete

- Replaced all 6 themes with 4 cohesive whiteboard variants (glass-mounted + standing)
- Retired 2 layouts (notebook, single), kept and restyled 4 (comparison, evolution, whiteboard, dense-infographic)
- Restructured evolution layout from horizontal flow to vertical flowchart with CSS-drawn arrows
- Added marker color system (`--marker-1` through `--marker-4`) for consistent color-coded sections
- Updated DALL-E/Gemini prompts for photorealistic whiteboard backgrounds
- Updated pillar-theme mapping for new theme names
- Unified visual identity: square corners, handwritten fonts, no text shadows

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

### Cohesive Whiteboard Aesthetic (v3.0)

- **Decision:** Replace all 6 diverse themes with 4 whiteboard variants
- **Rationale:** Cohesive visual identity performs better on LinkedIn; whiteboard "explaining to you" style is professional and engaging
- **Implementation:** Glass-mounted (wb-glass-sticky, wb-glass-clean) + Standing (wb-standing-marker, wb-standing-minimal) variants

### Theme-Layout Pairings

- **Decision:** Pillar categories auto-map to default theme/layout combinations
- **Rationale:** Consistent visual identity per content type; reduces decision overhead
- **Implementation:** `pillar-theme-map.js` with fallback to `wb-standing-minimal/comparison`

### Marker Color System (v3.0)

- **Decision:** Each theme defines 4 marker colors exposed as CSS custom properties
- **Rationale:** Enables color-coded sections via `nth-child` rotation without hardcoded colors in layouts
- **Implementation:** `--marker-1` through `--marker-4` in theme CSS, consumed by all 4 layouts

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

### Theme Tests

- `test-themes.js` - Loads all 4 themes, validates structure, checks marker color CSS variables

### API Tests

- `test-main-api.js` - Full pipeline tests (comparison, evolution, dense-infographic, auto-selection, quick generate, error handling)

### Integration Tests

- `test-integration.js` - Full pipeline (IMAGE_PROVIDER modes)
- `test-provider-factory.js` - Provider routing logic
- `test-provider-routing.js` - Provider fallback chain
- `test-cache-separation.js` - Multi-provider cache isolation

### Sample Generation

- `scripts/generate-samples.js` - All theme/layout combinations (16 grid + 6 pillar samples)
  - `--pillar` flag generates pillar-specific samples
  - `--all` flag generates both grid and pillar samples

---

## Future Enhancements

| Feature         | Description                            |
| --------------- | -------------------------------------- |
| A/B testing     | Track which themes get more engagement |
| Animated GIFs   | Frame sequence with CSS animation      |
| Custom branding | User-uploaded logo, colors             |

---

[Back to TODO](../01-Project/TODO.md) | [Development Guide](../04-Development/coding-standards.md)
