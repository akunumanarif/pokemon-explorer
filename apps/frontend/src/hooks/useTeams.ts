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

interface TeamMember {
  id: number;
  pokemonId: number;
  position: number;
  nickname: string | null;
  pokemon: Pokemon;
}

interface Team {
  id: number;
  name: string;
  description: string | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  members: TeamMember[];
  userId?: number;
  user?: {
    id: number;
    username: string;
    firstName?: string;
    lastName?: string;
  };
}

interface CreateTeamData {
  name: string;
  description?: string;
  isPublic: boolean;
}

interface UpdateTeamData {
  name: string;
  description?: string;
  isPublic: boolean;
}

export interface AddTeamMemberData {
  pokemonId: number;
  position?: number;
  nickname?: string;
}

/**
 * Custom hook for teams management
 */
export function useTeams() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Get user teams
  const useUserTeams = () => {
    return useQuery<{ data: Team[]; count: number }>({
      queryKey: ['teams'],
      queryFn: async () => {
        const response = await api.get('/teams');
        return response.data;
      },
      enabled: isAuthenticated,
    });
  };

  // Get public teams
  const usePublicTeams = (page: number = 1, limit: number = 20) => {
    return useQuery({
      queryKey: ['public-teams', page, limit],
      queryFn: async () => {
        const response = await api.get(`/teams/public?page=${page}&limit=${limit}`);
        return response.data;
      },
      staleTime: 2 * 60 * 1000, // 2 minutes
    });
  };

  // Get team by ID
  const useTeamById = (teamId: number) => {
    return useQuery<Team>({
      queryKey: ['team', teamId],
      queryFn: async () => {
        const response = await api.get(`/teams/${teamId}`);
        return response.data;
      },
      enabled: !!teamId,
    });
  };

  // Create team mutation
  const createTeamMutation = useMutation({
    mutationFn: async (teamData: CreateTeamData) => {
      const response = await api.post('/teams', teamData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
    },
    onError: (error: any) => {
      console.error('Error creating team:', error);
    }
  });

  // Update team mutation
  const updateTeamMutation = useMutation({
    mutationFn: async ({ teamId, data }: { teamId: number; data: UpdateTeamData }) => {
      const response = await api.put(`/teams/${teamId}`, data);
      return response.data;
    },
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: ['team', teamId] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
    onError: (error: any) => {
      console.error('Error updating team:', error);
    }
  });

  // Delete team mutation
  const deleteTeamMutation = useMutation({
    mutationFn: async (teamId: number) => {
      await api.delete(`/teams/${teamId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
    },
    onError: (error: any) => {
      console.error('Error deleting team:', error);
    }
  });

  // Add team member mutation
  const addTeamMemberMutation = useMutation({
    mutationFn: async ({ teamId, data }: { teamId: number; data: AddTeamMemberData }) => {
      const response = await api.post(`/teams/${teamId}/members`, data);
      return response.data;
    },
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: ['team', teamId] });
    },
    onError: (error: any) => {
      console.error('Error adding team member:', error);
    }
  });

  // Remove team member mutation
  const removeTeamMemberMutation = useMutation({
    mutationFn: async ({ teamId, pokemonId }: { teamId: number; pokemonId: number }) => {
      await api.delete(`/teams/${teamId}/members/${pokemonId}`);
    },
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: ['team', teamId] });
    },
    onError: (error: any) => {
      console.error('Error removing team member:', error);
    }
  });

  return {
    // Query hooks
    useUserTeams,
    usePublicTeams,
    useTeamById,
    
    // Mutations
    createTeam: createTeamMutation.mutate,
    updateTeam: (teamId: number, data: UpdateTeamData) => 
      updateTeamMutation.mutate({ teamId, data }),
    deleteTeam: deleteTeamMutation.mutate,
    /**
     * Add a Pokemon to a team
     * @param teamId - The team ID
     * @param pokemonIdOrData - Either Pokemon ID (number) or AddTeamMemberData object
     * @param nickname - Optional nickname (only used when first param is pokemonId)
     * @param position - Optional position 1-6 (only used when first param is pokemonId)
     * 
     * Examples:
     * - addTeamMember(1, 25) // Add Pokemon #25 with auto position
     * - addTeamMember(1, 25, "Pikachu", 1) // Add with nickname and specific position
     * - addTeamMember(1, { pokemonId: 25, nickname: "Pikachu", position: 1 }) // Object syntax
     */
    addTeamMember: (teamId: number, pokemonIdOrData: number | AddTeamMemberData, nickname?: string, position?: number) => {
      // Support both old signature (pokemonId) and new signature (data object)
      let data: AddTeamMemberData;
      if (typeof pokemonIdOrData === 'number') {
        data = { pokemonId: pokemonIdOrData, nickname, position };
      } else {
        data = pokemonIdOrData;
      }
      addTeamMemberMutation.mutate({ teamId, data });
    },
    removeTeamMember: (teamId: number, pokemonId: number) => 
      removeTeamMemberMutation.mutate({ teamId, pokemonId }),
    
    // Loading states
    isCreatingTeam: createTeamMutation.isPending,
    isUpdatingTeam: updateTeamMutation.isPending,
    isDeletingTeam: deleteTeamMutation.isPending,
    isAddingMember: addTeamMemberMutation.isPending,
    isRemovingMember: removeTeamMemberMutation.isPending,
  };
}