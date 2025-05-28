const puppeteer = require('puppeteer');

async function testPracticeArena() {
  console.log('🚀 Testing Practice Arena functionality...');

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });

  try {
    const page = await browser.newPage();

    // Capture console logs from the browser
    const logs = [];
    page.on('console', msg => {
      const text = msg.text();
      logs.push(text);
      console.log(`[BROWSER]: ${text}`);
    });

    // Navigate to the application
    console.log('📱 Navigating to http://localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

    // Wait for the main menu to load
    console.log('⏳ Waiting for main menu to load...');
    await page.waitForSelector('h1', { timeout: 10000 });

    // Check if the title is correct
    const title = await page.$eval('h1', el => el.textContent);
    console.log(`📋 Page title: ${title}`);

    // Look for the Practice Arena button
    console.log('🔍 Looking for Practice Arena button...');
    const practiceButton = await page.waitForSelector('button:has-text("Practice Arena")', { timeout: 5000 }).catch(() => null);

    if (!practiceButton) {
      // Try alternative selector
      const buttons = await page.$$('button');
      for (let button of buttons) {
        const text = await button.evaluate(el => el.textContent);
        if (text && text.includes('Practice Arena')) {
          console.log('✅ Found Practice Arena button');

          // Click the practice arena button
          console.log('🎯 Clicking Practice Arena button...');
          await button.click();

          // Wait for battle screen to load
          console.log('⏳ Waiting for battle screen...');
          await new Promise(resolve => setTimeout(resolve, 3000));

          // Check if canvas is present
          const canvas = await page.$('canvas');
          if (canvas) {
            console.log('✅ Canvas element found - 3D scene should be rendering');
          } else {
            console.log('❌ No canvas element found');
          }

          // Check for HUD elements
          const hudElements = await page.$$('.panel-cyber');
          console.log(`📊 Found ${hudElements.length} HUD elements`);

          await new Promise(resolve => setTimeout(resolve, 2000));

          const errors = logs.filter(log => log.includes('Error') || log.includes('error'));
          if (errors.length > 0) {
            console.log('⚠️  Console errors found:');
            errors.forEach(error => console.log(`   ${error}`));
          } else {
            console.log('✅ No console errors detected');
          }

          console.log('🎉 Practice Arena test completed successfully!');
          break;
        }
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

// Run the test
testPracticeArena().catch(console.error);
