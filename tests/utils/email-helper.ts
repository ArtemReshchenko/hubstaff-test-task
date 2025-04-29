import { Page } from '@playwright/test';
import { MailSlurp, Email } from 'mailslurp-client';

/**
 * Email Helper - Utilities for working with MailSlurp for email verification
 */
export class EmailHelper {
  private readonly page: Page;
  private readonly mailslurp: MailSlurp;
  private readonly debug: boolean;

  /**
   * @param page - Playwright page object
   * @param apiKey - Optional MailSlurp API key (will use environment variable if not provided)
   * @param debug - Optional debug flag to enable debug logging
   */
  constructor(page: Page, apiKey?: string, debug: boolean = false) {
    this.page = page;
    this.debug = debug;

    // Validate API key
    const finalApiKey = apiKey || process.env.MAILSLURP_API_KEY || '';

    if (!finalApiKey) {
      throw new Error(
        'MailSlurp API key is missing. Please provide an API key or set the MAILSLURP_API_KEY environment variable.',
      );
    }

    if (
      finalApiKey === 'your-actual-api-key-here' ||
      finalApiKey === 'your-mailslurp-api-key-here'
    ) {
      throw new Error(
        'Please replace the placeholder API key with your actual MailSlurp API key.',
      );
    }

    // Initialize MailSlurp with API key
    this.log(
      `Initializing MailSlurp with API key (${finalApiKey.substring(0, 3)}...${finalApiKey.substring(finalApiKey.length - 3)})`,
    );
    this.mailslurp = new MailSlurp({ apiKey: finalApiKey });
  }

  private log(...messages: unknown[]): void {
    if (this.debug) {
      console.debug('[EmailHelper]', ...messages);
    }
  }

  /**
   * Create a new inbox with MailSlurp
   * @returns Promise with the inbox and email address
   */
  async createInbox(): Promise<{ inbox: any; emailAddress: string }> {
    const inbox = await this.mailslurp.createInbox();
    return {
      inbox,
      emailAddress: inbox.emailAddress,
    };
  }

  /**
   * Wait for and receive a confirmation email
   *
   * @param inboxId - The ID of the inbox to check
   * @param subjectKeyword - Optional keyword to match in the subject line
   * @param timeout - Maximum time (ms) to wait for email
   * @param retries - Number of retries if email fetch fails
   * @returns Promise with the received email
   */
  async waitForEmail(
    inboxId: string,
    subjectKeyword?: string,
    timeout = 60000,
    retries = 3,
  ): Promise<Email> {
    let attempt = 0;
    let lastError;

    while (attempt < retries) {
      try {
        // Wait for latest email - use the correct method (singular) and parameter format
        const email = await this.mailslurp.waitForLatestEmail(
          inboxId,
          timeout,
          true,
        );

        if (!email) {
          throw new Error('No emails received within timeout period');
        }

        // If subject keyword provided, check if subject matches
        if (subjectKeyword) {
          const subject = email.subject || '';
          if (subject.toLowerCase().includes(subjectKeyword.toLowerCase())) {
            this.log(`Found email with matching subject: '${subject}'`);

            // Ensure the email body is fully loaded
            const fullEmail = await this.mailslurp.getEmail(email.id);

            // Log email details for debugging
            this.log('Email details:');
            this.log('From:', fullEmail.from || 'unknown');
            this.log('Subject:', fullEmail.subject || 'unknown');
            this.log('Has HTML body:', fullEmail.html ? 'Yes' : 'No');
            this.log('Has text body:', fullEmail.body ? 'Yes' : 'No');

            return fullEmail;
          } else {
            throw new Error(
              `Email doesn't contain subject keyword '${subjectKeyword}'. Found: '${subject}'`,
            );
          }
        }

        // If no subject filter, return the email
        return email;
      } catch (error) {
        lastError = error;
        attempt++;
        this.log(`Email fetch attempt ${attempt} failed. Retrying...`);
        // Short delay before retry
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    throw new Error(
      `Failed to fetch email after ${retries} attempts: ${lastError}`,
    );
  }

  /**
   * Extract confirmation link from email body
   *
   * @param email - The email object from MailSlurp
   * @param linkPattern - RegExp pattern to match the confirmation link
   * @returns The extracted confirmation link
   */
  extractConfirmationLink(email: Email, linkPattern?: RegExp): string | null {
    const body = email.body || '';

    // Safe way to get HTML content
    let htmlBody = '';
    if (email.html) {
      if (typeof email.html === 'string') {
        htmlBody = email.html;
      }
    }

    // Log which content we're working with
    this.log(`Email has text body: ${body ? 'Yes' : 'No'}`);
    this.log(`Email has HTML body: ${htmlBody ? 'Yes' : 'No'}`);

    // If custom pattern is provided, use it
    if (linkPattern) {
      // Check text body
      const textMatch = body.match(linkPattern);
      if (textMatch) return textMatch[0];

      // Check HTML body
      const htmlMatch = htmlBody.match(linkPattern);
      if (htmlMatch) return htmlMatch[0];
    }

    // Try multiple patterns to find the confirmation link
    const patterns = [
      // Look for links with 'confirm' in them
      /https:\/\/[^'\s]+confirm[^'\s]*/,
      // Look for typical 'Confirm account' button links
      /https:\/\/app\.hubstaff\.com\/[^'\s]+confirm[^'\s]*/,
      // Look for any links that might be confirmation links
      /<a\s+(?:[^>]*?\s+)?href=['']([^'']*)[''][^>]*?>\s*Confirm\s+account\s*<\/a>/i,
      // Look for broader patterns
      /https:\/\/app\.hubstaff\.com\/[^'\s]+/,
    ];

    // Search in both text and HTML body
    const contentToSearch = [
      { name: 'text body', content: body },
      { name: 'HTML body', content: htmlBody },
    ];

    // Try each pattern in order until we find a match
    for (const { name, content } of contentToSearch) {
      if (!content) continue;

      this.log(`Searching for confirmation link in ${name}...`);

      for (const pattern of patterns) {
        this.log(`Trying pattern: ${pattern}`);
        const match = content.match(pattern);

        if (match) {
          // If the match is a capture group (from the <a> tag pattern), use the captured URL
          const url = match[1] || match[0];
          this.log(
            `Found confirmation link in ${name} with pattern ${pattern}: ${url}`,
          );
          return url;
        }
      }
    }

    // Log for debugging
    this.log('No confirmation link found with any pattern');

    // Log email details for debugging
    this.log('Email details for debugging:');
    this.log('Subject:', email.subject);
    this.log('From:', email.from);
    this.log('Has body:', !!email.body);
    this.log('Has HTML:', !!email.html);

    return null;
  }

  /**
   * Complete the email verification process
   *
   * @param inboxId - The MailSlurp inbox ID
   * @param linkPattern - RegExp pattern to match the confirmation link
   * @param timeout - Maximum time to wait for email
   * @returns Promise<boolean> indicating if confirmation was successful
   */
  async completeEmailVerification(
    inboxId: string,
    linkPattern?: RegExp,
    timeout = 60000,
  ): Promise<boolean> {
    try {
      this.log(`Waiting for confirmation email in inbox ${inboxId}...`);

      this.log(
        'Looking for email from \'Hubstaff <support@hubstaff.com>\' with subject \'Confirm your Hubstaff account\'',
      );
      const email = await this.waitForEmail(
        inboxId,
        'Confirm your Hubstaff account',
        timeout,
      );

      // Verify sender
      const fromAddress = email.from || '';
      if (!fromAddress.includes('support@hubstaff.com')) {
        this.log(
          `Warning: Email not from expected sender. Found: ${fromAddress}`,
        );
      } else {
        this.log('Confirmation email from correct sender received!');
      }

      // Extract confirmation link
      const confirmationLink = this.extractConfirmationLink(email, linkPattern);

      if (!confirmationLink) {
        this.log('Confirmation link not found in email');
        return false;
      }

      // Open a new page to follow the confirmation link
      this.log('Opening confirmation link in new tab...');
      const confirmPage = await this.page.context().newPage();

      try {
        // Navigate to the confirmation link
        await confirmPage.goto(confirmationLink);

        // Wait for the page to be ready
        await confirmPage.waitForLoadState('domcontentloaded');

        // Try to find the 'Confirm account' button if it exists
        const confirmButton = confirmPage.getByText('Confirm account');
        if (await confirmButton.isVisible()) {
          this.log('Found "Confirm account"	 button, clicking it...');
          await confirmButton.click();

          // Wait for the welcome page URL
          await confirmPage.waitForURL(/.*welcome.*/, { timeout: 30000 });
        }

        // Verify we're on the welcome page
        const isOnWelcomePage = confirmPage.url().includes('/welcome');
        this.log(
          `Verification result: ${isOnWelcomePage ? 'Success' : 'Failed'}`,
        );
        this.log(`Final URL: ${confirmPage.url()}`);

        // Take a screenshot for verification
        await confirmPage.screenshot({
          path: 'test-results/verification-complete.png',
        });

        return isOnWelcomePage;
      } finally {
        // Always close the confirmation page
        await confirmPage.close();
      }
    } catch (error) {
      this.log(`Error during email verification: ${error}`);
      return false;
    }
  }

  /**
   * Delete an inbox after test completion
   * Used for cleanup to avoid accumulating test inboxes
   *
   * @param inboxId - The ID of the inbox to delete
   */
  async deleteInbox(inboxId: string): Promise<void> {
    try {
      await this.mailslurp.deleteInbox(inboxId);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.log(`Failed to delete inbox ${inboxId}: ${errorMessage}`);
    }
  }
}

