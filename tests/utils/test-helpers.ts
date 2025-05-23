import { Page, TestInfo } from '@playwright/test';
import { EmailHelper } from './email-helper';
import * as dotenv from 'dotenv';

dotenv.config();

// Test data
export const TEST_USER = {
  firstName: process.env.TEST_USER_FIRST_NAME || `Test${Date.now()}`,
  lastName: process.env.TEST_USER_LAST_NAME || `User${Date.now()}`,
  email: process.env.TEST_USER_EMAIL || `test.${Date.now()}@example.com`,
  password: process.env.TEST_USER_PASSWORD || `Test${Date.now()}!`,
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  },
};

/**
 * Helper function to generate a unique name with timestamp and optional random suffix
 */
export function generateUniqueName(prefix: string, includeTimestamp = true): string {
  const timestamp = includeTimestamp ? `-${Date.now()}` : '';
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}${timestamp}-${random}`;
}

/**
 * Helper function to create a new MailSlurp inbox and return the email address
 *
 * @param page - Playwright page object
 * @returns Promise with email address and inbox ID
 */
export async function createMailSlurpInbox(
  page: Page,
): Promise<{ emailAddress: string; inboxId: string }> {
  const emailHelper = new EmailHelper(page);
  const { inbox, emailAddress } = await emailHelper.createInbox();
  return {
    emailAddress,
    inboxId: inbox.id,
  };
}

/**
 * Helper function to generate a unique email with MailSlurp
 *
 * @param page - Playwright page object
 * @param createInbox - Whether to create a new inbox (default true)
 * @returns Promise with the email address
 */
export async function generateUniqueEmail(
  page: Page,
  createInbox: boolean = true,
): Promise<string> {
  if (createInbox) {
    // Create a new inbox and return its email address
    const { emailAddress } = await createMailSlurpInbox(page);
    return emailAddress;
  } else {
    // Generate a random email without creating an inbox
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `test-${timestamp}-${random}@example.com`;
  }
}

/**
 * Helper function to generate a unique test data object with unique email for parallel tests
 *
 * @param page - Playwright page object
 * @param prefix - Optional name prefix
 * @returns Promise with user data including MailSlurp email for testing
 */
export async function generateUniqueTestUser(
  page: Page,
  prefix: string = '',
): Promise<{
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  inboxId: string;
  fullName: string;
}> {
  const { emailAddress, inboxId } = await createMailSlurpInbox(page);

  const firstName = prefix
    ? `${prefix}John`
    : `John${Math.floor(Math.random() * 1000)}`;
  const lastName = `Doe${Math.floor(Math.random() * 1000)}`;

  const userData = {
    firstName,
    lastName,
    email: emailAddress,
    password: `Test${Math.floor(Math.random() * 1000)}123!`,
    inboxId,
    get fullName(): string {
      return `${this.firstName} ${this.lastName}`;
    },
  };

  return userData;
}

/**
 * Helper function to take screenshots on failure
 * Enhanced with Allure reporting metadata
 */
export async function takeScreenshotOnFailure(testInfo: TestInfo, page: any): Promise<void> {
  if (testInfo.status !== testInfo.expectedStatus) {
    const screenshotPath = `screenshots/${testInfo.title.replace(/\s+/g, '-')}-${Date.now()}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`Screenshot saved to: ${screenshotPath}`);
  }
}

export function generateRandomString(length: number): string {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export function generateTestUser() {
  return {
    firstName: generateUniqueName('User', false),
    lastName: generateUniqueName('Test', false),
    email: `test-${Date.now()}@example.com`,
    password: `Test${Date.now()}!`,
  };
}

export function logTestStep(step: string, details?: any) {
  console.log(`\n=== Test Step: ${step} ===`);
  if (details) {
    console.log('Details:', JSON.stringify(details, null, 2));
  }
}

export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxAttempts = 3,
  delayMs = 1000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxAttempts) {
        console.log(`Attempt ${attempt} failed, retrying in ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }
  
  throw new Error(`Operation failed after ${maxAttempts} attempts. Last error: ${lastError?.message}`);
}

