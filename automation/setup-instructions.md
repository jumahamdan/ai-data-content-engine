# n8n Workflow Setup Instructions

## Prerequisites

1. **n8n Instance**: Self-hosted or n8n Cloud
2. **Required API Credentials**:
   - GitHub Personal Access Token (read/write repo access)
   - OpenAI API Key
   - LinkedIn API credentials
   - Canva API Key (or alternative image service)

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
   - Set Authorization callback URL to your n8n instance
   - Copy Client ID and Client Secret to n8n
4. Grant permissions for `repo` scope

### OpenAI API

1. Add **OpenAI** credential in n8n
2. Enter your OpenAI API key
3. Test the connection

### LinkedIn OAuth2

1. Add **LinkedIn OAuth2** credential
2. Create LinkedIn app at https://www.linkedin.com/developers
3. Required permissions:
   - `w_member_social` (share content)
   - `r_liteprofile` (basic profile)
4. Copy Client ID and Secret to n8n

### Canva API (Optional)

1. Sign up for Canva API access
2. Add **HTTP Header Auth** credential in n8n
3. Name: `Authorization`, Value: `Bearer YOUR_API_KEY`
4. **Alternative**: Replace with any image generation service (Cloudinary, Bannerbear, etc.)

---

## Step 3: Configure State Management

The workflow uses a simple **Set** node for state. For production:

**Option A: Use n8n's Built-in Database** (Recommended for n8n Cloud)
- The workflow stores state in workflow static data
- No additional setup needed

**Option B: Use Redis** (Recommended for self-hosted)
1. Install Redis node from n8n community nodes
2. Replace "Get State" node with Redis GET
3. Add Redis SET node after "Plan Content"

**Option C: Use GitHub as State Store**
1. Create `automation/workflow-state.json` in your repo
2. Modify "Get State" to fetch from GitHub
3. Add GitHub commit after each run to update state

---

## Step 4: Update Repository Configuration

In the **Get State** node, update:
```json
{
  "repo_owner": "jumahamdan",
  "repo_name": "ai-data-content-engine"
}
```

Make sure these match your actual GitHub repository.

---

## Step 5: Test the Workflow

### Manual Test Run

1. Click **Execute Workflow** in n8n
2. Watch each node execute
3. Check outputs at each step:
   - ✅ Content plan generated
   - ✅ Files fetched from GitHub
   - ✅ OpenAI generates content
   - ✅ Image created
   - ✅ LinkedIn post published
   - ✅ Log updated in GitHub

### Troubleshooting Common Issues

**GitHub API Rate Limits**
- Use conditional caching for specs/prompts
- Consider caching tone and visual rules locally

**OpenAI Response Parsing Errors**
- Check the JSON format in responses
- Adjust temperature if responses are inconsistent
- Add retry logic in error handler

**LinkedIn Posting Fails**
- Verify OAuth token hasn't expired
- Check image URL is publicly accessible
- Ensure caption doesn't exceed LinkedIn limits (3000 chars)

---

## Step 6: Adjust Schedule (Optional)

The workflow is set to run at **09:00 and 16:00 CST**.

To modify:
1. Click the **Schedule Trigger** node
2. Edit the cron expression:
   - Current: `0 9,16 * * *`
   - Example for 3x/day: `0 9,14,18 * * *`
3. Verify timezone is set to `America/Chicago`

---

## Step 7: Enable Workflow

1. Click **Active** toggle in the top-right
2. Workflow will now run automatically at scheduled times
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
- `prompts/*.md` - Add new templates
- `topics/topic-bank.json` - Add topics
- `content-spec/*.md` - Adjust tone or rules

No workflow changes needed—just commit to GitHub!

---

## Advanced Configurations

### Add Manual Approval Step

1. Add **Slack** or **Email** node after "Parse Content"
2. Send preview with approve/reject buttons
3. Add **Wait** node to pause workflow
4. Add **IF** node to check approval status
5. Only proceed to LinkedIn if approved

### Multi-Platform Publishing

1. Duplicate the "Post to LinkedIn" branch
2. Add Instagram, Facebook, or Twitter nodes
3. Add conditional logic to determine platform per post
4. Adjust caption format for each platform

### A/B Testing & Analytics

1. Add **Webhook** node to receive LinkedIn analytics
2. Store engagement data in separate log
3. Use data to refine topic selection logic
4. Rotate high-performing templates more frequently

---

## Cost Estimates

**Per post** (2x/day = 60 posts/month):
- OpenAI API: ~$0.02 per generation
- Canva API: ~$0.05 per image (or free alternatives)
- n8n: Free (self-hosted) or $20/month (Cloud)

**Monthly estimate**: $4-5 in API costs + n8n hosting

---

## Support & Resources

- [n8n Documentation](https://docs.n8n.io)
- [GitHub API Reference](https://docs.github.com/en/rest)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [LinkedIn API Docs](https://learn.microsoft.com/en-us/linkedin/)

For issues with this workflow, check the n8n community forum or review execution logs.
