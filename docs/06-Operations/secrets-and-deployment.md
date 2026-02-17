# Secrets & Deployment

## GitHub Repository Secrets

Manage at: `Settings → Secrets and variables → Actions`

| Secret                     | Source                                                           | Used By                                 |
| -------------------------- | ---------------------------------------------------------------- | --------------------------------------- |
| `ANTHROPIC_API_KEY`        | [console.anthropic.com](https://console.anthropic.com/)          | automation.yml (generate job)           |
| `FIREBASE_SERVICE_ACCOUNT` | GCP Console → IAM → Service Accounts (base64 encoded)            | automation.yml (both jobs)              |
| `TWILIO_ACCOUNT_SID`       | [console.twilio.com](https://console.twilio.com/)                | automation.yml (both jobs)              |
| `TWILIO_AUTH_TOKEN`        | Twilio Console                                                   | automation.yml (both jobs)              |
| `TWILIO_WHATSAPP_FROM`     | `whatsapp:+14155238886` (sandbox)                                | automation.yml (both jobs)              |
| `WHATSAPP_TO`              | `whatsapp:+1YOURNUMBER`                                          | automation.yml (both jobs)              |
| `OPENAI_API_KEY`           | [platform.openai.com](https://platform.openai.com/)              | automation.yml (image generation)       |
| `GEMINI_API_KEY`           | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) | automation.yml (image generation)       |

### Encoding Firebase Service Account

```powershell
# PowerShell
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((Get-Content -Path "config/firebase-service-account.json" -Raw)))
```

```bash
# Linux (GNU coreutils)
base64 -w 0 config/firebase-service-account.json

# macOS (BSD base64)
base64 -b 0 config/firebase-service-account.json
```

## Local Development

Copy `automation/.env.example` to `automation/.env` and fill in values.

Set `IMAGE_PROVIDER` in your `.env` to control image generation: `gemini`, `dalle`, `auto` (default), or `none`.

Firebase credentials go in `config/firebase-service-account.json` (gitignored).

## Deploying Firestore Indexes

```bash
firebase deploy --only firestore:indexes
```

Index definitions: `firestore.indexes.json`

## GitHub Actions Workflows

The unified workflow (`.github/workflows/automation.yml`) has three cron schedules:

- **Generate:** 14:00 UTC (8 AM CST / 9 AM CDT) and 22:00 UTC (4 PM CST / 5 PM CDT)
- **Publish:** every 15 minutes

Trigger manually: GitHub repo → Actions tab → "Content Automation" → Run workflow → choose `generate` or `publish`

## Rotating Secrets

If a secret is compromised:

1. Rotate at the source (Anthropic console, GCP, Twilio)
2. Update GitHub secret
3. Update `automation/.env` locally
4. For Firebase: also update `config/firebase-service-account.json`
