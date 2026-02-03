/**
 * Twilio Function: WhatsApp Incoming Webhook
 * Receives WhatsApp messages and manages post queue via Firestore.
 */

const admin = require('firebase-admin');
const fs = require('node:fs');

// Initialize Firebase (only once)
let db;
function getFirestore() {
    if (!db) {
        // Load service account from private asset
        const assetPath = Runtime.getAssets()['/firebase-credentials.json'].path;
        const serviceAccountJson = fs.readFileSync(assetPath, 'utf8');
        const serviceAccount = JSON.parse(serviceAccountJson);

        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
        }
        db = admin.firestore();
    }
    return db;
}

// Parse WhatsApp commands
function parseCommand(messageBody) {
    if (!messageBody || typeof messageBody !== 'string' || !messageBody.trim()) {
        return { command: null, postId: null, valid: false, error: 'Empty message. Commands: yes <id>, no <id>, list, status' };
    }

    const parts = messageBody.trim().toLowerCase().split(/\s+/);
    const keyword = parts[0];

    // Simple commands
    if (keyword === 'list') return { command: 'list', postId: null, valid: true, error: null };
    if (keyword === 'status') return { command: 'status', postId: null, valid: true, error: null };

    // Yes/No commands
    if (keyword === 'yes' || keyword === 'no') {
        return parseYesNoCommand(keyword, parts);
    }

    // View by ID
    const numericId = Number.parseInt(keyword, 10);
    if (!Number.isNaN(numericId) && numericId > 0) {
        return { command: 'view', postId: String(numericId), valid: true, error: null };
    }

    return { command: null, postId: null, valid: false, error: `Unknown: "${keyword}". Try: <id>, yes <id>, no <id>, list, status` };
}

function parseYesNoCommand(keyword, parts) {
    if (parts.length < 2) {
        return { command: null, postId: null, valid: false, error: `Specify post ID. Example: ${keyword} 47` };
    }
    const target = parts[1];
    if (target === 'all') {
        return { command: keyword === 'yes' ? 'approve_all' : 'reject_all', postId: null, valid: true, error: null };
    }
    const id = Number.parseInt(target, 10);
    if (Number.isNaN(id) || id <= 0) {
        return { command: null, postId: null, valid: false, error: `Post ID must be a number. Example: ${keyword} 47` };
    }
    return { command: keyword === 'yes' ? 'approve' : 'reject', postId: String(id), valid: true, error: null };
}

// Command handlers
async function handleStatus(postsRef) {
    const snapshot = await postsRef.where('status', '==', 'pending').get();
    return `📊 System Status\n━━━━━━━━━━━━━━━━\n✅ WhatsApp: Connected\n✅ Firestore: Connected\n📋 Pending Posts: ${snapshot.size}\n⏰ Time: ${new Date().toISOString()}`;
}

async function handleList(postsRef) {
    const snapshot = await postsRef.where('status', '==', 'pending').orderBy('createdAt', 'desc').limit(10).get();
    if (snapshot.empty) {
        return '📋 No pending posts.\n\nRun your workflow to generate posts!';
    }
    let msg = '📋 Pending Posts\n━━━━━━━━━━━━━━━━\n';
    snapshot.forEach(doc => {
        const post = doc.data();
        const title = post.content?.topic || post.content?.imageTitle || post.topic || post.title || 'Untitled';
        msg += `#${doc.id} - ${title.substring(0, 30)}\n`;
    });
    return msg + '\nReply with ID to preview, YES <id> or NO <id>';
}

async function handleView(postsRef, postId) {
    const doc = await postsRef.doc(postId).get();
    if (!doc.exists) return `⚠️ Post #${postId} not found.`;

    const post = doc.data();
    let caption = post.content?.caption || post.caption || 'No caption';
    const hashtags = post.content?.hashtags || post.hashtags || '';
    const status = post.status || 'unknown';

    // Truncate caption if too long (WhatsApp limit ~1600 chars)
    const maxCaptionLen = 1200;
    if (caption.length > maxCaptionLen) {
        caption = caption.substring(0, maxCaptionLen) + '...\n\n[Truncated for WhatsApp]';
    }

    let msg = `📝 Post #${postId}\n━━━━━━━━━━━━━━━━\nStatus: ${status.toUpperCase()}\n\n${caption}\n\n`;
    if (hashtags) msg += `${hashtags}\n\n`;
    if (status === 'pending') msg += `Reply: YES ${postId} or NO ${postId}`;
    return msg;
}

async function handleApprove(postsRef, postId) {
    const docRef = postsRef.doc(postId);
    const doc = await docRef.get();
    if (!doc.exists) return `⚠️ Post #${postId} not found.`;
    if (doc.data().status !== 'pending') return `⚠️ Post #${postId} already ${doc.data().status}.`;

    await docRef.update({ status: 'approved', approvedAt: admin.firestore.FieldValue.serverTimestamp() });
    return `✅ Post #${postId} approved!\n\nIt will be posted to LinkedIn shortly.`;
}

async function handleReject(postsRef, postId) {
    const docRef = postsRef.doc(postId);
    const doc = await docRef.get();
    if (!doc.exists) return `⚠️ Post #${postId} not found.`;
    if (doc.data().status !== 'pending') return `⚠️ Post #${postId} already ${doc.data().status}.`;

    await docRef.update({ status: 'rejected', rejectedAt: admin.firestore.FieldValue.serverTimestamp() });
    return `❌ Post #${postId} rejected and discarded.`;
}

async function handleBulkAction(postsRef, db, isApprove) {
    const snapshot = await postsRef.where('status', '==', 'pending').get();
    const action = isApprove ? 'approve' : 'reject';
    if (snapshot.empty) return `📋 No pending posts to ${action}.`;

    const batch = db.batch();
    const status = isApprove ? 'approved' : 'rejected';
    const timestampField = isApprove ? 'approvedAt' : 'rejectedAt';

    snapshot.forEach(doc => {
        batch.update(doc.ref, { status, [timestampField]: admin.firestore.FieldValue.serverTimestamp() });
    });
    await batch.commit();

    if (isApprove) {
        return `✅ Approved ${snapshot.size} post(s)!\n\nThey will be posted to LinkedIn shortly.`;
    }
    return `❌ Rejected ${snapshot.size} post(s).`;
}

exports.handler = async function (context, event, callback) {
    const twiml = new Twilio.twiml.MessagingResponse();

    try {
        const db = getFirestore();
        const postsRef = db.collection('pending_posts');
        const body = event.Body || '';
        console.log(`[WhatsApp] Body: "${body}"`);

        const parsed = parseCommand(body);
        if (!parsed.valid) {
            twiml.message(parsed.error);
            return callback(null, twiml);
        }

        const handlers = {
            status: () => handleStatus(postsRef),
            list: () => handleList(postsRef),
            view: () => handleView(postsRef, parsed.postId),
            approve: () => handleApprove(postsRef, parsed.postId),
            reject: () => handleReject(postsRef, parsed.postId),
            approve_all: () => handleBulkAction(postsRef, db, true),
            reject_all: () => handleBulkAction(postsRef, db, false)
        };

        console.log(`[WhatsApp] Command: ${parsed.command}, PostId: ${parsed.postId}`);
        const handler = handlers[parsed.command];
        const response = handler ? await handler() : 'Unknown command. Try: status, list, yes <id>, no <id>';
        console.log(`[WhatsApp] Response length: ${response.length}`);
        twiml.message(response);

    } catch (error) {
        console.error('Error:', error);
        twiml.message(`❌ Error: ${error.message}\n\nPlease try again.`);
    }

    return callback(null, twiml);
};
