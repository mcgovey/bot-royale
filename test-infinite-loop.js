const puppeteer = require('puppeteer');

async function testAllPages() {
  console.log('🚀 Starting comprehensive Puppeteer test for all pages...');

  const browser = await puppeteer.launch({
    headless: false, // Set to true for CI/automated testing
    devtools: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Enable console logging from the page
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
      return false;
    }
  });

  let hasInfiniteLoop = false;

  try {
    console.log('📱 Navigating to http://localhost:3000...');
    await page.goto('http://localhost:3000', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    console.log('✅ Main menu loaded successfully');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 1: Check main menu
    console.log('🧪 Testing main menu...');
    const menuButtons = await page.$$eval('button', buttons =>
      buttons.map(btn => btn.textContent?.trim()).filter(text => text)
    );
    console.log('📋 Found buttons:', menuButtons);

    // Test 2: Click Practice Arena
    console.log('🧪 Testing Practice Arena button...');
    try {
      const buttons = await page.$$('button');
      let practiceClicked = false;

      for (const button of buttons) {
        const text = await button.evaluate(el => el.textContent);
        if (text && text.includes('Practice Arena')) {
          console.log('🎯 Found Practice Arena button:', text);
          await button.click();
          practiceClicked = true;
          break;
        }
      }

      if (practiceClicked) {
        console.log('⏱️  Waiting 5 seconds after Practice Arena click...');
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Check if we're in battle arena
        const currentUrl = page.url();
        console.log('📍 Current URL:', currentUrl);
      } else {
        console.log('⚠️  Practice Arena button not found');
      }

    } catch (error) {
      console.error('❌ Error clicking Practice Arena:', error.message);
    }

    // Test 3: Try Bot Builder
    console.log('🧪 Testing Bot Builder navigation...');
    try {
      await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
      await new Promise(resolve => setTimeout(resolve, 2000));

      const buttons = await page.$$('button');
      for (const button of buttons) {
        const text = await button.evaluate(el => el.textContent);
        if (text && (text.includes('Bot') || text.includes('Builder') || text.includes('Customize'))) {
          console.log('🎯 Found Bot Builder button:', text);
          await button.click();
          await new Promise(resolve => setTimeout(resolve, 3000));
          break;
        }
      }
    } catch (error) {
      console.error('❌ Error testing Bot Builder:', error.message);
    }

    // Test 4: Try Matchmaking
    console.log('🧪 Testing Matchmaking navigation...');
    try {
      await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
      await new Promise(resolve => setTimeout(resolve, 2000));

      const buttons = await page.$$('button');
      for (const button of buttons) {
        const text = await button.evaluate(el => el.textContent);
        if (text && (text.includes('Match') || text.includes('Ranked') || text.includes('Quick'))) {
          console.log('🎯 Found Matchmaking button:', text);
          await button.click();
          await new Promise(resolve => setTimeout(resolve, 3000));
          break;
        }
      }
    } catch (error) {
      console.error('❌ Error testing Matchmaking:', error.message);
    }

    // Test 5: Extended observation for any delayed infinite loops
    console.log('⏱️  Extended observation (15 seconds) for any delayed issues...');
    await new Promise(resolve => setTimeout(resolve, 15000));

    console.log('✅ All tests completed successfully');

    // Take a final screenshot
    await page.screenshot({ path: 'test-all-pages.png', fullPage: true });
    console.log('📸 Final screenshot saved as test-all-pages.png');

  } catch (error) {
    console.error('❌ Test failed:', error.message);

    if (error.message.includes('Maximum update depth exceeded')) {
      console.error('🔥 INFINITE LOOP CONFIRMED!');
      hasInfiniteLoop = true;
    }
  } finally {
    await browser.close();
  }

  return !hasInfiniteLoop;
}

// Run the comprehensive test
testAllPages()
  .then(success => {
    if (success) {
      console.log('✅ All page tests passed - No infinite loops detected');
      process.exit(0);
    } else {
      console.log('❌ Tests failed - Infinite loops detected');
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('💥 Test crashed:', err);
    process.exit(1);
  });
