'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { ArrowLeft, Edit2, Save, X, Plus, Trash2, Users, Crown, Home, Search } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useEffect } from 'react';

interface Pokemon {
  id: number;
  name: string;
  sprite: string;
  types: string[];
}

interface TeamMember {
  id: number;
  position: number;
  pokemon: Pokemon;
}

interface Team {
  id: number;
  name: string;
  description?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  userId: number;
  members: TeamMember[];
  user: {
    id: number;
    username: string;
    firstName?: string;
    lastName?: string;
  };
}

export default function TeamDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const teamId = parseInt(params.id);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    isPublic: false
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch team data
  const { data: team, isLoading } = useQuery<Team>({
    queryKey: ['team', teamId],
    queryFn: async () => {
      const response = await api.get(`/teams/${teamId}`);
      return response.data;
    }
  });

  // Update team mutation
  const updateTeamMutation = useMutation({
    mutationFn: async (data: { name: string; description?: string; isPublic: boolean }) => {
      const response = await api.put(`/teams/${teamId}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team', teamId] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      setIsEditing(false);
    }
  });

  // Delete team mutation
  const deleteTeamMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/teams/${teamId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      router.push('/teams');
    }
  });

  // Remove team member mutation
  const removeTeamMemberMutation = useMutation({
    mutationFn: async (pokemonId: number) => {
      await api.delete(`/teams/${teamId}/members/${pokemonId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team', teamId] });
    }
  });

  const handleEditStart = () => {
    if (team) {
      setEditForm({
        name: team.name,
        description: team.description || '',
        isPublic: team.isPublic
      });
      setIsEditing(true);
    }
  };

  const handleEditSave = () => {
    updateTeamMutation.mutate(editForm);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditForm({
      name: '',
      description: '',
      isPublic: false
    });
  };

  const handleDeleteTeam = () => {
    if (window.confirm('Are you sure you want to delete this team? This action cannot be undone.')) {
      deleteTeamMutation.mutate();
    }
  };

  const handleRemoveMember = (pokemonId: number) => {
    if (window.confirm('Remove this Pokémon from the team?')) {
      removeTeamMemberMutation.mutate(pokemonId);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // If not authenticated after loading, this will be handled by useEffect redirect
  if (!isAuthenticated) {
    return null;
  }

  if (!team) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Team not found</h1>
          <Button onClick={() => router.push('/teams')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Teams
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
          <span>Team Details</span>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/teams')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Teams
        </Button>
        
        <div className="flex items-center gap-2">
          {team.isPublic && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              Public
            </Badge>
          )}
          <Badge variant="outline" className="flex items-center gap-1">
            <Crown className="w-3 h-3" />
            {team.user.firstName || team.user.username}
          </Badge>
        </div>
      </div>

      {/* Team Info */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            {isEditing ? (
              <div className="flex-1">
                <Input
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="text-2xl font-bold mb-2"
                  placeholder="Team name"
                />
                <Textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  placeholder="Team description"
                  className="mb-2"
                />
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editForm.isPublic}
                    onChange={(e) => setEditForm({ ...editForm, isPublic: e.target.checked })}
                  />
                  Make team public
                </label>
              </div>
            ) : (
              <div>
                <CardTitle className="text-2xl">{team.name}</CardTitle>
                {team.description && (
                  <CardDescription className="mt-2">{team.description}</CardDescription>
                )}
              </div>
            )}
            
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Button 
                    onClick={handleEditSave} 
                    size="sm"
                    disabled={updateTeamMutation.isPending}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleEditCancel} 
                    size="sm"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    onClick={handleEditStart} 
                    size="sm"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleDeleteTeam} 
                    size="sm"
                    disabled={deleteTeamMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Members: {team.members.length}/6</span>
            <span>Created: {new Date(team.createdAt).toLocaleDateString()}</span>
            {team.updatedAt !== team.createdAt && (
              <span>Updated: {new Date(team.updatedAt).toLocaleDateString()}</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Team Members */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Team Members</h2>
          {team.members.length < 6 && (
            <Button 
              onClick={() => router.push(`/teams/${teamId}/add-member`)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Pokémon
            </Button>
          )}
        </div>

        {team.members.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">No Pokémon in this team yet.</p>
              <Button onClick={() => router.push(`/teams/${teamId}/add-member`)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Pokémon
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {team.members.map((member) => (
              <Card key={member.id} className="relative group">
                <CardContent className="p-4">
                  <div className="relative">
                    <img 
                      src={member.pokemon.sprite} 
                      alt={member.pokemon.name}
                      className="w-24 h-24 mx-auto mb-3"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveMember(member.pokemon.id)}
                      disabled={removeTeamMemberMutation.isPending}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                  
                  <h3 className="font-medium text-center capitalize mb-2">
                    {member.pokemon.name}
                  </h3>
                  
                  <div className="flex flex-wrap gap-1 justify-center">
                    {member.pokemon.types.map((type) => (
                      <Badge 
                        key={type} 
                        variant="secondary" 
                        className="text-xs"
                      >
                        {type}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="text-center mt-2">
                    <Badge variant="outline" className="text-xs">
                      Position {member.position}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}