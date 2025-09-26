'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface Pokemon {
  id: number;
  name: string;
  imageUrl: string;
  types: string;
  height: number;
  weight: number;
  stats: string;
  abilities: string;
}

interface PokemonListParams {
  page?: number;
  limit?: number;
  type?: string;
  search?: string;
}

interface PokemonListResponse {
  data: Pokemon[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Custom hook for Pokemon data fetching
 */
export function usePokemon() {
  // Get Pokemon list with filters
  const usePokemonList = (params: PokemonListParams = {}) => {
    const { page = 1, limit = 20, type, search } = params;
    
    return useQuery<PokemonListResponse>({
      queryKey: ['pokemon-list', page, limit, type, search],
      queryFn: async () => {
        const searchParams = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          ...(type && { type }),
          ...(search && { search }),
        });
        
        const response = await api.get(`/pokemon?${searchParams}`);
        return response.data;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  // Get Pokemon by ID
  const usePokemonById = (id: number) => {
    return useQuery<Pokemon>({
      queryKey: ['pokemon', id],
      queryFn: async () => {
        const response = await api.get(`/pokemon/${id}`);
        return response.data;
      },
      staleTime: 10 * 60 * 1000, // 10 minutes
      enabled: !!id,
    });
  };

  // Search Pokemon
  const usePokemonSearch = (searchTerm: string) => {
    return useQuery({
      queryKey: ['pokemon-search', searchTerm],
      queryFn: async () => {
        if (!searchTerm || searchTerm.length < 2) return [];
        const response = await api.get(`/pokemon/search?query=${encodeURIComponent(searchTerm)}&limit=20`);
        return response.data;
      },
      enabled: searchTerm.length >= 2,
      staleTime: 2 * 60 * 1000, // 2 minutes
    });
  };

  // Get Pokemon types
  const usePokemonTypes = () => {
    return useQuery({
      queryKey: ['pokemon-types'],
      queryFn: async () => {
        const response = await api.get('/pokemon/types');
        return response.data;
      },
      staleTime: 30 * 60 * 1000, // 30 minutes (types don't change often)
    });
  };

  // Parse Pokemon data (convert JSON strings to objects)
  const parsePokemonData = (pokemon: Pokemon) => {
    if (!pokemon) return null;

    try {
      return {
        ...pokemon,
        types: JSON.parse(pokemon.types) as string[],
        stats: Object.entries(JSON.parse(pokemon.stats) as Record<string, number>).map(([name, value]) => ({
          name,
          value
        })),
        abilities: JSON.parse(pokemon.abilities).abilities?.map((a: any) => a.ability.name) || []
      };
    } catch (error) {
      console.warn('Error parsing Pokemon data:', error);
      return null;
    }
  };

  return {
    usePokemonList,
    usePokemonById,
    usePokemonSearch,
    usePokemonTypes,
    parsePokemonData,
  };
}