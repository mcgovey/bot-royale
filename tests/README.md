# BattleBot Arena Test Suite

A comprehensive end-to-end testing framework for BattleBot Arena using Puppeteer and modern testing practices.

## 🏗️ Test Architecture

### Directory Structure
```
tests/
├── config/                 # Test configuration
│   └── test.config.js      # Centralized test settings
├── utils/                  # Utility modules
│   ├── browser-utils.js    # Browser automation utilities
│   ├── game-utils.js       # Game-specific test utilities
│   └── test-reporter.js    # Test reporting and HTML generation
├── e2e/                    # End-to-end test suites
│   ├── comprehensive-functionality.test.js
│   ├── usability-stickiness.test.js
│   └── performance.test.js
├── screenshots/            # Test screenshots
├── reports/               # Generated test reports (JSON & HTML)
├── archive/               # Archived old test files
├── fixtures/              # Test data and fixtures
├── integration/           # Integration tests (future)
├── unit/                  # Unit tests (future)
├── test-runner.js         # Main test runner
├── package.json           # Test dependencies
└── README.md              # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- Chrome/Chromium browser
- BattleBot Arena application running on `http://localhost:3000`

### Installation
```bash
# Install test dependencies
cd tests
npm install

# Or install from project root
npm install
```

### Running Tests

#### Run All Tests
```bash
# From project root
npm run test:e2e

# From tests directory
npm run test
```

#### Run Individual Test Suites
```bash
# Comprehensive functionality test
npm run test:e2e:functionality

# Usability and stickiness test
npm run test:e2e:usability

# Performance test
npm run test:e2e:performance
```

#### Run Complete Test Suite (Unit + Integration + E2E)
```bash
npm run test:all
```

## 🧪 Test Suites

### 1. Comprehensive Functionality Test
**File**: `e2e/comprehensive-functionality.test.js`

Tests all major application features:
- ✅ Application loading and initialization
- ✅ Bot builder visibility and readability
- ✅ Component selection and visual feedback
- ✅ Battle arena transition and features
- ✅ Gameplay mechanics and statistics
- ✅ Battle duration monitoring
- ✅ Navigation and memory management

**Expected Results**:
- All bot options visible and readable
- Battle duration ≥ 3 minutes
- Multiple AI opponents present
- Tutorial and statistics systems working
- Memory usage stable

### 2. Usability & Stickiness Test
**File**: `e2e/usability-stickiness.test.js`

Evaluates user experience and engagement:
- 🎯 First impression and interface clarity
- 👁️ Option readability before selection
- 🎮 Selection feedback and engagement
- ⚔️ Battle engagement and tutorial effectiveness
- 📊 Sustained engagement monitoring
- 🏆 Stickiness score calculation (target: ≥60/100)

**Engagement Metrics**:
- Time spent in builder and battle
- Component changes and customization
- Tutorial interaction and stats viewing
- User action tracking and analysis

### 3. Performance Test
**File**: `e2e/performance.test.js`

Monitors application performance:
- ⚡ Load time and initialization speed
- 🧠 Memory usage patterns and leak detection
- 🎨 3D rendering performance and WebGL support
- 🎮 Battle performance and interaction latency
- 📈 Performance rating calculation

**Performance Criteria**:
- Load time < 10 seconds
- Memory increase < 50%
- Interaction latency < 1 second
- WebGL support available
- No significant memory leaks

## 📊 Test Reports

### Console Output
Real-time test progress with:
- ✅/❌ Individual test results
- 📊 Memory usage monitoring
- ⏱️ Duration tracking
- 📸 Screenshot notifications

### Generated Reports
- **JSON Reports**: `tests/reports/*.json` - Machine-readable results
- **HTML Reports**: `tests/reports/*.html` - Human-readable with metrics
- **Screenshots**: `tests/screenshots/*.png` - Visual evidence

### Report Features
- 📈 Success rate and overall status
- 📊 Detailed metrics and performance data
- 💡 Automated recommendations
- 🔍 Error details with stack traces
- 📸 Screenshot gallery

## ⚙️ Configuration

### Test Configuration
Edit `config/test.config.js` to customize:

```javascript
const testConfig = {
  app: {
    baseUrl: 'http://localhost:3000',
    loadTimeout: 30000
  },
  browser: {
    headless: false,
    viewport: { width: 1920, height: 1080 }
  },
  expected: {
    battleDuration: 180,
    minAIOpponents: 3,
    minStickinessScore: 60,
    maxMemoryIncrease: 50
  }
};
```

### Browser Settings
- **Headless Mode**: Set `browser.headless: true` for CI/CD
- **Viewport**: Adjust resolution for different screen sizes
- **Timeouts**: Configure wait times for slow environments

## 🛠️ Utilities

### BrowserUtils
Common browser operations:
- Browser launching and navigation
- Memory monitoring and analysis
- Element interaction and screenshots
- Cleanup and resource management

### GameUtils
Game-specific testing:
- Bot builder visibility testing
- Component selection validation
- Battle arena feature testing
- Gameplay mechanics simulation
- Engagement metrics calculation

### TestReporter
Comprehensive reporting:
- Structured test result tracking
- HTML and JSON report generation
- Screenshot management
- Metrics aggregation and analysis

## 🎯 Best Practices

### Test Organization
- **Modular Design**: Separate utilities, configuration, and tests
- **Reusable Components**: Common operations in utility classes
- **Clear Naming**: Descriptive test and function names
- **Documentation**: Comprehensive comments and README

### Error Handling
- **Graceful Failures**: Tests continue after non-critical errors
- **Error Screenshots**: Automatic capture on test failures
- **Detailed Logging**: Comprehensive error messages and stack traces
- **Cleanup**: Proper resource cleanup in finally blocks

### Performance
- **Memory Monitoring**: Track memory usage throughout tests
- **Efficient Selectors**: Use specific, fast CSS selectors
- **Parallel Execution**: Independent tests can run concurrently
- **Resource Cleanup**: Proper browser and resource management

## 🔧 Troubleshooting

### Common Issues

#### Application Not Running
```bash
Error: Navigation timeout
```
**Solution**: Ensure BattleBot Arena is running on `http://localhost:3000`

#### Browser Launch Failures
```bash
Error: Failed to launch browser
```
**Solutions**:
- Install Chrome/Chromium
- Check browser permissions
- Try headless mode: `browser.headless: true`

#### Memory Issues
```bash
Error: Page crashed
```
**Solutions**:
- Increase system memory
- Enable headless mode
- Reduce browser arguments

#### Timeout Errors
```bash
Error: Waiting for selector timed out
```
**Solutions**:
- Increase timeout values in config
- Check element selectors
- Verify application state

### Debug Mode
Enable verbose logging:
```javascript
// In test files
console.log('Debug info:', debugData);

// Browser console logs
page.on('console', msg => console.log('Browser:', msg.text()));
```

## 📈 Metrics and KPIs

### Success Criteria
- **Functionality**: All major features working
- **Usability**: Stickiness score ≥ 60/100
- **Performance**: Load time < 10s, memory stable
- **Reliability**: Tests pass consistently

### Key Metrics
- **Test Coverage**: Feature coverage percentage
- **Success Rate**: Passing tests / total tests
- **Performance Score**: Composite performance rating
- **User Engagement**: Stickiness and interaction metrics

## 🚀 CI/CD Integration

### GitHub Actions Example
```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run build
      - run: npm start &
      - run: npm run test:e2e
```

### Docker Support
```dockerfile
FROM node:16
RUN apt-get update && apt-get install -y chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
COPY . .
RUN npm install
CMD ["npm", "run", "test:e2e"]
```

## 📝 Contributing

### Adding New Tests
1. Create test file in appropriate directory
2. Follow naming convention: `*.test.js`
3. Use utility classes for common operations
4. Add comprehensive documentation
5. Update test runner if needed

### Test Guidelines
- **Atomic Tests**: Each test should be independent
- **Clear Assertions**: Specific, meaningful test conditions
- **Error Handling**: Graceful failure handling
- **Documentation**: Comment complex test logic

## 📄 License

MIT License - see LICENSE file for details

---

**🎮 Ready to ensure BattleBot Arena quality? Run the tests and build with confidence!**
