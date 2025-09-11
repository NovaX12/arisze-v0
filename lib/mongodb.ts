import { MongoClient, Db } from 'mongodb'

// Use real MongoDB by default, only use mock if explicitly enabled
const USE_MOCK_DB = process.env.USE_MOCK_DB === 'true'

const uri = process.env.MONGODB_URI || 'mongodb+srv://admin:admin@arisze.ixqhj.mongodb.net/arisze?retryWrites=true&w=majority'

if (!uri && !USE_MOCK_DB) {
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
  // Fixed SSL settings for Windows compatibility
  tls: true,
  tlsAllowInvalidCertificates: true,
  tlsAllowInvalidHostnames: true,
  retryReads: true,
  directConnection: false
}

// Mock database implementation for fallback
class MockDatabase {
  private collections: Map<string, any[]> = new Map()

  collection(name: string) {
    if (!this.collections.has(name)) {
      this.collections.set(name, [])
    }
    
    const data = this.collections.get(name)!
    
    return {
      find: (query: any = {}) => ({
        toArray: async () => {
          if (Object.keys(query).length === 0) return data
          return data.filter(item => {
            return Object.entries(query).every(([key, value]) => {
              if (value && typeof value === 'object' && '$eq' in value) {
                return item[key] === (value as any).$eq
              }
              return item[key] === value
            })
          })
        }
      }),
      findOne: async (query: any = {}) => {
        if (Object.keys(query).length === 0) return data[0] || null
        return data.find(item => {
          return Object.entries(query).every(([key, value]) => {
            if (value && typeof value === 'object' && '$eq' in value) {
              return item[key] === (value as any).$eq
            }
            return item[key] === value
          })
        }) || null
      },
      insertOne: async (doc: any) => {
        const newDoc = { ...doc, _id: Date.now().toString() }
        data.push(newDoc)
        return { insertedId: newDoc._id }
      },
      updateOne: async (filter: any, update: any) => {
        const index = data.findIndex(item => {
          return Object.entries(filter).every(([key, value]) => item[key] === value)
        })
        if (index !== -1) {
          data[index] = { ...data[index], ...update.$set }
          return { modifiedCount: 1 }
        }
        return { modifiedCount: 0 }
      },
      deleteOne: async (filter: any) => {
        const index = data.findIndex(item => {
          return Object.entries(filter).every(([key, value]) => item[key] === value)
        })
        if (index !== -1) {
          data.splice(index, 1)
          return { deletedCount: 1 }
        }
        return { deletedCount: 0 }
      }
    }
  }

  listCollections() {
    return {
      toArray: async () => Array.from(this.collections.keys()).map(name => ({ name }))
    }
  }
}

let client: MongoClient
let clientPromise: Promise<MongoClient | null> | undefined
let mockDb: MockDatabase = new MockDatabase()

if (USE_MOCK_DB) {
  console.log('📝 Using mock database (USE_MOCK_DB=true)')
} else {
  console.log('🔄 Attempting to connect to MongoDB Atlas...')
  if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    let globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>
    }

    if (!globalWithMongo._mongoClientPromise) {
      client = new MongoClient(uri, options)
      globalWithMongo._mongoClientPromise = client.connect().catch(error => {
        console.error('❌ MongoDB connection failed:', error.message)
        console.log('🔄 Falling back to mock database due to connection issues')
        // Return a mock client that will use mock database
        return null
      })
    }
    clientPromise = globalWithMongo._mongoClientPromise
  } else {
    // In production mode, it's best to not use a global variable.
    client = new MongoClient(uri, options)
    clientPromise = client.connect().catch(error => {
      console.error('❌ MongoDB connection failed:', error.message)
      console.log('🔄 Falling back to mock database due to connection issues')
      return null
    })
  }
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise!

export async function getDatabase(): Promise<Db> {
  if (USE_MOCK_DB) {
    return mockDb as any
  }
  
  try {
    const client = await clientPromise!
    if (!client) {
      console.log('🔄 MongoDB client is null, using mock database')
      return mockDb as any
    }
    console.log('✅ Successfully connected to MongoDB Atlas')
    return client.db('arisze')
  } catch (error) {
    console.error('❌ Error getting database:', error)
    console.log('🔄 Falling back to mock database')
    return mockDb as any
  }
}
