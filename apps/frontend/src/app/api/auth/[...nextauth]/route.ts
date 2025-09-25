import NextAuth from 'next-auth'
import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              emailOrUsername: credentials.email,
              password: credentials.password,
            }),
          })

          if (!response.ok) return null

          const data = await response.json()
          
          if (data.access_token && data.user) {
            return {
              id: data.user.id,
              email: data.user.email,
              name: data.user.email,
              accessToken: data.access_token,
            }
          }

          return null
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = (user as any).accessToken
      }
      return token
    },
    async session({ session, token }) {
      if (token.accessToken) {
        (session as any).accessToken = token.accessToken
      }
      return session
    }
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-here',
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }