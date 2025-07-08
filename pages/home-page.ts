import { Page, Locator } from '@playwright/test';
import { BasePage } from './base-page';

/**
 * Home Page Object
 * Example implementation of a page object extending BasePage
 */
export class HomePage extends BasePage {
  // Page elements
  private readonly header: Locator;
  private readonly navigationMenu: Locator;
  private readonly searchBox: Locator;
  private readonly searchButton: Locator;
  private readonly loginButton: Locator;
  private readonly signupButton: Locator;
  private readonly featuredSection: Locator;
  private readonly footer: Locator;

  constructor(page: Page) {
    super(page, '/'); // Base URL will be prepended from config
    
    // Initialize locators
    this.header = page.locator('[data-testid="header"]');
    this.navigationMenu = page.locator('[data-testid="nav-menu"]');
    this.searchBox = page.locator('[data-testid="search-input"]');
    this.searchButton = page.locator('[data-testid="search-button"]');
    this.loginButton = page.locator('[data-testid="login-button"]');
    this.signupButton = page.locator('[data-testid="signup-button"]');
    this.featuredSection = page.locator('[data-testid="featured-section"]');
    this.footer = page.locator('[data-testid="footer"]');
  }

  /**
   * Verify page is loaded correctly
   */
  async verifyPageLoaded(): Promise<void> {
    await this.waitForElement(this.header);
    await this.waitForElement(this.navigationMenu);
    await this.waitForElement(this.footer);
  }

  /**
   * Search for a term
   */
  async search(searchTerm: string): Promise<void> {
    await this.fillInput(this.searchBox, searchTerm);
    await this.clickElement(this.searchButton);
  }

  /**
   * Click login button
   */
  async clickLogin(): Promise<void> {
    await this.clickElement(this.loginButton);
  }

  /**
   * Click signup button
   */
  async clickSignup(): Promise<void> {
    await this.clickElement(this.signupButton);
  }

  /**
   * Navigate to a specific section
   */
  async navigateToSection(sectionName: string): Promise<void> {
    const sectionLink = this.page.locator(`[data-testid="nav-${sectionName}"]`);
    await this.clickElement(sectionLink);
  }

  /**
   * Check if user is logged in
   */
  async isUserLoggedIn(): Promise<boolean> {
    const userMenu = this.page.locator('[data-testid="user-menu"]');
    return await this.isElementVisible(userMenu);
  }

  /**
   * Get featured items count
   */
  async getFeaturedItemsCount(): Promise<number> {
    const featuredItems = this.featuredSection.locator('[data-testid="featured-item"]');
    return await featuredItems.count();
  }

  /**
   * Verify page title
   */
  async verifyPageTitle(expectedTitle: string): Promise<void> {
    const title = await this.getTitle();
    if (title !== expectedTitle) {
      throw new Error(`Expected title "${expectedTitle}" but got "${title}"`);
    }
  }
}
