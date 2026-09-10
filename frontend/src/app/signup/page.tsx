'use client';

import { AuthRoute } from '@/lib/auth-guard';
import { SignUp } from '@/features/auth/SignUp';

export default function SignUpPage() {
  return (
    <AuthRoute>
      <SignUp />
    </AuthRoute>
  );
}
