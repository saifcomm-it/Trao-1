'use client';

import React, { Suspense } from 'react';
import { AuthRoute } from '@/lib/auth-guard';
import { ForgotPassword } from '@/features/auth/ForgotPassword';

export default function ForgotPasswordPage() {
  return (
    <AuthRoute>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <ForgotPassword />
      </Suspense>
    </AuthRoute>
  );
}
