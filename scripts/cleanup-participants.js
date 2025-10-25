const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://kathanchauhan22_db_user:NovaX135@arisze.y20yxd7.mongodb.net/arisze?retryWrites=true&w=majority';
const client = new MongoClient(uri);

async function cleanup() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('arisze');
    
    // Delete all eventParticipants with null eventId
    const result = await db.collection('eventParticipants').deleteMany({ 
      eventId: null 
    });
    
    console.log(`✅ Deleted ${result.deletedCount} corrupted records with null eventId`);
    
  } catch (error) {
    console.error('Error cleaning up database:', error);
  } finally {
    await client.close();
    console.log('Connection closed');
  }
}

cleanup();
