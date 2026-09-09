'use client';

import React from 'react';
import { Briefcase, CheckCircle, AlertCircle, ShieldAlert, Award } from 'lucide-react';
import { KitRole, KitRequirement } from '@/lib/types';

interface RoleBreakdownProps {
  role: KitRole;
}

export function RoleBreakdown({ role }: RoleBreakdownProps) {
  const mustHaves = role.requirements.filter((r) => r.priority === 'must');
  const niceToHaves = role.requirements.filter((r) => r.priority === 'nice');

  const getKindBadgeClass = (kind: KitRequirement['kind']) => {
    switch (kind) {
      case 'technical':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900';
      case 'behavioural':
        return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900';
      case 'domain':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900';
      default:
        return 'bg-zinc-100 text-zinc-700 border-zinc-200';
    }
  };

  return (
    <section className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
              {role.title || 'Extracted Role Target'}
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium">
                {role.seniority || 'Unspecified Seniority'}
              </span>
              <span className="text-xs text-zinc-400">•</span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {role.requirements.length} Core Requirements ({mustHaves.length} Must-have)
              </span>
            </div>
          </div>
        </div>
      </div>

      {role.responsibilities && role.responsibilities.length > 0 && (
        <div className="mt-5">
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
            Key Responsibilities
          </h3>
          <ul className="space-y-1.5">
            {role.responsibilities.map((resp, idx) => (
              <li key={idx} className="text-sm text-zinc-700 dark:text-zinc-300 flex items-start gap-2">
                <span className="text-indigo-500 mt-1">•</span>
                <span>{resp}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            Extracted Requirements & Coverage Targets
          </h3>
          <span className="text-xs text-zinc-400">
            Stable IDs anchor 100% testable question coverage
          </span>
        </div>

        <div className="grid gap-2.5 sm:grid-cols-1">
          {role.requirements.map((req) => (
            <div
              key={req.id}
              className="flex items-start justify-between gap-3 p-3 rounded-lg border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
            >
              <div className="flex items-start gap-2.5 flex-1 min-w-0">
                <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 mt-0.5">
                  {req.id}
                </span>
                <p className="text-sm text-zinc-800 dark:text-zinc-200">
                  {req.text}
                </p>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span
                  className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${getKindBadgeClass(
                    req.kind
                  )}`}
                >
                  {req.kind}
                </span>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    req.priority === 'must'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                      : 'bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'
                  }`}
                >
                  {req.priority.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
