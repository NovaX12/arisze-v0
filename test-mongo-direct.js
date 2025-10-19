// Direct MongoDB Connection Test
const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://kathanchauhan22_db_user:NovaX135@arisze.y20yxd7.mongodb.net/arisze?retryWrites=true&w=majority';

async function testConnection() {
  console.log('🔄 Testing MongoDB connection...');
  console.log('Node version:', process.version);
  
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 10000,
  });

  try {
    console.log('⏳ Connecting...');
    await client.connect();
    console.log('✅ Connected successfully!');
    
    const db = client.db('arisze');
    console.log('📦 Database:', db.databaseName);
    
    const collections = await db.listCollections().toArray();
    console.log('📋 Collections:', collections.map(c => c.name));
    
    const events = await db.collection('events').find().limit(3).toArray();
    console.log(`📊 Found ${events.length} events`);
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Error details:', error);
  } finally {
    await client.close();
    console.log('👋 Connection closed');
  }
}

testConnection();
