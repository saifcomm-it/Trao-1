'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { usePractice } from '../hooks/usePractice';
import { FlashcardDeck } from './FlashcardDeck';
import { IPracticeViewProps } from '../interfaces/practice.interface';
import { cleanText, cleanRoleTitle } from '@/lib/utils';
import { PracticeSkeleton } from '@/components/skeletons/PracticeSkeleton';
import { DataNotFoundState } from '@/components/DataNotFoundState';

export function PracticeView({ kitId }: IPracticeViewProps) {
  const { kit, isLoading, error } = usePractice(kitId);

  if (isLoading) {
    return <PracticeSkeleton />;
  }

  if (error || !kit) {
    return (
      <div className="py-10 sm:py-16">
        <DataNotFoundState
          title="Practice Hub Unavailable"
          description={error || 'This interview preparation kit does not exist in your database or was recently deleted.'}
          primaryAction={{
            label: 'Return to Dashboard',
            href: '/dashboard'
          }}
          secondaryAction={{
            label: 'Create New Kit',
            href: '/new'
          }}
        />
      </div>
    );
  }

  return (
    <div className="w-full py-2 space-y-4">

      <div className="flex items-center justify-between gap-4 pb-1">
        <Link
          href={`/kit/${kitId}`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-brand-600 transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Kit Builder</span>
        </Link>
      </div>


      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
                {cleanText(kit?.source?.company, 'Company')}
              </span>
              <span className="text-xs text-slate-300">•</span>
              <span className="text-xs font-semibold text-slate-500">
                Active Recall Practice Hub
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-1">
              {cleanRoleTitle(kit?.role?.title, 'Role')} Flashcards
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Practice active recall with voice synthesis, typed self-check answers, and smart confidence tracking
            </p>
          </div>
        </div>
      </div>

      <FlashcardDeck kitId={kitId} />
    </div>
  );
}
