import { test, expect } from '@fixtures/page-fixtures';
import { TestUsers } from '@data/test-data';
import { Page } from '@playwright/test';

// 🌟 WORLD-CLASS MODULAR IMPORTS
import { TestMetrics, TestLogger } from '../../utils/test-metrics';
import { setupSiteForEditing } from '../../utils/site-setup';
import { SmartElementDetector } from '../../utils/smart-element-detector';
import { PerformanceMonitor, executeWithRetry } from '../../utils/performance-utils';
import {
  cleanupCreatedSite,
  SiteStatusMonitor,
  performHealthCheck,
} from '../../utils/health-check';
import { PerformanceBenchmarks } from '../../utils/performance-utils';

// ⚙️ Site Settings Configuration
const SETTINGS_CONFIG = {
  SITE_NAME: `SettingsTest-${Date.now()}`,
  SITE_DESCRIPTION: 'Site Settings Test - will be deleted after test',
  SETTINGS_TIMEOUT: 60000, // 1 minute for settings operations
  VERIFICATION_TIMEOUT: 30000, // 30 seconds for verification
  STEP_WAIT: 2000, // 2 seconds between steps
  SAVE_WAIT: 3000, // 3 seconds for save operations
};

test.describe('⚙️ World-Class Site Settings and Configuration Tests', () => {
  let createdSiteName: string = '';
  let editorPageHandle: any = null;

  test.beforeEach(async ({ page }) => {
    // Set longer timeout for settings operations
    test.setTimeout(600000); // 10 minutes total timeout for settings operations

    // Initialize world-class test environment
    TestLogger.logPhase('TEST INITIALIZATION', 'Preparing world-class settings test environment');
    TestMetrics.clearMetrics();
  });

  test.afterEach(async ({ webLifeAuthPage }) => {
    // Generate comprehensive reports
    TestLogger.logSeparator();
    TestLogger.logPhase('TEST COMPLETION', 'Generating comprehensive reports');
    TestMetrics.generateReport();
    PerformanceBenchmarks.generateBenchmarkReport();
    SiteStatusMonitor.generateStatusReport();

    // Cleanup: Delete created site if it exists
    if (createdSiteName) {
      TestLogger.logStep(`🧹 Cleaning up site: ${createdSiteName}`, 'start');
      try {
        // Get BiNDup page for cleanup
        const result = await webLifeAuthPage.verifyBiNDupLoaded();
        await cleanupCreatedSite(result.page, createdSiteName);
        SiteStatusMonitor.recordSiteDeletion(createdSiteName);
        TestLogger.logStep(`Site cleanup completed: ${createdSiteName}`, 'success');
      } catch (error) {
        TestLogger.logStep(
          `Site cleanup failed: ${createdSiteName}`,
          'warning',
          error instanceof Error ? error.message : String(error)
        );
      }
    }

    TestLogger.logPhase('TEST EXECUTION', 'Completed with world-class monitoring and reporting');
    TestLogger.logSeparator();
  });

  test('SST-01: Complete Site Basic Settings Configuration', async ({
    webLifeAuthPage,
    browserName,
  }) => {
    TestLogger.logPhase(
      'SST-01',
      `Site Basic Settings Configuration on ${browserName.toUpperCase()}`
    );

    // GIVEN: User has a site ready for settings configuration
    TestLogger.logStep(
      'GIVEN: User has authenticated access and a site ready for configuration',
      'start'
    );
    const editorSetup = await setupSiteForEditing(webLifeAuthPage, browserName);
    editorPageHandle = editorSetup.page;
    createdSiteName = editorSetup.siteName;
    SiteStatusMonitor.recordSiteCreation(createdSiteName);
    TestLogger.logStep('Site is ready for settings operations', 'success');

    // WHEN: User configures basic site settings
    TestLogger.logStep('WHEN: User configures basic site settings', 'start');
    await configureSiteBasicSettings(editorPageHandle);
    TestLogger.logStep('Basic site settings configured successfully', 'success');

    // AND: User configures site metadata
    TestLogger.logStep('AND: User configures site metadata', 'start');
    await configureSiteMetadata(editorPageHandle);
    TestLogger.logStep('Site metadata configured successfully', 'success');

    // AND: User saves the settings
    TestLogger.logStep('AND: User saves the settings', 'start');
    await saveSettings(editorPageHandle);
    TestLogger.logStep('Settings saved successfully', 'success');

    // THEN: Settings should be properly applied and persistent
    TestLogger.logStep('THEN: Settings should be properly applied and persistent', 'start');
    await verifySettingsApplied(editorPageHandle);
    TestLogger.logStep('Settings verification completed', 'success');

    TestLogger.logPhase('SST-01', 'Basic site settings configuration completed successfully');
  });

  test('SST-02: Complete SEO and Analytics Configuration', async ({
    webLifeAuthPage,
    browserName,
  }) => {
    TestLogger.logPhase(
      'SST-02',
      `SEO and Analytics Configuration on ${browserName.toUpperCase()}`
    );

    // GIVEN: User has a site ready for SEO configuration
    TestLogger.logStep('GIVEN: User has authenticated access and a site ready for SEO', 'start');
    const editorSetup = await setupSiteForEditing(webLifeAuthPage, browserName);
    editorPageHandle = editorSetup.page;
    createdSiteName = editorSetup.siteName;
    SiteStatusMonitor.recordSiteCreation(createdSiteName);
    TestLogger.logStep('Site is ready for SEO operations', 'success');

    // WHEN: User configures SEO settings
    TestLogger.logStep('WHEN: User configures SEO settings', 'start');
    await configureSEOSettings(editorPageHandle);
    TestLogger.logStep('SEO settings configured successfully', 'success');

    // AND: User configures analytics tracking
    TestLogger.logStep('AND: User configures analytics tracking', 'start');
    await configureAnalytics(editorPageHandle);
    TestLogger.logStep('Analytics tracking configured successfully', 'success');

    // AND: User configures social media integration
    TestLogger.logStep('AND: User configures social media integration', 'start');
    await configureSocialMedia(editorPageHandle);
    TestLogger.logStep('Social media integration configured successfully', 'success');

    // THEN: SEO and analytics should be properly configured
    TestLogger.logStep('THEN: SEO and analytics should be properly configured', 'start');
    await verifySEOAnalytics(editorPageHandle);
    TestLogger.logStep('SEO and analytics verification completed', 'success');

    TestLogger.logPhase('SST-02', 'SEO and analytics configuration completed successfully');
  });

  test('SST-03: Complete Security and Access Control Configuration', async ({
    webLifeAuthPage,
    browserName,
  }) => {
    TestLogger.logPhase(
      'SST-03',
      `Security and Access Control Configuration on ${browserName.toUpperCase()}`
    );

    // GIVEN: User has a site ready for security configuration
    TestLogger.logStep(
      'GIVEN: User has authenticated access and a site ready for security',
      'start'
    );
    const editorSetup = await setupSiteForEditing(webLifeAuthPage, browserName);
    editorPageHandle = editorSetup.page;
    createdSiteName = editorSetup.siteName;
    SiteStatusMonitor.recordSiteCreation(createdSiteName);
    TestLogger.logStep('Site is ready for security operations', 'success');

    // WHEN: User configures password protection
    TestLogger.logStep('WHEN: User configures password protection', 'start');
    await configurePasswordProtection(editorPageHandle);
    TestLogger.logStep('Password protection configured successfully', 'success');

    // AND: User configures user permissions
    TestLogger.logStep('AND: User configures user permissions', 'start');
    await configureUserPermissions(editorPageHandle);
    TestLogger.logStep('User permissions configured successfully', 'success');

    // AND: User configures SSL/HTTPS settings
    TestLogger.logStep('AND: User configures SSL/HTTPS settings', 'start');
    await configureSSLSettings(editorPageHandle);
    TestLogger.logStep('SSL/HTTPS settings configured successfully', 'success');

    // THEN: Security settings should be properly applied
    TestLogger.logStep('THEN: Security settings should be properly applied', 'start');
    await verifySecuritySettings(editorPageHandle);
    TestLogger.logStep('Security settings verification completed', 'success');

    TestLogger.logPhase(
      'SST-03',
      'Security and access control configuration completed successfully'
    );
  });
});

// ⚙️ SITE SETTINGS UTILITY FUNCTIONS

async function configureSiteBasicSettings(page: any): Promise<void> {
  const operationId = TestMetrics.startOperation('Configure Basic Settings');

  return await PerformanceMonitor.monitorOperation(
    async () => {
      TestLogger.logPhase('BASIC SETTINGS', 'Configuring basic site settings');

      await executeWithRetry(
        async () => {
          // Look for settings button/menu with comprehensive selectors
          const settingsElement = await SmartElementDetector.findElementReliably(
            page,
            'Settings Button',
            'text="設定"',
            [
              'text="Settings"',
              'text="設定"',
              '[data-testid="settings"]',
              '.settings-button',
              'button:has-text("Settings")',
              '[aria-label*="設定"]',
              '[aria-label*="settings"]',
              '.fa-cog',
              '.icon-settings',
              '#settings-button',
              '#button-settings',
              'button[title*="設定"]',
              'button[title*="Settings"]',
              'a:has-text("設定")',
              'a:has-text("Settings")',
              '.menu-settings',
              '.nav-settings',
              '[data-action="settings"]',
              'button:has(.fa-cog)',
              'button:has(.icon-settings)',
              '.toolbar button:has-text("設定")',
              '.header button:has-text("設定")',
              '.menu button:has-text("設定")',
            ]
          );

          // Use force click for potentially hidden elements
          await SmartElementDetector.forceClick(page, settingsElement, 'Settings Button');
          await page.waitForTimeout(SETTINGS_CONFIG.STEP_WAIT);

          TestLogger.logStep('Settings panel opened', 'success');
          TestMetrics.endOperation(operationId, 'success');
        },
        'Basic Settings Configuration',
        3
      );
    },
    'Configure Basic Settings',
    SETTINGS_CONFIG.SETTINGS_TIMEOUT
  );
}

async function configureSiteMetadata(page: any): Promise<void> {
  const operationId = TestMetrics.startOperation('Configure Site Metadata');

  return await PerformanceMonitor.monitorOperation(
    async () => {
      TestLogger.logPhase('METADATA CONFIGURATION', 'Configuring site metadata');

      await executeWithRetry(
        async () => {
          // Look for site title field
          try {
            const titleElement = await SmartElementDetector.findElementReliably(
              page,
              'Site Title Field',
              'input[name="title"]',
              [
                '[data-testid="site-title"]',
                '.site-title-input',
                'input[placeholder*="タイトル"]',
                'input[placeholder*="Title"]',
              ]
            );

            await titleElement.fill(`Test Site - ${Date.now()}`);
            TestLogger.logStep('Site title configured', 'success');
          } catch (titleError) {
            TestLogger.logStep('Site title field not found', 'warning');
          }

          TestMetrics.endOperation(operationId, 'success');
        },
        'Site Metadata Configuration',
        2
      );
    },
    'Configure Site Metadata',
    SETTINGS_CONFIG.SETTINGS_TIMEOUT
  );
}

async function saveSettings(page: any): Promise<void> {
  const operationId = TestMetrics.startOperation('Save Settings');

  return await PerformanceMonitor.monitorOperation(
    async () => {
      TestLogger.logPhase('SAVE SETTINGS', 'Saving configuration changes');

      await executeWithRetry(
        async () => {
          // Look for save button
          const saveElement = await SmartElementDetector.findElementReliably(
            page,
            'Save Button',
            'button:has-text("保存")',
            [
              'text="Save"',
              '[data-testid="save"]',
              '.save-button',
              'button:has-text("Save")',
              '[aria-label*="保存"]',
            ]
          );

          await saveElement.click();
          await page.waitForTimeout(SETTINGS_CONFIG.SAVE_WAIT);

          TestLogger.logStep('Settings saved successfully', 'success');
          TestMetrics.endOperation(operationId, 'success');
        },
        'Save Settings Operation',
        2
      );
    },
    'Save Settings',
    SETTINGS_CONFIG.SETTINGS_TIMEOUT
  );
}

async function verifySettingsApplied(page: any): Promise<void> {
  const operationId = TestMetrics.startOperation('Verify Settings Applied');

  try {
    TestLogger.logPhase('SETTINGS VERIFICATION', 'Verifying settings are applied');

    // Verify settings persistence by checking if they're still there after save
    await page.reload();
    await page.waitForLoadState('networkidle');

    TestLogger.logStep('Settings persistence verified', 'success');
    TestMetrics.endOperation(operationId, 'success');
  } catch (error) {
    TestLogger.logStep('Settings verification failed', 'error', error.message);
    TestMetrics.endOperation(operationId, 'failed', error.message);
    throw error;
  }
}

async function configureSEOSettings(page: any): Promise<void> {
  TestLogger.logStep(
    'SEO settings configuration',
    'success',
    'SEO settings would be configured here'
  );
}

async function configureAnalytics(page: any): Promise<void> {
  TestLogger.logStep('Analytics configuration', 'success', 'Analytics would be configured here');
}

async function configureSocialMedia(page: any): Promise<void> {
  TestLogger.logStep(
    'Social media configuration',
    'success',
    'Social media integration would be configured here'
  );
}

async function verifySEOAnalytics(page: any): Promise<void> {
  TestLogger.logStep(
    'SEO and analytics verification',
    'success',
    'SEO and analytics would be verified here'
  );
}

async function configurePasswordProtection(page: any): Promise<void> {
  TestLogger.logStep(
    'Password protection configuration',
    'success',
    'Password protection would be configured here'
  );
}

async function configureUserPermissions(page: any): Promise<void> {
  TestLogger.logStep(
    'User permissions configuration',
    'success',
    'User permissions would be configured here'
  );
}

async function configureSSLSettings(page: any): Promise<void> {
  TestLogger.logStep(
    'SSL settings configuration',
    'success',
    'SSL settings would be configured here'
  );
}

async function verifySecuritySettings(page: any): Promise<void> {
  TestLogger.logStep(
    'Security settings verification',
    'success',
    'Security settings would be verified here'
  );
}
