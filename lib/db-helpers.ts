// Database query helpers with built-in error handling and null checks
import { firestoreDb } from './firebase'

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
    // Test Firestore connection
    await firestoreDb.collection('health_check').limit(1).get()
    return firestoreDb
  } catch (error) {
    console.error('❌ Failed to verify Firestore connection:', error)
    throw error
  }
}

/**
 * Safe find one document by ID
 */
export async function safeFindOne(
  collectionName: string,
  docId: string
): Promise<any | null> {
  return safeDatabaseQuery(async () => {
    const db = await getVerifiedDatabase()
    const docRef = await db.collection(collectionName).doc(docId).get()
    if (!docRef.exists) {
      return null
    }
    return { id: docRef.id, ...docRef.data() }
  }, `Failed to find document in ${collectionName}`)
}

/**
 * Safe find many with query
 */
export async function safeFindMany(
  collectionName: string,
  whereClause?: { field: string; operator: any; value: any },
  options?: { limit?: number; orderBy?: { field: string; direction: 'asc' | 'desc' } }
): Promise<any[]> {
  return safeDatabaseQuery(async () => {
    const db = await getVerifiedDatabase()
    let query: any = db.collection(collectionName)
    
    // Apply where clause if provided
    if (whereClause) {
      query = query.where(whereClause.field, whereClause.operator, whereClause.value)
    }
    
    // Apply orderBy if provided
    if (options?.orderBy) {
      query = query.orderBy(options.orderBy.field, options.orderBy.direction)
    }
    
    // Apply limit if provided
    if (options?.limit) {
      query = query.limit(options.limit)
    }
    
    const snapshot = await query.get()
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }))
  }, `Failed to find documents in ${collectionName}`)
}

/**
 * Safe insert one with verification
 */
export async function safeInsertOne(
  collectionName: string,
  document: any
): Promise<{ insertedId: string }> {
  return safeDatabaseQuery(async () => {
    const db = await getVerifiedDatabase()
    const docRef = await db.collection(collectionName).add(document)
    if (!docRef.id) {
      throw new Error('Insert operation did not return an ID')
    }
    return { insertedId: docRef.id }
  }, `Failed to insert document into ${collectionName}`)
}

/**
 * Safe update one with verification
 */
export async function safeUpdateOne(
  collectionName: string,
  docId: string,
  update: any
): Promise<{ modifiedCount: number; matchedCount: number }> {
  return safeDatabaseQuery(async () => {
    const db = await getVerifiedDatabase()
    const docRef = db.collection(collectionName).doc(docId)
    const docSnapshot = await docRef.get()
    
    if (!docSnapshot.exists) {
      return { modifiedCount: 0, matchedCount: 0 }
    }
    
    await docRef.update(update)
    return { modifiedCount: 1, matchedCount: 1 }
  }, `Failed to update document in ${collectionName}`)
}

/**
 * Safe delete one with verification
 */
export async function safeDeleteOne(
  collectionName: string,
  docId: string
): Promise<{ deletedCount: number }> {
  return safeDatabaseQuery(async () => {
    const db = await getVerifiedDatabase()
    const docRef = db.collection(collectionName).doc(docId)
    const docSnapshot = await docRef.get()
    
    if (!docSnapshot.exists) {
      return { deletedCount: 0 }
    }
    
    await docRef.delete()
    return { deletedCount: 1 }
  }, `Failed to delete document from ${collectionName}`)
}

/**
 * Check if Firestore is connected and responding
 */
export async function isDatabaseConnected(): Promise<boolean> {
  try {
    await firestoreDb.collection('health_check').limit(1).get()
    return true
  } catch (error) {
    console.error('❌ Database connection check failed:', error)
    return false
  }
}
