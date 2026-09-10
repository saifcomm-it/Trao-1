import { QueryClient } from '@tanstack/react-query';

let globalQueryClient: QueryClient | null = null;

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 2,
        gcTime: 1000 * 60 * 10,
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  });
}

export function getQueryClient(): QueryClient {
  if (typeof window === 'undefined') {
    return createQueryClient();
  }
  if (!globalQueryClient) {
    globalQueryClient = createQueryClient();
  }
  return globalQueryClient;
}

export function setGlobalQueryClient(client: QueryClient) {
  globalQueryClient = client;
}


export function purgeKitFromTanStackQuery(kitId: string, client?: QueryClient) {
  if (!kitId) return;

  const qc = client || (typeof window !== 'undefined' ? getQueryClient() : null);
  if (!qc) return;

  try {
    const cache = qc.getQueryCache();


    const allQueries = cache.getAll();
    for (const query of allQueries) {
      const key = query.queryKey;
      const keyMatches = key.some(
        (part) => typeof part === 'string' && (part === kitId || part.includes(kitId))
      );

      if (keyMatches) {
        cache.remove(query);
      }
    }


    qc.removeQueries({ queryKey: ['kit', kitId], exact: false });


    qc.removeQueries({ queryKey: ['mock-history', kitId], exact: false });


    qc.setQueriesData({ queryKey: ['kits'] }, (oldData: any) => {
      if (Array.isArray(oldData)) {
        return oldData.filter((k: any) => {
          const id = k.id || k._id;
          return id !== kitId;
        });
      }
      return oldData;
    });


    for (const query of cache.getAll()) {
      const data: any = query.state.data;
      if (Array.isArray(data)) {
        const containsDeletedKit = data.some(
          (item: any) => item && (item.id === kitId || item._id === kitId)
        );
        if (containsDeletedKit) {
          qc.setQueryData(
            query.queryKey,
            data.filter((item: any) => item && item.id !== kitId && item._id !== kitId)
          );
        }
      } else if (data && typeof data === 'object' && (data.id === kitId || data._id === kitId)) {
        cache.remove(query);
      }
    }


    qc.invalidateQueries({ queryKey: ['kits'], refetchType: 'all' });
  } catch (err) {
    console.warn('[TanStackQuery] Error while purging query cache:', err);
  }
}
