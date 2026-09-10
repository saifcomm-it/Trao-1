'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  showPageSize?: boolean;
  showItemCount?: boolean;
  itemName?: string;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize = 10,
  onPageSizeChange,
  pageSizeOptions = [5, 8, 10, 25, 50],
  showPageSize = true,
  showItemCount = true,
  itemName = 'items',
  className,
}: PaginationProps) {
  if (totalPages <= 0) return null;

  const safePage = Math.max(1, Math.min(currentPage, totalPages));
  const startIndex = (safePage - 1) * pageSize + 1;
  const endIndex = totalItems ? Math.min(startIndex + pageSize - 1, totalItems) : safePage * pageSize;


  const getPageNumbers = () => {
    const delta = 2;
    const range: (number | string)[] = [];
    const left = Math.max(2, safePage - delta);
    const right = Math.min(totalPages - 1, safePage + delta);

    range.push(1);

    if (left > 2) {
      range.push('ellipsis-left');
    }

    for (let i = left; i <= right; i++) {
      range.push(i);
    }

    if (right < totalPages - 1) {
      range.push('ellipsis-right');
    }

    if (totalPages > 1) {
      range.push(totalPages);
    }

    return range;
  };

  const pages = getPageNumbers();

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-card text-xs sm:text-sm select-none',
        className
      )}
    >

      <div className="flex items-center gap-3 flex-wrap">
        {showItemCount && totalItems !== undefined && (
          <span className="text-slate-600 font-medium">
            Showing <strong className="text-slate-900 font-bold">{totalItems === 0 ? 0 : startIndex}</strong> to{' '}
            <strong className="text-slate-900 font-bold">{endIndex}</strong> of{' '}
            <strong className="text-slate-900 font-bold">{totalItems}</strong> {itemName}
          </span>
        )}

        {showPageSize && onPageSizeChange && (
          <div className="flex items-center gap-2 text-slate-500 font-medium">
            {showItemCount && totalItems !== undefined && (
              <span className="text-slate-300 hidden sm:inline">|</span>
            )}
            <span className="text-xs">Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="h-8 px-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 cursor-pointer focus:bg-white focus:border-brand-500 outline-none transition-colors"
            >
              {pageSizeOptions.map((sz) => (
                <option key={sz} value={sz}>
                  {sz}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>


      <div className="flex items-center gap-1.5 self-center sm:self-auto">

        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, safePage - 1))}
          disabled={safePage <= 1}
          title="Previous Page"
          className="w-8 h-8 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center justify-center cursor-pointer shadow-2xs active:scale-95"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>


        <div className="flex items-center gap-1">
          {pages.map((p, idx) => {
            if (typeof p === 'string') {
              return (
                <span key={p + idx} className="w-7 text-center text-slate-400 font-bold select-none">
                  •••
                </span>
              );
            }

            const isActive = safePage === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                className={cn(
                  'min-w-[32px] h-8 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center select-none active:scale-95',
                  isActive
                    ? 'bg-gradient-to-r from-brand-600 to-brand-700 text-white shadow-xs shadow-brand-500/25 border border-brand-600'
                    : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 shadow-2xs'
                )}
              >
                {p}
              </button>
            );
          })}
        </div>


        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, safePage + 1))}
          disabled={safePage >= totalPages}
          title="Next Page"
          className="w-8 h-8 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center justify-center cursor-pointer shadow-2xs active:scale-95"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
