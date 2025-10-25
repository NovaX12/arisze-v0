// Database query helpers with built-in error handling and null checks
import { getDatabase } from './mongodb'
import { ObjectId, Document } from 'mongodb'

/**
 * Safe database query wrapper that handles errors gracefully
 * @param operation - Database operation function
 * @param errorMessage - Custom error message
 * @returns Result or throws descriptive error
 */
export async function safeDatabaseQuery<T>(
  operation: () => Promise<T>,
  errorMessage: string = 'Database query failed'
): Promise<T> {
  try {
    const result = await operation()
    if (result === null || result === undefined) {
      console.warn(`⚠️ ${errorMessage}: Result is null/undefined`)
    }
    return result
  } catch (error) {
    console.error(`❌ ${errorMessage}:`, error)
    throw new Error(`${errorMessage}: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Get database with connection verification
 */
export async function getVerifiedDatabase() {
  try {
    const db = await getDatabase()
    if (!db) {
      throw new Error('Database instance is null')
    }
    return db
  } catch (error) {
    console.error('❌ Failed to get verified database:', error)
    throw error
  }
}

/**
 * Safe find one with null checks
 */
export async function safeFindOne(
  collectionName: string,
  query: any
): Promise<Document | null> {
  return safeDatabaseQuery(async () => {
    const db = await getVerifiedDatabase()
    const result = await db.collection(collectionName).findOne(query)
    return result
  }, `Failed to find document in ${collectionName}`)
}

/**
 * Safe find many with null checks
 */
export async function safeFindMany(
  collectionName: string,
  query: any = {},
  options?: any
): Promise<Document[]> {
  return safeDatabaseQuery(async () => {
    const db = await getVerifiedDatabase()
    const results = await db.collection(collectionName).find(query, options).toArray()
    return results || []
  }, `Failed to find documents in ${collectionName}`)
}

/**
 * Safe insert one with verification
 */
export async function safeInsertOne(
  collectionName: string,
  document: any
): Promise<{ insertedId: ObjectId }> {
  return safeDatabaseQuery(async () => {
    const db = await getVerifiedDatabase()
    const result = await db.collection(collectionName).insertOne(document)
    if (!result.insertedId) {
      throw new Error('Insert operation did not return an ID')
    }
    return { insertedId: result.insertedId }
  }, `Failed to insert document into ${collectionName}`)
}

/**
 * Safe update one with verification
 */
export async function safeUpdateOne(
  collectionName: string,
  filter: any,
  update: any
): Promise<{ modifiedCount: number; matchedCount: number }> {
  return safeDatabaseQuery(async () => {
    const db = await getVerifiedDatabase()
    const result = await db.collection(collectionName).updateOne(filter, update)
    return {
      modifiedCount: result.modifiedCount,
      matchedCount: result.matchedCount
    }
  }, `Failed to update document in ${collectionName}`)
}

/**
 * Safe delete one with verification
 */
export async function safeDeleteOne(
  collectionName: string,
  filter: any
): Promise<{ deletedCount: number }> {
  return safeDatabaseQuery(async () => {
    const db = await getVerifiedDatabase()
    const result = await db.collection(collectionName).deleteOne(filter)
    return { deletedCount: result.deletedCount }
  }, `Failed to delete document from ${collectionName}`)
}

/**
 * Check if MongoDB is connected and responding
 */
export async function isDatabaseConnected(): Promise<boolean> {
  try {
    const db = await getDatabase()
    await db.admin().ping()
    return true
  } catch (error) {
    console.error('❌ Database connection check failed:', error)
    return false
  }
}
