import { MongoClient, Db } from 'mongodb'

const uri = process.env.MONGODB_URI || 'mongodb+srv://kathanchauhan22_db_user:NovaX135@arisze.y20yxd7.mongodb.net/arisze?retryWrites=true&w=majority'

if (!uri) {
  throw new Error('Please add your MongoDB URI to .env.local')
}

const options = {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 30000,
  retryWrites: true,
  w: 'majority' as const,
  maxPoolSize: 10,
  minPoolSize: 1,
  maxIdleTimeMS: 30000,
  connectTimeoutMS: 30000,
  tls: true,
  tlsAllowInvalidCertificates: true,
  tlsAllowInvalidHostnames: true,
  retryReads: true,
  directConnection: false
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

console.log('🔄 Initializing MongoDB connection to real database...')

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect().then(client => {
      console.log('✅ Successfully connected to MongoDB Atlas')
      return client
    }).catch(error => {
      console.error('❌ MongoDB connection failed:', error.message)
      throw error
    })
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options)
  clientPromise = client.connect().then(client => {
    console.log('✅ Successfully connected to MongoDB Atlas')
    return client
  }).catch(error => {
    console.error('❌ MongoDB connection failed:', error.message)
    throw error
  })
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise

// Legacy function for backward compatibility
export async function connectToDatabase(): Promise<{ db: Db }> {
  const db = await getDatabase()
  return { db }
}

export async function getDatabase(): Promise<Db> {
  try {
    const client = await clientPromise
    console.log('✅ Database connection established')
    return client.db('arisze')
  } catch (error) {
    console.error('❌ Error getting database:', error)
    throw new Error('Failed to connect to database')
  }
}
