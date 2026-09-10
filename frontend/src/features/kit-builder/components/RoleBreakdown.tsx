'use client';

import React from 'react';
import { Briefcase } from 'lucide-react';
import { KitRequirement } from '@/lib/types';
import { IRoleBreakdownProps } from '../interfaces/kit-builder.interface';
import { cleanText, cleanRoleTitle, formatRequirementId } from '@/lib/utils';
import { Badge } from '@/shared/components';

export function RoleBreakdown({ role }: IRoleBreakdownProps) {
  const mustHaves = role.requirements.filter((r) => r.priority === 'must');

  const getKindTone = (kind: KitRequirement['kind']) => {
    switch (kind) {
      case 'technical':
        return 'brand';
      case 'behavioural':
        return 'purple';
      case 'domain':
        return 'warning';
      default:
        return 'neutral';
    }
  };

  return (
    <section className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-card hover:shadow-pop transition-shadow">
      <div className="flex items-center justify-between pb-3">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 border border-brand-200/80 flex items-center justify-center shrink-0 shadow-2xs">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              {cleanRoleTitle(role.title, 'Target Role')}
            </h2>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge tone="neutral">
                {cleanText(role.seniority, 'Role Target')}
              </Badge>
              <span className="text-xs text-slate-300">•</span>
              <span className="text-xs text-slate-500 font-medium">
                {role.requirements.length} Core Requirements
              </span>
              <Badge tone="success">
                {mustHaves.length} Must-Have
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {role.responsibilities && role.responsibilities.length > 0 && (
        <div className="mt-5 p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
            Key Responsibilities & Scope
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {role.responsibilities.map((resp, idx) => (
              <div key={idx} className="text-xs sm:text-sm text-slate-800 flex items-start gap-2 leading-relaxed">
                <span className="text-brand-600 font-bold shrink-0 mt-0.5">•</span>
                <span>{cleanText(resp)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Extracted Requirements & Coverage Targets
          </h3>
          <span className="text-xs text-slate-500">
            Anchor IDs for 100% deterministic question coverage
          </span>
        </div>

        <div className="grid gap-2.5">
          {role.requirements.map((req) => (
            <div
              key={req.id}
              className="flex items-start justify-between gap-3 p-3.5 rounded-2xl border border-slate-200/80 bg-white hover:bg-brand-50/40 hover:border-brand-200 transition-all shadow-2xs"
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 mt-0.5 border border-slate-200 shrink-0">
                  {formatRequirementId(req.id)}
                </span>
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-normal">
                  {cleanText(req.text)}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Badge tone={getKindTone(req.kind)}>
                  {req.kind}
                </Badge>
                <Badge tone={req.priority === 'must' ? 'success' : 'neutral'}>
                  {req.priority === 'must' ? 'MUST-HAVE' : 'NICE-TO-HAVE'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
