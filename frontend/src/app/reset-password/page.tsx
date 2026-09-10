'use client';

import React, { Suspense } from 'react';
import { ResetPassword } from '@/features/auth/ResetPassword';

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ResetPassword />
    </Suspense>
  );
}
