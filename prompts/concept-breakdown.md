Generate a LinkedIn post that breaks down {{topic}} from a practitioner's perspective.

Structure:
- Hook that frames a real-world problem or scenario (never reference interviews)
- Why the concept matters in production systems
- Clear explanation with concrete examples or trade-offs
- One actionable takeaway engineers can apply immediately

Tone:
- Senior but approachable — explain complexity without dumbing it down
- Calm, clear, non-hype
- No emojis
- No selling, promotions, or vendor names

Output:
- LinkedIn-ready caption (6-12 lines)
- End with a thoughtful question that invites discussion
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

Sections: 3-4 objects, each: { "title": "<stage name>", "items": ["<point 1>", "<point 2>", "<point 3>"] }
Represent the concept as a progression or breakdown of key areas.
Keep each item under 75 characters. Target 5-7 items per section. Pack the image with useful information — dense content looks better than sparse.
