import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useFavorites } from '@/hooks/useFavorites'
import { api } from '@/lib/api'

// Mock the API
jest.mock('@/lib/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
    put: jest.fn(),
  },
}))

// Mock the auth context to return authenticated user
jest.mock('@/contexts/auth-context', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    isLoading: false,
    login: jest.fn(),
    logout: jest.fn(),
    checkAuth: jest.fn(),
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
      },
    },
  })

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('useFavorites', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const mockApi = api as jest.Mocked<typeof api>

  it('should fetch favorites successfully', async () => {
    const mockFavorites = [
      { pokemonId: 1, pokemon: { id: 1, name: 'bulbasaur' } },
      { pokemonId: 4, pokemon: { id: 4, name: 'charmander' } }
    ]

    mockApi.get.mockResolvedValueOnce({
      data: { data: mockFavorites }
    })

    const { result } = renderHook(() => useFavorites(), { 
      wrapper: createWrapper() 
    })

    // Wait for the query to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.favorites).toEqual(mockFavorites)
    expect(result.current.error).toBeNull()
  })

  it('should handle fetch error', async () => {
    mockApi.get.mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useFavorites(), { 
      wrapper: createWrapper() 
    })

    // Wait for the query to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.favorites).toEqual([])
    expect(result.current.error).toBeTruthy()
  })

  it('should check if pokemon is favorite', async () => {
    const mockFavorites = [
      { pokemonId: 1, pokemon: { id: 1, name: 'bulbasaur' } },
      { pokemonId: 25, pokemon: { id: 25, name: 'pikachu' } }
    ]

    mockApi.get.mockResolvedValueOnce({
      data: { data: mockFavorites }
    })

    const { result } = renderHook(() => useFavorites(), { 
      wrapper: createWrapper() 
    })

    // Wait for the query to complete
    await waitFor(() => {
      expect(result.current.favorites).toEqual(mockFavorites)
    })

    expect(result.current.checkFavorite(1)).toBe(true)
    expect(result.current.checkFavorite(25)).toBe(true)
    expect(result.current.checkFavorite(4)).toBe(false)
  })

  it('should call API when toggling favorite', async () => {
    mockApi.get.mockResolvedValueOnce({
      data: { data: [] }
    })
    
    mockApi.post.mockResolvedValueOnce({
      data: { message: 'Added to favorites' }
    })

    const { result } = renderHook(() => useFavorites(), { 
      wrapper: createWrapper() 
    })

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Toggle should work since we mocked authenticated user and pokemon is not in favorites
    act(() => {
      result.current.toggleFavorite(25)
    })

    // Should call the API endpoint for adding to favorites
    await waitFor(() => {
      expect(mockApi.post).toHaveBeenCalledWith('/favorites/25')
    })
  })
})