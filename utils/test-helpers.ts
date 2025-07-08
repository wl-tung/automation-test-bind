import { Page, Locator } from '@playwright/test';

/**
 * Test helper utilities
 */
export class TestHelpers {
  /**
   * Generate random string
   */
  static generateRandomString(length: number = 10): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Generate random email
   */
  static generateRandomEmail(): string {
    const randomString = this.generateRandomString(8);
    return `test.${randomString}@example.com`;
  }

  /**
   * Generate random phone number
   */
  static generateRandomPhoneNumber(): string {
    const areaCode = Math.floor(Math.random() * 900) + 100;
    const firstThree = Math.floor(Math.random() * 900) + 100;
    const lastFour = Math.floor(Math.random() * 9000) + 1000;
    return `${areaCode}-${firstThree}-${lastFour}`;
  }

  /**
   * Wait for element to contain text
   */
  static async waitForElementToContainText(
    locator: Locator,
    text: string,
    timeout: number = 30000
  ): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
    await locator.filter({ hasText: text }).waitFor({ timeout });
  }

  /**
   * Scroll to bottom of page
   */
  static async scrollToBottom(page: Page): Promise<void> {
    await page.evaluate(() => {
      (window as any).scrollTo(0, (document as any).body.scrollHeight);
    });
  }

  /**
   * Scroll to top of page
   */
  static async scrollToTop(page: Page): Promise<void> {
    await page.evaluate(() => {
      (window as any).scrollTo(0, 0);
    });
  }

  /**
   * Wait for network to be idle
   */
  static async waitForNetworkIdle(page: Page, timeout: number = 30000): Promise<void> {
    await page.waitForLoadState('networkidle', { timeout });
  }

  /**
   * Clear browser storage
   */
  static async clearBrowserStorage(page: Page): Promise<void> {
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  }

  /**
   * Set local storage item
   */
  static async setLocalStorageItem(page: Page, key: string, value: string): Promise<void> {
    await page.evaluate(({ key, value }) => localStorage.setItem(key, value), { key, value });
  }

  /**
   * Get local storage item
   */
  static async getLocalStorageItem(page: Page, key: string): Promise<string | null> {
    return await page.evaluate(key => localStorage.getItem(key), key);
  }

  /**
   * Take full page screenshot with timestamp
   */
  static async takeTimestampedScreenshot(page: Page, name: string): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await page.screenshot({
      path: `test-results/screenshots/${name}-${timestamp}.png`,
      fullPage: true,
    });
  }

  /**
   * Wait for file download
   */
  static async waitForDownload(page: Page, triggerAction: () => Promise<void>): Promise<string> {
    const downloadPromise = page.waitForEvent('download');
    await triggerAction();
    const download = await downloadPromise;
    const path = `test-results/downloads/${download.suggestedFilename()}`;
    await download.saveAs(path);
    return path;
  }

  /**
   * Format date for input fields
   */
  static formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Get current timestamp
   */
  static getCurrentTimestamp(): string {
    return new Date().toISOString();
  }

  /**
   * Sleep for specified milliseconds
   */
  static async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
