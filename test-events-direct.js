/**
 * Direct Firestore Events Test
 * Tests Firestore connection and checks events collection
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin with environment variables
if (!admin.apps.length) {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey,
    }),
  });
}

const db = admin.firestore();

async function testEventsCollection() {
  try {
    console.log('🔍 Testing Firestore Events Collection...\n');
    
    // Test 1: Get all events (no filters)
    console.log('📋 Test 1: Fetching ALL events...');
    const allEventsSnapshot = await db.collection('events').get();
    console.log(`✅ Total events in collection: ${allEventsSnapshot.size}`);
    
    if (allEventsSnapshot.empty) {
      console.log('⚠️  No events found in Firestore!\n');
      return;
    }
    
    // Test 2: Show first 3 events
    console.log('\n📝 First 3 events:');
    allEventsSnapshot.docs.slice(0, 3).forEach((doc, index) => {
      const data = doc.data();
      console.log(`\n${index + 1}. Event ID: ${doc.id}`);
      console.log(`   Title: ${data.title}`);
      console.log(`   isPublic: ${data.isPublic}`);
      console.log(`   createdBy: ${data.createdBy}`);
      console.log(`   createdAt: ${data.createdAt?.toDate?.() || data.createdAt}`);
    });
    
    // Test 3: Check isPublic=true events (what the API should return)
    console.log('\n📋 Test 3: Events with isPublic=true...');
    const publicEventsSnapshot = await db.collection('events')
      .where('isPublic', '==', true)
      .get();
    console.log(`✅ Public events count: ${publicEventsSnapshot.size}`);
    
    // Test 4: Check if any events missing isPublic field
    console.log('\n📋 Test 4: Checking for events with missing isPublic field...');
    let missingIsPublic = 0;
    allEventsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.isPublic === undefined || data.isPublic === null) {
        missingIsPublic++;
        console.log(`   ⚠️  Event "${data.title}" (ID: ${doc.id}) has no isPublic field!`);
      }
    });
    if (missingIsPublic === 0) {
      console.log('   ✅ All events have isPublic field');
    }
    
    // Test 5: Check Firestore timestamps
    console.log('\n📋 Test 5: Checking timestamp formats...');
    const firstEvent = allEventsSnapshot.docs[0].data();
    console.log(`   createdAt type: ${typeof firstEvent.createdAt}`);
    console.log(`   createdAt value: ${firstEvent.createdAt}`);
    if (firstEvent.createdAt?.toDate) {
      console.log(`   createdAt as Date: ${firstEvent.createdAt.toDate()}`);
    }
    
    console.log('\n✅ Firestore test complete!');
    
  } catch (error) {
    console.error('\n❌ Error testing Firestore:', error.message);
    console.error('Full error:', error);
  } finally {
    process.exit(0);
  }
}

testEventsCollection();
