'use client'

import Link from 'next/link'
import { Button } from './ui/button'
import { User, Heart, Users, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { useClientSide } from '@/hooks'

export function Navbar() {
  const { isAuthenticated, isLoading, logout } = useAuth()
  const isClient = useClientSide()
  
  // Prevent hydration mismatch by not rendering auth-dependent content until client-side
  if (!isClient) {
    return (
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center px-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              ⚡
            </div>
            <span className="hidden font-bold sm:inline-block">
              Pokemon Explorer
            </span>
          </Link>
          <div className="flex-1" />
          {/* Placeholder for hydration */}
          <div className="h-8 w-32 animate-pulse bg-muted rounded"></div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            ⚡
          </div>
          <span className="hidden font-bold sm:inline-block">
            Pokemon Explorer
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="ml-auto hidden md:flex space-x-6">
          <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
            Explore
          </Link>
          <Link href="/teams/public" className="text-sm font-medium transition-colors hover:text-primary">
            Public Teams
          </Link>
        </div>

        {/* User Actions */}
        <div className="flex items-center space-x-4">
          {isLoading ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-muted"></div>
          ) : isAuthenticated ? (
            <>
              <Link href="/favorites">
                <Button variant="ghost" size="icon" title="My Favorites">
                  <Heart className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/teams">
                <Button variant="ghost" size="icon" title="My Teams">
                  <Users className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="ghost" size="icon" title="Dashboard">
                  <User className="h-4 w-4" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
                <span className="ml-1 hidden sm:inline">Sign Out</span>
              </Button>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}