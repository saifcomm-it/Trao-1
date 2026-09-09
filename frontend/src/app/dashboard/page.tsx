'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Sparkles, 
  Building2, 
  Calendar, 
  BookOpen, 
  ArrowRight, 
  Trash2, 
  Clock, 
  CheckCircle2, 
  ExternalLink,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { InterviewPrepKit, UIInterviewPrepKit } from '@/lib/types';
import { samplePrepKit } from '@/lib/mock-data';
import { formatDate } from '@/lib/utils';

export default function DashboardPage() {
  const { user } = useAuth();
  const [kits, setKits] = useState<UIInterviewPrepKit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadKits();
  }, [user]);

  const loadKits = async () => {
    setIsLoading(true);
    try {
      const serverKits = await api.getKits();
      if (serverKits && serverKits.length > 0) {
        setKits(serverKits as UIInterviewPrepKit[]);
      } else {
        // Check local storage for created kits
        const localSaved = localStorage.getItem('trao_saved_kits');
        if (localSaved) {
          setKits(JSON.parse(localSaved));
        } else {
          // Initialize with sample kit for demonstration
          setKits([samplePrepKit]);
          localStorage.setItem('trao_saved_kits', JSON.stringify([samplePrepKit]));
        }
      }
    } catch (err) {
      // Offline fallback
      const localSaved = localStorage.getItem('trao_saved_kits');
      if (localSaved) {
        setKits(JSON.parse(localSaved));
      } else {
        setKits([samplePrepKit]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this prep kit?')) return;

    try {
      await api.deleteKit(id);
    } catch {
      // Local delete
    }

    const updated = kits.filter((k) => (k.id || '') !== id);
    setKits(updated);
    localStorage.setItem('trao_saved_kits', JSON.stringify(updated));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Interview Preparation Kits
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Personalized role guides, categorized questions, and day-by-day study schedules
          </p>
        </div>

        <Link
          href="/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          Create New Prep Kit
        </Link>
      </div>

      {/* Kit Grid */}
      {isLoading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-zinc-500">Loading your preparation kits...</p>
        </div>
      ) : kits.length === 0 ? (
        <div className="mt-12 p-12 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
            No kits created yet
          </h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
            Paste a job description and company URL to generate your first personalized interview prep kit.
          </p>
          <Link
            href="/new"
            className="mt-6 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Create Your First Kit
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {kits.map((kit) => {
            const kitId = kit.id || 'sample-kit-01';
            const mustHavesCount = kit.role?.requirements?.filter((r) => r.priority === 'must').length || 0;

            return (
              <div
                key={kitId}
                className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-900/60 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                          {kit.source.company}
                        </span>
                        <h3 className="text-base font-bold text-zinc-900 dark:text-white line-clamp-1">
                          {kit.role.title}
                        </h3>
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleDelete(kitId, e)}
                      title="Delete kit"
                      className="text-zinc-400 hover:text-red-600 p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="mt-3 text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                    {kit.company_brief.summary}
                  </p>

                  <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-wrap gap-2 text-xs">
                    <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                      {kit.questions.length} Questions
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                      {mustHavesCount} Must-Haves
                    </span>
                    <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
                      {kit.schedule.days_available} Days Plan
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-3">
                  <Link
                    href={`/kit/${kitId}/practice`}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    Practice Cards
                  </Link>

                  <Link
                    href={`/kit/${kitId}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all group-hover:translate-x-0.5"
                  >
                    Open Kit
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
