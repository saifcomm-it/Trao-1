'use client';

import { ProtectedRoute } from '@/lib/auth-guard';
import { DashboardView } from '@/features/dashboard/components/DashboardView';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardView />
    </ProtectedRoute>
  );
}
