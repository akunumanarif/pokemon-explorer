'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PokemonList } from '@/components/pokemon-list'
import api from '@/lib/api'
import { useAuth } from '@/contexts/auth-context'

interface User {
  id: string
  username: string
  email: string
}

interface Stats {
  totalFavorites: number
  totalTeams: number
  totalPokemonCaught: number
}

export default function DashboardPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [token, setToken] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)

  // Handle client-side hydration
  useEffect(() => {
    setIsClient(true)
    setToken(localStorage.getItem('access_token'))
  }, [])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (isClient && !authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isClient, authLoading, isAuthenticated, router])
  
  // Fetch user profile
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      if (!token) {
        router.push('/login')
        throw new Error('No token')
      }
      const response = await api.get('/auth/profile')
      return response.data
    },
    enabled: !!token,
  })

  // Fetch favorites with real-time updates
  const { data: favoritesData, isLoading: favoritesLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      if (!token) throw new Error('No token')
      const response = await api.get('/favorites')
      return response.data
    },
    enabled: !!token,
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
  })

  // Fetch teams
  const { data: teamsData, isLoading: teamsLoading } = useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      if (!token) throw new Error('No token')
      const response = await api.get('/teams')
      return response.data
    },
    enabled: !!token,
  })

  // Calculate stats from query data
  const stats = {
    totalFavorites: favoritesData?.data?.length || 0,
    totalTeams: teamsData?.data?.length || 0,
    totalPokemonCaught: favoritesData?.data?.length || 0, // Simplified
  }

  const isLoading = userLoading || favoritesLoading || teamsLoading

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    router.push('/')
  }

  // Show loading during hydration
  if (!isClient || authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  // If not authenticated after loading, this will be handled by useEffect redirect
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-xl font-bold text-primary">
                Pokemon Explorer
              </Link>
              <div className="hidden md:flex space-x-4">
                <Link href="/dashboard" className="text-muted-foreground hover:text-primary">
                  Dashboard
                </Link>
                <Link href="/favorites" className="text-muted-foreground hover:text-primary">
                  Favorites
                </Link>
                <Link href="/teams" className="text-muted-foreground hover:text-primary">
                  Teams
                </Link>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                Welcome, {user?.username}!
              </span>
              <Button onClick={handleLogout} variant="outline" size="sm">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user?.username}!
          </h1>
          <p className="text-muted-foreground">
            Ready to explore the world of Pokemon?
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Favorite Pokemon</CardTitle>
              <CardDescription>Pokemon you've favorited</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {favoritesLoading ? (
                  <div className="animate-pulse bg-gray-200 h-8 w-8 rounded"></div>
                ) : (
                  stats.totalFavorites
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Teams Created</CardTitle>
              <CardDescription>Battle teams you've built</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {teamsLoading ? (
                  <div className="animate-pulse bg-gray-200 h-8 w-8 rounded"></div>
                ) : (
                  stats.totalTeams
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Pokemon Discovered</CardTitle>
              <CardDescription>Your collection progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {favoritesLoading ? (
                  <div className="animate-pulse bg-gray-200 h-8 w-8 rounded"></div>
                ) : (
                  stats.totalPokemonCaught
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <Link href="/favorites" className="block">
                <div className="text-center">
                  <div className="text-3xl mb-2">⭐</div>
                  <h3 className="font-semibold">View Favorites</h3>
                  <p className="text-sm text-muted-foreground">
                    See all your favorite Pokemon
                  </p>
                </div>
              </Link>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <Link href="/teams" className="block">
                <div className="text-center">
                  <div className="text-3xl mb-2">👥</div>
                  <h3 className="font-semibold">Manage Teams</h3>
                  <p className="text-sm text-muted-foreground">
                    Create and edit battle teams
                  </p>
                </div>
              </Link>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-3xl mb-2">🔍</div>
                <h3 className="font-semibold">Explore Pokemon</h3>
                <p className="text-sm text-muted-foreground">
                  Discover new Pokemon below
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pokemon Explorer */}
        <Card>
          <CardHeader>
            <CardTitle>Explore Pokemon</CardTitle>
            <CardDescription>
              Search and discover Pokemon from all generations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList>
                <TabsTrigger value="all">All Pokemon</TabsTrigger>
                <TabsTrigger value="favorites">My Favorites</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="mt-6">
                <PokemonList />
              </TabsContent>
              <TabsContent value="favorites" className="mt-6">
                <PokemonList />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}