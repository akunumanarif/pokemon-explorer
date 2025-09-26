'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Users, Eye, ArrowLeft, Home } from 'lucide-react'
import api from '@/lib/api'

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

interface PublicTeam {
  id: number
  name: string
  description: string | null
  createdAt: string
  user: {
    username: string
  }
  members: TeamMember[]
}

export default function PublicTeamsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [isClient, setIsClient] = useState(false)

  // Handle client-side hydration
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Fetch public teams
  const { data: teamsResponse, isLoading, error } = useQuery({
    queryKey: ['public-teams'],
    queryFn: async () => {
      const response = await api.get('/teams/public')
      return response.data
    },
    enabled: isClient,
  })

  // Extract teams array from response
  const teams = teamsResponse?.data || []

  // Filter teams based on search query
  const filteredTeams = teams.filter((team: PublicTeam) =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (team.description && team.description.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  if (!isClient || isLoading) {
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
            <div className="h-4 w-px bg-border"></div>
            <Button 
              variant="ghost" 
              onClick={() => router.push('/teams')}
              className="flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              My Teams
            </Button>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Public Teams</span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Public Teams</h1>
            <p className="text-muted-foreground">
              Discover amazing Pokemon teams created by the community
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search teams by name, creator, or description..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {error && (
          <div className="bg-destructive/15 border border-destructive text-destructive px-4 py-3 rounded mb-6">
            {error.message || 'Failed to load public teams'}
          </div>
        )}

        {/* Teams Grid */}
        {filteredTeams.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <Users className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">
                {searchQuery ? 'No teams found' : 'No public teams yet'}
              </h2>
              <p className="text-muted-foreground mb-4">
                {searchQuery 
                  ? 'Try adjusting your search terms'
                  : 'Be the first to share your team with the community!'
                }
              </p>
              {!searchQuery && (
                <Button onClick={() => router.push('/teams')}>
                  Create Your First Team
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                {filteredTeams.length} team{filteredTeams.length !== 1 ? 's' : ''} found
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredTeams.map((team: PublicTeam) => (
                <Card key={team.id} className="group hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{team.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            <Eye className="h-3 w-3 mr-1" />
                            Public
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {team.members?.length || 0}/6 Pokemon
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          by {team.user.username}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {team.description && (
                      <p className="text-sm text-muted-foreground mb-4 overflow-hidden" style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        {team.description}
                      </p>
                    )}
                    
                    {/* Team Members Preview */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
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
                              <div className="w-4 h-4 bg-muted-foreground/20 rounded"></div>
                            )}
                          </div>
                        )
                      })}
                    </div>

                    {/* Team Types Preview */}
                    {team.members && team.members.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {Array.from(new Set(
                          team.members.flatMap(member => {
                            let types = member.pokemon.types;
                            if (typeof types === 'string') {
                              try {
                                types = JSON.parse(types);
                              } catch {
                                types = [];
                              }
                            }
                            return Array.isArray(types) ? types : [];
                          })
                        )).slice(0, 4).map((type, index) => (
                          <Badge key={index} variant="outline" className="text-xs capitalize">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">
                        {new Date(team.createdAt).toLocaleDateString()}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/teams/${team.id}/view`)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Team
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}