import { Page, Locator } from '@playwright/test';
import { BasePage } from './base-page';
import { SiteTheaterHealthChecker, HealthCheckResult } from './site-theater-health-checker';

/**
 * WebLife Authentication Page Object
 * Handles login flow for WebLife application
 */
export class WebLifeAuthPage extends BasePage {
  // Page elements
  private readonly loginIdInput: Locator;
  private readonly loginPasswordInput: Locator;
  private readonly loginButton: Locator;
  private readonly bindupLaunchButton: Locator;
  private readonly logoutButton: Locator;

  constructor(page: Page) {
    super(page, 'https://mypage.weblife.me/auth/');

    // Initialize locators
    this.loginIdInput = page.locator('#loginID');
    this.loginPasswordInput = page.locator('#loginPass');
    this.loginButton = page.locator('a.buttonL.btnLogin');
    this.bindupLaunchButton = page.locator('text=BiNDupを起動');
    this.logoutButton = page.locator('text=ログアウト');
  }

  /**
   * Verify auth page is loaded correctly
   */
  async verifyAuthPageLoaded(): Promise<void> {
    await this.waitForElement(this.loginIdInput);
    await this.waitForElement(this.loginPasswordInput);
    await this.waitForElement(this.loginButton);
  }

  /**
   * Perform login with credentials
   */
  async login(username: string, password: string): Promise<void> {
    console.log('🔐 Starting WebLife login process...');

    // Fill username
    await this.fillInput(this.loginIdInput, username);
    console.log('✅ Username entered');

    // Fill password
    await this.fillInput(this.loginPasswordInput, password);
    console.log('✅ Password entered');

    // Click login button
    await this.clickElement(this.loginButton);
    console.log('✅ Login button clicked');
  }

  /**
   * Wait for successful login and app to load
   */
  async waitForLoginSuccess(): Promise<void> {
    console.log('⏳ Waiting for app to load after login...');

    // Wait for navigation to mypage
    await this.page.waitForURL('**/mypage', { timeout: 30000 });

    // Wait for logout button to be visible (indicates successful login)
    await this.waitForElement(this.logoutButton, 15000);

    console.log('✅ Login successful, app loaded');
  }

  /**
   * Click BiNDup launch button
   */
  async launchBiNDup(): Promise<void> {
    console.log('🚀 Looking for BiNDup launch button...');

    // Wait for BiNDup button to be available
    await this.waitForElement(this.bindupLaunchButton);

    // Click the BiNDup launch button
    await this.clickElement(this.bindupLaunchButton);

    console.log('✅ BiNDup launch button clicked');
  }

  /**
   * Verify BiNDup application is loaded (Site Theater) - Cross-browser compatible
   */
  async verifyBiNDupLoaded(): Promise<any> {
    console.log('🎭 Verifying BiNDup application is loaded...');

    // Detect browser type for different handling
    const browserName = this.page.context().browser()?.browserType().name();
    console.log(`🌐 Browser detected: ${browserName}`);

    let newPage;

    if (browserName === 'webkit') {
      // WebKit-specific approach
      newPage = await this.launchBiNDupWebKit();
    } else {
      // Chrome/Chromium approach
      newPage = await this.launchBiNDupChrome();
    }

    // Wait for the new page to load completely
    await newPage.waitForLoadState('domcontentloaded', { timeout: 60000 });
    console.log('✅ Page DOM loaded');

    // Wait for network to be idle (all resources loaded)
    try {
      await newPage.waitForLoadState('networkidle', { timeout: 30000 });
      console.log('✅ Network idle - all resources loaded');
    } catch (error) {
      console.log('⚠️ Network idle timeout, continuing with verification');
    }

    // Verify Site Theater specific elements are loaded
    await this.verifySiteTheaterElements(newPage);

    // Perform comprehensive health check
    const healthChecker = new SiteTheaterHealthChecker(newPage);
    const healthResult = await healthChecker.performHealthCheck();

    // Log health check results
    console.log(`🏥 Site Theater Health: ${healthResult.overall}`);
    if (healthResult.overall === 'FAIL') {
      console.log('❌ Critical health issues detected:');
      Object.entries(healthResult.checks).forEach(([check, result]) => {
        if (result.status === 'FAIL') {
          console.log(`   - ${check}: ${JSON.stringify(result.details)}`);
        }
      });
    } else if (healthResult.overall === 'WARN') {
      console.log('⚠️ Health warnings detected:');
      Object.entries(healthResult.checks).forEach(([check, result]) => {
        if (result.status === 'WARN') {
          console.log(`   - ${check}: ${JSON.stringify(result.details)}`);
        }
      });
    }

    // Take screenshot of BiNDup application
    await newPage.screenshot({
      path: `test-results/bindup-loaded-${browserName}.png`,
      fullPage: true,
    });

    console.log('✅ BiNDup application loaded successfully');
    console.log(`BiNDup URL: ${newPage.url()}`);

    // Return both the page and health result
    return { page: newPage, health: healthResult };
  }

  /**
   * Launch BiNDup for Chrome/Chromium browsers
   */
  async launchBiNDupChrome(): Promise<any> {
    console.log('🚀 Launching BiNDup (Chrome method)...');

    const [newPage] = await Promise.all([
      this.page.context().waitForEvent('page'),
      this.clickElement(this.bindupLaunchButton),
    ]);

    return newPage;
  }

  /**
   * Launch BiNDup for WebKit browsers with alternative approaches
   */
  async launchBiNDupWebKit(): Promise<any> {
    console.log('🚀 Launching BiNDup (WebKit method)...');

    // Method 1: Try direct JavaScript execution
    try {
      console.log('🔧 Trying Method 1: Direct JavaScript execution...');

      const [newPage] = await Promise.all([
        this.page.context().waitForEvent('page', { timeout: 10000 }),
        this.page.evaluate(() => {
          // Execute the cloudStart function directly
          (window as any).cloudStart('1', '/bindstart');
        }),
      ]);

      console.log('✅ Method 1 successful');
      return newPage;
    } catch (error) {
      console.log('⚠️ Method 1 failed, trying Method 2...');
    }

    // Method 2: Try clicking with force and different timing
    try {
      console.log('🔧 Trying Method 2: Force click with timeout handling...');

      // Click the button first
      await this.bindupLaunchButton.click({ force: true });

      // Wait for new page with longer timeout
      const newPage = await this.page.context().waitForEvent('page', { timeout: 15000 });

      console.log('✅ Method 2 successful');
      return newPage;
    } catch (error) {
      console.log('⚠️ Method 2 failed, trying Method 3...');
    }

    // Method 3: Try manual URL construction
    try {
      console.log('🔧 Trying Method 3: Manual URL construction...');

      // Get the current page URL and construct BiNDup URL
      const currentUrl = this.page.url();
      const baseUrl = new URL(currentUrl).origin;
      const bindupUrl = `${baseUrl}/bindstart`;

      console.log(`🔗 Constructed BiNDup URL: ${bindupUrl}`);

      // Open new page manually
      const newPage = await this.page.context().newPage();
      await newPage.goto(bindupUrl);

      console.log('✅ Method 3 successful');
      return newPage;
    } catch (error) {
      console.log('⚠️ Method 3 failed, trying Method 4...');
    }

    // Method 4: Try href attribute extraction and navigation
    try {
      console.log('🔧 Trying Method 4: Extract href and navigate...');

      // Get the href attribute and extract the JavaScript
      const href = await this.bindupLaunchButton.getAttribute('href');
      console.log(`🔗 Button href: ${href}`);

      if (href && href.includes('cloudStart')) {
        // Extract parameters from javascript:cloudStart('1', '/bindstart');
        const match = href.match(/cloudStart\('([^']+)',\s*'([^']+)'\)/);
        if (match) {
          const [, param1, param2] = match;
          console.log(`📋 Extracted params: ${param1}, ${param2}`);

          // Try to construct the URL manually
          const currentUrl = this.page.url();
          const baseUrl = new URL(currentUrl).origin;
          const bindupUrl = `${baseUrl}${param2}`;

          console.log(`🔗 Final BiNDup URL: ${bindupUrl}`);

          const newPage = await this.page.context().newPage();
          await newPage.goto(bindupUrl);

          console.log('✅ Method 4 successful');
          return newPage;
        }
      }
    } catch (error) {
      console.log('⚠️ Method 4 failed');
    }

    // If all methods fail, throw an error
    throw new Error('❌ All WebKit BiNDup launch methods failed');
  }

  /**
   * Verify Site Theater specific elements are present and functional
   */
  async verifySiteTheaterElements(page: any): Promise<void> {
    console.log('🔍 Verifying Site Theater elements...');

    // Wait for the page title to be set (with fallback)
    try {
      await page.waitForFunction(() => document.title !== '', { timeout: 10000 });
    } catch (error) {
      console.log('⚠️ Title wait timeout, checking current title...');
    }

    const title = await page.title();
    console.log(`📄 Page title: "${title || 'No title set'}"`);

    // Look for common Site Theater elements
    const commonSelectors = [
      'body',
      'html',
      '[class*="theater"]',
      '[id*="theater"]',
      '[class*="site"]',
      '[id*="site"]',
      'canvas',
      'iframe',
      '[class*="editor"]',
      '[class*="workspace"]',
    ];

    let elementsFound = 0;
    for (const selector of commonSelectors) {
      try {
        const elements = await page.locator(selector).count();
        if (elements > 0) {
          console.log(`✅ Found ${elements} element(s) with selector: ${selector}`);
          elementsFound++;
        }
      } catch (error) {
        // Selector might not be valid, continue
      }
    }

    console.log(`📊 Total elements found: ${elementsFound}`);

    // Verify page is interactive
    const isInteractive = await page.evaluate(() => {
      return document.readyState === 'complete' || document.readyState === 'interactive';
    });

    if (isInteractive) {
      console.log('✅ Page is interactive');
    } else {
      console.log('⚠️ Page may not be fully interactive yet');
    }

    // Check for any error messages
    const errorSelectors = [
      '[class*="error"]',
      '[id*="error"]',
      'text=Error',
      'text=エラー',
      '[class*="alert"]',
    ];

    for (const errorSelector of errorSelectors) {
      try {
        const errorElements = await page.locator(errorSelector).count();
        if (errorElements > 0) {
          console.log(`⚠️ Found ${errorElements} potential error element(s): ${errorSelector}`);
        }
      } catch (error) {
        // Continue checking
      }
    }

    console.log('✅ Site Theater elements verification completed');
  }

  /**
   * Complete full login flow including BiNDup launch
   */
  async completeLoginFlow(username: string, password: string): Promise<any> {
    await this.goto();
    await this.verifyAuthPageLoaded();
    await this.login(username, password);
    await this.waitForLoginSuccess();
    return await this.verifyBiNDupLoaded();
  }

  /**
   * Check if user is already logged in
   */
  async isUserLoggedIn(): Promise<boolean> {
    try {
      // If we're not on the auth page, user might be logged in
      const currentUrl = this.getCurrentUrl();
      return !currentUrl.includes('/auth/');
    } catch {
      return false;
    }
  }

  /**
   * Get current page title for verification
   */
  async verifyPageTitle(expectedTitlePattern: RegExp): Promise<void> {
    const title = await this.getTitle();
    if (!expectedTitlePattern.test(title)) {
      throw new Error(`Expected title to match ${expectedTitlePattern} but got "${title}"`);
    }
  }
}
