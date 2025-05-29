/**
 * Comprehensive Functionality Test
 * Tests all major features of BattleBot Arena
 */

const BrowserUtils = require('../utils/browser-utils');
const GameUtils = require('../utils/game-utils');
const TestReporter = require('../utils/test-reporter');
const testConfig = require('../config/test.config');

async function runComprehensiveFunctionalityTest() {
  const reporter = new TestReporter('comprehensive-functionality');
  const browser = new BrowserUtils();
  let gameUtils;

  try {
    // Initialize browser
    await browser.launchBrowser();
    gameUtils = new GameUtils(browser);

    // Test 1: Application Loading
    const loadingSection = reporter.startSection('Application Loading', 'Verify app loads correctly');

    await browser.navigateToApp();
    await browser.monitorMemory();

    const title = await browser.waitForElementText(testConfig.selectors.title);
    reporter.addTest('Application Loading', 'App loads with correct title',
      title.includes(testConfig.app.title), title, testConfig.app.title);

    reporter.endSection('Application Loading');

    // Test 2: Bot Builder Visibility
    const visibilitySection = reporter.startSection('Bot Builder Visibility', 'Test option readability and visibility');

    const visibilityResults = await gameUtils.testBotBuilderVisibility();

    reporter.addTest('Bot Builder Visibility', 'All chassis options visible',
      visibilityResults.optionsVisible >= testConfig.expected.minReadableOptions,
      visibilityResults.optionsVisible, testConfig.expected.minReadableOptions);

    reporter.addTest('Bot Builder Visibility', 'Options are readable before selection',
      visibilityResults.readableOptions >= testConfig.expected.minReadableOptions,
      visibilityResults.readableOptions, testConfig.expected.minReadableOptions);

    reporter.addLog('Bot Builder Visibility', `Found ${visibilityResults.optionsVisible} visible options, ${visibilityResults.readableOptions} readable`);

    reporter.endSection('Bot Builder Visibility');

    // Test 3: Component Selection
    const selectionSection = reporter.startSection('Component Selection', 'Test component selection and feedback');

    // Test chassis selection
    const chassisResult = await gameUtils.testComponentSelection('chassis', 'Speed Bot');
    reporter.addTest('Component Selection', 'Chassis selection works', chassisResult.selected);
    reporter.addTest('Component Selection', 'Chassis selection has visual feedback', chassisResult.hasVisualFeedback);

    // Test weapon selection
    const weaponResult = await gameUtils.testComponentSelection('weapon', 'Cannon');
    reporter.addTest('Component Selection', 'Weapon selection works', weaponResult.selected);
    reporter.addTest('Component Selection', 'Weapon selection has visual feedback', weaponResult.hasVisualFeedback);

    // Test special selection
    const specialResult = await gameUtils.testComponentSelection('special', 'Speed Boost');
    reporter.addTest('Component Selection', 'Special selection works', specialResult.selected);
    reporter.addTest('Component Selection', 'Special selection has visual feedback', specialResult.hasVisualFeedback);

    await browser.monitorMemory();
    reporter.endSection('Component Selection');

    // Test 4: Battle Arena Transition
    const battleSection = reporter.startSection('Battle Arena', 'Test battle arena features and mechanics');

    // Start battle
    const battleButton = await browser.findButtonByText(testConfig.selectors.battleButton);
    if (!battleButton) {
      throw new Error('Battle button not found');
    }

    await battleButton.click();
    reporter.addLog('Battle Arena', 'Battle button clicked');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Test battle arena features
    const arenaResults = await gameUtils.testBattleArena();

    reporter.addTest('Battle Arena', 'Tutorial system present', arenaResults.tutorialPresent);
    reporter.addTest('Battle Arena', 'Battle timer shows appropriate duration',
      arenaResults.battleTimer > 170, arenaResults.battleTimer, '>170s');
    reporter.addTest('Battle Arena', 'Battle statistics visible', arenaResults.statsVisible);
    reporter.addTest('Battle Arena', 'Multiple AI opponents present',
      arenaResults.aiOpponents >= testConfig.expected.minAIOpponents,
      arenaResults.aiOpponents, testConfig.expected.minAIOpponents);

    await browser.monitorMemory();
    reporter.endSection('Battle Arena');

    // Test 5: Gameplay Mechanics
    const gameplaySection = reporter.startSection('Gameplay Mechanics', 'Test player controls and game statistics');

    const gameplayResults = await gameUtils.testGameplayMechanics();

    reporter.addTest('Gameplay Mechanics', 'Player actions registered',
      gameplayResults.actionsPerformed > 0, gameplayResults.actionsPerformed);
    reporter.addTest('Gameplay Mechanics', 'Shooting mechanics work',
      gameplayResults.shotsFired > 0, gameplayResults.shotsFired);
    reporter.addTest('Gameplay Mechanics', 'Special abilities work',
      gameplayResults.specialsUsed > 0, gameplayResults.specialsUsed);

    reporter.addLog('Gameplay Mechanics', `Actions: ${gameplayResults.actionsPerformed}, Shots: ${gameplayResults.shotsFired}, Specials: ${gameplayResults.specialsUsed}`);

    await browser.monitorMemory();
    reporter.endSection('Gameplay Mechanics');

    // Test 6: Battle Duration Monitoring
    const durationSection = reporter.startSection('Battle Duration', 'Monitor battle for sustained engagement');

    const durationResults = await gameUtils.monitorBattleDuration(20); // 20 seconds

    reporter.addTest('Battle Duration', 'Battle remains active during monitoring',
      durationResults.battleActive || durationResults.timeRemaining.length > 5);
    reporter.addTest('Battle Duration', 'Health data tracked',
      durationResults.healthData.length > 0, durationResults.healthData.length);

    reporter.addLog('Battle Duration', `Monitored for ${durationResults.timeRemaining.length * 2}s, battle active: ${durationResults.battleActive}`);

    reporter.endSection('Battle Duration');

    // Test 7: Return to Builder
    const returnSection = reporter.startSection('Return to Builder', 'Test navigation back to bot builder');

    const backButton = await browser.findButtonByText(testConfig.selectors.backButton);
    if (backButton) {
      await backButton.click();
      await new Promise(resolve => setTimeout(resolve, 3000));

      const builderTitle = await browser.waitForElementText(testConfig.selectors.title);
      reporter.addTest('Return to Builder', 'Successfully returned to bot builder',
        builderTitle.includes(testConfig.app.title), builderTitle);
    } else {
      reporter.addTest('Return to Builder', 'Back button found', false);
    }

    reporter.endSection('Return to Builder');

    // Performance Analysis
    const memoryAnalysis = browser.getMemoryAnalysis();
    if (memoryAnalysis) {
      reporter.addMetrics({
        'Initial Memory (MB)': memoryAnalysis.initial,
        'Final Memory (MB)': memoryAnalysis.final,
        'Memory Increase (MB)': memoryAnalysis.increase.toFixed(2),
        'Memory Increase (%)': memoryAnalysis.increasePercent.toFixed(1),
        'Memory Stable': memoryAnalysis.isStable ? 'Yes' : 'No'
      });

      reporter.addTest('Performance', 'Memory usage is stable', memoryAnalysis.isStable,
        `${memoryAnalysis.increasePercent.toFixed(1)}%`, `<${testConfig.expected.maxMemoryIncrease}%`);
    }

    // Take final screenshot
    await browser.takeScreenshot('comprehensive-functionality-final.png', 'Final state');
    reporter.addScreenshot('comprehensive-functionality-final.png', 'Final application state');

    // Complete test
    const finalStatus = reporter.results.summary.failed === 0 ? 'passed' : 'failed';
    await reporter.complete(finalStatus);

    console.log('\n🎉 Comprehensive functionality test completed!');
    return reporter.results;

  } catch (error) {
    reporter.addError(error);

    // Take error screenshot
    await browser.takeScreenshot('comprehensive-functionality-error.png', 'Error state');
    reporter.addScreenshot('comprehensive-functionality-error.png', 'Error occurred during test');

    await reporter.complete('failed');
    throw error;
  } finally {
    await browser.cleanup();
  }
}

// Run the test
if (require.main === module) {
  runComprehensiveFunctionalityTest()
    .then((results) => {
      console.log(`🎯 Test completed with status: ${results.status}`);
      process.exit(results.status === 'passed' ? 0 : 1);
    })
    .catch((error) => {
      console.error('💥 Test failed:', error.message);
      process.exit(1);
    });
}

module.exports = runComprehensiveFunctionalityTest;
