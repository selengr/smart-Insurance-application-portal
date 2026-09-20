'use client';
import { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';

import { queryClient } from '@/lib/react-query/react-query.config';

const QueryProvider = ({ children }: React.PropsWithChildren) => {
  useEffect(() => {
    const onOnline = () => {
      void queryClient.invalidateQueries();
    };
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

export default QueryProvider;
