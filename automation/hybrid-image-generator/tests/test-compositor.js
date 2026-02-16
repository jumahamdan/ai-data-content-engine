/**
 * Test Script: Compositor
 *
 * Tests the full render pipeline:
 * 1. Load layout template
 * 2. Inject theme CSS
 * 3. Render content with Mustache
 * 4. Layer background and illustrations
 * 5. Output PNG at 2x scale
 */

const path = require('path');
const fs = require('fs').promises;
const { compositeImage } = require('./compositor');

// Test data for comparison layout
const comparisonTestConfig = {
  layout: 'comparison',
  theme: 'chalkboard',
  backgroundPath: null, // Will use theme fallback color
  title: 'Data Mesh vs Traditional Data Warehouse',
  subtitle: 'A comparison of modern data architectures',
  sections: [
    {
      title: 'Data Mesh Benefits',
      items: [
        'Domain ownership & autonomy',
        'Data as a product mindset',
        'Federated governance',
        'Self-serve infrastructure'
      ]
    },
    {
      title: 'Common Challenges',
      items: [
        'Requires organizational change',
        'Increased coordination overhead',
        'Governance complexity',
        'Skill gap in teams'
      ]
    }
  ],
  illustrations: [], // No illustrations for this test
  insight: 'Data Mesh is not just technology - it is a fundamental shift in how we think about data ownership.',
  outputPath: path.join(__dirname, 'test-outputs', 'compositor-comparison.png'),
  verbose: true
};

// Test data for evolution layout
const evolutionTestConfig = {
  layout: 'evolution',
  theme: 'watercolor',
  backgroundPath: null,
  title: 'Evolution of Data Platforms',
  subtitle: 'From monoliths to distributed systems',
  sections: [
    {
      title: 'Data Warehouse',
      label: 'Gen 1',
      items: ['Centralized storage', 'ETL pipelines', 'BI focus'],
      cons: ['Siloed teams', 'Slow to change']
    },
    {
      title: 'Data Lake',
      label: 'Gen 2',
      items: ['Schema on read', 'Raw data storage', 'Big data support'],
      cons: ['Data swamps', 'Quality issues']
    },
    {
      title: 'Data Mesh',
      label: 'Gen 3',
      items: ['Domain ownership', 'Data as product', 'Self-serve', 'Federated governance']
    }
  ],
  insight: "Each generation solved yesterday's problems while creating tomorrow's opportunities.",
  outputPath: path.join(__dirname, 'test-outputs', 'compositor-evolution.png'),
  verbose: true
};

// Test data for single layout
const singleTestConfig = {
  layout: 'single',
  theme: 'tech',
  backgroundPath: null,
  title: 'What is RAG?',
  subtitle: 'Retrieval-Augmented Generation explained',
  sections: [
    {
      title: 'The Problem',
      items: [
        'LLMs have limited context windows',
        'Training data becomes stale',
        'Cannot access private/real-time data'
      ]
    },
    {
      title: 'The Solution',
      items: [
        'Retrieve relevant context from external sources',
        'Augment the prompt with retrieved information',
        'Generate responses using both LLM knowledge + fresh context'
      ]
    },
    {
      title: 'Why It Matters',
      items: [
        'Reduces hallucinations',
        'Enables access to proprietary data',
        'Keeps responses current',
        'More cost-effective than fine-tuning'
      ]
    }
  ],
  insight: 'RAG bridges the gap between static LLM knowledge and dynamic real-world information.',
  outputPath: path.join(__dirname, 'test-outputs', 'compositor-single.png'),
  verbose: true
};

/**
 * Run compositor test
 */
async function runTest(testName, config) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`TEST: ${testName}`);
  console.log(`${'='.repeat(60)}\n`);

  try {
    // Ensure output directory exists
    const outputDir = path.dirname(config.outputPath);
    await fs.mkdir(outputDir, { recursive: true });

    // Run compositor
    const startTime = Date.now();
    const buffer = await compositeImage(config);
    const duration = Date.now() - startTime;

    console.log(`\n✓ Test passed: ${testName}`);
    console.log(`  Duration: ${duration}ms`);
    console.log(`  Output: ${config.outputPath}`);
    console.log(`  Size: ${buffer.length} bytes (${(buffer.length / 1024).toFixed(1)} KB)`);

    return { success: true, duration, size: buffer.length };
  } catch (err) {
    console.error(`\n✗ Test failed: ${testName}`);
    console.error(`  Error: ${err.message}`);
    console.error(err.stack);
    return { success: false, error: err.message };
  }
}

/**
 * Main test runner
 */
async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║              COMPOSITOR TEST SUITE                         ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  const tests = [
    { name: 'Comparison Layout (Chalkboard Theme)', config: comparisonTestConfig },
    { name: 'Evolution Layout (Watercolor Theme)', config: evolutionTestConfig },
    { name: 'Single Layout (Tech Theme)', config: singleTestConfig }
  ];

  const results = [];

  for (const test of tests) {
    const result = await runTest(test.name, test.config);
    results.push({ name: test.name, ...result });
  }

  // Print summary
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║                    TEST SUMMARY                            ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  results.forEach(result => {
    const status = result.success ? '✓' : '✗';
    const duration = result.duration ? `${result.duration}ms` : 'N/A';
    const size = result.size ? `${(result.size / 1024).toFixed(1)} KB` : 'N/A';
    console.log(`${status} ${result.name}`);
    if (result.success) {
      console.log(`  Duration: ${duration}, Size: ${size}`);
    } else {
      console.log(`  Error: ${result.error}`);
    }
  });

  console.log(`\nTotal: ${results.length} tests, ${passed} passed, ${failed} failed`);

  if (failed > 0) {
    console.log('\n⚠ Some tests failed. Check errors above.');
    process.exit(1);
  } else {
    console.log('\n✓ All tests passed!');
    console.log(`\nGenerated images saved to: ${path.join(__dirname, 'test-outputs')}`);
  }
}

// Run tests
main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
