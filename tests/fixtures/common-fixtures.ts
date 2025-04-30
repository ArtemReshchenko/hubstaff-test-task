import { test as base, Page } from '@playwright/test';
import { MarketingPage } from '../pages/marketing-page';
import { LoginPage } from '../pages/login-page';
import { ProjectPage } from '../pages/project-page';
import { PaymentPage } from '../pages/payment-page';
import { TEST_USER } from '../utils/test-config';

// Declare your fixtures
type MyFixtures = {
  authenticatedPage: Page;
  projectPage: ProjectPage;
  paymentPage: PaymentPage;
};

// Extend the base test with custom fixtures
export const test = base.extend<MyFixtures>({
  // Add a fixture for authenticated page
  authenticatedPage: async ({ page }, use) => {
    const marketingPage = new MarketingPage(page);
    const loginPage = new LoginPage(page);

    await marketingPage.goto();
    await marketingPage.verifyOnMarketingPage();
    await marketingPage.clickSignInButton();
    await loginPage.verifyUrlAndTitle();
    await loginPage.login(TEST_USER.email, TEST_USER.password);

    await use(page);
  },

  // Add a fixture for project page
  projectPage: async ({ authenticatedPage }, use) => {
    const projectPage = new ProjectPage(authenticatedPage);
    await projectPage.navigateToProjectsPage();
    await use(projectPage);
  },

  // Add a fixture for payment page
  paymentPage: async ({ authenticatedPage }, use) => {
    const paymentPage = new PaymentPage(authenticatedPage);
    await paymentPage.navigateToPaymentsPage();
    await use(paymentPage);
  }
}); 