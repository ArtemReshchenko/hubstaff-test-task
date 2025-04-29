# Using MailSlurp for Email Verification in Tests

This guide explains how to use MailSlurp to create temporary email inboxes and verify email confirmation during test automation.

## Prerequisites

1. Create a MailSlurp account at [mailslurp.com](https://www.mailslurp.com/) (free tier available)
2. Get your API key from the dashboard
3. Set up your environment

## Environment Setup

Create a `.env` file in your project root with your MailSlurp API key:

```
# MailSlurp API Configuration
MAILSLURP_API_KEY=your-mailslurp-api-key-here

# Test Configuration
VERIFY_EMAIL=true
HEADLESS=false
```

Make sure your `playwright.config.ts` loads these environment variables:

```typescript
import * as dotenv from "dotenv";
dotenv.config();
```

## How Email Verification Works

The email verification flow consists of these steps:

1. Create a temporary inbox with MailSlurp
2. Register a user with the temporary email address
3. Wait for the confirmation email to arrive
4. Extract the confirmation link from the email
5. Visit the confirmation link
6. Verify successful confirmation

## Using MailSlurp in Tests

### Step 1: Create a Temporary Email Inbox

```typescript
// Initialize email helper
const emailHelper = new EmailHelper(page);

// Create inbox and get email address and inboxId
const { emailAddress, inboxId } = await emailHelper.createInbox();
```

### Step 2: Use the Email in Registration Form

```typescript
// Fill the registration form with the temporary email
await signupPage.fillSignupForm(
  "John", // firstName
  "Doe", // lastName
  emailAddress, // temporary email address
  "Password123!", // password
);
await signupPage.clickCreateMyAccountButton();
```

### Step 3: Complete Email Verification

```typescript
// Using the user data with inbox ID for verification
const userData = {
  firstName: "John",
  lastName: "Doe",
  email: emailAddress,
  password: "Password123!",
  inboxId: inboxId,
};

// Complete the registration process with email verification
const success =
  await signupPage.completeRegistrationWithEmailVerification(userData);
```

## Example Test

See the `tests/email-signup-example.spec.ts` file for a complete example.

## Running Tests with Email Verification

```bash
# Make sure MAILSLURP_API_KEY is set in your .env file
npx playwright test tests/email-signup-example.spec.ts
```

## Troubleshooting

### No Emails Arriving

- Check your MailSlurp account dashboard to confirm API usage
- Increase the timeout values (email can be slow to arrive)
- Verify the application is correctly sending emails to the MailSlurp address

### API Key Issues

- Ensure your API key is correctly set in the .env file
- Check your MailSlurp account status and plan limits
- Try generating a new API key if necessary

## Clean Up

To avoid accumulating test inboxes, clean up after your tests:

```typescript
// Delete the test inbox when finished
await emailHelper.deleteInbox(inboxId);
```
