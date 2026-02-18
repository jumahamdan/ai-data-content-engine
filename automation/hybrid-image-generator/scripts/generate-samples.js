/**
 * Generate Sample Images
 *
 * Creates sample images for whiteboard theme/layout combinations:
 * - 4 themes × 4 layouts = 16 total for grid samples
 * - 6 pillar-specific samples matching pillar-theme-map.js
 *
 * Usage: node generate-samples.js
 *
 * Requirements:
 * - OPENAI_API_KEY or GEMINI_API_KEY in .env (for background generation)
 * - OR pre-cached backgrounds in cache/backgrounds/
 * - OR set IMAGE_PROVIDER=none for CSS fallback backgrounds
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

  whiteboard: {
    title: 'Governance That Scales vs Governance That Breaks',
    subtitle: 'Same intent. Very different outcomes.',
    sections: [
      {
        title: 'Governance That Scales',
        description: 'Built on clear authority',
        subsections: [
          {
            title: 'Decision Authority',
            items: ['Clear metric owners', 'Explicit decision rights', 'Known escalation paths']
          },
          { title: 'Operating Model', items: ['Simple rules', 'Predictable cadence', 'Stewardship at the source'] },
          { title: 'Outcome', items: ['Fewer meetings', 'Faster decisions', 'Trust over time'] }
        ]
      },
      {
        title: 'Governance That Breaks',
        description: 'Built on committees',
        subsections: [
          { title: 'Decision Authority', items: ['Shared ownership', 'Unclear approval', 'No escalation'] },
          { title: 'Operating Model', items: ['Committees', 'Ad-hoc decisions', 'Constant exceptions'] },
          { title: 'Outcome', items: ['More meetings', 'Slower delivery', 'Lost trust'] }
        ]
      }
    ],
    insight: 'Governance should reduce decisions, not postpone them.'
  },

  'dense-infographic': {
    title: 'ML Pipeline Automation',
    subtitle: 'End-to-End ML Operations',
    sections: [
      { title: 'Data Ingestion', items: ['CDC pipelines', 'Event streaming', 'Batch imports'] },
      { title: 'Feature Engineering', items: ['Feature store', 'Transformations', 'Validation rules'] },
      { title: 'Model Training', items: ['Experiment tracking', 'Hyperparameter tuning', 'Distributed training'] },
      { title: 'Deployment', items: ['Model registry', 'A/B testing', 'Canary rollouts'] },
      { title: 'Monitoring', items: ['Drift detection', 'Performance metrics', 'Alerting'] }
    ],
    insight: 'Modern ML requires automation across the entire lifecycle, not just training.'
  }
};

// Pillar-specific content matching pillar-theme-map.js combinations
const PILLAR_SAMPLES = {
  pipelines_architecture: {
    title: 'ETL to ELT Pipeline Evolution',
    subtitle: 'The Modern Data Pipeline Journey',
    theme: 'wb-standing-marker',
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
    theme: 'wb-standing-minimal',
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
          { title: 'Best For', items: ['Exploration workloads', 'ML training data', 'Cost-sensitive projects'] }
        ]
      },
      {
        title: 'Data Lakehouse',
        type: 'cons',
        items: ['ACID guarantees', 'BI performance', 'Unified governance'],
        subsections: [
          { title: 'Tradeoffs', items: ['More complex setup', 'Requires Delta/Iceberg', 'Higher learning curve'] },
          { title: 'Best For', items: ['Production analytics', 'Regulated industries', 'Hybrid workloads'] }
        ]
      }
    ],
    insight: 'Lakehouses add structure and reliability to data lake flexibility.'
  },

  ai_data_workflows: {
    title: 'ML Pipeline Automation',
    subtitle: 'End-to-End ML Operations',
    theme: 'wb-glass-clean',
    layout: 'dense-infographic',
    sections: [
      { title: 'Data Ingestion', items: ['CDC pipelines', 'Event streaming', 'Batch imports'] },
      { title: 'Feature Engineering', items: ['Feature store', 'Transformations', 'Validation rules'] },
      { title: 'Model Training', items: ['Experiment tracking', 'Hyperparameter tuning', 'Distributed training'] },
      { title: 'Deployment', items: ['Model registry', 'A/B testing', 'Canary rollouts'] },
      { title: 'Monitoring', items: ['Drift detection', 'Performance metrics', 'Alerting'] }
    ],
    insight: 'Modern ML requires automation across the entire lifecycle, not just training.'
  },

  automation_reliability: {
    title: 'Incident Response Playbook',
    subtitle: 'Your 3AM Guide to Production Fires',
    theme: 'wb-standing-marker',
    layout: 'dense-infographic',
    sections: [
      { title: 'Detection', items: ['Check monitoring dashboards', 'Review recent deploys', 'Scan error logs'] },
      { title: 'Triage', items: ['Assess impact radius', 'Identify root cause', 'Estimate time to fix'] },
      {
        title: 'Resolution',
        items: ['Apply hotfix or rollback', 'Verify fix in staging', 'Monitor production metrics']
      },
      { title: 'Post-Mortem', items: ['Document timeline', 'Identify prevention steps', 'Update runbooks'] }
    ],
    insight: "Great teams don't avoid incidents -- they respond systematically and learn."
  },

  governance_trust: {
    title: 'Data Governance Framework',
    subtitle: 'Building Trust Through Structure',
    theme: 'wb-glass-sticky',
    layout: 'whiteboard',
    sections: [
      {
        title: 'Foundation',
        description: 'What must exist first',
        subsections: [
          { title: 'Policy', items: ['Data classification', 'Access policies', 'Retention rules'] },
          { title: 'Standards', items: ['Naming conventions', 'Data models', 'Quality metrics'] },
          { title: 'Stewardship', items: ['Domain ownership', 'Metadata management', 'Lineage tracking'] }
        ]
      },
      {
        title: 'Outcomes',
        description: 'What governance enables',
        subsections: [
          { title: 'Quality', items: ['Validation rules', 'Anomaly detection', 'SLA monitoring'] },
          { title: 'Privacy', items: ['PII detection', 'Access logging', 'Compliance reporting'] },
          { title: 'Trust', items: ['Consistent KPIs', 'Reliable dashboards', 'Scalable AI'] }
        ]
      }
    ],
    insight: "Governance isn't red tape -- it's the foundation of data you can trust."
  },

  real_world_lessons: {
    title: 'Why Our Data Migration Failed',
    subtitle: 'A Postmortem on Overconfidence',
    theme: 'wb-glass-clean',
    layout: 'evolution',
    sections: [
      {
        title: 'Overconfidence',
        label: 'What Went Wrong',
        items: [
          'Underestimated schema complexity',
          'No rollback plan',
          'Skipped load testing',
          'Migrated over a weekend'
        ]
      },
      {
        title: 'Impact',
        label: 'What Happened',
        items: ['12-hour outage', 'Data inconsistencies', 'Customer complaints', 'Engineering burnout']
      },
      {
        title: 'Recovery',
        label: 'Lessons Learned',
        items: [
          'Always migrate iteratively',
          'Test with production-scale data',
          'Have a working rollback script',
          'Blue-green deployments'
        ]
      }
    ],
    insight: 'Every failed migration teaches you something no course can.'
  }
};

/**
 * Generate all combinations of theme x layout
 */
async function generateAllSamples() {
  const themes = ['wb-glass-sticky', 'wb-glass-clean', 'wb-standing-marker', 'wb-standing-minimal'];
  const layouts = ['comparison', 'evolution', 'whiteboard', 'dense-infographic'];

  console.log('Hybrid Image Generator - Sample Generation');
  console.log(
    `Generating ${themes.length * layouts.length} images (${themes.length} themes x ${layouts.length} layouts)`
  );
  console.log('='.repeat(60) + '\n');

  // Ensure output directory exists
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

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
    console.log(`  ${i + 1}. ${item.theme} x ${item.layout} -> ${path.basename(item.outputPath)}`);
  });

  console.log('\n' + '='.repeat(60));
  console.log('Starting batch generation...\n');

  const startTime = Date.now();
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

    console.log('\nSuccessfully Generated:');
    successful.forEach(result => {
      console.log(`  - ${result.metadata.theme} x ${result.metadata.layout}`);
      console.log(`    Path: ${result.imagePath}`);
      console.log(`    Time: ${result.metadata.latency.total}ms (bg: ${result.metadata.latency.background}ms)`);
    });
  }

  if (failed.length > 0) {
    console.log('\nFailed:');
    failed.forEach((result, _i) => {
      const item = batch[results.indexOf(result)];
      console.log(`  - ${item.theme} x ${item.layout}`);
      console.log(`    Error: ${result.error}`);
    });
  }

  console.log('\n' + '='.repeat(60));
  console.log(`Output directory: ${OUTPUT_DIR}`);

  if (failed.length > 0) {
    process.exit(1);
  }
}

/**
 * Generate samples for all 6 pillar combinations
 */
async function generatePillarSamples(filterPillar = null) {
  const pillars = filterPillar ? [filterPillar] : Object.keys(PILLAR_SAMPLES);

  console.log('Pillar Content Samples Generation');
  console.log(`Generating ${pillars.length} pillar-specific images`);
  console.log('='.repeat(60) + '\n');

  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const batch = [];
  for (const pillar of pillars) {
    const sample = PILLAR_SAMPLES[pillar];
    if (!sample) {
      console.warn(`Unknown pillar: ${pillar}. Skipping.`);
      continue;
    }
    batch.push({ ...sample, outputPath: path.join(OUTPUT_DIR, `pillar-${pillar}.png`) });
  }

  console.log('Pillar samples:');
  batch.forEach((item, i) => {
    console.log(`  ${i + 1}. ${pillars[i]} -> ${item.theme} x ${item.layout}`);
  });

  console.log('\nStarting batch generation...\n');

  const startTime = Date.now();
  const results = await batchGenerate(batch, { verbose: true });
  const totalTime = Date.now() - startTime;

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`\nTotal: ${results.length}, Successful: ${successful.length}, Failed: ${failed.length}`);
  console.log(`Total time: ${(totalTime / 1000).toFixed(1)}s`);

  if (failed.length > 0) {
    failed.forEach(result => {
      const pillarName = pillars[results.indexOf(result)];
      console.log(`  FAIL ${pillarName}: ${result.error}`);
    });
    process.exit(1);
  } else {
    console.log('All pillar sample images generated successfully!');
  }
}

// CLI handling
(async () => {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    await generateAllSamples();
  } else if (args[0] === '--help' || args[0] === '-h') {
    console.log(`
Usage: node generate-samples.js [options]

Options:
  (no args)             Generate all ${4 * 4} samples (4 themes x 4 layouts)
  --pillar [name]       Generate all 6 pillar samples, or specific pillar if name provided
                        Pillars: pipelines_architecture, cloud_lakehouse, ai_data_workflows,
                                 automation_reliability, governance_trust, real_world_lessons
  --all                 Generate both grid samples + 6 pillar samples
  --help, -h            Show this help message

Examples:
  node generate-samples.js                                    # Grid samples (16)
  node generate-samples.js --pillar                           # All 6 pillar samples
  node generate-samples.js --pillar pipelines_architecture    # Single pillar sample
  node generate-samples.js --all                              # All samples (16 + 6)
`);
  } else if (args.includes('--all')) {
    await generateAllSamples();
    console.log('\n');
    await generatePillarSamples();
  } else if (args.includes('--pillar')) {
    const pillarIdx = args.indexOf('--pillar');
    const filterPillar = args[pillarIdx + 1] && !args[pillarIdx + 1].startsWith('--') ? args[pillarIdx + 1] : null;
    await generatePillarSamples(filterPillar);
  }
})();
