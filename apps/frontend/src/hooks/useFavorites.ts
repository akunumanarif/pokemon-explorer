'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/auth-context';

interface Pokemon {
  id: number;
  name: string;
  imageUrl: string;
  types: string[];
}

interface Favorite {
  id: number;
  pokemonId: number;
  pokemon: Pokemon;
  createdAt: string;
}

/**
 * Custom hook for favorites management
 */
export function useFavorites() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Fetch favorites
  const { data: favorites = [], isLoading, error } = useQuery<Favorite[]>({
    queryKey: ['favorites'],
    queryFn: async () => {
      const response = await api.get('/favorites');
      return response.data?.data || [];
    },
    enabled: isAuthenticated,
  });

  // Check if Pokemon is favorited
  const checkFavorite = (pokemonId: number): boolean => {
    return favorites.some(fav => fav.pokemon.id === pokemonId);
  };

  // Add to favorites mutation
  const addToFavoritesMutation = useMutation({
    mutationFn: async (pokemonId: number) => {
      const response = await api.post(`/favorites/${pokemonId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
    },
    onError: (error: any) => {
      console.error('Error adding to favorites:', error);
    }
  });

  // Remove from favorites mutation  
  const removeFromFavoritesMutation = useMutation({
    mutationFn: async (pokemonId: number) => {
      await api.delete(`/favorites/${pokemonId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
    },
    onError: (error: any) => {
      console.error('Error removing from favorites:', error);
    }
  });

  // Toggle favorite (add if not favorited, remove if favorited)
  const toggleFavorite = (pokemonId: number) => {
    if (!isAuthenticated) {
      throw new Error('User must be authenticated to manage favorites');
    }

    const isFavorited = checkFavorite(pokemonId);
    
    if (isFavorited) {
      removeFromFavoritesMutation.mutate(pokemonId);
    } else {
      addToFavoritesMutation.mutate(pokemonId);
    }
  };

  return {
    favorites,
    isLoading,
    error,
    checkFavorite,
    toggleFavorite,
    addToFavorites: addToFavoritesMutation.mutate,
    removeFromFavorites: removeFromFavoritesMutation.mutate,
    isAddingToFavorites: addToFavoritesMutation.isPending,
    isRemovingFromFavorites: removeFromFavoritesMutation.isPending,
  };
}