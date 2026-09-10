'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  ArrowRight,
  User,
  Mail,
  Lock,
  Briefcase,
  Award,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Target,
  BarChart3,
  CalendarDays
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { InputField, Badge, Button, Dropdown } from '@/shared/components';

const SPECIALTIES = [
  { value: 'Full Stack Engineer', label: 'Full Stack Engineer' },
  { value: 'Backend Engineer', label: 'Backend Engineer (Go/Node)' },
  { value: 'Frontend Engineer', label: 'Frontend Engineer (React/TS)' },
  { value: 'DevOps & Cloud', label: 'DevOps & Cloud Architect' },
  { value: 'AI / ML Engineer', label: 'AI / ML Systems Engineer' },
];

const SENIORITIES = [
  { value: 'Junior', label: 'Junior Level (0-2 yrs)' },
  { value: 'Mid-Level', label: 'Mid-Level (3-5 yrs)' },
  { value: 'Senior', label: 'Senior Level (5-8 yrs)' },
  { value: 'Staff / Lead', label: 'Staff / Lead (8+ yrs)' },
];

export function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [seniority, setSeniority] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { register, isLoading } = useAuth();
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

    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!email.trim()) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }
    if (!agreeTerms) {
      setErrorMessage('Please accept the Terms of Service to proceed.');
      return;
    }

    try {
      await register(email.trim(), name.trim(), password, targetRole.trim(), seniority);
      router.push('/dashboard');
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex">

      <div className="hidden lg:flex lg:w-[45%] relative bg-gradient-to-br from-slate-900 via-brand-950 to-slate-900 flex-col justify-between p-12 overflow-hidden">

        <div className="absolute top-[-120px] left-[-80px] w-[400px] h-[400px] bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-100px] right-[-60px] w-[350px] h-[350px] bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 w-[250px] h-[250px] bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />


        <div className="relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/25 mb-8">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight mb-3">Trao</h1>
          <p className="text-lg text-slate-300 leading-relaxed max-w-sm">
            Build your personalized interview prep kit in minutes.
          </p>
        </div>


        <div className="relative z-10 space-y-8">
          <div className="space-y-5">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                <Target className="w-4 h-4 text-teal-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Role-Specific Questions</p>
                <p className="text-sm text-slate-400">Tailored to your target specialty and tech stack.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                <BarChart3 className="w-4 h-4 text-teal-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Difficulty-Calibrated Practice</p>
                <p className="text-sm text-slate-400">Questions matched to your seniority level.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                <CalendarDays className="w-4 h-4 text-teal-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">30-Day Prep Schedules</p>
                <p className="text-sm text-slate-400">Structured plans with deterministic coverage.</p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10">
            <p className="text-sm text-slate-400">
              Trusted by <span className="text-white font-semibold">500+</span> candidates worldwide
            </p>
          </div>
        </div>
      </div>


      <div className="flex-1 flex items-center justify-center bg-white px-4 sm:px-6 py-8 overflow-y-auto">
        <div className="w-full max-w-lg">

          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 flex items-center justify-center shadow-md shadow-brand-500/20">
              <Sparkles className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">Trao</span>
          </div>


          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Create Your Account</h2>
          <p className="text-sm text-slate-500 mt-1 mb-6">
            Generate tailored interview kits with deterministic coverage.
          </p>


          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}


          <form onSubmit={handleSubmit} className="space-y-4">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="Full Name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                autoComplete="name"
                leftIcon={<User className="w-4 h-4 text-slate-400" />}
              />

              <InputField
                label="Email Address"
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                autoComplete="email"
                leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
              />
            </div>


            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Dropdown
                label="Target Specialty"
                options={SPECIALTIES}
                value={targetRole}
                onChange={(val) => setTargetRole(val)}
                placeholder="Select Specialty"
              />

              <Dropdown
                label="Target Seniority"
                options={SENIORITIES}
                value={seniority}
                onChange={(val) => setSeniority(val)}
                placeholder="Select Seniority"
              />
            </div>


            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="Password"
                required
                isPassword
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="6+ characters"
                autoComplete="new-password"
                leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
              />

              <InputField
                label="Confirm Password"
                required
                isPassword
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Match password"
                autoComplete="new-password"
                leftIcon={<ShieldCheck className="w-4 h-4 text-slate-400" />}
              />
            </div>


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


            <div className="pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500/20 cursor-pointer"
                />
                <span className="text-sm text-slate-600">
                  I agree to the <span className="text-brand-600 font-semibold">Terms of Service</span> & <span className="text-brand-600 font-semibold">Privacy Policy</span>
                </span>
              </label>
            </div>


            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Create Account & Start Preparing
            </Button>
          </form>


          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-brand-600 font-semibold hover:text-brand-700"
              >
                Sign in
              </Link>
            </p>
          </div>


          <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>Secure, encrypted candidate session</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
