# Image Cache

This directory stores cached backgrounds and illustrations to minimize DALL-E API calls.

## Structure

```
cache/
├── backgrounds/          # Theme-based backgrounds (chalkboard, watercolor, tech)
│   ├── chalkboard/      # Dark chalkboard texture backgrounds
│   ├── watercolor/      # Light cream paper backgrounds
│   └── tech/            # Dark gradient tech backgrounds
└── illustrations/        # Reusable illustration elements (future)
    └── (coming in Phase 1, Task 1.4)
```

## Caching Strategy

- **Backgrounds:** 3-5 per theme, randomly selected on each use
- **Illustrations:** Generated once, reused across all posts
- **Cost savings:** ~$0.04 per cached image reused = $0.04 saved per post

## Warmup Scripts

Pre-generate backgrounds before running the workflow:

```bash
# Generate 3 backgrounds per theme (default)
node test-background-warmup.js

# Generate 5 backgrounds per theme
node test-background-warmup.js 5

# Clear cache and regenerate
node test-background-warmup.js 3 --clear
```

## Git Policy

- `.gitkeep` files are tracked to preserve directory structure
- `*.png` files are gitignored (too large, regenerate as needed)
- Regenerate cache after cloning with warmup scripts

## Manual Cleanup

Clear cache programmatically:

```javascript
const { createBackgroundGenerator } = require('./background-generator');
const bgGen = createBackgroundGenerator();

// Clear specific theme
await bgGen.clearCache('chalkboard');

// Clear all themes
await bgGen.clearCache();
```

Or manually delete files:

```bash
# Clear all backgrounds
rm -rf automation/hybrid-image-generator/cache/backgrounds/*/*.png

# Clear specific theme
rm -rf automation/hybrid-image-generator/cache/backgrounds/chalkboard/*.png
```
