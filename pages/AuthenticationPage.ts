import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * 🔐 Authentication Page Object
 * Handles WebLife authentication with cross-browser compatibility
 */
export class AuthenticationPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Selectors
  private readonly selectors = {
    emailInput: 'input[name="WEBLIFE ID（メールアドレス）"], [role="textbox"][name*="WEBLIFE"], #loginID',
    passwordInput: 'input[placeholder="パスワード"], input[name="password"], #loginPass',
    loginButton: 'a.buttonL.btnLogin, [role="link"][name*="ログイン"], button[type="submit"]',
    bindupLaunchButton: '[role="link"][name*="BiNDupを起動"], a[href*="bindstart"]',
  };

  /**
   * 🌐 Navigate to authentication page
   */
  async navigateToAuth(): Promise<void> {
    await this.logStep('Navigating to authentication page');
    await this.page.goto('https://mypage.weblife.me/auth/');
    await this.waitForPageLoad();
  }

  /**
   * 🔑 Perform authentication with credentials
   */
  async authenticate(email: string = 'nguyen-tung@web-life.co.jp', password: string = 'x7wtPvVVnKLgYYR'): Promise<void> {
    await this.logStep('Performing authentication');
    
    // Enter email with multiple selector strategies
    await this.clickWithFallback([
      'getByRole("textbox", { name: "WEBLIFE ID（メールアドレス）" })',
      this.selectors.emailInput,
    ]);
    await this.typeWithFallback([
      'getByRole("textbox", { name: "WEBLIFE ID（メールアドレス）" })',
      this.selectors.emailInput,
    ], email);

    // Enter password with WebKit-compatible approach
    await this.clickWithFallback([
      'getByPlaceholder("パスワード")',
      this.selectors.passwordInput,
    ]);
    await this.typeWithFallback([
      'getByPlaceholder("パスワード")',
      this.selectors.passwordInput,
    ], password);

    // Click login button
    await this.clickWithFallback([
      'getByRole("link", { name: "ログイン" })',
      this.selectors.loginButton,
    ]);

    await this.waitForPageLoad();
    await this.logStep('Authentication completed successfully');
  }

  /**
   * 🚀 Launch BiNDup with cross-browser compatibility
   */
  async launchBiNDup(): Promise<Page> {
    await this.logStep('Launching BiNDup with proven WebKit solution');

    // Use the proven WebKit solution: context().waitForEvent('page') + window.open
    const [bindupPage] = await Promise.all([
      this.page.context().waitForEvent('page', { timeout: 30000 }),
      this.page.evaluate(() => {
        // Try multiple approaches for cross-browser compatibility
        if (typeof (window as any).cloudStart === 'function') {
          (window as any).cloudStart('1', '/bindstart');
        } else {
          // Fallback: direct window.open (works on WebKit)
          const baseUrl = window.location.origin;
          const bindupUrl = `${baseUrl}/bindstart`;
          window.open(bindupUrl, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
        }
      }),
    ]);

    await this.logStep(`BiNDup launch successful - NEW WINDOW CAPTURED!`);
    await this.logStep(`BiNDup URL: ${bindupPage.url()}`);
    
    return bindupPage;
  }

  /**
   * 🔐 Complete authentication and launch BiNDup
   */
  async authenticateAndLaunch(): Promise<Page> {
    await this.navigateToAuth();
    await this.authenticate();
    return await this.launchBiNDup();
  }
}
