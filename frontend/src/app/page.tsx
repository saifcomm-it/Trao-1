import Link from 'next/link';
import { Sparkles, ArrowRight, ShieldCheck, Calendar, Layers, Terminal } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-20 max-w-5xl mx-auto text-center">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-8">
        <Sparkles className="w-3.5 h-3.5" />
        Automated Job Research & Multi-Pass Interview Prep
      </div>

      {/* Hero Title */}
      <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-[1.15]">
        Turn Any Job Description Into a{' '}
        <span className="text-indigo-600 dark:text-indigo-400">
          Personalized Interview Kit
        </span>
      </h1>

      <p className="mt-6 text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
        Paste any job description and company URL. The engine crawls the company site, mines public interview discussions, categorizes must-have requirements, and generates a day-by-day study schedule with 100% testable coverage.
      </p>

      {/* CTAs */}
      <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
        <Link
          href="/new"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02]"
        >
          <Sparkles className="w-4 h-4" />
          Create Your Prep Kit
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          href="/dashboard"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 shadow-sm transition-all"
        >
          View Dashboard
        </Link>
      </div>

      {/* Feature Highlights Grid */}
      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 text-left w-full">
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 w-fit mb-4">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
            Deterministic Coverage Check
          </h3>
          <p className="mt-2 text-xs text-zinc-500 leading-relaxed">
            Multi-pass verification loops guarantee that every extracted must-have requirement has dedicated interview questions.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 w-fit mb-4">
            <Calendar className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
            Arithmetic Study Schedule
          </h3>
          <p className="mt-2 text-xs text-zinc-500 leading-relaxed">
            Distributes review items across exactly N days, ensuring harder technical concepts are scheduled early.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 w-fit mb-4">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
            Preserved Edit State
          </h3>
          <p className="mt-2 text-xs text-zinc-500 leading-relaxed">
            Regenerate individual sections or categories without clobbering your hand-crafted questions or edited notes.
          </p>
        </div>
      </div>
    </div>
  );
}
