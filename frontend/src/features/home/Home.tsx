'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, ShieldCheck, Calendar, Layers } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-20 max-w-5xl mx-auto text-center">

      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-xs font-semibold text-brand-600 mb-8 shadow-xs">
        <Sparkles className="w-3.5 h-3.5 text-brand-600" />
        Automated Job Research & Multi-Pass Interview Prep
      </div>


      <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
        Turn Any Job Description Into a{' '}
        <span className="text-brand-600">
          Personalized Interview Kit
        </span>
      </h1>

      <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
        Paste any job description and company URL. The engine crawls the company site, mines public interview discussions, categorizes must-have requirements, and generates a day-by-day study schedule with 100% testable coverage.
      </p>


      <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
        <Link
          href="/new"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 h-12 px-7 rounded-xl text-base font-bold text-white bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 shadow-lg shadow-brand-500/25 transition-all"
        >
          <Sparkles className="w-5 h-5" />
          <span>Create Your Prep Kit</span>
          <ArrowRight className="w-5 h-5" />
        </Link>
        <Link
          href="/dashboard"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 h-12 px-7 rounded-xl text-base font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 shadow-xs hover:shadow transition-all"
        >
          View Dashboard
        </Link>
      </div>


      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 text-left w-full">
        <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-card hover:shadow-pop transition-shadow">
          <div className="p-2.5 rounded-xl bg-brand-50 text-brand-600 border border-brand-200 w-fit mb-4">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            Deterministic Coverage Check
          </h3>
          <p className="mt-2 text-xs text-slate-500 leading-relaxed">
            Multi-pass verification loops guarantee that every extracted must-have requirement has dedicated interview questions.
          </p>
        </div>

        <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-card hover:shadow-pop transition-shadow">
          <div className="p-2.5 rounded-xl bg-brand-50 text-brand-600 border border-brand-200 w-fit mb-4">
            <Calendar className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            Arithmetic Study Schedule
          </h3>
          <p className="mt-2 text-xs text-slate-500 leading-relaxed">
            Distributes review items across exactly N days, ensuring harder technical concepts are scheduled early.
          </p>
        </div>

        <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-card hover:shadow-pop transition-shadow">
          <div className="p-2.5 rounded-xl bg-brand-50 text-brand-600 border border-brand-200 w-fit mb-4">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            Preserved Edit State
          </h3>
          <p className="mt-2 text-xs text-slate-500 leading-relaxed">
            Regenerate individual sections or categories without clobbering your hand-crafted questions or edited notes.
          </p>
        </div>
      </div>
    </div>
  );
}
