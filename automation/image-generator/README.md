# LinkedIn Image Generator

Generates professional 1080x1080 infographic images for LinkedIn posts using Puppeteer + HTML/CSS/SVG.

## Quick Start

```bash
# Install dependencies
cd automation
npm install

# Generate sample images
npm run test-images

# Run integration test
node test-integration.js
```

## Usage

### Basic Usage

```javascript
const { generateImageToFile } = require('./image-generator');

// Generate from OpenAI workflow output
const content = {
  imageType: 'card', // or 'diagram'
  imageTitle: 'Medallion Architecture',
  imageBullets: ['Bronze: Raw data landing', 'Silver: Cleansed data', 'Gold: Business-ready'],
  template: 'interview_explainer'
};

const result = await generateImageToFile(content, 'output.png');
console.log(result.path); // Path to generated PNG
```

### With Workflow Integration

```javascript
const { generateFromWorkflow } = require('./image-generator/workflow-integration');

// Content object from OpenAI generation
const content = {
  imageTitle: 'Data Architecture Comparison',
  imageBullets: ['Point 1', 'Point 2', 'Point 3'],
  imageType: 'diagram',
  template: 'architecture'
};

const result = await generateFromWorkflow(content, {
  outputDir: './outputs',
  filename: 'my-image',
  theme: 'light'
});

// result.imagePath - file path
// result.imageType - 'card' or 'diagram'
// result.buffer - PNG buffer for direct upload
```

## Image Types

| Type      | Template                          | Layout                        |
| --------- | --------------------------------- | ----------------------------- |
| `card`    | interview_explainer, optimization | Title + numbered bullet list  |
| `diagram` | architecture                      | Side-by-side comparison boxes |
| `diagram` | layered                           | Vertical stacked layers       |

## Available Icons

The icon library includes 30+ icons for data engineering concepts:

- **Storage**: database, warehouse, lake, server
- **Processing**: gear, cpu, filter, flow, lightning
- **AI/ML**: brain, robot, sparkles
- **Architecture**: layers, mesh, network, cloud
- **General**: chart, lock, check, wrench, refresh

Icons are auto-detected from text content or can be specified explicitly.

## Color Palette

- Primary (purple): `#6366F1`
- Secondary (orange): `#F97316`
- Tertiary (green): `#22C55E`
- Accent blue: `#3B82F6`
- Accent cyan: `#06B6D4`

## Customization

### Modify Layouts

Edit the HTML builder functions in `index.js`:

- `buildCardHtml()` - Card layout with numbered bullets
- `buildDiagramHtml()` - Horizontal comparison boxes
- `buildLayeredHtml()` - Vertical stacked layers
- `getBaseStyles()` - CSS styles (inlined for Puppeteer reliability)

### Add Icons

Add new SVG icons to `icons/index.js` using `{fill}` and `{stroke}` placeholders.

## Output

- Format: PNG
- Size: 1080x1080 pixels
- Scale: 2x (retina quality)
- Background: Light gray (#FAFBFC)
