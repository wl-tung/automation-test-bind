/**
 * 🎯 CRITICAL POPUP DETECTION AND HANDLING UTILITIES
 * 
 * This module provides world-class popup detection and handling capabilities
 * that work across ALL test files. It includes:
 * 
 * - Continuous popup monitoring system
 * - Smart detection for Start Guide and other popups
 * - Automatic closure with retry mechanisms
 * - Cross-browser compatibility
 * - Performance optimized detection
 */

import { Page } from '@playwright/test';

/**
 * 🎯 CONTINUOUS POPUP MONITORING SYSTEM
 * 
 * This is the core system that monitors for popups continuously
 * and closes them immediately when detected.
 */
export class PopupHandler {
  private page: Page;
  private isMonitoring: boolean = false;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private readonly MONITORING_INTERVAL_MS = 500; // Check every 500ms

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * 🚀 START CONTINUOUS POPUP MONITORING
   * 
   * Activates the continuous popup monitoring system that runs in the background
   * and automatically detects and closes popups as they appear.
   */
  async startContinuousMonitoring(): Promise<void> {
    if (this.isMonitoring) {
      console.log('🔄 Continuous popup monitoring already active');
      return;
    }

    console.log('🔧 Setting up continuous popup monitoring system...');
    this.isMonitoring = true;

    this.monitoringInterval = setInterval(async () => {
      try {
        await this.detectAndClosePopups();
      } catch (error) {
        // Silent error handling to prevent monitoring interruption
        console.log('⚠️ Popup monitoring error (non-critical):', error.message);
      }
    }, this.MONITORING_INTERVAL_MS);

    console.log('✅ Continuous popup monitoring system activated');
  }

  /**
   * 🛑 STOP CONTINUOUS POPUP MONITORING
   */
  async stopContinuousMonitoring(): Promise<void> {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isMonitoring = false;
    console.log('🛑 Continuous popup monitoring stopped');
  }

  /**
   * 🎯 DETECT AND CLOSE POPUPS
   * 
   * Core detection logic that identifies and closes various types of popups
   */
  private async detectAndClosePopups(): Promise<void> {
    // Start Guide Popup Detection (Critical)
    await this.handleStartGuidePopup();
    
    // Other popup types can be added here
    await this.handleGenericPopups();
  }

  /**
   * 🎯 HANDLE START GUIDE POPUP (CRITICAL)
   * 
   * Detects and closes the Start Guide popup that blocks workflows
   */
  private async handleStartGuidePopup(): Promise<void> {
    try {
      // Primary Start Guide popup detection
      const startGuidePopup = this.page.locator('#id-notice-news-window');
      
      if (await startGuidePopup.isVisible({ timeout: 100 })) {
        console.log('🎯 [CONTINUOUS] Found Start Guide popup - closing immediately!');
        
        // Try multiple close button selectors
        const closeSelectors = [
          '#button-1014',  // Primary close button
          '.close-button',
          '[aria-label="Close"]',
          '[aria-label="閉じる"]',
          'button:has-text("閉じる")',
          'button:has-text("Close")',
          '.popup-close',
          '.modal-close'
        ];

        let closed = false;
        for (const selector of closeSelectors) {
          try {
            const closeButton = this.page.locator(selector);
            if (await closeButton.isVisible({ timeout: 100 })) {
              await closeButton.click({ timeout: 1000 });
              console.log(`✅ [CONTINUOUS] Closed Start Guide popup using ${selector}!`);
              closed = true;
              break;
            }
          } catch (error) {
            // Continue to next selector
          }
        }

        if (!closed) {
          // Force close by clicking outside or pressing Escape
          await this.page.keyboard.press('Escape');
          console.log('✅ [CONTINUOUS] Closed Start Guide popup using Escape key!');
        }
      }
    } catch (error) {
      // Silent error handling
    }
  }

  /**
   * 🎯 HANDLE GENERIC POPUPS
   * 
   * Detects and closes other types of popups that may appear
   */
  private async handleGenericPopups(): Promise<void> {
    try {
      // Generic popup detection patterns
      const genericPopupSelectors = [
        '.modal:visible',
        '.popup:visible',
        '.dialog:visible',
        '[role="dialog"]:visible',
        '.overlay:visible'
      ];

      for (const selector of genericPopupSelectors) {
        try {
          const popup = this.page.locator(selector);
          if (await popup.isVisible({ timeout: 100 })) {
            // Try to find and click close button within the popup
            const closeButton = popup.locator('button:has-text("閉じる"), button:has-text("Close"), .close, .close-btn, [aria-label="Close"]').first();
            
            if (await closeButton.isVisible({ timeout: 100 })) {
              await closeButton.click({ timeout: 1000 });
              console.log(`✅ [CONTINUOUS] Closed generic popup using ${selector}!`);
            }
          }
        } catch (error) {
          // Continue to next selector
        }
      }
    } catch (error) {
      // Silent error handling
    }
  }

  /**
   * 🎯 MANUAL POPUP DETECTION AND CLOSURE
   * 
   * One-time popup detection and closure for specific scenarios
   */
  async handlePostClickPopups(): Promise<void> {
    console.log('🔍 Checking for post-click pop-ups and progress bars...');
    
    // Start Guide popup check
    await this.handleStartGuidePopup();
    
    // Progress bar detection
    await this.handleProgressBars();
    
    console.log('✅ Post-click popup handling completed');
  }

  /**
   * 🎯 HANDLE PROGRESS BARS
   * 
   * Detects and waits for progress bars to complete
   */
  private async handleProgressBars(): Promise<void> {
    try {
      const progressSelectors = [
        '.progress-bar',
        '.loading',
        '.spinner',
        '[role="progressbar"]',
        '.cs-progress'
      ];

      for (const selector of progressSelectors) {
        const progressElement = this.page.locator(selector);
        if (await progressElement.isVisible({ timeout: 1000 })) {
          console.log(`⏳ Waiting for progress bar to complete: ${selector}`);
          await progressElement.waitFor({ state: 'hidden', timeout: 30000 });
          console.log(`✅ Progress bar completed: ${selector}`);
        }
      }

      console.log('✅ No progress bars detected');
    } catch (error) {
      console.log('⚠️ Progress bar handling error:', error.message);
    }
  }

  /**
   * 🎯 SMART NAVIGATION WITH POPUP HANDLING
   * 
   * Navigates while continuously monitoring for popups
   */
  async navigateWithPopupHandling(url: string): Promise<void> {
    console.log('🔧 Smart Navigation: Detecting and handling pop-ups/progress bars');
    
    // Start monitoring before navigation
    await this.startContinuousMonitoring();
    
    try {
      await this.page.goto(url, { waitUntil: 'networkidle' });
      await this.page.waitForTimeout(2000); // Allow time for popups to appear
    } finally {
      // Keep monitoring active for continued protection
    }
  }

  /**
   * 🎯 CLEANUP
   * 
   * Cleanup method to stop monitoring when test completes
   */
  async cleanup(): Promise<void> {
    await this.stopContinuousMonitoring();
  }
}

/**
 * 🎯 CONVENIENCE FUNCTIONS FOR EASY USAGE
 */

/**
 * Create and start popup handler for a page
 */
export async function createPopupHandler(page: Page): Promise<PopupHandler> {
  const handler = new PopupHandler(page);
  await handler.startContinuousMonitoring();
  return handler;
}

/**
 * Quick popup check and closure
 */
export async function handlePopupsQuick(page: Page): Promise<void> {
  const handler = new PopupHandler(page);
  await handler.handlePostClickPopups();
}

/**
 * Smart wait with popup handling
 */
export async function waitWithPopupHandling(page: Page, ms: number): Promise<void> {
  const handler = new PopupHandler(page);
  await handler.startContinuousMonitoring();
  
  await page.waitForTimeout(ms);
  
  await handler.stopContinuousMonitoring();
}
