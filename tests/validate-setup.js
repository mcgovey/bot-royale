/**
 * Test Setup Validation
 * Validates that the test environment is properly configured
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating BattleBot Arena Test Setup...\n');

const checks = [
  {
    name: 'Test Configuration',
    check: () => fs.existsSync(path.join(__dirname, 'config', 'test.config.js')),
    fix: 'Ensure config/test.config.js exists'
  },
  {
    name: 'Browser Utils',
    check: () => fs.existsSync(path.join(__dirname, 'utils', 'browser-utils.js')),
    fix: 'Ensure utils/browser-utils.js exists'
  },
  {
    name: 'Game Utils',
    check: () => fs.existsSync(path.join(__dirname, 'utils', 'game-utils.js')),
    fix: 'Ensure utils/game-utils.js exists'
  },
  {
    name: 'Test Reporter',
    check: () => fs.existsSync(path.join(__dirname, 'utils', 'test-reporter.js')),
    fix: 'Ensure utils/test-reporter.js exists'
  },
  {
    name: 'E2E Tests',
    check: () => {
      const e2eDir = path.join(__dirname, 'e2e');
      const testFiles = [
        'comprehensive-functionality.test.js',
        'usability-stickiness.test.js',
        'performance.test.js'
      ];
      return testFiles.every(file => fs.existsSync(path.join(e2eDir, file)));
    },
    fix: 'Ensure all E2E test files exist in e2e/ directory'
  },
  {
    name: 'Test Runner',
    check: () => fs.existsSync(path.join(__dirname, 'test-runner.js')),
    fix: 'Ensure test-runner.js exists'
  },
  {
    name: 'Screenshots Directory',
    check: () => fs.existsSync(path.join(__dirname, 'screenshots')),
    fix: 'Create screenshots/ directory'
  },
  {
    name: 'Reports Directory',
    check: () => fs.existsSync(path.join(__dirname, 'reports')),
    fix: 'Create reports/ directory'
  },
  {
    name: 'Package.json',
    check: () => fs.existsSync(path.join(__dirname, 'package.json')),
    fix: 'Ensure package.json exists in tests/ directory'
  },
  {
    name: 'Node Modules',
    check: () => {
      try {
        require('puppeteer');
        return true;
      } catch (error) {
        return false;
      }
    },
    fix: 'Run: npm install puppeteer'
  }
];

let passed = 0;
let failed = 0;

checks.forEach(check => {
  try {
    if (check.check()) {
      console.log(`✅ ${check.name}`);
      passed++;
    } else {
      console.log(`❌ ${check.name}`);
      console.log(`   Fix: ${check.fix}`);
      failed++;
    }
  } catch (error) {
    console.log(`❌ ${check.name} (Error: ${error.message})`);
    console.log(`   Fix: ${check.fix}`);
    failed++;
  }
});

console.log(`\n📊 Validation Results:`);
console.log(`  ✅ Passed: ${passed}`);
console.log(`  ❌ Failed: ${failed}`);
console.log(`  📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

if (failed === 0) {
  console.log('\n🎉 Test setup is valid! Ready to run tests.');
  console.log('\n🚀 Quick Start:');
  console.log('  npm run test:e2e                 # Run all E2E tests');
  console.log('  npm run test:e2e:functionality   # Run functionality tests');
  console.log('  npm run test:e2e:usability       # Run usability tests');
  console.log('  npm run test:e2e:performance     # Run performance tests');
} else {
  console.log('\n⚠️ Please fix the failed checks before running tests.');
  process.exit(1);
}

console.log('\n📚 Documentation: tests/README.md');
console.log('🔧 Configuration: tests/config/test.config.js');
console.log('📊 Reports will be saved to: tests/reports/');
console.log('📸 Screenshots will be saved to: tests/screenshots/');

process.exit(0);
