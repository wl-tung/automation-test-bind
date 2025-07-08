import { Page, BrowserContext } from '@playwright/test';
import { TestLogger } from './test-logger';

/**
 * Enhanced Session Manager for improved browser context stability
 * Addresses session timeout and context closure issues
 */
export class EnhancedSessionManager {
  private static sessionData: Map<string, any> = new Map();
  private static lastActivity: Map<string, number> = new Map();
  private static readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  private static readonly ACTIVITY_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

  /**
   * Initialize session management for a page
   */
  static async initializeSession(page: Page, sessionId: string = 'default'): Promise<void> {
    TestLogger.logStep(`🔐 Initializing enhanced session: ${sessionId}`, 'start');
    
    try {
      // Store session metadata
      this.sessionData.set(sessionId, {
        url: page.url(),
        userAgent: await page.evaluate(() => navigator.userAgent),
        cookies: await page.context().cookies(),
        localStorage: await page.evaluate(() => JSON.stringify(localStorage)),
        sessionStorage: await page.evaluate(() => JSON.stringify(sessionStorage)),
        timestamp: Date.now()
      });
      
      this.updateActivity(sessionId);
      
      // Set up periodic session validation
      this.setupSessionMonitoring(page, sessionId);
      
      TestLogger.logStep(`✅ Session initialized: ${sessionId}`, 'success');
    } catch (error) {
      TestLogger.logStep(`❌ Session initialization failed: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Validate and refresh session if needed
   */
  static async validateSession(page: Page, sessionId: string = 'default'): Promise<boolean> {
    TestLogger.logStep(`🔍 Validating session: ${sessionId}`, 'start');
    
    try {
      const sessionData = this.sessionData.get(sessionId);
      if (!sessionData) {
        TestLogger.logStep('⚠️ No session data found', 'warning');
        return false;
      }

      // Check if session is expired
      const lastActivity = this.lastActivity.get(sessionId) || 0;
      const isExpired = Date.now() - lastActivity > this.SESSION_TIMEOUT;
      
      if (isExpired) {
        TestLogger.logStep('⚠️ Session expired, refreshing...', 'warning');
        return await this.refreshSession(page, sessionId);
      }

      // Validate page context
      const isContextValid = await this.validatePageContext(page);
      if (!isContextValid) {
        TestLogger.logStep('⚠️ Page context invalid, refreshing...', 'warning');
        return await this.refreshSession(page, sessionId);
      }

      // Check authentication status
      const isAuthenticated = await this.checkAuthenticationStatus(page);
      if (!isAuthenticated) {
        TestLogger.logStep('⚠️ Authentication lost, refreshing...', 'warning');
        return await this.refreshSession(page, sessionId);
      }

      this.updateActivity(sessionId);
      TestLogger.logStep('✅ Session validation successful', 'success');
      return true;
    } catch (error) {
      TestLogger.logStep(`❌ Session validation failed: ${error.message}`, 'error');
      return false;
    }
  }

  /**
   * Refresh session with stored data
   */
  static async refreshSession(page: Page, sessionId: string = 'default'): Promise<boolean> {
    TestLogger.logStep(`🔄 Refreshing session: ${sessionId}`, 'start');
    
    try {
      const sessionData = this.sessionData.get(sessionId);
      if (!sessionData) {
        TestLogger.logStep('❌ No session data to restore', 'error');
        return false;
      }

      // Restore cookies
      await page.context().addCookies(sessionData.cookies);
      
      // Navigate to stored URL
      await page.goto(sessionData.url, { waitUntil: 'networkidle' });
      
      // Restore local storage
      await page.evaluate((data) => {
        const localStorage = JSON.parse(data);
        for (const [key, value] of Object.entries(localStorage)) {
          window.localStorage.setItem(key, value as string);
        }
      }, sessionData.localStorage);
      
      // Restore session storage
      await page.evaluate((data) => {
        const sessionStorage = JSON.parse(data);
        for (const [key, value] of Object.entries(sessionStorage)) {
          window.sessionStorage.setItem(key, value as string);
        }
      }, sessionData.sessionStorage);
      
      // Wait for page to stabilize
      await page.waitForLoadState('networkidle');
      
      this.updateActivity(sessionId);
      TestLogger.logStep('✅ Session refresh successful', 'success');
      return true;
    } catch (error) {
      TestLogger.logStep(`❌ Session refresh failed: ${error.message}`, 'error');
      return false;
    }
  }

  /**
   * Check if page context is valid
   */
  private static async validatePageContext(page: Page): Promise<boolean> {
    try {
      // Check if page is still accessible
      await page.evaluate(() => document.readyState);
      
      // Check if we can interact with the page
      const title = await page.title();
      
      // Check if page is not in error state
      const hasError = await page.locator('body').evaluate((body) => {
        return body.textContent?.includes('Error') || 
               body.textContent?.includes('404') ||
               body.textContent?.includes('500') ||
               false;
      });
      
      return !hasError && title.length > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check authentication status
   */
  private static async checkAuthenticationStatus(page: Page): Promise<boolean> {
    try {
      // Check for common authentication indicators
      const authIndicators = [
        () => page.locator('[data-testid="user-menu"]').count(),
        () => page.locator('.user-profile').count(),
        () => page.locator('#user-info').count(),
        () => page.evaluate(() => !!localStorage.getItem('auth_token')),
        () => page.evaluate(() => !!sessionStorage.getItem('user_session')),
      ];
      
      for (const indicator of authIndicators) {
        try {
          const result = await indicator();
          if (result > 0 || result === true) {
            return true;
          }
        } catch (error) {
          // Continue checking other indicators
        }
      }
      
      // Check if we're on login page (indicates not authenticated)
      const isOnLoginPage = page.url().includes('login') || 
                           page.url().includes('auth') ||
                           await page.locator('input[type="password"]').count() > 0;
      
      return !isOnLoginPage;
    } catch (error) {
      return false;
    }
  }

  /**
   * Set up periodic session monitoring
   */
  private static setupSessionMonitoring(page: Page, sessionId: string): void {
    // Monitor page events
    page.on('close', () => {
      TestLogger.logStep(`📄 Page closed for session: ${sessionId}`, 'warning');
      this.sessionData.delete(sessionId);
      this.lastActivity.delete(sessionId);
    });

    page.on('crash', () => {
      TestLogger.logStep(`💥 Page crashed for session: ${sessionId}`, 'error');
      this.sessionData.delete(sessionId);
      this.lastActivity.delete(sessionId);
    });

    // Periodic activity update
    const activityInterval = setInterval(() => {
      if (this.sessionData.has(sessionId)) {
        this.updateActivity(sessionId);
      } else {
        clearInterval(activityInterval);
      }
    }, this.ACTIVITY_CHECK_INTERVAL);
  }

  /**
   * Update last activity timestamp
   */
  private static updateActivity(sessionId: string): void {
    this.lastActivity.set(sessionId, Date.now());
  }

  /**
   * Clean up expired sessions
   */
  static cleanupExpiredSessions(): void {
    const now = Date.now();
    
    for (const [sessionId, lastActivity] of this.lastActivity.entries()) {
      if (now - lastActivity > this.SESSION_TIMEOUT) {
        TestLogger.logStep(`🧹 Cleaning up expired session: ${sessionId}`, 'info');
        this.sessionData.delete(sessionId);
        this.lastActivity.delete(sessionId);
      }
    }
  }

  /**
   * Get session statistics
   */
  static getSessionStats(): { active: number; expired: number; total: number } {
    const now = Date.now();
    let active = 0;
    let expired = 0;
    
    for (const [sessionId, lastActivity] of this.lastActivity.entries()) {
      if (now - lastActivity > this.SESSION_TIMEOUT) {
        expired++;
      } else {
        active++;
      }
    }
    
    return {
      active,
      expired,
      total: this.sessionData.size
    };
  }
}
