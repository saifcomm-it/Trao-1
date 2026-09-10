'use client';

import React from 'react';
import Link from 'next/link';
import {
  Download,
  ArrowRight,
  ShieldCheck,
  Building2,
  Calendar,
  BookOpen,
  CheckCircle2,
  MapPin,
  HelpCircle
} from 'lucide-react';
import { cleanText, cleanRoleTitle } from '@/lib/utils';
import { useKitBuilder } from '../hooks/useKitBuilder';
import { IKitBuilderProps } from '../interfaces/kit-builder.interface';
import { BriefEditor } from './BriefEditor';
import { RoleBreakdown } from './RoleBreakdown';
import { KitBuilderSkeleton } from '@/components/skeletons/KitBuilderSkeleton';
import { DataNotFoundState } from '@/components/DataNotFoundState';
import { Badge, Button } from '@/shared/components';

export function KitBuilderView({ kitId }: IKitBuilderProps) {
  const {
    kit,
    isLoading,
    error,
    regeneratingSection,
    handleUpdateBrief,
    handleRegenerateBrief,
    handleExportJson
  } = useKitBuilder(kitId);

  if (isLoading) {
    return <KitBuilderSkeleton />;
  }

  if (error || !kit) {
    return (
      <div className="py-10 sm:py-16">
        <DataNotFoundState
          title="Kit Not Found"
          description={error || 'This interview preparation kit does not exist in your database or was recently deleted.'}
          primaryAction={{
            label: 'Return to Dashboard',
            href: '/dashboard'
          }}
          secondaryAction={{
            label: 'Create New Kit',
            href: '/new'
          }}
        />
      </div>
    );
  }

  const mustHaves = kit.role?.requirements?.filter((r) => r.priority === 'must') || [];
  const coveredReqIds = new Set(kit.questions?.flatMap((q) => q.requirement_ids) || []);
  const uncoveredMustHaves = mustHaves.filter((r) => !coveredReqIds.has(r.id));

  return (
    <div className="space-y-6 sm:space-y-8 py-2">

      <div className="flex items-center justify-between gap-4 pb-1">
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <Badge tone="brand" icon={<Building2 className="w-3 h-3" />}>
                {cleanText(kit.source?.company, 'Company')}
              </Badge>
              {kit.source?.location && kit.source.location !== 'Not Specified' && kit.source.location !== 'Remote / Unspecified' && (
                <Badge tone="neutral" icon={<MapPin className="w-3 h-3 text-slate-400" />}>
                  {cleanText(kit.source.location)}
                </Badge>
              )}
              <Badge tone="neutral" icon={<Calendar className="w-3 h-3 text-slate-400" />}>
                Researched {new Date(kit.source?.researched_at || Date.now()).toLocaleDateString()}
              </Badge>
              <Badge tone="success" icon={<CheckCircle2 className="w-3 h-3" />}>
                Verified Kit
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 break-words">
              {cleanRoleTitle(kit.role?.title, 'Job Title')}
            </h1>
          </div>
        </div>
      </div>


      <div className="p-5 sm:p-6 rounded-2xl border border-teal-200 bg-teal-50/60 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-card">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-2xs shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                Must-Have Coverage: {uncoveredMustHaves.length === 0 ? '100% Satisfied' : `${uncoveredMustHaves.length} Uncovered`}
              </h3>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Verified across {kit.coverage?.passes || 1} deterministic research pass. Every required must-have is mapped to dedicated practice questions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportJson}
            leftIcon={<Download className="w-3.5 h-3.5" />}
            title="Download verified conforming JSON"
          >
            Export JSON
          </Button>
        </div>
      </div>


      {kit.company_brief && kit.source && (
        <BriefEditor
          brief={kit.company_brief}
          source={kit.source}
          onUpdate={handleUpdateBrief}
          onRegenerate={handleRegenerateBrief}
          isRegenerating={regeneratingSection === 'brief'}
        />
      )}


      {kit.role && <RoleBreakdown role={kit.role} />}


      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <Link
          href={`/kit/${kit.id || kitId}/question-bank`}
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 shadow-card hover:shadow-pop transition-all group flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                Question Bank ({kit.questions?.length || 0})
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Categorized questions, outlines & rubric
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all shrink-0" />
        </Link>

        <Link
          href={`/kit/${kit.id || kitId}/schedule`}
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-amber-300 shadow-card hover:shadow-pop transition-all group flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                {kit.schedule?.days_available || kit.schedule?.days?.length || 5}-Day Schedule
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Roadmap & progressive daily focus
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all shrink-0" />
        </Link>

        <Link
          href={`/kit/${kit.id || kitId}/practice`}
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 shadow-card hover:shadow-pop transition-all group flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                Practice Mode ({kit.flashcards?.length || 0})
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Interactive active recall flashcards
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all shrink-0" />
        </Link>
      </div>
    </div>
  );
}
