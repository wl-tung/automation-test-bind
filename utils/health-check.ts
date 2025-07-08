// 🏥 COMPREHENSIVE HEALTH CHECK AND SITE MANAGEMENT UTILITIES

import { TestMetrics, TestLogger } from './test-metrics';
import { SmartWaits } from './performance-utils';

// 🏥 Comprehensive Health Check System
export async function performComprehensiveHealthCheck(
  page: any,
  browserName: string
): Promise<boolean> {
  const metricId = TestMetrics.startOperation('Health Check', browserName);

  try {
    TestLogger.logStep('Comprehensive Health Check', 'start', browserName);

    // Check 1: Page responsiveness
    TestLogger.logStep('Checking page responsiveness', 'start');
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    TestLogger.logStep('Page responsiveness check', 'success');

    // Check 2: Essential elements presence
    TestLogger.logStep('Checking essential elements', 'start');

    // Determine context-appropriate essential elements
    const currentUrl = page.url();

    // Smart context detection based on elements present
    const mainMenuExists = (await page.locator('#button-1014').count()) > 0;
    const editorElements = await page.locator('[class*="editor"], [id*="editor"], iframe').count();

    // If main menu button exists, we're in Site Theater
    // If it doesn't exist but we have editor elements, we're in Site Editor
    const isSiteTheater = mainMenuExists;
    const isSiteEditor = !mainMenuExists && editorElements > 0;

    TestLogger.logStep(`Context detection: URL=${currentUrl}`, 'start');
    TestLogger.logStep(
      `Main Menu Exists: ${mainMenuExists}, Editor Elements: ${editorElements}`,
      'start'
    );
    TestLogger.logStep(`Site Theater: ${isSiteTheater}, Site Editor: ${isSiteEditor}`, 'start');

    const essentialElements = [
      { selector: 'body', name: 'Page Body' },
      { selector: 'html', name: 'HTML Root' },
    ];

    // Add context-specific elements
    if (isSiteTheater) {
      // Site Theater context - look for theater-specific elements
      essentialElements.push({
        selector: '#button-1014',
        name: 'Main Menu Button',
      });
      TestLogger.logStep('Using Site Theater health check elements', 'start');
    } else {
      // Site Editor context - check for editor-specific elements
      TestLogger.logStep('Using Site Editor health check elements', 'start');
      // For site editor, body and html are sufficient
      // The main menu button won't be present in editor mode
    }

    for (const element of essentialElements) {
      const exists = (await page.locator(element.selector).count()) > 0;
      if (!exists) {
        TestLogger.logStep(`Essential element missing: ${element.name}`, 'error', element.selector);
        TestMetrics.endOperation(metricId, 'failed', `Missing element: ${element.name}`);
        return false;
      }
      TestLogger.logStep(`Essential element found: ${element.name}`, 'success');
    }

    // Check 3: JavaScript errors
    TestLogger.logStep('Checking for JavaScript errors', 'start');
    const jsErrors = await page.evaluate(() => {
      return window.jsErrors || [];
    });

    if (jsErrors.length > 0) {
      TestLogger.logStep(
        'JavaScript errors detected',
        'warning',
        `${jsErrors.length} errors found`
      );
    } else {
      TestLogger.logStep('No JavaScript errors detected', 'success');
    }

    // Check 4: Network connectivity
    TestLogger.logStep('Checking network connectivity', 'start');
    try {
      await page.goto(page.url(), { waitUntil: 'networkidle', timeout: 10000 });
      TestLogger.logStep('Network connectivity check', 'success');
    } catch (networkError) {
      TestLogger.logStep('Network connectivity issues detected', 'warning', networkError.message);
    }

    // Check 5: Browser-specific health checks
    if (browserName.toLowerCase() === 'webkit') {
      TestLogger.logStep('Performing WebKit-specific health checks', 'start');
      await page.waitForTimeout(2000); // WebKit needs extra time
      TestLogger.logStep('WebKit health checks completed', 'success');
    }

    TestLogger.logStep('Comprehensive Health Check', 'success', 'All checks passed');
    TestMetrics.endOperation(metricId, 'success');
    return true;
  } catch (error) {
    TestLogger.logStep('Comprehensive Health Check', 'error', error.message);
    TestMetrics.endOperation(metricId, 'failed', error.message);
    return false;
  }
}

// 🌐 Browser-specific navigation handling
export async function handleBrowserSpecificNavigation(
  page: any,
  browserName: string
): Promise<void> {
  TestLogger.logStep(`🔧 Applying ${browserName} specific navigation handling...`, 'start');

  const currentUrl = page.url();
  TestLogger.logStep(`📍 Current URL: ${currentUrl}`, 'start');

  // Check if we're on the correct page
  if (!currentUrl.includes('siteTheater')) {
    TestLogger.logStep(`⚠️ Not on Site Theater, navigating...`, 'warning');
    await page.goto('https://edit3.bindcloud.jp/bindcld/siteTheater/');
    await SmartWaits.waitForNetworkIdle(page);
    TestLogger.logStep('✅ Navigated to Site Theater', 'success');
  }

  // Browser-specific handling
  if (browserName.toLowerCase() === 'webkit') {
    TestLogger.logStep('🔧 Applying WebKit-specific optimizations...', 'start');
    // WebKit sometimes needs extra wait time
    await page.waitForTimeout(2000);

    // Ensure page is fully loaded in WebKit
    await page.waitForFunction(() => document.readyState === 'complete');
    TestLogger.logStep('WebKit optimizations applied', 'success');
  } else if (browserName.toLowerCase() === 'chromium') {
    TestLogger.logStep('🔧 Applying Chromium-specific optimizations...', 'start');
    // Chromium sometimes needs network idle state
    await SmartWaits.waitForNetworkIdle(page);
    TestLogger.logStep('Chromium optimizations applied', 'success');
  }

  TestLogger.logStep(`✅ ${browserName} navigation handling completed`, 'success');
}

// 🧹 ROBUST SITE CLEANUP UTILITIES - PREVENT TEST SERVER TRASH
export async function cleanupCreatedSite(page: any, siteName: string): Promise<void> {
  const metricId = TestMetrics.startOperation('Site Cleanup');

  try {
    TestLogger.logStep(`🧹 Starting cleanup for site: ${siteName}`, 'start');

    // STEP 1: Navigate to Site Theater for cleanup
    await page.goto('https://edit3.bindcloud.jp/bindcld/siteTheater/');
    await SmartWaits.waitForNetworkIdle(page);

    // STEP 2: Open site list
    await page.locator('#button-1014').click();
    await page.waitForTimeout(2000);

    // STEP 3: Multiple strategies to find the site
    const siteSelectors = [
      `#id-exist-mysite div:has-text("${siteName}")`,
      `text="${siteName}"`,
      `[title*="${siteName}"]`,
      `div:has-text("${siteName}")`,
      `.site-item:has-text("${siteName}")`,
    ];

    let siteFound = false;
    let foundSelector = '';

    for (const selector of siteSelectors) {
      try {
        const elements = await page.locator(selector).count();
        if (elements > 0) {
          TestLogger.logStep(`Found site ${siteName} with selector: ${selector}`, 'success');
          siteFound = true;
          foundSelector = selector;
          break;
        }
      } catch (error) {
        // Continue to next selector
      }
    }

    if (!siteFound) {
      TestLogger.logStep(
        `⚠️ Site "${siteName}" not found for cleanup - may have been deleted already`,
        'warning'
      );
      TestMetrics.endOperation(metricId, 'success', 'Site not found');
      return;
    }

    // STEP 4: AGGRESSIVE DELETION STRATEGIES
    const deleteStrategies = [
      // Strategy 1: Right-click context menu
      async () => {
        await page.locator(foundSelector).first().click({ button: 'right' });
        await page.waitForTimeout(1000);

        const deleteOptions = [
          'text="削除"',
          'text="Delete"',
          '[data-action="delete"]',
          '.delete-button',
          'button:has-text("削除")',
          'a:has-text("削除")',
        ];

        for (const deleteOption of deleteOptions) {
          try {
            const deleteElement = page.locator(deleteOption);
            if (await deleteElement.isVisible({ timeout: 2000 })) {
              await deleteElement.click();
              await page.waitForTimeout(1000);

              // Handle confirmation dialog
              await handleDeleteConfirmation(page);
              return true;
            }
          } catch (error) {
            // Continue to next option
          }
        }
        return false;
      },

      // Strategy 2: Direct button click
      async () => {
        const siteElement = page.locator(foundSelector).first();

        // Look for delete button within site element
        const deleteButtons = [
          siteElement.locator('button:has-text("削除")'),
          siteElement.locator('.delete-btn'),
          siteElement.locator('[data-action="delete"]'),
        ];

        for (const deleteBtn of deleteButtons) {
          try {
            if (await deleteBtn.isVisible({ timeout: 2000 })) {
              await deleteBtn.click();
              await handleDeleteConfirmation(page);
              return true;
            }
          } catch (error) {
            // Continue to next button
          }
        }
        return false;
      },

      // Strategy 3: Hover and delete
      async () => {
        const siteElement = page.locator(foundSelector).first();
        await siteElement.hover();
        await page.waitForTimeout(1000);

        const hoverDeleteOptions = [
          'button:has-text("削除")',
          '.delete-on-hover',
          '[title*="削除"]',
        ];

        for (const option of hoverDeleteOptions) {
          try {
            const deleteElement = page.locator(option);
            if (await deleteElement.isVisible({ timeout: 2000 })) {
              await deleteElement.click();
              await handleDeleteConfirmation(page);
              return true;
            }
          } catch (error) {
            // Continue to next option
          }
        }
        return false;
      },
    ];

    // STEP 5: Execute deletion strategies
    let deleteSuccess = false;
    for (let i = 0; i < deleteStrategies.length; i++) {
      try {
        TestLogger.logStep(`Attempting deletion strategy ${i + 1}`, 'start');
        deleteSuccess = await deleteStrategies[i]();
        if (deleteSuccess) {
          TestLogger.logStep(`Deletion strategy ${i + 1} successful`, 'success');
          break;
        }
      } catch (error) {
        TestLogger.logStep(
          `Deletion strategy ${i + 1} failed: ${error instanceof Error ? error.message : String(error)}`,
          'warning'
        );
      }
    }

    if (!deleteSuccess) {
      throw new Error(`All deletion strategies failed for site "${siteName}"`);
    }

    // STEP 6: Verify deletion
    await page.waitForTimeout(3000);
    const stillExists = await page.locator(foundSelector).count();

    if (stillExists === 0) {
      TestLogger.logStep(
        `✅ Site "${siteName}" successfully deleted and removed from list`,
        'success'
      );
      SiteStatusMonitor.recordSiteDeletion(siteName);
    } else {
      TestLogger.logStep(`⚠️ Site "${siteName}" may still exist after deletion attempt`, 'warning');
    }

    TestMetrics.endOperation(metricId, 'success');
  } catch (error) {
    TestLogger.logStep(
      `Site cleanup failed: ${siteName}`,
      'error',
      error instanceof Error ? error.message : String(error)
    );
    TestMetrics.endOperation(
      metricId,
      'failed',
      error instanceof Error ? error.message : String(error)
    );

    // Take screenshot for debugging
    await page.screenshot({
      path: `debug-cleanup-failed-${siteName}-${Date.now()}.png`,
    });

    // Don't throw error - log and continue to prevent test failure
    TestLogger.logStep(`⚠️ Cleanup failed but continuing test execution`, 'warning');
  }
}

// Helper function to handle delete confirmation dialogs
async function handleDeleteConfirmation(page: any): Promise<void> {
  try {
    const confirmOptions = [
      'text="確認"',
      'text="OK"',
      'text="Yes"',
      'text="削除"',
      'button:has-text("OK")',
      'button:has-text("確認")',
      '.confirm-button',
      '[data-action="confirm"]',
    ];

    for (const confirmOption of confirmOptions) {
      try {
        const confirmElement = page.locator(confirmOption);
        if (await confirmElement.isVisible({ timeout: 3000 })) {
          await confirmElement.click();
          await page.waitForTimeout(1000);
          TestLogger.logStep('Delete confirmation clicked', 'success');
          return;
        }
      } catch (error) {
        // Continue to next option
      }
    }

    TestLogger.logStep('No confirmation dialog found', 'success');
  } catch (error) {
    TestLogger.logStep('Confirmation handling failed', 'warning');
  }
}

// 🔍 Site Verification Utilities
export async function verifySiteExists(page: any, siteName: string): Promise<boolean> {
  try {
    TestLogger.logStep(`Verifying site exists: ${siteName}`, 'start');

    await SmartWaits.waitForNetworkIdle(page);
    const siteElements = await page.locator(`text="${siteName}"`).count();

    if (siteElements > 0) {
      TestLogger.logStep(`Site verification successful: ${siteName}`, 'success');
      return true;
    } else {
      TestLogger.logStep(`Site not found: ${siteName}`, 'warning');
      return false;
    }
  } catch (error) {
    TestLogger.logStep(`Site verification failed: ${siteName}`, 'error', error.message);
    return false;
  }
}

// 📊 Site Status Monitoring
export class SiteStatusMonitor {
  private static siteStatuses: Map<string, { created: boolean; lastChecked: number }> = new Map();

  static recordSiteCreation(siteName: string): void {
    this.siteStatuses.set(siteName, {
      created: true,
      lastChecked: Date.now(),
    });
    TestLogger.logStep(`Site status recorded: ${siteName}`, 'success', 'Created');
  }

  static recordSiteDeletion(siteName: string): void {
    this.siteStatuses.set(siteName, {
      created: false,
      lastChecked: Date.now(),
    });
    TestLogger.logStep(`Site status updated: ${siteName}`, 'success', 'Deleted');
  }

  static getSiteStatus(siteName: string): { created: boolean; lastChecked: number } | null {
    return this.siteStatuses.get(siteName) || null;
  }

  static getAllSiteStatuses(): Map<string, { created: boolean; lastChecked: number }> {
    return new Map(this.siteStatuses);
  }

  static generateStatusReport(): void {
    console.log('\n🏗️ SITE STATUS REPORT:');

    const activeSites = Array.from(this.siteStatuses.entries()).filter(
      ([_, status]) => status.created
    );

    const deletedSites = Array.from(this.siteStatuses.entries()).filter(
      ([_, status]) => !status.created
    );

    console.log(`   Active Sites: ${activeSites.length}`);
    activeSites.forEach(([name, status]) => {
      const timeAgo = Date.now() - status.lastChecked;
      console.log(`     - ${name} (${Math.round(timeAgo / 1000)}s ago)`);
    });

    console.log(`   Deleted Sites: ${deletedSites.length}`);
    if (deletedSites.length > 0) {
      console.log(`     - ${deletedSites.length} sites properly cleaned up`);
    }
  }
}
