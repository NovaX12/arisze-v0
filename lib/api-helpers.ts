import { NextRequest, NextResponse } from 'next/server';
import { firestoreDb } from './firebase';

/**
 * Wraps API route handlers with timeout protection and error handling
 * @param handler - The API route handler function
 * @param timeoutMs - Timeout in milliseconds (default: 25000ms = 25s, safe for Vercel free tier)
 */
export function withErrorHandling(
  handler: (request: NextRequest) => Promise<NextResponse>,
  timeoutMs: number = 25000
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const startTime = Date.now();
    const requestId = Math.random().toString(36).substring(7);
    const isDev = process.env.NODE_ENV === 'development';
    
    if (isDev) console.log(`🔵 [${requestId}] ${request.method} ${request.nextUrl.pathname} - Started`);
    
    try {
      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Request timeout after ${timeoutMs}ms`));
        }, timeoutMs);
      });

      // Ensure Firestore connection before proceeding
      if (isDev) console.log(`🔵 [${requestId}] Checking Firestore connection...`);
      await firestoreDb.collection('health_check').limit(1).get();
      if (isDev) console.log(`✅ [${requestId}] Firestore connected`);

      // Race handler against timeout
      const response = await Promise.race([
        handler(request),
        timeoutPromise
      ]);

      const duration = Date.now() - startTime;
      if (isDev) console.log(`✅ [${requestId}] Completed in ${duration}ms`);

      return response;

    } catch (error: any) {
      const duration = Date.now() - startTime;
      console.error(`❌ [${requestId}] Error after ${duration}ms:`, error.message);

      // Handle timeout errors
      if (error.message && error.message.includes('timeout')) {
        return NextResponse.json(
          { 
            error: 'Request timeout. Please try again.',
            duration,
            requestId
          },
          { status: 504 } // Gateway Timeout
        );
      }

      // ✅ FIX: Only return 503 for ACTUAL connection failures (GRPC/network errors)
      // Don't catch errors from routes that handle database errors internally
      if (error.code === 'UNAVAILABLE' || error.code === 'ECONNREFUSED' || error.code === 14) {
        return NextResponse.json(
          { 
            error: 'Database connection error. Please try again.',
            duration,
            requestId
          },
          { status: 503 } // Service Unavailable
        );
      }

      // Generic error - let route handlers manage their own error responses
      return NextResponse.json(
        { 
          error: error.message || 'Internal server error',
          timestamp: new Date().toISOString(),
          duration,
          requestId
        },
        { status: 500 }
      );
    }
  };
}

/**
 * Helper for POST requests with body parsing
 */
export function withPOSTHandler(
  handler: (request: NextRequest, body: any) => Promise<NextResponse>,
  timeoutMs?: number
) {
  return withErrorHandling(async (request: NextRequest) => {
    try {
      const body = await request.json();
      return await handler(request, body);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }
  }, timeoutMs);
}

/**
 * Helper for GET requests with query params
 */
export function withGETHandler(
  handler: (request: NextRequest, params: URLSearchParams) => Promise<NextResponse>,
  timeoutMs?: number
) {
  return withErrorHandling(async (request: NextRequest) => {
    const params = request.nextUrl.searchParams;
    return await handler(request, params);
  }, timeoutMs);
}
