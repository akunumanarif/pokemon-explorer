'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { globalQueryClient } from '@/components/providers'

interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  login: (accessToken: string, refreshToken: string) => void
  logout: () => void
  checkAuth: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isClient, setIsClient] = useState(false)
  const router = useRouter()

  const checkAuth = () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token')
      setIsAuthenticated(!!token)
    }
    setIsLoading(false)
  }

  const login = (accessToken: string, refreshToken: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', accessToken)
      localStorage.setItem('refresh_token', refreshToken)
    }
    setIsAuthenticated(true)
    
    // Clear cache when logging in to ensure fresh data for new user
    globalQueryClient.clear()
  }

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    }
    setIsAuthenticated(false)
    
    // Clear all cached queries to prevent data leaking between users
    globalQueryClient.clear()
    
    router.push('/')
  }

  useEffect(() => {
    setIsClient(true)
    checkAuth()
    
    // Listen for storage changes (when user logs in/out in another tab)
    const handleStorageChange = () => {
      checkAuth()
    }
    
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange)
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorageChange)
      }
    }
  }, [])

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      isLoading, 
      login, 
      logout, 
      checkAuth 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}