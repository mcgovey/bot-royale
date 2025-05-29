/**
 * Test Runner
 * Executes all test suites and generates comprehensive reports
 */

const fs = require('fs').promises;
const path = require('path');
const testConfig = require('./config/test.config');

// Import test suites
const runComprehensiveFunctionalityTest = require('./e2e/comprehensive-functionality.test');
const runUsabilityAndStickinessTest = require('./e2e/usability-stickiness.test');
const runPerformanceTest = require('./e2e/performance.test');

class TestRunner {
  constructor() {
    this.results = {
      startTime: Date.now(),
      endTime: null,
      duration: null,
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      suites: [],
      summary: {}
    };
  }

  /**
   * Run all test suites
   */
  async runAllTests() {
    console.log('🚀 Starting BattleBot Arena Test Suite...\n');

    const testSuites = [
      {
        name: 'Comprehensive Functionality',
        description: 'Tests all major features and functionality',
        runner: runComprehensiveFunctionalityTest,
        critical: true
      },
      {
        name: 'Usability & Stickiness',
        description: 'Tests user engagement and usability factors',
        runner: runUsabilityAndStickinessTest,
        critical: true
      },
      {
        name: 'Performance',
        description: 'Tests memory usage and rendering performance',
        runner: runPerformanceTest,
        critical: false
      }
    ];

    for (const suite of testSuites) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`🧪 Running ${suite.name} Test Suite`);
      console.log(`📝 ${suite.description}`);
      console.log(`${'='.repeat(60)}\n`);

      try {
        const suiteStartTime = Date.now();
        const result = await suite.runner();
        const suiteEndTime = Date.now();

        const suiteResult = {
          name: suite.name,
          description: suite.description,
          status: result.status,
          duration: suiteEndTime - suiteStartTime,
          passed: result.summary.passed,
          failed: result.summary.failed,
          total: result.summary.total,
          critical: suite.critical,
          metrics: result.metrics || {},
          screenshots: result.screenshots || [],
          errors: result.errors || []
        };

        this.results.suites.push(suiteResult);
        this.results.totalTests += suiteResult.total;
        this.results.passedTests += suiteResult.passed;
        this.results.failedTests += suiteResult.failed;

        console.log(`\n✅ ${suite.name} completed: ${suiteResult.status.toUpperCase()}`);
        console.log(`   Tests: ${suiteResult.passed}/${suiteResult.total} passed`);
        console.log(`   Duration: ${(suiteResult.duration / 1000).toFixed(1)}s`);

        // Stop if critical test fails
        if (suite.critical && result.status === 'failed') {
          console.log(`\n❌ Critical test suite failed. Stopping execution.`);
          break;
        }

      } catch (error) {
        console.error(`\n❌ ${suite.name} failed with error:`, error.message);

        const suiteResult = {
          name: suite.name,
          description: suite.description,
          status: 'failed',
          duration: 0,
          passed: 0,
          failed: 1,
          total: 1,
          critical: suite.critical,
          metrics: {},
          screenshots: [],
          errors: [{ message: error.message, stack: error.stack }]
        };

        this.results.suites.push(suiteResult);
        this.results.totalTests += 1;
        this.results.failedTests += 1;

        if (suite.critical) {
          console.log(`\n❌ Critical test suite failed. Stopping execution.`);
          break;
        }
      }

      // Wait between test suites
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    this.results.endTime = Date.now();
    this.results.duration = this.results.endTime - this.results.startTime;

    await this.generateFinalReport();
    return this.results;
  }

  /**
   * Run a specific test suite
   */
  async runSingleTest(testName) {
    const testMap = {
      'functionality': runComprehensiveFunctionalityTest,
      'usability': runUsabilityAndStickinessTest,
      'performance': runPerformanceTest
    };

    const runner = testMap[testName.toLowerCase()];
    if (!runner) {
      throw new Error(`Unknown test: ${testName}. Available tests: ${Object.keys(testMap).join(', ')}`);
    }

    console.log(`🧪 Running ${testName} test...\n`);
    return await runner();
  }

  /**
   * Generate comprehensive final report
   */
  async generateFinalReport() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 FINAL TEST REPORT');
    console.log('='.repeat(80));

    // Overall summary
    const overallStatus = this.results.failedTests === 0 ? 'PASSED' : 'FAILED';
    const successRate = this.results.totalTests > 0 ? (this.results.passedTests / this.results.totalTests * 100).toFixed(1) : 0;

    console.log(`\n🎯 Overall Status: ${overallStatus === 'PASSED' ? '✅' : '❌'} ${overallStatus}`);
    console.log(`📈 Success Rate: ${successRate}% (${this.results.passedTests}/${this.results.totalTests})`);
    console.log(`⏱️ Total Duration: ${(this.results.duration / 1000).toFixed(1)}s`);
    console.log(`📅 Completed: ${new Date(this.results.endTime).toLocaleString()}`);

    // Suite summaries
    console.log('\n📋 Test Suite Results:');
    this.results.suites.forEach(suite => {
      const status = suite.status === 'passed' ? '✅' : '❌';
      const critical = suite.critical ? '🔴 CRITICAL' : '🔵 OPTIONAL';
      console.log(`  ${status} ${suite.name} (${critical})`);
      console.log(`     ${suite.passed}/${suite.total} tests passed`);
      console.log(`     Duration: ${(suite.duration / 1000).toFixed(1)}s`);

      if (suite.errors.length > 0) {
        console.log(`     Errors: ${suite.errors.length}`);
      }
    });

    // Aggregate metrics
    console.log('\n📊 Aggregate Metrics:');
    const allMetrics = {};
    this.results.suites.forEach(suite => {
      Object.entries(suite.metrics).forEach(([key, value]) => {
        if (!allMetrics[key]) allMetrics[key] = [];
        allMetrics[key].push({ suite: suite.name, value });
      });
    });

    Object.entries(allMetrics).forEach(([metric, values]) => {
      console.log(`  ${metric}:`);
      values.forEach(({ suite, value }) => {
        console.log(`    ${suite}: ${value}`);
      });
    });

    // Recommendations
    console.log('\n💡 Recommendations:');
    const recommendations = this.generateRecommendations();
    if (recommendations.length === 0) {
      console.log('  🎉 All tests passed! No recommendations needed.');
    } else {
      recommendations.forEach(rec => {
        console.log(`  • ${rec}`);
      });
    }

    // Save detailed report
    await this.saveDetailedReport();

    console.log('\n' + '='.repeat(80));
  }

  /**
   * Generate recommendations based on test results
   */
  generateRecommendations() {
    const recommendations = [];

    this.results.suites.forEach(suite => {
      if (suite.status === 'failed') {
        recommendations.push(`Fix issues in ${suite.name} test suite`);
      }

      // Check specific metrics for recommendations
      if (suite.metrics['Stickiness Score']) {
        const score = parseInt(suite.metrics['Stickiness Score']);
        if (score < 70) {
          recommendations.push('Improve user engagement and stickiness factors');
        }
      }

      if (suite.metrics['Performance Rating']) {
        const rating = suite.metrics['Performance Rating'];
        if (rating === 'Poor' || rating === 'Fair') {
          recommendations.push('Optimize application performance and memory usage');
        }
      }

      if (suite.metrics['Memory Stable'] === 'No') {
        recommendations.push('Investigate and fix memory leaks');
      }
    });

    return [...new Set(recommendations)]; // Remove duplicates
  }

  /**
   * Save detailed JSON report
   */
  async saveDetailedReport() {
    try {
      await fs.mkdir(testConfig.reports.path, { recursive: true });

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `test-suite-report-${timestamp}.json`;
      const filepath = path.join(testConfig.reports.path, filename);

      const detailedReport = {
        ...this.results,
        summary: {
          overallStatus: this.results.failedTests === 0 ? 'PASSED' : 'FAILED',
          successRate: this.results.totalTests > 0 ? (this.results.passedTests / this.results.totalTests * 100).toFixed(1) : 0,
          recommendations: this.generateRecommendations(),
          generatedAt: new Date().toISOString()
        }
      };

      await fs.writeFile(filepath, JSON.stringify(detailedReport, null, 2));
      console.log(`\n📄 Detailed report saved: ${filepath}`);

    } catch (error) {
      console.log(`⚠️ Failed to save detailed report: ${error.message}`);
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const testRunner = new TestRunner();

  try {
    if (args.length === 0) {
      // Run all tests
      const results = await testRunner.runAllTests();
      process.exit(results.failedTests === 0 ? 0 : 1);
    } else {
      // Run specific test
      const testName = args[0];
      const result = await testRunner.runSingleTest(testName);
      console.log(`\n🎯 ${testName} test completed with status: ${result.status}`);
      process.exit(result.status === 'passed' ? 0 : 1);
    }
  } catch (error) {
    console.error('💥 Test runner failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = TestRunner;
