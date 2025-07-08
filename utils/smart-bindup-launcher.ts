// 🚀 SMART BINDUP LAUNCHER - Intelligent BiNDup Launch Detection System
// Optimized for Chrome and WebKit with smart detection strategies

import { Page, BrowserContext } from '@playwright/test';
import { TestLogger } from './test-metrics';

export class SmartBiNDupLauncher {
  constructor(private page: Page, private context: BrowserContext) {}

  /**
   * 🚀 MAIN SMART LAUNCH METHOD
   * Intelligent BiNDup launch with multiple detection strategies
   */
  async smartLaunch(): Promise<Page> {
    TestLogger.logStep('🚀 Starting Smart BiNDup Launch...', 'start');
    
    try {
      // Step 1: Find and click BiNDup launch button
      const launchButton = await this.findBiNDupLaunchButton();
      if (!launchButton) {
        throw new Error('BiNDup launch button not found');
      }

      // Step 2: Set up new page detection (for new tab/window scenarios)
      const newPagePromise = this.context.waitForEvent('page', { timeout: 10000 });
      
      // Step 3: Click launch button
      await launchButton.click();
      TestLogger.logStep('✅ BiNDup launch button clicked', 'success');

      // Step 4: Smart detection of BiNDup interface
      let biNDupPage: Page;
      
      try {
        // Try to get new page first
        const newPage = await newPagePromise;
        TestLogger.logStep('✅ New BiNDup page detected', 'success');
        biNDupPage = newPage;
      } catch (error) {
        TestLogger.logStep('⚠️ No new page detected, using current page', 'warning');
        biNDupPage = this.page;
      }

      // Step 5: Wait for BiNDup interface to fully load
      await this.waitForBiNDupInterface(biNDupPage);
      
      return biNDupPage;
    } catch (error) {
      TestLogger.logStep('❌ Smart BiNDup launch failed', 'error', error.message);
      throw error;
    }
  }

  /**
   * 🔍 SMART BUTTON DETECTION
   * Find BiNDup launch button with multiple strategies
   */
  private async findBiNDupLaunchButton(): Promise<any> {
    TestLogger.logStep('🔍 Searching for BiNDup launch button...', 'start');
    
    // Strategy 1: Text-based detection
    const textStrategies = [
      'BiNDupを起動',
      'BiNDup起動', 
      '起動',
      'Launch BiNDup',
      'Start BiNDup'
    ];

    for (const text of textStrategies) {
      try {
        const element = this.page.getByText(text);
        if (await element.isVisible({ timeout: 2000 })) {
          TestLogger.logStep(`✅ Found launch button by text: ${text}`, 'success');
          return element;
        }
      } catch (error) {
        continue;
      }
    }

    // Strategy 2: JavaScript onclick detection
    const jsSelectors = [
      'a[onclick*="cloudStart"]',
      'a[href*="bindstart"]', 
      'button[onclick*="cloudStart"]',
      '*[onclick*="bindstart"]',
      'a[onclick*="BiNDup"]'
    ];

    for (const selector of jsSelectors) {
      try {
        const element = this.page.locator(selector);
        if (await element.isVisible({ timeout: 2000 })) {
          TestLogger.logStep(`✅ Found launch button by selector: ${selector}`, 'success');
          return element;
        }
      } catch (error) {
        continue;
      }
    }

    // Strategy 3: CSS class-based detection
    const cssSelectors = [
      '.buttonL.btnLogin',
      '.btn-launch',
      '.launch-button',
      'button[class*="launch"]',
      'a[class*="button"]'
    ];

    for (const selector of cssSelectors) {
      try {
        const element = this.page.locator(selector);
        if (await element.isVisible({ timeout: 2000 })) {
          TestLogger.logStep(`✅ Found launch button by CSS: ${selector}`, 'success');
          return element;
        }
      } catch (error) {
        continue;
      }
    }

    TestLogger.logStep('❌ BiNDup launch button not found with any strategy', 'error');
    return null;
  }

  /**
   * ⏳ SMART INTERFACE DETECTION
   * Wait for BiNDup interface to fully load with multiple detection methods
   */
  private async waitForBiNDupInterface(page: Page): Promise<void> {
    TestLogger.logStep('⏳ Waiting for BiNDup interface to load...', 'start');
    
    const startTime = Date.now();
    const timeout = 30000; // 30 seconds max wait
    
    while (Date.now() - startTime < timeout) {
      // Check multiple conditions in parallel
      const checks = await Promise.allSettled([
        this.checkURLCondition(page),
        this.checkElementCondition(page),
        this.checkTitleCondition(page)
      ]);

      // If any condition is met, BiNDup is loaded
      if (checks.some(check => check.status === 'fulfilled' && check.value === true)) {
        TestLogger.logStep('✅ BiNDup interface loaded successfully', 'success');
        
        // Additional wait for dynamic content to stabilize
        await page.waitForTimeout(3000);
        return;
      }

      // Wait before next check
      await page.waitForTimeout(1000);
    }

    TestLogger.logStep('⚠️ BiNDup interface load timeout - continuing anyway', 'warning');
  }

  /**
   * Check URL-based conditions
   */
  private async checkURLCondition(page: Page): Promise<boolean> {
    try {
      const url = page.url();
      const urlConditions = [
        url.includes('siteTheater'),
        url.includes('bindcld'),
        url.includes('BiNDup'),
        url.includes('bind')
      ];
      
      return urlConditions.some(condition => condition);
    } catch (error) {
      return false;
    }
  }

  /**
   * Check element-based conditions
   */
  private async checkElementCondition(page: Page): Promise<boolean> {
    const biNDupElements = [
      '.cs-select',      // Site selection buttons
      '#button-1014',    // Common BiNDup button
      '.cs-frame',       // Site frames
      '.cs-item',        // Site items
      '.site-list',      // Site list container
      '[data-bind]'      // BiNDup data attributes
    ];
    
    for (const selector of biNDupElements) {
      try {
        const element = page.locator(selector);
        if (await element.isVisible({ timeout: 1000 })) {
          return true;
        }
      } catch (error) {
        continue;
      }
    }
    
    return false;
  }

  /**
   * Check title-based conditions
   */
  private async checkTitleCondition(page: Page): Promise<boolean> {
    try {
      const title = await page.title();
      const titleConditions = [
        title.includes('BiNDup'),
        title.includes('Site Theater'),
        title.includes('サイトシアター'),
        title.includes('bind')
      ];
      
      return titleConditions.some(condition => condition);
    } catch (error) {
      return false;
    }
  }

  /**
   * 🛡️ RECOVERY METHOD
   * Attempt to recover if BiNDup launch fails
   */
  async attemptRecovery(): Promise<Page> {
    TestLogger.logStep('🛡️ Attempting BiNDup launch recovery...', 'start');
    
    try {
      // Strategy 1: Refresh and retry
      await this.page.reload();
      await this.page.waitForTimeout(3000);
      
      // Strategy 2: Try launch again
      return await this.smartLaunch();
    } catch (error) {
      TestLogger.logStep('❌ Recovery failed', 'error', error.message);
      throw error;
    }
  }
}
