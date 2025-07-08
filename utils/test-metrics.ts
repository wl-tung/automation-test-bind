// 📊 WORLD-CLASS TEST METRICS AND MONITORING SYSTEM

export interface TestMetric {
  id: string;
  operation: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  status: 'running' | 'success' | 'failed';
  error?: string;
  browser?: string;
}

export class TestMetrics {
  private static metrics: TestMetric[] = [];
  
  static startOperation(operation: string, browser?: string): string {
    const id = `${operation}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.metrics.push({
      id,
      operation,
      startTime: Date.now(),
      status: 'running',
      browser
    });
    TestLogger.logStep(`Starting: ${operation}`, 'start', browser);
    return id;
  }
  
  static endOperation(id: string, status: 'success' | 'failed', error?: string): void {
    const metric = this.metrics.find(m => m.id === id);
    if (metric) {
      metric.endTime = Date.now();
      metric.duration = metric.endTime - metric.startTime;
      metric.status = status;
      metric.error = error;
      
      TestLogger.logOperation(metric.operation, 'completed', status, metric.duration);
    }
  }
  
  static generateReport(): void {
    const successCount = this.metrics.filter(m => m.status === 'success').length;
    const totalCount = this.metrics.filter(m => m.status !== 'running').length;
    const successRate = totalCount > 0 ? (successCount / totalCount * 100) : 0;
    const avgDuration = this.metrics
      .filter(m => m.duration)
      .reduce((sum, m) => sum + (m.duration || 0), 0) / Math.max(1, this.metrics.filter(m => m.duration).length);
    
    console.log(`\n📊 COMPREHENSIVE TEST METRICS REPORT:`);
    console.log(`   🎯 Success Rate: ${successRate.toFixed(1)}% (${successCount}/${totalCount})`);
    console.log(`   ⏱️  Average Duration: ${avgDuration.toFixed(0)}ms`);
    console.log(`   📈 Total Operations: ${this.metrics.length}`);
    console.log(`   🔄 Currently Running: ${this.metrics.filter(m => m.status === 'running').length}`);
    
    if (this.metrics.some(m => m.status === 'failed')) {
      console.log(`   ❌ Failed Operations:`);
      this.metrics.filter(m => m.status === 'failed').forEach(m => {
        console.log(`      - ${m.operation}: ${m.error || 'Unknown error'}`);
      });
    }
    
    // Performance insights
    const slowOperations = this.metrics
      .filter(m => m.duration && m.duration > 30000)
      .sort((a, b) => (b.duration || 0) - (a.duration || 0));
    
    if (slowOperations.length > 0) {
      console.log(`   ⚠️  Slow Operations (>30s):`);
      slowOperations.slice(0, 3).forEach(m => {
        console.log(`      - ${m.operation}: ${m.duration}ms`);
      });
    }
  }
  
  static getMetrics(): TestMetric[] {
    return [...this.metrics];
  }
  
  static clearMetrics(): void {
    this.metrics = [];
  }
  
  static getSuccessRate(): number {
    const successCount = this.metrics.filter(m => m.status === 'success').length;
    const totalCount = this.metrics.filter(m => m.status !== 'running').length;
    return totalCount > 0 ? (successCount / totalCount * 100) : 0;
  }
}

// 🎯 Enhanced Logging System
export class TestLogger {
  static logStep(step: string, status: 'start' | 'success' | 'warning' | 'error', details?: string): void {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const icons = { start: '🔄', success: '✅', warning: '⚠️', error: '❌' };
    const icon = icons[status];
    
    console.log(`[${timestamp}] ${icon} ${step}${details ? ` - ${details}` : ''}`);
  }
  
  static logOperation(operation: string, target: string, result: 'success' | 'failed', duration?: number): void {
    const durationText = duration ? ` (${duration}ms)` : '';
    const status = result === 'success' ? 'success' : 'error';
    this.logStep(`${operation} on ${target}`, status, durationText);
  }
  
  static logBrowserInfo(browserName: string, url: string): void {
    this.logStep(`Browser: ${browserName}`, 'start', `URL: ${url}`);
  }
  
  static logPerformance(operation: string, duration: number, threshold: number): void {
    const status = duration <= threshold ? 'success' : 'warning';
    const message = `${operation} completed in ${duration}ms (threshold: ${threshold}ms)`;
    this.logStep('Performance', status, message);
  }
  
  static logPhase(phase: string, description: string): void {
    console.log(`\n🌟 ${phase.toUpperCase()}: ${description}`);
  }
  
  static logSeparator(): void {
    console.log('─'.repeat(80));
  }
}
