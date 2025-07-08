import { test as base } from '@playwright/test';
import { HomePage, LoginPage, WebLifeAuthPage } from '@pages/index';

/**
 * Custom fixtures that extend Playwright's base test
 * Provides page objects and other utilities to tests
 */
type PageFixtures = {
  homePage: HomePage;
  loginPage: LoginPage;
  webLifeAuthPage: WebLifeAuthPage;
};

/**
 * Extended test with page object fixtures
 */
export const test = base.extend<PageFixtures>({
  homePage: async ({ page }, use) => {
    const homePage = new HomePage(page);
    await use(homePage);
  },

  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  webLifeAuthPage: async ({ page }, use) => {
    const webLifeAuthPage = new WebLifeAuthPage(page);
    await use(webLifeAuthPage);
  },
});

export { expect } from '@playwright/test';
