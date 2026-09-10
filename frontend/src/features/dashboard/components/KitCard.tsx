'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, ArrowRight, Trash2, Calendar, Target } from 'lucide-react';
import { IKitCardProps } from '../interfaces/dashboard.interface';
import { cleanText, cleanRoleTitle } from '@/lib/utils';
import { Card, Badge, Button } from '@/shared/components';

export function KitCard({ kit, onDelete }: IKitCardProps) {
  const kitId = kit.id || (kit as any)._id || '';
  const mustHavesCount = kit.role?.requirements?.filter((r) => r.priority === 'must').length || 0;
  const cleanTitle = cleanRoleTitle(kit.role?.title, 'Role');
  const cleanCompany = cleanText(kit.source?.company, 'Company');

  return (
    <Card hoverable className="flex flex-col justify-between p-5 min-w-0">
      <div className="min-w-0">
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 min-w-0">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <span className="h-4 w-1 rounded-full bg-brand-800 shrink-0" />
            <div className="min-w-0 flex-1">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-brand-700 truncate">
                {cleanCompany}
              </span>
              <h3
                title={cleanTitle}
                className="text-base font-bold text-slate-900 hover:text-brand-600 transition-colors truncate mt-0.5"
              >
                {cleanTitle}
              </h3>
            </div>
          </div>

          <button
            onClick={(e) => onDelete(kitId, e)}
            title="Delete kit"
            className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors shrink-0 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <p className="mt-3 text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
          {kit.company_brief?.summary || 'Comprehensive role requirements and question coverage.'}
        </p>

        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-1.5 text-xs">
          <Badge tone="neutral">
            {kit.questions?.length || 0} Questions
          </Badge>
          <Badge tone="success" icon={<Target className="w-3 h-3" />}>
            {mustHavesCount} Must-Haves
          </Badge>
          <Badge tone="brand" icon={<Calendar className="w-3 h-3" />}>
            {kit.schedule?.days_available || 1}D Plan
          </Badge>
        </div>
      </div>

      <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-3 min-w-0">
        <Link
          href={`/kit/${kitId}/practice`}
          onClick={() => {
            if (typeof window !== 'undefined') {
              localStorage.setItem('trao_last_kit_id', kitId);
              window.dispatchEvent(new CustomEvent('trao_kit_selected', { detail: kitId }));
            }
          }}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-brand-700 transition-colors shrink-0"
        >
          <BookOpen className="w-4 h-4 text-slate-400" />
          <span>Practice Cards</span>
        </Link>

        <Link
          href={`/kit/${kitId}`}
          onClick={() => {
            if (typeof window !== 'undefined') {
              localStorage.setItem('trao_last_kit_id', kitId);
              window.dispatchEvent(new CustomEvent('trao_kit_selected', { detail: kitId }));
            }
          }}
        >
          <Button size="xs" variant="primary" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
            Open Kit
          </Button>
        </Link>
      </div>
    </Card>
  );
}
