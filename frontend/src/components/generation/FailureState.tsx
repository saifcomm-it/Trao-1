'use client';

import React from 'react';
import { AlertCircle, RefreshCw, ArrowLeft, ExternalLink, HelpCircle } from 'lucide-react';
import Link from 'next/link';

interface FailureStateProps {
  title?: string;
  message: string;
  code?: string;
  onRetry?: () => void;
  isPartialWarning?: boolean;
}

export function FailureState({
  title = 'Generation Issue Encountered',
  message,
  code,
  onRetry,
  isPartialWarning = false
}: FailureStateProps) {
  return (
    <div className={`w-full max-w-xl mx-auto p-6 rounded-xl border ${
      isPartialWarning 
        ? 'bg-amber-50/50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900' 
        : 'bg-red-50/50 border-red-200 dark:bg-red-950/20 dark:border-red-900'
    } shadow-sm`}>
      <div className="flex items-start gap-4">
        <div className={`p-2.5 rounded-lg ${
          isPartialWarning 
            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400' 
            : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400'
        }`}>
          {isPartialWarning ? <HelpCircle className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-semibold text-zinc-900 dark:text-white">
              {title}
            </h4>
            {code && (
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                {code}
              </span>
            )}
          </div>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
            {message}
          </p>

          <div className="mt-5 flex items-center gap-3">
            {onRetry && (
              <button
                onClick={onRetry}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry Attempt
              </button>
            )}
            <Link
              href="/new"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium text-zinc-700 hover:text-zinc-900 bg-white border border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-300 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Return to Form
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
