import { MongoClient, Db } from 'mongodb'

const uri = process.env.MONGODB_URI

if (!uri) {
  throw new Error('Please add MONGODB_URI to .env.local')
}

// Minimal options for MongoDB 6.x + Node.js 23 compatibility
const options = {
  serverSelectionTimeoutMS: 10000,
}

// Global cached connection for development (prevents connection pool exhaustion during HMR)
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === 'development') {
  // In development, use a global variable to preserve connection across module reloads
  if (!global._mongoClientPromise) {
    const client = new MongoClient(uri, options)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  // In production, create new client
  const client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export default clientPromise

// Get database instance with connection verification
export async function getDatabase(): Promise<Db> {
  try {
    const client = await clientPromise
    // Verify connection is alive with ping
    await client.db('admin').command({ ping: 1 })
    return client.db('arisze')
  } catch (error) {
    console.error('❌ MongoDB Connection Failed:', error)
    throw new Error(`Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Legacy function for backward compatibility
export async function connectToDatabase(): Promise<{ db: Db }> {
  const db = await getDatabase()
  return { db }
}
