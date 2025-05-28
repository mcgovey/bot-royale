const puppeteer = require('puppeteer');

async function test3DPerformance() {
  console.log('🚀 Starting 3D Performance Test...');

  const browser = await puppeteer.launch({
    headless: false,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--enable-webgl',
      '--enable-accelerated-2d-canvas'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  let memorySnapshots = [];
  let frameRates = [];

  try {
    console.log('📱 Loading 3D BattleBot Arena...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

    // Wait for 3D to initialize
    await page.waitForSelector('canvas');
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('🎮 Starting performance monitoring...');

    // Monitor performance for 30 seconds
    for (let i = 0; i < 30; i++) {
      // Take memory snapshot
      const metrics = await page.metrics();
      memorySnapshots.push({
        time: i,
        memory: metrics.JSHeapUsedSize / 1024 / 1024 // MB
      });

      // Measure frame rate
      const frameRate = await page.evaluate(() => {
        return new Promise(resolve => {
          let frames = 0;
          const startTime = performance.now();

          function countFrame() {
            frames++;
            if (performance.now() - startTime < 1000) {
              requestAnimationFrame(countFrame);
            } else {
              resolve(frames);
            }
          }

          requestAnimationFrame(countFrame);
        });
      });

      frameRates.push(frameRate);

      // Simulate user interactions every few seconds
      if (i % 5 === 0) {
        // Switch between components to stress test 3D updates
        await page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          const randomButton = buttons[Math.floor(Math.random() * buttons.length)];
          if (randomButton && !randomButton.textContent.includes('Battle')) {
            randomButton.click();
          }
        });
      }

      if (i % 10 === 0) {
        console.log(`⏱️ ${i}s - Memory: ${memorySnapshots[i].memory.toFixed(2)}MB, FPS: ${frameRate}`);
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Analyze results
    console.log('\n📊 Performance Analysis:');

    const avgMemory = memorySnapshots.reduce((sum, snap) => sum + snap.memory, 0) / memorySnapshots.length;
    const maxMemory = Math.max(...memorySnapshots.map(snap => snap.memory));
    const minMemory = Math.min(...memorySnapshots.map(snap => snap.memory));
    const memoryVariance = maxMemory - minMemory;

    const avgFPS = frameRates.reduce((sum, fps) => sum + fps, 0) / frameRates.length;
    const minFPS = Math.min(...frameRates);

    console.log(`Average Memory Usage: ${avgMemory.toFixed(2)} MB`);
    console.log(`Memory Range: ${minMemory.toFixed(2)} - ${maxMemory.toFixed(2)} MB`);
    console.log(`Memory Variance: ${memoryVariance.toFixed(2)} MB`);
    console.log(`Average FPS: ${avgFPS.toFixed(1)}`);
    console.log(`Minimum FPS: ${minFPS}`);

    // Performance evaluation
    let performanceScore = 100;

    if (memoryVariance > 50) {
      console.warn('⚠️ High memory variance detected');
      performanceScore -= 20;
    }

    if (avgFPS < 30) {
      console.warn('⚠️ Low average frame rate');
      performanceScore -= 30;
    }

    if (minFPS < 15) {
      console.warn('⚠️ Frame rate drops detected');
      performanceScore -= 20;
    }

    if (performanceScore >= 80) {
      console.log('✅ Excellent 3D performance!');
    } else if (performanceScore >= 60) {
      console.log('✅ Good 3D performance');
    } else {
      console.log('⚠️ Performance could be improved');
    }

    console.log(`Performance Score: ${performanceScore}/100`);

    // Test battle arena performance
    console.log('\n⚔️ Testing Battle Arena 3D performance...');

    const battleStarted = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const battleButton = buttons.find(btn => btn.textContent && btn.textContent.includes('Battle'));
      if (battleButton) {
        battleButton.click();
        return true;
      }
      return false;
    });

    if (battleStarted) {
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Monitor battle performance for 10 seconds
      let battleFrameRates = [];
      for (let i = 0; i < 10; i++) {
        const frameRate = await page.evaluate(() => {
          return new Promise(resolve => {
            let frames = 0;
            const startTime = performance.now();

            function countFrame() {
              frames++;
              if (performance.now() - startTime < 1000) {
                requestAnimationFrame(countFrame);
              } else {
                resolve(frames);
              }
            }

            requestAnimationFrame(countFrame);
          });
        });

        battleFrameRates.push(frameRate);

        // Simulate player movement
        await page.keyboard.down('KeyW');
        await new Promise(resolve => setTimeout(resolve, 200));
        await page.keyboard.up('KeyW');
        await page.keyboard.press('Space');

        await new Promise(resolve => setTimeout(resolve, 800));
      }

      const battleAvgFPS = battleFrameRates.reduce((sum, fps) => sum + fps, 0) / battleFrameRates.length;
      const battleMinFPS = Math.min(...battleFrameRates);

      console.log(`Battle Average FPS: ${battleAvgFPS.toFixed(1)}`);
      console.log(`Battle Minimum FPS: ${battleMinFPS}`);

      if (battleAvgFPS >= 30) {
        console.log('✅ Battle arena maintains good performance');
      } else {
        console.log('⚠️ Battle arena performance could be improved');
      }
    }

    await page.screenshot({ path: 'test-3d-performance.png', fullPage: true });
    console.log('📸 Performance test screenshot saved');

  } catch (error) {
    console.error('❌ Performance test failed:', error.message);
    await page.screenshot({ path: 'test-3d-performance-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

test3DPerformance()
  .then(() => {
    console.log('\n✅ 3D Performance test completed!');
    process.exit(0);
  })
  .catch(err => {
    console.error('💥 Performance test failed:', err.message);
    process.exit(1);
  });
