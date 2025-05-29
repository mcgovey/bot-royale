/**
 * Test Configuration
 * Centralized configuration for all test suites
 */

const testConfig = {
  // Application settings
  app: {
    baseUrl: 'http://localhost:3000',
    title: 'Bot Builder',
    loadTimeout: 30000,
    actionTimeout: 5000
  },

  // Browser settings
  browser: {
    headless: false,
    viewport: { width: 1920, height: 1080 },
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu'
    ]
  },

  // Test timeouts
  timeouts: {
    navigation: 30000,
    element: 10000,
    action: 5000,
    battle: 180000, // 3 minutes
    monitoring: 30000
  },

  // Selectors
  selectors: {
    title: 'h1',
    buttons: 'button',
    canvas: 'canvas',
    chassisOptions: ['Speed Bot', 'Tank Bot', 'Balanced Bot'],
    weaponOptions: ['Blaster', 'Cannon', 'Shotgun'],
    specialOptions: ['Shield', 'Speed Boost', 'Repair'],
    battleButton: 'Battle',
    tutorialButton: 'Start Battle',
    backButton: 'Back to Builder'
  },

  // Expected values
  expected: {
    battleDuration: 180, // seconds
    minAIOpponents: 3,
    minReadableOptions: 3,
    minStickinessScore: 60,
    maxMemoryIncrease: 50 // percentage
  },

  // Test data
  testData: {
    botNames: ['TestBot', 'PlayerBot', 'CustomBot'],
    colors: ['#ff0000', '#00ff00', '#0000ff'],
    gameplayActions: [
      { key: 'KeyW', duration: 1000, action: 'move_forward' },
      { key: 'Space', duration: 100, action: 'shoot' },
      { key: 'KeyA', duration: 800, action: 'move_left' },
      { key: 'Space', duration: 100, action: 'shoot' },
      { key: 'KeyE', duration: 100, action: 'special_ability' },
      { key: 'KeyD', duration: 1000, action: 'move_right' },
      { key: 'Space', duration: 100, action: 'shoot' }
    ]
  },

  // Screenshot settings
  screenshots: {
    path: 'tests/screenshots',
    fullPage: true,
    quality: 80
  },

  // Report settings
  reports: {
    path: 'tests/reports',
    format: 'json'
  }
};

module.exports = testConfig;
