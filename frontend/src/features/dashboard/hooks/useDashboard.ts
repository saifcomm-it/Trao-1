'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useKitsQuery, useDeleteKitMutation } from '@/lib/queries';
import { purgeKitFromAllCaches } from '@/lib/cache-cleanup';

export function useDashboard() {
  const queryClient = useQueryClient();
  const { data: kits = [], isLoading, error, refetch } = useKitsQuery();
  const deleteMutation = useDeleteKitMutation();

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this prep kit?')) return;


    purgeKitFromAllCaches(id, queryClient);

    try {
      await deleteMutation.mutateAsync(id);
    } catch (err) {
      console.warn('[Dashboard] Delete kit server error:', err);
    } finally {
      purgeKitFromAllCaches(id, queryClient);
      await refetch();
    }
  };

  return {
    kits,
    isLoading,
    error: error ? (error as any).message || 'Failed to load kits' : null,
    refreshKits: refetch,
    handleDelete
  };
}
