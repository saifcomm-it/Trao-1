'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Lock,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  Zap
} from 'lucide-react';
import { api } from '@/lib/api';
import { InputField, Button } from '@/shared/components';

export function ResetPassword() {
  const searchParams = useSearchParams();
  const token = searchParams ? searchParams.get('token') || '' : '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const router = useRouter();


  const getPasswordStrength = () => {
    if (!password) return { score: 0, label: 'None', color: 'bg-slate-200' };
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password) || /[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password) && password.length >= 10) score += 1;

    if (score === 1) return { score: 1, label: 'Weak', color: 'bg-rose-500' };
    if (score === 2) return { score: 2, label: 'Good', color: 'bg-amber-500' };
    return { score: 3, label: 'Strong', color: 'bg-teal-500' };
  };

  const strength = getPasswordStrength();
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!token) {
      setErrorMessage('Missing password reset token. Please request a new reset link.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter a new password.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter your password.');
      return;
    }

    setIsLoading(true);
    try {
      await api.resetPassword(token, password);
      setIsSuccess(true);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      <div className="hidden lg:flex lg:w-[45%] relative bg-gradient-to-br from-slate-900 via-brand-950 to-slate-900 flex-col justify-between p-12 overflow-hidden">

        <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-0 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 w-56 h-56 bg-brand-400/10 rounded-full blur-3xl pointer-events-none" />


        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/25">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">Trao</span>
          </div>

          <h2 className="text-3xl font-bold text-white leading-tight mb-4">
            Secure Your<br />Account Access
          </h2>
          <p className="text-slate-400 text-base leading-relaxed max-w-sm">
            Set a new secure password for your account. We use industry-standard encryption to keep your credentials safe.
          </p>
        </div>


        <div className="relative z-10 space-y-5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">Strong Encryption</p>
              <p className="text-xs text-slate-400 mt-0.5">Your password is hashed and stored with enterprise-grade security</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Zap className="w-4 h-4 text-teal-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">Instant Password Update</p>
              <p className="text-xs text-slate-400 mt-0.5">Changes take effect immediately across all your sessions</p>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10">
            <p className="text-xs text-slate-500">Trusted by 500+ candidates</p>
          </div>
        </div>
      </div>


      <div className="w-full lg:w-[55%] flex items-center justify-center bg-white px-6 py-12 sm:px-12 relative overflow-y-auto">
        <div className="w-full max-w-md">

          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 flex items-center justify-center shadow-md shadow-brand-500/20">
              <Sparkles className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900 tracking-tight">Trao</span>
          </div>

          {isSuccess ? (
            <div className="space-y-6">

              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-50 via-white to-brand-50 border border-teal-200/70 mx-auto flex items-center justify-center shadow-sm">
                <CheckCircle2 className="w-8 h-8 text-teal-600" />
              </div>

              <div className="text-center">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                  Password Changed!
                </h2>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed max-w-xs mx-auto">
                  Your password has been successfully updated. You can now sign in with your new password.
                </p>
              </div>

              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => router.push('/login')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Proceed to Sign In
              </Button>
            </div>
          ) : (
            <div>

              <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Set New Password
                </h1>
                <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
                  Enter and confirm your new secure password below.
                </p>
              </div>


              {errorMessage && (
                <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <div className="flex-1">{errorMessage}</div>
                </div>
              )}


              {!token && (
                <div className="mb-4 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-sm flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                  <div className="flex-1">
                    No reset token detected. Please use the reset link sent to your email or request a new one.
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">

                <InputField
                  label="New Password"
                  required
                  isPassword
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                  disabled={!token || isLoading}
                  leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                />


                <InputField
                  label="Confirm New Password"
                  required
                  isPassword
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type new password"
                  autoComplete="new-password"
                  disabled={!token || isLoading}
                  leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                />


                {(password || confirmPassword) && (
                  <div className="flex items-center justify-between text-xs text-slate-500 px-0.5">
                    <div className="flex items-center gap-2">
                      <span>Strength:</span>
                      <span className="font-semibold text-slate-700">{strength.label}</span>
                      <div className="flex gap-1 w-14 h-1.5 rounded-full overflow-hidden">
                        <div className={`h-full flex-1 rounded-full ${strength.score >= 1 ? strength.color : 'bg-slate-200'}`} />
                        <div className={`h-full flex-1 rounded-full ${strength.score >= 2 ? strength.color : 'bg-slate-200'}`} />
                        <div className={`h-full flex-1 rounded-full ${strength.score >= 3 ? strength.color : 'bg-slate-200'}`} />
                      </div>
                    </div>

                    {confirmPassword && (
                      <div>
                        {passwordsMatch ? (
                          <span className="text-teal-700 font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Matched
                          </span>
                        ) : (
                          <span className="text-rose-600 font-medium">Not matching</span>
                        )}
                      </div>
                    )}
                  </div>
                )}


                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  disabled={!token || isLoading}
                  isLoading={isLoading}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Update Password
                </Button>
              </form>


              <div className="mt-6 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-sm text-brand-600 font-semibold hover:text-brand-700 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
