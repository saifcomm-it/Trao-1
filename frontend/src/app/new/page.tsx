'use client';

import { ProtectedRoute } from '@/lib/auth-guard';
import { NewKitView } from '@/features/new-kit/components/NewKitView';

export default function NewKitPage() {
  return (
    <ProtectedRoute>
      <NewKitView />
    </ProtectedRoute>
  );
}
