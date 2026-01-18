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
