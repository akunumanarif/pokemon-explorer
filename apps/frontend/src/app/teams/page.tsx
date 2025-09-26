'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Plus, Users, Edit, Trash2, Eye, Lock, Home, Search, ArrowLeft } from 'lucide-react'
import api from '@/lib/api'
import { useAuth } from '@/contexts/auth-context'

interface Pokemon {
  id: number
  name: string
  imageUrl: string
  types: string[]
}

interface TeamMember {
  id: number
  pokemonId: number
  position: number
  nickname: string | null
  pokemon: Pokemon
}

interface Team {
  id: number
  name: string
  description: string | null
  isPublic: boolean
  createdAt: string
  updatedAt: string
  members: TeamMember[]
}

export default function TeamsPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [token, setToken] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newTeam, setNewTeam] = useState({
    name: '',
    description: '',
    isPublic: false
  })

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

  // Fetch user teams
  const { data: teamsResponse, isLoading, error } = useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      if (!token) {
        router.push('/login')
        throw new Error('No token')
      }
      const response = await api.get('/teams')
      return response.data
    },
    enabled: !!token,
  })

  // Extract teams array from response
  const teams = teamsResponse?.data || []

  // Create team mutation
  const createTeamMutation = useMutation({
    mutationFn: async (teamData: typeof newTeam) => {
      const response = await api.post('/teams', teamData)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] })
      setShowCreateForm(false)
      setNewTeam({ name: '', description: '', isPublic: false })
    },
    onError: (error: any) => {
      console.error('Error creating team:', error)
      alert('Failed to create team')
    }
  })

  // Delete team mutation
  const deleteTeamMutation = useMutation({
    mutationFn: async (teamId: number) => {
      await api.delete(`/teams/${teamId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] })
    },
    onError: (error: any) => {
      console.error('Error deleting team:', error)
      alert('Failed to delete team')
    }
  })

  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTeam.name.trim()) {
      alert('Team name is required')
      return
    }
    createTeamMutation.mutate(newTeam)
  }

  const handleDeleteTeam = (teamId: number, teamName: string) => {
    if (confirm(`Are you sure you want to delete "${teamName}"?`)) {
      deleteTeamMutation.mutate(teamId)
    }
  }

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
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Teams</span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Teams</h1>
            <p className="text-muted-foreground">
              Build and manage your Pokemon battle teams
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => router.push('/teams/public')} variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              Browse Public Teams
            </Button>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Team
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-destructive/15 border border-destructive text-destructive px-4 py-3 rounded mb-6">
            {error.message || 'Failed to load teams'}
          </div>
        )}

        {/* Create Team Form */}
        {showCreateForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Create New Team</CardTitle>
              <CardDescription>
                Build a new Pokemon team for battles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateTeam} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Team Name</label>
                  <Input
                    type="text"
                    placeholder="Enter team name..."
                    value={newTeam.name}
                    onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Description</label>
                  <Textarea
                    placeholder="Describe your team strategy..."
                    value={newTeam.description}
                    onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={newTeam.isPublic}
                    onChange={(e) => setNewTeam({ ...newTeam, isPublic: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="isPublic" className="text-sm font-medium">
                    Make this team public
                  </label>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={createTeamMutation.isPending}>
                    {createTeamMutation.isPending ? 'Creating...' : 'Create Team'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Teams Grid */}
        {teams.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <Users className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">No teams yet</h2>
              <p className="text-muted-foreground mb-4">
                Create your first Pokemon team to get started!
              </p>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Team
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {teams.map((team: Team) => (
              <Card key={team.id} className="group hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{team.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        {team.isPublic ? (
                          <Badge variant="secondary" className="text-xs">
                            <Eye className="h-3 w-3 mr-1" />
                            Public
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            <Lock className="h-3 w-3 mr-1" />
                            Private
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {team.members?.length || 0}/6 Pokemon
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => router.push(`/teams/${team.id}`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteTeam(team.id, team.name)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {team.description && (
                    <p className="text-sm text-muted-foreground mb-4 overflow-hidden" style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {team.description}
                    </p>
                  )}
                  
                  {/* Team Members Preview */}
                  <div className="grid grid-cols-3 gap-2">
                    {Array.from({ length: 6 }).map((_, index) => {
                      const member = team.members?.find(m => m.position === index + 1)
                      return (
                        <div
                          key={index}
                          className="aspect-square bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-muted-foreground/20"
                        >
                          {member ? (
                            <div className="text-center">
                              <img
                                src={member.pokemon.imageUrl}
                                alt={member.pokemon.name}
                                className="w-8 h-8 mx-auto mb-1"
                              />
                              <div className="text-xs font-medium capitalize truncate">
                                {member.nickname || member.pokemon.name}
                              </div>
                            </div>
                          ) : (
                            <Plus className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      )
                    })}
                  </div>

                  <div className="flex justify-between items-center mt-4">
                    <span className="text-xs text-muted-foreground">
                      Created {new Date(team.createdAt).toLocaleDateString()}
                    </span>
                    <Button
                      size="sm"
                      onClick={() => router.push(`/teams/${team.id}`)}
                    >
                      Manage Team
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}