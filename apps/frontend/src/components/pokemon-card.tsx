'use client'

import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Pokemon } from '@/types'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Heart, Plus } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import api from '@/lib/api'

interface PokemonCardProps {
  pokemon: Pokemon
}

export function PokemonCard({ pokemon }: PokemonCardProps) {
  const [isFavorited, setIsFavorited] = useState(false)
  const [isCheckingFavorite, setIsCheckingFavorite] = useState(true)
  const [isClient, setIsClient] = useState(false)
  const queryClient = useQueryClient()

  // Check if Pokemon is already favorited
  useEffect(() => {
    setIsClient(true)
    
    const checkFavoriteStatus = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
        if (token) {
          const response = await api.get(`/favorites/check/${pokemon.id}`)
          setIsFavorited(response.data.isFavorited)
        }
      } catch (error) {
        console.error('Error checking favorite status:', error)
      } finally {
        setIsCheckingFavorite(false)
      }
    }
    
    checkFavoriteStatus()
  }, [pokemon.id])

  // Add to favorites mutation (only for adding, not removing)
  const favoriteMutation = useMutation({
    mutationFn: async (pokemonId: number) => {
      console.log(`Attempting to add Pokemon ${pokemonId} to favorites`)
      
      const token = localStorage.getItem('access_token')
      if (!token) {
        throw new Error('Not authenticated')
      }

      const response = await api.post(`/favorites/${pokemonId}`)
      console.log('Add favorite response:', response.data)
      return response.data
    },
    onSuccess: (data) => {
      console.log('Favorite added successfully:', data)
      setIsFavorited(true)
      
      // Invalidate both favorites and user profile queries to refresh dashboard
      queryClient.invalidateQueries({ queryKey: ['favorites'] })
      queryClient.invalidateQueries({ queryKey: ['user-profile'] })
      
      // Show success message
      alert('Pokemon added to favorites! ❤️')
    },
    onError: (error: any) => {
      console.error('Failed to add favorite:', error)
      console.error('Error response:', error.response?.data)
      
      // Show user-friendly error message
      if (error.response?.status === 409) {
        alert('This Pokemon is already in your favorites!')
        setIsFavorited(true) // Update local state to match server
      } else {
        alert(`Failed to add to favorites: ${error.response?.data?.message || error.message}`)
      }
    }
  })

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      normal: 'bg-gray-400',
      fire: 'bg-red-500',
      water: 'bg-blue-500',
      electric: 'bg-yellow-400',
      grass: 'bg-green-500',
      ice: 'bg-blue-200',
      fighting: 'bg-red-700',
      poison: 'bg-purple-500',
      ground: 'bg-yellow-600',
      flying: 'bg-indigo-400',
      psychic: 'bg-pink-500',
      bug: 'bg-green-400',
      rock: 'bg-yellow-800',
      ghost: 'bg-purple-700',
      dragon: 'bg-indigo-700',
      dark: 'bg-gray-800',
      steel: 'bg-gray-500',
      fairy: 'bg-pink-300',
    }
    return colors[type] || 'bg-gray-400'
  }

  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-lg hover:scale-105">
      <CardContent className="p-0">
        {/* Image Section */}
        <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100">
          <Image
            src={pokemon.imageUrl}
            alt={pokemon.name}
            fill
            className="object-contain p-4"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          
          {/* Favorite Status Indicator */}
          {isFavorited && (
            <div className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1">
              <Heart className="h-3 w-3 fill-current" />
            </div>
          )}

          {/* Pokemon ID */}
          <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
            #{pokemon.id.toString().padStart(3, '0')}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4">
          <h3 className="font-semibold text-lg capitalize mb-2">
            {pokemon.name}
          </h3>
          
          {/* Types */}
          <div className="flex gap-1 mb-3">
            {(() => {
              let types = pokemon.types;
              if (typeof types === 'string') {
                try {
                  types = JSON.parse(types);
                } catch {
                  types = [];
                }
              }
              return Array.isArray(types) && types.map((type) => (
                <span
                  key={type}
                  className={`px-2 py-1 rounded-full text-xs font-medium text-white capitalize ${getTypeColor(type)}`}
                >
                  {type}
                </span>
              ));
            })()}
          </div>

          {/* Stats Preview */}
          {(() => {
            let stats: any = pokemon.stats;
            if (typeof stats === 'string') {
              try {
                stats = JSON.parse(stats);
              } catch {
                return null;
              }
            }
            return stats && typeof stats === 'object' && (
              <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground mb-3">
                <div className="text-center">
                  <div className="font-semibold">{stats.hp || 0}</div>
                  <div>HP</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold">{stats.attack || 0}</div>
                  <div>ATK</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold">{stats.defense || 0}</div>
                  <div>DEF</div>
                </div>
              </div>
            );
          })()}

          {/* Actions */}
          <div className="flex gap-2">
            <Link href={`/pokemon/${pokemon.id}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full">
                View Details
              </Button>
            </Link>
            <Button 
              size="sm" 
              className="px-3"
              onClick={(e) => {
                e.preventDefault()
                if (isFavorited) {
                  // Already favorited, redirect to favorites page
                  window.location.href = '/favorites'
                } else {
                  // Add to favorites
                  favoriteMutation.mutate(pokemon.id)
                }
              }}
              disabled={favoriteMutation.isPending || isCheckingFavorite}
              variant={isFavorited ? "secondary" : "default"}
              title={isFavorited ? "View in Favorites" : "Add to Favorites"}
            >
              {favoriteMutation.isPending ? (
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              ) : isFavorited ? (
                <Heart className="h-4 w-4 fill-current" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}