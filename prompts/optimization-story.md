Generate a LinkedIn post describing a real-world performance or design improvement.

Structure:
- Opening with a concrete before/after result
- The problem being solved
- Why the naive/old approach failed
- The better approach
- Measurable results
- One clear takeaway

Tone:
- Senior but approachable engineer
- Practical and factual
- No emojis
- No hype

Output:
- LinkedIn-ready caption
- End with a question
- 58 hashtags

After the hashtags, add a fenced block with image metadata for the infographic:

```IMAGE_DATA
{
  "title": "<short punchy image title, max 60 chars>",
  "subtitle": "<one-line subtitle, max 80 chars>",
  "sections": [<sections array — see below>],
  "insight": "<one key takeaway sentence for the bottom of the image>"
}
```

Sections: 4-6 objects covering different optimization areas.
Each: { "title": "<area name>", "items": ["<technique or insight 1>", "<technique or insight 2>"] }
Pack useful information densely. Keep each item under 45 characters. Max 3 items per section.
