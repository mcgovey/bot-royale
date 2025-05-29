const puppeteer = require('puppeteer');

async function testUsabilityAndStickiness() {
  console.log('🎯 Starting Usability and Stickiness Test for BattleBot Arena...');

  let browser;
  let page;

  // Engagement metrics
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
    console.log(`📝 User Action: ${action}`);
  };

  try {
    browser = await puppeteer.launch({
      headless: false,
      defaultViewport: { width: 1920, height: 1080 },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    page = await browser.newPage();

    console.log('📱 Loading BattleBot Arena...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 30000 });

    // Test 1: First Impression and Onboarding
    console.log('\n🎨 Testing First Impression and Onboarding...');

    const builderStartTime = Date.now();

    // Check if the interface is immediately understandable
    const interfaceElements = await page.evaluate(() => {
      const elements = {
        title: document.querySelector('h1')?.textContent || '',
        subtitle: document.querySelector('p')?.textContent || '',
        visibleButtons: Array.from(document.querySelectorAll('button')).length,
        visibleOptions: Array.from(document.querySelectorAll('button'))
          .filter(btn => btn.textContent.includes('Bot') || btn.textContent.includes('Speed') || btn.textContent.includes('Tank'))
          .length
      };
      return elements;
    });

    console.log('📋 Interface Analysis:');
    console.log(`  Title: "${interfaceElements.title}"`);
    console.log(`  Subtitle: "${interfaceElements.subtitle}"`);
    console.log(`  Visible buttons: ${interfaceElements.visibleButtons}`);
    console.log(`  Bot options visible: ${interfaceElements.visibleOptions}`);

    if (interfaceElements.title.includes('Bot Builder')) {
      console.log('✅ Clear purpose immediately visible');
      trackAction('understood_purpose');
    }

    if (interfaceElements.visibleOptions >= 3) {
      console.log('✅ Bot customization options clearly visible');
      trackAction('options_visible');
    } else {
      console.log('⚠️ Bot options may not be clearly visible');
    }

    // Test 2: Option Readability and Selection Feedback
    console.log('\n👁️ Testing Option Readability...');

    // Test readability of unselected options
    const optionReadability = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'))
        .filter(btn => btn.textContent.includes('Speed Bot') || btn.textContent.includes('Tank Bot') || btn.textContent.includes('Balanced Bot'));

      return buttons.map(btn => {
        const style = window.getComputedStyle(btn);
        const textElements = btn.querySelectorAll('p');

        // Calculate contrast ratio (simplified)
        const bgColor = style.backgroundColor;
        const textColor = textElements.length > 0 ? window.getComputedStyle(textElements[0]).color : style.color;

        return {
          text: btn.textContent.split('\n')[0],
          backgroundColor: bgColor,
          textColor: textColor,
          borderColor: style.borderColor,
          isReadable: textColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'rgba(0, 0, 0, 0)'
        };
      });
    });

    console.log('📖 Option Readability Analysis:');
    optionReadability.forEach((option, index) => {
      console.log(`  ${index + 1}. ${option.text}`);
      console.log(`     Text Color: ${option.textColor}`);
      console.log(`     Background: ${option.backgroundColor}`);
      console.log(`     Border: ${option.borderColor}`);
      console.log(`     Readable: ${option.isReadable ? '✅' : '❌'}`);
    });

    const readableOptions = optionReadability.filter(opt => opt.isReadable).length;
    if (readableOptions >= 3) {
      console.log('✅ All options are readable before selection');
      trackAction('options_readable');
    } else {
      console.log('⚠️ Some options may be hard to read');
    }

    // Test selection feedback
    console.log('\n🎯 Testing Selection Feedback...');

    const chassisButton = await page.evaluateHandle(() => {
      return Array.from(document.querySelectorAll('button'))
        .find(btn => btn.textContent.includes('Speed Bot'));
    });

    if (chassisButton) {
      await chassisButton.click();
      trackAction('selected_chassis');
      engagementMetrics.componentChanges++;
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check visual feedback
      const selectionFeedback = await page.evaluate(() => {
        const speedButton = Array.from(document.querySelectorAll('button'))
          .find(btn => btn.textContent.includes('Speed Bot'));

        if (speedButton) {
          const style = window.getComputedStyle(speedButton);
          return {
            hasCheckmark: speedButton.textContent.includes('✓'),
            borderChanged: style.borderColor !== 'rgb(107, 114, 128)', // gray-500
            backgroundChanged: style.backgroundColor !== 'rgba(0, 0, 0, 0)',
            hasGlow: style.boxShadow !== 'none'
          };
        }
        return null;
      });

      console.log('🔍 Selection Feedback Analysis:', selectionFeedback);

      if (selectionFeedback && (selectionFeedback.hasCheckmark || selectionFeedback.borderChanged || selectionFeedback.hasGlow)) {
        console.log('✅ Clear visual feedback on selection');
        trackAction('clear_selection_feedback');
      } else {
        console.log('⚠️ Selection feedback could be improved');
      }
    }

    // Test weapon selection for engagement
    const weaponButton = await page.evaluateHandle(() => {
      return Array.from(document.querySelectorAll('button'))
        .find(btn => btn.textContent.includes('Cannon'));
    });

    if (weaponButton) {
      await weaponButton.click();
      trackAction('selected_weapon');
      engagementMetrics.componentChanges++;
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Test special selection
    const specialButton = await page.evaluateHandle(() => {
      return Array.from(document.querySelectorAll('button'))
        .find(btn => btn.textContent.includes('Speed Boost'));
    });

    if (specialButton) {
      await specialButton.click();
      trackAction('selected_special');
      engagementMetrics.componentChanges++;
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    engagementMetrics.timeSpentInBuilder = Date.now() - builderStartTime;

    // Test 3: Battle Engagement and Tutorial
    console.log('\n⚔️ Testing Battle Engagement...');

    const battleButton = await page.evaluateHandle(() => {
      return Array.from(document.querySelectorAll('button'))
        .find(btn => btn.textContent.includes('Battle'));
    });

    if (battleButton) {
      const battleStartTime = Date.now();
      await battleButton.click();
      trackAction('started_battle');
      engagementMetrics.battleAttempts++;
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Check for tutorial
      const tutorialPresent = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('*'))
          .some(el => el.textContent && el.textContent.includes('Battle Tutorial'));
      });

      if (tutorialPresent) {
        console.log('✅ Tutorial system present');
        engagementMetrics.tutorialInteraction = true;
        trackAction('tutorial_shown');

        // Interact with tutorial
        const startBattleBtn = await page.evaluateHandle(() => {
          return Array.from(document.querySelectorAll('button'))
            .find(btn => btn.textContent.includes('Start Battle'));
        });

        if (startBattleBtn) {
          await startBattleBtn.click();
          trackAction('tutorial_dismissed');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      // Test 4: Battle Statistics and Feedback
      console.log('\n📊 Testing Battle Statistics and Feedback...');

      // Check for stats panel
      const statsPresent = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('*'))
          .some(el => el.textContent && el.textContent.includes('Your Stats'));
      });

      if (statsPresent) {
        console.log('✅ Battle statistics panel found');
        engagementMetrics.statsViewed = true;
        trackAction('stats_visible');
      }

      // Test gameplay engagement
      console.log('\n🎮 Testing Gameplay Engagement...');

      // Simulate active gameplay
      const gameplayActions = [
        { key: 'KeyW', duration: 1000, action: 'move_forward' },
        { key: 'Space', duration: 100, action: 'shoot' },
        { key: 'KeyA', duration: 800, action: 'move_left' },
        { key: 'Space', duration: 100, action: 'shoot' },
        { key: 'KeyE', duration: 100, action: 'special_ability' },
        { key: 'KeyD', duration: 1000, action: 'move_right' },
        { key: 'Space', duration: 100, action: 'shoot' }
      ];

      for (const gameAction of gameplayActions) {
        await page.keyboard.down(gameAction.key);
        await new Promise(resolve => setTimeout(resolve, gameAction.duration));
        await page.keyboard.up(gameAction.key);
        trackAction(gameAction.action);

        if (gameAction.action === 'special_ability') {
          engagementMetrics.specialAbilitiesUsed++;
        }

        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Check if stats updated
      const statsAfterGameplay = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll('*'));
        const stats = {};

        for (let el of elements) {
          if (el.textContent && el.textContent.includes('Shots')) {
            const parent = el.parentElement;
            if (parent) {
              const numberEl = parent.querySelector('*');
              if (numberEl && /^\d+$/.test(numberEl.textContent.trim())) {
                stats.shots = parseInt(numberEl.textContent.trim());
              }
            }
          }
          if (el.textContent && el.textContent.includes('Damage')) {
            const parent = el.parentElement;
            if (parent) {
              const numberEl = parent.querySelector('*');
              if (numberEl && /^\d+$/.test(numberEl.textContent.trim())) {
                stats.damage = parseInt(numberEl.textContent.trim());
              }
            }
          }
          if (el.textContent && el.textContent.includes('Specials')) {
            const parent = el.parentElement;
            if (parent) {
              const numberEl = parent.querySelector('*');
              if (numberEl && /^\d+$/.test(numberEl.textContent.trim())) {
                stats.specials = parseInt(numberEl.textContent.trim());
              }
            }
          }
        }

        return stats;
      });

      console.log('📈 Gameplay Stats:', statsAfterGameplay);

      if (statsAfterGameplay.shots > 0) {
        console.log('✅ Shooting mechanics working and tracked');
        trackAction('successful_shooting');
      }

      if (statsAfterGameplay.specials > 0) {
        console.log('✅ Special abilities working and tracked');
        trackAction('successful_special');
      }

      // Test 5: Battle Duration and Engagement
      console.log('\n⏱️ Testing Battle Duration...');

      // Monitor battle for engagement
      let battleActive = true;
      let monitoringTime = 0;
      const maxMonitorTime = 20000; // 20 seconds

      while (battleActive && monitoringTime < maxMonitorTime) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        monitoringTime += 2000;

        const battleTimeRemaining = await page.evaluate(() => {
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
          battleActive = false;
          console.log('⚠️ Battle ended during monitoring');
        } else {
          console.log(`  Battle time remaining: ${battleTimeRemaining}s`);

          // Occasionally interact to maintain engagement
          if (monitoringTime % 6000 === 0) {
            await page.keyboard.press('Space');
            trackAction('continued_engagement');
          }
        }
      }

      if (battleActive) {
        console.log('✅ Battle duration is engaging (still active after 20s)');
        trackAction('sustained_engagement');
      }

      engagementMetrics.timeSpentInBattle = Date.now() - battleStartTime;
    }

    // Test 6: Stickiness Factors
    console.log('\n🎯 Analyzing Stickiness Factors...');

    const stickinessScore = calculateStickinessScore(engagementMetrics);
    console.log('\n📊 Engagement Analysis:');
    console.log(`  Time in Builder: ${(engagementMetrics.timeSpentInBuilder / 1000).toFixed(1)}s`);
    console.log(`  Time in Battle: ${(engagementMetrics.timeSpentInBattle / 1000).toFixed(1)}s`);
    console.log(`  Component Changes: ${engagementMetrics.componentChanges}`);
    console.log(`  Battle Attempts: ${engagementMetrics.battleAttempts}`);
    console.log(`  Tutorial Interaction: ${engagementMetrics.tutorialInteraction ? '✅' : '❌'}`);
    console.log(`  Stats Viewed: ${engagementMetrics.statsViewed ? '✅' : '❌'}`);
    console.log(`  Special Abilities Used: ${engagementMetrics.specialAbilitiesUsed}`);
    console.log(`  Total User Actions: ${engagementMetrics.userActions.length}`);
    console.log(`  Stickiness Score: ${stickinessScore}/100`);

    // Provide recommendations
    console.log('\n💡 Usability Recommendations:');

    if (stickinessScore >= 80) {
      console.log('🎉 Excellent user engagement and stickiness!');
    } else if (stickinessScore >= 60) {
      console.log('👍 Good engagement with room for improvement');
    } else {
      console.log('⚠️ User engagement needs improvement');
    }

    if (engagementMetrics.componentChanges < 2) {
      console.log('  - Encourage more bot customization');
    }

    if (!engagementMetrics.tutorialInteraction) {
      console.log('  - Tutorial system needs to be more prominent');
    }

    if (engagementMetrics.specialAbilitiesUsed === 0) {
      console.log('  - Special abilities need better explanation/encouragement');
    }

    // Take final screenshot
    await page.screenshot({ path: 'test-usability-stickiness.png', fullPage: true });
    console.log('📸 Screenshot saved as test-usability-stickiness.png');

    console.log('\n🎯 Usability and Stickiness Test Completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);

    if (page) {
      await page.screenshot({ path: 'test-usability-error.png', fullPage: true });
      console.log('📸 Error screenshot saved');
    }

    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

function calculateStickinessScore(metrics) {
  let score = 0;

  // Time engagement (30 points max)
  const totalTime = metrics.timeSpentInBuilder + metrics.timeSpentInBattle;
  score += Math.min(30, (totalTime / 60000) * 30); // 30 points for 1+ minute

  // Customization engagement (20 points max)
  score += Math.min(20, metrics.componentChanges * 7); // 7 points per component change

  // Battle engagement (20 points max)
  score += metrics.battleAttempts * 10; // 10 points per battle
  score += metrics.specialAbilitiesUsed * 5; // 5 points per special

  // Learning engagement (15 points max)
  if (metrics.tutorialInteraction) score += 10;
  if (metrics.statsViewed) score += 5;

  // Activity level (15 points max)
  score += Math.min(15, metrics.userActions.length * 1); // 1 point per action

  return Math.min(100, Math.round(score));
}

// Run the test
if (require.main === module) {
  testUsabilityAndStickiness()
    .then(() => {
      console.log('🎯 Usability and Stickiness test completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Usability test failed:', error);
      process.exit(1);
    });
}

module.exports = testUsabilityAndStickiness;
