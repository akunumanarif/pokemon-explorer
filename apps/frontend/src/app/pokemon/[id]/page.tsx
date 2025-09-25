'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { ArrowLeft, Heart, Plus, Home, Search, Users } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

interface Pokemon {
  id: number;
  name: string;
  sprite: string;
  types: string[];
  height: number;
  weight: number;
  stats: {
    hp: number;
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
  };
  abilities: string[];
}

interface PokemonDetail {
  id: number;
  name: string;
  imageUrl: string;
  types: string; // JSON string from backend
  height: number;
  weight: number;
  stats: string; // JSON string from backend
  abilities: string; // JSON string from backend
}

export default function PokemonDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const pokemonId = parseInt(params.id);

  // Fetch Pokemon detail
  const { data: pokemon, isLoading } = useQuery<PokemonDetail>({
    queryKey: ['pokemon', pokemonId],
    queryFn: async () => {
      const response = await api.get(`/pokemon/${pokemonId}`);
      return response.data;
    }
  });

  // Parse JSON data from backend
  const parsedPokemon = pokemon ? {
    ...pokemon,
    types: JSON.parse(pokemon.types) as string[],
    stats: Object.entries(JSON.parse(pokemon.stats) as Record<string, number>).map(([name, value]) => ({
      name,
      value
    })),
    abilities: JSON.parse(pokemon.abilities).abilities?.map((a: any) => a.ability.name) || []
  } : null;

  // Check if Pokemon is favorited
  const { data: isFavorited } = useQuery<boolean>({
    queryKey: ['favorite-check', pokemonId],
    queryFn: async () => {
      if (!isAuthenticated) return false;
      try {
        const response = await api.get(`/favorites/check/${pokemonId}`);
        return response.data.isFavorited;
      } catch (error) {
        return false;
      }
    },
    enabled: !!isAuthenticated
  });

  // Add to favorites mutation
  const addToFavoritesMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post(`/favorites/${pokemonId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorite-check', pokemonId] });
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
    }
  });

  // Remove from favorites mutation
  const removeFromFavoritesMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/favorites/${pokemonId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorite-check', pokemonId] });
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
    }
  });

  const handleFavoriteToggle = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (isFavorited) {
      removeFromFavoritesMutation.mutate();
    } else {
      addToFavoritesMutation.mutate();
    }
  };

  const getStatColor = (statName: string) => {
    const colors: { [key: string]: string } = {
      hp: 'bg-green-500',
      attack: 'bg-red-500',
      defense: 'bg-blue-500',
      'special-attack': 'bg-purple-500',
      'special-defense': 'bg-yellow-500',
      speed: 'bg-pink-500'
    };
    return colors[statName] || 'bg-gray-500';
  };

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
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
      fairy: 'bg-pink-300'
    };
    return colors[type.toLowerCase()] || 'bg-gray-400';
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-96 bg-gray-200 rounded mb-4"></div>
        </div>
      </div>
    );
  }

  if (!parsedPokemon) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Pokémon not found</h1>
          <Button onClick={() => router.push('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Explore
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Navigation Header */}
      <div className="flex items-center justify-between mb-6 p-4 bg-card rounded-lg border">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Dashboard
          </Button>
          <div className="h-4 w-px bg-border"></div>
          <Button 
            variant="ghost" 
            onClick={() => router.push('/')}
            className="flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            Explore Pokémon
          </Button>
          <div className="h-4 w-px bg-border"></div>
          <Button 
            variant="ghost" 
            onClick={() => router.push('/teams')}
            className="flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            Teams
          </Button>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Pokémon Details</span>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        
        {isAuthenticated && (
          <Button
            onClick={handleFavoriteToggle}
            disabled={addToFavoritesMutation.isPending || removeFromFavoritesMutation.isPending}
            className={`flex items-center gap-2 ${
              isFavorited 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-white hover:bg-gray-50 text-gray-700 border'
            }`}
          >
            {isFavorited ? (
              <>
                <Heart className="w-4 h-4 fill-current" />
                Remove from Favorites
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Add to Favorites
              </>
            )}
          </Button>
        )}
      </div>

      {/* Pokemon Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Left Column - Image and Basic Info */}
        <Card>
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <img 
                src={parsedPokemon.imageUrl} 
                alt={parsedPokemon.name}
                className="w-48 h-48 mx-auto mb-4"
              />
              <h1 className="text-3xl font-bold capitalize mb-2">{parsedPokemon.name}</h1>
              <div className="flex justify-center gap-2 mb-4">
                {parsedPokemon.types.map((type: string) => (
                  <Badge 
                    key={type} 
                    className={`${getTypeColor(type)} text-white`}
                  >
                    {type}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Height</p>
                <p className="text-lg font-semibold">{parsedPokemon.height / 10} m</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Weight</p>
                <p className="text-lg font-semibold">{parsedPokemon.weight / 10} kg</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Column - Stats and Abilities */}
        <div className="space-y-6">
          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Base Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {parsedPokemon.stats.map((stat: { name: string; value: number }) => (
                  <div key={stat.name}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium capitalize">
                        {stat.name.replace('-', ' ')}
                      </span>
                      <span className="text-sm font-bold">{stat.value}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getStatColor(stat.name)}`}
                        style={{ width: `${Math.min((stat.value / 255) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Abilities */}
          <Card>
            <CardHeader>
              <CardTitle>Abilities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {parsedPokemon.abilities.map((ability: string) => (
                  <Badge key={ability} variant="outline" className="capitalize">
                    {ability.replace('-', ' ')}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}