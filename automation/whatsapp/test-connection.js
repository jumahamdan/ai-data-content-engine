/**
 * Test script to verify Twilio WhatsApp credentials and send a test message.
 *
 * Usage: node whatsapp/test-connection.js
 */
const { validateEnv, createClient, sendToOwner } = require('./twilio-client');

async function main() {
  console.log('WhatsApp Connection Test');
  console.log('='.repeat(40));

  // Step 1: Validate environment variables
  console.log('\n1. Checking environment variables...');
  try {
    validateEnv();
    console.log('   ✓ All required variables set');
  } catch (error) {
    console.error(`   ✗ ${error.message}`);
    process.exit(1);
  }

  // Step 2: Verify Twilio credentials
  console.log('\n2. Verifying Twilio credentials...');
  try {
    const client = createClient();
    const account = await client.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
    console.log(`   ✓ Account verified: ${account.friendlyName}`);
    console.log(`   ✓ Status: ${account.status}`);
  } catch (error) {
    console.error(`   ✗ Credential check failed: ${error.message}`);
    process.exit(1);
  }

  // Step 3: Send a test message
  console.log('\n3. Sending test message...');
  try {
    const message = await sendToOwner(
      '🔧 WhatsApp Connection Test\n\nIf you see this, your Twilio WhatsApp integration is working!'
    );
    console.log(`   ✓ Message sent (SID: ${message.sid})`);
    console.log(`   ✓ Status: ${message.status}`);
    console.log(`   ✓ To: ${message.to}`);
  } catch (error) {
    console.error(`   ✗ Send failed: ${error.message}`);
    console.error('   Hint: Make sure you have joined the Twilio sandbox.');
    process.exit(1);
  }

  console.log('\n' + '='.repeat(40));
  console.log('All checks passed!');
}

main();
