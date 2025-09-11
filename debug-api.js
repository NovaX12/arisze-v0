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

async function debugAPI() {
  let client;
  try {
    console.log('🔄 Testing API-like MongoDB connection...');
    client = new MongoClient(uri, options);
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas');
    
    const db = client.db('arisze');
    
    // Check ALL events first
    console.log('\n🧪 Checking ALL events in database...');
    const allEvents = await db.collection('events').find({}).toArray();
    console.log(`📊 Total events in database: ${allEvents.length}`);
    
    if (allEvents.length > 0) {
      console.log('📄 Sample event structure:', {
        id: allEvents[0]._id,
        title: allEvents[0].title,
        date: allEvents[0].date,
        university: allEvents[0].university,
        isPublic: allEvents[0].isPublic,
        allFields: Object.keys(allEvents[0])
      });
    }
    
    // Test the exact query that the API uses
    console.log('\n🧪 Testing events query with isPublic: true...');
    const publicEvents = await db.collection('events')
      .find({ isPublic: true })
      .sort({ createdAt: -1 })
      .toArray();
    
    console.log(`📊 Found ${publicEvents.length} public events`);
    
    // Test without isPublic filter
    console.log('\n🧪 Testing events query WITHOUT isPublic filter...');
    const allEventsQuery = await db.collection('events')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    console.log(`📊 Found ${allEventsQuery.length} total events`);
    
    // Test universities query
    console.log('\n🧪 Testing universities query...');
    const universities = await db.collection('universities').find({}).toArray();
    console.log(`📊 Found ${universities.length} universities`);
    
    console.log('\n✅ Debug complete!');
    
  } catch (error) {
    console.error('❌ API debug failed:', error.message);
    console.error('Full error:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('🔒 Connection closed');
    }
  }
}

debugAPI();