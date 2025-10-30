/**
 * Express.js Middleware for NextAuth Session Verification
 * Verifies active session and extracts user ID
 */

const { getToken } = require('next-auth/jwt')

/**
 * Middleware to verify NextAuth session and attach user ID to request
 * Checks for session cookie or Authorization header token
 * Attaches user.uid as string to req.user
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function verifyNextAuthSession(req, res, next) {
  try {
    // Extract token from NextAuth session cookie or Authorization header
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === 'production'
    })
    
    // Check Authorization header as fallback
    let userId = null
    
    if (token) {
      // Session exists - extract user ID from token
      userId = token.sub || token.id || token.userId
      
      console.log('✅ NextAuth session found:', {
        email: token.email,
        userId: userId
      })
      
    } else if (req.headers.authorization) {
      // Check Authorization header for Bearer token
      const authHeader = req.headers.authorization
      
      if (authHeader.startsWith('Bearer ')) {
        const bearerToken = authHeader.substring(7)
        
        // Try to decode the token
        try {
          const decodedToken = await getToken({
            req: {
              headers: {
                cookie: `next-auth.session-token=${bearerToken}`
              }
            },
            secret: process.env.NEXTAUTH_SECRET
          })
          
          if (decodedToken) {
            userId = decodedToken.sub || decodedToken.id || decodedToken.userId
            console.log('✅ Authorization header token verified:', { userId })
          }
        } catch (error) {
          console.error('❌ Failed to decode Bearer token:', error.message)
        }
      }
    }
    
    // Verify user ID was found
    if (!userId) {
      console.warn('⚠️ No active session or valid token found')
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No active session found. Please log in.',
        code: 'NO_SESSION'
      })
    }
    
    // Convert user ID to string (ensure it's always a string)
    const userIdString = String(userId)
    
    // Attach user information to request object
    req.user = {
      uid: userIdString,
      email: token?.email || null,
      name: token?.name || null,
      image: token?.picture || token?.image || null
    }
    
    console.log(`✅ User authenticated: ${req.user.uid} (${req.user.email})`)
    
    // Continue to next middleware
    next()
    
  } catch (error) {
    console.error('❌ Session verification error:', error.message)
    
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to verify session',
      code: 'SESSION_VERIFICATION_FAILED'
    })
  }
}

/**
 * Optional: Middleware to check if user is authenticated (non-blocking)
 * Attaches user info if session exists, but doesn't block if not
 */
async function optionalAuth(req, res, next) {
  try {
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === 'production'
    })
    
    if (token) {
      const userId = token.sub || token.id || token.userId
      req.user = {
        uid: String(userId),
        email: token.email || null,
        name: token.name || null,
        image: token.picture || token.image || null
      }
      console.log(`✅ Optional auth: User ${req.user.uid} detected`)
    } else {
      req.user = null
      console.log('ℹ️ Optional auth: No session found (allowed)')
    }
    
    next()
    
  } catch (error) {
    console.error('⚠️ Optional auth error:', error.message)
    req.user = null
    next()
  }
}

/**
 * Example usage in Express app:
 * 
 * const express = require('express')
 * const { verifyNextAuthSession, optionalAuth } = require('./middleware/verifyNextAuthSession')
 * 
 * const app = express()
 * 
 * // Protected route - requires authentication
 * app.get('/api/protected', verifyNextAuthSession, (req, res) => {
 *   res.json({ 
 *     message: 'Protected data',
 *     userId: req.user.uid 
 *   })
 * })
 * 
 * // Public route with optional user info
 * app.get('/api/public', optionalAuth, (req, res) => {
 *   res.json({ 
 *     message: 'Public data',
 *     authenticated: !!req.user,
 *     userId: req.user?.uid || null
 *   })
 * })
 */

module.exports = {
  verifyNextAuthSession,
  optionalAuth
}
