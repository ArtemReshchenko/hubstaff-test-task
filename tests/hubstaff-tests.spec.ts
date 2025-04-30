import { expect } from '@playwright/test';
import { test } from './fixtures/common-fixtures';
import {
  generateUniqueName,
  takeScreenshotOnFailure,
  generateTestUser,
  logTestStep,
  retryOperation,
  TEST_USER
} from './utils/test-helpers';
import { EmailHelper } from './utils/email-helper';
import { MarketingPage } from './pages/marketing-page';
import { SignupPage } from './pages/signup-page';
import { TEST_CONSTANTS } from './utils/test-constants';
import { validateTestData } from './utils/validation-helpers';

test.describe('User Authentication', () => {
  test.describe('Signup Flow', () => {
    test(`${TEST_CONSTANTS.TEST_TAGS.AUTH} should successfully complete 14-day free trial signup with email verification`, async ({ page }) => {
      logTestStep('Starting signup test');
      const marketingPage = new MarketingPage(page);
      const signupPage = new SignupPage(page);

      // Get API key from environment
      const apiKey = process.env.MAILSLURP_API_KEY;
      if (!apiKey) {
        throw new Error('MAILSLURP_API_KEY is not set in environment variables or .env file');
      }

      const emailHelper = new EmailHelper(page, apiKey, true);

      // Navigate to marketing page
      logTestStep('Navigating to marketing page');
      await marketingPage.goto();
      await marketingPage.verifyOnMarketingPage();

      // Start signup process
      logTestStep('Initiating signup process');
      await marketingPage.clickFreeTrialButton();
      await signupPage.verifyOnSignupPage();

      // Create test user data
      const testUser = generateTestUser();
      logTestStep('Generated test user data', { email: testUser.email });

      // Validate test user data
      const validationErrors = validateTestData({
        email: testUser.email,
        password: testUser.password,
        firstName: testUser.firstName,
        lastName: testUser.lastName
      });

      if (validationErrors.length > 0) {
        throw new Error(`Invalid test data: ${validationErrors.join(', ')}`);
      }

      // Create email inbox
      const { inbox, emailAddress } = await emailHelper.createInbox();
      logTestStep('Created temporary email', { emailAddress });

      // Complete registration with retry logic
      const userData = {
        ...testUser,
        email: emailAddress,
        inboxId: inbox.id,
      };

      logTestStep('Completing registration');
      const success = await retryOperation(
        () => signupPage.completeRegistrationWithEmailVerification(userData),
        TEST_CONSTANTS.RETRY.DEFAULT_ATTEMPTS,
        TEST_CONSTANTS.RETRY.DEFAULT_DELAY
      );

      expect(success).toBe(true);
      logTestStep('Registration completed successfully');

      // Cleanup
      await emailHelper.deleteInbox(inbox.id);
      logTestStep('Test cleanup completed');
    });
  });

  test.describe('Login Flow', () => {
    test(`${TEST_CONSTANTS.TEST_TAGS.AUTH} should successfully login with valid credentials`, async ({ authenticatedPage }) => {
      logTestStep('Starting login test');
      await expect(authenticatedPage).toHaveURL(/.*\/getting_started.*/);
      logTestStep('Login successful');
    });
  });
});

test.describe('Project Management', () => {
  test(`${TEST_CONSTANTS.TEST_TAGS.PROJECT} should create a new project successfully`, async ({ projectPage }) => {
    logTestStep('Starting project creation test');
    
    const projectName = generateUniqueName('Project');
    const projectRate = TEST_CONSTANTS.PROJECT.DEFAULT_RATE;
    
    // Validate project data
    const validationErrors = validateTestData({ rate: projectRate });
    if (validationErrors.length > 0) {
      throw new Error(`Invalid project data: ${validationErrors.join(', ')}`);
    }

    logTestStep('Creating project', { 
      projectName,
      description: TEST_CONSTANTS.PROJECT.DEFAULT_DESCRIPTION,
      rate: projectRate,
      currency: TEST_CONSTANTS.PROJECT.DEFAULT_CURRENCY
    });
    
    await projectPage.createProject(projectName);
    logTestStep('Project created successfully');
  });
});

test.describe('Financial Management', () => {
  test(`${TEST_CONSTANTS.TEST_TAGS.PAYMENT} should create a one-time payment successfully`, async ({ paymentPage }) => {
    logTestStep('Starting payment creation test');

    // Validate payment data
    const validationErrors = validateTestData({ amount: TEST_CONSTANTS.PAYMENT.DEFAULT_AMOUNT });
    if (validationErrors.length > 0) {
      throw new Error(`Invalid payment data: ${validationErrors.join(', ')}`);
    }

    logTestStep('Creating payment', { 
      amount: TEST_CONSTANTS.PAYMENT.DEFAULT_AMOUNT,
      note: TEST_CONSTANTS.PAYMENT.DEFAULT_NOTE,
      currency: TEST_CONSTANTS.PAYMENT.CURRENCY
    });

    await paymentPage.createOneTimePayment(
      TEST_USER.fullName,
      TEST_CONSTANTS.PAYMENT.DEFAULT_AMOUNT,
      TEST_CONSTANTS.PAYMENT.DEFAULT_NOTE
    );
    
    logTestStep('Payment created successfully');
  });
});

test.afterEach(async ({ page }, testInfo) => {
  await takeScreenshotOnFailure(testInfo, page);
});