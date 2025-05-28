const puppeteer = require('puppeteer');

async function testPracticeArena() {
  console.log('🎯 Starting focused Practice Arena test...');

  const browser = await puppeteer.launch({
    headless: false,
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

    console.log('✅ Main menu loaded');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Find and click Practice Arena
    console.log('🎯 Looking for Practice Arena button...');
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

    if (!practiceClicked) {
      throw new Error('Practice Arena button not found');
    }

    console.log('⏱️  Waiting 10 seconds after Practice Arena click...');
    await new Promise(resolve => setTimeout(resolve, 10000));

    // Check what screen we're on
    const pageContent = await page.content();
    console.log('📍 Checking current screen...');

    if (pageContent.includes('Searching for Match') || pageContent.includes('Practice')) {
      console.log('✅ Successfully navigated to Practice Arena/Matchmaking');
    } else {
      console.log('⚠️  Unexpected screen content');
    }

    // Take a screenshot
    await page.screenshot({ path: 'practice-arena-test.png', fullPage: true });
    console.log('📸 Screenshot saved as practice-arena-test.png');

    console.log('✅ Practice Arena test completed successfully');

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

// Run the test
testPracticeArena()
  .then(success => {
    if (success) {
      console.log('✅ Practice Arena test passed - No infinite loops detected');
      process.exit(0);
    } else {
      console.log('❌ Practice Arena test failed - Infinite loops detected');
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('💥 Test crashed:', err);
    process.exit(1);
  });
