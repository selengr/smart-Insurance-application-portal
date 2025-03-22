'use client';
import { QueryClientProvider } from '@tanstack/react-query';

import { queryClient } from '@/lib/react-query/react-query.config';

const QueryProvider = ({ children }: React.PropsWithChildren) => {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

export default QueryProvider;
