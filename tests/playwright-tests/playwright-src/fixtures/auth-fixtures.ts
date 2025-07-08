import { test as base, Page } from '@playwright/test';
import { LoginPage } from '@pages/index';

/**
 * Authentication fixtures for handling login state
 */
type AuthFixtures = {
  authenticatedPage: Page;
  adminPage: Page;
};

/**
 * Extended test with authentication fixtures
 */
export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // Login as regular user
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(
      process.env.TEST_USER_EMAIL || 'test@example.com',
      process.env.TEST_USER_PASSWORD || 'password123'
    );
    
    // Wait for successful login
    await page.waitForURL('**/dashboard'); // Adjust based on your app
    
    await use(page);
  },

  adminPage: async ({ page }, use) => {
    // Login as admin user
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(
      process.env.ADMIN_EMAIL || 'admin@example.com',
      process.env.ADMIN_PASSWORD || 'admin123'
    );
    
    // Wait for successful admin login
    await page.waitForURL('**/admin'); // Adjust based on your app
    
    await use(page);
  },
});

export { expect } from '@playwright/test';
