'use client';

import { useParams } from 'next/navigation';
import { ProtectedRoute } from '@/lib/auth-guard';
import { ScheduleView } from '@/features/kit-builder/components/ScheduleView';

export default function SchedulePage() {
  const params = useParams();
  const id = (params?.id as string) || '';

  return (
    <ProtectedRoute>
      <ScheduleView kitId={id} />
    </ProtectedRoute>
  );
}
