import React from 'react';

export function PracticeSkeleton() {
  return (
    <div className="w-full py-2 space-y-4 animate-pulse">

      <div className="h-4 w-32 bg-slate-200 rounded-md" />


      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-card space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-5 w-24 bg-emerald-100 rounded-full" />
          <div className="h-5 w-32 bg-slate-100 rounded-full" />
        </div>
        <div className="h-7 w-64 bg-slate-200 rounded-lg" />
        <div className="h-4 w-96 bg-slate-100 rounded-md" />
      </div>


      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-card space-y-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="h-5 w-20 bg-slate-100 rounded-full" />
          <div className="h-8 w-8 bg-slate-100 rounded-lg" />
        </div>


        <div className="py-12 text-center space-y-3">
          <div className="h-6 w-3/4 bg-slate-200 rounded-md mx-auto" />
          <div className="h-4 w-1/2 bg-slate-100 rounded-md mx-auto" />
        </div>


        <div className="h-24 w-full bg-slate-50 border border-slate-200 rounded-xl" />


        <div className="grid grid-cols-3 gap-3 pt-2">
          <div className="h-10 bg-rose-50 border border-rose-100 rounded-lg" />
          <div className="h-10 bg-amber-50 border border-amber-100 rounded-lg" />
          <div className="h-10 bg-emerald-50 border border-emerald-100 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
