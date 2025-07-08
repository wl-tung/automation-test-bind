#!/usr/bin/env node

// 🧱 Site Editor Test Runner - Corner Page Blocks Operations
// Specialized runner for testing site editor functionality

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🧱 Site Editor Test Runner - Corner Page Blocks Operations\n');

// Site Editor test configurations
const siteEditorTests = [
  {
    name: 'Add Corner Page Blocks',
    command: 'npx playwright test --project=chromium --workers=1 --timeout=120000 --retries=1 tests/e2e/Site-Editor-Test.spec.ts --grep="SET-01"',
    description: 'Test adding new corner page blocks to site'
  },
  {
    name: 'Duplicate Corner Page Blocks',
    command: 'npx playwright test --project=chromium --workers=1 --timeout=120000 --retries=1 tests/e2e/Site-Editor-Test.spec.ts --grep="SET-02"',
    description: 'Test duplicating existing corner page blocks'
  },
  {
    name: 'Move Corner Page Blocks',
    command: 'npx playwright test --project=chromium --workers=1 --timeout=120000 --retries=1 tests/e2e/Site-Editor-Test.spec.ts --grep="SET-03"',
    description: 'Test moving corner page blocks to different positions'
  },
  {
    name: 'Delete Corner Page Blocks',
    command: 'npx playwright test --project=chromium --workers=1 --timeout=120000 --retries=1 tests/e2e/Site-Editor-Test.spec.ts --grep="SET-04"',
    description: 'Test deleting corner page blocks from site'
  },
  {
    name: 'Comprehensive Workflow',
    command: 'npx playwright test --project=chromium --workers=1 --timeout=180000 --retries=1 tests/e2e/Site-Editor-Test.spec.ts --grep="SET-05"',
    description: 'Complete corner page blocks workflow test'
  }
];

// Cross-browser tests
const crossBrowserTests = [
  {
    name: 'WebKit - Add Corner Blocks',
    command: 'npx playwright test --project=webkit --workers=1 --timeout=150000 --retries=2 tests/e2e/Site-Editor-Test.spec.ts --grep="SET-01"',
    description: 'Cross-browser validation on WebKit'
  },
  {
    name: 'WebKit - Complete Workflow',
    command: 'npx playwright test --project=webkit --workers=1 --timeout=200000 --retries=2 tests/e2e/Site-Editor-Test.spec.ts --grep="SET-05"',
    description: 'Complete workflow on WebKit browser'
  }
];

// Execute test with enhanced error handling
async function runSiteEditorTest(test) {
  console.log(`\n🧱 ${test.name}`);
  console.log(`📋 ${test.description}`);
  console.log(`🔧 ${test.command}\n`);
  
  const startTime = Date.now();
  
  try {
    execSync(test.command, { 
      stdio: 'inherit',
      timeout: 300000 // 5 minute max per test
    });
    
    const duration = Math.round((Date.now() - startTime) / 1000);
    console.log(`\n✅ ${test.name} - PASSED (${duration}s)`);
    return { name: test.name, success: true, duration };
  } catch (error) {
    const duration = Math.round((Date.now() - startTime) / 1000);
    console.log(`\n❌ ${test.name} - FAILED (${duration}s)`);
    console.log(`📊 Exit code: ${error.status || 'unknown'}`);
    return { name: test.name, success: false, duration, error: error.message };
  }
}

// Generate site editor report
function generateSiteEditorReport(results) {
  console.log('\n🧱 SITE EDITOR TEST EXECUTION REPORT');
  console.log('═'.repeat(60));
  
  const passed = results.filter(r => r.success).length;
  const total = results.length;
  const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;
  const totalTime = results.reduce((sum, r) => sum + r.duration, 0);
  
  console.log(`\n🎯 Corner Page Blocks Pass Rate: ${passRate}% (${passed}/${total})`);
  console.log(`⏱️  Total Execution Time: ${totalTime}s`);
  console.log(`⚡ Average Time per Test: ${Math.round(totalTime / total)}s`);
  
  console.log('\n📋 Individual Test Results:');
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`   ${status} ${result.name} (${result.duration}s)`);
  });
  
  // Operation-specific analysis
  console.log('\n🧱 Corner Page Blocks Operations Analysis:');
  const operations = ['Add', 'Duplicate', 'Move', 'Delete', 'Comprehensive'];
  operations.forEach(op => {
    const opResults = results.filter(r => r.name.includes(op));
    if (opResults.length > 0) {
      const opPassed = opResults.filter(r => r.success).length;
      const opRate = Math.round((opPassed / opResults.length) * 100);
      console.log(`   ${op} Operations: ${opRate}% (${opPassed}/${opResults.length})`);
    }
  });
  
  // Recommendations
  if (passRate >= 90) {
    console.log('\n🎉 EXCELLENT: Site editor operations are highly reliable!');
    console.log('💡 Consider adding more complex block interaction scenarios');
  } else if (passRate >= 75) {
    console.log('\n✅ GOOD: Site editor operations are mostly reliable');
    console.log('💡 Focus on optimizing failed operations');
  } else if (passRate >= 50) {
    console.log('\n⚠️ MODERATE: Site editor operations need improvement');
    console.log('💡 Review block detection and interaction strategies');
  } else {
    console.log('\n❌ CRITICAL: Site editor operations need immediate attention');
    console.log('💡 Check site editor navigation and block element selectors');
  }
  
  return { passRate, passed, total, totalTime };
}

// Main execution
async function main() {
  const mode = process.argv[2] || 'core';
  
  console.log(`🧱 Running Site Editor tests in ${mode} mode...\n`);
  
  let testsToRun = [];
  
  if (mode === 'core' || mode === 'c') {
    testsToRun = siteEditorTests.slice(0, 4); // Core operations only
    console.log('🎯 Core Mode: Running Add, Duplicate, Move, Delete operations');
  } else if (mode === 'full' || mode === 'f') {
    testsToRun = siteEditorTests;
    console.log('🔧 Full Mode: Running all corner page blocks tests');
  } else if (mode === 'cross' || mode === 'x') {
    testsToRun = [...siteEditorTests.slice(0, 2), ...crossBrowserTests];
    console.log('🌐 Cross-Browser Mode: Testing on Chrome and WebKit');
  } else if (mode === 'quick' || mode === 'q') {
    testsToRun = [siteEditorTests[0], siteEditorTests[3]]; // Add and Delete only
    console.log('⚡ Quick Mode: Running Add and Delete operations only');
  } else {
    console.log('❓ Usage: node run-site-editor-tests.js [core|full|cross|quick]');
    console.log('   core (default): Add, Duplicate, Move, Delete operations');
    console.log('   full: All corner page blocks tests including workflow');
    console.log('   cross: Cross-browser testing on Chrome and WebKit');
    console.log('   quick: Only Add and Delete operations');
    process.exit(1);
  }
  
  console.log(`📊 Total tests to run: ${testsToRun.length}\n`);
  
  const results = [];
  
  for (const test of testsToRun) {
    const result = await runSiteEditorTest(test);
    results.push(result);
    
    // Early termination if too many failures
    if (results.length >= 2) {
      const failureRate = results.filter(r => !r.success).length / results.length;
      if (failureRate >= 0.75) {
        console.log('\n⚠️ High failure rate detected, stopping early execution');
        console.log('💡 Check site editor setup and block element detection');
        break;
      }
    }
  }
  
  const summary = generateSiteEditorReport(results);
  
  console.log('\n🧱 Site Editor test execution completed!');
  console.log(`📈 Final Pass Rate: ${summary.passRate}%`);
  
  // Specific recommendations for site editor
  if (summary.passRate < 75) {
    console.log('\n💡 SITE EDITOR TROUBLESHOOTING:');
    console.log('   1. Verify site editor navigation is working');
    console.log('   2. Check corner page block element selectors');
    console.log('   3. Validate block creation and positioning logic');
    console.log('   4. Test individual operations in isolation');
    console.log('   5. Review BiNDup editor interface changes');
  }
  
  // Exit with appropriate code
  process.exit(summary.passRate >= 50 ? 0 : 1);
}

// Error handling
process.on('unhandledRejection', (error) => {
  console.error('\n❌ Unhandled error:', error);
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log('\n⚠️ Site Editor test execution interrupted by user');
  process.exit(1);
});

// Execute
main().catch((error) => {
  console.error('\n❌ Site Editor test execution failed:', error);
  process.exit(1);
});
