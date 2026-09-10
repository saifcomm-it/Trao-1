import React from 'react';

export function ProfileSkeleton() {
  return (
    <div className="w-full py-6 space-y-6 animate-pulse">

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-card space-y-6">

        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <span className="h-4 w-1 rounded-full bg-brand-800 shrink-0 opacity-40" />
            <div className="space-y-1.5">
              <div className="h-6 w-48 bg-slate-200 rounded-md" />
              <div className="h-4 w-72 bg-slate-100 rounded-md" />
            </div>
          </div>
          <div className="h-6 w-28 bg-emerald-100 rounded-full" />
        </div>


        <div className="space-y-4">
          <div className="h-4 w-36 bg-slate-200 rounded-md" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1.5">
              <div className="h-3.5 w-20 bg-slate-200 rounded-md" />
              <div className="h-9 w-full bg-slate-100 rounded-lg" />
            </div>
            <div className="space-y-1.5">
              <div className="h-3.5 w-24 bg-slate-200 rounded-md" />
              <div className="h-9 w-full bg-slate-100 rounded-lg" />
            </div>
          </div>
        </div>


        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="h-4 w-44 bg-slate-200 rounded-md" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1.5">
              <div className="h-3.5 w-32 bg-slate-200 rounded-md" />
              <div className="h-9 w-full bg-slate-100 rounded-lg" />
            </div>
            <div className="space-y-1.5">
              <div className="h-3.5 w-36 bg-slate-200 rounded-md" />
              <div className="h-9 w-full bg-slate-100 rounded-lg" />
            </div>
          </div>
        </div>


        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <div className="h-9 w-28 bg-brand-800 opacity-40 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
