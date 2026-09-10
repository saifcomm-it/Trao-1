'use client';

import React, { useState, useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { getQueryClient, setGlobalQueryClient } from './query-client';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => getQueryClient());

  useEffect(() => {
    setGlobalQueryClient(queryClient);
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
