# Image Cache

This directory stores cached backgrounds and illustrations to minimize DALL-E API calls.

## Structure

```
cache/
├── backgrounds/          # Theme-based backgrounds (chalkboard, watercolor, tech)
│   ├── chalkboard/      # Dark chalkboard texture backgrounds
│   ├── watercolor/      # Light cream paper backgrounds
│   └── tech/            # Dark gradient tech backgrounds
└── illustrations/        # Reusable illustration elements
    ├── chalkboard/      # Chalk sketch style illustrations
    │   ├── building/    # Buildings and structures
    │   ├── icon/        # Icons and symbols
    │   ├── diagram/     # Diagrams and flows
    │   └── character/   # People and characters
    ├── watercolor/      # Watercolor style illustrations
    │   └── (same structure)
    └── tech/            # Tech/isometric style illustrations
        └── (same structure)
```

## Caching Strategy

- **Backgrounds:** 3-5 per theme, randomly selected on each use
- **Illustrations:** Generated once, reused across all posts
- **Cost savings:** ~$0.04 per cached image reused = $0.04 saved per post

## Generation Scripts

### Backgrounds

Pre-generate backgrounds before running the workflow:

```bash
# Generate 3 backgrounds per theme (default)
node test-background-warmup.js

# Generate 5 backgrounds per theme
node test-background-warmup.js 5

# Clear cache and regenerate
node test-background-warmup.js 3 --clear
```

### Illustrations

Pre-generate the full illustration library (one-time setup):

```bash
# Generate all illustrations for all themes (~60 illustrations × 3 themes = 180 total)
DALLE_ENABLED=true node generate-illustration-library.js

# Generate for specific theme only
DALLE_ENABLED=true node generate-illustration-library.js --theme watercolor

# Clear and regenerate
DALLE_ENABLED=true node generate-illustration-library.js --clear
```

**Note:** Illustration generation requires `OPENAI_API_KEY` and costs ~$0.04 per image.
Estimated cost for full library: ~$7.20 (180 illustrations × $0.04)

## Git Policy

- `.gitkeep` files are tracked to preserve directory structure
- `*.png` files are gitignored (too large, regenerate as needed)
- Regenerate cache after cloning with warmup scripts

## Manual Cleanup

Clear cache programmatically:

```javascript
// Backgrounds
const { createBackgroundGenerator } = require('./background-generator');
const bgGen = createBackgroundGenerator();

await bgGen.clearCache('chalkboard'); // Clear specific theme
await bgGen.clearCache(); // Clear all themes

// Illustrations
const { createIllustrationCache } = require('./illustration-cache');
const cache = createIllustrationCache();

await cache.deleteIllustration('warehouse', 'watercolor', 'building'); // Delete specific
await cache.clearCache('watercolor', 'building'); // Clear category
await cache.clearCache('watercolor'); // Clear theme
await cache.clearCache(); // Clear all
```

Or manually delete files:

```bash
# Clear all backgrounds
rm -rf automation/hybrid-image-generator/cache/backgrounds/*/*.png

# Clear specific theme backgrounds
rm -rf automation/hybrid-image-generator/cache/backgrounds/chalkboard/*.png

# Clear all illustrations
rm -rf automation/hybrid-image-generator/cache/illustrations/*/*/*.png

# Clear specific theme illustrations
rm -rf automation/hybrid-image-generator/cache/illustrations/watercolor/*/*
```
