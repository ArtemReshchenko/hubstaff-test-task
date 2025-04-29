import { Page, expect, Locator } from '@playwright/test';

/**
 * Page Object class for the Payment page
 */
export class PaymentPage {
  // Locators for payment page elements
  private readonly financialsLink = this.page.getByRole('menuitem', { name: 'Financials' });
  private readonly createPaymentsLink = this.page.getByRole('menuitem', { name: 'Create payments' });
  private readonly oneTimeAmountTab = this.page.getByRole('link', { name: 'One-time amount' });
  private readonly selectAllMembers = this.page.locator('.select-all');
  private readonly selectedMember = (name: string): Locator => {
    return this.page.locator('.select2-selection__choice').getByText(name);
  };
  private readonly amountPerMemberInput = this.page.locator('input#team_payment_total_amount');
  private readonly noteTextarea = this.page.locator('textarea[placeholder="Enter a note about the payment"]');
  private readonly createPaymentButton = this.page.getByRole('link', { name: 'Create payment' });
  private readonly paymentModal = this.page.locator('.modal-dialog').last();
  private readonly modalCreatePaymentButton = this.paymentModal.locator('input[name="commit"]');
  private readonly notNowButton = this.paymentModal.locator('#export_payment').getByText('Not now');
  private readonly exportPaymentTab = this.page.locator('#export_payment');
  private readonly paymentsTable = this.page.locator('table').first();

  constructor(private readonly page: Page) {}

  /**
   * Navigate to the Financials > Send payments page
   */
  async navigateToPaymentsPage(): Promise<void> {
    await this.financialsLink.click();
    await this.createPaymentsLink.click();
    
    // Ensure One-time amount tab is selected
    await this.oneTimeAmountTab.click();
  }

  /**
   * Select a member to pay
   */
  async selectMember(memberName: string): Promise<void> {
    await this.selectAllMembers.click();
    await expect(this.selectedMember(memberName)).toBeVisible();
  }

  /**
   * Enter payment amount
   */
  async enterAmount(amount: string): Promise<void> {
    await this.amountPerMemberInput.fill(amount);
    await expect(this.amountPerMemberInput).toHaveValue(amount);
  }

  /**
   * Enter payment note
   */
  async enterNote(note: string): Promise<void> {
    await this.noteTextarea.fill(note);
    await expect(this.noteTextarea).toHaveValue(note);
  }

  /**
   * Click the 'Create payment' button
   */
  async clickCreatePaymentButton(): Promise<void> {
    await this.createPaymentButton.click();
  }

  /**
   * Click the 'Create payment' button in the 'Payment' modal
   */
  async clickCreatePaymentInModal(): Promise<void> {
    await this.modalCreatePaymentButton.click();
  }

  /**
   * Close the payment confirmation modal
   */
  async closePaymentConfirmationModal(): Promise<void> {
    await this.notNowButton.click();
  }

  /**
   * Verify payment details in the summary table
   */
  async verifyPaymentDetails(memberName: string): Promise<void> {
    await expect(this.paymentsTable).toContainText(memberName);
    await expect(this.paymentsTable).toContainText('Bonus');
    await expect(this.paymentsTable).toContainText('Pending');
  }

  /**
   * Create a one-time payment
   */
  async createOneTimePayment(memberName: string, amount: string, note: string): Promise<void> {
    await this.selectMember(memberName);
    await this.enterAmount(amount);
    await this.enterNote(note);
    await this.clickCreatePaymentButton();
    
    // Verify payment modal
    await expect(this.paymentModal).toBeVisible();
    
    await this.clickCreatePaymentInModal();
    await expect(this.exportPaymentTab).toBeVisible({timeout: 10000});
    await this.closePaymentConfirmationModal();
    await this.verifyPaymentDetails(memberName);
  }
} 
