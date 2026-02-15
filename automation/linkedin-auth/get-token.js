/**
 * LinkedIn OAuth 2.0 Token Acquisition Script
 *
 * One-time setup: run this locally to get an access token for LinkedIn posting.
 *
 * Prerequisites:
 *   1. LinkedIn developer app with "Share on LinkedIn" product
 *   2. Add http://localhost:3000/callback as redirect URL in app settings
 *   3. Set LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET in automation/.env
 *
 * Usage:
 *   cd automation
 *   node linkedin-auth/get-token.js
 *
 * The script starts a local server, you authorize in the browser, and it
 * exchanges the code for tokens. Tokens are printed and appended to .env.
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const express = require('express');

const CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:3000/callback';
const SCOPES = 'openid profile w_member_social';

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Missing LINKEDIN_CLIENT_ID or LINKEDIN_CLIENT_SECRET in .env');
  process.exit(1);
}

const app = express();

app.get('/callback', async (req, res) => {
  const { code, error, error_description } = req.query;

  if (error) {
    res.send(`<h2>Authorization failed</h2><p>${error}: ${error_description}</p>`);
    console.error(`Authorization failed: ${error} — ${error_description}`);
    process.exit(1);
  }

  if (!code) {
    res.send('<h2>No authorization code received</h2>');
    console.error('No authorization code in callback');
    process.exit(1);
  }

  console.log('Authorization code received. Exchanging for tokens...');

  try {
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI
      })
    });

    const data = await tokenResponse.json();

    if (data.error) {
      throw new Error(`${data.error}: ${data.error_description}`);
    }

    const { access_token, expires_in, refresh_token, refresh_token_expires_in } = data;

    const expiresDate = new Date(Date.now() + expires_in * 1000);
    const refreshExpiresDate = refresh_token_expires_in ? new Date(Date.now() + refresh_token_expires_in * 1000) : null;

    console.log('\n=== LinkedIn OAuth Tokens ===');
    console.log(`Access Token:  ${access_token}`);
    console.log(`Expires:       ${expiresDate.toLocaleDateString()} (${Math.round(expires_in / 86400)} days)`);
    if (refresh_token) {
      console.log(`Refresh Token: ${refresh_token}`);
      console.log(`Refresh Exp:   ${refreshExpiresDate?.toLocaleDateString()}`);
    }

    // Append to .env
    const fs = require('fs');
    const envPath = path.join(__dirname, '..', '.env');
    const envLines = [
      `\n# LinkedIn OAuth (acquired ${new Date().toISOString().split('T')[0]}, expires ${expiresDate.toISOString().split('T')[0]})`,
      `LINKEDIN_ACCESS_TOKEN=${access_token}`
    ];
    if (refresh_token) {
      envLines.push(`LINKEDIN_REFRESH_TOKEN=${refresh_token}`);
    }
    fs.appendFileSync(envPath, envLines.join('\n') + '\n');
    console.log(`\nTokens appended to ${envPath}`);

    console.log('\nNext steps:');
    console.log('  1. Add LINKEDIN_ACCESS_TOKEN as a GitHub secret');
    console.log('     gh secret set LINKEDIN_ACCESS_TOKEN');
    if (refresh_token) {
      console.log('  2. Add LINKEDIN_REFRESH_TOKEN as a GitHub secret');
      console.log('     gh secret set LINKEDIN_REFRESH_TOKEN');
    }

    res.send('<h2>Success!</h2><p>Tokens saved. You can close this tab and return to the terminal.</p>');

    // Give the response time to send, then exit
    setTimeout(() => process.exit(0), 500);
  } catch (err) {
    res.send(`<h2>Token exchange failed</h2><p>${err.message}</p>`);
    console.error(`Token exchange failed: ${err.message}`);
    process.exit(1);
  }
});

const server = app.listen(3000, () => {
  const authUrl =
    `https://www.linkedin.com/oauth/v2/authorization?` +
    new URLSearchParams({
      response_type: 'code',
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      scope: SCOPES
    }).toString();

  console.log('LinkedIn OAuth — Token Acquisition');
  console.log('==================================\n');
  console.log('Open this URL in your browser:\n');
  console.log(authUrl);
  console.log('\nWaiting for callback on http://localhost:3000/callback ...\n');
});

// Timeout after 5 minutes
setTimeout(
  () => {
    console.error('Timed out waiting for OAuth callback (5 minutes)');
    server.close();
    process.exit(1);
  },
  5 * 60 * 1000
);
