const bcrypt = require('bcryptjs');
const { MongoClient } = require('mongodb');

// Test authentication flow
async function testAuthFlow() {
  console.log('Testing authentication flow...');
  
  const uri = 'mongodb+srv://kathanchauhan22_db_user:NovaX135@arisze.y20yxd7.mongodb.net/arisze?retryWrites=true&w=majority';
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db('arisze');
    
    // Test credentials
    const testEmail = 'test@arisze.com';
    const testPassword = 'password123';
    
    console.log('\n1. Looking for user in database...');
    const user = await db.collection('users').findOne({ email: testEmail });
    
    if (!user) {
      console.log('❌ User not found:', testEmail);
      return;
    }
    
    console.log('✅ User found:', user.name, '(' + user.email + ')');
    
    console.log('\n2. Testing password comparison...');
    const isValidPassword = await bcrypt.compare(testPassword, user.password);
    
    if (!isValidPassword) {
      console.log('❌ Password does not match');
      return;
    }
    
    console.log('✅ Password matches!');
    
    console.log('\n3. Simulating NextAuth user object creation...');
    const authUser = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      image: user.avatar || null
    };
    
    console.log('✅ Auth user object:', authUser);
    console.log('\n🎉 Authentication flow test PASSED!');
    
  } catch (error) {
    console.error('❌ Authentication test failed:', error.message);
  } finally {
    await client.close();
  }
}

testAuthFlow().catch(console.error);