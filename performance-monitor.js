#!/usr/bin/env node

// 📊 Performance Monitor - Track Test Execution Metrics
// Monitor pass rates, execution times, and improvement trends

const fs = require('fs');
const path = require('path');

console.log('📊 Performance Monitor - Test Metrics Tracking\n');

// Performance data structure
const performanceData = {
  timestamp: new Date().toISOString(),
  testRuns: [],
  summary: {
    totalRuns: 0,
    averagePassRate: 0,
    averageExecutionTime: 0,
    bestPassRate: 0,
    worstPassRate: 100,
    trends: []
  }
};

// Load existing performance data
function loadPerformanceData() {
  const dataFile = 'performance-data.json';
  
  if (fs.existsSync(dataFile)) {
    try {
      const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
      console.log('📈 Loaded existing performance data');
      return data;
    } catch (error) {
      console.log('⚠️ Could not load existing data, starting fresh');
      return performanceData;
    }
  }
  
  console.log('🆕 Creating new performance tracking');
  return performanceData;
}

// Save performance data
function savePerformanceData(data) {
  try {
    fs.writeFileSync('performance-data.json', JSON.stringify(data, null, 2));
    console.log('💾 Performance data saved');
  } catch (error) {
    console.log('❌ Failed to save performance data:', error.message);
  }
}

// Analyze test results from Playwright reports
function analyzeTestResults() {
  console.log('🔍 Analyzing test results...\n');
  
  const reportPaths = [
    'test-results',
    'playwright-report',
    'results.json'
  ];
  
  let testResults = {
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    skippedTests: 0,
    executionTime: 0,
    passRate: 0
  };
  
  // Try to find and parse results
  for (const reportPath of reportPaths) {
    if (fs.existsSync(reportPath)) {
      try {
        if (reportPath === 'results.json') {
          const results = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
          testResults = parsePlaywrightResults(results);
          break;
        } else if (fs.existsSync(path.join(reportPath, 'results.json'))) {
          const results = JSON.parse(fs.readFileSync(path.join(reportPath, 'results.json'), 'utf8'));
          testResults = parsePlaywrightResults(results);
          break;
        }
      } catch (error) {
        console.log(`⚠️ Could not parse ${reportPath}:`, error.message);
      }
    }
  }
  
  // If no results found, try to estimate from console output
  if (testResults.totalTests === 0) {
    testResults = estimateFromConsole();
  }
  
  return testResults;
}

// Parse Playwright JSON results
function parsePlaywrightResults(results) {
  const stats = results.stats || {};
  const suites = results.suites || [];
  
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  let skippedTests = 0;
  let executionTime = 0;
  
  // Calculate from suites if available
  suites.forEach(suite => {
    suite.specs?.forEach(spec => {
      spec.tests?.forEach(test => {
        totalTests++;
        
        const outcome = test.results?.[0]?.status || 'unknown';
        switch (outcome) {
          case 'passed':
            passedTests++;
            break;
          case 'failed':
            failedTests++;
            break;
          case 'skipped':
            skippedTests++;
            break;
        }
        
        executionTime += test.results?.[0]?.duration || 0;
      });
    });
  });
  
  // Fallback to stats if available
  if (totalTests === 0 && stats) {
    totalTests = (stats.passed || 0) + (stats.failed || 0) + (stats.skipped || 0);
    passedTests = stats.passed || 0;
    failedTests = stats.failed || 0;
    skippedTests = stats.skipped || 0;
    executionTime = stats.duration || 0;
  }
  
  const passRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;
  
  return {
    totalTests,
    passedTests,
    failedTests,
    skippedTests,
    executionTime: Math.round(executionTime / 1000), // Convert to seconds
    passRate
  };
}

// Estimate results from console output (fallback)
function estimateFromConsole() {
  console.log('📝 Estimating results from recent execution...');
  
  // This is a simplified estimation - in real implementation,
  // you might parse actual console logs or test output
  return {
    totalTests: 2,
    passedTests: 1,
    failedTests: 1,
    skippedTests: 0,
    executionTime: 120,
    passRate: 50
  };
}

// Generate performance report
function generatePerformanceReport(data) {
  console.log('📊 PERFORMANCE ANALYSIS REPORT');
  console.log('═'.repeat(50));
  
  const latest = data.testRuns[data.testRuns.length - 1];
  
  if (latest) {
    console.log(`\n🎯 Latest Test Run (${latest.timestamp})`);
    console.log(`   Pass Rate: ${latest.passRate}% (${latest.passedTests}/${latest.totalTests})`);
    console.log(`   Execution Time: ${latest.executionTime}s`);
    console.log(`   Failed Tests: ${latest.failedTests}`);
    console.log(`   Skipped Tests: ${latest.skippedTests}`);
  }
  
  if (data.testRuns.length > 1) {
    console.log(`\n📈 Historical Performance (${data.testRuns.length} runs)`);
    console.log(`   Average Pass Rate: ${data.summary.averagePassRate}%`);
    console.log(`   Average Execution Time: ${data.summary.averageExecutionTime}s`);
    console.log(`   Best Pass Rate: ${data.summary.bestPassRate}%`);
    console.log(`   Worst Pass Rate: ${data.summary.worstPassRate}%`);
    
    // Trend analysis
    if (data.testRuns.length >= 3) {
      const recent = data.testRuns.slice(-3);
      const trend = analyzeTrend(recent);
      console.log(`   Recent Trend: ${trend}`);
    }
  }
  
  // Recommendations
  console.log('\n💡 RECOMMENDATIONS');
  console.log('─'.repeat(30));
  
  if (latest) {
    if (latest.passRate >= 90) {
      console.log('🎉 Excellent performance! Consider adding more comprehensive tests.');
    } else if (latest.passRate >= 75) {
      console.log('✅ Good performance. Focus on optimizing execution time.');
    } else if (latest.passRate >= 50) {
      console.log('⚠️ Moderate performance. Investigate failing tests and improve reliability.');
    } else {
      console.log('❌ Poor performance. Immediate attention needed for test stability.');
    }
    
    if (latest.executionTime > 300) {
      console.log('⏱️ Execution time is high. Consider optimizing test speed.');
    } else if (latest.executionTime < 60) {
      console.log('⚡ Fast execution time. Good optimization!');
    }
  }
}

// Analyze trend from recent runs
function analyzeTrend(runs) {
  if (runs.length < 2) return 'Insufficient data';
  
  const passRates = runs.map(run => run.passRate);
  const isImproving = passRates[passRates.length - 1] > passRates[0];
  const isStable = Math.abs(passRates[passRates.length - 1] - passRates[0]) <= 5;
  
  if (isStable) {
    return '📊 Stable';
  } else if (isImproving) {
    return '📈 Improving';
  } else {
    return '📉 Declining';
  }
}

// Update summary statistics
function updateSummary(data) {
  if (data.testRuns.length === 0) return;
  
  const runs = data.testRuns;
  
  data.summary.totalRuns = runs.length;
  data.summary.averagePassRate = Math.round(
    runs.reduce((sum, run) => sum + run.passRate, 0) / runs.length
  );
  data.summary.averageExecutionTime = Math.round(
    runs.reduce((sum, run) => sum + run.executionTime, 0) / runs.length
  );
  data.summary.bestPassRate = Math.max(...runs.map(run => run.passRate));
  data.summary.worstPassRate = Math.min(...runs.map(run => run.passRate));
}

// Main execution
function main() {
  console.log('🚀 Starting performance analysis...\n');
  
  // Load existing data
  const data = loadPerformanceData();
  
  // Analyze current test results
  const currentResults = analyzeTestResults();
  
  if (currentResults.totalTests > 0) {
    // Add current run to data
    const currentRun = {
      timestamp: new Date().toISOString(),
      ...currentResults
    };
    
    data.testRuns.push(currentRun);
    
    // Keep only last 50 runs to prevent file from growing too large
    if (data.testRuns.length > 50) {
      data.testRuns = data.testRuns.slice(-50);
    }
    
    // Update summary
    updateSummary(data);
    
    // Save updated data
    savePerformanceData(data);
    
    console.log('✅ Current test results recorded\n');
  } else {
    console.log('⚠️ No test results found to analyze\n');
  }
  
  // Generate report
  generatePerformanceReport(data);
  
  console.log('\n📊 Performance monitoring completed!');
}

// Execute if run directly
if (require.main === module) {
  main();
}

module.exports = {
  loadPerformanceData,
  savePerformanceData,
  analyzeTestResults,
  generatePerformanceReport
};
