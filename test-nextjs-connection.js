// Test the exact same connection logic as Next.js uses
const { MongoClient } = require('mongodb');

// Simulate Next.js environment variables
process.env.MONGODB_URI = 'mongodb+srv://kathanchauhan22_db_user:NovaX135@arisze.y20yxd7.mongodb.net/arisze?retryWrites=true&w=majority';
process.env.USE_MOCK_DB = 'false';
process.env.NODE_ENV = 'development';

const USE_MOCK_DB = process.env.USE_MOCK_DB === 'true';
const uri = process.env.MONGODB_URI;

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

let client;
let clientPromise;

console.log('🔄 Testing Next.js-style MongoDB connection...');
console.log('USE_MOCK_DB:', USE_MOCK_DB);
console.log('MONGODB_URI exists:', !!uri);
console.log('NODE_ENV:', process.env.NODE_ENV);

if (!USE_MOCK_DB && uri) {
  if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    let globalWithMongo = global;

    if (!globalWithMongo._mongoClientPromise) {
      client = new MongoClient(uri, options);
      console.log('🔄 Creating new MongoDB client...');
      globalWithMongo._mongoClientPromise = client.connect().catch(error => {
        console.error('❌ MongoDB connection failed:', error.message);
        console.log('🔄 Falling back to mock database due to connection issues');
        return null;
      });
    }
    clientPromise = globalWithMongo._mongoClientPromise;
  } else {
    // In production mode, it's best to not use a global variable.
    client = new MongoClient(uri, options);
    clientPromise = client.connect().catch(error => {
      console.error('❌ MongoDB connection failed:', error.message);
      console.log('🔄 Falling back to mock database due to connection issues');
      return null;
    });
  }
}

async function testConnection() {
  try {
    console.log('\n🧪 Testing clientPromise...');
    const client = await clientPromise;
    
    if (!client) {
      console.log('❌ Client is null - connection failed');
      return;
    }
    
    console.log('✅ Client connected successfully');
    
    const db = client.db('arisze');
    console.log('✅ Database selected');
    
    const events = await db.collection('events').find({ isPublic: true }).limit(1).toArray();
    console.log(`✅ Query successful - found ${events.length} events`);
    
    await client.close();
    console.log('🔒 Connection closed');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
  }
}

testConnection();