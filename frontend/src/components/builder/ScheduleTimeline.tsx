'use client';

import React from 'react';
import { Calendar, Clock, CheckCircle2, AlertCircle, RefreshCw, ListChecks } from 'lucide-react';
import { KitSchedule, UIQuestion, KitRequirement } from '@/lib/types';
import { formatTime } from '@/lib/utils';

interface ScheduleTimelineProps {
  schedule: KitSchedule;
  questions: UIQuestion[];
  requirements: KitRequirement[];
  onRecalculateSchedule?: (days: number) => void;
  isRecalculating?: boolean;
}

export function ScheduleTimeline({
  schedule,
  questions,
  requirements,
  onRecalculateSchedule,
  isRecalculating = false
}: ScheduleTimelineProps) {
  const totalMinutes = schedule.days.reduce((acc, d) => acc + d.minutes, 0);

  // Check if every must-have requirement is scheduled
  const scheduledQuestionIds = new Set(schedule.days.flatMap((d) => d.question_ids));
  const scheduledRequirementIds = new Set<string>();
  
  questions.forEach((q) => {
    if (scheduledQuestionIds.has(q.id)) {
      q.requirement_ids.forEach((r) => scheduledRequirementIds.add(r));
    }
  });

  const mustHaves = requirements.filter((r) => r.priority === 'must');
  const allMustHavesCovered = mustHaves.every((r) => scheduledRequirementIds.has(r.id));

  return (
    <section className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                {schedule.days_available}-Day Arithmetic Preparation Schedule
              </h2>
              <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                {formatTime(totalMinutes)} total
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Deterministic priority scheduling: Harder & must-have concepts frontloaded
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {allMustHavesCovered ? (
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              100% Must-Haves Scheduled
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800 font-medium">
              <AlertCircle className="w-3.5 h-3.5" />
              Some must-haves pending
            </div>
          )}

          {onRecalculateSchedule && (
            <button
              onClick={() => onRecalculateSchedule(schedule.days_available)}
              disabled={isRecalculating}
              title="Recalculate schedule allocation across days"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRecalculating ? 'animate-spin' : ''}`} />
              Recalculate
            </button>
          )}
        </div>
      </div>

      {/* Days Timeline */}
      <div className="mt-6 space-y-4">
        {schedule.days.map((dayPlan) => {
          const dayQuestions = questions.filter((q) => dayPlan.question_ids.includes(q.id));

          return (
            <div
              key={dayPlan.day}
              className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
            >
              <div className="flex items-start justify-between gap-4 pb-3 border-b border-zinc-200/80 dark:border-zinc-800/80">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                    D{dayPlan.day}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">
                      {dayPlan.focus}
                    </h4>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      {dayQuestions.length} questions planned
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-mono font-medium px-2.5 py-1 rounded bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300">
                  <Clock className="w-3.5 h-3.5 text-indigo-500" />
                  {dayPlan.minutes} mins
                </div>
              </div>

              {/* Day's Questions */}
              <div className="mt-3 space-y-2">
                {dayQuestions.map((q) => (
                  <div
                    key={q.id}
                    className="flex items-start justify-between gap-3 p-2.5 rounded-lg bg-white dark:bg-zinc-800/70 border border-zinc-200/60 dark:border-zinc-700/60 text-xs"
                  >
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <span className="font-mono font-bold text-zinc-500 px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-700">
                        {q.id}
                      </span>
                      <p className="font-medium text-zinc-800 dark:text-zinc-200 line-clamp-1">
                        {q.prompt}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 capitalize">
                        {q.category}
                      </span>
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                        L{q.difficulty}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
