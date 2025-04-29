/**
 * Test script for MailSlurp API
 *
 * This script verifies that your MailSlurp API key is working
 * by creating a test inbox and displaying the email address.
 *
 * Usage:
 * 1. Set MAILSLURP_API_KEY in your environment or .env file
 * 2. Run: node scripts/test-mailslurp.js
 */

require("dotenv").config();
const { MailSlurp } = require("mailslurp-client");

async function testMailSlurp() {
  console.log("Testing MailSlurp connection...");

  // Check if API key is set
  const apiKey = process.env.MAILSLURP_API_KEY;
  if (!apiKey) {
    console.error(
      "❌ ERROR: MAILSLURP_API_KEY not found in environment variables",
    );
    console.log(
      "Please create a .env file with your API key or set it in your environment",
    );
    process.exit(1);
  }

  try {
    // Initialize MailSlurp client
    const mailslurp = new MailSlurp({ apiKey });

    // Try to create an inbox
    console.log("Creating test inbox...");
    const inbox = await mailslurp.createInbox();

    console.log("\n✅ SUCCESS! MailSlurp API is working correctly\n");
    console.log("Test inbox details:");
    console.log(`- Email Address: ${inbox.emailAddress}`);
    console.log(`- Inbox ID: ${inbox.id}`);

    // Clean up
    console.log("\nCleaning up test inbox...");
    await mailslurp.deleteInbox(inbox.id);
    console.log("Test inbox deleted");
  } catch (error) {
    console.error("\n❌ ERROR: Failed to connect to MailSlurp API");
    console.error("Error details:", error.message);

    if (
      error.message.includes("Unauthorized") ||
      error.message.includes("401")
    ) {
      console.log(
        "\nYour API key may be invalid. Please check your MailSlurp account and get a valid API key.",
      );
    }

    process.exit(1);
  }
}

// Run the test
testMailSlurp();
