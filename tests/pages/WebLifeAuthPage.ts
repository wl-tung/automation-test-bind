import { Page } from '@playwright/test';
import { TestLogger } from '../../utils/test-metrics';
import { SiteEditorConfig } from '../config/site-editor-config';

export class WebLifeAuthPage {
  constructor(private page: Page) {}

  async navigateToAuth(): Promise<void> {
    TestLogger.logStep('Navigating to WebLife auth', 'start');
    try {
      await this.page.goto(SiteEditorConfig.WEBLIFE_AUTH_URL, {
        waitUntil: 'domcontentloaded',
        timeout: SiteEditorConfig.TIMEOUTS.PAGE_LOAD
      });
      TestLogger.logStep('WebLife authentication page loaded', 'success');
    } catch (error) {
      TestLogger.logStep(`Failed to load WebLife auth page: ${error}`, 'error');
      throw new Error(`Cannot access WebLife authentication page: ${error}`);
    }
  }

  async login(email: string, password: string): Promise<void> {
    TestLogger.logStep('Entering credentials', 'start');

    // Parallel credential entry for better performance
    await Promise.all([
      this.page.locator(SiteEditorConfig.SELECTORS.AUTH.LOGIN_ID).fill(email),
      this.page.locator(SiteEditorConfig.SELECTORS.AUTH.LOGIN_PASS).fill(password)
    ]);

    TestLogger.logStep('Credentials entered', 'success');

    TestLogger.logStep('Clicking login button', 'start');
    await this.page.locator(SiteEditorConfig.SELECTORS.AUTH.LOGIN_BUTTON).click();
    TestLogger.logStep('Login button clicked', 'success');
  }

  async launchBiNDup(): Promise<Page> {
    TestLogger.logStep('Launching BiNDup application', 'start');
    const pagePromise = this.page.waitForEvent('popup');
    await this.page.getByRole('link', { name: 'BiNDupを起動' }).click();
    const newPage = await pagePromise;
    await newPage.waitForLoadState('networkidle');
    TestLogger.logStep('BiNDup application launched in new window/tab', 'success');
    return newPage;
  }
}
