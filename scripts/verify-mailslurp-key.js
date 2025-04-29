/**
 * This script verifies if your MailSlurp API key in the .env file is valid
 * Run it with: node scripts/verify-mailslurp-key.js
 */

require("dotenv").config();
const { MailSlurp } = require("mailslurp-client");

async function verifyApiKey() {
  console.log("Verifying MailSlurp API key...");

  const apiKey = process.env.MAILSLURP_API_KEY;

  // Check if API key exists
  if (!apiKey) {
    console.error(
      "❌ ERROR: MAILSLURP_API_KEY not found in environment variables",
    );
    console.log(
      "Make sure you have a .env file in the project root with MAILSLURP_API_KEY=your-key",
    );
    process.exit(1);
  }

  // Check if it's the placeholder text
  if (
    apiKey === "your-actual-api-key-here" ||
    apiKey === "your-mailslurp-api-key-here"
  ) {
    console.error(
      "❌ ERROR: You need to replace the placeholder with your actual API key",
    );
    console.log(
      "Edit the .env file and replace the placeholder text with your actual MailSlurp API key",
    );
    process.exit(1);
  }

  console.log(
    `Found API key: ${apiKey.substring(0, 3)}...${apiKey.substring(apiKey.length - 3)}`,
  );

  try {
    // Initialize MailSlurp with the API key
    const mailslurp = new MailSlurp({ apiKey });

    // Test creating an inbox (this will fail if the API key is invalid)
    console.log("Testing API key by creating a test inbox...");
    const inbox = await mailslurp.createInbox();

    console.log("\n✅ SUCCESS! Your MailSlurp API key is valid!\n");
    console.log("Test inbox details:");
    console.log(`- Email Address: ${inbox.emailAddress}`);
    console.log(`- Inbox ID: ${inbox.id}`);

    // Clean up the test inbox
    console.log("\nCleaning up test inbox...");
    await mailslurp.deleteInbox(inbox.id);
    console.log("Test inbox deleted");
  } catch (error) {
    console.error("\n❌ ERROR: Your MailSlurp API key is invalid or expired");
    console.error(`Error details: ${error.message}`);

    if (
      error.message.includes("Unauthorized") ||
      error.message.includes("401")
    ) {
      console.log("\nHere are some things to check:");
      console.log(
        "1. Make sure your API key is copied correctly from the MailSlurp dashboard",
      );
      console.log("2. Check that your MailSlurp account is active");
      console.log("3. Try generating a new API key in the MailSlurp dashboard");
    }

    process.exit(1);
  }
}

// Run the verification
verifyApiKey();
