'use client';

import React from 'react';
import Link from 'next/link';
import {
  FolderSearch,
  ArrowLeft,
  Plus,
  Sparkles,
  LucideIcon
} from 'lucide-react';

export interface IDataNotFoundStateProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  primaryAction?: {
    label: string;
    href: string;
    icon?: LucideIcon;
  };
  secondaryAction?: {
    label: string;
    href: string;
    icon?: LucideIcon;
  };
}

export function DataNotFoundState({
  title = 'Kit Not Found',
  description = 'This preparation kit does not exist in your database or may have been deleted.',
  icon: Icon = FolderSearch,
  primaryAction = {
    label: 'Return to Dashboard',
    href: '/dashboard',
    icon: ArrowLeft
  },
  secondaryAction = {
    label: 'Create New Kit',
    href: '/new',
    icon: Plus
  }
}: IDataNotFoundStateProps) {
  const PrimaryIcon = primaryAction?.icon || ArrowLeft;
  const SecondaryIcon = secondaryAction?.icon || Plus;

  return (
    <div className="w-full max-w-lg mx-auto my-8 sm:my-14 px-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="relative bg-white rounded-3xl border border-slate-200/90 shadow-2xl shadow-brand-900/10 p-8 sm:p-11 text-center overflow-hidden">

        <div className="absolute -top-24 -right-24 w-56 h-56 bg-gradient-to-br from-brand-400/20 to-brand-600/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-56 h-56 bg-gradient-to-tr from-teal-400/15 to-brand-500/5 rounded-full blur-3xl pointer-events-none" />


        <div className="relative mx-auto mb-6 w-20 h-20 rounded-3xl bg-gradient-to-br from-brand-50 via-white to-brand-100/70 border border-brand-200/80 shadow-xl shadow-brand-500/15 flex items-center justify-center text-brand-600 group transition-transform duration-300 hover:scale-105">
          <Icon className="w-9 h-9 stroke-[1.75]" />


          <span className="absolute -top-1.5 -right-1.5 w-6.5 h-6.5 rounded-full bg-gradient-to-br from-brand-600 to-brand-700 text-white shadow-md shadow-brand-500/35 flex items-center justify-center ring-2 ring-white">
            <Sparkles className="w-3.5 h-3.5" />
          </span>
        </div>


        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          {title}
        </h2>


        <p className="mt-2 text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
          {description}
        </p>


        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-3.5 pt-1">
          {primaryAction && (
            <Link
              href={primaryAction.href}
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2.5 h-11 px-6 sm:px-7 rounded-2xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-brand-600 via-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 shadow-lg shadow-brand-500/25 hover:shadow-xl hover:shadow-brand-500/35 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 whitespace-nowrap cursor-pointer"
            >
              <PrimaryIcon className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1 shrink-0" />
              <span>{primaryAction.label}</span>
            </Link>
          )}

          {secondaryAction && (
            <Link
              href={secondaryAction.href}
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2.5 h-11 px-6 sm:px-7 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 hover:text-brand-700 bg-white hover:bg-brand-50/50 border border-slate-200 hover:border-brand-300/80 shadow-xs hover:shadow-md hover:shadow-brand-500/10 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 whitespace-nowrap cursor-pointer"
            >
              <SecondaryIcon className="w-4 h-4 text-brand-600 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-12 shrink-0" />
              <span>{secondaryAction.label}</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
