# Feature: Gemini Image Generator

> **Status:** Complete
> **Branch:** `feature/gemini-image-generator`
> **Integrates with:** Hybrid Image Generator pipeline
> **Priority:** Cost Optimization

---

## Goal

Add Google Gemini as an image generation provider alongside DALL-E 3, reducing per-image costs from ~$0.08 (DALL-E) to ~$0.039 (Gemini Flash) while maintaining image quality for LinkedIn post backgrounds and illustrations.

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                    IMAGE_PROVIDER Configuration                   │
│                                                                    │
│  Environment Variable: IMAGE_PROVIDER                             │
│    ↓                                                              │
│  Provider Factory (provider-factory.js)                          │
│    ├─ getImageProviderConfig()  → validates IMAGE_PROVIDER       │
│    ├─ resolveProviders()        → determines primary + fallback  │
│    └─ createProviderClient()    → instantiates correct client    │
│         ↓                           ↓                             │
│    Gemini Client              DALL-E Client                       │
│    (gemini-client.js)         (dalle-client.js)                   │
│         ↓                           ↓                             │
│    Google GenAI SDK           OpenAI DALL-E 3 API                │
│                                                                    │
├──────────────────────────────────────────────────────────────────┤
│                    Integration Points                             │
│                                                                    │
│  BackgroundGenerator (background-generator.js)                   │
│    ├─ Uses provider factory for client creation                  │
│    ├─ Provider-separated cache: cache/backgrounds/{provider}/    │
│    └─ Fallback chain:                                            │
│        1. Primary provider cache                                 │
│        2. Fallback provider cache (cross-provider lookup)        │
│        3. Primary provider API                                   │
│        4. Fallback provider API                                  │
│                                                                    │
│  IllustrationCache (illustration-cache.js)                       │
│    ├─ Uses provider factory for client creation                  │
│    ├─ Provider-separated cache: cache/illustrations/{provider}/  │
│    └─ Same fallback chain as BackgroundGenerator                 │
│                                                                    │
│  Orchestrator (index.js)                                          │
│    ├─ Handles IMAGE_PROVIDER=none gracefully                     │
│    ├─ CSS fallback for backgrounds when generation fails         │
│    └─ Includes provider metadata in output                       │
│                                                                    │
└──────────────────────────────────────────────────────────────────┘
```

---

## Provider Routing

| IMAGE_PROVIDER | Primary        | Fallback | Use Case                                    |
| -------------- | -------------- | -------- | ------------------------------------------- |
| `gemini`       | Gemini         | DALL-E   | Cost-optimized (default recommended)        |
| `dalle`        | DALL-E         | Gemini   | When DALL-E quality preferred               |
| `auto`         | Best available | Other    | Checks API keys, prefers Gemini (cheaper)   |
| `none`         | -              | -        | Skip AI generation, use CSS fallback colors |

**Auto Mode Resolution:**

- Both GEMINI_API_KEY and OPENAI_API_KEY set → Gemini (lower cost)
- Only OPENAI_API_KEY set → DALL-E
- Only GEMINI_API_KEY set → Gemini
- Neither key set → No generation (CSS fallback)

---

## Fallback Chain

The system implements a 4-tier fallback strategy for maximum reliability:

1. **Primary provider cache lookup** - Check for existing images from configured provider
2. **Fallback provider cache lookup** - Cross-provider cache optimization (reuse DALL-E cache when Gemini is unavailable)
3. **Primary provider API call** - Generate new image using configured provider
4. **Fallback provider API call** - Generate using alternate provider if primary fails

This ensures image generation rarely fails completely, and optimizes cache usage across providers.

**Example flow (IMAGE_PROVIDER=gemini):**

```
Request chalkboard background
  → Check cache/backgrounds/gemini/chalkboard/     (MISS)
  → Check cache/backgrounds/dalle/chalkboard/      (HIT - reuse DALL-E cache)
  → Return cached DALL-E image, mark as source: cached-dalle
```

---

## Cache Structure

Images are cached in a provider-separated directory structure to support multi-provider workflows:

```
automation/hybrid-image-generator/cache/
├── backgrounds/
│   ├── gemini/
│   │   ├── chalkboard/
│   │   │   └── chalkboard_1771106701168.png
│   │   ├── watercolor/
│   │   └── tech/
│   └── dalle/
│       ├── chalkboard/
│       ├── watercolor/
│       └── tech/
├── illustrations/
│   ├── gemini/
│   │   └── {theme}/
│   │       └── {category}/
│   └── dalle/
│       └── {theme}/
│           └── {category}/
└── .provider-migration-complete
```

**Migration:**

- On first run after provider abstraction, the system migrates from flat cache structure to provider-separated structure
- One-time migration is flagged with `.provider-migration-complete` sentinel file
- Existing images are moved to `dalle/` subdirectory (assumes pre-existing cache was DALL-E)

---

## Environment Variables

| Variable              | Default                  | Description                                                  |
| --------------------- | ------------------------ | ------------------------------------------------------------ |
| `IMAGE_PROVIDER`      | `auto`                   | Provider routing: `gemini`, `dalle`, `auto`, `none`          |
| `GEMINI_API_KEY`      | -                        | Google AI API key (required for Gemini)                      |
| `GEMINI_MODEL`        | `gemini-2.5-flash-image` | Gemini model for image generation                            |
| `GEMINI_ASPECT_RATIO` | `1:1`                    | Image aspect ratio (1:1, 3:4, 4:3, 9:16, 16:9)               |
| `GEMINI_IMAGE_SIZE`   | `1K`                     | Image resolution: `1K`, `2K`, `4K` (higher = more expensive) |
| `GEMINI_VERBOSE`      | `true`                   | Enable detailed Gemini client logging                        |
| `OPENAI_API_KEY`      | -                        | OpenAI API key (required for DALL-E fallback)                |

**Recommended Setup:**

```bash
# automation/.env
IMAGE_PROVIDER=gemini
GEMINI_API_KEY=your-gemini-key-here
OPENAI_API_KEY=your-openai-key-here  # For fallback
GEMINI_MODEL=gemini-2.5-flash-image
GEMINI_IMAGE_SIZE=1K
```

---

## Cost Comparison

| Provider | Model                      | Cost/Image | Resolution     | Quality |
| -------- | -------------------------- | ---------- | -------------- | ------- |
| Gemini   | gemini-2.5-flash-image     | ~$0.039    | 1K (1024x1024) | High    |
| Gemini   | gemini-3-pro-image-preview | ~$0.134    | 2K/4K          | Premium |
| DALL-E   | dall-e-3                   | ~$0.08     | 1024x1024      | High    |

**Monthly Cost Projection (60 posts/month):**

| Scenario          | Cost/Post | Monthly Total | Savings vs DALL-E     |
| ----------------- | --------- | ------------- | --------------------- |
| DALL-E only       | $0.08     | $4.80         | Baseline              |
| Gemini Flash (1K) | $0.039    | $2.34         | **51% reduction**     |
| Gemini Pro (2K)   | $0.134    | $8.04         | -68% (more expensive) |

**Recommendation:** Use `gemini-2.5-flash-image` at 1K resolution for optimal cost/quality balance.

---

## File Structure

**Phase 1: Gemini Client Module**

- `automation/hybrid-image-generator/gemini-client.js` - Gemini API wrapper with retry logic
- `automation/hybrid-image-generator/test-gemini-client.js` - Unit tests (4 offline + 1 live)

**Phase 2: Provider Abstraction + Integration**

- `automation/hybrid-image-generator/provider-factory.js` - Provider routing and client factory
- `automation/hybrid-image-generator/background-generator.js` - Modified for multi-provider support
- `automation/hybrid-image-generator/illustration-cache.js` - Modified for multi-provider support
- `automation/hybrid-image-generator/index.js` - Orchestrator updated for provider metadata

**Phase 3: Configuration + Testing**

- `automation/test-gemini-images.js` - Integration test suite (5 offline + 1 live)
- `docs/03-Features/gemini-image-generator.md` - This feature documentation

---

## Testing

### Unit Tests (Gemini Client)

**File:** `automation/hybrid-image-generator/test-gemini-client.js`

```bash
cd automation/hybrid-image-generator
node test-gemini-client.js
```

**Tests:**

1. Module loading and factory creation
2. Disabled client behavior (GEMINI_ENABLED=false)
3. Missing API key validation
4. Statistics tracking and reset
5. Live API test (requires GEMINI_API_KEY)

**Expected output:** 4 tests pass offline, 1 test requires API key

---

### Integration Tests (Full Pipeline)

**File:** `automation/test-gemini-images.js`

```bash
cd automation
node test-gemini-images.js
```

**Tests:**

1. Provider config validation (gemini, dalle, auto, none)
2. Provider resolution logic (primary/fallback determination)
3. Provider client creation (Gemini, DALL-E, null)
4. Gemini client offline validation (disabled, missing key)
5. Background generator provider routing (IMAGE_PROVIDER=none)
6. Live Gemini image generation (requires GEMINI_API_KEY)

**Expected output:** 5 tests pass offline, 1 test requires API key

---

### Running Tests with API Key

```bash
# Set API key in automation/.env
echo "GEMINI_API_KEY=your-key-here" >> automation/.env

# Run integration tests
cd automation
node test-gemini-images.js

# All 6 tests should pass, generating:
# - test-outputs/gemini-integration-{timestamp}.png
# - hybrid-image-generator/cache/test/gemini/chalkboard/chalkboard_{timestamp}.png
```

---

## Implementation Phases

### Phase 1: Gemini Client Module ✅ COMPLETE

- Created `gemini-client.js` with GoogleGenAI SDK integration
- Implemented lazy SDK initialization to prevent constructor errors
- Added retry logic with exponential backoff (2s, 4s, 8s, 16s)
- Created comprehensive unit test suite
- Fixed lazy initialization bug for SDK client

**Duration:** 224s | **Commits:** 2

---

### Phase 2: Provider Abstraction + Integration ✅ COMPLETE

**Plan 1: Provider Factory Module**

- Created `provider-factory.js` with IMAGE_PROVIDER routing
- Removed legacy DALLE_ENABLED and GEMINI_ENABLED flags
- Auto mode prioritizes Gemini (cheaper at ~$0.039/image)

**Plan 2: BackgroundGenerator Multi-Provider Integration**

- Refactored constructor to use provider factory for client creation
- Implemented one-time cache migration to provider-separated structure
- Added full 4-tier fallback chain with cross-cache lookup optimization
- IMAGE_PROVIDER=none short-circuits immediately for CSS fallback

**Plan 3: IllustrationCache + Orchestrator Integration**

- Refactored IllustrationCache to use provider-factory pattern
- Implemented cache migration from flat to provider-separated structure
- Cross-provider cache lookup (primary then fallback before API call)
- Orchestrator handles backgroundResult.success === false gracefully
- Added provider metadata to orchestrator output

**Duration:** 672s (153s + 236s + 283s) | **Commits:** 5

---

### Phase 3: Configuration + Testing ✅ COMPLETE

- Created `automation/test-gemini-images.js` integration test suite
- Documented complete feature in `docs/03-Features/gemini-image-generator.md`
- All tests pass (5 offline + 1 live with API key)

**Duration:** TBD | **Commits:** 2

---

### Phase 4: Finish and PR (pending)

- Final verification of all components
- Create pull request to merge feature branch
- Update project changelog

---

## Key Decisions

### Gemini vs DALL-E Default

**Decision:** Auto mode prioritizes Gemini over DALL-E

**Rationale:** Gemini Flash costs ~$0.039/image vs DALL-E's ~$0.08/image (51% savings). Quality is comparable for LinkedIn background images and illustrations.

---

### Provider-Separated Cache Structure

**Decision:** Cache organized by provider (cache/backgrounds/{provider}/{theme}/)

**Rationale:**

- Allows side-by-side testing of both providers
- Enables cross-provider cache fallback (reuse DALL-E cache when Gemini unavailable)
- Prevents cache collisions if providers have different image characteristics
- One-time migration preserves existing DALL-E cache

---

### Fallback Chain with Cross-Cache Lookup

**Decision:** Check fallback provider cache before calling fallback API

**Rationale:**

- Optimize resource usage (cache hit is free vs API call costs money)
- Reduce latency (cache lookup is fast vs API call takes seconds)
- Example: If Gemini API fails, check DALL-E cache before calling DALL-E API

---

### Factory Pattern (No API Key Checking)

**Decision:** Provider factory does not validate API keys; individual clients handle missing keys gracefully

**Rationale:**

- Separation of concerns (routing vs validation)
- Clients already have proper error handling for missing/invalid keys
- Allows factory to be lightweight and focused on routing logic

---

### IMAGE_PROVIDER=none Short-Circuit

**Decision:** When IMAGE_PROVIDER=none, skip all AI generation immediately

**Rationale:**

- Performance (no cache lookups, no API calls)
- Explicit user intent (CSS fallback colors only)
- Simplifies orchestrator logic (handles success=false gracefully)

---

## Future Enhancements

| Enhancement              | Description                                                         | Priority |
| ------------------------ | ------------------------------------------------------------------- | -------- |
| Cache prewarming         | Pre-generate library of backgrounds for each theme                  | Low      |
| Quality comparison       | A/B test Gemini vs DALL-E image quality metrics                     | Low      |
| Cost dashboard           | Track actual monthly costs per provider                             | Medium   |
| Smart provider selection | Route based on theme complexity (simple → Gemini, complex → DALL-E) | Low      |
| Gemini Pro upgrade       | Option to use gemini-3-pro-image-preview for high-quality posts     | Low      |

---

## Troubleshooting

### Test fails with "Gemini API key not configured"

**Solution:** Set `GEMINI_API_KEY` in `automation/.env`

---

### Cache migration doesn't run

**Issue:** `.provider-migration-complete` flag file prevents re-migration

**Solution:** Delete the flag file to force re-migration:

```bash
rm automation/hybrid-image-generator/cache/backgrounds/.provider-migration-complete
rm automation/hybrid-image-generator/cache/illustrations/.provider-migration-complete
```

---

### Images still use DALL-E when IMAGE_PROVIDER=gemini

**Possible causes:**

1. Check `IMAGE_PROVIDER` is set correctly in automation/.env
2. Verify `GEMINI_API_KEY` is set
3. Check logs for "Trying primary provider API: gemini"

---

### "Unknown provider" error

**Issue:** Invalid IMAGE_PROVIDER value

**Solution:** Set IMAGE_PROVIDER to one of: `gemini`, `dalle`, `auto`, `none`

---

[← Back to Features](../README.md) | [Hybrid Image Generator](hybrid-image-generator.md)
