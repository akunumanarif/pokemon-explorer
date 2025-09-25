export interface User {
  id: number
  email: string
  username: string
  firstName?: string
  lastName?: string
  avatar?: string
  createdAt: string
}

export interface Pokemon {
  id: number
  name: string
  imageUrl: string
  types: string[] | string // Can be array or JSON string from backend
  abilities?: {
    abilities: Array<{
      ability: { name: string }
      is_hidden: boolean
    }>
  } | string // Can be object or JSON string from backend
  stats?: {
    hp: number
    attack: number
    defense: number
    'special-attack': number
    'special-defense': number
    speed: number
  } | string // Can be object or JSON string from backend
  height?: number
  weight?: number
  species?: string
}

export interface Favorite {
  id: number
  userId: number
  pokemonId: number
  pokemon: Pokemon
  createdAt: string
}

export interface Team {
  id: number
  name: string
  description?: string
  userId: number
  isPublic: boolean
  createdAt: string
  updatedAt: string
  user?: {
    id: number
    username: string
    firstName?: string
    lastName?: string
    avatar?: string
  }
  members: TeamMember[]
  _count?: {
    members: number
  }
}

export interface TeamMember {
  id: number
  teamId: number
  pokemonId: number
  position: number
  nickname?: string
  pokemon: Pokemon
}

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
  message: string
}

export interface PokemonListResponse {
  data: Pokemon[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}