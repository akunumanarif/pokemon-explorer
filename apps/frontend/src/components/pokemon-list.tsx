'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Pokemon, PokemonListResponse } from '@/types'
import { PokemonCard } from './pokemon-card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import api from '@/lib/api'
import { Search, Filter } from 'lucide-react'

export function PokemonList() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const limit = 20

  // Fetch Pokemon list
  const { data: pokemonData, isLoading, error } = useQuery({
    queryKey: ['pokemon', page, search, selectedType],
    queryFn: async (): Promise<PokemonListResponse> => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })
      
      if (search) params.append('search', search)
      if (selectedType) params.append('type', selectedType)
      
      const response = await api.get(`/pokemon?${params}`)
      return response.data
    },
  })

  // Fetch Pokemon types for filter
  const { data: typesData } = useQuery({
    queryKey: ['pokemon-types'],
    queryFn: async () => {
      const response = await api.get('/pokemon/types')
      return response.data
    },
  })

  const handleSearch = (searchTerm: string) => {
    setSearch(searchTerm)
    setPage(1)
  }

  const handleTypeFilter = (type: string) => {
    setSelectedType(type === selectedType ? '' : type)
    setPage(1)
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load Pokemon. Please try again.</p>
        <Button 
          onClick={() => window.location.reload()} 
          className="mt-4"
        >
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search Pokemon by name..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedType === '' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleTypeFilter('')}
          >
            All Types
          </Button>
          {typesData?.slice(0, 10).map((type: any) => (
            <Button
              key={type.name}
              variant={selectedType === type.name ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleTypeFilter(type.name)}
              className="capitalize"
            >
              {type.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square rounded-lg bg-muted"></div>
              <div className="mt-2 h-4 rounded bg-muted"></div>
              <div className="mt-1 h-3 w-2/3 rounded bg-muted"></div>
            </div>
          ))}
        </div>
      )}

      {/* Pokemon Grid */}
      {pokemonData && (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {pokemonData.data.map((pokemon: Pokemon) => (
              <PokemonCard key={pokemon.id} pokemon={pokemon} />
            ))}
          </div>

          {/* Pagination */}
          {pokemonData.meta.totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2">
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, pokemonData.meta.totalPages) }, (_, i) => {
                  const pageNum = page <= 3 ? i + 1 : page - 2 + i
                  if (pageNum > pokemonData.meta.totalPages) return null
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  )
                })}
              </div>
              
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.min(pokemonData.meta.totalPages, p + 1))}
                disabled={page === pokemonData.meta.totalPages}
              >
                Next
              </Button>
            </div>
          )}

          {/* Results Count */}
          <p className="text-center text-sm text-muted-foreground">
            Showing {pokemonData.data.length} of {pokemonData.meta.total} Pokemon
          </p>
        </>
      )}

      {/* No Results */}
      {pokemonData && pokemonData.data.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No Pokemon found matching your criteria.
          </p>
          <Button 
            onClick={() => {
              setSearch('')
              setSelectedType('')
              setPage(1)
            }} 
            className="mt-4"
            variant="outline"
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  )
}