# AI & Data Content Engine

This repository defines the **content system** used to generate and automatically publish technical posts about:
- Data Engineering
- AI / LLMs
- RAG & Agentic Systems
- Architecture & Mental Models

## Goals
- High-signal, practitioner-focused content
- Image-first + long-form captions
- Fully automatable posting (LinkedIn first)
- Reusable across platforms (IG/FB later, TikTok/Snapchat near future)

## Source of Truth
- content-spec/  -> tone + rules
- prompts/       -> AI generation templates
- topics/        -> topic rotation bank
- schedule/      -> posting cadence
- automation/    -> n8n workflows

Treat this repo like a production system: versioned, auditable, extensible.

## WhatsApp Post Approval

Before any post goes live, you get a WhatsApp preview and approve or reject it with a simple reply. Posts queue up if you're busy, with automatic reminders after 60 minutes.

**Quick start:**
```bash
cd automation
node whatsapp/test-connection.js --dry-run   # Validate config
node whatsapp/test-e2e-flow.js               # Run end-to-end test
node whatsapp/webhook-handler.js             # Start webhook server
```

**Commands:** `yes <id>`, `no <id>`, `list`, `status`, `yes all`, `no all`

Full documentation: [docs/features/whatsapp-approval.md](docs/features/whatsapp-approval.md)
