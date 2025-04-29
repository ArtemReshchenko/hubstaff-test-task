import { Page, expect } from '@playwright/test';

export class MarketingPage {
  private readonly freeTrialButton = this.page.getByRole('link', {
    name: 'Free 14-day trial',
  });
  private readonly signInButton = this.page.locator(
    '[data-testid="sign_in_button"]',
  );
  private readonly newUserWorkEmail = this.page.getByRole('textbox', {
    name: 'Work email',
  });

  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('https://hubstaff.com');
  }

  async clickFreeTrialButton(): Promise<void> {
    await this.freeTrialButton.click();
  }

  async clickSignInButton(): Promise<void> {
    await this.signInButton.click();
  }

  async verifyOnMarketingPage(): Promise<void> {
    await expect(this.newUserWorkEmail.first()).toBeVisible();
    await expect(this.page).toHaveURL('https://hubstaff.com');
  }
}

