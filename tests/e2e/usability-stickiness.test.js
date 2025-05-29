/**
 * Usability and Stickiness Test
 * Tests user engagement, usability, and stickiness factors
 */

const BrowserUtils = require('../utils/browser-utils');
const GameUtils = require('../utils/game-utils');
const TestReporter = require('../utils/test-reporter');
const testConfig = require('../config/test.config');

async function runUsabilityAndStickinessTest() {
  const reporter = new TestReporter('usability-stickiness');
  const browser = new BrowserUtils();
  let gameUtils;

  // Engagement tracking
  const engagementMetrics = {
    timeSpentInBuilder: 0,
    timeSpentInBattle: 0,
    componentChanges: 0,
    battleAttempts: 0,
    tutorialInteraction: false,
    statsViewed: false,
    specialAbilitiesUsed: 0,
    userActions: []
  };

  const trackAction = (action) => {
    engagementMetrics.userActions.push({
      action,
      timestamp: Date.now()
    });
    reporter.addLog('User Engagement', `Action: ${action}`);
  };

  try {
    // Initialize browser
    await browser.launchBrowser();
    gameUtils = new GameUtils(browser);

    // Test 1: First Impression and Onboarding
    const impressionSection = reporter.startSection('First Impression', 'Test initial user experience and clarity');

    const builderStartTime = Date.now();
    await browser.navigateToApp();

    // Check interface clarity
    const interfaceElements = await browser.page.evaluate(() => {
      return {
        title: document.querySelector('h1')?.textContent || '',
        subtitle: document.querySelector('p')?.textContent || '',
        visibleButtons: Array.from(document.querySelectorAll('button')).length,
        visibleOptions: Array.from(document.querySelectorAll('button'))
          .filter(btn => btn.textContent.includes('Bot') || btn.textContent.includes('Speed') || btn.textContent.includes('Tank'))
          .length
      };
    });

    reporter.addTest('First Impression', 'Purpose immediately clear',
      interfaceElements.title.includes('Bot Builder'), interfaceElements.title);
    reporter.addTest('First Impression', 'Options clearly visible',
      interfaceElements.visibleOptions >= 3, interfaceElements.visibleOptions, '>=3');

    if (interfaceElements.title.includes('Bot Builder')) {
      trackAction('understood_purpose');
    }
    if (interfaceElements.visibleOptions >= 3) {
      trackAction('options_visible');
    }

    reporter.endSection('First Impression');

    // Test 2: Option Readability
    const readabilitySection = reporter.startSection('Option Readability', 'Test readability before selection');

    const visibilityResults = await gameUtils.testBotBuilderVisibility();

    reporter.addTest('Option Readability', 'All options readable before selection',
      visibilityResults.readableOptions >= testConfig.expected.minReadableOptions,
      `${visibilityResults.readableOptions}/${visibilityResults.optionsVisible}`,
      `${testConfig.expected.minReadableOptions}/${testConfig.expected.minReadableOptions}`);

    // Log detailed readability analysis
    visibilityResults.optionDetails.forEach((option, index) => {
      reporter.addLog('Option Readability',
        `Option ${index + 1}: ${option.text} - Readable: ${option.isReadable ? 'Yes' : 'No'}`);
    });

    if (visibilityResults.readableOptions >= testConfig.expected.minReadableOptions) {
      trackAction('options_readable');
    }

    reporter.endSection('Option Readability');

    // Test 3: Selection Feedback and Engagement
    const selectionSection = reporter.startSection('Selection Feedback', 'Test visual feedback and user engagement');

    // Test multiple component selections for engagement
    const components = [
      { type: 'chassis', name: 'Speed Bot' },
      { type: 'weapon', name: 'Cannon' },
      { type: 'special', name: 'Speed Boost' }
    ];

    for (const component of components) {
      const result = await gameUtils.testComponentSelection(component.type, component.name);

      reporter.addTest('Selection Feedback', `${component.type} selection feedback`,
        result.hasVisualFeedback, result.hasVisualFeedback ? 'Clear feedback' : 'No clear feedback');

      if (result.selected) {
        trackAction(`selected_${component.type}`);
        engagementMetrics.componentChanges++;
      }
    }

    engagementMetrics.timeSpentInBuilder = Date.now() - builderStartTime;
    reporter.endSection('Selection Feedback');

    // Test 4: Battle Engagement
    const battleSection = reporter.startSection('Battle Engagement', 'Test battle features and tutorial');

    const battleStartTime = Date.now();

    // Start battle
    const battleButton = await browser.findButtonByText(testConfig.selectors.battleButton);
    if (battleButton) {
      await battleButton.click();
      trackAction('started_battle');
      engagementMetrics.battleAttempts++;
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Test battle features
      const arenaResults = await gameUtils.testBattleArena();

      reporter.addTest('Battle Engagement', 'Tutorial system present', arenaResults.tutorialPresent);
      reporter.addTest('Battle Engagement', 'Battle statistics visible', arenaResults.statsVisible);
      reporter.addTest('Battle Engagement', 'Appropriate battle duration',
        arenaResults.battleTimer > 170, `${arenaResults.battleTimer}s`, '>170s');

      if (arenaResults.tutorialPresent) {
        engagementMetrics.tutorialInteraction = true;
        trackAction('tutorial_shown');
      }
      if (arenaResults.statsVisible) {
        engagementMetrics.statsViewed = true;
        trackAction('stats_visible');
      }

      // Test gameplay engagement
      const gameplayResults = await gameUtils.testGameplayMechanics();

      reporter.addTest('Battle Engagement', 'Gameplay mechanics responsive',
        gameplayResults.actionsPerformed > 0, gameplayResults.actionsPerformed);
      reporter.addTest('Battle Engagement', 'Statistics tracking works',
        gameplayResults.shotsFired > 0 || gameplayResults.specialsUsed > 0);

      engagementMetrics.specialAbilitiesUsed = gameplayResults.specialsUsed;

      // Track successful interactions
      if (gameplayResults.shotsFired > 0) {
        trackAction('successful_shooting');
      }
      if (gameplayResults.specialsUsed > 0) {
        trackAction('successful_special');
      }

      engagementMetrics.timeSpentInBattle = Date.now() - battleStartTime;
    } else {
      reporter.addTest('Battle Engagement', 'Battle button accessible', false);
    }

    reporter.endSection('Battle Engagement');

    // Test 5: Sustained Engagement
    const sustainedSection = reporter.startSection('Sustained Engagement', 'Test longer-term engagement');

    // Monitor battle for sustained engagement
    const durationResults = await gameUtils.monitorBattleDuration(15); // 15 seconds

    reporter.addTest('Sustained Engagement', 'Battle maintains user interest',
      durationResults.battleActive || durationResults.timeRemaining.length > 3);
    reporter.addTest('Sustained Engagement', 'Continuous interaction possible',
      durationResults.timeRemaining.length > 0, durationResults.timeRemaining.length);

    if (durationResults.battleActive) {
      trackAction('sustained_engagement');
    }

    reporter.endSection('Sustained Engagement');

    // Test 6: Stickiness Analysis
    const stickinessSection = reporter.startSection('Stickiness Analysis', 'Calculate engagement score');

    const stickinessScore = gameUtils.calculateEngagementMetrics(engagementMetrics);

    reporter.addTest('Stickiness Analysis', 'High engagement score',
      stickinessScore >= testConfig.expected.minStickinessScore,
      `${stickinessScore}/100`, `>=${testConfig.expected.minStickinessScore}/100`);

    // Detailed engagement metrics
    reporter.addMetrics({
      'Stickiness Score': `${stickinessScore}/100`,
      'Time in Builder (s)': (engagementMetrics.timeSpentInBuilder / 1000).toFixed(1),
      'Time in Battle (s)': (engagementMetrics.timeSpentInBattle / 1000).toFixed(1),
      'Component Changes': engagementMetrics.componentChanges,
      'Battle Attempts': engagementMetrics.battleAttempts,
      'Tutorial Interaction': engagementMetrics.tutorialInteraction ? 'Yes' : 'No',
      'Stats Viewed': engagementMetrics.statsViewed ? 'Yes' : 'No',
      'Special Abilities Used': engagementMetrics.specialAbilitiesUsed,
      'Total User Actions': engagementMetrics.userActions.length
    });

    // Provide recommendations
    const recommendations = [];
    if (engagementMetrics.componentChanges < 2) {
      recommendations.push('Encourage more bot customization');
    }
    if (!engagementMetrics.tutorialInteraction) {
      recommendations.push('Make tutorial system more prominent');
    }
    if (engagementMetrics.specialAbilitiesUsed === 0) {
      recommendations.push('Better explain special abilities');
    }
    if (stickinessScore < 80) {
      recommendations.push('Improve overall user engagement');
    }

    recommendations.forEach(rec => {
      reporter.addLog('Stickiness Analysis', `Recommendation: ${rec}`, 'warning');
    });

    reporter.endSection('Stickiness Analysis');

    // Test 7: Usability Validation
    const usabilitySection = reporter.startSection('Usability Validation', 'Validate against usability criteria');

    const usabilityResults = {
      optionsVisible: visibilityResults.optionsVisible,
      readableOptions: visibilityResults.readableOptions,
      battleTimer: arenaResults?.battleTimer || 0,
      aiOpponents: arenaResults?.aiOpponents || 0,
      tutorialPresent: engagementMetrics.tutorialInteraction,
      statsVisible: engagementMetrics.statsViewed
    };

    const validation = gameUtils.validateExpectations(usabilityResults);

    reporter.addTest('Usability Validation', 'Meets usability criteria',
      validation.failed === 0, `${validation.passed}/${validation.passed + validation.failed} passed`);

    validation.details.forEach(check => {
      reporter.addTest('Usability Validation', check.name, check.condition, check.value);
    });

    reporter.endSection('Usability Validation');

    // Take final screenshot
    await browser.takeScreenshot('usability-stickiness-final.png', 'Final state');
    reporter.addScreenshot('usability-stickiness-final.png', 'Final application state');

    // Complete test
    const finalStatus = reporter.results.summary.failed === 0 ? 'passed' : 'failed';
    await reporter.complete(finalStatus);

    console.log('\n🎯 Usability and stickiness test completed!');

    // Final engagement summary
    console.log('\n📊 Final Engagement Summary:');
    console.log(`  Stickiness Score: ${stickinessScore}/100`);
    console.log(`  Rating: ${stickinessScore >= 80 ? '🎉 Excellent' : stickinessScore >= 60 ? '👍 Good' : '⚠️ Needs Improvement'}`);

    return reporter.results;

  } catch (error) {
    reporter.addError(error);

    // Take error screenshot
    await browser.takeScreenshot('usability-stickiness-error.png', 'Error state');
    reporter.addScreenshot('usability-stickiness-error.png', 'Error occurred during test');

    await reporter.complete('failed');
    throw error;
  } finally {
    await browser.cleanup();
  }
}

// Run the test
if (require.main === module) {
  runUsabilityAndStickinessTest()
    .then((results) => {
      console.log(`🎯 Test completed with status: ${results.status}`);
      process.exit(results.status === 'passed' ? 0 : 1);
    })
    .catch((error) => {
      console.error('💥 Test failed:', error.message);
      process.exit(1);
    });
}

module.exports = runUsabilityAndStickinessTest;
