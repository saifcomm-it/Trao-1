'use client';

import React from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCw, ArrowLeft, HelpCircle } from 'lucide-react';
import { IFailureStateProps } from '../interfaces/new-kit.interface';

export function FailureState({
  title = 'Generation Issue Encountered',
  message,
  code,
  onRetry,
  isPartialWarning = false
}: IFailureStateProps) {
  return (
    <div className={`w-full max-w-xl mx-auto p-6 rounded-xl border ${
      isPartialWarning
        ? 'bg-amber-50 border-amber-200'
        : 'bg-rose-50 border-rose-200'
    } shadow-card`}>
      <div className="flex items-start gap-4">
        <div className={`p-2.5 rounded-lg ${
          isPartialWarning
            ? 'bg-amber-100 text-amber-800'
            : 'bg-rose-100 text-rose-800'
        }`}>
          {isPartialWarning ? <HelpCircle className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-bold text-slate-900">
              {title}
            </h4>
            {code && (
              <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-slate-200 text-slate-700 border border-slate-300 font-semibold">
                {code}
              </span>
            )}
          </div>
          <p className="mt-2 text-sm text-slate-700 leading-relaxed">
            {message}
          </p>

          <div className="mt-5 flex items-center gap-3">
            {onRetry && (
              <button
                onClick={onRetry}
                className="inline-flex items-center gap-2 h-10 px-4.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 shadow-lg shadow-brand-500/25 transition-all cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry Attempt</span>
              </button>
            )}
            <Link
              href="/new"
              className="inline-flex items-center gap-2 h-10 px-4.5 rounded-xl text-sm font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-300 hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Form</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
