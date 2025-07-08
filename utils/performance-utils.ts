// ⚡ PERFORMANCE MONITORING AND RETRY UTILITIES

import { TestMetrics, TestLogger } from './test-metrics';

// ⚡ Performance Monitoring System
export class PerformanceMonitor {
  static async monitorOperation<T>(
    operation: () => Promise<T>,
    operationName: string,
    expectedDuration: number = 30000
  ): Promise<T> {
    const startTime = Date.now();
    const metricId = TestMetrics.startOperation(`Performance: ${operationName}`);
    
    try {
      const result = await operation();
      const duration = Date.now() - startTime;
      
      TestLogger.logPerformance(operationName, duration, expectedDuration);
      TestMetrics.endOperation(metricId, 'success');
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      TestLogger.logStep(`Performance monitoring failed for ${operationName}`, 'error', `Duration: ${duration}ms, Error: ${error.message}`);
      TestMetrics.endOperation(metricId, 'failed', error.message);
      throw error;
    }
  }
  
  static async measurePageLoad(page: any): Promise<number> {
    const startTime = Date.now();
    await page.waitForLoadState('networkidle');
    return Date.now() - startTime;
  }
  
  static async measureElementInteraction(page: any, selector: string, action: 'click' | 'hover' | 'type', value?: string): Promise<number> {
    const startTime = Date.now();
    const element = page.locator(selector);
    
    switch (action) {
      case 'click':
        await element.click();
        break;
      case 'hover':
        await element.hover();
        break;
      case 'type':
        await element.fill(value || '');
        break;
    }
    
    return Date.now() - startTime;
  }
}

// 🔄 Retry Mechanism with Exponential Backoff
export async function executeWithRetry<T>(
  operation: () => Promise<T>,
  description: string,
  maxRetries: number = 3,
  baseDelay: number = 2000
): Promise<T> {
  const metricId = TestMetrics.startOperation(`Retry Operation: ${description}`);
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      TestLogger.logStep(`${description} (attempt ${attempt}/${maxRetries})`, 'start');
      const result = await operation();
      TestLogger.logStep(`${description} succeeded on attempt ${attempt}`, 'success');
      TestMetrics.endOperation(metricId, 'success');
      return result;
    } catch (error) {
      TestLogger.logStep(`${description} failed on attempt ${attempt}`, 'warning', error.message);
      
      if (attempt === maxRetries) {
        TestLogger.logStep(`${description} failed after ${maxRetries} attempts`, 'error', error.message);
        TestMetrics.endOperation(metricId, 'failed', `Failed after ${maxRetries} attempts: ${error.message}`);
        throw error;
      }
      
      // Exponential backoff
      const delay = baseDelay * Math.pow(2, attempt - 1);
      TestLogger.logStep(`Waiting ${delay}ms before retry`, 'start');
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw new Error(`Unexpected error in executeWithRetry for ${description}`);
}

// 🎯 Smart Wait Strategies
export class SmartWaits {
  static async adaptiveWait(page: any, selector: string, description: string): Promise<void> {
    TestLogger.logStep(`⏳ Waiting for ${description}...`, 'start');
    
    try {
      // First try: Quick wait
      await page.locator(selector).waitFor({ timeout: 10000 });
      TestLogger.logStep(`✅ ${description} found quickly`, 'success');
    } catch (error) {
      TestLogger.logStep(`⚠️ ${description} not found quickly, trying extended wait...`, 'warning');
      
      // Second try: Extended wait with page refresh
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      try {
        await page.locator(selector).waitFor({ timeout: 30000 });
        TestLogger.logStep(`✅ ${description} found after extended wait`, 'success');
      } catch (extendedError) {
        TestLogger.logStep(`❌ ${description} not found even after extended wait`, 'error');
        throw extendedError;
      }
    }
  }
  
  static async waitForPageReady(page: any, timeout: number = 30000): Promise<void> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      try {
        // Check if page is ready
        const isReady = await page.evaluate(() => {
          return document.readyState === 'complete' && 
                 !document.querySelector('.loading, .spinner, [data-loading="true"]');
        });
        
        if (isReady) {
          TestLogger.logStep('Page ready state confirmed', 'success');
          return;
        }
        
        await page.waitForTimeout(1000);
      } catch (error) {
        TestLogger.logStep('Page ready check failed', 'warning', error.message);
        await page.waitForTimeout(1000);
      }
    }
    
    throw new Error(`Page not ready within ${timeout}ms`);
  }
  
  static async waitForNetworkIdle(page: any, timeout: number = 30000): Promise<void> {
    try {
      await page.waitForLoadState('networkidle', { timeout });
      TestLogger.logStep('Network idle state achieved', 'success');
    } catch (error) {
      TestLogger.logStep('Network idle timeout', 'warning', `Continuing after ${timeout}ms`);
    }
  }
}

// 📊 Performance Benchmarks
export class PerformanceBenchmarks {
  private static benchmarks: Map<string, number[]> = new Map();
  
  static recordBenchmark(operation: string, duration: number): void {
    if (!this.benchmarks.has(operation)) {
      this.benchmarks.set(operation, []);
    }
    this.benchmarks.get(operation)!.push(duration);
  }
  
  static getBenchmarkStats(operation: string): { avg: number; min: number; max: number; count: number } | null {
    const durations = this.benchmarks.get(operation);
    if (!durations || durations.length === 0) {
      return null;
    }
    
    return {
      avg: durations.reduce((sum, d) => sum + d, 0) / durations.length,
      min: Math.min(...durations),
      max: Math.max(...durations),
      count: durations.length
    };
  }
  
  static generateBenchmarkReport(): void {
    console.log('\n📊 PERFORMANCE BENCHMARK REPORT:');
    
    for (const [operation, durations] of this.benchmarks.entries()) {
      const stats = this.getBenchmarkStats(operation);
      if (stats) {
        console.log(`   ${operation}:`);
        console.log(`     Average: ${stats.avg.toFixed(0)}ms`);
        console.log(`     Range: ${stats.min}ms - ${stats.max}ms`);
        console.log(`     Samples: ${stats.count}`);
      }
    }
  }
}
