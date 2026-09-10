import React from 'react';

export function DashboardSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">

      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="h-4 w-1 rounded-full bg-brand-800 shrink-0" />
            <div className="h-6 w-56 bg-slate-200 rounded-md" />
          </div>
          <div className="h-4 w-80 bg-slate-100 rounded-md ml-3.5" />
        </div>
        <div className="h-9 w-32 bg-slate-200 rounded-lg shrink-0" />
      </div>


      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-white border border-slate-200 shadow-card">
        <div className="h-9 w-full sm:w-80 bg-slate-100 rounded-lg" />
        <div className="flex items-center gap-2">
          <div className="h-8 w-24 bg-slate-100 rounded-lg" />
          <div className="h-8 w-20 bg-slate-100 rounded-lg" />
        </div>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 shadow-card space-y-4">

            <div className="flex items-center justify-between">
              <div className="h-5 w-24 bg-slate-200 rounded-full" />
              <div className="h-4 w-20 bg-slate-100 rounded-md" />
            </div>


            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="h-4 w-1 rounded-full bg-brand-800 shrink-0 opacity-40" />
                <div className="h-5 w-44 bg-slate-200 rounded-md" />
              </div>
              <div className="h-4 w-32 bg-slate-100 rounded-md ml-3" />
            </div>


            <div className="space-y-1.5 pt-1">
              <div className="h-3.5 w-full bg-slate-100 rounded-md" />
              <div className="h-3.5 w-5/6 bg-slate-100 rounded-md" />
            </div>


            <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
              <div className="h-4 w-20 bg-slate-100 rounded-md" />
              <div className="h-4 w-16 bg-slate-100 rounded-md" />
            </div>


            <div className="pt-2 flex justify-between items-center">
              <div className="h-8 w-24 bg-slate-200 rounded-lg" />
              <div className="h-8 w-8 bg-slate-100 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
