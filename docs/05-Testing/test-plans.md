# Test Plans

## Content Generator

```bash
cd automation && node content-generator/index.js
```

**Expected:** Selects topic → calls Claude API → saves to Firestore (`pending_posts`, status: `pending`) → sends WhatsApp notification.

**Verify:**
- Console shows topic selection, API call, Firestore write, WhatsApp sent
- Firestore document exists with correct fields
- WhatsApp message received on phone

## Publisher

```bash
cd automation && node publisher/index.js
```

**Expected:** Queries Firestore for `status == 'approved'` → logs LinkedIn preview (MVP) → updates status to `published`.

**Verify:**
- Console shows post preview and status update
- Firestore document status changed to `published` with `publishedAt` timestamp

## GitHub Actions (Manual Dispatch)

1. Go to repo → Actions tab
2. Select workflow → Run workflow
3. Watch logs for same expected output as local tests

## End-to-End Flow

1. Run content generator → creates pending post
2. Receive WhatsApp notification
3. Reply `YES <id>` to approve
4. Run publisher → publishes approved post
5. Verify Firestore shows `published` status
