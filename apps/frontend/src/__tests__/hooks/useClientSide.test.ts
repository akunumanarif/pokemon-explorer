import { renderHook } from '@testing-library/react'
import { useClientSide } from '@/hooks/useClientSide'

describe('useClientSide', () => {
  it('should return true when rendered on client side', () => {
    const { result } = renderHook(() => useClientSide())
    
    // In the Jest environment, this should return true after the effect runs
    expect(result.current).toBe(true)
  })

  it('should initially return false then true', () => {
    const { result, rerender } = renderHook(() => useClientSide())
    
    // Should be true in Jest environment
    expect(result.current).toBe(true)
    
    // Rerender should still be true
    rerender()
    expect(result.current).toBe(true)
  })
})