# Hubstaff Automation QA Framework

![Playwright Tests](https://github.com/yourusername/hubstaff-automation-challenge/actions/workflows/main.yml/badge.svg)

A professional, scalable test automation framework for Hubstaff, implementing industry-standard QA engineering practices with Playwright, TypeScript, MailSlurp, and Allure reporting.

## 🚀 Key Features

- **Dynamic Email Integration** - Automated email handling using MailSlurp API to create inboxes, fetch confirmation emails, extract links and complete verification flows
- **Page Object Model Architecture** - Well-structured code with a robust POM design pattern for maximum maintainability and scalability
- **Parallel Test Execution** - Enhanced test throughput using Playwright's test.describe.parallel capability to run multiple user registrations simultaneously
- **Smart Retry Logic** - Isolated retry mechanisms specifically applied to the email-fetching phase, ensuring robustness without unnecessarily retrying the entire test flow
- **Comprehensive Reporting** - Integrated test reporting using Playwright HTML Reports and Allure Reports with detailed test annotations
- **CI/CD Integration** - GitHub Actions workflow with automatic test execution, reporting, and artifact preservation
- **Environment Configuration** - Flexible environment variable management for secure credential handling and test configuration
- **Cross-Browser Testing** - Parallel testing across Chromium, Firefox, and WebKit engines

## 📋 Project Structure

```
├── tests/
│   ├── hubstaff-tests.spec.ts       # Standard sequential test cases
│   ├── parallel-registration.spec.ts # Parallel user registration tests
│   ├── pages/                       # Page Object Models
│   │   ├── marketing-page.ts        # Marketing landing page interactions
│   │   ├── signup-page.ts           # User signup interactions
│   │   ├── login-page.ts            # Login functionality
│   │   ├── project-page.ts          # Project management
│   │   └── payment-page.ts          # Payment functionality
│   └── utils/
│       ├── test-helpers.ts          # Helper functions and test data
│       └── email-helper.ts          # MailSlurp integration for email handling
├── playwright.config.ts             # Playwright configuration
├── .github/workflows/main.yml       # GitHub Actions CI/CD configuration
└── README.md                        # Project documentation
```

## 🔧 Prerequisites

- Node.js (version 16 or higher)
- npm (version 7 or higher)
- [MailSlurp account](https://www.mailslurp.com/) and API key for email testing

## 🛠️ Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd hubstaff-automation-challenge
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Install Playwright browsers:

   ```bash
   npx playwright install
   ```

4. Create a `.env` file with your configuration:

   ```
   # MailSlurp API Configuration
   MAILSLURP_API_KEY=your-mailslurp-api-key-here

   # Test Configuration
   VERIFY_EMAIL=false
   PARALLEL_USERS=3
   HEADLESS=false
   ```

## 🧪 Running Tests

### Standard Test Suite

```bash
npm test
```

### Parallel Registration Tests

Run multiple user registrations in parallel with email verification:

```bash
npm run test:parallel
```

### Headed Mode (With Browser UI)

```bash
npm run test:headed
```

### Debug Mode

```bash
npm run test:debug
```

### CI Mode

Run tests as they would run in the CI pipeline:

```bash
npm run test:ci
```

## 📊 Test Reports

### Playwright HTML Report

```bash
npm run report
```

### Allure Report (Rich Interactive Reports)

```bash
npm run report:allure
```

## 🧩 Key Components

### Email Handling

The framework uses MailSlurp to dynamically create email inboxes for testing:

```typescript
// Create a new email inbox for testing
const { inbox, emailAddress } = await emailHelper.createInbox();

// Fill signup form with the generated email
await signupPage.fillSignupForm(
  userData.firstName,
  userData.lastName,
  emailAddress,
  userData.password
);

// Smart retry logic for email fetching
const email = await emailHelper.waitForEmail(
  inbox.id,
  "Confirm your account",
  60000,
  3
);

// Extract confirmation link and complete verification
const confirmationLink = emailHelper.extractConfirmationLink(email);
```

### Parallel Test Execution

Using Playwright's parallel test execution capabilities:

```typescript
test.describe.parallel("Parallel User Registration", () => {
  // Tests will run in parallel, each with its own isolated context
  for (let i = 0; i < PARALLEL_USERS; i++) {
    test(`Register User #${i + 1}`, async ({ page }) => {
      // Each test gets its own unique test data
      const testUser = await generateUniqueTestUser(page);
      // ...test implementation
    });
  }
});
```

### CI/CD Pipeline

The GitHub Actions workflow automates:

1. Dependency installation
2. Test execution
3. Report generation
4. Artifact preservation
5. Results publishing

## 📖 Best Practices Implemented

- **Isolation of Tests** - Each test is completely independent with its own test data and email inbox
- **Error Recovery** - Smart retry mechanisms only where appropriate
- **Clean Code Architecture** - Separation of concerns with page objects, utilities, and test specifications
- **Cross-Browser Compatibility** - Tests run on multiple browser engines
- **Comprehensive Reporting** - Detailed logs, screenshots, and interactive reports
- **Secure Credential Handling** - Environment variables and GitHub Secrets for sensitive data

## 🤝 Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔒 Security

For handling credentials and API keys:

- Never commit API keys or credentials to the repository
- Use environment variables and .env files (add to .gitignore)
- In CI/CD, use GitHub Secrets for sensitive data

## 👥 Authors

- **Your Name** - _Initial work_
