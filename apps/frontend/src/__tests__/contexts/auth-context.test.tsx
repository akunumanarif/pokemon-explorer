import '@testing-library/jest-dom'
import { render, screen, act, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '@/contexts/auth-context'

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key]
    }),
    clear: jest.fn(() => {
      store = {}
    }),
  }
})()

// Setup proper localStorage mock
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
})

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
  }),
}))

// Mock global query client
jest.mock('@/components/providers', () => ({
  globalQueryClient: {
    clear: jest.fn(),
  },
}))

function TestComponent() {
  const { isAuthenticated, login, logout, isLoading } = useAuth()
  
  return (
    <div>
      <div data-testid="loading">{isLoading ? 'Loading' : 'Not Loading'}</div>
      <div data-testid="auth">{isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</div>
      <button onClick={() => login('fake-access-token', 'fake-refresh-token')}>
        Login
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  )
}

describe('AuthProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockLocalStorage.clear()
  })

  it('renders children and provides auth context', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    expect(screen.getByText('Not Authenticated')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Logout' })).toBeInTheDocument()
  })

  it('handles login', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    const loginButton = screen.getByRole('button', { name: 'Login' })
    
    act(() => {
      loginButton.click()
    })

    await waitFor(() => {
      expect(screen.getByText('Authenticated')).toBeInTheDocument()
    })

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('access_token', 'fake-access-token')
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('refresh_token', 'fake-refresh-token')
  })

  it('handles logout', async () => {
    // Set up initial authenticated state
    mockLocalStorage.setItem('access_token', 'fake-token')

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    // Wait for initial load to show authenticated
    await waitFor(() => {
      expect(screen.getByText('Authenticated')).toBeInTheDocument()
    })

    const logoutButton = screen.getByRole('button', { name: 'Logout' })
    
    act(() => {
      logoutButton.click()
    })

    await waitFor(() => {
      expect(screen.getByText('Not Authenticated')).toBeInTheDocument()
    })

    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('access_token')
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('refresh_token')
  })

  it('checks authentication on mount', async () => {
    // Set up existing token
    mockLocalStorage.setItem('access_token', 'existing-token')

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Authenticated')).toBeInTheDocument()
    })
  })
})