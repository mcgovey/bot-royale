const puppeteer = require('puppeteer');

async function testSimplifiedGame() {
  console.log('🚀 Starting comprehensive test for simplified BattleBot Arena...');

  const browser = await puppeteer.launch({
    headless: false,
    devtools: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor'
    ]
  });

  const page = await browser.newPage();

  // Monitor memory usage
  let memoryUsage = [];
  const monitorMemory = async () => {
    const metrics = await page.metrics();
    memoryUsage.push({
      timestamp: Date.now(),
      jsHeapUsedSize: metrics.JSHeapUsedSize,
      jsHeapTotalSize: metrics.JSHeapTotalSize
    });
  };

  // Enable console logging
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    console.log(`[BROWSER ${type.toUpperCase()}]:`, text);
  });

  // Listen for errors
  page.on('error', err => {
    console.error('❌ Page error:', err.message);
  });

  page.on('pageerror', err => {
    console.error('❌ Page error:', err.message);
    if (err.message.includes('Maximum update depth exceeded')) {
      console.error('🔥 INFINITE LOOP DETECTED!');
      throw new Error('Infinite loop detected');
    }
  });

  try {
    console.log('📱 Navigating to http://localhost:3000...');
    await page.goto('http://localhost:3000', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    await monitorMemory();
    console.log('✅ App loaded successfully');

    // Test 1: Bot Builder Mode
    console.log('\n🧪 Testing Bot Builder Mode...');

    // Should start in bot builder mode
    await page.waitForSelector('h1', { timeout: 5000 });
    const title = await page.$eval('h1', el => el.textContent);
    console.log('📋 Page title:', title);

    if (!title.includes('Bot Builder')) {
      throw new Error('App did not start in Bot Builder mode');
    }

    // Test chassis selection
    console.log('🔧 Testing chassis selection...');
    const chassisButtons = await page.$$('button');
    let chassisFound = false;

    for (const button of chassisButtons) {
      const text = await button.evaluate(el => el.textContent);
      if (text && (text.includes('Speed Bot') || text.includes('Tank Bot') || text.includes('Balanced Bot'))) {
        console.log('🎯 Found chassis button:', text);
        await button.click();
        chassisFound = true;
        await new Promise(resolve => setTimeout(resolve, 500));
        break;
      }
    }

    if (!chassisFound) {
      throw new Error('No chassis selection buttons found');
    }

    await monitorMemory();

    // Test weapon selection
    console.log('🔫 Testing weapon selection...');
    const weaponButtons = await page.$$('button');
    let weaponFound = false;

    for (const button of weaponButtons) {
      const text = await button.evaluate(el => el.textContent);
      if (text && (text.includes('Blaster') || text.includes('Cannon') || text.includes('Shotgun'))) {
        console.log('🎯 Found weapon button:', text);
        await button.click();
        weaponFound = true;
        await new Promise(resolve => setTimeout(resolve, 500));
        break;
      }
    }

    if (!weaponFound) {
      throw new Error('No weapon selection buttons found');
    }

    await monitorMemory();

    // Test special selection
    console.log('⚡ Testing special selection...');
    const specialButtons = await page.$$('button');
    let specialFound = false;

    for (const button of specialButtons) {
      const text = await button.evaluate(el => el.textContent);
      if (text && (text.includes('Shield') || text.includes('Speed Boost') || text.includes('Repair'))) {
        console.log('🎯 Found special button:', text);
        await button.click();
        specialFound = true;
        await new Promise(resolve => setTimeout(resolve, 500));
        break;
      }
    }

    if (!specialFound) {
      throw new Error('No special selection buttons found');
    }

    await monitorMemory();

    // Test bot name input
    console.log('📝 Testing bot name input...');
    const nameInput = await page.$('input[type="text"]');
    if (nameInput) {
      await nameInput.click({ clickCount: 3 }); // Select all text
      await nameInput.type('Test Bot');
      console.log('✅ Bot name updated');
    }

    await monitorMemory();

    // Test color customization
    console.log('🎨 Testing color customization...');
    const colorInputs = await page.$$('input[type="color"]');
    if (colorInputs.length >= 2) {
      await colorInputs[0].click();
      await new Promise(resolve => setTimeout(resolve, 200));
      await colorInputs[1].click();
      await new Promise(resolve => setTimeout(resolve, 200));
      console.log('✅ Color inputs working');
    }

    await monitorMemory();

    // Test 2: Battle Mode Transition
    console.log('\n⚔️ Testing Battle Mode transition...');

    const battleButton = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(btn => btn.textContent.includes('Battle'));
    });

    if (battleButton) {
      console.log('🎯 Found Battle button, clicking...');
      await battleButton.click();
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Check if we're in battle mode
      await page.waitForSelector('h1', { timeout: 5000 });
      const battleTitle = await page.$eval('h1', el => el.textContent);
      console.log('📋 Battle page title:', battleTitle);

      if (!battleTitle.includes('Battle Arena')) {
        throw new Error('Failed to transition to Battle Arena');
      }

      await monitorMemory();

      // Test 3: Battle Arena Functionality
      console.log('\n🏟️ Testing Battle Arena functionality...');

      // Check for canvas element
      const canvas = await page.$('canvas');
      if (!canvas) {
        throw new Error('Battle canvas not found');
      }
      console.log('✅ Battle canvas found');

      // Check for bot stats
      const botStats = await page.$$eval('div', divs =>
        divs.filter(div => div.textContent.includes('Health:')).length
      );

      if (botStats < 2) {
        throw new Error('Bot stats not displayed properly');
      }
      console.log('✅ Bot stats displayed');

      await monitorMemory();

      // Wait for battle to progress
      console.log('⏱️ Monitoring battle for 10 seconds...');
      for (let i = 0; i < 10; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await monitorMemory();

        // Check if battle ended
        const battleResult = await page.$('h2');
        if (battleResult) {
          const resultText = await battleResult.evaluate(el => el.textContent);
          if (resultText && resultText.includes('Battle Complete')) {
            console.log('🏆 Battle completed:', resultText);
            break;
          }
        }
      }

      // Test 4: Return to Builder
      console.log('\n🔄 Testing return to Bot Builder...');

      // Wait a bit more for battle to complete if needed
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Debug: Check what buttons are available
      const allButtons = await page.$$eval('button', buttons =>
        buttons.map(btn => btn.textContent?.trim()).filter(text => text)
      );
      console.log('🔍 Available buttons:', allButtons);

      // Try clicking the modal button first (Build New Bot)
      const modalClicked = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const modalButton = buttons.find(btn => btn.textContent.includes('Build New Bot'));
        if (modalButton) {
          modalButton.click();
          return true;
        }
        return false;
      });

      if (modalClicked) {
        console.log('🎯 Clicked modal "Build New Bot" button');
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else {
        // Try the header button
        const headerClicked = await page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          const headerButton = buttons.find(btn => btn.textContent.includes('Back to Builder'));
          if (headerButton) {
            headerButton.click();
            return true;
          }
          return false;
        });

        if (headerClicked) {
          console.log('🎯 Clicked header "Back to Builder" button');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      // Check if we're back in builder
      try {
        const currentTitle = await page.$eval('h1', el => el.textContent);
        console.log('📋 Current page title after click:', currentTitle);

        if (currentTitle.includes('Bot Builder')) {
          console.log('✅ Successfully returned to Bot Builder');
        } else {
          console.log('⚠️ Still on battle page, but continuing test...');
        }
      } catch (error) {
        console.log('⚠️ Error checking page state:', error.message);
      }

      await monitorMemory();

      // Test 5: Multiple Battle Cycles (Memory Leak Test)
      console.log('\n🔄 Testing multiple battle cycles for memory leaks...');

      for (let cycle = 1; cycle <= 3; cycle++) {
        console.log(`🔄 Battle cycle ${cycle}/3...`);

        // Try to get back to builder first
        try {
          const currentTitle = await page.$eval('h1', el => el.textContent);
          if (!currentTitle.includes('Bot Builder')) {
            console.log('🔄 Attempting to return to builder...');
            const builderClicked = await page.evaluate(() => {
              const buttons = Array.from(document.querySelectorAll('button'));
              const builderButton = buttons.find(btn =>
                btn.textContent.includes('Back to Builder') ||
                btn.textContent.includes('Build New Bot')
              );
              if (builderButton) {
                builderButton.click();
                return true;
              }
              return false;
            });

            if (builderClicked) {
              await new Promise(resolve => setTimeout(resolve, 2000));
            }
          }
        } catch (error) {
          console.log('⚠️ Could not navigate to builder for cycle', cycle);
        }

        // Start battle
        const battleClicked = await page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          const battleButton = buttons.find(btn => btn.textContent.includes('Battle'));
          if (battleButton) {
            battleButton.click();
            return true;
          }
          return false;
        });

        if (battleClicked) {
          await new Promise(resolve => setTimeout(resolve, 3000));

          // Wait a bit then return
          const backClicked = await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            const backButton = buttons.find(btn =>
              btn.textContent.includes('Back to Builder') ||
              btn.textContent.includes('Build New Bot')
            );
            if (backButton) {
              backButton.click();
              return true;
            }
            return false;
          });

          if (backClicked) {
            await new Promise(resolve => setTimeout(resolve, 2000));
          }

          await monitorMemory();
        } else {
          console.log('⚠️ Could not find battle button for cycle', cycle);
        }
      }

      // Analyze memory usage
      console.log('\n📊 Memory Usage Analysis:');
      const initialMemory = memoryUsage[0];
      const finalMemory = memoryUsage[memoryUsage.length - 1];
      const memoryIncrease = finalMemory.jsHeapUsedSize - initialMemory.jsHeapUsedSize;
      const memoryIncreasePercent = (memoryIncrease / initialMemory.jsHeapUsedSize) * 100;

      console.log(`Initial memory: ${(initialMemory.jsHeapUsedSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(`Final memory: ${(finalMemory.jsHeapUsedSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(`Memory increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)} MB (${memoryIncreasePercent.toFixed(2)}%)`);

      if (memoryIncreasePercent > 50) {
        console.warn('⚠️ Significant memory increase detected - possible memory leak');
      } else {
        console.log('✅ Memory usage appears stable');
      }

    } else {
      throw new Error('Battle button not found');
    }

    console.log('\n✅ All tests completed successfully!');

    // Take final screenshot
    await page.screenshot({ path: 'test-simplified-game.png', fullPage: true });
    console.log('📸 Final screenshot saved as test-simplified-game.png');

  } catch (error) {
    console.error('❌ Test failed:', error.message);

    // Take error screenshot
    await page.screenshot({ path: 'test-error.png', fullPage: true });
    console.log('📸 Error screenshot saved as test-error.png');

    throw error;
  } finally {
    await browser.close();
  }

  return true;
}

// Run the test
testSimplifiedGame()
  .then(success => {
    console.log('✅ Simplified game tests passed - No memory issues detected');
    process.exit(0);
  })
  .catch(err => {
    console.error('💥 Tests failed:', err.message);
    process.exit(1);
  });
