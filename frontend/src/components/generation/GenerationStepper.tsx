'use client';

import React, { useEffect, useState } from 'react';
import { 
  Globe, 
  Search, 
  FileText, 
  Sparkles, 
  ShieldCheck, 
  Calendar, 
  CheckCircle2, 
  Loader2, 
  AlertTriangle 
} from 'lucide-react';
import { GenerationProgress } from '@/lib/types';

interface GenerationStepperProps {
  progress?: GenerationProgress;
  companyName?: string;
}

const DEFAULT_STEPS = [
  {
    key: 'fetching_company',
    title: 'Crawling Company Domain',
    desc: 'Inspecting sitemap, discovering /careers or engineering pages',
    icon: Globe
  },
  {
    key: 'searching_discussions',
    title: 'Public Interview Research',
    desc: 'Mining community discussion on interview style & rounds',
    icon: Search
  },
  {
    key: 'extracting_requirements',
    title: 'Parsing Requirements',
    desc: 'Classifying must-haves vs nice-to-haves (tech/behavioural/domain)',
    icon: FileText
  },
  {
    key: 'generating_questions_pass_1',
    title: 'Pass 1: Question Generation',
    desc: 'Generating specialized questions per requirement category',
    icon: Sparkles
  },
  {
    key: 'closing_gaps_pass_2',
    title: 'Pass 2: Deterministic Coverage Check',
    desc: 'Comparing question-to-requirement links & closing uncovered gaps',
    icon: ShieldCheck
  },
  {
    key: 'building_schedule',
    title: 'Algorithmic Schedule Synthesis',
    desc: 'Distributing high-priority topics across requested days',
    icon: Calendar
  }
];

export function GenerationStepper({ progress, companyName }: GenerationStepperProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentStep = progress?.step ?? 1;

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg">
      <div className="flex items-center justify-between pb-6 border-b border-zinc-100 dark:border-zinc-800">
        <div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" />
            Generating Prep Kit {companyName ? `for ${companyName}` : ''}
          </h3>
          <p className="text-xs text-zinc-500 mt-1">
            Running deliberate multi-pass research & deterministic coverage checks
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs font-mono font-medium px-2.5 py-1 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
            {elapsed}s elapsed
          </span>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {DEFAULT_STEPS.map((step, idx) => {
          const stepNum = idx + 1;
          const isDone = currentStep > stepNum;
          const isCurrent = currentStep === stepNum;
          const isPending = currentStep < stepNum;
          const Icon = step.icon;

          return (
            <div
              key={step.key}
              className={`flex items-start gap-3.5 p-3 rounded-lg transition-all ${
                isCurrent
                  ? 'bg-indigo-50/70 border border-indigo-200 dark:bg-indigo-950/30 dark:border-indigo-900'
                  : 'bg-transparent'
              }`}
            >
              <div className="mt-0.5 flex-shrink-0">
                {isDone && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                )}
                {isCurrent && (
                  <Loader2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 animate-spin" />
                )}
                {isPending && (
                  <div className="w-5 h-5 rounded-full border border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-[10px] font-medium text-zinc-400">
                    {stepNum}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p
                    className={`text-sm font-medium ${
                      isCurrent
                        ? 'text-indigo-900 dark:text-indigo-200'
                        : isDone
                        ? 'text-zinc-800 dark:text-zinc-200'
                        : 'text-zinc-400 dark:text-zinc-500'
                    }`}
                  >
                    {step.title}
                  </p>
                  {isCurrent && (
                    <span className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 animate-pulse">
                      In progress...
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {progress?.warnings && progress.warnings.length > 0 && (
        <div className="mt-6 p-3 rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-900 flex items-start gap-2 text-xs text-amber-800 dark:text-amber-300">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
          <div>
            <span className="font-medium">Research Note: </span>
            {progress.warnings.join('. ')}
          </div>
        </div>
      )}
    </div>
  );
}
