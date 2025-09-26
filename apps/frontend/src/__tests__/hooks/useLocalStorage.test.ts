import { renderHook, act } from '@testing-library/react'
import { useLocalStorage } from '@/hooks/useLocalStorage'

// Mock the useClientSide hook
jest.mock('@/hooks/useClientSide', () => ({
  useClientSide: () => true
}))

describe('useLocalStorage', () => {
  const originalLocalStorage = global.localStorage

  beforeEach(() => {
    // Reset localStorage mock before each test
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    }
    Object.defineProperty(global, 'localStorage', {
      value: localStorageMock,
      writable: true
    })
    
    jest.clearAllMocks()
  })

  afterAll(() => {
    Object.defineProperty(global, 'localStorage', {
      value: originalLocalStorage,
      writable: true
    })
  })

  it('should return initial value when localStorage is empty', () => {
    global.localStorage.getItem = jest.fn().mockReturnValue(null)
    
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))
    
    expect(result.current.value).toBe('initial')
    expect(result.current.isClient).toBe(true)
  })

  it('should return value from localStorage when available', () => {
    global.localStorage.getItem = jest.fn().mockReturnValue('"stored-value"')
    
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))
    
    expect(result.current.value).toBe('stored-value')
  })

  it('should update localStorage when value changes', () => {
    global.localStorage.getItem = jest.fn().mockReturnValue(null)
    
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))
    
    act(() => {
      result.current.setValue('new-value')
    })
    
    expect(result.current.value).toBe('new-value')
    expect(global.localStorage.setItem).toHaveBeenCalledWith('test-key', '"new-value"')
  })

  it('should handle function updates', () => {
    global.localStorage.getItem = jest.fn().mockReturnValue('0')
    
    const { result } = renderHook(() => useLocalStorage('test-key', 0))
    
    act(() => {
      result.current.setValue((prev: number) => prev + 1)
    })
    
    expect(result.current.value).toBe(1)
    expect(global.localStorage.setItem).toHaveBeenCalledWith('test-key', '1')
  })

  it('should handle invalid JSON gracefully', () => {
    global.localStorage.getItem = jest.fn().mockReturnValue('invalid-json{')
    
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))
    
    expect(result.current.value).toBe('initial')
  })

  it('should handle localStorage errors gracefully', () => {
    global.localStorage.getItem = jest.fn().mockReturnValue(null)
    global.localStorage.setItem = jest.fn().mockImplementation(() => {
      throw new Error('Storage full')
    })
    
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))
    
    act(() => {
      result.current.setValue('new-value')
    })
    
    // Should not throw an error and should still update the state
    expect(result.current.value).toBe('new-value')
  })

  it('should remove value from localStorage', () => {
    global.localStorage.getItem = jest.fn().mockReturnValue('"stored-value"')
    
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))
    
    expect(result.current.value).toBe('stored-value')
    
    act(() => {
      result.current.removeValue()
    })
    
    expect(result.current.value).toBe('initial')
    expect(global.localStorage.removeItem).toHaveBeenCalledWith('test-key')
  })
})