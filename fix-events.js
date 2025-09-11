const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://kathanchauhan22_db_user:NovaX135@arisze.y20yxd7.mongodb.net/arisze?retryWrites=true&w=majority';

const options = {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 30000,
  retryWrites: true,
  w: 'majority',
  maxPoolSize: 10,
  minPoolSize: 1,
  maxIdleTimeMS: 30000,
  connectTimeoutMS: 30000,
  tls: true,
  tlsAllowInvalidCertificates: true,
  tlsAllowInvalidHostnames: true,
  retryReads: true,
  directConnection: false
};

async function fixEvents() {
  let client;
  try {
    console.log('🔄 Connecting to MongoDB Atlas...');
    client = new MongoClient(uri, options);
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas');
    
    const db = client.db('arisze');
    
    // Update all events to have isPublic: true
    console.log('\n🔧 Updating events to add isPublic field...');
    const result = await db.collection('events').updateMany(
      { isPublic: { $exists: false } }, // Only update events that don't have isPublic field
      { $set: { isPublic: true } }
    );
    
    console.log(`✅ Updated ${result.modifiedCount} events with isPublic: true`);
    
    // Verify the fix
    console.log('\n🧪 Verifying fix...');
    const publicEvents = await db.collection('events')
      .find({ isPublic: true })
      .sort({ createdAt: -1 })
      .toArray();
    
    console.log(`📊 Found ${publicEvents.length} public events after fix`);
    
    if (publicEvents.length > 0) {
      console.log('📄 Sample fixed event:', {
        id: publicEvents[0]._id,
        title: publicEvents[0].title,
        isPublic: publicEvents[0].isPublic
      });
    }
    
    console.log('\n✅ Events fix complete!');
    
    } catch (error) {
    console.error('❌ Fix failed:', error.message);
    console.error('Full error:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('🔒 Connection closed');
    }
  }
}

fixEvents();