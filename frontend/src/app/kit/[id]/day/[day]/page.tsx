'use client';

import { useParams } from 'next/navigation';
import { ProtectedRoute } from '@/lib/auth-guard';
import { DayQuestionsView } from '@/features/kit-builder/components/DayQuestionsView';

export default function DayQuestionsPage() {
  const params = useParams();
  const id = (params?.id as string) || '';
  const dayStr = (params?.day as string) || '1';
  const day = parseInt(dayStr, 10) || 1;

  return (
    <ProtectedRoute>
      <DayQuestionsView kitId={id} dayNumber={day} />
    </ProtectedRoute>
  );
}
