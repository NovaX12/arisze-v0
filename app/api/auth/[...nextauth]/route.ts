import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { getDatabase } from '@/lib/mongodb'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        console.log('🔐 Authorization attempt for:', credentials?.email)
        
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Missing credentials')
          return null
        }

        try {
          // Connect to database and find user
          console.log('🔄 Connecting to database...')
          const db = await getDatabase()
          console.log('✅ Database connected, searching for user...')
          
          const user = await db.collection('users').findOne({ email: credentials.email })
          
          if (!user) {
            console.log('❌ User not found:', credentials.email)
            return null
          }

          console.log('✅ User found:', credentials.email, 'ID:', user._id)

          // Verify password
          const isValidPassword = await bcrypt.compare(credentials.password, user.password)
          
          if (!isValidPassword) {
            console.log('❌ Invalid password for user:', credentials.email)
            return null
          }

          console.log('✅ Password verified for user:', credentials.email)

          // Return user object without password
          const userResult = {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            image: user.avatar || null
          }
          
          console.log('✅ Authorization successful, returning user:', userResult)
          return userResult
        } catch (error) {
          console.error('❌ Authorization error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days - align with session
  },
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: false, // Set to true in production with HTTPS
        maxAge: 30 * 24 * 60 * 60 // 30 days
      }
    }
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      try {
        // Handle sign in
        if (user) {
          token.id = user.id
          token.email = user.email
          token.name = user.name
          console.log('JWT callback - user signed in:', { id: user.id, email: user.email })
        }
        
        // Handle token refresh or update
        if (trigger === 'update') {
          console.log('JWT callback - token updated')
        }
        
        return token
      } catch (error) {
        console.error('JWT callback error:', error)
        // Return minimal valid token structure
        return {
          id: user?.id || token?.id || '',
          email: user?.email || token?.email || '',
          name: user?.name || token?.name || ''
        }
      }
    },
    async session({ session, token }) {
      try {
        if (token && session.user) {
          session.user.id = token.id as string
          session.user.email = token.email as string
          session.user.name = token.name as string
          console.log('Session callback - session created:', { 
            userId: session.user.id, 
            email: session.user.email 
          })
        }
        return session
      } catch (error) {
        console.error('Session callback error:', error)
        // Return session with fallback values
        return {
          ...session,
          user: {
            id: token?.id as string || '',
            email: token?.email as string || '',
            name: token?.name as string || ''
          }
        }
      }
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET || 'arisze_super_secret_key_2024_development_only_change_in_production_12345',
  debug: process.env.NODE_ENV === 'development',
  
  // Add error handling for JWT decryption failures
  logger: {
    error(code, metadata) {
      if (code === 'JWT_SESSION_ERROR' || code === 'JWE_DECRYPTION_FAILED') {
        console.log('JWT/Session error detected, clearing invalid session')
        return // Suppress JWT errors to prevent login disruption
      }
      console.error('NextAuth Error:', code, metadata)
    },
    warn(code) {
      if (code !== 'NEXTAUTH_URL') {
        console.warn('NextAuth Warning:', code)
      }
    }
  },
   
  // Add error handling for JWT issues
  events: {
    async signOut() {
      console.log('User signed out - clearing session')
    },
    async session({ session }) {
      console.log('Session event - user active:', session?.user?.email)
    }
  }
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }