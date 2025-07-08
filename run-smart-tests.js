#!/usr/bin/env node

// 🚀 SMART TEST RUNNER - Optimized for Chrome and WebKit only
// Fast execution with intelligent test selection and reporting

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class SmartTestRunner {
  constructor() {
    this.startTime = Date.now();
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      duration: 0
    };
  }

  /**
   * 🚀 MAIN EXECUTION METHOD
   */
  async run() {
    console.log('🚀 Starting Smart Test Execution (Chrome + WebKit Only)');
    console.log('⚡ Optimized for speed and reliability\n');

    try {
      // Step 1: Clean previous results
      this.cleanPreviousResults();

      // Step 2: Run optimized test command
      await this.runOptimizedTests();

      // Step 3: Generate smart report
      await this.generateSmartReport();

    } catch (error) {
      console.error('❌ Smart test execution failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * 🧹 CLEAN PREVIOUS RESULTS
   */
  cleanPreviousResults() {
    console.log('🧹 Cleaning previous test results...');
    
    const cleanupPaths = [
      'test-results',
      'playwright-report',
      'test-results-*'
    ];

    cleanupPaths.forEach(cleanupPath => {
      try {
        if (fs.existsSync(cleanupPath)) {
          execSync(`rm -rf ${cleanupPath}`, { stdio: 'ignore' });
        }
      } catch (error) {
        // Ignore cleanup errors
      }
    });

    console.log('✅ Cleanup completed\n');
  }

  /**
   * ⚡ RUN OPTIMIZED TESTS
   */
  async runOptimizedTests() {
    console.log('⚡ Running optimized tests...\n');

    // Smart test command with optimizations
    const testCommand = [
      'npx playwright test',
      '--project=chromium',
      '--project=webkit',
      '--workers=2',                    // Parallel execution
      '--max-failures=5',               // Stop after 5 failures to save time
      '--timeout=60000',                // 60 second timeout per test
      '--reporter=html,line,json',      // Multiple reporters
      '--output-dir=test-results',
      'tests/e2e/'                      // Focus on e2e tests only
    ].join(' ');

    console.log('🔧 Command:', testCommand);
    console.log('⏱️  Starting execution...\n');

    try {
      const output = execSync(testCommand, { 
        encoding: 'utf8',
        stdio: 'inherit',
        maxBuffer: 1024 * 1024 * 10 // 10MB buffer
      });
      
      console.log('\n✅ Test execution completed successfully');
    } catch (error) {
      console.log('\n⚠️ Test execution completed with some failures');
      // Don't throw error here, we want to generate report anyway
    }
  }

  /**
   * 📊 GENERATE SMART REPORT
   */
  async generateSmartReport() {
    console.log('\n📊 Generating smart test report...');

    try {
      // Read test results
      const resultsPath = 'test-results/.last-run.json';
      if (fs.existsSync(resultsPath)) {
        const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
        this.analyzeResults(results);
      }

      // Generate summary
      this.generateSummary();

      // Open HTML report
      this.openHTMLReport();

    } catch (error) {
      console.error('⚠️ Report generation had issues:', error.message);
    }
  }

  /**
   * 🔍 ANALYZE RESULTS
   */
  analyzeResults(results) {
    console.log('\n🔍 Analyzing test results...');

    if (results.stats) {
      this.results = {
        total: results.stats.total || 0,
        passed: results.stats.passed || 0,
        failed: results.stats.failed || 0,
        skipped: results.stats.skipped || 0,
        duration: results.stats.duration || 0
      };
    }

    // Analyze failure patterns
    if (results.suites) {
      this.analyzeFailurePatterns(results.suites);
    }
  }

  /**
   * 🔍 ANALYZE FAILURE PATTERNS
   */
  analyzeFailurePatterns(suites) {
    const failurePatterns = new Map();
    
    const analyzeSuite = (suite) => {
      if (suite.tests) {
        suite.tests.forEach(test => {
          if (test.results && test.results.some(r => r.status === 'failed')) {
            const pattern = this.extractFailurePattern(test);
            failurePatterns.set(pattern, (failurePatterns.get(pattern) || 0) + 1);
          }
        });
      }
      
      if (suite.suites) {
        suite.suites.forEach(analyzeSuite);
      }
    };

    suites.forEach(analyzeSuite);

    if (failurePatterns.size > 0) {
      console.log('\n🔍 Failure Patterns Detected:');
      failurePatterns.forEach((count, pattern) => {
        console.log(`   • ${pattern}: ${count} occurrences`);
      });
    }
  }

  /**
   * Extract failure pattern from test
   */
  extractFailurePattern(test) {
    if (test.title.includes('BiNDup')) return 'BiNDup Launch Issues';
    if (test.title.includes('Site')) return 'Site Management Issues';
    if (test.title.includes('Image')) return 'Image Management Issues';
    if (test.title.includes('Upload')) return 'Upload Issues';
    return 'General Test Issues';
  }

  /**
   * 📋 GENERATE SUMMARY
   */
  generateSummary() {
    const duration = Date.now() - this.startTime;
    const passRate = this.results.total > 0 ? 
      ((this.results.passed / this.results.total) * 100).toFixed(1) : 0;

    console.log('\n' + '='.repeat(60));
    console.log('📋 SMART TEST EXECUTION SUMMARY');
    console.log('='.repeat(60));
    console.log(`⏱️  Total Duration: ${Math.round(duration / 1000)}s`);
    console.log(`📊 Total Tests: ${this.results.total}`);
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`⏭️  Skipped: ${this.results.skipped}`);
    console.log(`📈 Pass Rate: ${passRate}%`);
    console.log('='.repeat(60));

    // Performance analysis
    if (duration < 300000) { // Less than 5 minutes
      console.log('🚀 EXCELLENT: Fast execution time!');
    } else if (duration < 600000) { // Less than 10 minutes
      console.log('⚡ GOOD: Reasonable execution time');
    } else {
      console.log('⚠️  SLOW: Consider further optimizations');
    }

    // Pass rate analysis
    if (passRate >= 95) {
      console.log('🎯 EXCELLENT: High pass rate achieved!');
    } else if (passRate >= 85) {
      console.log('👍 GOOD: Decent pass rate');
    } else {
      console.log('🔧 NEEDS WORK: Low pass rate - check failure patterns');
    }

    console.log('='.repeat(60) + '\n');
  }

  /**
   * 🌐 OPEN HTML REPORT
   */
  openHTMLReport() {
    const reportPath = 'playwright-report/index.html';
    
    if (fs.existsSync(reportPath)) {
      console.log('🌐 Opening HTML report...');
      
      try {
        // Try to open the report
        const command = process.platform === 'darwin' ? 'open' : 
                      process.platform === 'win32' ? 'start' : 'xdg-open';
        
        execSync(`${command} ${reportPath}`, { stdio: 'ignore' });
        console.log('✅ HTML report opened in browser');
      } catch (error) {
        console.log(`⚠️ Could not auto-open report. Please open: ${path.resolve(reportPath)}`);
      }
    } else {
      console.log('⚠️ HTML report not found');
    }
  }
}

// 🚀 EXECUTE SMART TEST RUNNER
if (require.main === module) {
  const runner = new SmartTestRunner();
  runner.run().catch(error => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
}

module.exports = SmartTestRunner;
