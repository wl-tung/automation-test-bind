import { chromium, Browser, Page } from '@playwright/test';
import { TestUsers } from '../data/test-data';

/**
 * 🧹 GLOBAL CLEANUP UTILITY - PREVENT TEST SERVER TRASH
 * 
 * This utility helps clean up any leftover test sites that weren't properly deleted
 * during test execution. Run this periodically to keep the test server clean.
 */

interface CleanupConfig {
  maxSitesToDelete: number;
  testSitePatterns: string[];
  dryRun: boolean;
  screenshotOnError: boolean;
}

const DEFAULT_CONFIG: CleanupConfig = {
  maxSitesToDelete: 50, // Safety limit
  testSitePatterns: [
    'AutoTest-',
    'AITest-',
    'TemplateTest-',
    'BlankTest-',
    'PerformanceTest-',
    'SecurityTest-',
    'BackupTest-',
    'SettingsTest-',
    'PublishTest-',
    'CrossBrowserTest-',
    'Test-',
    'Automation-'
  ],
  dryRun: false, // Set to true to see what would be deleted without actually deleting
  screenshotOnError: true
};

export class GlobalCleanup {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private config: CleanupConfig;

  constructor(config: Partial<CleanupConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Initialize browser and authenticate
   */
  async initialize(): Promise<void> {
    console.log('🚀 Initializing Global Cleanup...');
    
    this.browser = await chromium.launch({ headless: true });
    this.page = await this.browser.newPage();

    // Authenticate
    await this.authenticate();
    console.log('✅ Global Cleanup initialized and authenticated');
  }

  /**
   * Authenticate with WebLife
   */
  private async authenticate(): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');

    console.log('🔐 Authenticating with WebLife...');
    
    await this.page.goto('https://mypage.weblife.me/auth/');
    await this.page.waitForLoadState('networkidle');

    // Login
    await this.page.locator('#loginID').fill(TestUsers.webLifeUser.email);
    await this.page.locator('#loginPass').fill(TestUsers.webLifeUser.password);
    await this.page.locator('a.buttonL.btnLogin').click();

    // Wait for BiNDup to load
    await this.page.waitForLoadState('networkidle');
    
    // Navigate to Site Theater
    await this.page.goto('https://edit3.bindcloud.jp/bindcld/siteTheater/');
    await this.page.waitForLoadState('networkidle');
    
    console.log('✅ Authentication completed');
  }

  /**
   * Find all test sites that match our patterns
   */
  async findTestSites(): Promise<string[]> {
    if (!this.page) throw new Error('Page not initialized');

    console.log('🔍 Scanning for test sites...');
    
    // Open site list
    await this.page.locator('#button-1014').click();
    await this.page.waitForTimeout(2000);

    const testSites: string[] = [];

    try {
      // Get all site elements
      const siteElements = await this.page.locator('#id-exist-mysite div').all();
      
      for (const element of siteElements) {
        try {
          const siteText = await element.textContent();
          if (siteText) {
            // Check if site matches any test pattern
            const isTestSite = this.config.testSitePatterns.some(pattern => 
              siteText.includes(pattern)
            );
            
            if (isTestSite) {
              testSites.push(siteText.trim());
            }
          }
        } catch (error) {
          // Skip this element if we can't read it
        }
      }
    } catch (error) {
      console.log('⚠️ Error scanning sites:', error);
    }

    console.log(`📊 Found ${testSites.length} test sites to clean up`);
    return testSites.slice(0, this.config.maxSitesToDelete); // Safety limit
  }

  /**
   * Delete a specific test site
   */
  async deleteTestSite(siteName: string): Promise<boolean> {
    if (!this.page) throw new Error('Page not initialized');

    console.log(`🗑️ ${this.config.dryRun ? '[DRY RUN] ' : ''}Deleting site: ${siteName}`);

    if (this.config.dryRun) {
      console.log(`✅ [DRY RUN] Would delete: ${siteName}`);
      return true;
    }

    try {
      // Find the site
      const siteSelectors = [
        `#id-exist-mysite div:has-text("${siteName}")`,
        `div:has-text("${siteName}")`,
        `[title*="${siteName}"]`,
      ];

      let siteElement = null;
      for (const selector of siteSelectors) {
        try {
          const element = this.page.locator(selector).first();
          if (await element.isVisible({ timeout: 3000 })) {
            siteElement = element;
            break;
          }
        } catch (error) {
          // Continue to next selector
        }
      }

      if (!siteElement) {
        console.log(`⚠️ Site not found: ${siteName}`);
        return false;
      }

      // Right-click to open context menu
      await siteElement.click({ button: 'right' });
      await this.page.waitForTimeout(1000);

      // Look for delete option
      const deleteOptions = [
        'text="削除"',
        'text="Delete"',
        '[data-action="delete"]',
        '.delete-button',
        'button:has-text("削除")',
      ];

      let deleteClicked = false;
      for (const deleteOption of deleteOptions) {
        try {
          const deleteElement = this.page.locator(deleteOption);
          if (await deleteElement.isVisible({ timeout: 2000 })) {
            await deleteElement.click();
            deleteClicked = true;
            break;
          }
        } catch (error) {
          // Continue to next option
        }
      }

      if (!deleteClicked) {
        console.log(`⚠️ Could not find delete option for: ${siteName}`);
        return false;
      }

      // Handle confirmation dialog
      await this.page.waitForTimeout(1000);
      const confirmOptions = [
        'text="確認"',
        'text="OK"',
        'text="Yes"',
        'button:has-text("OK")',
        'button:has-text("確認")',
      ];

      for (const confirmOption of confirmOptions) {
        try {
          const confirmElement = this.page.locator(confirmOption);
          if (await confirmElement.isVisible({ timeout: 3000 })) {
            await confirmElement.click();
            break;
          }
        } catch (error) {
          // Continue to next option
        }
      }

      await this.page.waitForTimeout(2000);
      console.log(`✅ Successfully deleted: ${siteName}`);
      return true;

    } catch (error) {
      console.log(`❌ Failed to delete ${siteName}:`, error);
      
      if (this.config.screenshotOnError) {
        await this.page.screenshot({
          path: `debug-global-cleanup-${siteName}-${Date.now()}.png`
        });
      }
      
      return false;
    }
  }

  /**
   * Run the complete cleanup process
   */
  async runCleanup(): Promise<{ deleted: number; failed: number; total: number }> {
    console.log('🧹 Starting Global Cleanup Process...');
    
    const testSites = await this.findTestSites();
    
    if (testSites.length === 0) {
      console.log('✅ No test sites found to clean up');
      return { deleted: 0, failed: 0, total: 0 };
    }

    console.log(`📋 Found ${testSites.length} test sites to process`);
    
    if (this.config.dryRun) {
      console.log('🔍 DRY RUN MODE - No sites will actually be deleted');
      console.log('Sites that would be deleted:');
      testSites.forEach((site, index) => {
        console.log(`  ${index + 1}. ${site}`);
      });
      return { deleted: testSites.length, failed: 0, total: testSites.length };
    }

    let deleted = 0;
    let failed = 0;

    for (const siteName of testSites) {
      const success = await this.deleteTestSite(siteName);
      if (success) {
        deleted++;
      } else {
        failed++;
      }
      
      // Small delay between deletions
      await this.page?.waitForTimeout(1000);
    }

    console.log(`📊 Cleanup completed: ${deleted} deleted, ${failed} failed, ${testSites.length} total`);
    return { deleted, failed, total: testSites.length };
  }

  /**
   * Clean up resources
   */
  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
    console.log('✅ Global Cleanup resources cleaned up');
  }
}

/**
 * Standalone function to run global cleanup
 */
export async function runGlobalCleanup(config: Partial<CleanupConfig> = {}): Promise<void> {
  const cleanup = new GlobalCleanup(config);
  
  try {
    await cleanup.initialize();
    const results = await cleanup.runCleanup();
    
    console.log('\n📊 GLOBAL CLEANUP SUMMARY:');
    console.log(`✅ Successfully deleted: ${results.deleted} sites`);
    console.log(`❌ Failed to delete: ${results.failed} sites`);
    console.log(`📋 Total processed: ${results.total} sites`);
    
  } catch (error) {
    console.error('❌ Global cleanup failed:', error);
  } finally {
    await cleanup.cleanup();
  }
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  
  console.log('🧹 Running Global Cleanup from CLI...');
  if (dryRun) {
    console.log('🔍 DRY RUN MODE - No sites will actually be deleted');
  }
  
  runGlobalCleanup({ dryRun }).catch(console.error);
}
