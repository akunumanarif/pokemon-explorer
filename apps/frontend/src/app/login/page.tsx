'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/auth-context'
import api from '@/lib/api'

export default function LoginPage() {
  const [credentials, setCredentials] = useState({
    emailOrUsername: '',
    password: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      console.log('Login attempt with:', credentials)
      console.log('API base URL:', api.defaults.baseURL)
      
      const response = await api.post('/auth/login', credentials)
      console.log('Login response:', response.data)
      
      const { accessToken, refreshToken } = response.data

      if (!accessToken) {
        throw new Error('No access token received')
      }

      // Store tokens using auth context
      login(accessToken, refreshToken)

      console.log('Tokens stored successfully:')
      console.log('- Access token:', accessToken.substring(0, 50) + '...')
      console.log('- Refresh token:', refreshToken)
      console.log('Redirecting to dashboard...')
      
      // Redirect to dashboard
      router.push('/dashboard')
    } catch (error: any) {
      console.error('Login error:', error)
      console.error('Error response:', error.response?.data)
      console.error('Full error object:', error)
      setError(error.response?.data?.message || error.message || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-center">
            Sign in to your Pokemon Explorer account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-destructive/15 border border-destructive text-destructive px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Email or Username</label>
              <Input
                type="text"
                placeholder="trainer@pokemon.com"
                value={credentials.emailOrUsername}
                onChange={(e) =>
                  setCredentials({
                    ...credentials,
                    emailOrUsername: e.target.value,
                  })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input
                type="password"
                placeholder="Enter your password"
                value={credentials.password}
                onChange={(e) =>
                  setCredentials({
                    ...credentials,
                    password: e.target.value,
                  })
                }
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
            
            {isLoading && (
              <div className="text-center text-sm text-muted-foreground">
                Please wait, processing login...
              </div>
            )}
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Don't have an account?</span>
            {' '}
            <Link href="/register" className="text-primary hover:underline">
              Sign up
            </Link>
          </div>

          <div className="mt-4 text-center">
            <Link href="/" className="text-sm text-muted-foreground hover:underline">
              ← Back to home
            </Link>
          </div>

          {/* Demo Accounts */}
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2">Demo Accounts:</p>
            <div className="text-xs text-muted-foreground space-y-1">
              <p><strong>Email:</strong> demo@pokemon.com</p>
              <p><strong>Password:</strong> password123</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}