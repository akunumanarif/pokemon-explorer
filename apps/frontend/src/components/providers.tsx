'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SessionProvider } from 'next-auth/react'
import { AuthProvider } from '@/contexts/auth-context'
import { useState } from 'react'

// Create a global query client
export const globalQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
    },
  },
})

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => globalQueryClient)

  return (
    <AuthProvider>
      <SessionProvider>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </SessionProvider>
    </AuthProvider>
  )
}