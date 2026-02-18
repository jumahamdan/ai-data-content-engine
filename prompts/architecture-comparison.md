Generate a LinkedIn post comparing data or AI architectures from a real-world engineering perspective.

Structure:
- Opening framing why architecture choices matter
- 23 patterns with strengths and tradeoffs
- Emphasis on fit, not hype
- 23 practical takeaways from real platforms

Tone:
- Senior but approachable architect
- Opinionated but grounded
- No emojis
- No selling

Output:
- LinkedIn-ready caption
- End with a reflective question
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

Sections: exactly 2 objects representing the two architectures being compared.
Each: { "title": "<architecture name>", "items": ["<strength or trait 1>", "<strength or trait 2>", "<strength or trait 3>"], "subsections": [{"title": "<sub-area>", "items": ["<detail>"]}] }
The subsections field is optional — include 2-3 subsections per side if the comparison has clear sub-categories.
Keep each item under 75 characters. Target 5-7 items per section, 3-5 items per subsection. Pack the image with useful information — dense content looks better than sparse.
