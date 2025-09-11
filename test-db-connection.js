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

async function testConnection() {
  let client;
  try {
    console.log('🔄 Attempting to connect to MongoDB Atlas...');
    client = new MongoClient(uri, options);
    await client.connect();
    console.log('✅ Successfully connected to MongoDB Atlas');
    
    const db = client.db('arisze');
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('📋 Collections found:', collections.map(c => c.name));
    
    // Check if required collections exist
    const requiredCollections = ['events', 'universities', 'bookings', 'eventParticipants', 'userCreatedEvents', 'userEventProfiles'];
    const existingCollections = collections.map(c => c.name);
    
    console.log('\n🔍 Checking required collections:');
    for (const collection of requiredCollections) {
      const exists = existingCollections.includes(collection);
      console.log(`  ${exists ? '✅' : '❌'} ${collection}: ${exists ? 'EXISTS' : 'MISSING'}`);
      
      if (exists) {
        const count = await db.collection(collection).countDocuments();
        console.log(`     📊 Document count: ${count}`);
      }
    }
    
    // Test a simple query
    console.log('\n🧪 Testing simple query...');
    const testDoc = await db.collection('events').findOne();
    console.log('📄 Sample event document:', testDoc ? 'Found' : 'None found');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.error('Full error:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('🔒 Connection closed');
    }
  }
}

testConnection();