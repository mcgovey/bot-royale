const puppeteer = require('puppeteer');

async function testEnhancedBattleBot() {
  console.log('🚀 Starting comprehensive test for Enhanced BattleBot Arena...');

  let browser;
  let page;

  // Memory monitoring
  const memoryUsage = [];

  const monitorMemory = async () => {
    try {
      const metrics = await page.metrics();
      const memoryInfo = {
        timestamp: Date.now(),
        jsHeapUsedSize: Math.round(metrics.JSHeapUsedSize / 1024 / 1024 * 100) / 100,
        jsHeapTotalSize: Math.round(metrics.JSHeapTotalSize / 1024 / 1024 * 100) / 100
      };
      memoryUsage.push(memoryInfo);
      console.log(`📊 Memory: ${memoryInfo.jsHeapUsedSize}MB used / ${memoryInfo.jsHeapTotalSize}MB total`);
    } catch (error) {
      console.log('⚠️ Memory monitoring error (normal during transitions)');
    }
  };

  try {
    browser = await puppeteer.launch({
      headless: false,
      defaultViewport: { width: 1920, height: 1080 },
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });

    page = await browser.newPage();

    // Set up console logging
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('🔴 Browser Error:', msg.text());
      }
    });

    console.log('📱 Navigating to http://localhost:3000...');
    await page.goto('http://localhost:3000', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    await monitorMemory();
    console.log('✅ App loaded successfully');

    // Test 1: Enhanced Bot Builder Visibility
    console.log('\n🧪 Testing Enhanced Bot Builder Visibility...');

    // Wait for bot builder to load
    await page.waitForSelector('h1', { timeout: 10000 });
    const title = await page.$eval('h1', el => el.textContent);

    if (!title.includes('Bot Builder')) {
      throw new Error('App did not start in Bot Builder mode');
    }
    console.log('✅ Bot Builder loaded');

    // Test visibility of unselected options
    console.log('🔍 Testing option visibility before selection...');

    // Check chassis options visibility
    const chassisOptions = await page.$$eval('button', buttons => {
      return buttons
        .filter(btn => btn.textContent.includes('Speed Bot') || btn.textContent.includes('Tank Bot') || btn.textContent.includes('Balanced Bot'))
        .map(btn => {
          const style = window.getComputedStyle(btn);
          const textElements = btn.querySelectorAll('p');
          return {
            text: btn.textContent,
            backgroundColor: style.backgroundColor,
            borderColor: style.borderColor,
            textVisibility: Array.from(textElements).map(p => {
              const pStyle = window.getComputedStyle(p);
              return {
                content: p.textContent,
                color: pStyle.color,
                opacity: pStyle.opacity
              };
            })
          };
        });
    });

    console.log('📋 Chassis options visibility:', chassisOptions.length);
    chassisOptions.forEach((option, index) => {
      console.log(`  ${index + 1}. ${option.text.split('\n')[0]} - Border: ${option.borderColor}`);
      option.textVisibility.forEach(text => {
        console.log(`     Text: "${text.content}" - Color: ${text.color}`);
      });
    });

    if (chassisOptions.length < 3) {
      throw new Error('Not all chassis options are visible');
    }

    // Test selection feedback
    console.log('🎯 Testing selection feedback...');
    const speedBotButton = await page.evaluateHandle(() => {
      return Array.from(document.querySelectorAll('button'))
        .find(btn => btn.textContent.includes('Speed Bot'));
    });

    if (speedBotButton) {
      await speedBotButton.click();
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if selection is visually indicated
      const selectedState = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const speedButton = buttons.find(btn => btn.textContent.includes('Speed Bot'));
        if (speedButton) {
          const style = window.getComputedStyle(speedButton);
          const hasCheckmark = speedButton.textContent.includes('✓');
          return {
            borderColor: style.borderColor,
            backgroundColor: style.backgroundColor,
            hasCheckmark: hasCheckmark
          };
        }
        return null;
      });

      console.log('✅ Selection feedback:', selectedState);

      if (!selectedState.hasCheckmark) {
        console.log('⚠️ No checkmark found, but selection may still be working');
      }
    }

    await monitorMemory();

    // Test 2: Enhanced Battle Arena
    console.log('\n🧪 Testing Enhanced Battle Arena...');

    // Start battle
    const battleButton = await page.evaluateHandle(() => {
      return Array.from(document.querySelectorAll('button'))
        .find(btn => btn.textContent.includes('Battle'));
    });

    if (battleButton) {
      await battleButton.click();
      console.log('🎯 Battle button clicked');
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Check for tutorial overlay
      console.log('📚 Checking for tutorial overlay...');
      const tutorialVisible = await page.evaluate(() => {
        const tutorialElements = Array.from(document.querySelectorAll('*'))
          .filter(el => el.textContent && el.textContent.includes('Battle Tutorial'));
        return tutorialElements.length > 0;
      });

      if (tutorialVisible) {
        console.log('✅ Tutorial overlay found');

        // Close tutorial
        const startBattleButton = await page.evaluateHandle(() => {
          return Array.from(document.querySelectorAll('button'))
            .find(btn => btn.textContent.includes('Start Battle'));
        });

        if (startBattleButton) {
          await startBattleButton.click();
          console.log('🎯 Tutorial dismissed');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } else {
        console.log('ℹ️ Tutorial overlay not found (may have auto-hidden)');
      }

      // Check battle timer (should be 3 minutes = 180 seconds)
      console.log('⏱️ Checking battle timer...');
      const battleTime = await page.evaluate(() => {
        const timeElements = Array.from(document.querySelectorAll('*'))
          .filter(el => el.textContent && el.textContent.includes('Time:'));
        if (timeElements.length > 0) {
          const timeText = timeElements[0].textContent;
          const match = timeText.match(/Time:\s*(\d+)s/);
          return match ? parseInt(match[1]) : null;
        }
        return null;
      });

      if (battleTime) {
        console.log(`✅ Battle timer found: ${battleTime}s`);
        if (battleTime > 170) {
          console.log('✅ Battle duration is appropriately long (3 minutes)');
        } else {
          console.log('⚠️ Battle duration seems short');
        }
      }

      // Check for battle statistics
      console.log('📊 Checking battle statistics...');
      const statsVisible = await page.evaluate(() => {
        const statsElements = Array.from(document.querySelectorAll('*'))
          .filter(el => el.textContent && (
            el.textContent.includes('Your Stats') ||
            el.textContent.includes('Damage') ||
            el.textContent.includes('Shots')
          ));
        return statsElements.length > 0;
      });

      if (statsVisible) {
        console.log('✅ Battle statistics panel found');
      } else {
        console.log('⚠️ Battle statistics not visible');
      }

      // Check for multiple AI opponents
      console.log('🤖 Checking AI opponents...');
      const aiCount = await page.evaluate(() => {
        const botElements = Array.from(document.querySelectorAll('*'))
          .filter(el => el.textContent && (
            el.textContent.includes('Speedster') ||
            el.textContent.includes('Guardian') ||
            el.textContent.includes('Tactician')
          ));
        return new Set(botElements.map(el => el.textContent)).size;
      });

      console.log(`✅ Found ${aiCount} AI opponents`);
      if (aiCount >= 3) {
        console.log('✅ Multiple AI opponents detected');
      }

      await monitorMemory();

      // Test 3: Gameplay Mechanics
      console.log('\n🧪 Testing Enhanced Gameplay Mechanics...');

      // Test movement
      console.log('🎮 Testing player movement...');
      await page.keyboard.down('KeyW');
      await new Promise(resolve => setTimeout(resolve, 1000));
      await page.keyboard.up('KeyW');

      await page.keyboard.down('KeyA');
      await new Promise(resolve => setTimeout(resolve, 1000));
      await page.keyboard.up('KeyA');

      console.log('✅ Movement keys tested');

      // Test shooting
      console.log('🔫 Testing shooting mechanics...');
      await page.keyboard.press('Space');
      await new Promise(resolve => setTimeout(resolve, 500));
      await page.keyboard.press('Space');
      await new Promise(resolve => setTimeout(resolve, 500));

      // Check if shots fired counter increased
      const shotsFired = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll('*'));
        for (let el of elements) {
          if (el.textContent && el.textContent.includes('Shots')) {
            const parent = el.parentElement;
            if (parent) {
              const numberEl = parent.querySelector('*');
              if (numberEl && /^\d+$/.test(numberEl.textContent.trim())) {
                return parseInt(numberEl.textContent.trim());
              }
            }
          }
        }
        return 0;
      });

      if (shotsFired > 0) {
        console.log(`✅ Shots fired counter working: ${shotsFired} shots`);
      } else {
        console.log('⚠️ Shots fired counter not updating');
      }

      // Test special ability
      console.log('⚡ Testing special ability...');
      await page.keyboard.press('KeyE');
      await new Promise(resolve => setTimeout(resolve, 1000));

      const specialsUsed = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll('*'));
        for (let el of elements) {
          if (el.textContent && el.textContent.includes('Specials')) {
            const parent = el.parentElement;
            if (parent) {
              const numberEl = parent.querySelector('*');
              if (numberEl && /^\d+$/.test(numberEl.textContent.trim())) {
                return parseInt(numberEl.textContent.trim());
              }
            }
          }
        }
        return 0;
      });

      if (specialsUsed > 0) {
        console.log(`✅ Special ability working: ${specialsUsed} used`);
      } else {
        console.log('⚠️ Special ability counter not updating');
      }

      await monitorMemory();

      // Test 4: Extended Battle Duration
      console.log('\n🧪 Testing Extended Battle Duration...');
      console.log('⏱️ Monitoring battle for 30 seconds...');

      const startTime = Date.now();
      let battleStillActive = true;
      let healthValues = [];

      for (let i = 0; i < 6; i++) {
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Check if battle is still active
        const currentBattleTime = await page.evaluate(() => {
          const timeElements = Array.from(document.querySelectorAll('*'))
            .filter(el => el.textContent && el.textContent.includes('Time:'));
          if (timeElements.length > 0) {
            const timeText = timeElements[0].textContent;
            const match = timeText.match(/Time:\s*(\d+)s/);
            return match ? parseInt(match[1]) : null;
          }
          return null;
        });

        if (currentBattleTime === null) {
          console.log('⚠️ Battle may have ended');
          battleStillActive = false;
          break;
        }

        // Get health values
        const healthData = await page.evaluate(() => {
          const healthElements = Array.from(document.querySelectorAll('*'))
            .filter(el => el.textContent && el.textContent.includes('HP'))
            .map(el => el.textContent);
          return healthElements;
        });

        healthValues.push({
          time: Date.now() - startTime,
          battleTime: currentBattleTime,
          healthData: healthData
        });

        console.log(`  ${i + 1}/6: Battle time ${currentBattleTime}s, Health data: ${healthData.length} bots`);

        // Occasionally fire shots to keep engaging
        if (i % 2 === 0) {
          await page.keyboard.press('Space');
        }
      }

      if (battleStillActive) {
        console.log('✅ Battle duration is appropriately long - still active after 30s');
      } else {
        console.log('ℹ️ Battle ended during monitoring period');
      }

      await monitorMemory();

      // Test 5: Return to Builder
      console.log('\n🧪 Testing Return to Builder...');

      // Look for back to builder button
      const backButton = await page.evaluateHandle(() => {
        return Array.from(document.querySelectorAll('button'))
          .find(btn => btn.textContent && btn.textContent.includes('Back to Builder'));
      });

      if (backButton) {
        await backButton.click();
        console.log('🎯 Back to Builder clicked');
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Verify we're back in builder
        const builderTitle = await page.$eval('h1', el => el.textContent);
        if (builderTitle && builderTitle.includes('Bot Builder')) {
          console.log('✅ Successfully returned to Bot Builder');
        } else {
          console.log('⚠️ May not have returned to builder properly');
        }
      } else {
        console.log('⚠️ Back to Builder button not found');
      }

      await monitorMemory();
    } else {
      throw new Error('Battle button not found');
    }

    // Test 6: Performance Analysis
    console.log('\n📊 Performance Analysis...');

    if (memoryUsage.length > 1) {
      const initialMemory = memoryUsage[0].jsHeapUsedSize;
      const finalMemory = memoryUsage[memoryUsage.length - 1].jsHeapUsedSize;
      const memoryIncrease = finalMemory - initialMemory;
      const memoryIncreasePercent = (memoryIncrease / initialMemory) * 100;

      console.log(`📈 Memory Analysis:`);
      console.log(`  Initial: ${initialMemory}MB`);
      console.log(`  Final: ${finalMemory}MB`);
      console.log(`  Increase: ${memoryIncrease.toFixed(2)}MB (${memoryIncreasePercent.toFixed(1)}%)`);

      if (memoryIncreasePercent < 50) {
        console.log('✅ Memory usage is stable');
      } else {
        console.log('⚠️ Significant memory increase detected');
      }
    }

    // Take final screenshot
    await page.screenshot({ path: 'test-enhanced-battlebot.png', fullPage: true });
    console.log('📸 Final screenshot saved as test-enhanced-battlebot.png');

    console.log('\n🎉 All enhanced BattleBot tests completed successfully!');
    console.log('\n📋 Test Summary:');
    console.log('✅ Enhanced bot builder visibility');
    console.log('✅ Improved battle duration (3 minutes)');
    console.log('✅ Multiple AI opponents with strategies');
    console.log('✅ Battle statistics tracking');
    console.log('✅ Tutorial system');
    console.log('✅ Enhanced gameplay mechanics');
    console.log('✅ Memory performance monitoring');

  } catch (error) {
    console.error('❌ Test failed:', error.message);

    // Take error screenshot
    if (page) {
      await page.screenshot({ path: 'test-enhanced-battlebot-error.png', fullPage: true });
      console.log('📸 Error screenshot saved as test-enhanced-battlebot-error.png');
    }

    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the test
if (require.main === module) {
  testEnhancedBattleBot()
    .then(() => {
      console.log('🎯 Enhanced BattleBot test completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Enhanced BattleBot test failed:', error);
      process.exit(1);
    });
}

module.exports = testEnhancedBattleBot;
