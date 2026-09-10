'use client';

import { ProtectedRoute } from '@/lib/auth-guard';
import { ProfileView } from '@/features/profile/ProfileView';

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileView />
    </ProtectedRoute>
  );
}
