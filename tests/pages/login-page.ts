import { Page, expect } from '@playwright/test';

export class LoginPage {
  private readonly emailInput = this.page.locator(
    'input[placeholder="Enter email"]',
  );
  private readonly passwordInput = this.page.locator(
    'input[placeholder="Enter password"]',
  );
  private readonly loginButton = this.page.getByRole('button', {
    name: 'Sign in',
  });
  private readonly title = this.page.locator('h2.title');
  private readonly url: string;

  constructor(
    private readonly page: Page,
    url = 'https://account.hubstaff.com/login',
  ) {
    this.url = url;
  }

  async goto(): Promise<void> {
    await this.page.goto(this.url);
  }

  async verifyUrlAndTitle(): Promise<void> {
    await expect(this.page).toHaveURL(this.url);
    await expect(this.title).toHaveText('Sign in to Hubstaff');
  }

  async fillLoginForm(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
  }

  async clickLoginButton(): Promise<void> {
    await this.loginButton.click();
  }

  async login(email: string, password: string): Promise<void> {
    await this.fillLoginForm(email, password);
    await this.clickLoginButton();
  }
}

