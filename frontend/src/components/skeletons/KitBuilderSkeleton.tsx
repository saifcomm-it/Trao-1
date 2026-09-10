import React from 'react';

export function KitBuilderSkeleton() {
  return (
    <div className="space-y-6 sm:space-y-8 py-2 animate-pulse">

      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <div className="h-5 w-28 bg-slate-200 rounded-full" />
          <div className="h-5 w-24 bg-slate-100 rounded-full" />
          <div className="h-5 w-32 bg-slate-100 rounded-full" />
        </div>
        <div className="h-8 w-72 sm:w-96 bg-slate-300 rounded-lg" />
      </div>


      <div className="p-5 sm:p-6 rounded-xl border border-teal-200 bg-teal-50/40 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-card">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-teal-200 shrink-0" />
          <div className="space-y-2">
            <div className="h-5 w-48 bg-teal-200 rounded-md" />
            <div className="h-3.5 w-72 bg-teal-100 rounded-md" />
          </div>
        </div>
        <div className="h-8 w-28 bg-white/80 rounded-lg shrink-0" />
      </div>


      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-card space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <span className="h-4 w-1 rounded-full bg-brand-800 shrink-0 opacity-40" />
            <div className="h-5 w-40 bg-slate-200 rounded-md" />
          </div>
          <div className="h-8 w-24 bg-slate-100 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="h-4 w-32 bg-slate-200 rounded-md" />
            <div className="h-3.5 w-full bg-slate-100 rounded-md" />
            <div className="h-3.5 w-5/6 bg-slate-100 rounded-md" />
            <div className="h-3.5 w-4/6 bg-slate-100 rounded-md" />
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="h-4 w-36 bg-slate-200 rounded-md" />
            <div className="h-3.5 w-full bg-slate-100 rounded-md" />
            <div className="h-3.5 w-5/6 bg-slate-100 rounded-md" />
            <div className="h-3.5 w-4/6 bg-slate-100 rounded-md" />
          </div>
        </div>
      </div>


      <div className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="space-y-1">
            <div className="h-6 w-52 bg-slate-200 rounded-md" />
            <div className="h-3.5 w-72 bg-slate-100 rounded-md" />
          </div>
          <div className="h-8 w-36 bg-slate-200 rounded-lg" />
        </div>


        {[1, 2, 3].map((i) => (
          <div key={i} className="p-5 rounded-xl bg-white border border-slate-200 shadow-card space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-5 w-16 bg-slate-200 rounded-full" />
                <div className="h-5 w-20 bg-slate-100 rounded-full" />
              </div>
              <div className="h-8 w-24 bg-slate-100 rounded-lg" />
            </div>
            <div className="h-5 w-3/4 bg-slate-200 rounded-md" />
            <div className="h-16 w-full bg-slate-50 border border-slate-100 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
