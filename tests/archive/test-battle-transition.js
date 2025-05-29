const puppeteer = require('puppeteer');

async function testBattleTransition() {
  console.log('🚀 Testing Battle Transition...');

  const browser = await puppeteer.launch({
    headless: false,
    devtools: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Enable console logging
  page.on('console', msg => {
    console.log(`[BROWSER]:`, msg.text());
  });

  page.on('error', err => {
    console.error('❌ Page error:', err.message);
  });

  try {
    console.log('📱 Navigating to http://localhost:3000...');
    await page.goto('http://localhost:3000', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    console.log('✅ App loaded');

    // Wait for the page to fully load
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check current mode
    const currentTitle = await page.$eval('h1', el => el.textContent);
    console.log('📋 Current page title:', currentTitle);

    // Find and click battle button
    console.log('🔍 Looking for Battle button...');

    const allButtons = await page.$$eval('button', buttons =>
      buttons.map(btn => ({
        text: btn.textContent?.trim(),
        visible: btn.offsetParent !== null,
        disabled: btn.disabled
      }))
    );

    console.log('🔍 All buttons found:', allButtons);

    const battleButtonClicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      console.log('Buttons found:', buttons.length);

      for (const button of buttons) {
        console.log('Button text:', button.textContent);
        if (button.textContent && button.textContent.includes('Battle')) {
          console.log('Found Battle button, clicking...');
          button.click();
          return true;
        }
      }
      return false;
    });

    if (battleButtonClicked) {
      console.log('✅ Battle button clicked');

      // Wait for transition
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Check new title
      const newTitle = await page.$eval('h1', el => el.textContent);
      console.log('📋 New page title:', newTitle);

      if (newTitle.includes('Battle Arena')) {
        console.log('✅ Successfully transitioned to Battle Arena');
      } else {
        console.log('❌ Failed to transition - still showing:', newTitle);

        // Debug: Check React state
        const reactState = await page.evaluate(() => {
          // Try to access React state through the DOM
          const app = document.querySelector('#root');
          return {
            innerHTML: app ? app.innerHTML.substring(0, 500) : 'No root element',
            currentMode: window.location.hash || 'No hash'
          };
        });

        console.log('🔍 React state debug:', reactState);
      }
    } else {
      console.log('❌ Battle button not found');
    }

    // Take screenshot
    await page.screenshot({ path: 'test-battle-transition.png', fullPage: true });
    console.log('📸 Screenshot saved');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: 'test-battle-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

testBattleTransition()
  .then(() => {
    console.log('✅ Test completed');
    process.exit(0);
  })
  .catch(err => {
    console.error('💥 Test failed:', err.message);
    process.exit(1);
  });
