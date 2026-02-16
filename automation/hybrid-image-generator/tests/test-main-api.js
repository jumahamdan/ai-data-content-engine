/**
 * Test script for main API (index.js)
 *
 * Tests the complete hybrid image generation pipeline:
 * - Auto-selection of theme and layout
 * - Background generation with caching
 * - Full composition
 *
 * Usage: node test-main-api.js
 */

const path = require('path');
const { generateImage, quickGenerate, autoSelectTheme, autoSelectLayout } = require('./index');

// Test output directory
const OUTPUT_DIR = path.join(__dirname, 'test-outputs');

/**
 * Test 1: Basic comparison layout
 */
async function testComparison() {
  console.log('\n=== Test 1: Comparison Layout (Chalkboard Theme) ===\n');

  const contentData = {
    title: 'Data Mesh vs Data Warehouse',
    subtitle: 'Architectural Comparison',
    theme: 'chalkboard',
    layout: 'comparison',
    sections: [
      {
        title: 'Data Mesh Features',
        type: 'pros',
        items: ['Domain ownership', 'Data as a product', 'Self-serve platform', 'Federated governance']
      },
      {
        title: 'Challenges',
        type: 'cons',
        items: [
          'Organizational change required',
          'Governance complexity',
          'Higher upfront effort',
          'Team coordination needed'
        ]
      }
    ],
    insight: 'Data Mesh turns data engineering from a service desk into product engineering.'
  };

  const result = await generateImage(contentData, {
    outputPath: path.join(OUTPUT_DIR, 'test-comparison.png'),
    verbose: true
  });

  console.log('\nResult:', result.success ? '✓ Success' : '✗ Failed');
  if (result.metadata) {
    console.log('Metadata:', JSON.stringify(result.metadata, null, 2));
  }

  return result;
}

/**
 * Test 2: Auto-selection (no theme/layout specified)
 */
async function testAutoSelection() {
  console.log('\n=== Test 2: Auto-Selection (No Theme/Layout) ===\n');

  const contentData = {
    title: 'Introduction to Apache Kafka',
    sections: [
      {
        title: 'What is Kafka?',
        items: ['Distributed event streaming platform', 'High-throughput message broker', 'Fault-tolerant and scalable']
      },
      {
        title: 'Key Components',
        items: [
          'Producers: Write events',
          'Consumers: Read events',
          'Brokers: Store events',
          'Topics: Event categories'
        ]
      },
      {
        title: 'Use Cases',
        items: ['Real-time data pipelines', 'Event-driven microservices', 'Log aggregation', 'Stream processing']
      }
    ],
    insight: 'Kafka is the backbone of modern event-driven architectures.'
  };

  // Test auto-selection functions
  const selectedTheme = autoSelectTheme(contentData);
  const selectedLayout = autoSelectLayout(contentData);

  console.log('Auto-selected theme:', selectedTheme);
  console.log('Auto-selected layout:', selectedLayout);

  const result = await generateImage(contentData, {
    outputPath: path.join(OUTPUT_DIR, 'test-auto-selection.png'),
    verbose: true
  });

  console.log('\nResult:', result.success ? '✓ Success' : '✗ Failed');
  if (result.metadata) {
    console.log('Actual theme used:', result.metadata.theme);
    console.log('Actual layout used:', result.metadata.layout);
  }

  return result;
}

/**
 * Test 3: Quick generate helper
 */
async function testQuickGenerate() {
  console.log('\n=== Test 3: Quick Generate Helper ===\n');

  const result = await quickGenerate(
    'API Design Patterns',
    [
      {
        title: 'REST',
        items: ['Stateless', 'HTTP verbs', 'Resource-oriented']
      },
      {
        title: 'GraphQL',
        items: ['Single endpoint', 'Flexible queries', 'Strong typing']
      }
    ],
    path.join(OUTPUT_DIR, 'test-quick-generate.png')
  );

  console.log('\nResult:', result.success ? '✓ Success' : '✗ Failed');

  return result;
}

/**
 * Test 4: Evolution layout
 */
async function testEvolution() {
  console.log('\n=== Test 4: Evolution Layout (Watercolor Theme) ===\n');

  const contentData = {
    title: 'Data Storage Evolution',
    theme: 'watercolor',
    layout: 'evolution',
    sections: [
      {
        title: 'Traditional DB',
        label: 'Stage 1',
        items: ['Monolithic', 'ACID guarantees', 'Limited scale']
      },
      {
        title: 'Data Warehouse',
        label: 'Stage 2',
        items: ['Centralized', 'Analytics-focused', 'ETL processes']
      },
      {
        title: 'Data Lakehouse',
        label: 'Stage 3',
        items: ['Unified storage', 'Schema flexibility', 'Cloud-native']
      }
    ],
    insight: 'Each evolution addressed the limitations of the previous approach.'
  };

  const result = await generateImage(contentData, {
    outputPath: path.join(OUTPUT_DIR, 'test-evolution.png'),
    verbose: true
  });

  console.log('\nResult:', result.success ? '✓ Success' : '✗ Failed');

  return result;
}

/**
 * Test 5: Single layout
 */
async function testSingle() {
  console.log('\n=== Test 5: Single Layout (Tech Theme) ===\n');

  const contentData = {
    title: 'Vector Databases',
    subtitle: 'Powering AI Applications',
    theme: 'tech',
    layout: 'single',
    sections: [
      {
        title: 'What are Vector Databases?',
        items: [
          'Store data as high-dimensional vectors',
          'Optimized for similarity search',
          'Purpose-built for AI workloads'
        ]
      },
      {
        title: 'Key Use Cases',
        items: [
          'Semantic search',
          'Recommendation engines',
          'RAG (Retrieval Augmented Generation)',
          'Image/video similarity'
        ]
      }
    ],
    insight: 'Vector databases are essential infrastructure for modern AI applications.'
  };

  const result = await generateImage(contentData, {
    outputPath: path.join(OUTPUT_DIR, 'test-single.png'),
    verbose: true
  });

  console.log('\nResult:', result.success ? '✓ Success' : '✗ Failed');

  return result;
}

/**
 * Test 6: Error handling (invalid data)
 */
async function testErrorHandling() {
  console.log('\n=== Test 6: Error Handling (Invalid Data) ===\n');

  // Test 6a: Missing title
  console.log('Test 6a: Missing title...');
  const result1 = await generateImage(
    {
      sections: [{ title: 'Test', items: [] }]
    },
    { verbose: false }
  );

  console.log('Result:', result1.success ? '✗ Should have failed' : '✓ Correctly failed');
  console.log('Error:', result1.error);

  // Test 6b: Invalid theme
  console.log('\nTest 6b: Invalid theme...');
  const result2 = await generateImage(
    {
      title: 'Test',
      theme: 'invalid-theme'
    },
    { verbose: false }
  );

  console.log('Result:', result2.success ? '✗ Should have failed' : '✓ Correctly failed');
  console.log('Error:', result2.error);

  // Test 6c: Invalid layout
  console.log('\nTest 6c: Invalid layout...');
  const result3 = await generateImage(
    {
      title: 'Test',
      layout: 'invalid-layout'
    },
    { verbose: false }
  );

  console.log('Result:', result3.success ? '✗ Should have failed' : '✓ Correctly failed');
  console.log('Error:', result3.error);

  return { result1, result2, result3 };
}

// Main test runner
async function runAllTests() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  Hybrid Image Generator - Main API Test Suite            ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  const results = [];

  try {
    // Run all tests
    results.push(await testComparison());
    results.push(await testAutoSelection());
    results.push(await testQuickGenerate());
    results.push(await testEvolution());
    results.push(await testSingle());
    await testErrorHandling(); // Error tests don't count toward success

    // Summary
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  Test Summary                                             ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    const successCount = results.filter(r => r.success).length;
    const failedCount = results.length - successCount;

    console.log(`Total tests: ${results.length}`);
    console.log(`Passed: ${successCount}`);
    console.log(`Failed: ${failedCount}`);

    // Show timing stats
    console.log('\nGeneration times:');
    results.forEach((result, index) => {
      if (result.success && result.metadata) {
        console.log(
          `  Test ${index + 1}: ${result.metadata.latency.total}ms (bg: ${result.metadata.latency.background}ms)`
        );
      }
    });

    console.log('\nAll test images saved to:', OUTPUT_DIR);

    if (failedCount > 0) {
      console.log('\n✗ Some tests failed. See output above for details.');
      process.exit(1);
    } else {
      console.log('\n✓ All tests passed!');
    }
  } catch (error) {
    console.error('\n✗ Test suite failed with error:', error);
    process.exit(1);
  }
}

// Run tests
runAllTests();
