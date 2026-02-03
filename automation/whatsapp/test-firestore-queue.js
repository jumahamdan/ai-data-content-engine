/**
 * Test script to add a sample post to Firestore queue.
 * Run: node whatsapp/test-firestore-queue.js
 */

const firestoreQueue = require('./firestore-queue');

console.log('🔥 Testing Firestore Queue...\n');

// Add a sample post
const samplePost = {
    content: {
        caption: 'The hidden cost of "move fast and break things":\n\nTechnical debt doesn\'t show up on your sprint board.\n\nBut it shows up everywhere else:\n• 3-hour debugging sessions for 5-line fixes\n• Fear of touching "that one file"\n• New devs taking months to contribute\n\nSpeed now. Slowdown later.',
        hashtags: '#TechDebt #SoftwareEngineering #CodingBestPractices',
        imageTitle: 'Technical Debt Iceberg',
        topic: 'technical-debt'
    },
    imagePath: null // Would normally be a cloud storage URL
};

try {
    const post = await firestoreQueue.addToQueue(samplePost);
    console.log('✅ Post added successfully!');
    console.log(`   ID: ${post.id}`);
    console.log(`   Status: ${post.status}`);
    console.log(`   Created: ${post.createdAt}`);
    console.log('');

    // List pending posts
    console.log('📋 Listing pending posts...');
    const pending = await firestoreQueue.listPending();
    console.log(`   Found ${pending.length} pending post(s)`);
    pending.forEach(p => {
        console.log(`   - #${p.id}: ${p.content.caption.substring(0, 50)}...`);
    });
    console.log('');

    console.log('✅ Test complete! Try sending "list" via WhatsApp now.');

} catch (err) {
    console.error('❌ Error:', err.message);
    console.error(err);
}

process.exit(0);
