/**
 * Performance Test
 * Tests memory usage, rendering performance, and resource management
 */

const BrowserUtils = require('../utils/browser-utils');
const GameUtils = require('../utils/game-utils');
const TestReporter = require('../utils/test-reporter');
const testConfig = require('../config/test.config');

async function runPerformanceTest() {
  const reporter = new TestReporter('performance');
  const browser = new BrowserUtils();
  let gameUtils;

  const performanceMetrics = {
    loadTime: 0,
    memorySnapshots: [],
    renderingMetrics: [],
    interactionLatency: []
  };

  try {
    // Initialize browser
    await browser.launchBrowser();
    gameUtils = new GameUtils(browser);

    // Test 1: Load Performance
    const loadSection = reporter.startSection('Load Performance', 'Test application loading speed');

    const loadStartTime = Date.now();
    await browser.navigateToApp();
    const loadEndTime = Date.now();

    performanceMetrics.loadTime = loadEndTime - loadStartTime;

    reporter.addTest('Load Performance', 'App loads within acceptable time',
      performanceMetrics.loadTime < 10000, `${performanceMetrics.loadTime}ms`, '<10000ms');

    await browser.monitorMemory();
    reporter.endSection('Load Performance');

    // Test 2: Memory Usage Baseline
    const memorySection = reporter.startSection('Memory Management', 'Test memory usage patterns');

    const initialMemory = await browser.monitorMemory();
    if (initialMemory) {
      performanceMetrics.memorySnapshots.push({
        phase: 'initial',
        ...initialMemory
      });
    }

    // Interact with bot builder
    await gameUtils.testComponentSelection('chassis', 'Speed Bot');
    await gameUtils.testComponentSelection('weapon', 'Cannon');
    await gameUtils.testComponentSelection('special', 'Shield');

    const builderMemory = await browser.monitorMemory();
    if (builderMemory) {
      performanceMetrics.memorySnapshots.push({
        phase: 'builder_interaction',
        ...builderMemory
      });
    }

    reporter.endSection('Memory Management');

    // Test 3: 3D Rendering Performance
    const renderingSection = reporter.startSection('3D Rendering', 'Test 3D graphics performance');

    // Check for WebGL support and canvas rendering
    const renderingInfo = await browser.page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return { hasCanvas: false };

      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      return {
        hasCanvas: true,
        hasWebGL: !!gl,
        canvasSize: { width: canvas.width, height: canvas.height },
        renderer: gl ? gl.getParameter(gl.RENDERER) : null,
        vendor: gl ? gl.getParameter(gl.VENDOR) : null
      };
    });

    reporter.addTest('3D Rendering', 'Canvas element present', renderingInfo.hasCanvas);
    reporter.addTest('3D Rendering', 'WebGL support available', renderingInfo.hasWebGL);

    if (renderingInfo.hasWebGL) {
      reporter.addLog('3D Rendering', `Renderer: ${renderingInfo.renderer}`);
      reporter.addLog('3D Rendering', `Vendor: ${renderingInfo.vendor}`);
    }

    // Test rendering during bot customization
    const renderStartTime = Date.now();

    // Change components and measure response time
    for (let i = 0; i < 3; i++) {
      const componentStartTime = Date.now();
      await gameUtils.testComponentSelection('chassis', ['Speed Bot', 'Tank Bot', 'Balanced Bot'][i]);
      const componentEndTime = Date.now();

      performanceMetrics.interactionLatency.push({
        action: 'component_selection',
        latency: componentEndTime - componentStartTime
      });
    }

    const renderEndTime = Date.now();
    const totalRenderTime = renderEndTime - renderStartTime;

    reporter.addTest('3D Rendering', 'Component changes render smoothly',
      totalRenderTime < 5000, `${totalRenderTime}ms`, '<5000ms');

    const avgLatency = performanceMetrics.interactionLatency.reduce((sum, item) => sum + item.latency, 0) / performanceMetrics.interactionLatency.length;
    reporter.addTest('3D Rendering', 'Low interaction latency',
      avgLatency < 1000, `${avgLatency.toFixed(0)}ms`, '<1000ms');

    await browser.monitorMemory();
    reporter.endSection('3D Rendering');

    // Test 4: Battle Performance
    const battleSection = reporter.startSection('Battle Performance', 'Test performance during battle');

    // Start battle
    const battleButton = await browser.findButtonByText(testConfig.selectors.battleButton);
    if (battleButton) {
      const battleStartTime = Date.now();
      await battleButton.click();
      await new Promise(resolve => setTimeout(resolve, 3000));

      const battleLoadTime = Date.now() - battleStartTime;
      reporter.addTest('Battle Performance', 'Battle loads quickly',
        battleLoadTime < 8000, `${battleLoadTime}ms`, '<8000ms');

      // Monitor memory during battle
      const battleMemory = await browser.monitorMemory();
      if (battleMemory) {
        performanceMetrics.memorySnapshots.push({
          phase: 'battle_start',
          ...battleMemory
        });
      }

      // Test gameplay performance
      const gameplayStartTime = Date.now();
      await gameUtils.simulateGameplay();
      const gameplayEndTime = Date.now();

      const gameplayTime = gameplayEndTime - gameplayStartTime;
      reporter.addTest('Battle Performance', 'Gameplay interactions responsive',
        gameplayTime < 10000, `${gameplayTime}ms`, '<10000ms');

      // Monitor battle for performance
      const monitoringResults = await gameUtils.monitorBattleDuration(10); // 10 seconds

      reporter.addTest('Battle Performance', 'Battle maintains performance',
        monitoringResults.battleActive || monitoringResults.timeRemaining.length > 3);

      // Final battle memory check
      const finalBattleMemory = await browser.monitorMemory();
      if (finalBattleMemory) {
        performanceMetrics.memorySnapshots.push({
          phase: 'battle_active',
          ...finalBattleMemory
        });
      }
    }

    reporter.endSection('Battle Performance');

    // Test 5: Memory Leak Detection
    const leakSection = reporter.startSection('Memory Leak Detection', 'Check for memory leaks');

    // Return to builder
    const backButton = await browser.findButtonByText(testConfig.selectors.backButton);
    if (backButton) {
      await backButton.click();
      await new Promise(resolve => setTimeout(resolve, 3000));

      const returnMemory = await browser.monitorMemory();
      if (returnMemory) {
        performanceMetrics.memorySnapshots.push({
          phase: 'returned_to_builder',
          ...returnMemory
        });
      }
    }

    // Analyze memory usage patterns
    if (performanceMetrics.memorySnapshots.length >= 2) {
      const initial = performanceMetrics.memorySnapshots[0];
      const final = performanceMetrics.memorySnapshots[performanceMetrics.memorySnapshots.length - 1];

      const memoryIncrease = final.jsHeapUsedSize - initial.jsHeapUsedSize;
      const memoryIncreasePercent = (memoryIncrease / initial.jsHeapUsedSize) * 100;

      reporter.addTest('Memory Leak Detection', 'No significant memory leaks',
        memoryIncreasePercent < testConfig.expected.maxMemoryIncrease,
        `${memoryIncreasePercent.toFixed(1)}%`, `<${testConfig.expected.maxMemoryIncrease}%`);

      // Log memory progression
      performanceMetrics.memorySnapshots.forEach((snapshot, index) => {
        reporter.addLog('Memory Leak Detection',
          `${snapshot.phase}: ${snapshot.jsHeapUsedSize}MB used`);
      });
    }

    reporter.endSection('Memory Leak Detection');

    // Performance Metrics Summary
    const avgInteractionLatency = performanceMetrics.interactionLatency.length > 0
      ? performanceMetrics.interactionLatency.reduce((sum, item) => sum + item.latency, 0) / performanceMetrics.interactionLatency.length
      : 0;

    const memoryAnalysis = browser.getMemoryAnalysis();

    reporter.addMetrics({
      'Load Time (ms)': performanceMetrics.loadTime,
      'Avg Interaction Latency (ms)': avgInteractionLatency.toFixed(0),
      'Memory Snapshots': performanceMetrics.memorySnapshots.length,
      'Initial Memory (MB)': memoryAnalysis?.initial || 'N/A',
      'Final Memory (MB)': memoryAnalysis?.final || 'N/A',
      'Memory Increase (%)': memoryAnalysis?.increasePercent.toFixed(1) || 'N/A',
      'WebGL Support': renderingInfo.hasWebGL ? 'Yes' : 'No',
      'Performance Rating': getPerformanceRating(performanceMetrics, memoryAnalysis)
    });

    // Take final screenshot
    await browser.takeScreenshot('performance-final.png', 'Performance test completed');
    reporter.addScreenshot('performance-final.png', 'Final application state');

    // Complete test
    const finalStatus = reporter.results.summary.failed === 0 ? 'passed' : 'failed';
    await reporter.complete(finalStatus);

    console.log('\n🎯 Performance test completed!');
    return reporter.results;

  } catch (error) {
    reporter.addError(error);

    // Take error screenshot
    await browser.takeScreenshot('performance-error.png', 'Error state');
    reporter.addScreenshot('performance-error.png', 'Error occurred during test');

    await reporter.complete('failed');
    throw error;
  } finally {
    await browser.cleanup();
  }
}

function getPerformanceRating(metrics, memoryAnalysis) {
  let score = 100;

  // Deduct points for slow load time
  if (metrics.loadTime > 5000) score -= 20;
  else if (metrics.loadTime > 3000) score -= 10;

  // Deduct points for high interaction latency
  const avgLatency = metrics.interactionLatency.length > 0
    ? metrics.interactionLatency.reduce((sum, item) => sum + item.latency, 0) / metrics.interactionLatency.length
    : 0;
  if (avgLatency > 500) score -= 20;
  else if (avgLatency > 200) score -= 10;

  // Deduct points for memory issues
  if (memoryAnalysis && memoryAnalysis.increasePercent > 50) score -= 30;
  else if (memoryAnalysis && memoryAnalysis.increasePercent > 25) score -= 15;

  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 60) return 'Fair';
  return 'Poor';
}

// Run the test
if (require.main === module) {
  runPerformanceTest()
    .then((results) => {
      console.log(`🎯 Test completed with status: ${results.status}`);
      process.exit(results.status === 'passed' ? 0 : 1);
    })
    .catch((error) => {
      console.error('💥 Test failed:', error.message);
      process.exit(1);
    });
}

module.exports = runPerformanceTest;
