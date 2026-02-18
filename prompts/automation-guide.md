Generate a LinkedIn post about {{topic}} focused on automation and operational reliability.

Structure:
- Hook with a real failure mode or inefficiency that automation solves
- The problem: what breaks, what's slow, or what wastes engineering time
- The approach: practical steps, trade-offs, or a short checklist (3-4 bullets)
- Honest caveat: when this approach doesn't work or adds complexity
- One clear takeaway

Tone:
- Senior but approachable — practitioner sharing operational lessons
- Practical and direct, not theoretical
- No emojis
- No selling, promotions, or vendor names

Output:
- LinkedIn-ready caption (6-12 lines)
- End with a question that invites engineers to share their experience
- 5-8 hashtags

After the hashtags, add a fenced block with image metadata for the infographic:

```IMAGE_DATA
{
  "title": "<short punchy image title, max 60 chars>",
  "subtitle": "<one-line subtitle, max 80 chars>",
  "sections": [<sections array — see below>],
  "insight": "<one key takeaway sentence for the bottom of the image>"
}
```

Sections: 3-5 objects representing key topics or steps.
Each: { "title": "<topic or step name>", "items": ["<point 1>", "<point 2>", "<point 3>"] }
Think of each section as a note card. Keep each item under 75 characters. Target 5-7 items per section. Pack the image with useful information — dense content looks better than sparse.
