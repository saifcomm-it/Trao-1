'use client';

import React from 'react';
import Link from 'next/link';
import {
  Building2,
  BookOpen,
  ArrowRight,
  Trash2,
  Calendar,
  ShieldCheck
} from 'lucide-react';
import { UIInterviewPrepKit } from '@/lib/types';
import { cleanText, cleanRoleTitle } from '@/lib/utils';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Badge,
  Button
} from '@/shared/components';

interface IKitTableProps {
  kits: UIInterviewPrepKit[];
  onDelete: (id: string, e: React.MouseEvent) => void;
}

export function KitTable({ kits, onDelete }: IKitTableProps) {
  return (
    <Table className="overflow-hidden">
      <TableHeader>
        <tr>
          <TableHead align="center">Role & Company</TableHead>
          <TableHead align="center" className="hidden md:table-cell">Breakdown</TableHead>
          <TableHead align="center" className="hidden lg:table-cell">Date Researched</TableHead>
          <TableHead align="center" className="hidden sm:table-cell">Coverage</TableHead>
          <TableHead align="center">Actions</TableHead>
        </tr>
      </TableHeader>
      <TableBody>
        {kits.map((kit) => {
          const kitId = kit.id || kit._id || '';
          const dateStr = kit.source?.researched_at
            ? new Date(kit.source.researched_at).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })
            : 'Recent';

          const cleanTitle = cleanRoleTitle(kit.role?.title, 'Target Role');
          const cleanCompany = cleanText(kit.source?.company, 'Company');

          return (
            <TableRow
              key={kitId || cleanTitle}
              isStriped
              className="hover:bg-brand-50/50 transition-colors group"
            >

              <TableCell align="center">
                <div className="flex items-center justify-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0 border border-brand-200/80 shadow-2xs group-hover:scale-105 transition-transform">
                    <Building2 className="w-4.5 h-4.5" />
                  </div>
                  <div className="flex flex-col text-left min-w-0">
                    <Link
                      href={`/kit/${kitId}`}
                      title={cleanTitle}
                      className="font-bold text-sm text-slate-900 hover:text-brand-600 hover:underline transition-colors truncate max-w-[200px] sm:max-w-[280px] lg:max-w-[360px]"
                    >
                      {cleanTitle}
                    </Link>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-brand-700 truncate mt-0.5">
                      {cleanCompany}
                    </span>
                  </div>
                </div>
              </TableCell>


              <TableCell align="center" className="hidden md:table-cell">
                <Badge tone="brand" icon={<Calendar className="w-3.5 h-3.5" />}>
                  {kit.schedule?.days_available || 1}D Plan
                </Badge>
              </TableCell>


              <TableCell align="center" className="hidden lg:table-cell">
                <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 font-medium whitespace-nowrap">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{dateStr}</span>
                </div>
              </TableCell>


              <TableCell align="center" className="hidden sm:table-cell">
                <Badge tone="success" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
                  Verified Kit
                </Badge>
              </TableCell>


              <TableCell align="center">
                <div className="flex items-center justify-center gap-2 whitespace-nowrap">
                  <Link
                    href={`/kit/${kitId}/practice`}
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        localStorage.setItem('trao_last_kit_id', kitId);
                        window.dispatchEvent(new CustomEvent('trao_kit_selected', { detail: kitId }));
                      }
                    }}
                    title="Practice Flashcards"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50 border border-transparent transition-colors cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4" />
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
                      Open
                    </Button>
                  </Link>

                  <button
                    onClick={(e) => onDelete(kitId, e)}
                    title="Delete kit"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
