'use client';

import { useParams } from 'next/navigation';
import { ProtectedRoute } from '@/lib/auth-guard';
import { QuestionBankView } from '@/features/kit-builder/components/QuestionBankView';

export default function QuestionBankPage() {
  const params = useParams();
  const id = (params?.id as string) || '';

  return (
    <ProtectedRoute>
      <QuestionBankView kitId={id} />
    </ProtectedRoute>
  );
}
