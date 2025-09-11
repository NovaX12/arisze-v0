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
      find: (query: any = {}) => {
        let filteredData = data
        if (Object.keys(query).length > 0) {
          filteredData = data.filter(item => {
            return Object.entries(query).every(([key, value]) => {
              if (value && typeof value === 'object' && '$eq' in value) {
                return item[key] === (value as any).$eq
              }
              return item[key] === value
            })
          })
        }
        
        return {
          sort: (sortQuery: any) => ({
            toArray: async () => {
              const sorted = [...filteredData]
              if (sortQuery) {
                const sortKey = Object.keys(sortQuery)[0]
                const sortOrder = sortQuery[sortKey]
                sorted.sort((a, b) => {
                  if (sortOrder === -1) {
                    return b[sortKey] > a[sortKey] ? 1 : -1
                  }
                  return a[sortKey] > b[sortKey] ? 1 : -1
                })
              }
              return sorted
            }
          }),
          toArray: async () => filteredData
        }
      },
      findOne: async (query: any = {}) => {
        if (name === 'users' && query.email) {
          console.log(`🔍 Mock DB: Searching for user with email: ${query.email}. Total users: ${data.length}`)
          console.log(`📋 Available users: ${data.map(u => u.email).join(', ')}`)
        }
        if (Object.keys(query).length === 0) return data[0] || null
        const result = data.find(item => {
          return Object.entries(query).every(([key, value]) => {
            if (value && typeof value === 'object' && '$eq' in value) {
              return item[key] === (value as any).$eq
            }
            return item[key] === value
          })
        }) || null
        if (name === 'users' && query.email) {
          console.log(`${result ? '✅' : '❌'} User ${query.email} ${result ? 'found' : 'not found'}`)
        }
        return result
      },
      insertOne: async (doc: any) => {
        const newDoc = { ...doc, _id: Date.now().toString() }
        data.push(newDoc)
        console.log(`📝 Mock DB: Inserted document into ${name} collection. Total items: ${data.length}`)
        if (name === 'users') {
          console.log(`👤 User added: ${newDoc.email} (ID: ${newDoc._id})`)
        }
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
let clientPromise: Promise<MongoClient | null>

// Global singleton for mock database to ensure persistence across requests
let globalWithMockDb = global as typeof globalThis & {
  _mockDb?: MockDatabase
  _mockDbInitialized?: boolean
}

if (!globalWithMockDb._mockDb) {
  globalWithMockDb._mockDb = new MockDatabase()
}

let mockDb: MockDatabase = globalWithMockDb._mockDb

// Add some sample data to mock database (only if not already initialized)
if ((USE_MOCK_DB || process.env.NODE_ENV === 'development') && !globalWithMockDb._mockDbInitialized) {
  // Add sample events
  const sampleEvents = [
    {
      _id: '1',
      title: 'Sample Event 1',
      description: 'This is a sample event for testing',
      date: new Date().toISOString(),
      location: 'Sample Location',
      isPublic: true,
      eventType: 'system',
      createdBy: 'system',
      createdAt: new Date().toISOString(),
      maxAttendees: 50,
      currentAttendees: 0
    },
    {
      _id: '2',
      title: 'Sample Event 2',
      description: 'Another sample event for testing',
      date: new Date(Date.now() + 86400000).toISOString(),
      location: 'Another Location',
      isPublic: true,
      eventType: 'user-generated',
      createdBy: 'user123',
      createdAt: new Date().toISOString(),
      maxAttendees: 30,
      currentAttendees: 5
    }
  ]
  
  // Initialize events collection with sample data
  const eventsCollection = mockDb.collection('events')
  sampleEvents.forEach(event => {
    eventsCollection.insertOne(event)
  })
  
  // Mark as initialized
  globalWithMockDb._mockDbInitialized = true
  console.log('📝 Mock database initialized with sample data')
}

if (USE_MOCK_DB) {
  console.log('📝 Using mock database (USE_MOCK_DB=true)')
  clientPromise = Promise.resolve(null)
} else {
  console.log('🔄 Attempting to connect to MongoDB Atlas...')
  if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    let globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient | null>
    }

    if (!globalWithMongo._mongoClientPromise) {
      client = new MongoClient(uri, options)
      globalWithMongo._mongoClientPromise = client.connect().catch(error => {
        console.error('❌ MongoDB connection failed:', error.message)
        console.log('🔄 Falling back to mock database due to connection issues')
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
export default clientPromise

// Legacy function for backward compatibility
export async function connectToDatabase(): Promise<{ db: Db }> {
  const db = await getDatabase()
  return { db }
}

export async function getDatabase(): Promise<Db> {
  if (USE_MOCK_DB) {
    return mockDb as any
  }
  
  try {
    const client = await clientPromise
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
