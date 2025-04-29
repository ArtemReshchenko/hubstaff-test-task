import { test, expect } from '@playwright/test';
import {
  TEST_USER,
  generateUniqueName,
  takeScreenshotOnFailure,
} from './utils/test-helpers';
import { EmailHelper } from './utils/email-helper';
import { MarketingPage } from './pages/marketing-page';
import { SignupPage } from './pages/signup-page';
import { LoginPage } from './pages/login-page';
import { ProjectPage } from './pages/project-page';
import { PaymentPage } from './pages/payment-page';

// Test case #83: Signup for the 14-day free trial
test.describe('Hubstaff Signup and Login', () => {
  // Increase timeout for email verification tests
  test.setTimeout(120000);

  test('Test Case #83: Signup for the 14-day free trial', async ({ page }) => {
    // Initialize page objects
    const marketingPage = new MarketingPage(page);
    const signupPage = new SignupPage(page);

    // Get API key from environment
    const apiKey = process.env.MAILSLURP_API_KEY;
    if (!apiKey) {
      throw new Error(
        'MAILSLURP_API_KEY is not set in environment variables or .env file',
      );
    }

    const emailHelper = new EmailHelper(page, apiKey, true); // Enable debug logging

    // Precondition: Marketing landing page is open
    await marketingPage.goto();
    await marketingPage.verifyOnMarketingPage();

    // 1. Click the 'Free 14-day trial' button on the top nav header
    await marketingPage.clickFreeTrialButton();

    // Verify redirect to sign up page
    await signupPage.verifyOnSignupPage();

    // Create a new MailSlurp inbox for verification
    const { inbox, emailAddress } = await emailHelper.createInbox();
    console.log(`Created temporary email address: ${emailAddress}`);

    // Generate random first and last names
    const firstName = generateUniqueName('User', false);
    const lastName = generateUniqueName('Test', false);
    console.log(`Generated test user: ${firstName} ${lastName}`);

    // 2-6. Complete the signup process with the MailSlurp email
    const userData = {
      firstName,
      lastName,
      email: emailAddress,
      password: TEST_USER.password,
      inboxId: inbox.id,
    };

    // Complete registration with email verification
    const success =
      await signupPage.completeRegistrationWithEmailVerification(userData);

    // Verify the registration was successful
    expect(success).toBe(true);

    // Clean up: Delete the temporary inbox
    await emailHelper.deleteInbox(inbox.id);
  });

  test('Test Case #100: Sign in', async ({ page }) => {
    // Initialize page objects
    const marketingPage = new MarketingPage(page);
    const loginPage = new LoginPage(page);

    await marketingPage.goto();
    await marketingPage.verifyOnMarketingPage();
    await marketingPage.clickSignInButton();

    await loginPage.verifyUrlAndTitle();
    await loginPage.login(TEST_USER.email, TEST_USER.password);

    await expect(page).toHaveURL(/.*\/getting_started.*/);
  });
});

test.describe('Project Management', () => {
  test('Test Case #69: Create project', async ({ page }) => {
    const projectPage = new ProjectPage(page);
    const marketingPage = new MarketingPage(page);
    const loginPage = new LoginPage(page);

    await marketingPage.goto();
    await marketingPage.verifyOnMarketingPage();
    await marketingPage.clickSignInButton();

    await loginPage.verifyUrlAndTitle();
    await loginPage.login(TEST_USER.email, TEST_USER.password);

    await projectPage.navigateToProjectsPage();
    const projectName = generateUniqueName('Project');
    await projectPage.createProject(projectName);
  });
});

test.describe('Financials', () => {
  test('Test Case #93: Create payment', async ({ page }) => {
    const paymentPage = new PaymentPage(page);
    const marketingPage = new MarketingPage(page);
    const loginPage = new LoginPage(page);

    await marketingPage.goto();
    await marketingPage.verifyOnMarketingPage();
    await marketingPage.clickSignInButton();

    await loginPage.verifyUrlAndTitle();
    await loginPage.login(TEST_USER.email, TEST_USER.password);

    await paymentPage.navigateToPaymentsPage();

    await paymentPage.createOneTimePayment(
      TEST_USER.fullName,
      '0.005',
      'Bonus payment for excellent work',
    );
  });
});

test.afterEach(async ({ page }, testInfo) => {
  await takeScreenshotOnFailure(testInfo, page);
});