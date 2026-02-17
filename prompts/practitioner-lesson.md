Generate a LinkedIn post about {{topic}} as a real-world engineering lesson.

Structure:
- Hook: a specific scenario or failure that sets up the lesson (never say "I learned")
- What went wrong or what was overlooked
- The root cause or deeper insight
- What changed as a result — the practical fix or mindset shift
- One strong takeaway that signals experience

Tone:
- Senior but approachable — someone who has operated production systems
- Reflective and honest, not preachy or motivational
- No emojis
- No selling, promotions, or vendor names
- Avoid generic advice — be specific about the engineering context

Output:
- LinkedIn-ready caption (6-12 lines)
- End with a reflective question
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

Sections: 1-2 objects summarizing the key lessons.
Each: { "title": "<lesson area>", "items": ["<takeaway 1>", "<takeaway 2>", "<takeaway 3>"] }
Keep it focused — this is a single-topic deep dive. Keep each item under 60 characters. Max 4 items per section.
