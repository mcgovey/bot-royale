/**
 * Test Reporter
 * Generates consistent test reports and summaries
 */

const fs = require('fs').promises;
const path = require('path');
const testConfig = require('../config/test.config');

class TestReporter {
  constructor(testName) {
    this.testName = testName;
    this.startTime = Date.now();
    this.results = {
      testName,
      startTime: this.startTime,
      endTime: null,
      duration: null,
      status: 'running',
      summary: {
        passed: 0,
        failed: 0,
        total: 0
      },
      sections: [],
      errors: [],
      screenshots: [],
      metrics: {}
    };
  }

  /**
   * Start a new test section
   */
  startSection(name, description = '') {
    const section = {
      name,
      description,
      startTime: Date.now(),
      endTime: null,
      duration: null,
      status: 'running',
      tests: [],
      logs: []
    };

    this.results.sections.push(section);
    console.log(`\n🧪 ${name}${description ? ` - ${description}` : ''}`);
    return section;
  }

  /**
   * End a test section
   */
  endSection(sectionName, status = 'passed') {
    const section = this.results.sections.find(s => s.name === sectionName);
    if (section) {
      section.endTime = Date.now();
      section.duration = section.endTime - section.startTime;
      section.status = status;
    }
  }

  /**
   * Add a test result to current section
   */
  addTest(sectionName, testName, passed, value = null, expected = null) {
    const section = this.results.sections.find(s => s.name === sectionName);
    if (section) {
      const test = {
        name: testName,
        passed,
        value,
        expected,
        timestamp: Date.now()
      };

      section.tests.push(test);
      this.results.summary.total++;

      if (passed) {
        this.results.summary.passed++;
        console.log(`✅ ${testName}${value !== null ? `: ${value}` : ''}`);
      } else {
        this.results.summary.failed++;
        console.log(`❌ ${testName}${value !== null ? `: ${value}` : ''}${expected !== null ? ` (expected: ${expected})` : ''}`);
      }
    }
  }

  /**
   * Add a log entry to current section
   */
  addLog(sectionName, message, level = 'info') {
    const section = this.results.sections.find(s => s.name === sectionName);
    if (section) {
      section.logs.push({
        message,
        level,
        timestamp: Date.now()
      });
    }

    const emoji = level === 'error' ? '🔴' : level === 'warning' ? '⚠️' : 'ℹ️';
    console.log(`${emoji} ${message}`);
  }

  /**
   * Add an error
   */
  addError(error, section = null) {
    this.results.errors.push({
      message: error.message,
      stack: error.stack,
      section,
      timestamp: Date.now()
    });
    console.log(`🔴 Error${section ? ` in ${section}` : ''}: ${error.message}`);
  }

  /**
   * Add screenshot reference
   */
  addScreenshot(filename, description = '') {
    this.results.screenshots.push({
      filename,
      description,
      timestamp: Date.now()
    });
    console.log(`📸 Screenshot: ${filename}${description ? ` - ${description}` : ''}`);
  }

  /**
   * Add metrics
   */
  addMetrics(metrics) {
    this.results.metrics = { ...this.results.metrics, ...metrics };
  }

  /**
   * Complete the test and generate final report
   */
  async complete(status = 'passed') {
    this.results.endTime = Date.now();
    this.results.duration = this.results.endTime - this.startTime;
    this.results.status = status;

    // Generate summary
    this.generateSummary();

    // Save report
    await this.saveReport();

    return this.results;
  }

  /**
   * Generate test summary
   */
  generateSummary() {
    console.log('\n📋 Test Summary:');
    console.log(`  Test: ${this.testName}`);
    console.log(`  Duration: ${(this.results.duration / 1000).toFixed(1)}s`);
    console.log(`  Status: ${this.results.status === 'passed' ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`  Tests: ${this.results.summary.passed}/${this.results.summary.total} passed`);

    if (this.results.errors.length > 0) {
      console.log(`  Errors: ${this.results.errors.length}`);
    }

    if (this.results.screenshots.length > 0) {
      console.log(`  Screenshots: ${this.results.screenshots.length}`);
    }

    // Section summaries
    this.results.sections.forEach(section => {
      const sectionPassed = section.tests.filter(t => t.passed).length;
      const sectionTotal = section.tests.length;
      const sectionStatus = section.status === 'passed' ? '✅' : '❌';
      console.log(`  ${sectionStatus} ${section.name}: ${sectionPassed}/${sectionTotal} tests passed`);
    });

    // Metrics summary
    if (Object.keys(this.results.metrics).length > 0) {
      console.log('\n📊 Metrics:');
      Object.entries(this.results.metrics).forEach(([key, value]) => {
        console.log(`  ${key}: ${value}`);
      });
    }
  }

  /**
   * Save report to file
   */
  async saveReport() {
    try {
      // Ensure reports directory exists
      await fs.mkdir(testConfig.reports.path, { recursive: true });

      // Generate filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${this.testName}-${timestamp}.json`;
      const filepath = path.join(testConfig.reports.path, filename);

      // Save JSON report
      await fs.writeFile(filepath, JSON.stringify(this.results, null, 2));
      console.log(`📄 Report saved: ${filepath}`);

      // Generate HTML report
      await this.generateHtmlReport(filepath.replace('.json', '.html'));

    } catch (error) {
      console.log(`⚠️ Failed to save report: ${error.message}`);
    }
  }

  /**
   * Generate HTML report
   */
  async generateHtmlReport(filepath) {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Report - ${this.testName}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 20px; }
        .status-passed { color: #28a745; }
        .status-failed { color: #dc3545; }
        .section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .section-header { font-weight: bold; margin-bottom: 10px; }
        .test-item { margin: 5px 0; padding: 5px; background: #f8f9fa; border-radius: 3px; }
        .test-passed { border-left: 4px solid #28a745; }
        .test-failed { border-left: 4px solid #dc3545; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
        .metric-card { padding: 15px; background: #f8f9fa; border-radius: 5px; text-align: center; }
        .metric-value { font-size: 24px; font-weight: bold; color: #007bff; }
        .screenshots { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 15px; }
        .screenshot { text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Test Report: ${this.testName}</h1>
            <p><strong>Status:</strong> <span class="status-${this.results.status}">${this.results.status.toUpperCase()}</span></p>
            <p><strong>Duration:</strong> ${(this.results.duration / 1000).toFixed(1)}s</p>
            <p><strong>Tests:</strong> ${this.results.summary.passed}/${this.results.summary.total} passed</p>
            <p><strong>Date:</strong> ${new Date(this.results.startTime).toLocaleString()}</p>
        </div>

        ${Object.keys(this.results.metrics).length > 0 ? `
        <div class="section">
            <div class="section-header">📊 Metrics</div>
            <div class="metrics">
                ${Object.entries(this.results.metrics).map(([key, value]) => `
                    <div class="metric-card">
                        <div class="metric-value">${value}</div>
                        <div>${key}</div>
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}

        ${this.results.sections.map(section => `
        <div class="section">
            <div class="section-header">
                ${section.status === 'passed' ? '✅' : '❌'} ${section.name}
                ${section.description ? ` - ${section.description}` : ''}
            </div>
            ${section.tests.map(test => `
                <div class="test-item test-${test.passed ? 'passed' : 'failed'}">
                    ${test.passed ? '✅' : '❌'} ${test.name}
                    ${test.value !== null ? `: ${test.value}` : ''}
                    ${test.expected !== null ? ` (expected: ${test.expected})` : ''}
                </div>
            `).join('')}
            ${section.logs.length > 0 ? `
                <details>
                    <summary>Logs (${section.logs.length})</summary>
                    ${section.logs.map(log => `
                        <div style="margin: 5px 0; font-family: monospace; font-size: 12px;">
                            [${new Date(log.timestamp).toLocaleTimeString()}] ${log.level.toUpperCase()}: ${log.message}
                        </div>
                    `).join('')}
                </details>
            ` : ''}
        </div>
        `).join('')}

        ${this.results.errors.length > 0 ? `
        <div class="section">
            <div class="section-header">🔴 Errors</div>
            ${this.results.errors.map(error => `
                <div class="test-item test-failed">
                    <strong>${error.message}</strong>
                    ${error.section ? ` (in ${error.section})` : ''}
                    <details>
                        <summary>Stack Trace</summary>
                        <pre style="font-size: 12px; overflow-x: auto;">${error.stack}</pre>
                    </details>
                </div>
            `).join('')}
        </div>
        ` : ''}

        ${this.results.screenshots.length > 0 ? `
        <div class="section">
            <div class="section-header">📸 Screenshots</div>
            <div class="screenshots">
                ${this.results.screenshots.map(screenshot => `
                    <div class="screenshot">
                        <p><strong>${screenshot.filename}</strong></p>
                        ${screenshot.description ? `<p>${screenshot.description}</p>` : ''}
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}
    </div>
</body>
</html>`;

    try {
      await fs.writeFile(filepath, html);
      console.log(`📄 HTML report saved: ${filepath}`);
    } catch (error) {
      console.log(`⚠️ Failed to save HTML report: ${error.message}`);
    }
  }
}

module.exports = TestReporter;
