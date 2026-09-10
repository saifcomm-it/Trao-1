'use client';

import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Mail,
  Briefcase,
  Award,
  Lock,
  Save,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  X
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { ProfileSkeleton } from '@/components/skeletons/ProfileSkeleton';
import { InputField, Badge, Button, Dropdown } from '@/shared/components';


const SENIORITY_LEVELS = [
  { value: 'Junior (0-2 years)', label: 'Junior (0-2 years)' },
  { value: 'Mid-Level (2-5 years)', label: 'Mid-Level (2-5 years)' },
  { value: 'Senior (5-8 years)', label: 'Senior (5-8 years)' },
  { value: 'Lead / Staff (8+ years)', label: 'Lead / Staff (8+ years)' },
  { value: 'Principal / Executive', label: 'Principal / Executive' }
];

const POPULAR_ROLES = [
  'Software Engineer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Engineer',
  'DevOps Engineer',
  'Cloud Architect',
  'Machine Learning Engineer',
  'Data Engineer',
  'Mobile Developer',
  'Security Engineer',
  'SharePoint Developer'
];

export function ProfileView() {
  const { user, updateUser, isLoading: isAuthLoading } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [targetRole, setTargetRole] = useState(user?.targetRole || '');
  const [seniority, setSeniority] = useState(user?.seniority || 'Mid-Level (2-5 years)');


  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');


  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);

  useEffect(() => {
    if (showSuccessPopup) {
      const timer = setTimeout(() => setShowSuccessPopup(false), 4500);
      return () => clearTimeout(timer);
    }
  }, [showSuccessPopup]);

  useEffect(() => {
    if (showErrorPopup) {
      const timer = setTimeout(() => setShowErrorPopup(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showErrorPopup]);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setTargetRole(user.targetRole || '');
      setSeniority(user.seniority || 'Mid-Level (2-5 years)');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);
    setShowErrorPopup(false);


    if (newPassword || confirmPassword || currentPassword) {
      if (!currentPassword) {
        setErrorMessage('Please enter your current password to authorize this update.');
        setShowErrorPopup(true);
        return;
      }
      if (newPassword.length < 6) {
        setErrorMessage('New password must be at least 6 characters.');
        setShowErrorPopup(true);
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMessage('New passwords do not match. Please verify.');
        setShowErrorPopup(true);
        return;
      }
    }

    setIsLoading(true);

    try {
      const payload: any = {
        name: name.trim(),
        email: email.trim(),
        targetRole: targetRole.trim(),
        seniority: seniority.trim()
      };

      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const res = await api.updateProfile(payload);

      if (res.user) {
        updateUser(res.user, res.token);
      }

      setSuccessMessage('Profile and account details updated successfully in database!');
      setShowSuccessPopup(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to update profile. Please check your details.');
      setShowErrorPopup(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthLoading) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="w-full py-6 relative max-w-4xl mx-auto">

      {showSuccessPopup && (
        <div className="fixed top-6 right-4 sm:right-8 z-50 max-w-md w-[calc(100%-2rem)] sm:w-auto animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-emerald-300 p-4 shadow-xl shadow-emerald-900/10 flex items-start gap-3.5 ring-1 ring-emerald-500/20">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/25">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="flex-1 pr-2 pt-0.5">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900">Profile Updated Successfully!</h4>
                <Badge tone="success" size="sm">Saved</Badge>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Your profile changes, target role, and account settings have been saved to the database.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowSuccessPopup(false)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
              title="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}


      {showErrorPopup && errorMessage && (
        <div className="fixed top-6 right-4 sm:right-8 z-50 max-w-md w-[calc(100%-2rem)] sm:w-auto animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-red-300 p-4 shadow-xl shadow-red-900/10 flex items-start gap-3.5 ring-1 ring-red-500/20">
            <div className="w-10 h-10 rounded-xl bg-red-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-red-500/25">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="flex-1 pr-2 pt-0.5">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900">Validation Error</h4>
                <Badge tone="danger" size="sm">Action Required</Badge>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {errorMessage}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowErrorPopup(false)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
              title="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}


      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-card space-y-6">

        <div className="flex items-center justify-between gap-4 flex-wrap pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <span className="h-5 w-1.5 rounded-full bg-brand-800 shrink-0" />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-bold text-brand-900 tracking-tight">
                  {name || 'Candidate Profile'}
                </h1>
                <Badge tone="brand">
                  {targetRole || 'Candidate'}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {email} • Manage your personal details, career targets, and security password.
              </p>
            </div>
          </div>

          <Badge tone="success" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
            Account Verified
          </Badge>
        </div>


        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900">Personal Information</h2>
            <span className="text-xs text-slate-400">• Profile details registered at signup</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="Full Name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dawood Iftikhar"
              leftIcon={<UserIcon className="w-4 h-4 text-slate-400" />}
            />

            <InputField
              label="Email Address"
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="candidate@company.com"
              leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
            />
          </div>
        </div>


        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900">Career & Role Alignment</h2>
            <span className="text-xs text-slate-400">• Tailors question difficulty to your level</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <InputField
                label="Target Role / Specialization"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Full Stack Developer"
                leftIcon={<Briefcase className="w-4 h-4 text-slate-400" />}
                list="role-suggestions"
              />
              <datalist id="role-suggestions">
                {POPULAR_ROLES.map((r) => (
                  <option key={r} value={r} />
                ))}
              </datalist>
            </div>

            <Dropdown
              label="Seniority / Experience Tier"
              options={SENIORITY_LEVELS}
              value={seniority}
              onChange={(val) => setSeniority(val)}
            />
          </div>
        </div>


        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900">Change Password</h2>
            <span className="text-xs text-slate-400">• Leave blank to keep current password</span>
          </div>

          <div className="space-y-3.5 max-w-lg">
            <InputField
              label="Current Password"
              isPassword
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
            />

            <InputField
              label="New Password"
              isPassword
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 6 characters"
              leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
            />

            <InputField
              label="Confirm New Password"
              isPassword
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
            />
          </div>
        </div>


        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100">
          <div>
            {showSuccessPopup && (
              <Badge tone="success" icon={<CheckCircle2 className="w-4 h-4" />}>
                Profile updated successfully!
              </Badge>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isLoading}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Profile Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
