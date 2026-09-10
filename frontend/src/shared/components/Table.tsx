'use client';

import React, { forwardRef, useState } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, FolderSearch, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';



export const Table = forwardRef<HTMLTableElement, React.TableHTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <div className="w-full overflow-x-auto rounded-2xl border border-slate-200/90 bg-white shadow-card">
      <table
        ref={ref}
        className={cn('w-full caption-bottom text-sm border-collapse', className)}
        {...props}
      />
    </div>
  )
);
Table.displayName = 'Table';

export const TableHeader = forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn('bg-slate-50/80 border-b border-slate-200/90 text-xs font-bold uppercase tracking-wider text-slate-700', className)}
    {...props}
  />
));
TableHeader.displayName = 'TableHeader';

export const TableBody = forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn('divide-y divide-slate-100/90 text-sm font-normal text-slate-800', className)}
    {...props}
  />
));
TableBody.displayName = 'TableBody';

export const TableFooter = forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn('bg-slate-50/80 border-t border-slate-200 font-medium text-slate-700', className)}
    {...props}
  />
));
TableFooter.displayName = 'TableFooter';

export const TableRow = forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement> & { isSelected?: boolean; isStriped?: boolean }
>(({ className, isSelected, isStriped, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      'transition-colors duration-150',
      isStriped ? 'odd:bg-white even:bg-slate-50/40' : 'bg-white',
      'hover:bg-brand-50/40 group',
      isSelected && 'bg-brand-50/70',
      className
    )}
    {...props}
  />
));
TableRow.displayName = 'TableRow';

export const TableHead = forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement> & { align?: 'left' | 'center' | 'right' }
>(({ className, align = 'left', ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      'py-3.5 px-4 font-bold text-xs uppercase tracking-wider text-slate-700 select-none whitespace-nowrap',
      align === 'center' && 'text-center',
      align === 'right' && 'text-right',
      align === 'left' && 'text-left',
      className
    )}
    {...props}
  />
));
TableHead.displayName = 'TableHead';

export const TableCell = forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement> & { align?: 'left' | 'center' | 'right' }
>(({ className, align = 'left', ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      'py-3.5 px-4 align-middle text-slate-800 transition-colors',
      align === 'center' && 'text-center',
      align === 'right' && 'text-right',
      align === 'left' && 'text-left',
      className
    )}
    {...props}
  />
));
TableCell.displayName = 'TableCell';

export const TableCaption = forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn('mt-3 text-xs text-slate-400 italic', className)}
    {...props}
  />
));
TableCaption.displayName = 'TableCaption';



export interface ColumnDef<T> {
  key: string;
  header: string | React.ReactNode;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  width?: string;
  className?: string;
  render?: (item: T, index: number) => React.ReactNode;
}

export interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  keyExtractor?: (item: T, index: number) => string | number;
  isLoading?: boolean;
  emptyMessage?: string;
  emptyAction?: React.ReactNode;
  isStriped?: boolean;
  className?: string;
  onRowClick?: (item: T) => void;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (columnKey: string) => void;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  isLoading = false,
  emptyMessage = 'No records found.',
  emptyAction,
  isStriped = true,
  className,
  onRowClick,
  sortColumn,
  sortDirection,
  onSort,
}: DataTableProps<T>) {
  return (
    <Table className={className}>
      <TableHeader>
        <tr>
          {columns.map((col) => {
            const isCurrentSort = sortColumn === col.key;
            return (
              <TableHead
                key={col.key}
                align={col.align}
                style={{ width: col.width }}
                className={col.className}
              >
                {col.sortable && onSort ? (
                  <button
                    type="button"
                    onClick={() => onSort(col.key)}
                    className={cn(
                      'inline-flex items-center gap-1.5 hover:text-brand-700 transition-colors cursor-pointer',
                      col.align === 'center' && 'mx-auto',
                      col.align === 'right' && 'ml-auto'
                    )}
                  >
                    <span>{col.header}</span>
                    {isCurrentSort ? (
                      sortDirection === 'asc' ? (
                        <ArrowUp className="w-3.5 h-3.5 text-brand-600" />
                      ) : (
                        <ArrowDown className="w-3.5 h-3.5 text-brand-600" />
                      )
                    ) : (
                      <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 opacity-60 hover:opacity-100" />
                    )}
                  </button>
                ) : (
                  <span>{col.header}</span>
                )}
              </TableHead>
            );
          })}
        </tr>
      </TableHeader>

      <TableBody>
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <TableRow key={`skeleton-${i}`}>
              {columns.map((col) => (
                <TableCell key={col.key} align={col.align}>
                  <div className="h-4 bg-slate-100 rounded-md animate-pulse my-1" />
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : data.length === 0 ? (
          // Empty State
          <TableRow>
            <TableCell colSpan={columns.length} align="center" className="py-12">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
                  <FolderSearch className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-slate-800">{emptyMessage}</p>
                {emptyAction && <div className="mt-3">{emptyAction}</div>}
              </div>
            </TableCell>
          </TableRow>
        ) : (
          // Render Real Data Rows
          data.map((item, rowIdx) => {
            const rowKey = keyExtractor ? keyExtractor(item, rowIdx) : rowIdx;
            return (
              <TableRow
                key={rowKey}
                isStriped={isStriped}
                onClick={() => onRowClick?.(item)}
                className={cn(onRowClick && 'cursor-pointer')}
              >
                {columns.map((col) => {
                  const cellValue = (item as any)[col.key];
                  return (
                    <TableCell key={col.key} align={col.align} className={col.className}>
                      {col.render ? col.render(item, rowIdx) : cellValue}
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
}
