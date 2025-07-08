import { test, expect } from '@playwright/test';

/**
 * 🔍 DOM DISCOVERY & ELEMENT IDENTIFICATION TEST
 *
 * This test helps discover the current UI structure and find the correct upload button
 */

test.describe('🔍 DOM Discovery & Element Identification', () => {
  test('🎯 Discover Upload Button and UI Elements', async ({ page }) => {
    console.log('🔍 Starting DOM discovery with session management...');

    // Navigate to authentication
    await page.goto('https://mypage.weblife.me/auth/');

    // Authenticate
    await page.locator('#loginID').fill('nguyent0810@gmail.com');
    await page.locator('#loginPass').fill('Tung@0810');
    await page.locator('a.buttonL.btnLogin').click();

    // Wait for login to complete
    await page.waitForTimeout(3000);

    // Launch BiNDup using proven WebKit solution
    console.log('🚀 Launching BiNDup with session management...');
    const [bindupPage] = await Promise.all([
      page.context().waitForEvent('page', { timeout: 30000 }),
      page.evaluate(() => {
        const button = document.querySelector('#button-1014') as HTMLElement;
        if (button) {
          button.click();
        } else {
          window.open('https://edit3.bindcloud.jp/bindcld/siteTheater/', '_blank');
        }
      }),
    ]);

    await bindupPage.waitForLoadState('networkidle', { timeout: 30000 });

    console.log('✅ BiNDup launched successfully');
    console.log(`🔗 BiNDup URL: ${bindupPage.url()}`);

    // 🔍 CHECK FOR SESSION ERROR FIRST
    const pageContent = await bindupPage.content();
    if (pageContent.includes('セッションエラー') || pageContent.includes('session')) {
      console.log('❌ SESSION ERROR DETECTED!');
      console.log('🔄 Need to refresh authentication or handle session timeout');

      // Try to refresh the session
      await bindupPage.reload();
      await bindupPage.waitForTimeout(5000);

      const newContent = await bindupPage.content();
      if (newContent.includes('セッションエラー')) {
        console.log('❌ Session still expired - need manual intervention');
        return; // Exit gracefully
      }
    }

    // 🔍 COMPREHENSIVE DOM ANALYSIS
    console.log('\n🔍 === COMPREHENSIVE DOM ANALYSIS ===');

    // 1. Find all buttons
    console.log('\n📍 1. ALL BUTTONS ON PAGE:');
    const allButtons = await bindupPage.locator('button').all();
    for (let i = 0; i < allButtons.length; i++) {
      const button = allButtons[i];
      const id = await button.getAttribute('id').catch(() => 'no-id');
      const className = await button.getAttribute('class').catch(() => 'no-class');
      const text = await button.textContent().catch(() => 'no-text');
      const title = await button.getAttribute('title').catch(() => 'no-title');
      const isVisible = await button.isVisible().catch(() => false);

      console.log(
        `   Button ${
          i + 1
        }: ID="${id}" Class="${className}" Text="${text}" Title="${title}" Visible=${isVisible}`
      );
    }

    // 2. Find all input elements
    console.log('\n📍 2. ALL INPUT ELEMENTS:');
    const allInputs = await bindupPage.locator('input').all();
    for (let i = 0; i < allInputs.length; i++) {
      const input = allInputs[i];
      const id = await input.getAttribute('id').catch(() => 'no-id');
      const type = await input.getAttribute('type').catch(() => 'no-type');
      const className = await input.getAttribute('class').catch(() => 'no-class');
      const accept = await input.getAttribute('accept').catch(() => 'no-accept');
      const isVisible = await input.isVisible().catch(() => false);

      console.log(
        `   Input ${
          i + 1
        }: ID="${id}" Type="${type}" Class="${className}" Accept="${accept}" Visible=${isVisible}`
      );
    }

    // 3. Find elements with upload-related text
    console.log('\n📍 3. UPLOAD-RELATED ELEMENTS:');
    const uploadTexts = ['アップロード', 'ファイル', 'upload', 'file', '画像', 'image'];

    for (const text of uploadTexts) {
      try {
        const elements = await bindupPage.getByText(text, { exact: false }).all();
        for (let i = 0; i < elements.length; i++) {
          const element = elements[i];
          const tagName = await element.evaluate(el => el.tagName);
          const id = await element.getAttribute('id').catch(() => 'no-id');
          const className = await element.getAttribute('class').catch(() => 'no-class');
          const isVisible = await element.isVisible().catch(() => false);

          console.log(
            `   "${text}" Element ${
              i + 1
            }: Tag="${tagName}" ID="${id}" Class="${className}" Visible=${isVisible}`
          );
        }
      } catch (e) {
        console.log(`   No elements found for text: "${text}"`);
      }
    }

    // 4. Find elements by common upload button IDs
    console.log('\n📍 4. COMMON UPLOAD BUTTON IDS:');
    const commonIds = [
      'button-1023',
      'button-1040',
      'button-1027',
      'button-1014',
      'upload-btn',
      'file-upload',
      'image-upload',
      'btn-upload',
    ];

    for (const id of commonIds) {
      try {
        const element = bindupPage.locator(`#${id}`);
        const exists = (await element.count()) > 0;
        const isVisible = exists ? await element.isVisible().catch(() => false) : false;
        const text =
          exists && isVisible ? await element.textContent().catch(() => 'no-text') : 'N/A';

        console.log(`   #${id}: Exists=${exists} Visible=${isVisible} Text="${text}"`);
      } catch (e) {
        console.log(`   #${id}: Not found`);
      }
    }

    // 5. Find clickable elements in common areas
    console.log('\n📍 5. CLICKABLE ELEMENTS IN COMMON AREAS:');
    const areas = [
      'header',
      'nav',
      'main',
      'aside',
      'footer',
      '.toolbar',
      '.menu',
      '.sidebar',
      '.content',
    ];

    for (const area of areas) {
      try {
        const clickableElements = await bindupPage
          .locator(`${area} button, ${area} a, ${area} [role="button"]`)
          .all();
        if (clickableElements.length > 0) {
          console.log(`   ${area}: Found ${clickableElements.length} clickable elements`);

          for (let i = 0; i < Math.min(clickableElements.length, 3); i++) {
            // Show first 3
            const element = clickableElements[i];
            const id = await element.getAttribute('id').catch(() => 'no-id');
            const text = await element.textContent().catch(() => 'no-text');
            const isVisible = await element.isVisible().catch(() => false);

            console.log(`     - ID="${id}" Text="${text}" Visible=${isVisible}`);
          }
        }
      } catch (e) {
        // Area doesn't exist
      }
    }

    // 6. Take screenshot for visual inspection
    console.log('\n📍 6. TAKING SCREENSHOT FOR VISUAL INSPECTION:');
    await bindupPage.screenshot({
      path: 'dom-discovery-screenshot.png',
      fullPage: true,
    });
    console.log('   📸 Screenshot saved as: dom-discovery-screenshot.png');

    // 7. Get page HTML for detailed analysis
    console.log('\n📍 7. SAVING PAGE HTML:');
    const html = await bindupPage.content();
    require('fs').writeFileSync('dom-discovery-page.html', html);
    console.log('   📄 HTML saved as: dom-discovery-page.html');

    // 8. Interactive element discovery
    console.log('\n📍 8. INTERACTIVE ELEMENT DISCOVERY:');

    // Try to find file input elements specifically
    const fileInputs = await bindupPage.locator('input[type="file"]').all();
    console.log(`   Found ${fileInputs.length} file input elements`);

    for (let i = 0; i < fileInputs.length; i++) {
      const input = fileInputs[i];
      const id = await input.getAttribute('id').catch(() => 'no-id');
      const name = await input.getAttribute('name').catch(() => 'no-name');
      const accept = await input.getAttribute('accept').catch(() => 'no-accept');
      const isVisible = await input.isVisible().catch(() => false);
      const isHidden = await input.isHidden().catch(() => true);

      console.log(
        `   File Input ${
          i + 1
        }: ID="${id}" Name="${name}" Accept="${accept}" Visible=${isVisible} Hidden=${isHidden}`
      );

      // Check if there's a label or button associated with this input
      try {
        const parent = input.locator('..');
        const parentText = await parent.textContent().catch(() => 'no-text');
        console.log(`     Parent text: "${parentText}"`);
      } catch (e) {
        // No parent or text
      }
    }

    console.log('\n🎉 DOM Discovery completed!');
    console.log('📋 Check the console output above for detailed element information');
    console.log('📸 Check dom-discovery-screenshot.png for visual reference');
    console.log('📄 Check dom-discovery-page.html for complete HTML structure');
  });

  test('🎯 Test Specific Upload Button Strategies', async ({ page }) => {
    console.log('🎯 Testing specific upload button strategies...');

    // Navigate and authenticate (same as above)
    await page.goto('https://mypage.weblife.me/auth/');
    await page.locator('#loginID').fill('nguyent0810@gmail.com');
    await page.locator('#loginPass').fill('Tung@0810');
    await page.locator('a.buttonL.btnLogin').click();

    const [bindupPage] = await Promise.all([
      page.context().waitForEvent('page', { timeout: 30000 }),
      page.evaluate(() => {
        const button = document.querySelector('#button-1014') as HTMLElement;
        if (button) {
          button.click();
        } else {
          window.open('https://edit3.bindcloud.jp/bindcld/siteTheater/', '_blank');
        }
      }),
    ]);

    await bindupPage.waitForLoadState('networkidle', { timeout: 30000 });

    // Test different strategies to find upload functionality
    console.log('\n🧪 TESTING UPLOAD STRATEGIES:');

    // Strategy 1: Look for file input triggers
    console.log('\n📍 Strategy 1: File input triggers');
    const fileInputTriggers = [
      'button[onclick*="file"]',
      'button[onclick*="upload"]',
      'a[href*="upload"]',
      '[data-action*="upload"]',
      '[data-target*="file"]',
    ];

    for (const selector of fileInputTriggers) {
      const count = await bindupPage.locator(selector).count();
      if (count > 0) {
        console.log(`   ✅ Found ${count} elements with selector: ${selector}`);
        const element = bindupPage.locator(selector).first();
        const isVisible = await element.isVisible().catch(() => false);
        const text = await element.textContent().catch(() => 'no-text');
        console.log(`     First element - Visible: ${isVisible}, Text: "${text}"`);
      }
    }

    // Strategy 2: Look for elements that might trigger file dialogs
    console.log('\n📍 Strategy 2: Potential file dialog triggers');

    // Check if clicking certain elements opens file dialogs
    const potentialTriggers = [
      '#button-1023',
      '#button-1040',
      '#button-1027',
      'button:has-text("アップロード")',
      'button:has-text("ファイル")',
      'button:has-text("画像")',
      '.upload-btn',
      '.file-btn',
      '.image-btn',
    ];

    for (const selector of potentialTriggers) {
      try {
        const element = bindupPage.locator(selector);
        const count = await element.count();
        if (count > 0) {
          const isVisible = await element
            .first()
            .isVisible()
            .catch(() => false);
          const text = await element
            .first()
            .textContent()
            .catch(() => 'no-text');
          console.log(`   ✅ ${selector}: Count=${count}, Visible=${isVisible}, Text="${text}"`);

          if (isVisible) {
            console.log(`     🎯 This could be the upload button!`);
          }
        }
      } catch (e) {
        // Element not found
      }
    }

    console.log('\n🎉 Upload strategy testing completed!');
  });
});
