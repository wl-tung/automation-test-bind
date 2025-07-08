import { Page } from '@playwright/test';

/**
 * 🛠️ Test Utilities
 * Common utility functions for test automation
 */
export class TestUtils {
  
  /**
   * 📸 Capture screenshot with Gherkin context
   */
  static async captureGherkinScreenshot(
    page: Page, 
    gherkinStep: 'given' | 'when' | 'then' | 'and', 
    description: string
  ): Promise<string> {
    const timestamp = Date.now();
    const filename = `${gherkinStep}-${description.toLowerCase().replace(/\s+/g, '-')}-${timestamp}.png`;
    
    await page.screenshot({ 
      path: filename,
      fullPage: true 
    });
    
    console.log(`📸 Screenshot captured: ${filename}`);
    return filename;
  }

  /**
   * ⏱️ Performance timer utility
   */
  static createPerformanceTimer() {
    const startTime = Date.now();
    
    return {
      getElapsed: () => Date.now() - startTime,
      logElapsed: (operation: string) => {
        const elapsed = Date.now() - startTime;
        console.log(`⏱️ ${operation}: ${elapsed}ms`);
        return elapsed;
      }
    };
  }

  /**
   * 🔄 Retry utility with exponential backoff
   */
  static async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) {
          throw lastError;
        }
        
        const delay = baseDelay * Math.pow(2, attempt - 1);
        console.log(`⚠️ Attempt ${attempt} failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError!;
  }

  /**
   * 🎯 Wait for condition with timeout
   */
  static async waitForCondition(
    condition: () => Promise<boolean>,
    timeout: number = 10000,
    interval: number = 500
  ): Promise<boolean> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      if (await condition()) {
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, interval));
    }
    
    return false;
  }

  /**
   * 📊 Generate test report data
   */
  static generateTestReport(testName: string, startTime: number, success: boolean, details?: any) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    return {
      testName,
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      duration: `${duration}ms`,
      success,
      details: details || {}
    };
  }

  /**
   * 🔍 Element visibility checker with multiple strategies
   */
  static async isElementVisible(page: Page, selectors: string[], timeout: number = 2000): Promise<boolean> {
    for (const selector of selectors) {
      try {
        let element;
        
        if (selector.startsWith('getBy')) {
          element = eval(`page.${selector}`);
        } else {
          element = page.locator(selector).first();
        }
        
        if (await element.isVisible({ timeout })) {
          return true;
        }
      } catch {
        continue;
      }
    }
    return false;
  }

  /**
   * 📝 Gherkin step logger
   */
  static logGherkinStep(step: 'GIVEN' | 'WHEN' | 'THEN' | 'AND', description: string): void {
    const emoji = {
      'GIVEN': '📍',
      'WHEN': '📍', 
      'THEN': '📍',
      'AND': '📍'
    };
    
    console.log(`${emoji[step]} ${step}: ${description}`);
  }

  /**
   * 🎨 Format test results for reporting
   */
  static formatTestResults(results: any[]): string {
    const totalTests = results.length;
    const passedTests = results.filter(r => r.success).length;
    const failedTests = totalTests - passedTests;
    const successRate = ((passedTests / totalTests) * 100).toFixed(1);
    
    return `
📊 TEST EXECUTION SUMMARY:
✅ Passed: ${passedTests}/${totalTests}
❌ Failed: ${failedTests}/${totalTests}  
📈 Success Rate: ${successRate}%
⏱️ Total Duration: ${results.reduce((sum, r) => sum + parseInt(r.duration), 0)}ms
    `.trim();
  }

  /**
   * 🔧 Browser compatibility checker
   */
  static getBrowserInfo(page: Page): Promise<any> {
    return page.evaluate(() => ({
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    }));
  }

  /**
   * 🎯 Smart wait utility
   */
  static async smartWait(page: Page, condition: string, timeout: number = 10000): Promise<boolean> {
    try {
      switch (condition) {
        case 'networkidle':
          await page.waitForLoadState('networkidle', { timeout });
          break;
        case 'domcontentloaded':
          await page.waitForLoadState('domcontentloaded', { timeout });
          break;
        default:
          await page.waitForTimeout(timeout);
      }
      return true;
    } catch {
      return false;
    }
  }
}
