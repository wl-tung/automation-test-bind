import { Page, Locator } from '@playwright/test';

/**
 * 🏗️ Base Page Object
 * Provides common functionality for all page objects
 */
export abstract class BasePage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * 📝 Log a step with timestamp
   */
  protected async logStep(message: string): Promise<void> {
    console.log(`✅ ${message}`);
  }

  /**
   * 📝 Log an error with timestamp
   */
  protected async logError(message: string): Promise<void> {
    console.log(`❌ ${message}`);
  }

  /**
   * 📝 Log a warning with timestamp
   */
  protected async logWarning(message: string): Promise<void> {
    console.log(`⚠️ ${message}`);
  }

  /**
   * ⏳ Wait for page to load
   */
  protected async waitForPageLoad(timeout: number = 10000): Promise<void> {
    await this.page.waitForLoadState('networkidle', { timeout });
  }

  /**
   * 🖱️ Click with multiple selector fallbacks
   */
  protected async clickWithFallback(selectors: string[], timeout: number = 5000): Promise<boolean> {
    for (const selector of selectors) {
      try {
        let element: Locator;
        
        if (selector.startsWith('getBy')) {
          // Handle Playwright's getBy methods
          element = eval(`this.page.${selector}`);
        } else {
          element = this.page.locator(selector).first();
        }

        if (await element.isVisible({ timeout: 2000 })) {
          await element.click();
          await this.page.waitForTimeout(1000);
          return true;
        }
      } catch {
        continue;
      }
    }
    return false;
  }

  /**
   * ⌨️ Type with multiple selector fallbacks
   */
  protected async typeWithFallback(selectors: string[], text: string, timeout: number = 5000): Promise<boolean> {
    for (const selector of selectors) {
      try {
        let element: Locator;
        
        if (selector.startsWith('getBy')) {
          element = eval(`this.page.${selector}`);
        } else {
          element = this.page.locator(selector).first();
        }

        if (await element.isVisible({ timeout: 2000 })) {
          await element.fill(text);
          await this.page.waitForTimeout(500);
          return true;
        }
      } catch {
        continue;
      }
    }
    return false;
  }

  /**
   * 📸 Capture screenshot with timestamp
   */
  protected async captureScreenshot(name: string, fullPage: boolean = true): Promise<void> {
    const timestamp = Date.now();
    const filename = `${name}-${timestamp}.png`;
    await this.page.screenshot({ 
      path: filename,
      fullPage 
    });
    await this.logStep(`Screenshot captured: ${filename}`);
  }

  /**
   * ⏳ Wait for element with multiple selectors
   */
  protected async waitForElementWithFallback(selectors: string[], timeout: number = 10000): Promise<Locator | null> {
    for (const selector of selectors) {
      try {
        let element: Locator;
        
        if (selector.startsWith('getBy')) {
          element = eval(`this.page.${selector}`);
        } else {
          element = this.page.locator(selector).first();
        }

        await element.waitFor({ state: 'visible', timeout: 2000 });
        return element;
      } catch {
        continue;
      }
    }
    return null;
  }

  /**
   * 🔍 Check if element exists with multiple selectors
   */
  protected async elementExistsWithFallback(selectors: string[], timeout: number = 2000): Promise<boolean> {
    for (const selector of selectors) {
      try {
        let element: Locator;
        
        if (selector.startsWith('getBy')) {
          element = eval(`this.page.${selector}`);
        } else {
          element = this.page.locator(selector).first();
        }

        if (await element.isVisible({ timeout })) {
          return true;
        }
      } catch {
        continue;
      }
    }
    return false;
  }
}
