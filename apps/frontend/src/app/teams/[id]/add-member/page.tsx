'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { ArrowLeft, Search, Plus, Home, Users } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useEffect } from 'react';

interface Pokemon {
  id: number;
  name: string;
  sprite: string;
  types: string[];
}

interface SearchResult {
  id: number;
  name: string;
  sprite: string;
  types: string[];
}

export default function AddTeamMemberPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const teamId = parseInt(params.id);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPokemon, setSelectedPokemon] = useState<SearchResult | null>(null);

  // Search Pokemon
  const { data: searchResults, isLoading: isSearching } = useQuery<SearchResult[]>({
    queryKey: ['pokemon-search', searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 2) return [];
      const response = await api.get(`/pokemon/search?query=${encodeURIComponent(searchTerm)}&limit=20`);
      return response.data;
    },
    enabled: searchTerm.length >= 2
  });

  // Add team member mutation
  const addMemberMutation = useMutation({
    mutationFn: async (pokemonId: number) => {
      const response = await api.post(`/teams/${teamId}/members`, { pokemonId });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team', teamId] });
      router.push(`/teams/${teamId}`);
    }
  });

  const handleAddMember = (pokemon: SearchResult) => {
    if (window.confirm(`Add ${pokemon.name} to your team?`)) {
      addMemberMutation.mutate(pokemon.id);
    }
  };

  // Show loading during auth check
  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
        </div>
      </div>
    );
  }

  // If not authenticated after loading, this will be handled by useEffect redirect
  if (!isAuthenticated) {
    return null;
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
          <div className="h-4 w-px bg-border"></div>
          <Button 
            variant="ghost" 
            onClick={() => router.push(`/teams/${teamId}`)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Team
          </Button>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Add Team Member</span>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button 
          variant="ghost" 
          onClick={() => router.push(`/teams/${teamId}`)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Team
        </Button>
        
        <h1 className="text-2xl font-bold">Add Pokémon to Team</h1>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search Pokémon
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            type="text"
            placeholder="Search for Pokémon by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
          <p className="text-sm text-muted-foreground mt-2">
            Type at least 2 characters to search
          </p>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchTerm.length >= 2 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Search Results</h2>
          
          {isSearching ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : searchResults && searchResults.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {searchResults.map((pokemon) => (
                <Card key={pokemon.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <img 
                        src={pokemon.sprite} 
                        alt={pokemon.name}
                        className="w-24 h-24 mx-auto mb-3"
                      />
                      
                      <h3 className="font-medium capitalize mb-2">
                        {pokemon.name}
                      </h3>
                      
                      <div className="flex flex-wrap gap-1 justify-center mb-3">
                        {pokemon.types.map((type) => (
                          <Badge 
                            key={type} 
                            variant="secondary" 
                            className="text-xs"
                          >
                            {type}
                          </Badge>
                        ))}
                      </div>
                      
                      <Button
                        onClick={() => handleAddMember(pokemon)}
                        disabled={addMemberMutation.isPending}
                        className="w-full"
                        size="sm"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add to Team
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : searchTerm.length >= 2 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">
                  No Pokémon found matching "{searchTerm}"
                </p>
              </CardContent>
            </Card>
          ) : null}
        </div>
      )}

      {/* Initial state */}
      {searchTerm.length < 2 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Search for Pokémon</h3>
            <p className="text-muted-foreground">
              Start typing a Pokémon name to search and add them to your team.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}