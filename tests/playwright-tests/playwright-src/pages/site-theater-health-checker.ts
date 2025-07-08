import { Page, Locator } from '@playwright/test';

/**
 * Site Theater Health Checker
 * Comprehensive health monitoring for Site Theater application
 * Ensures the application is functional, not just loaded
 */
export class SiteTheaterHealthChecker {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Comprehensive health check for Site Theater
   */
  async performHealthCheck(): Promise<HealthCheckResult> {
    console.log('🏥 Starting comprehensive Site Theater health check...');
    
    const result: HealthCheckResult = {
      overall: 'UNKNOWN',
      checks: {},
      timestamp: new Date().toISOString(),
      url: this.page.url(),
      browser: this.page.context().browser()?.browserType().name() || 'unknown'
    };

    // 1. Basic Page Health
    result.checks.basicPage = await this.checkBasicPageHealth();
    
    // 2. Application Loading
    result.checks.appLoading = await this.checkApplicationLoading();
    
    // 3. Core Functionality
    result.checks.coreFunctionality = await this.checkCoreFunctionality();
    
    // 4. User Interface
    result.checks.userInterface = await this.checkUserInterface();
    
    // 5. Performance
    result.checks.performance = await this.checkPerformance();
    
    // 6. Error Detection
    result.checks.errorDetection = await this.checkForErrors();
    
    // 7. Network Health
    result.checks.networkHealth = await this.checkNetworkHealth();
    
    // 8. Interactive Elements
    result.checks.interactiveElements = await this.checkInteractiveElements();

    // Calculate overall health
    result.overall = this.calculateOverallHealth(result.checks);
    
    console.log(`🏥 Health check completed: ${result.overall}`);
    return result;
  }

  /**
   * Check basic page health (DOM, title, etc.)
   */
  async checkBasicPageHealth(): Promise<HealthCheck> {
    console.log('🔍 Checking basic page health...');
    
    try {
      // Check page title
      const title = await this.page.title();
      const hasTitleCheck = title && title.length > 0;
      
      // Check body exists
      const bodyCount = await this.page.locator('body').count();
      const hasBodyCheck = bodyCount === 1;
      
      // Check document ready state
      const readyState = await this.page.evaluate(() => document.readyState);
      const isReadyCheck = ['interactive', 'complete'].includes(readyState);
      
      // Check viewport
      const viewport = this.page.viewportSize();
      const hasViewportCheck = viewport && viewport.width > 0 && viewport.height > 0;

      const passed = hasTitleCheck && hasBodyCheck && isReadyCheck && hasViewportCheck;
      
      return {
        status: passed ? 'PASS' : 'FAIL',
        details: {
          title: title || 'No title',
          bodyExists: hasBodyCheck,
          readyState: readyState,
          viewport: viewport,
          checks: {
            hasTitle: hasTitleCheck,
            hasBody: hasBodyCheck,
            isReady: isReadyCheck,
            hasViewport: hasViewportCheck
          }
        }
      };
    } catch (error) {
      return {
        status: 'FAIL',
        details: { error: error instanceof Error ? error.message : String(error) }
      };
    }
  }

  /**
   * Check application loading indicators
   */
  async checkApplicationLoading(): Promise<HealthCheck> {
    console.log('⏳ Checking application loading...');
    
    try {
      // Check for loading spinners/indicators
      const loadingSelectors = [
        '[class*="loading"]',
        '[class*="spinner"]',
        '[id*="loading"]',
        '.loader',
        '[data-testid*="loading"]'
      ];
      
      let activeLoaders = 0;
      for (const selector of loadingSelectors) {
        const elements = await this.page.locator(selector).count();
        if (elements > 0) {
          // Check if visible
          const visibleElements = await this.page.locator(selector).filter({ hasText: /./ }).count();
          activeLoaders += visibleElements;
        }
      }
      
      // Check for "loaded" indicators
      const loadedIndicators = await this.page.locator('[class*="loaded"], [data-loaded="true"]').count();
      
      return {
        status: activeLoaders === 0 ? 'PASS' : 'WARN',
        details: {
          activeLoaders: activeLoaders,
          loadedIndicators: loadedIndicators,
          message: activeLoaders > 0 ? 'Loading indicators still active' : 'No active loading indicators'
        }
      };
    } catch (error) {
      return {
        status: 'FAIL',
        details: { error: error instanceof Error ? error.message : String(error) }
      };
    }
  }

  /**
   * Check core Site Theater functionality
   */
  async checkCoreFunctionality(): Promise<HealthCheck> {
    console.log('⚙️ Checking core functionality...');
    
    try {
      // Check for Site Theater specific elements
      const siteElements = await this.page.locator('[class*="site"], [id*="site"]').count();
      const theaterElements = await this.page.locator('[class*="theater"], [id*="theater"]').count();
      const editorElements = await this.page.locator('[class*="editor"], [id*="editor"]').count();
      const canvasElements = await this.page.locator('canvas').count();
      const iframeElements = await this.page.locator('iframe').count();
      
      // Check for BiNDup specific functionality
      const bindupElements = await this.page.locator('[class*="bindup"], [id*="bindup"]').count();
      
      // Check for workspace elements
      const workspaceElements = await this.page.locator('[class*="workspace"], [id*="workspace"]').count();
      
      const totalFunctionalElements = siteElements + theaterElements + editorElements + 
                                    canvasElements + iframeElements + bindupElements + workspaceElements;
      
      return {
        status: totalFunctionalElements > 10 ? 'PASS' : 'WARN',
        details: {
          siteElements,
          theaterElements,
          editorElements,
          canvasElements,
          iframeElements,
          bindupElements,
          workspaceElements,
          totalFunctionalElements,
          threshold: 10
        }
      };
    } catch (error) {
      return {
        status: 'FAIL',
        details: { error: error instanceof Error ? error.message : String(error) }
      };
    }
  }

  /**
   * Check user interface elements
   */
  async checkUserInterface(): Promise<HealthCheck> {
    console.log('🎨 Checking user interface...');
    
    try {
      // Check for common UI elements
      const buttons = await this.page.locator('button, [role="button"], .button, .btn').count();
      const inputs = await this.page.locator('input, textarea, select').count();
      const menus = await this.page.locator('[role="menu"], .menu, nav').count();
      const toolbars = await this.page.locator('[role="toolbar"], .toolbar').count();
      
      // Check for navigation elements
      const navElements = await this.page.locator('nav, [role="navigation"]').count();
      
      // Check content height (indicates rendered content)
      const contentHeight = await this.page.evaluate(() => document.body.scrollHeight);
      
      const hasMinimalUI = buttons > 0 || inputs > 0 || menus > 0;
      const hasContent = contentHeight > 100;
      
      return {
        status: hasMinimalUI && hasContent ? 'PASS' : 'WARN',
        details: {
          buttons,
          inputs,
          menus,
          toolbars,
          navElements,
          contentHeight,
          hasMinimalUI,
          hasContent
        }
      };
    } catch (error) {
      return {
        status: 'FAIL',
        details: { error: error instanceof Error ? error.message : String(error) }
      };
    }
  }

  /**
   * Check performance metrics
   */
  async checkPerformance(): Promise<HealthCheck> {
    console.log('📊 Checking performance...');
    
    try {
      // Check page load performance
      const performanceMetrics = await this.page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        return {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          totalLoadTime: navigation.loadEventEnd - navigation.fetchStart,
          responseTime: navigation.responseEnd - navigation.requestStart
        };
      });
      
      // Performance thresholds (in milliseconds)
      const thresholds = {
        domContentLoaded: 5000,
        loadComplete: 10000,
        totalLoadTime: 15000,
        responseTime: 3000
      };
      
      const performanceIssues = [];
      if (performanceMetrics.domContentLoaded > thresholds.domContentLoaded) {
        performanceIssues.push('DOM content loading slow');
      }
      if (performanceMetrics.totalLoadTime > thresholds.totalLoadTime) {
        performanceIssues.push('Total load time excessive');
      }
      
      return {
        status: performanceIssues.length === 0 ? 'PASS' : 'WARN',
        details: {
          metrics: performanceMetrics,
          thresholds,
          issues: performanceIssues
        }
      };
    } catch (error) {
      return {
        status: 'WARN',
        details: { error: error instanceof Error ? error.message : String(error), message: 'Performance metrics unavailable' }
      };
    }
  }

  /**
   * Check for errors and issues
   */
  async checkForErrors(): Promise<HealthCheck> {
    console.log('🚨 Checking for errors...');
    
    try {
      // Check for visible error messages
      const errorSelectors = [
        '[class*="error"]:visible',
        '[id*="error"]:visible',
        'text=Error',
        'text=エラー',
        '.alert-danger:visible',
        '.error-message:visible'
      ];
      
      let visibleErrors = 0;
      const errorMessages = [];
      
      for (const selector of errorSelectors) {
        try {
          const elements = await this.page.locator(selector).all();
          for (const element of elements) {
            if (await element.isVisible()) {
              visibleErrors++;
              const text = await element.textContent();
              if (text && text.trim()) {
                errorMessages.push(text.trim());
              }
            }
          }
        } catch (e) {
          // Continue checking other selectors
        }
      }
      
      // Check for 404 or error pages
      const pageText = await this.page.textContent('body');
      const hasErrorPageIndicators = pageText && (
        pageText.includes('404') ||
        pageText.includes('Page Not Found') ||
        pageText.includes('Internal Server Error') ||
        pageText.includes('Service Unavailable')
      );
      
      return {
        status: visibleErrors === 0 && !hasErrorPageIndicators ? 'PASS' : 'FAIL',
        details: {
          visibleErrors,
          errorMessages,
          hasErrorPageIndicators,
          pageContainsError: hasErrorPageIndicators
        }
      };
    } catch (error) {
      return {
        status: 'WARN',
        details: { error: error instanceof Error ? error.message : String(error) }
      };
    }
  }

  /**
   * Check network health
   */
  async checkNetworkHealth(): Promise<HealthCheck> {
    console.log('🌐 Checking network health...');
    
    try {
      // Check if we can make a simple request
      const response = await this.page.evaluate(async () => {
        try {
          const resp = await fetch(window.location.origin + '/favicon.ico');
          return { status: resp.status, ok: resp.ok };
        } catch (error) {
          return { error: error instanceof Error ? error.message : String(error) };
        }
      });
      
      return {
        status: response.ok ? 'PASS' : 'WARN',
        details: {
          networkTest: response,
          message: response.ok ? 'Network connectivity good' : 'Network issues detected'
        }
      };
    } catch (error) {
      return {
        status: 'WARN',
        details: { error: error instanceof Error ? error.message : String(error) }
      };
    }
  }

  /**
   * Check interactive elements
   */
  async checkInteractiveElements(): Promise<HealthCheck> {
    console.log('🖱️ Checking interactive elements...');
    
    try {
      // Check for clickable elements
      const clickableElements = await this.page.locator('button:visible, a:visible, [role="button"]:visible').count();
      
      // Check for form elements
      const formElements = await this.page.locator('input:visible, textarea:visible, select:visible').count();
      
      // Test if page responds to interaction
      const isInteractive = await this.page.evaluate(() => {
        return document.readyState === 'complete' && 
               typeof document.addEventListener === 'function';
      });
      
      return {
        status: clickableElements > 0 && isInteractive ? 'PASS' : 'WARN',
        details: {
          clickableElements,
          formElements,
          isInteractive,
          message: isInteractive ? 'Page is interactive' : 'Page may not be fully interactive'
        }
      };
    } catch (error) {
      return {
        status: 'FAIL',
        details: { error: error instanceof Error ? error.message : String(error) }
      };
    }
  }

  /**
   * Calculate overall health based on individual checks
   */
  private calculateOverallHealth(checks: Record<string, HealthCheck>): HealthStatus {
    const statuses = Object.values(checks).map(check => check.status);
    
    const failCount = statuses.filter(s => s === 'FAIL').length;
    const warnCount = statuses.filter(s => s === 'WARN').length;
    const passCount = statuses.filter(s => s === 'PASS').length;
    
    if (failCount > 0) {
      return 'FAIL';
    } else if (warnCount > passCount) {
      return 'WARN';
    } else if (passCount > 0) {
      return 'PASS';
    } else {
      return 'UNKNOWN';
    }
  }
}

// Type definitions
export interface HealthCheckResult {
  overall: HealthStatus;
  checks: Record<string, HealthCheck>;
  timestamp: string;
  url: string;
  browser: string;
}

export interface HealthCheck {
  status: HealthStatus;
  details: any;
}

export type HealthStatus = 'PASS' | 'WARN' | 'FAIL' | 'UNKNOWN';
