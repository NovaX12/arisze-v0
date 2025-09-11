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

async function initializeCollections() {
  let client;
  try {
    console.log('🔄 Connecting to MongoDB Atlas...');
    client = new MongoClient(uri, options);
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas');
    
    const db = client.db('arisze');
    
    // Collections to create
    const collectionsToCreate = [
      'bookings',
      'eventParticipants', 
      'userCreatedEvents',
      'userEventProfiles'
    ];
    
    console.log('\n🏗️  Creating missing collections...');
    
    for (const collectionName of collectionsToCreate) {
      try {
        // Check if collection exists
        const collections = await db.listCollections({ name: collectionName }).toArray();
        
        if (collections.length === 0) {
          // Create collection
          await db.createCollection(collectionName);
          console.log(`✅ Created collection: ${collectionName}`);
          
          // Add indexes for better performance
          if (collectionName === 'bookings') {
            await db.collection(collectionName).createIndex({ eventId: 1, userId: 1 }, { unique: true });
            await db.collection(collectionName).createIndex({ userId: 1 });
            await db.collection(collectionName).createIndex({ eventId: 1 });
            console.log(`   📊 Added indexes for ${collectionName}`);
          }
          
          if (collectionName === 'eventParticipants') {
            await db.collection(collectionName).createIndex({ eventId: 1, userId: 1 }, { unique: true });
            await db.collection(collectionName).createIndex({ eventId: 1 });
            await db.collection(collectionName).createIndex({ userId: 1 });
            console.log(`   📊 Added indexes for ${collectionName}`);
          }
          
          if (collectionName === 'userCreatedEvents') {
            await db.collection(collectionName).createIndex({ userId: 1 });
            await db.collection(collectionName).createIndex({ eventId: 1 });
            console.log(`   📊 Added indexes for ${collectionName}`);
          }
          
          if (collectionName === 'userEventProfiles') {
            await db.collection(collectionName).createIndex({ userId: 1 }, { unique: true });
            console.log(`   📊 Added indexes for ${collectionName}`);
          }
        } else {
          console.log(`ℹ️  Collection ${collectionName} already exists`);
        }
      } catch (error) {
        console.error(`❌ Error creating collection ${collectionName}:`, error.message);
      }
    }
    
    // Verify all collections now exist
    console.log('\n🔍 Verifying collections...');
    const allCollections = await db.listCollections().toArray();
    const existingNames = allCollections.map(c => c.name);
    
    for (const collectionName of collectionsToCreate) {
      const exists = existingNames.includes(collectionName);
      console.log(`  ${exists ? '✅' : '❌'} ${collectionName}: ${exists ? 'EXISTS' : 'MISSING'}`);
    }
    
    console.log('\n🎉 Collection initialization complete!');
    
  } catch (error) {
    console.error('❌ Error initializing collections:', error.message);
    console.error('Full error:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('🔒 Connection closed');
    }
  }
}

initializeCollections();