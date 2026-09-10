'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Plus } from 'lucide-react';
import { IEmptyStateProps } from '../interfaces/dashboard.interface';

export function EmptyState({ onCreateClick }: IEmptyStateProps) {
  return (
    <div className="mt-12 p-12 text-center bg-white rounded-xl border border-dashed border-slate-300 max-w-lg mx-auto shadow-card">
      <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 border border-brand-200 flex items-center justify-center mx-auto mb-4">
        <Sparkles className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-slate-900">
        No kits created yet
      </h3>
      <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
        Paste a job description and company website to dynamically research and generate your first personalized prep kit.
      </p>
      <Link
        href="/new"
        onClick={onCreateClick}
        className="mt-6 inline-flex items-center gap-2 h-9 px-4 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 shadow-md shadow-brand-500/20 transition-all active:scale-[0.99]"
      >
        <Plus className="w-4 h-4" />
        <span>Create Your First Kit</span>
      </Link>
    </div>
  );
}
