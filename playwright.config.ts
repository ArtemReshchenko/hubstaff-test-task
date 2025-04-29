import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only by default, can be overridden with environment variable */
  retries: process.env.CI ? 2 : 0,
  /* Workers can be configured through environment variable */
  workers: process.env.CI ? 3 : undefined,
  /* Reporter configuration with both HTML and Allure */
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['allure-playwright', { outputFolder: 'allure-results' }],
  ],
  
  /* Global setup to install dependencies if required */
  globalSetup: process.env.SETUP_GLOBAL === 'true' ? './tests/global-setup.ts' : undefined,
  
  /* Run tests in various configurations */
  projects: [
    {
      name: 'setup',
      testMatch: /global-setup\.ts/,
    },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: process.env.SETUP_GLOBAL === 'true' ? ['setup'] : [],
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    }
  ],
  
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.BASE_URL || 'https://hubstaff.com',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    
    /* Record video for failed tests */
    video: 'retain-on-failure',
    
    /* Capture screenshot after each test failure */
    screenshot: 'only-on-failure',
    
    /* Viewport size */
    viewport: { width: 1280, height: 720 },
    
    /* Maximum time each action such as `click()` can take. Default is 0 (no timeout) */
    actionTimeout: 15000,
    
    /* Maximum time navigation like `goto()` can take. Default is 30 seconds */
    navigationTimeout: 30000,
    
    /* Run tests headlessly by default */
    headless: process.env.HEADLESS !== 'false',
  },

  /* Test timeout can be configured through environment variable */
  timeout: parseInt(process.env.TEST_TIMEOUT || '60000'),
  
  /* Directory for test artifacts */
  outputDir: 'test-results/',
  
  /* Use more global timeouts for CI environments */
  globalTimeout: process.env.CI ? 60 * 60 * 1000 : undefined,
  
  /* Consider tests as timed out if stuck in steps for too long */
  expect: {
    timeout: parseInt(process.env.EXPECT_TIMEOUT || '15000'),
  },
  
  /* Configure web server if necessary */
  webServer: process.env.START_SERVER === 'true' ? {
    command: 'npm run start',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  } : undefined,
});

