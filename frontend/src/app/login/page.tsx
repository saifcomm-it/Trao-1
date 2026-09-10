'use client';

import { AuthRoute } from '@/lib/auth-guard';
import { Login } from '@/features/auth/Login';

export default function LoginPage() {
  return (
    <AuthRoute>
      <Login />
    </AuthRoute>
  );
}
