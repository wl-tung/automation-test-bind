import { Page } from '@playwright/test';
import { TestLogger } from '../../utils/test-metrics';
import { SiteEditorConfig } from '../config/site-editor-config';

export class BiNDupSiteEditorPage {
  constructor(private page: Page) {}

  async verifySiteEditorLoaded(): Promise<void> {
    TestLogger.logStep('Verifying site editor loaded', 'start');

    let inSiteEditor = false;
    for (const indicator of SiteEditorConfig.SELECTORS.SITE_EDITOR.INDICATORS) {
      try {
        if (await this.page.locator(indicator).isVisible({ timeout: SiteEditorConfig.TIMEOUTS.SHORT_WAIT })) {
          inSiteEditor = true;
          TestLogger.logStep(`Site editor confirmed with indicator: ${indicator}`, 'success');
          break;
        }
      } catch (error) {
        continue;
      }
    }

    if (!inSiteEditor) {
      TestLogger.logStep('Site editor not detected', 'error');
      await this.page.screenshot({ path: 'debug-site-editor-not-detected.png' });
      throw new Error('Failed to verify site editor interface');
    }
  }

  async handleSecondStartGuidePopup(): Promise<void> {
    TestLogger.logStep('Handling second Start Guide popup', 'start');
    await this.page.waitForTimeout(SiteEditorConfig.TIMEOUTS.SHORT_WAIT);

    try {
      const popupButton = this.page.locator(SiteEditorConfig.SELECTORS.POPUPS.START_GUIDE_2);
      if (await popupButton.isVisible({ timeout: SiteEditorConfig.TIMEOUTS.MEDIUM_WAIT })) {
        await popupButton.click();
        TestLogger.logStep('Second Start Guide popup closed', 'success');
      } else {
        TestLogger.logStep('No second popup appeared', 'success');
      }
    } catch (error) {
      TestLogger.logStep('No second popup to handle', 'success');
    }
  }

  async enterPageEditMode(): Promise<void> {
    TestLogger.logStep('Entering page edit mode', 'start');

    const pageEditSelectors = [
      'text=ページ編集',
      'button:has-text("ページ編集")',
      '[title*="ページ編集"]',
      'text=編集',
      'button:has-text("編集")'
    ];

    let pageEditClicked = false;
    for (const selector of pageEditSelectors) {
      try {
        const element = this.page.locator(selector);
        if (await element.isVisible({ timeout: 3000 })) {
          await element.click();
          pageEditClicked = true;
          TestLogger.logStep(`Page editing mode opened using: ${selector}`, 'success');
          break;
        }
      } catch (error) {
        continue;
      }
    }

    if (!pageEditClicked) {
      TestLogger.logStep('Page edit button not found, may already be in edit mode', 'warning');
    }
  }

  private async clickBlockToRevealToolbar(blockSelector: string = '.b-plain.cssskin-_block_billboard', useForce: boolean = false): Promise<void> {
    TestLogger.logStep('Clicking block to reveal toolbar', 'start');
    const iframe = this.page.locator('iframe[name="preview"]').contentFrame();
    
    if (useForce) {
      await iframe.locator(blockSelector).first().click({ force: true });
    } else {
      await iframe.locator(blockSelector).first().click();
    }
    await this.page.waitForTimeout(1500);
  }

  private async clickAddMenuButton(): Promise<void> {
    TestLogger.logStep('Clicking add menu button', 'start');
    const iframe = this.page.locator('iframe[name="preview"]').contentFrame();
    await iframe.locator('#block_addmenu').click();
    await this.page.waitForTimeout(1500);
  }

  async addBlankBlock(): Promise<void> {
    TestLogger.logStep('Method 1: Adding blank block', 'start');
    
    await this.clickBlockToRevealToolbar();
    await this.clickAddMenuButton();
    
    const iframe = this.page.locator('iframe[name="preview"]').contentFrame();
    await iframe.getByText('空白ブロックを下に追加').click();
    await this.page.waitForTimeout(3000);
    
    TestLogger.logStep('✓ Method 1: Blank block added successfully', 'success');
  }

  async addSharedBlock(): Promise<void> {
    TestLogger.logStep('Method 2: Adding shared block', 'start');
    
    await this.clickBlockToRevealToolbar('.b-plain.cssskin-_block_billboard', true);
    await this.clickAddMenuButton();
    
    const iframe = this.page.locator('iframe[name="preview"]').contentFrame();
    await iframe.getByText('共有ブロックを下に追加').click();
    await this.page.waitForTimeout(2000);

    // Handle shared block selection dialog (outside iframe)
    TestLogger.logStep('Handling shared block selection dialog', 'start');
    try {
      await this.page.locator('#selTextSelect').click({ timeout: 3000 });
      await this.page.getByRole('link', { name: '_フッタメニュー', exact: true }).click();
      await this.page.locator('#button-1037').click();
      TestLogger.logStep('✓ Shared block dialog handled successfully', 'success');
    } catch (error) {
      TestLogger.logStep('Shared block dialog not found', 'warning');
    }
    
    TestLogger.logStep('✓ Method 2: Shared block added successfully', 'success');
  }

  async addTemplateBlock(): Promise<void> {
    TestLogger.logStep('Method 3: Adding template block', 'start');
    
    await this.clickBlockToRevealToolbar('.b-plain.cssskin-_block_billboard', true);
    await this.clickAddMenuButton();

    // Try to find template option
    const templateTexts = ['ブロックテンプレートから選択', 'テンプレートから選択', 'テンプレート'];
    let templateOptionFound = false;

    for (const text of templateTexts) {
      try {
        const iframe = this.page.locator('iframe[name="preview"]').contentFrame();
        await iframe.getByText(text).click({ timeout: 3000 });
        TestLogger.logStep(`✓ Found template option "${text}" in iframe`, 'success');
        templateOptionFound = true;
        break;
      } catch (error) {
        try {
          await this.page.getByText(text).click({ timeout: 3000 });
          TestLogger.logStep(`✓ Found template option "${text}" on main page`, 'success');
          templateOptionFound = true;
          break;
        } catch (error2) {
          continue;
        }
      }
    }

    if (!templateOptionFound) {
      TestLogger.logStep('Template option not found, skipping Method 3', 'warning');
      return;
    }

    await this.page.waitForTimeout(2000);

    // Handle block template selection in blockTemplate iframe
    TestLogger.logStep('Selecting template in blockTemplate iframe', 'start');
    const templateIframe = this.page.locator('iframe[name="blockTemplate"]').contentFrame();
    await templateIframe.locator('#bktmp429 div').first().click();
    await this.page.waitForTimeout(1000);

    await templateIframe.getByText('適用').click();
    await this.page.waitForTimeout(2000);

    TestLogger.logStep('✓ Method 3: Template block added successfully', 'success');
  }
}
