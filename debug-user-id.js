const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;

async function debugUserId() {
  console.log('🔍 Debugging User ID Issue...\n');
  
  const client = await MongoClient.connect(uri);
  const db = client.db('arisze');
  
  // Search for user by email
  console.log('📧 Searching for user: kxthxn@test.com');
  const userByEmail = await db.collection('users').findOne({ 
    email: 'kxthxn@test.com' 
  });
  
  if (userByEmail) {
    console.log('\n✅ User found by email!');
    console.log('User document:');
    console.log(JSON.stringify(userByEmail, null, 2));
    console.log('\n📊 ID Analysis:');
    console.log('_id value:', userByEmail._id);
    console.log('_id type:', typeof userByEmail._id);
    console.log('_id constructor:', userByEmail._id.constructor.name);
    console.log('Is ObjectId?', userByEmail._id instanceof ObjectId);
    console.log('As string:', userByEmail._id.toString());
    
    // Try different query formats
    console.log('\n🧪 Testing Different Query Formats:\n');
    
    // Test 1: Direct _id match
    const test1 = await db.collection('users').findOne({ _id: userByEmail._id });
    console.log('1️⃣ Direct _id match:', test1 ? '✅ FOUND' : '❌ NOT FOUND');
    
    // Test 2: String match
    const test2 = await db.collection('users').findOne({ _id: userByEmail._id.toString() });
    console.log('2️⃣ String match:', test2 ? '✅ FOUND' : '❌ NOT FOUND');
    
    // Test 3: Number match (if applicable)
    const idAsNumber = parseInt(userByEmail._id.toString());
    if (!isNaN(idAsNumber)) {
      const test3 = await db.collection('users').findOne({ _id: idAsNumber });
      console.log('3️⃣ Number match:', test3 ? '✅ FOUND' : '❌ NOT FOUND');
    }
    
    // Test 4: Try ObjectId conversion
    try {
      const test4 = await db.collection('users').findOne({ 
        _id: new ObjectId(userByEmail._id.toString()) 
      });
      console.log('4️⃣ ObjectId conversion:', test4 ? '✅ FOUND' : '❌ NOT FOUND');
    } catch (e) {
      console.log('4️⃣ ObjectId conversion: ❌ CONVERSION FAILED');
    }
    
    // Show what session.user.id would be
    console.log('\n💡 Session Analysis:');
    console.log('What NextAuth returns as session.user.id:', userByEmail._id.toString());
    
  } else {
    console.log('❌ User not found by email!');
    
    // List all users
    const allUsers = await db.collection('users').find({}).limit(5).toArray();
    console.log('\n📋 First 5 users in database:');
    allUsers.forEach((u, i) => {
      console.log(`${i + 1}. ${u.email} (ID: ${u._id}, Type: ${typeof u._id})`);
    });
  }
  
  await client.close();
}

debugUserId().catch(console.error);
