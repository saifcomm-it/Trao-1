'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Mail,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  ShieldCheck,
  RotateCcw,
  Clock
} from 'lucide-react';
import { api } from '@/lib/api';
import { InputField, Button } from '@/shared/components';

export function ForgotPassword() {
  const searchParams = useSearchParams();
  const initialEmail = searchParams ? searchParams.get('email') || '' : '';

  const [email, setEmail] = useState(initialEmail);
  const [isLoading, setIsLoading] = useState(!!initialEmail);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ message: string; email?: string } | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const autoSubmitted = useRef(false);


  useEffect(() => {
    if (initialEmail && !autoSubmitted.current) {
      autoSubmitted.current = true;
      const timer = setTimeout(() => {
        handleSubmitAuto(initialEmail);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [initialEmail]);

  const handleSubmitAuto = async (emailToSend: string) => {
    setErrorMessage(null);
    setIsLoading(true);
    try {
      const res = await api.forgotPassword(emailToSend.trim());
      setSuccessData(res);
      setResendCooldown(60);
      const interval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Unable to process reset request. Please check the email entered.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage('Please enter your registered email address.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.forgotPassword(email.trim());
      setSuccessData(res);
      setResendCooldown(60);
      const interval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Unable to process reset request. Please check the email entered.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      <div className="hidden lg:flex lg:w-[45%] relative bg-gradient-to-br from-slate-900 via-brand-950 to-slate-900 flex-col justify-between p-10 overflow-hidden">

        <div className="absolute top-[-120px] left-[-80px] w-[400px] h-[400px] bg-gradient-to-br from-brand-500/20 to-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-100px] right-[-60px] w-[350px] h-[350px] bg-gradient-to-tr from-brand-600/15 to-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 w-[250px] h-[250px] bg-teal-500/8 rounded-full blur-3xl pointer-events-none" />


        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/25">
              <KeyRound className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">Trao</span>
          </div>
          <h2 className="text-3xl font-bold text-white leading-tight mb-3">
            Account Recovery
          </h2>
          <p className="text-slate-300 text-base leading-relaxed max-w-sm">
            Secure account recovery for your interview prep profile. We&apos;ll get you back on track in no time.
          </p>
        </div>


        <div className="relative z-10 space-y-5">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                <Clock className="w-4 h-4 text-teal-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Link valid for 1 hour</p>
                <p className="text-xs text-slate-400 mt-0.5">Reset links expire automatically for your security.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4 text-teal-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Encrypted password reset</p>
                <p className="text-xs text-slate-400 mt-0.5">End-to-end encryption keeps your credentials safe.</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10">
            <p className="text-sm text-slate-400">
              Trusted by <span className="text-white font-semibold">500+</span> candidates
            </p>
          </div>
        </div>
      </div>


      <div className="w-full lg:w-[55%] flex items-center justify-center bg-white p-6 sm:p-10">
        <div className="w-full max-w-md">

          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 flex items-center justify-center shadow-md shadow-brand-500/20">
              <KeyRound className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900 tracking-tight">Trao</span>
          </div>

          {successData ? (
            <div className="space-y-5">
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-50 via-white to-teal-50 border border-brand-200/70 flex items-center justify-center shadow-sm">
                <Mail className="w-8 h-8 text-brand-600" />
                <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-teal-500 text-white flex items-center justify-center border-2 border-white shadow-2xs">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Check Your Email
                </h2>
                <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
                  We&apos;ve dispatched a secure password reset link to:
                </p>

                <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-semibold text-sm max-w-full truncate">
                  <Mail className="w-4 h-4 text-brand-600 shrink-0" />
                  <span className="truncate">{successData.email || email}</span>
                </div>
              </div>


              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 text-left space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                    1
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Open your email inbox and look for the message from <span className="font-semibold text-slate-800">Trao</span>.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                    2
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Click the <strong className="text-slate-800 font-semibold">&ldquo;Reset My Password&rdquo;</strong> button inside to set a new password.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 pt-2.5 border-t border-slate-200/60 text-xs text-slate-500 font-medium">
                  <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>Link valid for <strong className="text-slate-700">1 hour</strong> for security.</span>
                </div>
              </div>


              <p className="text-xs text-slate-400 leading-relaxed">
                Didn&apos;t receive the email? Check your spam/junk folder, or click below to resend.
              </p>


              <div className="space-y-3">
                <Button
                  variant="secondary"
                  size="lg"
                  fullWidth
                  onClick={() => handleSubmit()}
                  disabled={isLoading || resendCooldown > 0}
                  isLoading={isLoading}
                  leftIcon={<RotateCcw className="w-4 h-4" />}
                >
                  {resendCooldown > 0
                    ? `Resend in ${resendCooldown}s`
                    : 'Resend Reset Email'}
                </Button>

                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-1.5 w-full h-10 px-4 rounded-xl text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </div>
          ) : (
            /* Request Form View */
            <div>
              {initialEmail && isLoading && !errorMessage ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100 border border-brand-200/50 mx-auto flex items-center justify-center">
                    <div className="w-6 h-6 border-3 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                      Sending Reset Link...
                    </h2>
                    <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
                      We&apos;re sending a password reset link to:
                    </p>
                    <div className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-semibold text-sm">
                      <Mail className="w-4 h-4 text-brand-600 shrink-0" />
                      <span className="truncate">{initialEmail}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                      Forgot Password?
                    </h1>
                    <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
                      Enter your registered email address and we&apos;ll send you a secure link to reset your password.
                    </p>
                  </div>

                  {errorMessage && (
                    <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2.5">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                      <div className="flex-1 font-medium">{errorMessage}</div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <InputField
                      label="Registered Email Address"
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      autoComplete="email"
                      disabled={isLoading}
                      leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                      inputSize="md"
                    />

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      fullWidth
                      disabled={isLoading}
                      isLoading={isLoading}
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                      Send Reset Password Link
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
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
