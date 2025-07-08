/**
 * 🎯 SITE GRID EXPLORATION TEST
 *
 * This test focuses specifically on exploring and understanding the site grid
 * to identify the correct selectors and interaction patterns for site selection.
 */

import { test, expect } from '@fixtures/page-fixtures';
import { TestUsers } from '@data/test-data';
import { Page } from '@playwright/test';
import { PopupHandler, createPopupHandler } from '../../utils/popup-handler';
import { setupSiteForEditing } from '../../utils/site-setup';

test.describe('🔍 Site Grid Exploration', () => {
  test('SGE-01: Comprehensive Site Grid Discovery and Interaction', async ({
    webLifeAuthPage,
    browserName,
  }) => {
    console.log(`🔍 Starting Site Grid Exploration on ${browserName.toUpperCase()}`);

    // 🎯 INITIALIZE CRITICAL POPUP HANDLER
    const popupHandler = await createPopupHandler(webLifeAuthPage);

    try {
      // Step 1: Setup a site for testing
      console.log('🔧 Setting up site for grid exploration...');
      const { siteName, editorPageHandle } = await setupSiteForEditing(
        webLifeAuthPage,
        browserName,
        'GridExplorer'
      );
      console.log(`✅ Site created: ${siteName}`);

      // Step 2: Navigate back to Site Theater to explore the grid
      console.log('🔍 Navigating back to Site Theater to explore grid...');
      await webLifeAuthPage.page.goto('https://edit3.bindcloud.jp/bindcld/siteTheater/', {
        waitUntil: 'networkidle',
      });
      await webLifeAuthPage.page.waitForTimeout(3000);

      // Step 3: COMPREHENSIVE SITE GRID EXPLORATION
      console.log('🔍 STARTING COMPREHENSIVE SITE GRID EXPLORATION');
      console.log('================================================================');

      // 3.1: Basic page analysis
      console.log('📊 BASIC PAGE ANALYSIS:');
      const pageTitle = await webLifeAuthPage.page.title();
      const currentUrl = webLifeAuthPage.page.url();
      console.log(`   Page Title: "${pageTitle}"`);
      console.log(`   Current URL: ${currentUrl}`);

      // 3.2: Comprehensive element discovery
      console.log('\n🔍 COMPREHENSIVE ELEMENT DISCOVERY:');
      const discoverySelectors = [
        // Site-related selectors
        '.cs-item',
        '.cs-frame',
        '.cs-select',
        '.cs-title',
        '.cs-thum',
        '.cs-border',
        '.cs-bindbox-status',

        // Grid and container selectors
        '.site-grid',
        '.site-list',
        '.site-container',
        '.grid-container',
        '.main-content',
        '.content-area',

        // Interactive elements
        '[draggable="true"]',
        '[class*="click"]',
        '[class*="hover"]',

        // Visibility-related
        '[style*="display"]',
        '[style*="visibility"]',
        '[hidden]',

        // Common patterns
        '[class*="site"]',
        '[id*="site"]',
        '[data-*]',
      ];

      const discoveredElements = [];

      for (const selector of discoverySelectors) {
        try {
          const elements = webLifeAuthPage.page.locator(selector);
          const count = await elements.count();

          if (count > 0) {
            console.log(`✅ ${selector}: ${count} elements found`);

            // Get detailed information about the first element
            try {
              const firstElement = elements.first();
              const isVisible = await firstElement.isVisible({ timeout: 1000 });
              const boundingBox = await firstElement.boundingBox();
              const tagName = await firstElement.evaluate(el => el.tagName);
              const className = await firstElement.evaluate(el => el.className);
              const id = await firstElement.evaluate(el => el.id);
              const innerHTML = await firstElement.evaluate(el => el.innerHTML.substring(0, 100));

              const elementInfo = {
                selector,
                count,
                isVisible,
                boundingBox,
                tagName,
                className,
                id,
                innerHTML: innerHTML + (innerHTML.length === 100 ? '...' : ''),
              };

              discoveredElements.push(elementInfo);

              console.log(`   Details: Tag=${tagName}, Class="${className}", ID="${id}"`);
              console.log(`   Visible=${isVisible}, BoundingBox=${JSON.stringify(boundingBox)}`);
              console.log(`   Content: ${elementInfo.innerHTML}`);
            } catch (detailError) {
              console.log(`   Could not get element details: ${detailError.message}`);
            }
          }
        } catch (error) {
          // Silent error handling for discovery
        }
      }

      // 3.3: Focus on .cs-item elements (the main site containers)
      console.log('\n🎯 DETAILED .cs-item ANALYSIS:');
      const siteItems = webLifeAuthPage.page.locator('.cs-item');
      const siteItemCount = await siteItems.count();

      console.log(`Found ${siteItemCount} .cs-item elements`);

      if (siteItemCount > 0) {
        // Analyze first few site items
        const itemsToAnalyze = Math.min(siteItemCount, 3);

        for (let i = 0; i < itemsToAnalyze; i++) {
          console.log(`\n📋 ANALYZING SITE ITEM ${i + 1}:`);
          const item = siteItems.nth(i);

          try {
            // Basic properties
            const isVisible = await item.isVisible({ timeout: 1000 });
            const boundingBox = await item.boundingBox();
            const className = await item.evaluate(el => el.className);

            console.log(`   Visible: ${isVisible}`);
            console.log(`   BoundingBox: ${JSON.stringify(boundingBox)}`);
            console.log(`   Class: "${className}"`);

            // Check child elements
            const title = item.locator('.cs-title');
            const frame = item.locator('.cs-frame');
            const select = item.locator('.cs-select');
            const thumbnail = item.locator('.cs-thum');

            const titleText = await title.textContent().catch(() => 'N/A');
            const frameVisible = await frame.isVisible({ timeout: 500 }).catch(() => false);
            const selectVisible = await select.isVisible({ timeout: 500 }).catch(() => false);
            const thumbnailVisible = await thumbnail.isVisible({ timeout: 500 }).catch(() => false);

            console.log(`   Title: "${titleText}"`);
            console.log(`   Frame visible: ${frameVisible}`);
            console.log(`   Select visible: ${selectVisible}`);
            console.log(`   Thumbnail visible: ${thumbnailVisible}`);

            // Try to get the complete HTML structure
            const htmlStructure = await item.evaluate(el => el.outerHTML.substring(0, 500));
            console.log(`   HTML Structure: ${htmlStructure}...`);
          } catch (error) {
            console.log(`   Analysis error: ${error.message}`);
          }
        }
      }

      // 3.4: Test interaction patterns
      console.log('\n🖱️ TESTING INTERACTION PATTERNS:');

      if (siteItemCount > 0) {
        const firstItem = siteItems.first();

        // Test 1: Direct click on .cs-item
        console.log('🖱️ Test 1: Direct click on .cs-item...');
        try {
          await firstItem.click({ timeout: 2000 });
          await webLifeAuthPage.page.waitForTimeout(1000);
          console.log('✅ Direct click on .cs-item successful');

          // Check if anything changed
          const selectAfterClick = await firstItem
            .locator('.cs-select')
            .isVisible({ timeout: 1000 });
          console.log(`   .cs-select visible after click: ${selectAfterClick}`);
        } catch (error) {
          console.log(`⚠️ Direct click failed: ${error.message}`);
        }

        // Test 2: Hover over .cs-item
        console.log('🖱️ Test 2: Hover over .cs-item...');
        try {
          await firstItem.hover();
          await webLifeAuthPage.page.waitForTimeout(1000);
          console.log('✅ Hover over .cs-item successful');

          // Check if anything changed
          const selectAfterHover = await firstItem
            .locator('.cs-select')
            .isVisible({ timeout: 1000 });
          console.log(`   .cs-select visible after hover: ${selectAfterHover}`);
        } catch (error) {
          console.log(`⚠️ Hover failed: ${error.message}`);
        }

        // Test 3: Try clicking .cs-frame if visible
        console.log('🖱️ Test 3: Click on .cs-frame...');
        try {
          const frame = firstItem.locator('.cs-frame');
          if (await frame.isVisible({ timeout: 1000 })) {
            await frame.click();
            await webLifeAuthPage.page.waitForTimeout(1000);
            console.log('✅ Click on .cs-frame successful');

            const selectAfterFrameClick = await firstItem
              .locator('.cs-select')
              .isVisible({ timeout: 1000 });
            console.log(`   .cs-select visible after frame click: ${selectAfterFrameClick}`);
          } else {
            console.log('⚠️ .cs-frame not visible');
          }
        } catch (error) {
          console.log(`⚠️ Frame click failed: ${error.message}`);
        }

        // Test 4: Try force clicking .cs-select
        console.log('🖱️ Test 4: Force click on .cs-select...');
        try {
          const select = firstItem.locator('.cs-select');
          await select.click({ force: true, timeout: 2000 });
          await webLifeAuthPage.page.waitForTimeout(1000);
          console.log('✅ Force click on .cs-select successful');

          // Check if we navigated to editor
          const currentUrlAfter = webLifeAuthPage.page.url();
          console.log(`   URL after select click: ${currentUrlAfter}`);
        } catch (error) {
          console.log(`⚠️ Force click on .cs-select failed: ${error.message}`);
        }
      }

      // 3.5: Summary report
      console.log('\n📊 SITE GRID EXPLORATION SUMMARY:');
      console.log('================================');
      console.log(`Total .cs-item elements found: ${siteItemCount}`);
      console.log(`Total discovered element types: ${discoveredElements.length}`);
      console.log('Key findings:');

      discoveredElements.forEach(element => {
        if (element.count > 0 && element.selector.includes('cs-')) {
          console.log(
            `  - ${element.selector}: ${element.count} elements, visible: ${element.isVisible}`
          );
        }
      });

      console.log('\n🎯 EXPLORATION COMPLETED SUCCESSFULLY!');
    } catch (error) {
      console.error('❌ Site Grid Exploration failed:', error);
      throw error;
    } finally {
      // Cleanup
      await popupHandler.cleanup();
    }
  });
});
