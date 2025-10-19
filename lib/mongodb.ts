import { MongoClient, Db } from 'mongodb'

// Check if mock database mode is enabled
const useMockDb = process.env.USE_MOCK_DB === 'true'

const uri = process.env.MONGODB_URI || 'mongodb+srv://kathanchauhan22_db_user:NovaX135@arisze.y20yxd7.mongodb.net/arisze?retryWrites=true&w=majority'

if (!uri && !useMockDb) {
  throw new Error('Please add your MongoDB URI to .env.local or set USE_MOCK_DB=true')
}

// Enhanced options for Windows SSL compatibility
const options = {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  retryWrites: true,
  w: 'majority' as const,
  maxPoolSize: 10,
  minPoolSize: 2,
  maxIdleTimeMS: 30000,
  connectTimeoutMS: 30000,
  // Enhanced SSL/TLS options for Windows compatibility
  tls: true,
  tlsAllowInvalidCertificates: true,
  retryReads: true,
}

let client: MongoClient | null = null
let clientPromise: Promise<MongoClient> | null = null

// Initialize connection
async function initializeConnection() {
  // Skip connection if using mock database
  if (useMockDb) {
    console.log('🔧 Using MOCK DATABASE mode - no MongoDB connection needed')
    return
  }
  
  try {
    console.log('🔄 Attempting to connect to MongoDB Atlas...')
    client = new MongoClient(uri, options)
    await client.connect()
    console.log('✅ Successfully connected to MongoDB Atlas')
  } catch (error) {
    console.error('❌ MongoDB Atlas connection failed:', error)
    throw new Error('Failed to connect to MongoDB Atlas. Please check your connection string and network.')
  }
}

// Initialize connection on module load (only if not using mock DB)
if (!useMockDb) {
  initializeConnection()
}

// Global is used to maintain a cached connection across hot reloads in development
declare const global: {
  _mongoClientPromise?: Promise<MongoClient>
}

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = new Promise<MongoClient>((resolve) => {
      const checkConnection = () => {
        if (client) {
          resolve(client!)
        } else {
          setTimeout(checkConnection, 100)
        }
      }
      checkConnection()
    })
  }
  clientPromise = global._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  clientPromise = new Promise<MongoClient>((resolve) => {
    const checkConnection = () => {
      if (client) {
        resolve(client!)
      } else {
        setTimeout(checkConnection, 100)
      }
    }
    checkConnection()
  })
}

export default clientPromise

// Legacy function for backward compatibility
export async function connectToDatabase(): Promise<{ db: Db }> {
  const db = await getDatabase()
  return { db }
}

export async function getDatabase(): Promise<Db> {
  // If using mock database mode, return a mock database object
  if (useMockDb) {
    console.log('🔧 Using MOCK DATABASE')
    // Create a simple in-memory mock database
    const mockDb = {
      collection: (name: string) => ({
        find: () => ({ toArray: async () => [] }),
        findOne: async () => null,
        insertOne: async (doc: any) => ({ insertedId: Date.now().toString(), acknowledged: true }),
        updateOne: async () => ({ matchedCount: 1, modifiedCount: 1 }),
        deleteOne: async () => ({ deletedCount: 1 }),
        countDocuments: async () => 0
      })
    } as any
    return mockDb
  }

  if (client) {
    console.log('✅ Database connection established')
    return (client as MongoClient).db('arisze')
  }

  // Wait for initialization to complete
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  if (client) {
    console.log('✅ Database connection established')
    return (client as MongoClient).db('arisze')
  }

  throw new Error('Failed to connect to MongoDB Atlas. Please check your connection.')
}
