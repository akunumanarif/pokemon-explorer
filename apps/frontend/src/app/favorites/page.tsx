'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Heart, Trash2 } from 'lucide-react'
import api from '@/lib/api'
import { useAuth } from '@/contexts/auth-context'

interface Pokemon {
  id: number
  name: string
  imageUrl: string
  types: string[]
}

interface Favorite {
  id: number
  pokemonId: number
  pokemon: Pokemon
  createdAt: string
}

export default function FavoritesPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
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

  // Fetch favorites with React Query
  const { data: favoritesResponse, isLoading, error } = useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      if (!token) {
        router.push('/login')
        throw new Error('No token')
      }
      const response = await api.get('/favorites')
      return response.data
    },
    enabled: !!token,
  })

  // Extract favorites array from response
  const favorites = favoritesResponse?.data || []

  // Remove favorite mutation
  const removeFavoriteMutation = useMutation({
    mutationFn: async (pokemonId: number) => {
      await api.delete(`/favorites/${pokemonId}`)
    },
    onSuccess: () => {
      // Invalidate queries to refresh data everywhere
      queryClient.invalidateQueries({ queryKey: ['favorites'] })
      queryClient.invalidateQueries({ queryKey: ['user-profile'] })
    },
    onError: (error: any) => {
      console.error('Error removing favorite:', error)
      alert('Failed to remove from favorites')
    }
  })

  if (!isClient || authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
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
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Favorites</h1>
            <p className="text-muted-foreground">
              Your favorite Pokemon collection
            </p>
          </div>
          <Button onClick={() => router.push('/')} variant="outline">
            Back to Explore
          </Button>
        </div>

        {error && (
          <div className="bg-destructive/15 border border-destructive text-destructive px-4 py-3 rounded mb-6">
            {error.message || 'Failed to load favorites'}
          </div>
        )}

        {!Array.isArray(favorites) || favorites.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <Heart className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">No favorites yet</h2>
              <p className="text-muted-foreground mb-4">
                Start exploring and add Pokemon to your favorites!
              </p>
              <Button onClick={() => router.push('/')}>
                Explore Pokemon
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {favorites.map((favorite) => (
              <Card key={favorite.id} className="group hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg capitalize">
                      {favorite.pokemon.name}
                    </CardTitle>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFavoriteMutation.mutate(favorite.pokemonId)}
                      disabled={removeFavoriteMutation.isPending}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                    >
                      {removeFavoriteMutation.isPending ? (
                        <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="aspect-square mb-4 flex items-center justify-center bg-muted rounded-lg">
                    <img
                      src={favorite.pokemon.imageUrl}
                      alt={favorite.pokemon.name}
                      className="w-32 h-32 object-contain"
                    />
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(() => {
                      let types = favorite.pokemon.types;
                      if (typeof types === 'string') {
                        try {
                          types = JSON.parse(types);
                        } catch {
                          types = [];
                        }
                      }
                      return Array.isArray(types) && types.map((type, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary"
                        >
                          {type}
                        </span>
                      ));
                    })()}
                  </div>
                  <CardDescription className="text-xs mt-2">
                    Added {new Date(favorite.createdAt).toLocaleDateString()}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}