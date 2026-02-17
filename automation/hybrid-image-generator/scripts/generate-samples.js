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

const path = require('node:path');
const fs = require('node:fs').promises;
const { batchGenerate } = require('../index');

// Output directory
const OUTPUT_DIR = path.join(__dirname, '..', 'test-outputs', 'samples');

// Sample content data for each layout type
const SAMPLE_CONTENT = {
  comparison: {
    title: 'Data Mesh vs Data Warehouse',
    subtitle: 'Architectural Comparison',
    sections: [
      {
        title: 'Data Mesh Features',
        type: 'pros',
        items: ['Domain ownership', 'Data as a product', 'Self-serve platform', 'Federated governance']
      },
      {
        title: 'Challenges',
        type: 'cons',
        items: ['Organizational change', 'Governance complexity', 'Higher upfront effort', 'Team coordination']
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
        items: ['Monolithic architecture', 'ACID guarantees', 'Limited scalability', 'Single point of failure']
      },
      {
        title: 'Data Warehouse',
        label: 'Stage 2',
        items: ['Centralized analytics', 'ETL pipelines', 'Better reporting', 'Still complex to scale']
      },
      {
        title: 'Data Lakehouse',
        label: 'Stage 3',
        items: ['Unified storage layer', 'Schema flexibility', 'Cloud-native scale', 'Modern data stack']
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

// Pillar-specific content matching pillar-theme-map.js combinations
const PILLAR_SAMPLES = {
  pipelines_architecture: {
    title: 'ETL to ELT Pipeline Evolution',
    subtitle: 'The Modern Data Pipeline Journey',
    theme: 'whiteboard',
    layout: 'evolution',
    sections: [
      {
        title: 'Batch ETL Era',
        label: 'Stage 1',
        items: ['Nightly batch jobs', 'Transform before load', 'Heavy preprocessing', 'Long latency windows']
      },
      {
        title: 'Streaming ETL',
        label: 'Stage 2',
        items: ['Real-time ingestion', 'Micro-batch processing', 'Reduced latency', 'Complex orchestration']
      },
      {
        title: 'ELT Lakehouse',
        label: 'Stage 3',
        items: ['Raw data first', 'Transform at query time', 'Schema on read', 'Unified analytics layer']
      }
    ],
    insight: 'Modern pipelines load raw data first, transform later for flexibility.'
  },

  cloud_lakehouse: {
    title: 'Data Lake vs Data Lakehouse',
    subtitle: 'Choosing the Right Architecture',
    theme: 'whiteboard',
    layout: 'comparison',
    sections: [
      {
        title: 'Data Lake',
        type: 'pros',
        items: ['Schema on read flexibility', 'Low-cost storage', 'Handles all data types'],
        subsections: [
          {
            title: 'Challenges',
            items: ['No ACID transactions', 'Schema evolution pain', 'Performance issues at scale']
          },
          {
            title: 'Best For',
            items: ['Exploration workloads', 'ML training data', 'Cost-sensitive projects']
          }
        ]
      },
      {
        title: 'Data Lakehouse',
        type: 'cons',
        items: ['ACID guarantees', 'BI performance', 'Unified governance'],
        subsections: [
          {
            title: 'Tradeoffs',
            items: ['More complex setup', 'Requires Delta/Iceberg', 'Higher learning curve']
          },
          {
            title: 'Best For',
            items: ['Production analytics', 'Regulated industries', 'Hybrid workloads']
          }
        ]
      }
    ],
    insight: 'Lakehouses add structure and reliability to data lake flexibility.'
  },

  ai_data_workflows: {
    title: 'ML Pipeline Automation',
    subtitle: 'End-to-End ML Operations',
    theme: 'tech',
    layout: 'dense-infographic',
    sections: [
      {
        title: 'Data Ingestion',
        items: ['CDC pipelines', 'Event streaming', 'Batch imports']
      },
      {
        title: 'Feature Engineering',
        items: ['Feature store', 'Transformations', 'Validation rules']
      },
      {
        title: 'Model Training',
        items: ['Experiment tracking', 'Hyperparameter tuning', 'Distributed training']
      },
      {
        title: 'Deployment',
        items: ['Model registry', 'A/B testing', 'Canary rollouts']
      },
      {
        title: 'Monitoring',
        items: ['Drift detection', 'Performance metrics', 'Alerting']
      }
    ],
    insight: 'Modern ML requires automation across the entire lifecycle, not just training.'
  },

  automation_reliability: {
    title: 'Incident Response Playbook',
    subtitle: 'Your 3AM Guide to Production Fires',
    theme: 'notebook',
    layout: 'notebook',
    sections: [
      {
        title: 'Detection',
        items: ['Check monitoring dashboards', 'Review recent deploys', 'Scan error logs']
      },
      {
        title: 'Triage',
        items: ['Assess impact radius', 'Identify root cause', 'Estimate time to fix']
      },
      {
        title: 'Resolution',
        items: ['Apply hotfix or rollback', 'Verify fix in staging', 'Monitor production metrics']
      },
      {
        title: 'Post-Mortem',
        items: ['Document timeline', 'Identify prevention steps', 'Update runbooks']
      }
    ],
    insight: "Great teams don't avoid incidents—they respond systematically and learn."
  },

  governance_trust: {
    title: 'Data Governance Framework',
    subtitle: 'Building Trust Through Structure',
    theme: 'dense-infographic',
    layout: 'dense-infographic',
    sections: [
      {
        title: 'Policy',
        items: ['Data classification', 'Access policies', 'Retention rules']
      },
      {
        title: 'Standards',
        items: ['Naming conventions', 'Data models', 'Quality metrics']
      },
      {
        title: 'Stewardship',
        items: ['Domain ownership', 'Metadata management', 'Lineage tracking']
      },
      {
        title: 'Quality',
        items: ['Validation rules', 'Anomaly detection', 'SLA monitoring']
      },
      {
        title: 'Privacy',
        items: ['PII detection', 'Access logging', 'Compliance reporting']
      }
    ],
    insight: "Governance isn't red tape—it's the foundation of data you can trust."
  },

  real_world_lessons: {
    title: 'Why Our Data Migration Failed',
    subtitle: 'A Postmortem on Overconfidence',
    theme: 'chalkboard',
    layout: 'single',
    sections: [
      {
        title: 'What Went Wrong',
        items: [
          'Underestimated schema complexity',
          'No rollback plan',
          'Skipped load testing',
          'Migrated over a weekend (bad idea)'
        ]
      },
      {
        title: 'Lessons Learned',
        items: [
          'Always migrate iteratively',
          'Test with production-scale data',
          'Have a working rollback script',
          'Blue-green deployments save lives'
        ]
      }
    ],
    insight: 'Every failed migration teaches you something no course can.'
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
    failed.forEach((result, _i) => {
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

/**
 * Generate samples for all 6 pillar combinations
 */
async function generatePillarSamples(filterPillar = null) {
  const pillars = filterPillar ? [filterPillar] : Object.keys(PILLAR_SAMPLES);

  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  Pillar Content Samples Generation                        ║');
  console.log(`║  Generating ${pillars.length} pillar-specific images                      ║`);
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // Ensure output directory exists
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  // Build batch of pillar samples
  const batch = [];

  for (const pillar of pillars) {
    const sample = PILLAR_SAMPLES[pillar];
    if (!sample) {
      console.warn(`⚠ Unknown pillar: ${pillar}. Skipping.`);
      continue;
    }

    const contentData = {
      ...sample,
      outputPath: path.join(OUTPUT_DIR, `pillar-${pillar}.png`)
    };

    batch.push(contentData);
  }

  console.log(`Prepared ${batch.length} pillar images for generation\n`);
  console.log('Pillar samples:');
  batch.forEach((item, i) => {
    const pillarName = pillars[i];
    console.log(`  ${i + 1}. ${pillarName} → ${item.theme} × ${item.layout}`);
    console.log(`     Output: ${path.basename(item.outputPath)}`);
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
    successful.forEach((result, idx) => {
      const pillarName = pillars[idx];
      console.log(`  - ${pillarName}`);
      console.log(`    Theme: ${result.metadata.theme} × Layout: ${result.metadata.layout}`);
      console.log(`    Path: ${result.imagePath}`);
      console.log(`    Time: ${result.metadata.latency.total}ms`);
      console.log(`    Background: ${result.metadata.backgroundSource}`);
    });
  }

  // Show failed images
  if (failed.length > 0) {
    console.log('\n✗ Failed:');
    failed.forEach(result => {
      const pillarName = pillars[results.indexOf(result)];
      const item = batch[results.indexOf(result)];
      console.log(`  - ${pillarName} (${item.theme} × ${item.layout})`);
      console.log(`    Error: ${result.error}`);
    });
  }

  console.log('\n' + '='.repeat(60));
  console.log(`Output directory: ${OUTPUT_DIR}`);
  console.log('='.repeat(60) + '\n');

  if (failed.length > 0) {
    console.error('✗ Some pillar images failed to generate. See errors above.');
    process.exit(1);
  } else {
    console.log('✓ All pillar sample images generated successfully!');
  }
}

// CLI handling
(async () => {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    // Generate all samples (original 9 theme x layout combinations)
    await generateAllSamples();
  } else if (args[0] === '--help' || args[0] === '-h') {
    console.log(`
Usage: node generate-samples.js [options]

Options:
  (no args)             Generate all 9 samples (3 themes × 3 layouts)
  --theme <name>        Generate only for specific theme (chalkboard, watercolor, tech)
  --layout <name>       Generate only for specific layout (comparison, evolution, single)
  --pillar [name]       Generate all 6 pillar samples, or specific pillar if name provided
                        Pillars: pipelines_architecture, cloud_lakehouse, ai_data_workflows,
                                 automation_reliability, governance_trust, real_world_lessons
  --all                 Generate both original 9 samples + 6 pillar samples (15 total)
  --help, -h            Show this help message

Examples:
  node generate-samples.js                                # Original 9 samples
  node generate-samples.js --theme chalkboard             # Only chalkboard theme
  node generate-samples.js --layout comparison            # Only comparison layout
  node generate-samples.js --pillar                       # All 6 pillar samples
  node generate-samples.js --pillar pipelines_architecture  # Single pillar sample
  node generate-samples.js --all                          # All 15 samples (9 + 6)
`);
  } else if (args.includes('--all')) {
    // Generate both original 9 + pillar 6
    console.log('Generating all samples: 9 original + 6 pillar = 15 total\n');
    await generateAllSamples();
    console.log('\n');
    await generatePillarSamples();
  } else if (args.includes('--pillar')) {
    // Generate pillar samples
    const pillarIdx = args.indexOf('--pillar');
    const filterPillar = args[pillarIdx + 1] && !args[pillarIdx + 1].startsWith('--') ? args[pillarIdx + 1] : null;
    await generatePillarSamples(filterPillar);
  } else {
    // Parse filters using indexOf (original theme/layout filtering)
    const themeIdx = args.indexOf('--theme');
    const layoutIdx = args.indexOf('--layout');
    const filterTheme = themeIdx !== -1 && args[themeIdx + 1] ? args[themeIdx + 1] : null;
    const filterLayout = layoutIdx !== -1 && args[layoutIdx + 1] ? args[layoutIdx + 1] : null;

    await generateFilteredSamples(filterTheme, filterLayout);
  }
})();
