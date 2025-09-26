import { renderHook, act } from '@testing-library/react'
import { useDebounce } from '@/hooks/useDebounce'

describe('useDebounce', () => {
  beforeAll(() => {
    jest.useFakeTimers()
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  beforeEach(() => {
    jest.clearAllTimers()
  })

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500))
    
    expect(result.current).toBe('initial')
  })

  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 }
      }
    )
    
    expect(result.current).toBe('initial')
    
    // Update the value
    rerender({ value: 'updated', delay: 500 })
    
    // Should still be the initial value before delay
    expect(result.current).toBe('initial')
    
    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(500)
    })
    
    // Should now be the updated value
    expect(result.current).toBe('updated')
  })

  it('should cancel previous debounce on rapid changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 }
      }
    )
    
    // First update
    rerender({ value: 'first', delay: 500 })
    
    // Second update before first completes
    act(() => {
      jest.advanceTimersByTime(200)
    })
    rerender({ value: 'second', delay: 500 })
    
    // Third update before second completes
    act(() => {
      jest.advanceTimersByTime(200)
    })
    rerender({ value: 'final', delay: 500 })
    
    // Should still be initial value
    expect(result.current).toBe('initial')
    
    // Complete the debounce
    act(() => {
      jest.advanceTimersByTime(500)
    })
    
    // Should be the final value, skipping intermediate values
    expect(result.current).toBe('final')
  })

  it('should handle different delay values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 1000 }
      }
    )
    
    rerender({ value: 'updated', delay: 100 })
    
    expect(result.current).toBe('initial')
    
    act(() => {
      jest.advanceTimersByTime(100)
    })
    
    expect(result.current).toBe('updated')
  })

  it('should handle zero delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 0 }
      }
    )
    
    rerender({ value: 'updated', delay: 0 })
    
    act(() => {
      jest.advanceTimersByTime(0)
    })
    
    expect(result.current).toBe('updated')
  })
})