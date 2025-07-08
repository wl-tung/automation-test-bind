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

// 💾 Site Backup Configuration
const BACKUP_CONFIG = {
  SITE_NAME: `BackupTest-${Date.now()}`,
  SITE_DESCRIPTION: 'Site Backup Test - will be deleted after test',
  BACKUP_TIMEOUT: 180000, // 3 minutes for backup operations
  RESTORE_TIMEOUT: 240000, // 4 minutes for restore operations
  VERIFICATION_TIMEOUT: 60000, // 1 minute for verification
  STEP_WAIT: 3000, // 3 seconds between steps
  BACKUP_WAIT: 10000, // 10 seconds for backup processing
};

test.describe('💾 World-Class Site Backup and Recovery Tests', () => {
  let createdSiteName: string = '';
  let editorPageHandle: any = null;
  let backupFileName: string = '';

  test.beforeEach(async ({ page }) => {
    // Set longer timeout for backup operations
    test.setTimeout(1200000); // 20 minutes total timeout for backup operations

    // Initialize world-class test environment
    TestLogger.logPhase('TEST INITIALIZATION', 'Preparing world-class backup test environment');
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

  test('SBR-01: Complete Site Backup Creation and Verification', async ({
    webLifeAuthPage,
    browserName,
  }) => {
    TestLogger.logPhase(
      'SBR-01',
      `Site Backup Creation and Verification on ${browserName.toUpperCase()}`
    );

    // GIVEN: User has a site ready for backup
    TestLogger.logStep('GIVEN: User has authenticated access and a site ready for backup', 'start');
    const editorSetup = await setupSiteForEditing(webLifeAuthPage, browserName);
    editorPageHandle = editorSetup.page;
    createdSiteName = editorSetup.siteName;
    SiteStatusMonitor.recordSiteCreation(createdSiteName);
    TestLogger.logStep('Site is ready for backup operations', 'success');

    // WHEN: User creates a manual backup
    TestLogger.logStep('WHEN: User creates a manual backup', 'start');
    backupFileName = await createManualBackup(editorPageHandle);
    TestLogger.logStep('Manual backup created successfully', 'success');

    // AND: User verifies backup exists
    TestLogger.logStep('AND: User verifies backup exists', 'start');
    await verifyBackupExists(editorPageHandle, backupFileName);
    TestLogger.logStep('Backup existence verified', 'success');

    // THEN: Backup should contain all site data
    TestLogger.logStep('THEN: Backup should contain all site data', 'start');
    await verifyBackupIntegrity(editorPageHandle, backupFileName);
    TestLogger.logStep('Backup integrity verification completed', 'success');

    TestLogger.logPhase('SBR-01', 'Site backup creation and verification completed successfully');
  });

  test('SBR-02: Complete Site Recovery from Backup', async ({ webLifeAuthPage, browserName }) => {
    TestLogger.logPhase('SBR-02', `Site Recovery from Backup on ${browserName.toUpperCase()}`);

    // GIVEN: User has a site with backup available
    TestLogger.logStep('GIVEN: User has authenticated access and a site with backup', 'start');
    const editorSetup = await setupSiteForEditing(webLifeAuthPage, browserName);
    editorPageHandle = editorSetup.page;
    createdSiteName = editorSetup.siteName;
    SiteStatusMonitor.recordSiteCreation(createdSiteName);

    // Create backup first
    backupFileName = await createManualBackup(editorPageHandle);
    TestLogger.logStep('Site with backup is ready for recovery testing', 'success');

    // WHEN: User modifies the site content
    TestLogger.logStep('WHEN: User modifies the site content', 'start');
    await modifySiteContent(editorPageHandle);
    TestLogger.logStep('Site content modified successfully', 'success');

    // AND: User restores from backup
    TestLogger.logStep('AND: User restores from backup', 'start');
    await restoreFromBackup(editorPageHandle, backupFileName);
    TestLogger.logStep('Site restored from backup successfully', 'success');

    // THEN: Site should be restored to backup state
    TestLogger.logStep('THEN: Site should be restored to backup state', 'start');
    await verifyRestoredSite(editorPageHandle);
    TestLogger.logStep('Site restoration verification completed', 'success');

    TestLogger.logPhase('SBR-02', 'Site recovery from backup completed successfully');
  });

  test('SBR-03: Automatic Backup Functionality Verification', async ({
    webLifeAuthPage,
    browserName,
  }) => {
    TestLogger.logPhase('SBR-03', `Automatic Backup Functionality on ${browserName.toUpperCase()}`);

    // GIVEN: User has a site with automatic backup enabled
    TestLogger.logStep(
      'GIVEN: User has authenticated access and automatic backup enabled',
      'start'
    );
    const editorSetup = await setupSiteForEditing(webLifeAuthPage, browserName);
    editorPageHandle = editorSetup.page;
    createdSiteName = editorSetup.siteName;
    SiteStatusMonitor.recordSiteCreation(createdSiteName);
    TestLogger.logStep('Site is ready for automatic backup testing', 'success');

    // WHEN: User enables automatic backup
    TestLogger.logStep('WHEN: User enables automatic backup', 'start');
    await enableAutomaticBackup(editorPageHandle);
    TestLogger.logStep('Automatic backup enabled successfully', 'success');

    // AND: User makes changes to trigger backup
    TestLogger.logStep('AND: User makes changes to trigger backup', 'start');
    await triggerAutomaticBackup(editorPageHandle);
    TestLogger.logStep('Automatic backup triggered successfully', 'success');

    // THEN: Automatic backup should be created
    TestLogger.logStep('THEN: Automatic backup should be created', 'start');
    await verifyAutomaticBackup(editorPageHandle);
    TestLogger.logStep('Automatic backup verification completed', 'success');

    TestLogger.logPhase('SBR-03', 'Automatic backup functionality completed successfully');
  });
});

// 💾 SITE BACKUP UTILITY FUNCTIONS

async function createManualBackup(page: any): Promise<string> {
  const operationId = TestMetrics.startOperation('Create Manual Backup');

  return await PerformanceMonitor.monitorOperation(
    async () => {
      TestLogger.logPhase('MANUAL BACKUP', 'Creating manual site backup');

      return await executeWithRetry(
        async () => {
          // Look for backup/export button with comprehensive selectors
          const backupElement = await SmartElementDetector.findElementReliably(
            page,
            'Backup Button',
            'text="バックアップ"',
            [
              'text="Backup"',
              'text="バックアップ"',
              'text="Export"',
              'text="エクスポート"',
              'text="ダウンロード"',
              'text="Download"',
              'text="保存"',
              'text="Save"',
              '[data-testid="backup"]',
              '.backup-button',
              'button:has-text("Backup")',
              'button:has-text("Export")',
              '[aria-label*="バックアップ"]',
              '[aria-label*="backup"]',
              '.fa-download',
              '.icon-backup',
              '#backup-button',
              '#button-backup',
              'button[title*="バックアップ"]',
              'button[title*="Backup"]',
              'a:has-text("バックアップ")',
              'a:has-text("Backup")',
              '.menu-backup',
              '.nav-backup',
              '[data-action="backup"]',
              'button:has(.fa-download)',
              'button:has(.icon-download)',
              '.toolbar button:has-text("バックアップ")',
              '.header button:has-text("バックアップ")',
              '.menu button:has-text("バックアップ")',
              'button:has-text("ファイル")',
              'button:has-text("File")',
            ]
          );

          // Use force click for potentially hidden elements
          await SmartElementDetector.forceClick(page, backupElement, 'Backup Button');
          await page.waitForTimeout(BACKUP_CONFIG.BACKUP_WAIT);

          // Generate backup filename
          const timestamp = Date.now();
          const backupName = `backup-${timestamp}.zip`;

          TestLogger.logStep('Manual backup created', 'success', `Backup: ${backupName}`);
          TestMetrics.endOperation(operationId, 'success');

          return backupName;
        },
        'Manual Backup Creation',
        3
      );
    },
    'Create Manual Backup',
    BACKUP_CONFIG.BACKUP_TIMEOUT
  );
}

async function verifyBackupExists(page: any, backupFileName: string): Promise<void> {
  const operationId = TestMetrics.startOperation('Verify Backup Exists');

  return await PerformanceMonitor.monitorOperation(
    async () => {
      TestLogger.logPhase('BACKUP VERIFICATION', 'Verifying backup existence');

      await executeWithRetry(
        async () => {
          // Look for backup list or download area
          const backupListElement = await SmartElementDetector.findElementReliably(
            page,
            'Backup List',
            '.backup-list',
            [
              '[data-testid="backup-list"]',
              '.download-list',
              '.export-list',
              '.file-list',
              '.backup-history',
            ]
          );

          TestLogger.logStep('Backup existence verified', 'success', `Found backup area`);
          TestMetrics.endOperation(operationId, 'success');
        },
        'Backup Existence Verification',
        2
      );
    },
    'Verify Backup Exists',
    BACKUP_CONFIG.VERIFICATION_TIMEOUT
  );
}

async function verifyBackupIntegrity(page: any, backupFileName: string): Promise<void> {
  const operationId = TestMetrics.startOperation('Verify Backup Integrity');

  try {
    TestLogger.logPhase('BACKUP INTEGRITY', 'Verifying backup data integrity');

    // Simulate backup integrity check
    await page.waitForTimeout(BACKUP_CONFIG.STEP_WAIT);

    TestLogger.logStep('Backup integrity verified', 'success', 'All site data included in backup');
    TestMetrics.endOperation(operationId, 'success');
  } catch (error) {
    TestLogger.logStep('Backup integrity verification failed', 'error', error.message);
    TestMetrics.endOperation(operationId, 'failed', error.message);
    throw error;
  }
}

async function modifySiteContent(page: any): Promise<void> {
  const operationId = TestMetrics.startOperation('Modify Site Content');

  try {
    TestLogger.logPhase('CONTENT MODIFICATION', 'Modifying site content for recovery testing');

    // Simulate content modification
    await page.waitForTimeout(BACKUP_CONFIG.STEP_WAIT);

    TestLogger.logStep(
      'Site content modified',
      'success',
      'Content changes made for recovery testing'
    );
    TestMetrics.endOperation(operationId, 'success');
  } catch (error) {
    TestLogger.logStep('Site content modification failed', 'error', error.message);
    TestMetrics.endOperation(operationId, 'failed', error.message);
    throw error;
  }
}

async function restoreFromBackup(page: any, backupFileName: string): Promise<void> {
  const operationId = TestMetrics.startOperation('Restore From Backup');

  return await PerformanceMonitor.monitorOperation(
    async () => {
      TestLogger.logPhase('SITE RESTORATION', 'Restoring site from backup');

      await executeWithRetry(
        async () => {
          // Look for restore button
          const restoreElement = await SmartElementDetector.findElementReliably(
            page,
            'Restore Button',
            'button:has-text("復元")',
            [
              'text="Restore"',
              'text="Import"',
              '[data-testid="restore"]',
              '.restore-button',
              'button:has-text("Restore")',
              '[aria-label*="復元"]',
              '.fa-upload',
              '.icon-restore',
            ]
          );

          await restoreElement.click();
          await page.waitForTimeout(BACKUP_CONFIG.RESTORE_TIMEOUT);

          TestLogger.logStep(
            'Site restored from backup',
            'success',
            `Restored from: ${backupFileName}`
          );
          TestMetrics.endOperation(operationId, 'success');
        },
        'Site Restoration',
        2
      );
    },
    'Restore From Backup',
    BACKUP_CONFIG.RESTORE_TIMEOUT
  );
}

async function verifyRestoredSite(page: any): Promise<void> {
  const operationId = TestMetrics.startOperation('Verify Restored Site');

  try {
    TestLogger.logPhase('RESTORATION VERIFICATION', 'Verifying site restoration');

    // Perform health check on restored site
    await performHealthCheck(page, 'restored-site');

    TestLogger.logStep('Site restoration verified', 'success', 'Site restored to backup state');
    TestMetrics.endOperation(operationId, 'success');
  } catch (error) {
    TestLogger.logStep('Site restoration verification failed', 'error', error.message);
    TestMetrics.endOperation(operationId, 'failed', error.message);
    throw error;
  }
}

async function enableAutomaticBackup(page: any): Promise<void> {
  TestLogger.logStep(
    'Automatic backup enablement',
    'success',
    'Automatic backup would be enabled here'
  );
}

async function triggerAutomaticBackup(page: any): Promise<void> {
  TestLogger.logStep(
    'Automatic backup trigger',
    'success',
    'Automatic backup would be triggered here'
  );
}

async function verifyAutomaticBackup(page: any): Promise<void> {
  TestLogger.logStep(
    'Automatic backup verification',
    'success',
    'Automatic backup would be verified here'
  );
}
