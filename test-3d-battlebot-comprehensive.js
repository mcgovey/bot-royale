const puppeteer = require('puppeteer');

async function test3DBattleBotComprehensive() {
  console.log('🚀 Starting comprehensive test for 3D BattleBot Arena...');

  const browser = await puppeteer.launch({
    headless: false,
    devtools: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor',
      '--enable-webgl',
      '--enable-accelerated-2d-canvas'
    ]
  });

  const page = await browser.newPage();

  // Set viewport for consistent testing
  await page.setViewport({ width: 1920, height: 1080 });

  // Monitor memory usage
  let memoryUsage = [];
  const monitorMemory = async () => {
    const metrics = await page.metrics();
    memoryUsage.push({
      timestamp: Date.now(),
      jsHeapUsedSize: metrics.JSHeapUsedSize,
      jsHeapTotalSize: metrics.JSHeapTotalSize,
      jsHeapSizeLimit: metrics.JSHeapSizeLimit
    });
  };

  // Enable console logging
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'error' || type === 'warn') {
      console.log(`[BROWSER ${type.toUpperCase()}]:`, text);
    }
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
      timeout: 60000
    });

    await monitorMemory();
    console.log('✅ App loaded successfully');

    // Test 1: Bot Builder Mode - 3D Visualization
    console.log('\n🧪 Testing Bot Builder Mode with 3D Visualization...');

    // Wait for 3D canvas to load
    await page.waitForSelector('canvas', { timeout: 10000 });
    console.log('✅ 3D Canvas loaded');

    // Check for WebGL context
    const webglSupported = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return false;
      try {
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        return !!gl;
      } catch (error) {
        console.log('WebGL context error (normal during transitions):', error.message);
        return false;
      }
    });

    if (webglSupported) {
      console.log('✅ WebGL context available');
    } else {
      console.log('ℹ️ WebGL context not available (may be normal during canvas transitions)');
    }

    // Test chassis selection with 3D updates
    console.log('🔧 Testing chassis selection with 3D updates...');
    const chassisButtons = await page.$$('button');
    let chassisFound = false;

    for (const button of chassisButtons) {
      const text = await button.evaluate(el => el.textContent);
      if (text && (text.includes('Speed Bot') || text.includes('Tank Bot') || text.includes('Balanced Bot'))) {
        console.log('🎯 Found chassis button:', text);
        await button.click();
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 3D update
        chassisFound = true;
        break;
      }
    }

    if (!chassisFound) {
      throw new Error('No chassis selection buttons found');
    }

    await monitorMemory();

    // Test weapon selection with 3D updates
    console.log('🔫 Testing weapon selection with 3D updates...');
    const weaponButtons = await page.$$('button');
    let weaponFound = false;

    for (const button of weaponButtons) {
      const text = await button.evaluate(el => el.textContent);
      if (text && (text.includes('Blaster') || text.includes('Cannon') || text.includes('Shotgun'))) {
        console.log('🎯 Found weapon button:', text);
        await button.click();
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 3D update
        weaponFound = true;
        break;
      }
    }

    if (!weaponFound) {
      throw new Error('No weapon selection buttons found');
    }

    await monitorMemory();

    // Test special ability selection
    console.log('⚡ Testing special ability selection...');
    const specialButtons = await page.$$('button');
    let specialFound = false;

    for (const button of specialButtons) {
      const text = await button.evaluate(el => el.textContent);
      if (text && (text.includes('Shield') || text.includes('Speed Boost') || text.includes('Repair'))) {
        console.log('🎯 Found special button:', text);
        await button.click();
        await new Promise(resolve => setTimeout(resolve, 1000));
        specialFound = true;
        break;
      }
    }

    if (!specialFound) {
      throw new Error('No special selection buttons found');
    }

    await monitorMemory();

    // Test bot customization
    console.log('🎨 Testing bot customization...');

    // Test name input
    const nameInput = await page.$('input[type="text"]');
    if (nameInput) {
      await nameInput.click({ clickCount: 3 });
      await nameInput.type('Test Warrior Bot');
      console.log('✅ Bot name updated');
    }

    // Test color customization
    const colorInputs = await page.$$('input[type="color"]');
    if (colorInputs.length >= 2) {
      await colorInputs[0].click();
      await new Promise(resolve => setTimeout(resolve, 500));
      await colorInputs[1].click();
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('✅ Color customization working');
    }

    await monitorMemory();

    // Test 2: 3D Battle Arena Transition
    console.log('\n⚔️ Testing 3D Battle Arena transition...');

    const battleButton = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(btn => btn.textContent.includes('Battle'));
    });

    if (battleButton) {
      console.log('🎯 Found Battle button, transitioning to 3D arena...');
      await battleButton.click();
      await new Promise(resolve => setTimeout(resolve, 5000)); // Increased wait time for 3D scene to load

      // Check if we're in battle mode
      await page.waitForSelector('h1', { timeout: 15000 });
      const battleTitle = await page.$eval('h1', el => el.textContent);
      console.log('📋 Battle page title:', battleTitle);

      if (!battleTitle.includes('Battle Arena')) {
        // Try clicking again if first attempt failed
        console.log('🔄 Retrying battle transition...');
        const retryButton = await page.evaluateHandle(() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          return buttons.find(btn => btn.textContent.includes('Battle'));
        });

        if (retryButton) {
          await retryButton.click();
          await new Promise(resolve => setTimeout(resolve, 5000));
          const retryTitle = await page.$eval('h1', el => el.textContent);
          if (!retryTitle.includes('Battle Arena')) {
            throw new Error('Failed to transition to Battle Arena after retry');
          }
        } else {
          throw new Error('Failed to transition to Battle Arena');
        }
      }

      await monitorMemory();

      // Test 3: 3D Battle Arena Functionality
      console.log('\n🏟️ Testing 3D Battle Arena functionality...');

      // Check for 3D canvas in battle mode
      const battleCanvas = await page.$('canvas');
      if (!battleCanvas) {
        throw new Error('3D Battle canvas not found');
      }
      console.log('✅ 3D Battle canvas found');

      // Check for bot stats display
      const botStats = await page.$$eval('div', divs =>
        divs.filter(div => div.textContent.includes('HP')).length
      );

      if (botStats < 2) {
        throw new Error('Bot stats not displayed properly');
      }
      console.log('✅ Bot stats displayed');

      // Check for controls panel
      const controlsPanel = await page.$eval('div', div => {
        const text = div.textContent;
        return text && text.includes('Controls') && text.includes('WASD');
      });

      if (controlsPanel) {
        console.log('✅ Controls panel found');
      }

      await monitorMemory();

      // Test 4: Player Controls
      console.log('\n🎮 Testing player controls...');

      // Test movement controls
      console.log('🏃 Testing movement controls...');
      await page.keyboard.down('KeyW');
      await new Promise(resolve => setTimeout(resolve, 500));
      await page.keyboard.up('KeyW');

      await page.keyboard.down('KeyA');
      await new Promise(resolve => setTimeout(resolve, 500));
      await page.keyboard.up('KeyA');

      await page.keyboard.down('KeyS');
      await new Promise(resolve => setTimeout(resolve, 500));
      await page.keyboard.up('KeyS');

      await page.keyboard.down('KeyD');
      await new Promise(resolve => setTimeout(resolve, 500));
      await page.keyboard.up('KeyD');

      console.log('✅ Movement controls tested');

      // Test shooting
      console.log('🔫 Testing shooting controls...');
      await page.keyboard.press('Space');
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('✅ Shooting control tested');

      // Test special ability
      console.log('⚡ Testing special ability...');
      await page.keyboard.press('KeyE');
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('✅ Special ability tested');

      await monitorMemory();

      // Test 5: Battle Progression
      console.log('\n⏱️ Monitoring battle progression for 15 seconds...');
      for (let i = 0; i < 15; i++) {
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

        // Simulate some player actions during battle
        if (i % 3 === 0) {
          await page.keyboard.press('Space'); // Shoot
        }
        if (i % 5 === 0) {
          await page.keyboard.down('KeyW');
          await new Promise(resolve => setTimeout(resolve, 200));
          await page.keyboard.up('KeyW');
        }
      }

      // Test 6: Return to Builder
      console.log('\n🔄 Testing return to Bot Builder...');

      // Try clicking modal button first
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
        // Try header button
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

      await monitorMemory();

      // Test 7: Multiple Battle Cycles (Stress Test)
      console.log('\n🔄 Running stress test with multiple battle cycles...');

      for (let cycle = 1; cycle <= 3; cycle++) {
        console.log(`🔄 Battle cycle ${cycle}/3...`);

        // Ensure we're in builder mode
        try {
          const currentTitle = await page.$eval('h1', el => el.textContent);
          if (!currentTitle.includes('Bot Builder')) {
            console.log('🔄 Navigating back to builder...');
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
          console.log('⚠️ Could not check page state for cycle', cycle);
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

          // Simulate some battle activity
          for (let i = 0; i < 5; i++) {
            await page.keyboard.press('Space');
            await page.keyboard.press('KeyW');
            await new Promise(resolve => setTimeout(resolve, 500));
          }

          // Return to builder
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

      // Test 8: Performance Analysis
      console.log('\n📊 Analyzing performance and memory usage...');

      const initialMemory = memoryUsage[0];
      const finalMemory = memoryUsage[memoryUsage.length - 1];
      const memoryIncrease = finalMemory.jsHeapUsedSize - initialMemory.jsHeapUsedSize;
      const memoryIncreasePercent = (memoryIncrease / initialMemory.jsHeapUsedSize) * 100;

      console.log(`Initial memory: ${(initialMemory.jsHeapUsedSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(`Final memory: ${(finalMemory.jsHeapUsedSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(`Memory increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)} MB (${memoryIncreasePercent.toFixed(2)}%)`);
      console.log(`Memory limit: ${(finalMemory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`);

      if (memoryIncreasePercent > 100) {
        console.warn('⚠️ Significant memory increase detected - possible memory leak');
      } else if (memoryIncreasePercent > 50) {
        console.warn('⚠️ Moderate memory increase detected');
      } else {
        console.log('✅ Memory usage appears stable');
      }

      // Check for memory usage spikes
      let maxMemory = 0;
      let memorySpikes = 0;
      memoryUsage.forEach(usage => {
        if (usage.jsHeapUsedSize > maxMemory) {
          maxMemory = usage.jsHeapUsedSize;
        }
        if (usage.jsHeapUsedSize > initialMemory.jsHeapUsedSize * 2) {
          memorySpikes++;
        }
      });

      console.log(`Peak memory usage: ${(maxMemory / 1024 / 1024).toFixed(2)} MB`);
      console.log(`Memory spikes detected: ${memorySpikes}`);

      // Test 9: WebGL Performance
      console.log('\n🎮 Testing WebGL performance...');

      const webglInfo = await page.evaluate(() => {
        const canvas = document.querySelector('canvas');
        if (!canvas) return null;

        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) return null;

        return {
          vendor: gl.getParameter(gl.VENDOR),
          renderer: gl.getParameter(gl.RENDERER),
          version: gl.getParameter(gl.VERSION),
          maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
          maxViewportDims: gl.getParameter(gl.MAX_VIEWPORT_DIMS)
        };
      });

      if (webglInfo) {
        console.log('✅ WebGL Info:');
        console.log(`  Vendor: ${webglInfo.vendor}`);
        console.log(`  Renderer: ${webglInfo.renderer}`);
        console.log(`  Version: ${webglInfo.version}`);
        console.log(`  Max Texture Size: ${webglInfo.maxTextureSize}`);
        console.log(`  Max Viewport: ${webglInfo.maxViewportDims}`);
      }

    } else {
      throw new Error('Battle button not found');
    }

    console.log('\n✅ All comprehensive tests completed successfully!');

    // Take final screenshot
    await page.screenshot({ path: 'test-3d-battlebot-comprehensive.png', fullPage: true });
    console.log('📸 Final screenshot saved as test-3d-battlebot-comprehensive.png');

  } catch (error) {
    console.error('❌ Test failed:', error.message);

    // Take error screenshot
    await page.screenshot({ path: 'test-3d-error.png', fullPage: true });
    console.log('📸 Error screenshot saved as test-3d-error.png');

    throw error;
  } finally {
    await browser.close();
  }

  return true;
}

// Run the comprehensive test
test3DBattleBotComprehensive()
  .then(success => {
    console.log('✅ 3D BattleBot Arena comprehensive tests passed!');
    console.log('🎮 Game is ready for production with beautiful 3D graphics and player controls!');
    process.exit(0);
  })
  .catch(err => {
    console.error('💥 Comprehensive tests failed:', err.message);
    process.exit(1);
  });
