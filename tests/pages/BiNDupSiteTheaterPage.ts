import { Page } from '@playwright/test';
import { TestLogger } from '../../utils/test-metrics';

export class BiNDupSiteTheaterPage {
  constructor(private page: Page) {}

  async handleStartGuidePopup(): Promise<void> {
    TestLogger.logStep('Handling Start Guide popup', 'start');
    await this.page.waitForTimeout(2000);
    
    try {
      await this.page.locator('#button-1014').click();
      TestLogger.logStep('Start Guide popup closed with button-1014', 'success');
    } catch (error) {
      TestLogger.logStep('No Start Guide popup found', 'warning');
    }
  }

  async navigateToSiteTheater(): Promise<void> {
    TestLogger.logStep('Navigating to Site Theater', 'start');
    await this.page.goto('https://edit3.bindcloud.jp/bindcld/siteTheater/');
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(3000);
    
    // Open site list
    await this.page.locator('#button-1014').click();
    await this.page.waitForTimeout(3000);
    TestLogger.logStep('Site Theater loaded and site list opened', 'success');
  }

  async selectFirstSiteForEditing(): Promise<void> {
    TestLogger.logStep('Selecting first site for editing', 'start');
    
    // Wait for sites to load
    await this.page.waitForFunction(
      () => {
        const sites = document.querySelectorAll('#id-exist-mysite .cs-item[draggable="true"]');
        return sites.length > 0;
      },
      { timeout: 15000 }
    );

    const firstSite = this.page.locator('#id-exist-mysite .cs-item[draggable="true"]').first();
    
    // Hover to reveal edit button
    TestLogger.logStep('Hovering over site to reveal edit button', 'start');
    await firstSite.hover();
    await this.page.waitForTimeout(1000);

    // Click edit button
    const editButton = firstSite.locator('.cs-select.cs-click');
    await editButton.click();
    TestLogger.logStep('Edit button clicked, waiting for popup', 'start');
    
    await this.page.waitForTimeout(2000);
  }

  async openSiteEditor(): Promise<void> {
    TestLogger.logStep('Opening site editor', 'start');
    
    const siteEditButton = this.page.locator('text=サイトを編集');
    
    try {
      await siteEditButton.waitFor({ state: 'visible', timeout: 10000 });
      TestLogger.logStep('Site edit popup appeared', 'success');

      await siteEditButton.click();
      TestLogger.logStep('Clicked "サイトを編集" button', 'success');

      // Wait for navigation to site editor
      await this.page.waitForURL('**/siteEditor/**', { timeout: 15000 });
      await this.page.waitForLoadState('networkidle');
      await this.page.waitForTimeout(3000);
      
      TestLogger.logStep('Successfully navigated to site editor', 'success');
    } catch (error) {
      TestLogger.logStep('Failed to open site editor', 'error');
      await this.page.screenshot({ path: 'debug-site-editor-open-failed.png' });
      throw new Error('Failed to open site editor');
    }
  }
}
