import { defineConfig, devices } from '@playwright/test';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  // Test directory
  testDir: './tests',

  // Run tests in files in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // 🌟 ENHANCED RETRY STRATEGY FOR MAXIMUM RELIABILITY
  retries: process.env.CI ? 3 : 1,

  // 🚀 OPTIMIZED WORKER CONFIGURATION FOR PERFORMANCE
  workers: process.env.CI ? 2 : 4,

  // Reporter to use
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }],
    ['list'],
  ],

  // Shared settings for all the projects below
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: process.env.BASE_URL || 'http://localhost:3000',

    // 🎯 ENHANCED DEBUGGING AND MONITORING
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    // ⚡ OPTIMIZED TIMEOUT CONFIGURATION FOR RELIABILITY
    actionTimeout: 45000,
    navigationTimeout: 60000,

    // 🚀 PERFORMANCE-OPTIMIZED BROWSER LAUNCH OPTIONS
    launchOptions: {
      args: [
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-field-trial-config',
        '--disable-ipc-flooding-protection',
        '--no-sandbox',
        '--disable-setuid-sandbox',
      ],
    },
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Additional Chrome-specific settings
        viewport: { width: 1920, height: 1080 },
        launchOptions: {
          args: ['--disable-web-security', '--disable-features=VizDisplayCompositor'],
        },
      },
    },

    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        // Additional WebKit-specific settings
        viewport: { width: 1920, height: 1080 },
      },
    },

    // Mobile testing (optional - can be enabled later)
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },
  ],

  // Run your local dev server before starting the tests
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  // },

  // Global setup and teardown (temporarily disabled for debugging)
  // globalSetup: require.resolve("./playwright-src/config/global-setup.ts"),
  // globalTeardown: require.resolve("./playwright-src/config/global-teardown.ts"),

  // Test timeout
  timeout: 60000,
  expect: {
    // Maximum time expect() should wait for the condition to be met
    timeout: 10000,
  },

  // Output directory for test artifacts
  outputDir: 'test-results/',
});
