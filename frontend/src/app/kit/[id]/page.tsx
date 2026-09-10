'use client';

import { useParams } from 'next/navigation';
import { ProtectedRoute } from '@/lib/auth-guard';
import { KitBuilderView } from '@/features/kit-builder/components/KitBuilderView';

export default function KitBuilderPage() {
  const params = useParams();
  const id = (params?.id as string) || '';

  return (
    <ProtectedRoute>
      <KitBuilderView kitId={id} />
    </ProtectedRoute>
  );
}
