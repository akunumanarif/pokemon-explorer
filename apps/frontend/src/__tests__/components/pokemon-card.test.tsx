import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/contexts/auth-context'
import { PokemonCard } from '@/components/pokemon-card'
import type { Pokemon } from '@/types'

// Mock the API
global.fetch = jest.fn()

const mockPokemon: Pokemon = {
  id: 1,
  name: 'bulbasaur',
  imageUrl: 'https://example.com/bulbasaur.png',
  types: ['grass', 'poison'],
  abilities: JSON.stringify({
    abilities: [
      { ability: { name: 'overgrow' }, is_hidden: false }
    ]
  }),
  stats: JSON.stringify({
    hp: 45,
    attack: 49,
    defense: 49,
    'special-attack': 65,
    'special-defense': 65,
    speed: 45
  }),
}

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {ui}
      </AuthProvider>
    </QueryClientProvider>
  )
}

describe('PokemonCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Mock successful fetch by default
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ isFavorite: false })
    })
  })

  it('renders pokemon information correctly', () => {
    renderWithProviders(<PokemonCard pokemon={mockPokemon} />)
    
    expect(screen.getByText('bulbasaur')).toBeInTheDocument()
    expect(screen.getByText('#001')).toBeInTheDocument()
    expect(screen.getByText('grass')).toBeInTheDocument()
    expect(screen.getByText('poison')).toBeInTheDocument()
    
    const image = screen.getByAltText('bulbasaur')
    expect(image).toBeInTheDocument()
    // Next.js Image component processes the src, so we just check if it contains our URL
    expect(image.getAttribute('src')).toContain('example.com')
  })

  it('displays correct pokemon ID with leading zeros', () => {
    const pokemon: Pokemon = { ...mockPokemon, id: 25 }
    renderWithProviders(<PokemonCard pokemon={pokemon} />)
    
    expect(screen.getByText('#025')).toBeInTheDocument()
  })

  it('handles pokemon with single type', () => {
    const pokemon: Pokemon = {
      ...mockPokemon,
      types: ['fire']
    }
    
    renderWithProviders(<PokemonCard pokemon={pokemon} />)
    
    expect(screen.getByText('fire')).toBeInTheDocument()
    expect(screen.queryByText('poison')).not.toBeInTheDocument()
  })

  it('shows buttons when rendered', () => {
    renderWithProviders(<PokemonCard pokemon={mockPokemon} />)
    
    // Should have View Details button
    expect(screen.getByText('View Details')).toBeInTheDocument()
    // Should have buttons (might have favorite button)
    expect(screen.getAllByRole('button').length).toBeGreaterThan(0)
  })

  it('handles missing pokemon image gracefully', () => {
    const pokemon: Pokemon = {
      ...mockPokemon,
      imageUrl: ''
    }
    
    renderWithProviders(<PokemonCard pokemon={pokemon} />)
    
    const image = screen.getByAltText('bulbasaur')
    expect(image).toBeInTheDocument()
  })

  it('applies type-based styling', () => {
    renderWithProviders(<PokemonCard pokemon={mockPokemon} />)
    
    const grassBadge = screen.getByText('grass')
    const poisonBadge = screen.getByText('poison')
    
    // Check that the badges have some styling classes
    expect(grassBadge.className).toContain('bg-green')
    expect(poisonBadge.className).toContain('bg-purple')
  })
})