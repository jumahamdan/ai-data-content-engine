Generate a LinkedIn post that explains {{topic}} as a layered or stacked mental model.

Structure:
- Short framing about why the topic feels complex
- 46 layers explained simply
- One strong takeaway about fundamentals vs hype

Tone:
- Senior but approachable
- Clear, structured, calm
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

Sections: 4-6 objects representing the layers of the mental model.
Each: { "title": "<layer name>", "items": ["<component or principle 1>", "<component or principle 2>"] }
Pack the layers densely. Keep each item under 70 characters. Target 4-6 items per section. Dense content looks better than sparse.
