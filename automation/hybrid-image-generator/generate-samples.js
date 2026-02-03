/**
 * Generate Sample Images
 *
 * Creates one sample image for each theme/layout combination (9 total):
 * - chalkboard × comparison, evolution, single
 * - watercolor × comparison, evolution, single
 * - tech × comparison, evolution, single
 *
 * Usage: node generate-samples.js
 *
 * Requirements:
 * - OPENAI_API_KEY in .env (for DALL-E background generation)
 * - OR pre-cached backgrounds in cache/backgrounds/
 *
 * Task 5.4: Main API & Integration - Phase 5
 */

const path = require('path');
const fs = require('fs').promises;
const { batchGenerate } = require('./index');

// Output directory
const OUTPUT_DIR = path.join(__dirname, 'test-outputs', 'samples');

// Sample content data for each layout type
const SAMPLE_CONTENT = {
  comparison: {
    title: 'Data Mesh vs Data Warehouse',
    subtitle: 'Architectural Comparison',
    sections: [
      {
        title: 'Data Mesh Features',
        type: 'pros',
        items: [
          'Domain ownership',
          'Data as a product',
          'Self-serve platform',
          'Federated governance'
        ]
      },
      {
        title: 'Challenges',
        type: 'cons',
        items: [
          'Organizational change',
          'Governance complexity',
          'Higher upfront effort',
          'Team coordination'
        ]
      }
    ],
    insight: 'Data Mesh turns data engineering from a service desk into product engineering.'
  },

  evolution: {
    title: 'Data Storage Evolution',
    subtitle: 'From Monolith to Cloud-Native',
    sections: [
      {
        title: 'Traditional Database',
        label: 'Stage 1',
        items: [
          'Monolithic architecture',
          'ACID guarantees',
          'Limited scalability',
          'Single point of failure'
        ]
      },
      {
        title: 'Data Warehouse',
        label: 'Stage 2',
        items: [
          'Centralized analytics',
          'ETL pipelines',
          'Better reporting',
          'Still complex to scale'
        ]
      },
      {
        title: 'Data Lakehouse',
        label: 'Stage 3',
        items: [
          'Unified storage layer',
          'Schema flexibility',
          'Cloud-native scale',
          'Modern data stack'
        ]
      }
    ],
    insight: 'Each evolution addressed the limitations of the previous generation.'
  },

  single: {
    title: 'Vector Databases',
    subtitle: 'Powering AI Applications',
    sections: [
      {
        title: 'What are Vector Databases?',
        items: [
          'Store data as high-dimensional vectors',
          'Optimized for similarity search',
          'Purpose-built for AI/ML workloads',
          'Enable semantic understanding'
        ]
      },
      {
        title: 'Key Use Cases',
        items: [
          'Semantic search engines',
          'Recommendation systems',
          'RAG (Retrieval Augmented Generation)',
          'Image and video similarity',
          'Anomaly detection'
        ]
      },
      {
        title: 'Why They Matter',
        items: [
          'Traditional databases struggle with vectors',
          'Enable real-time AI applications',
          'Critical for LLM integration',
          'Scale to billions of vectors'
        ]
      }
    ],
    insight: 'Vector databases are essential infrastructure for modern AI applications.'
  }
};

/**
 * Generate all 9 combinations of theme × layout
 */
async function generateAllSamples() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  Hybrid Image Generator - Sample Generation               ║');
  console.log('║  Generating 9 images (3 themes × 3 layouts)               ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // Ensure output directory exists
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const themes = ['chalkboard', 'watercolor', 'tech'];
  const layouts = ['comparison', 'evolution', 'single'];

  // Build batch of all combinations
  const batch = [];

  for (const theme of themes) {
    for (const layout of layouts) {
      const contentData = {
        ...SAMPLE_CONTENT[layout],
        theme,
        layout,
        outputPath: path.join(OUTPUT_DIR, `${theme}-${layout}.png`)
      };

      batch.push(contentData);
    }
  }

  console.log(`Prepared ${batch.length} images for generation\n`);
  console.log('Combinations:');
  batch.forEach((item, i) => {
    console.log(`  ${i + 1}. ${item.theme} × ${item.layout} → ${path.basename(item.outputPath)}`);
  });

  console.log('\n' + '='.repeat(60));
  console.log('Starting batch generation...\n');

  const startTime = Date.now();

  // Generate all images in batch
  const results = await batchGenerate(batch, { verbose: true });

  const totalTime = Date.now() - startTime;

  // Analyze results
  console.log('\n' + '='.repeat(60));
  console.log('Generation Summary');
  console.log('='.repeat(60) + '\n');

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`Total images: ${results.length}`);
  console.log(`Successful: ${successful.length}`);
  console.log(`Failed: ${failed.length}`);
  console.log(`Total time: ${(totalTime / 1000).toFixed(1)}s`);

  if (successful.length > 0) {
    const avgTime = Math.round(totalTime / successful.length);
    console.log(`Average time per image: ${avgTime}ms`);
  }

  // Show successful images
  if (successful.length > 0) {
    console.log('\n✓ Successfully Generated:');
    successful.forEach(result => {
      console.log(`  - ${result.metadata.theme} × ${result.metadata.layout}`);
      console.log(`    Path: ${result.imagePath}`);
      console.log(`    Time: ${result.metadata.latency.total}ms (bg: ${result.metadata.latency.background}ms)`);
      console.log(`    Background: ${result.metadata.backgroundSource}`);
    });
  }

  // Show failed images
  if (failed.length > 0) {
    console.log('\n✗ Failed:');
    failed.forEach((result, i) => {
      const item = batch[results.indexOf(result)];
      console.log(`  - ${item.theme} × ${item.layout}`);
      console.log(`    Error: ${result.error}`);
    });
  }

  // Cache statistics
  if (successful.length > 0) {
    console.log('\n' + '='.repeat(60));
    console.log('Cache Statistics');
    console.log('='.repeat(60) + '\n');

    const cacheHits = successful.filter(r => r.metadata.backgroundSource === 'cache').length;
    const generated = successful.filter(r => r.metadata.backgroundSource === 'generated').length;

    console.log(`Background cache hits: ${cacheHits}`);
    console.log(`Background generated: ${generated}`);
    console.log(`Cache hit rate: ${((cacheHits / successful.length) * 100).toFixed(1)}%`);
  }

  console.log('\n' + '='.repeat(60));
  console.log(`Output directory: ${OUTPUT_DIR}`);
  console.log('='.repeat(60) + '\n');

  if (failed.length > 0) {
    console.error('✗ Some images failed to generate. See errors above.');
    process.exit(1);
  } else {
    console.log('✓ All sample images generated successfully!');
  }
}

/**
 * Generate samples for specific theme or layout
 */
async function generateFilteredSamples(filterTheme = null, filterLayout = null) {
  const themes = filterTheme ? [filterTheme] : ['chalkboard', 'watercolor', 'tech'];
  const layouts = filterLayout ? [filterLayout] : ['comparison', 'evolution', 'single'];

  console.log(`Generating samples for:`);
  console.log(`  Themes: ${themes.join(', ')}`);
  console.log(`  Layouts: ${layouts.join(', ')}\n`);

  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const batch = [];

  for (const theme of themes) {
    for (const layout of layouts) {
      const contentData = {
        ...SAMPLE_CONTENT[layout],
        theme,
        layout,
        outputPath: path.join(OUTPUT_DIR, `${theme}-${layout}.png`)
      };

      batch.push(contentData);
    }
  }

  const results = await batchGenerate(batch, { verbose: true });

  const successful = results.filter(r => r.success).length;
  console.log(`\n✓ Generated ${successful}/${results.length} images`);
}

// CLI handling
const args = process.argv.slice(2);

if (args.length === 0) {
  // Generate all samples
  generateAllSamples().catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
} else if (args[0] === '--help' || args[0] === '-h') {
  console.log(`
Usage: node generate-samples.js [options]

Options:
  (no args)             Generate all 9 samples (3 themes × 3 layouts)
  --theme <name>        Generate only for specific theme (chalkboard, watercolor, tech)
  --layout <name>       Generate only for specific layout (comparison, evolution, single)
  --help, -h            Show this help message

Examples:
  node generate-samples.js
  node generate-samples.js --theme chalkboard
  node generate-samples.js --layout comparison
  node generate-samples.js --theme watercolor --layout evolution
`);
} else {
  // Parse filters
  let filterTheme = null;
  let filterLayout = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--theme' && args[i + 1]) {
      filterTheme = args[i + 1];
      i++;
    } else if (args[i] === '--layout' && args[i + 1]) {
      filterLayout = args[i + 1];
      i++;
    }
  }

  generateFilteredSamples(filterTheme, filterLayout).catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
}
