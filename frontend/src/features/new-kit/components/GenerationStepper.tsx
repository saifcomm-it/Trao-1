'use client';

import React, { useEffect, useState } from 'react';
import {
  Globe,
  Search,
  FileText,
  Sparkles,
  ShieldCheck,
  Calendar,
  Check,
  CheckCircle2,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { IGenerationStepperProps } from '../interfaces/new-kit.interface';

const STEPS = [
  {
    key: 'fetching_company',
    title: 'Crawling Company Domain',
    desc: 'Inspecting sitemap, discovering /careers or engineering presence',
    icon: Globe,
    badge: 'Network Crawl'
  },
  {
    key: 'extracting_requirements',
    title: 'Parsing Requirements',
    desc: 'Classifying must-haves vs nice-to-haves (tech, behavioural, domain)',
    icon: FileText,
    badge: 'NLP Parsing'
  },
  {
    key: 'generating_brief',
    title: 'Company Research & Context',
    desc: 'Mining public interview discussions & synthesizing company brief',
    icon: Search,
    badge: 'Intelligence'
  },
  {
    key: 'generating_questions_pass_1',
    title: 'Pass 1: Question Generation',
    desc: 'Generating specialized questions per requirement category',
    icon: Sparkles,
    badge: 'AI Generation'
  },
  {
    key: 'closing_gaps_pass_2',
    title: 'Pass 2: Deterministic Coverage Check',
    desc: 'Verifying question-to-requirement links & closing uncovered gaps',
    icon: ShieldCheck,
    badge: 'Audit & Safety'
  },
  {
    key: 'building_schedule',
    title: 'Flashcard & Schedule Allocation',
    desc: 'Distributing high-priority topics & synthesizing active recall cards',
    icon: Calendar,
    badge: 'Synthesis'
  }
];

export function GenerationStepper({ progress, companyName }: IGenerationStepperProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentStep = progress?.step ?? 1;
  const isComplete = currentStep > STEPS.length;
  const percent = Math.min(
    100,
    Math.round(((Math.min(currentStep, STEPS.length) - (isComplete ? 0 : 0.4)) / STEPS.length) * 100)
  );

  const formattedCompany = companyName
    ? companyName
        .replace(/^https?:\/\//i, '')
        .replace(/^www\./i, '')
        .split(/[/?#]/)[0]
        .split('.')[0]
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase())
    : '';

  return (
    <div className="relative w-full max-w-2xl mx-auto rounded-3xl border border-slate-200/90 bg-white/95 backdrop-blur-xl shadow-pop overflow-hidden transition-all">

      <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-gradient-to-br from-brand-400/15 via-indigo-500/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-gradient-to-tr from-teal-400/15 via-emerald-500/10 to-transparent blur-3xl pointer-events-none" />


      <div className="p-6 pb-5 border-b border-slate-100/90 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center shadow-glow flex-shrink-0">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  Generating Prep Kit
                </h3>
                {formattedCompany && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200/80">
                    <Globe className="w-3 h-3 text-brand-600" />
                    {formattedCompany}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Deliberate multi-pass AI research & deterministic coverage
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="flex items-center gap-1.5 font-mono text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-50 text-slate-700 border border-slate-200/80 shadow-xs">
              <Clock className="w-3.5 h-3.5 text-brand-600 animate-spin" style={{ animationDuration: '4s' }} />
              <span>{elapsed}s elapsed</span>
            </div>
          </div>
        </div>


        <div className="mt-5 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-600">
              Stage <span className="text-slate-900 font-bold">{Math.min(currentStep, STEPS.length)}</span> of {STEPS.length}
              <span className="mx-1.5 text-slate-300">•</span>
              <span className="text-brand-700 font-medium">
                {STEPS[Math.min(currentStep, STEPS.length) - 1]?.title}
              </span>
            </span>
            <span className="font-mono text-brand-700 font-bold bg-brand-50 px-2 py-0.5 rounded-md border border-brand-200/70">
              {percent}%
            </span>
          </div>

          <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden relative shadow-inner p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-600 via-indigo-600 to-teal-500 transition-all duration-700 ease-out relative overflow-hidden"
              style={{ width: `${percent}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
            </div>
          </div>
        </div>
      </div>


      <div className="p-6 space-y-3.5 relative z-10">
        {STEPS.map((step, idx) => {
          const stepNum = idx + 1;
          const isDone = currentStep > stepNum;
          const isCurrent = currentStep === stepNum;
          const isPending = currentStep < stepNum;
          const isLast = idx === STEPS.length - 1;
          const StepIcon = step.icon;

          return (
            <div key={step.key} className="relative flex items-start gap-4">

              {!isLast && (
                <div
                  className={`absolute left-5 top-11 bottom-0 w-0.5 -ml-px transition-colors duration-500 ${
                    isDone
                      ? 'bg-gradient-to-b from-teal-500 to-teal-400'
                      : isCurrent
                      ? 'bg-gradient-to-b from-brand-500 via-brand-300 to-slate-200'
                      : 'bg-slate-200'
                  }`}
                />
              )}


              <div className="relative flex-shrink-0 z-10">
                {isDone ? (
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white flex items-center justify-center shadow-md shadow-teal-500/25 ring-4 ring-teal-50">
                    <Check className="w-5 h-5 stroke-[2.5]" />
                  </div>
                ) : isCurrent ? (
                  <div className="relative">

                    <span className="absolute -inset-1 rounded-2xl bg-brand-500/30 animate-beacon" />
                    <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-600 via-indigo-600 to-brand-700 text-white flex items-center justify-center shadow-glow ring-4 ring-brand-100">
                      <StepIcon className="w-5 h-5 animate-pulse" />
                      <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-500 ring-2 ring-white" />
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-2xl bg-slate-100/90 border border-slate-200/80 text-slate-400 flex items-center justify-center font-medium transition-colors">
                    <StepIcon className="w-4 h-4 opacity-50" />
                  </div>
                )}
              </div>


              <div
                className={`flex-1 min-w-0 transition-all duration-300 rounded-2xl ${
                  isCurrent
                    ? 'p-4 bg-gradient-to-r from-brand-50/90 via-indigo-50/35 to-white border-2 border-brand-200/90 shadow-sm'
                    : isDone
                    ? 'p-3.5 bg-slate-50/70 border border-slate-100 hover:bg-slate-50 transition-colors'
                    : 'p-3.5 bg-transparent border border-transparent opacity-60'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-wrap">
                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md shrink-0 border ${
                        isCurrent
                          ? 'bg-brand-100 text-brand-800 border-brand-300'
                          : isDone
                          ? 'bg-teal-50 text-teal-700 border-teal-200'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}
                    >
                      Step {stepNum}
                    </span>
                    <p
                      className={`text-sm font-semibold truncate ${
                        isCurrent
                          ? 'text-brand-950 font-bold'
                          : isDone
                          ? 'text-slate-800'
                          : 'text-slate-500'
                      }`}
                    >
                      {step.title}
                    </p>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                        isCurrent
                          ? 'bg-brand-100/80 text-brand-800 border-brand-300/80 font-semibold'
                          : isDone
                          ? 'bg-teal-50 text-teal-700 border-teal-200/60'
                          : 'bg-slate-100 text-slate-400 border-slate-200'
                      }`}
                    >
                      {step.badge}
                    </span>
                  </div>

                  {isCurrent && (
                    <span className="flex-shrink-0 inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-brand-600 text-white shadow-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      In Progress
                    </span>
                  )}
                  {isDone && (
                    <span className="flex-shrink-0 inline-flex items-center gap-1 text-xs font-medium text-teal-600">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Done
                    </span>
                  )}
                  {isPending && (
                    <span className="flex-shrink-0 text-xs font-medium text-slate-400">
                      Upcoming
                    </span>
                  )}
                </div>

                <p
                  className={`text-xs mt-1 leading-relaxed ${
                    isCurrent
                      ? 'text-slate-700 font-normal'
                      : isDone
                      ? 'text-slate-500'
                      : 'text-slate-400'
                  }`}
                >
                  {step.desc}
                </p>


                {isCurrent && (
                  <div className="mt-3 px-3 py-2 rounded-xl bg-white/95 border border-brand-200/80 shadow-xs flex items-center gap-2.5 text-xs text-brand-950 font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    <span className="truncate">
                      {progress?.message || 'Executing deliberate multi-pass research...'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>


      {progress?.warnings && progress.warnings.length > 0 && (
        <div className="mx-6 mb-6 p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200/90 flex items-start gap-2.5 text-xs text-amber-900 shadow-xs relative z-10">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
          <div>
            <span className="font-bold text-amber-950">Research Advisory: </span>
            {progress.warnings.join('. ')}
          </div>
        </div>
      )}


      <div className="px-6 py-4 bg-slate-50/90 border-t border-slate-100/90 flex items-center justify-between text-xs text-slate-500 relative z-10">
        <span className="flex items-center gap-1.5 font-medium text-slate-700">
          <ShieldCheck className="w-4 h-4 text-teal-600" />
          Deterministic Multi-Pass Verification
        </span>
      </div>
    </div>
  );
}
