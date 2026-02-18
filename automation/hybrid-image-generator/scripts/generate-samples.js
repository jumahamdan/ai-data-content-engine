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
    subtitle: 'Two architectures. Different trade-offs. Choose wisely.',
    sections: [
      {
        title: 'Data Mesh',
        type: 'pros',
        items: [
          'Domain teams own and publish data products',
          'Self-serve platform with standardized tooling',
          'Federated governance with global standards',
          'Scales with organization, not central team',
          'Clear ownership reduces bottleneck queues',
          'Faster time-to-insight for domain experts'
        ]
      },
      {
        title: 'Data Warehouse',
        type: 'cons',
        items: [
          'Central team controls all data pipelines',
          'Single source of truth for reporting',
          'Mature tooling and well-understood patterns',
          'Bottleneck grows with number of consumers',
          'Schema changes require central coordination',
          'Domain context lost in centralized modeling'
        ]
      }
    ],
    insight: 'Data Mesh is not a technology upgrade. It is an organizational redesign.'
  },

  evolution: {
    title: 'Data Storage Evolution',
    subtitle: 'From monolith to cloud-native. Each step solved one problem and created another.',
    sections: [
      {
        title: 'Traditional Database',
        label: 'Stage 1',
        items: [
          'Monolithic architecture on single server',
          'Strong ACID transaction guarantees',
          'Limited horizontal scalability',
          'Single point of failure for all workloads',
          'Schema changes require downtime'
        ],
        annotation: 'Most teams start here',
        arrowLabel: 'Scaling pressure'
      },
      {
        title: 'Data Warehouse',
        label: 'Stage 2',
        items: [
          'Centralized analytics and BI reporting',
          'ETL pipelines transform data before load',
          'Columnar storage for fast aggregation',
          'Separate from operational database',
          'Expensive to scale beyond terabytes'
        ],
        annotation: 'Still centralized',
        arrowLabel: 'Cloud migration'
      },
      {
        title: 'Data Lakehouse',
        label: 'Stage 3',
        items: [
          'Unified storage for all data types',
          'Schema on read with Delta/Iceberg formats',
          'Cloud-native horizontal scalability',
          'Supports both BI and ML workloads',
          'Open table formats prevent vendor lock-in'
        ],
        annotation: 'Where modern teams land'
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
            items: [
              'Clear metric owners assigned per domain',
              'Explicit decision rights documented',
              'Known escalation paths for disputes',
              'Approval workflows are lightweight'
            ]
          },
          {
            title: 'Operating Model',
            items: [
              'Simple rules everyone can follow',
              'Predictable review cadence',
              'Stewardship embedded at the source',
              'Automation replaces manual checks'
            ]
          },
          {
            title: 'Outcome',
            items: ['Fewer meetings, faster decisions', 'Trust compounds over time', 'Teams move independently']
          }
        ]
      },
      {
        title: 'Governance That Breaks',
        description: 'Built on committees',
        subsections: [
          {
            title: 'Decision Authority',
            items: [
              'Shared ownership means no ownership',
              'Unclear who can approve changes',
              'No escalation path when stuck',
              'Every change needs a committee'
            ]
          },
          {
            title: 'Operating Model',
            items: [
              'Ad-hoc decisions with no record',
              'Constant exceptions to every rule',
              'Manual review gates slow delivery',
              'Tribal knowledge replaces docs'
            ]
          },
          {
            title: 'Outcome',
            items: [
              'More meetings, slower delivery',
              'Trust erodes with every incident',
              'Teams blocked on central team'
            ]
          }
        ]
      }
    ],
    insight: 'Governance should reduce decisions, not postpone them.'
  },

  'dense-infographic': {
    title: 'ML Pipeline Automation',
    subtitle: 'End-to-end ML operations. Every stage needs its own automation.',
    sections: [
      {
        title: 'Data Ingestion',
        items: [
          'CDC pipelines for real-time capture',
          'Event streaming with Kafka or Kinesis',
          'Batch imports on scheduled intervals',
          'Schema validation at the source',
          'Data contracts between producers'
        ]
      },
      {
        title: 'Feature Engineering',
        items: [
          'Centralized feature store for reuse',
          'Automated transformations with versioning',
          'Validation rules catch drift early',
          'Point-in-time correctness for training',
          'Feature lineage and documentation'
        ]
      },
      {
        title: 'Model Training',
        items: [
          'Experiment tracking with MLflow or W&B',
          'Hyperparameter tuning at scale',
          'Distributed training across GPUs',
          'Reproducible runs with pinned deps',
          'Automated model selection pipelines'
        ]
      },
      {
        title: 'Deployment',
        items: [
          'Model registry with approval gates',
          'A/B testing against production baseline',
          'Canary rollouts with automated rollback',
          'Shadow mode for safe validation',
          'Blue-green deployment for zero downtime'
        ]
      },
      {
        title: 'Monitoring',
        items: [
          'Data drift detection on input features',
          'Performance metrics tracked per model',
          'Alerting on prediction quality drops',
          'Automated retraining triggers',
          'Business KPI correlation dashboards'
        ]
      }
    ],
    insight: 'Modern ML requires automation across the entire lifecycle, not just training.'
  }
};

// Pillar-specific content matching pillar-theme-map.js combinations
const PILLAR_SAMPLES = {
  pipelines_architecture: {
    title: 'ETL to ELT Pipeline Evolution',
    subtitle: 'How data pipelines evolved. And why each step mattered.',
    theme: 'wb-standing-marker',
    layout: 'evolution',
    sections: [
      {
        title: 'Batch ETL Era',
        label: 'Stage 1',
        items: [
          'Nightly batch jobs with fixed schedules',
          'Transform before load into warehouse',
          'Heavy preprocessing on source systems',
          'Long latency windows between refresh',
          'Failures discovered the next morning'
        ],
        annotation: 'Where most teams started',
        arrowLabel: 'Scaling pressure'
      },
      {
        title: 'Streaming ETL',
        label: 'Stage 2',
        items: [
          'Real-time ingestion with Kafka or Kinesis',
          'Micro-batch processing reduces latency',
          'Complex orchestration across services',
          'Schema management becomes critical',
          'Operational overhead grows quickly'
        ],
        annotation: 'Fast but fragile',
        arrowLabel: 'Simplification needed'
      },
      {
        title: 'ELT Lakehouse',
        label: 'Stage 3',
        items: [
          'Load raw data first, transform at query time',
          'Schema on read with Delta or Iceberg',
          'Unified analytics layer for BI and ML',
          'Declarative transforms replace custom code',
          'Cost scales with consumption, not ingestion'
        ],
        annotation: 'Modern standard'
      }
    ],
    insight: 'Modern pipelines load raw data first, transform later for flexibility.'
  },

  cloud_lakehouse: {
    title: 'Data Lake vs Data Lakehouse',
    subtitle: 'Same storage layer. Very different guarantees.',
    theme: 'wb-standing-minimal',
    layout: 'comparison',
    sections: [
      {
        title: 'Data Lake',
        type: 'pros',
        items: [
          'Schema on read gives exploration flexibility',
          'Low-cost object storage at any scale',
          'Handles structured and unstructured data',
          'Great for ML training data pipelines',
          'No vendor lock-in with open formats',
          'Easy to land raw data from any source'
        ]
      },
      {
        title: 'Data Lakehouse',
        type: 'cons',
        items: [
          'ACID transactions prevent data corruption',
          'BI-grade query performance out of the box',
          'Unified governance across all workloads',
          'Time travel and audit history built in',
          'Schema enforcement catches bad data early',
          'Supports concurrent reads and writes safely'
        ]
      }
    ],
    insight: 'Lakehouses add structure and reliability to data lake flexibility.'
  },

  ai_data_workflows: {
    title: 'ML Pipeline Automation',
    subtitle: 'Every stage needs its own automation. Here is the full map.',
    theme: 'wb-glass-clean',
    layout: 'dense-infographic',
    sections: [
      {
        title: 'Data Ingestion',
        items: [
          'CDC pipelines for real-time capture',
          'Event streaming with Kafka or Kinesis',
          'Batch imports on scheduled intervals',
          'Schema validation at the source',
          'Data contracts between producers'
        ]
      },
      {
        title: 'Feature Engineering',
        items: [
          'Centralized feature store for reuse',
          'Automated transformations with versioning',
          'Validation rules catch drift early',
          'Point-in-time correctness for training',
          'Feature lineage and documentation'
        ]
      },
      {
        title: 'Model Training',
        items: [
          'Experiment tracking with MLflow or W&B',
          'Hyperparameter tuning at scale',
          'Distributed training across GPUs',
          'Reproducible runs with pinned deps',
          'Automated model selection pipelines'
        ]
      },
      {
        title: 'Deployment',
        items: [
          'Model registry with approval gates',
          'A/B testing against production baseline',
          'Canary rollouts with automated rollback',
          'Shadow mode for safe validation',
          'Blue-green for zero downtime'
        ]
      },
      {
        title: 'Monitoring',
        items: [
          'Data drift detection on input features',
          'Performance metrics tracked per model',
          'Alerting on prediction quality drops',
          'Automated retraining triggers',
          'Business KPI correlation dashboards'
        ]
      }
    ],
    insight: 'Modern ML requires automation across the entire lifecycle, not just training.'
  },

  automation_reliability: {
    title: 'Incident Response Playbook',
    subtitle: 'Your 3AM guide to production fires. Follow the steps.',
    theme: 'wb-standing-marker',
    layout: 'dense-infographic',
    sections: [
      {
        title: 'Detection',
        items: [
          'Check monitoring dashboards immediately',
          'Review recent deploys in the last 24 hours',
          'Scan error logs for new exception patterns',
          'Check downstream services for cascade',
          'Confirm scope: one user or all users?'
        ]
      },
      {
        title: 'Triage',
        items: [
          'Assess impact radius and affected users',
          'Identify root cause vs symptoms',
          'Estimate time to fix with confidence',
          'Escalate if resolution exceeds 30 minutes',
          'Communicate status to stakeholders early'
        ]
      },
      {
        title: 'Resolution',
        items: [
          'Apply hotfix or rollback to last known good',
          'Verify fix in staging before production',
          'Monitor production metrics for 30 minutes',
          'Confirm resolution with affected users',
          'Document what was done and why'
        ]
      },
      {
        title: 'Post-Mortem',
        items: [
          'Document full timeline of the incident',
          'Identify root cause and contributing factors',
          'List prevention steps with owners assigned',
          'Update runbooks with new procedures',
          'Share learnings with the broader team'
        ]
      }
    ],
    insight: "Great teams don't avoid incidents. They respond systematically and learn."
  },

  governance_trust: {
    title: 'Data Governance Framework',
    subtitle: 'What must exist before data can be trusted at scale.',
    theme: 'wb-glass-sticky',
    layout: 'whiteboard',
    sections: [
      {
        title: 'Foundation',
        description: 'What must exist first',
        subsections: [
          {
            title: 'Policy',
            items: [
              'Data classification by sensitivity level',
              'Access policies tied to business roles',
              'Retention rules aligned with compliance',
              'Change management procedures documented'
            ]
          },
          {
            title: 'Standards',
            items: [
              'Naming conventions enforced in CI/CD',
              'Canonical data models per domain',
              'Quality metrics defined and tracked',
              'Documentation requirements for datasets'
            ]
          },
          {
            title: 'Stewardship',
            items: [
              'Domain owners assigned per dataset',
              'Metadata management automated',
              'Lineage tracking across pipelines',
              'Regular review cadence established'
            ]
          }
        ]
      },
      {
        title: 'Outcomes',
        description: 'What governance enables',
        subsections: [
          {
            title: 'Quality',
            items: [
              'Validation rules run on every pipeline',
              'Anomaly detection catches issues early',
              'SLA monitoring with automated alerts',
              'Data freshness guaranteed by contract'
            ]
          },
          {
            title: 'Privacy',
            items: [
              'PII detection scans all new datasets',
              'Access logging for audit compliance',
              'Compliance reporting automated monthly',
              'Right to deletion workflows in place'
            ]
          },
          {
            title: 'Trust',
            items: [
              'Consistent KPIs across all dashboards',
              'Reliable data products for AI/ML',
              'Scalable decisions built on governed data',
              'Teams trust the data without verifying'
            ]
          }
        ]
      }
    ],
    insight: "Governance isn't red tape. It's the foundation of data you can trust."
  },

  real_world_lessons: {
    title: 'Why Our Data Migration Failed',
    subtitle: 'A postmortem on overconfidence. And what we do differently now.',
    theme: 'wb-glass-clean',
    layout: 'evolution',
    sections: [
      {
        title: 'Overconfidence',
        label: 'What Went Wrong',
        items: [
          'Underestimated schema complexity by 3x',
          'No rollback plan tested before go-live',
          'Skipped load testing at production scale',
          'Migrated over a weekend with skeleton crew',
          'Assumed source data was clean. It was not.'
        ],
        annotation: 'Every shortcut has a cost',
        arrowLabel: 'Then reality hit'
      },
      {
        title: 'Impact',
        label: 'What Happened',
        items: [
          '12-hour outage affecting all customers',
          'Data inconsistencies across 40+ tables',
          'Customer complaints escalated to exec team',
          'Engineering burnout from 36-hour fix sprint',
          'Trust in data team dropped to zero'
        ],
        annotation: 'The real damage was trust'
      },
      {
        title: 'Recovery',
        label: 'Lessons Learned',
        items: [
          'Always migrate iteratively in small batches',
          'Test with production-scale data, not samples',
          'Have a working rollback script tested twice',
          'Blue-green deployments for zero-downtime cuts',
          'Never migrate without a dedicated war room'
        ],
        annotation: 'What we do now'
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
