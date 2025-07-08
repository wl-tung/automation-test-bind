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

// 🧱 CORNER PAGE BLOCKS OPERATIONS
import {
  addCornerPageBlock,
  duplicateCornerPageBlock,
  moveCornerPageBlock,
  deleteCornerPageBlock,
  navigateToPageEditor,
  verifyCornerBlockOperation
} from '../../utils/corner-page-blocks';

// Test configuration
const TEST_CONFIG = {
  TIMEOUT: 120000, // 2 minutes per test
  STEP_WAIT: 2000, // 2 seconds between steps
  OPERATION_TIMEOUT: 45000, // 45 seconds for operations
  VERIFICATION_TIMEOUT: 15000, // 15 seconds for verification
};

test.describe('🧱 World-Class Site Editor - Corner Page Blocks Operations', () => {
  let webLifeAuthPage: Page;
  let editorPageHandle: Page;
  let createdSiteName: string;
  let browserName: string;

  test.beforeEach(async ({ page, browserName: browser }) => {
    browserName = browser;
    webLifeAuthPage = page;
    
    TestLogger.logPhase('TEST INITIALIZATION', 'Preparing world-class site editor test environment');
    TestMetrics.startTest(`Site Editor - Corner Page Blocks - ${browser}`);
    
    // Initialize performance monitoring
    PerformanceMonitor.startMonitoring();
  });

  test.afterEach(async () => {
    TestLogger.logPhase('TEST CLEANUP', 'Generating comprehensive reports');
    
    // Cleanup created site
    if (createdSiteName && editorPageHandle) {
      try {
        await cleanupCreatedSite(editorPageHandle, createdSiteName);
        SiteStatusMonitor.recordSiteDeletion(createdSiteName);
        TestLogger.logStep('Test site cleaned up successfully', 'success');
      } catch (cleanupError) {
        TestLogger.logStep('Site cleanup had issues (non-critical)', 'warning');
      }
    }
    
    // Generate performance report
    const performanceReport = PerformanceMonitor.generateReport();
    TestLogger.logStep(`Performance Report: ${JSON.stringify(performanceReport)}`, 'info');
    
    TestMetrics.endTest();
  });

  test('SET-01: Add Corner Page Blocks', async () => {
    TestLogger.logPhase('SET-01', 'Add Corner Page Blocks operation');
    
    // GIVEN: User has authenticated access and a site ready for editing
    TestLogger.logStep('GIVEN: User has authenticated access and a site ready for editing', 'start');
    const editorSetup = await setupSiteForEditing(webLifeAuthPage, browserName);
    editorPageHandle = editorSetup.page;
    createdSiteName = editorSetup.siteName;
    SiteStatusMonitor.recordSiteCreation(createdSiteName);
    TestLogger.logStep('Site is ready for corner block operations', 'success');

    // WHEN: User navigates to page editor
    TestLogger.logStep('WHEN: User navigates to page editor', 'start');
    await navigateToPageEditor(editorPageHandle);
    TestLogger.logStep('Page editor opened successfully', 'success');

    // AND: User adds a new corner page block
    TestLogger.logStep('AND: User adds a new corner page block', 'start');
    const addResult = await addCornerPageBlock(editorPageHandle, 'text');
    TestLogger.logStep('Corner page block added successfully', 'success');

    // THEN: Corner block should be visible and functional
    TestLogger.logStep('THEN: Corner block should be visible and functional', 'start');
    const verificationResult = await verifyCornerBlockOperation(editorPageHandle, 'add', addResult.blockId);
    expect(verificationResult.success).toBe(true);
    TestLogger.logStep('Corner block addition verified successfully', 'success');

    TestLogger.logPhase('SET-01', 'Add Corner Page Blocks completed successfully');
  });

  test('SET-02: Duplicate Corner Page Blocks', async () => {
    TestLogger.logPhase('SET-02', 'Duplicate Corner Page Blocks operation');
    
    // GIVEN: User has a site with existing corner blocks
    TestLogger.logStep('GIVEN: User has a site with existing corner blocks', 'start');
    const editorSetup = await setupSiteForEditing(webLifeAuthPage, browserName);
    editorPageHandle = editorSetup.page;
    createdSiteName = editorSetup.siteName;
    SiteStatusMonitor.recordSiteCreation(createdSiteName);
    
    // Navigate to page editor and add initial block
    await navigateToPageEditor(editorPageHandle);
    const initialBlock = await addCornerPageBlock(editorPageHandle, 'image');
    TestLogger.logStep('Initial corner block created for duplication', 'success');

    // WHEN: User duplicates the corner page block
    TestLogger.logStep('WHEN: User duplicates the corner page block', 'start');
    const duplicateResult = await duplicateCornerPageBlock(editorPageHandle, initialBlock.blockId);
    TestLogger.logStep('Corner page block duplicated successfully', 'success');

    // THEN: Duplicated block should exist with same properties
    TestLogger.logStep('THEN: Duplicated block should exist with same properties', 'start');
    const verificationResult = await verifyCornerBlockOperation(editorPageHandle, 'duplicate', duplicateResult.blockId);
    expect(verificationResult.success).toBe(true);
    expect(verificationResult.blockCount).toBeGreaterThan(1);
    TestLogger.logStep('Corner block duplication verified successfully', 'success');

    TestLogger.logPhase('SET-02', 'Duplicate Corner Page Blocks completed successfully');
  });

  test('SET-03: Move Corner Page Blocks', async () => {
    TestLogger.logPhase('SET-03', 'Move Corner Page Blocks operation');
    
    // GIVEN: User has a site with multiple corner blocks
    TestLogger.logStep('GIVEN: User has a site with multiple corner blocks', 'start');
    const editorSetup = await setupSiteForEditing(webLifeAuthPage, browserName);
    editorPageHandle = editorSetup.page;
    createdSiteName = editorSetup.siteName;
    SiteStatusMonitor.recordSiteCreation(createdSiteName);
    
    // Navigate to page editor and create multiple blocks
    await navigateToPageEditor(editorPageHandle);
    const block1 = await addCornerPageBlock(editorPageHandle, 'text');
    const block2 = await addCornerPageBlock(editorPageHandle, 'button');
    TestLogger.logStep('Multiple corner blocks created for movement', 'success');

    // WHEN: User moves a corner page block to different position
    TestLogger.logStep('WHEN: User moves a corner page block to different position', 'start');
    const moveResult = await moveCornerPageBlock(editorPageHandle, block1.blockId, block2.blockId);
    TestLogger.logStep('Corner page block moved successfully', 'success');

    // THEN: Block should be in new position
    TestLogger.logStep('THEN: Block should be in new position', 'start');
    const verificationResult = await verifyCornerBlockOperation(editorPageHandle, 'move', moveResult.blockId);
    expect(verificationResult.success).toBe(true);
    expect(verificationResult.positionChanged).toBe(true);
    TestLogger.logStep('Corner block movement verified successfully', 'success');

    TestLogger.logPhase('SET-03', 'Move Corner Page Blocks completed successfully');
  });

  test('SET-04: Delete Corner Page Blocks', async () => {
    TestLogger.logPhase('SET-04', 'Delete Corner Page Blocks operation');
    
    // GIVEN: User has a site with corner blocks to delete
    TestLogger.logStep('GIVEN: User has a site with corner blocks to delete', 'start');
    const editorSetup = await setupSiteForEditing(webLifeAuthPage, browserName);
    editorPageHandle = editorSetup.page;
    createdSiteName = editorSetup.siteName;
    SiteStatusMonitor.recordSiteCreation(createdSiteName);
    
    // Navigate to page editor and create blocks for deletion
    await navigateToPageEditor(editorPageHandle);
    const blockToDelete = await addCornerPageBlock(editorPageHandle, 'text');
    const keepBlock = await addCornerPageBlock(editorPageHandle, 'image');
    TestLogger.logStep('Corner blocks created for deletion test', 'success');

    // WHEN: User deletes a corner page block
    TestLogger.logStep('WHEN: User deletes a corner page block', 'start');
    const deleteResult = await deleteCornerPageBlock(editorPageHandle, blockToDelete.blockId);
    TestLogger.logStep('Corner page block deleted successfully', 'success');

    // THEN: Block should be removed from page
    TestLogger.logStep('THEN: Block should be removed from page', 'start');
    const verificationResult = await verifyCornerBlockOperation(editorPageHandle, 'delete', blockToDelete.blockId);
    expect(verificationResult.success).toBe(true);
    expect(verificationResult.blockExists).toBe(false);
    
    // Verify other blocks still exist
    const keepBlockVerification = await verifyCornerBlockOperation(editorPageHandle, 'exists', keepBlock.blockId);
    expect(keepBlockVerification.blockExists).toBe(true);
    TestLogger.logStep('Corner block deletion verified successfully', 'success');

    TestLogger.logPhase('SET-04', 'Delete Corner Page Blocks completed successfully');
  });

  test('SET-05: Comprehensive Corner Page Blocks Workflow', async () => {
    TestLogger.logPhase('SET-05', 'Comprehensive Corner Page Blocks workflow');
    
    // GIVEN: User has authenticated access and a site ready for comprehensive testing
    TestLogger.logStep('GIVEN: User has authenticated access and a site ready for comprehensive testing', 'start');
    const editorSetup = await setupSiteForEditing(webLifeAuthPage, browserName);
    editorPageHandle = editorSetup.page;
    createdSiteName = editorSetup.siteName;
    SiteStatusMonitor.recordSiteCreation(createdSiteName);
    
    await navigateToPageEditor(editorPageHandle);
    TestLogger.logStep('Site ready for comprehensive corner block workflow', 'success');

    // WHEN: User performs complete corner block workflow
    TestLogger.logStep('WHEN: User performs complete corner block workflow', 'start');
    
    // Step 1: Add multiple corner blocks
    const textBlock = await addCornerPageBlock(editorPageHandle, 'text');
    const imageBlock = await addCornerPageBlock(editorPageHandle, 'image');
    const buttonBlock = await addCornerPageBlock(editorPageHandle, 'button');
    TestLogger.logStep('Multiple corner blocks added', 'success');
    
    // Step 2: Duplicate one block
    const duplicatedBlock = await duplicateCornerPageBlock(editorPageHandle, textBlock.blockId);
    TestLogger.logStep('Corner block duplicated', 'success');
    
    // Step 3: Move blocks around
    await moveCornerPageBlock(editorPageHandle, imageBlock.blockId, buttonBlock.blockId);
    TestLogger.logStep('Corner blocks repositioned', 'success');
    
    // Step 4: Delete one block
    await deleteCornerPageBlock(editorPageHandle, duplicatedBlock.blockId);
    TestLogger.logStep('Corner block deleted', 'success');

    // THEN: All operations should be successful and page should be functional
    TestLogger.logStep('THEN: All operations should be successful and page should be functional', 'start');
    
    // Verify remaining blocks
    const textVerification = await verifyCornerBlockOperation(editorPageHandle, 'exists', textBlock.blockId);
    const imageVerification = await verifyCornerBlockOperation(editorPageHandle, 'exists', imageBlock.blockId);
    const buttonVerification = await verifyCornerBlockOperation(editorPageHandle, 'exists', buttonBlock.blockId);
    const deletedVerification = await verifyCornerBlockOperation(editorPageHandle, 'exists', duplicatedBlock.blockId);
    
    expect(textVerification.blockExists).toBe(true);
    expect(imageVerification.blockExists).toBe(true);
    expect(buttonVerification.blockExists).toBe(true);
    expect(deletedVerification.blockExists).toBe(false);
    
    TestLogger.logStep('Comprehensive corner block workflow verified successfully', 'success');
    TestLogger.logPhase('SET-05', 'Comprehensive Corner Page Blocks workflow completed successfully');
  });
});
