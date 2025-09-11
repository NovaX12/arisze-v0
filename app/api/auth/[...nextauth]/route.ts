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
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Connect to database and find user
          const db = await getDatabase()
          const user = await db.collection('users').findOne({ email: credentials.email })
          
          if (!user) {
            console.log('User not found:', credentials.email)
            return null
          }

          // Verify password
          const isValidPassword = await bcrypt.compare(credentials.password, user.password)
          
          if (!isValidPassword) {
            console.log('Invalid password for user:', credentials.email)
            return null
          }

          // Return user object without password
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            image: user.avatar || null
          }
        } catch (error) {
          console.error('Authorization error:', error)
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
    maxAge: 2 * 60 * 60, // 2 hours - force quick expiration of old tokens
  },
  callbacks: {
    async jwt({ token, user }) {
      try {
        if (user) {
          token.id = user.id
          console.log('JWT callback - user found:', { id: user.id, email: user.email })
        }
        return token
      } catch (error) {
        console.error('JWT callback error:', error)
        // Return a clean token to avoid JWT issues
        return user ? { id: user.id, email: user.email, name: user.name } : token
      }
    },
    async session({ session, token }) {
      try {
        if (session.user && token.id) {
          session.user.id = token.id as string
          console.log('Session callback - session created:', { 
            userId: session.user.id, 
            email: session.user.email 
          })
        }
        return session
      } catch (error) {
        console.error('Session callback error:', error)
        return session
      }
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET || 'arisze_super_secret_key_2024_development_only_change_in_production_12345',
  debug: false, // Disable debug to reduce logs
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }