import React from 'react';

export function ScheduleSkeleton() {
  return (
    <div className="space-y-6 py-2 animate-pulse">

      <div className="h-4 w-32 bg-slate-200 rounded-md" />


      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-card space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-5 w-24 bg-amber-100 rounded-full" />
          <div className="h-5 w-32 bg-slate-100 rounded-full" />
        </div>
        <div className="h-7 w-64 bg-slate-200 rounded-lg" />
        <div className="h-4 w-96 bg-slate-100 rounded-md" />
      </div>


      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="p-5 rounded-xl bg-white border border-slate-200 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 shrink-0" />
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-20 bg-slate-200 rounded-md" />
                  <div className="h-4 w-16 bg-slate-100 rounded-full" />
                </div>
                <div className="h-4 w-60 bg-slate-100 rounded-md" />
              </div>
            </div>
            <div className="h-8 w-28 bg-slate-100 rounded-lg shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
