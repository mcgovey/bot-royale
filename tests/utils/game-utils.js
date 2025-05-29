/**
 * Game Utilities
 * BattleBot Arena specific test utilities
 */

const testConfig = require('../config/test.config');

class GameUtils {
  constructor(browserUtils) {
    this.browser = browserUtils;
  }

  /**
   * Test bot builder visibility and readability
   */
  async testBotBuilderVisibility() {
    const results = {
      optionsVisible: 0,
      readableOptions: 0,
      optionDetails: []
    };

    // Check chassis options visibility
    const chassisOptions = await this.browser.page.$$eval('button', buttons => {
      return buttons
        .filter(btn => btn.textContent.includes('Speed Bot') || btn.textContent.includes('Tank Bot') || btn.textContent.includes('Balanced Bot'))
        .map(btn => {
          const style = window.getComputedStyle(btn);
          const textElements = btn.querySelectorAll('p');
          return {
            text: btn.textContent.split('\n')[0],
            backgroundColor: style.backgroundColor,
            borderColor: style.borderColor,
            textVisibility: Array.from(textElements).map(p => {
              const pStyle = window.getComputedStyle(p);
              return {
                content: p.textContent,
                color: pStyle.color,
                opacity: pStyle.opacity
              };
            }),
            isReadable: style.color !== 'rgba(0, 0, 0, 0)' && style.backgroundColor !== 'rgba(0, 0, 0, 0)'
          };
        });
    });

    results.optionsVisible = chassisOptions.length;
    results.readableOptions = chassisOptions.filter(opt => opt.isReadable).length;
    results.optionDetails = chassisOptions;

    return results;
  }

  /**
   * Test component selection and feedback
   */
  async testComponentSelection(componentType, componentName) {
    const button = await this.browser.findButtonByText(componentName);

    if (!button) {
      throw new Error(`${componentName} button not found`);
    }

    await button.click();
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check visual feedback
    const feedback = await this.browser.page.evaluate((name) => {
      const selectedButton = Array.from(document.querySelectorAll('button'))
        .find(btn => btn.textContent.includes(name));

      if (selectedButton) {
        const style = window.getComputedStyle(selectedButton);
        return {
          hasCheckmark: selectedButton.textContent.includes('✓'),
          borderChanged: style.borderColor !== 'rgb(107, 114, 128)', // gray-500
          backgroundChanged: style.backgroundColor !== 'rgba(0, 0, 0, 0)',
          hasGlow: style.boxShadow !== 'none'
        };
      }
      return null;
    }, componentName);

    return {
      selected: true,
      feedback,
      hasVisualFeedback: feedback && (feedback.hasCheckmark || feedback.borderChanged || feedback.hasGlow)
    };
  }

  /**
   * Test battle arena features
   */
  async testBattleArena() {
    const results = {
      tutorialPresent: false,
      battleTimer: null,
      statsVisible: false,
      aiOpponents: 0
    };

    // Check for tutorial
    results.tutorialPresent = await this.browser.elementContainsText('Battle Tutorial');

    if (results.tutorialPresent) {
      const tutorialButton = await this.browser.findButtonByText(testConfig.selectors.tutorialButton);
      if (tutorialButton) {
        await tutorialButton.click();
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Check battle timer
    const battleTime = await this.browser.page.evaluate(() => {
      const timeElements = Array.from(document.querySelectorAll('*'))
        .filter(el => el.textContent && el.textContent.includes('Time:'));
      if (timeElements.length > 0) {
        const timeText = timeElements[0].textContent;
        const match = timeText.match(/Time:\s*(\d+)s/);
        return match ? parseInt(match[1]) : null;
      }
      return null;
    });

    results.battleTimer = battleTime;

    // Check for battle statistics
    results.statsVisible = await this.browser.elementContainsText('Your Stats');

    // Check AI opponents
    const aiCount = await this.browser.page.evaluate(() => {
      const botElements = Array.from(document.querySelectorAll('*'))
        .filter(el => el.textContent && (
          el.textContent.includes('Speedster') ||
          el.textContent.includes('Guardian') ||
          el.textContent.includes('Tactician')
        ));
      return new Set(botElements.map(el => el.textContent)).size;
    });

    results.aiOpponents = aiCount;

    return results;
  }

  /**
   * Test gameplay mechanics and statistics
   */
  async testGameplayMechanics() {
    const results = {
      shotsFired: 0,
      specialsUsed: 0,
      damageDealt: 0,
      actionsPerformed: 0
    };

    // Simulate gameplay
    const actions = await this.browser.simulateGameplay();
    results.actionsPerformed = actions.length;

    // Wait for stats to update
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check updated statistics
    const stats = await this.browser.page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      const gameStats = {};

      for (let el of elements) {
        if (el.textContent && el.textContent.includes('Shots')) {
          const parent = el.parentElement;
          if (parent) {
            const numberEl = parent.querySelector('*');
            if (numberEl && /^\d+$/.test(numberEl.textContent.trim())) {
              gameStats.shots = parseInt(numberEl.textContent.trim());
            }
          }
        }
        if (el.textContent && el.textContent.includes('Damage')) {
          const parent = el.parentElement;
          if (parent) {
            const numberEl = parent.querySelector('*');
            if (numberEl && /^\d+$/.test(numberEl.textContent.trim())) {
              gameStats.damage = parseInt(numberEl.textContent.trim());
            }
          }
        }
        if (el.textContent && el.textContent.includes('Specials')) {
          const parent = el.parentElement;
          if (parent) {
            const numberEl = parent.querySelector('*');
            if (numberEl && /^\d+$/.test(numberEl.textContent.trim())) {
              gameStats.specials = parseInt(numberEl.textContent.trim());
            }
          }
        }
      }

      return gameStats;
    });

    results.shotsFired = stats.shots || 0;
    results.specialsUsed = stats.specials || 0;
    results.damageDealt = stats.damage || 0;

    return results;
  }

  /**
   * Monitor battle duration and activity
   */
  async monitorBattleDuration(durationSeconds = 30) {
    const results = {
      battleActive: true,
      timeRemaining: [],
      healthData: []
    };

    const startTime = Date.now();
    let monitoringTime = 0;
    const maxMonitorTime = durationSeconds * 1000;

    while (results.battleActive && monitoringTime < maxMonitorTime) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      monitoringTime += 2000;

      const battleTimeRemaining = await this.browser.page.evaluate(() => {
        const timeElements = Array.from(document.querySelectorAll('*'))
          .filter(el => el.textContent && el.textContent.includes('Time:'));
        if (timeElements.length > 0) {
          const timeText = timeElements[0].textContent;
          const match = timeText.match(/Time:\s*(\d+)s/);
          return match ? parseInt(match[1]) : null;
        }
        return null;
      });

      if (battleTimeRemaining === null) {
        results.battleActive = false;
        break;
      }

      results.timeRemaining.push(battleTimeRemaining);

      // Get health data
      const healthData = await this.browser.page.evaluate(() => {
        return Array.from(document.querySelectorAll('*'))
          .filter(el => el.textContent && el.textContent.includes('HP'))
          .map(el => el.textContent);
      });

      results.healthData.push(healthData);

      // Occasionally interact to maintain engagement
      if (monitoringTime % 6000 === 0) {
        await this.browser.page.keyboard.press('Space');
      }
    }

    return results;
  }

  /**
   * Calculate engagement metrics
   */
  calculateEngagementMetrics(metrics) {
    let score = 0;

    // Time engagement (30 points max)
    const totalTime = (metrics.timeSpentInBuilder || 0) + (metrics.timeSpentInBattle || 0);
    score += Math.min(30, (totalTime / 60000) * 30); // 30 points for 1+ minute

    // Customization engagement (20 points max)
    score += Math.min(20, (metrics.componentChanges || 0) * 7); // 7 points per component change

    // Battle engagement (20 points max)
    score += (metrics.battleAttempts || 0) * 10; // 10 points per battle
    score += (metrics.specialAbilitiesUsed || 0) * 5; // 5 points per special

    // Learning engagement (15 points max)
    if (metrics.tutorialInteraction) score += 10;
    if (metrics.statsViewed) score += 5;

    // Activity level (15 points max)
    score += Math.min(15, (metrics.userActions?.length || 0) * 1); // 1 point per action

    return Math.min(100, Math.round(score));
  }

  /**
   * Validate test expectations
   */
  validateExpectations(results) {
    const validation = {
      passed: 0,
      failed: 0,
      details: []
    };

    const checks = [
      {
        name: 'Bot options visible',
        condition: results.optionsVisible >= testConfig.expected.minReadableOptions,
        value: results.optionsVisible
      },
      {
        name: 'Battle duration appropriate',
        condition: results.battleTimer > 170,
        value: results.battleTimer
      },
      {
        name: 'AI opponents present',
        condition: results.aiOpponents >= testConfig.expected.minAIOpponents,
        value: results.aiOpponents
      },
      {
        name: 'Tutorial system working',
        condition: results.tutorialPresent === true,
        value: results.tutorialPresent
      },
      {
        name: 'Statistics visible',
        condition: results.statsVisible === true,
        value: results.statsVisible
      }
    ];

    checks.forEach(check => {
      if (check.condition) {
        validation.passed++;
      } else {
        validation.failed++;
      }
      validation.details.push(check);
    });

    return validation;
  }
}

module.exports = GameUtils;
