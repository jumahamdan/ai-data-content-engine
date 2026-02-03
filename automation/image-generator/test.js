/**
 * Test script for LinkedIn Image Generator
 * Generates sample outputs for both card and diagram types
 */

const path = require('path');
const { generateImageToFile } = require('./index');

const OUTPUT_DIR = path.join(__dirname, '..', 'test-outputs');

// Sample data matching real workflow output format
const sampleCard = {
  imageType: 'card',
  imageTitle: 'Medallion Architecture Explained',
  imageBullets: [
    'Bronze layer stores raw, unprocessed data',
    'Silver layer applies cleansing and transformations',
    'Gold layer contains business-ready aggregations',
    'Enables incremental data quality improvements',
    'Perfect for interview prep and system design'
  ],
  template: 'interview_explainer',
  theme: 'light'
};

const sampleDiagram = {
  imageType: 'diagram',
  imageTitle: 'Warehouse vs Lakehouse',
  imageSections: [
    {
      title: 'Data Warehouse',
      items: ['Structured data only', 'Schema-on-write', 'SQL-centric', 'High performance queries'],
      icon: 'warehouse',
      color: 'purple'
    },
    {
      title: 'Data Lakehouse',
      items: ['All data types', 'Schema-on-read', 'Unified analytics', 'Cost-effective storage'],
      icon: 'lake',
      color: 'blue'
    }
  ],
  template: 'architecture',
  theme: 'light'
};

const sampleLayered = {
  imageType: 'diagram',
  imageTitle: 'Layers of a RAG System',
  imageSections: [
    {
      title: 'Data Ingestion',
      description: 'Documents, APIs, databases',
      icon: 'document',
      color: 'purple'
    },
    {
      title: 'Chunking & Embedding',
      description: 'Split text, generate vectors',
      icon: 'filter',
      color: 'orange'
    },
    {
      title: 'Vector Store',
      description: 'Index and similarity search',
      icon: 'database',
      color: 'green'
    },
    {
      title: 'Retrieval & Generation',
      description: 'Context injection, LLM response',
      icon: 'brain',
      color: 'blue'
    }
  ],
  template: 'layered',
  theme: 'light'
};

const sampleOptimization = {
  imageType: 'card',
  imageTitle: 'SQL Window Functions Tips',
  imageBullets: [
    'Use ROW_NUMBER() for pagination queries',
    'LAG/LEAD access adjacent rows efficiently',
    'PARTITION BY creates logical groups',
    'Avoid unnecessary ORDER BY in frames'
  ],
  template: 'optimization',
  theme: 'light'
};

const sampleCheatsheet = {
  imageType: 'cheatsheet',
  imageTitle: 'SQL vs Pandas vs PySpark',
  imageSubtitle: 'Complete Cheatsheet',
  imageColumns: [
    { title: 'SQL', color: 'blue', icon: 'database' },
    { title: 'Pandas', color: 'orange', icon: 'chart' },
    { title: 'PySpark', color: 'green', icon: 'lightning' }
  ],
  imageRows: [
    { label: 'Read Data', values: ['SELECT * FROM table', 'pd.read_csv("file.csv")', 'spark.read.csv("file")'] },
    { label: 'Select Cols', values: ['SELECT col1, col2', 'df[["col1", "col2"]]', 'df.select("col1", "col2")'] },
    { label: 'Filter Rows', values: ['WHERE age > 30', 'df[df.age > 30]', 'df.filter(df.age > 30)'] },
    { label: 'Add Column', values: ['SELECT *, a+b AS total', 'df["total"] = df.a + df.b', 'df.withColumn("total", df.a+df.b)'] },
    { label: 'Group By', values: ['GROUP BY dept', 'df.groupby("dept")', 'df.groupBy("dept")'] },
    { label: 'Aggregation', values: ['COUNT(*), SUM(sal)', 'agg({"sal": "sum"})', 'agg(sum("sal"))'] },
    { label: 'Join Tables', values: ['FROM a JOIN b ON id', 'df1.merge(df2, on="id")', 'df1.join(df2, "id")'] },
    { label: 'Sort Data', values: ['ORDER BY salary DESC', 'df.sort_values("salary")', 'df.orderBy("salary")'] },
    { label: 'Remove Dups', values: ['SELECT DISTINCT col', 'df.drop_duplicates()', 'df.dropDuplicates()'] },
    { label: 'Null Check', values: ['IS NULL / IS NOT NULL', 'df.isna() / df.fillna(0)', 'isNull() / fillna(0)'] }
  ],
  footerLabels: ['SQL for Databases', 'Pandas for Local', 'PySpark for Big Data']
};

async function runTests() {
  console.log('LinkedIn Image Generator - Test Suite\n');
  console.log('=' .repeat(50));

  const tests = [
    { name: 'card-interview', data: sampleCard },
    { name: 'diagram-architecture', data: sampleDiagram },
    { name: 'diagram-layered', data: sampleLayered },
    { name: 'card-optimization', data: sampleOptimization },
    { name: 'cheatsheet-comparison', data: sampleCheatsheet }
  ];

  for (const test of tests) {
    try {
      console.log(`\nGenerating: ${test.name}...`);
      const outputPath = path.join(OUTPUT_DIR, `${test.name}.png`);
      const result = await generateImageToFile(test.data, outputPath);
      console.log(`  OK - Saved to: ${result.path}`);
      console.log(`  Type: ${result.type}`);
    } catch (error) {
      console.error(`  Error: ${error.message}`);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`\nAll samples saved to: ${OUTPUT_DIR}`);
}

// Run if called directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };
