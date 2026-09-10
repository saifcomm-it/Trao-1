'use client';

import { useParams } from 'next/navigation';
import { ProtectedRoute } from '@/lib/auth-guard';
import { PracticeView } from '@/features/practice/components/PracticeView';

export default function PracticePage() {
  const params = useParams();
  const id = (params?.id as string) || '';

  return (
    <ProtectedRoute>
      <PracticeView kitId={id} />
    </ProtectedRoute>
  );
}
