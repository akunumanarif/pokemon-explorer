'use client';

import { useState, useEffect } from 'react';

/**
 * Custom hook for handling client-side rendering checks
 * Prevents hydration mismatches
 */
export function useClientSide() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}