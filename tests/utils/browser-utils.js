/**
 * Browser Utilities
 * Common browser operations for test suites
 */

const puppeteer = require('puppeteer');
const testConfig = require('../config/test.config');

class BrowserUtils {
  constructor() {
    this.browser = null;
    this.page = null;
    this.memoryUsage = [];
  }

  /**
   * Launch browser with standard configuration
   */
  async launchBrowser() {
    this.browser = await puppeteer.launch({
      headless: testConfig.browser.headless,
      defaultViewport: testConfig.browser.viewport,
      args: testConfig.browser.args
    });

    this.page = await this.browser.newPage();

    // Set up console logging
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('🔴 Browser Error:', msg.text());
      }
    });

    return { browser: this.browser, page: this.page };
  }

  /**
   * Navigate to application
   */
  async navigateToApp() {
    if (!this.page) throw new Error('Page not initialized');

    console.log(`📱 Navigating to ${testConfig.app.baseUrl}...`);
    await this.page.goto(testConfig.app.baseUrl, {
      waitUntil: 'networkidle2',
      timeout: testConfig.timeouts.navigation
    });
  }

  /**
   * Monitor memory usage
   */
  async monitorMemory() {
    if (!this.page) return;

    try {
      const metrics = await this.page.metrics();
      const memoryInfo = {
        timestamp: Date.now(),
        jsHeapUsedSize: Math.round(metrics.JSHeapUsedSize / 1024 / 1024 * 100) / 100,
        jsHeapTotalSize: Math.round(metrics.JSHeapTotalSize / 1024 / 1024 * 100) / 100
      };
      this.memoryUsage.push(memoryInfo);
      console.log(`📊 Memory: ${memoryInfo.jsHeapUsedSize}MB used / ${memoryInfo.jsHeapTotalSize}MB total`);
      return memoryInfo;
    } catch (error) {
      console.log('⚠️ Memory monitoring error (normal during transitions)');
      return null;
    }
  }

  /**
   * Get memory analysis
   */
  getMemoryAnalysis() {
    if (this.memoryUsage.length < 2) return null;

    const initial = this.memoryUsage[0].jsHeapUsedSize;
    const final = this.memoryUsage[this.memoryUsage.length - 1].jsHeapUsedSize;
    const increase = final - initial;
    const increasePercent = (increase / initial) * 100;

    return {
      initial,
      final,
      increase,
      increasePercent,
      isStable: increasePercent < testConfig.expected.maxMemoryIncrease
    };
  }

  /**
   * Find button by text content
   */
  async findButtonByText(text) {
    return await this.page.evaluateHandle((buttonText) => {
      return Array.from(document.querySelectorAll('button'))
        .find(btn => btn.textContent && btn.textContent.includes(buttonText));
    }, text);
  }

  /**
   * Wait for element and get text
   */
  async waitForElementText(selector, timeout = testConfig.timeouts.element) {
    await this.page.waitForSelector(selector, { timeout });
    return await this.page.$eval(selector, el => el.textContent);
  }

  /**
   * Check if element contains text
   */
  async elementContainsText(text) {
    return await this.page.evaluate((searchText) => {
      return Array.from(document.querySelectorAll('*'))
        .some(el => el.textContent && el.textContent.includes(searchText));
    }, text);
  }

  /**
   * Simulate gameplay actions
   */
  async simulateGameplay(actions = testConfig.testData.gameplayActions) {
    const results = [];

    for (const action of actions) {
      await this.page.keyboard.down(action.key);
      await new Promise(resolve => setTimeout(resolve, action.duration));
      await this.page.keyboard.up(action.key);

      results.push({
        action: action.action,
        timestamp: Date.now()
      });

      await new Promise(resolve => setTimeout(resolve, 200));
    }

    return results;
  }

  /**
   * Take screenshot with error handling
   */
  async takeScreenshot(filename, options = {}) {
    if (!this.page) return;

    try {
      const screenshotOptions = {
        path: `${testConfig.screenshots.path}/${filename}`,
        fullPage: testConfig.screenshots.fullPage,
        ...options
      };

      await this.page.screenshot(screenshotOptions);
      console.log(`📸 Screenshot saved: ${filename}`);
    } catch (error) {
      console.log(`⚠️ Screenshot failed: ${error.message}`);
    }
  }

  /**
   * Clean up browser resources
   */
  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
  }
}

module.exports = BrowserUtils;
