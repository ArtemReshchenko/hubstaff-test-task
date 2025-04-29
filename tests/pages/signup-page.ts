import { Page, expect } from '@playwright/test';
import { EmailHelper } from '../utils/email-helper';

export class SignupPage {
  private readonly firstNameInput = this.page.locator(
    'input[name="user[first_name]"]',
  );
  private readonly lastNameInput = this.page.locator(
    'input[name="user[last_name]"]',
  );
  private readonly emailInput = this.page.locator('input[name="user[email]"]');
  private readonly passwordInput = this.page.locator(
    'input[name="user[password]"]',
  );
  private readonly termsCheckbox = this.page.locator(
    '.hsds-form__checkbox-icon',
  );
  private readonly nextButton = this.page.locator('.hsds-button--primary');
  private readonly customerRetentionPage = this.page.locator(
    '.customer-retention-form',
  );

  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('https://hubstaff.com/signup');
    await this.verifyOnSignupPage();
  }

  async fillSignupForm(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
  ): Promise<void> {
    // Fill in user details in the form
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.termsCheckbox.click();
  }

  async clickNextButton(): Promise<void> {
    await this.nextButton.click();
  }

  async completeSignup(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
  ): Promise<void> {
    await this.fillSignupForm(firstName, lastName, email, password);
    await this.clickNextButton();

    // Wait for redirect to email verification page
    await this.verifyOnEmailVerificationPage();
  }

  async verifyOnSignupPage(): Promise<void> {
    await expect(this.page).toHaveURL(/.*\/signup.*/);
    await expect(this.page.locator('.hsds-row__heading')).toHaveText(
      'Boost Productivity',
    );
  }

  async verifyOnEmailVerificationPage(): Promise<void> {
    await expect(this.page).toHaveURL(/.*\/confirmation_sent.*/);
    await expect(this.customerRetentionPage).toBeVisible();
  }

  /**
   * Complete the full registration flow including email verification
   *
   * @param userData Object containing user registration data including inboxId
   * @returns Promise indicating if the full signup process was successful
   */
  async completeRegistrationWithEmailVerification(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    inboxId: string;
  }): Promise<boolean> {
    // Complete the signup form
    await this.completeSignup(
      userData.firstName,
      userData.lastName,
      userData.email,
      userData.password,
    );

    // Log for debugging
    console.log(
      `Signup completed, waiting for verification email for: ${userData.email}`,
    );

    // Initialize email helper and verify email
    // This process will:
    // 1. Wait for confirmation email to arrive in the provided inbox
    // 2. Extract the confirmation link from the email
    // 3. Navigate to the confirmation link in a new page
    // 4. Wait for the confirmation process to complete
    // 5. Return true if successful (redirected to dashboard)
    const emailHelper = new EmailHelper(this.page);
    return await emailHelper.completeEmailVerification(userData.inboxId);
  }
}

