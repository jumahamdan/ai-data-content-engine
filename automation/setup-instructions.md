# n8n Workflow Setup Instructions

## Prerequisites

1. **n8n Instance**: Self-hosted or n8n Cloud
2. **Required API Credentials**:
   - GitHub Personal Access Token (read/write repo access)
   - OpenAI API Key
   - LinkedIn API credentials

---

## Step 1: Import the Workflow

1. Open your n8n instance
2. Click **Workflows** → **Import from File**
3. Select `automation/n8n-workflow.json`
4. The workflow will be imported with all nodes configured

---

## Step 2: Configure Credentials

### GitHub OAuth2

1. Go to **Settings** → **Credentials** → **Add Credential**
2. Select **GitHub OAuth2**
3. Follow GitHub's OAuth app setup:
   - Go to GitHub Settings → Developer Settings → OAuth Apps
   - Create new OAuth App
   - Set Authorization callback URL to: `https://your-n8n-domain/rest/oauth2-credential/callback`
   - Copy Client ID and Client Secret to n8n
4. Grant permissions for `repo` scope

### OpenAI API

1. Add **OpenAI** credential in n8n
2. Enter your OpenAI API key from https://platform.openai.com/api-keys
3. Test the connection

### LinkedIn OAuth2

1. Add **LinkedIn OAuth2** credential in n8n
2. Create LinkedIn app at https://www.linkedin.com/developers
3. Configure the app:
   - Add product: "Share on LinkedIn"
   - Add product: "Sign In with LinkedIn using OpenID Connect"

4. **Important - Set correct scopes in n8n**:
   ```
   openid profile email w_member_social
   ```

   **DO NOT include** `w_organization_social` unless you're posting to company pages.

5. Set redirect URL in LinkedIn Developer Portal:
   ```
   https://your-n8n-domain/rest/oauth2-credential/callback
   ```

6. Copy Client ID and Client Secret to n8n

#### Troubleshooting LinkedIn OAuth

**Error: "Scope w_organization_social is not authorized"**
- Edit your LinkedIn credential in n8n
- Remove `w_organization_social` from the scope field
- Only use: `openid profile email w_member_social`

**Error: "Invalid redirect_uri"**
- Verify the redirect URL in LinkedIn Developer Portal exactly matches n8n's callback URL
- Check for trailing slashes or http vs https differences

**Error: "This app is in development mode"**
- Development mode works for testing with your own account
- For production, you may need to verify your app with LinkedIn

---

## Step 3: Update Repository Configuration

In the **Get State** node, verify these match your repo:
```json
{
  "repo_owner": "jumahamdan",
  "repo_name": "ai-data-content-engine"
}
```

---

## Step 4: Test the Workflow

### Manual Test Run

1. Click **Execute Workflow** in n8n
2. Watch each node execute
3. Check outputs at each step:
   - ✅ Content plan generated (template + topic selected)
   - ✅ Files fetched from GitHub
   - ✅ OpenAI generates content
   - ✅ LinkedIn post published
   - ✅ Log updated in GitHub

### Troubleshooting Common Issues

**GitHub API errors**
- Verify your GitHub token has `repo` scope
- Check the file paths in the workflow match your repo structure

**OpenAI Response Parsing Errors**
- Check the JSON format in responses
- Adjust temperature if responses are inconsistent
- Review the prompt templates for clarity

**LinkedIn Posting Fails**
- Verify OAuth token hasn't expired (re-authenticate if needed)
- Ensure caption doesn't exceed LinkedIn limits (3000 chars)
- Check that all required scopes are authorized

---

## Step 5: Enable Workflow

1. Click **Active** toggle in the top-right
2. Workflow will now run automatically at 09:00 and 16:00 CST
3. Monitor executions in the **Executions** tab

---

## Monitoring & Maintenance

### View Execution History
- Go to **Executions** tab
- Filter by date/status
- Review any failed runs

### Check Post Log
- View `automation/post_log.json` in your GitHub repo
- Track what content was posted and when
- Use for analytics and content auditing

### Update Content
Any changes to these files are automatically picked up:
- `prompts/*.md` - Prompt templates
- `topics/topic-bank.json` - Add topics
- `content-spec/*.md` - Adjust tone or rules

No workflow changes needed—just commit to GitHub!

---

## Cost Estimates

**Per post** (2x/day = 60 posts/month):
- OpenAI API: ~$0.02-0.05 per generation (GPT-4)
- n8n: Free (self-hosted) or $20/month (Cloud)

**Monthly estimate**: $2-5 in API costs + n8n hosting

---

## Future: Adding Image Support

To add images later:

1. Set up Canva API or alternative service (Bannerbear, Placid, etc.)
2. Add HTTP Request node after "Parse Content"
3. Update "Post to LinkedIn" node to include `mediaUrl` parameter

---

## Support & Resources

- [n8n Documentation](https://docs.n8n.io)
- [GitHub API Reference](https://docs.github.com/en/rest)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [LinkedIn API Docs](https://learn.microsoft.com/en-us/linkedin/)
