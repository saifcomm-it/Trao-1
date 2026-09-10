'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Table2,
  LayoutGrid,
  FolderSearch,
  Sparkles
} from 'lucide-react';
import { useDashboard } from '../hooks/useDashboard';
import { KitCard } from './KitCard';
import { KitTable } from './KitTable';
import { EmptyState } from './EmptyState';
import { DashboardSkeleton } from '@/components/skeletons/DashboardSkeleton';
import { InputField, Pagination, Button } from '@/shared/components';

export function DashboardView() {
  const { kits, isLoading, error, handleDelete } = useDashboard();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);


  const filteredKits = useMemo(() => {
    if (!searchQuery.trim()) return kits;
    const query = searchQuery.toLowerCase().trim();

    return kits.filter((kit) => {
      const company = kit.source?.company?.toLowerCase() || '';
      const title = kit.role?.title?.toLowerCase() || '';
      const seniority = kit.role?.seniority?.toLowerCase() || '';
      const summary = kit.company_brief?.summary?.toLowerCase() || '';
      const requirements = (kit.role?.requirements || []).map((r) => r.text.toLowerCase()).join(' ');

      return (
        company.includes(query) ||
        title.includes(query) ||
        seniority.includes(query) ||
        summary.includes(query) ||
        requirements.includes(query)
      );
    });
  }, [kits, searchQuery]);


  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };


  const totalKits = filteredKits.length;
  const totalPages = Math.max(1, Math.ceil(totalKits / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalKits);
  const paginatedKits = useMemo(() => {
    return filteredKits.slice(startIndex, endIndex);
  }, [filteredKits, startIndex, endIndex]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-5">

      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="h-5 w-1.5 rounded-full bg-brand-800 shrink-0" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-brand-900">
              Interview Preparation Kits
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 pl-4.5">
            Personalized role guides, categorized questions, and day-by-day study schedules
          </p>
        </div>

        <Link href="/new">
          <Button variant="primary" size="md" leftIcon={<Plus className="w-4 h-4" />}>
            Create New Kit
          </Button>
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      {kits.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-4">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-card">

            <div className="w-full sm:w-80 md:w-96 shrink-0">
              <InputField
                placeholder="Search role, company, skills..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
                clearable
                onClear={() => handleSearchChange('')}
                inputSize="sm"
              />
            </div>


            <div className="flex items-center gap-2 justify-end shrink-0">
              <button
                onClick={() => setViewMode('table')}
                title="Table View"
                className={`flex h-8 items-center gap-1.5 rounded-full border px-3.5 text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'border-brand-800 bg-brand-800 text-white shadow-xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-brand-500 hover:text-brand-800'
                }`}
              >
                <Table2 className="w-3.5 h-3.5" />
                <span>Table</span>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                title="Grid View"
                className={`flex h-8 items-center gap-1.5 rounded-full border px-3.5 text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'border-brand-800 bg-brand-800 text-white shadow-xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-brand-500 hover:text-brand-800'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Grid</span>
              </button>
            </div>
          </div>


          {filteredKits.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300 shadow-card">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <FolderSearch className="w-6 h-6" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                No matching preparation kits
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                We couldn&apos;t find any kits matching &ldquo;{searchQuery}&rdquo;. Try another keyword or clear the search.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => handleSearchChange('')}
              >
                Clear Search Filter
              </Button>
            </div>
          ) : viewMode === 'table' ? (
            <KitTable kits={paginatedKits} onDelete={handleDelete} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {paginatedKits.map((kit) => (
                <KitCard key={kit.id} kit={kit} onDelete={handleDelete} />
              ))}
            </div>
          )}


          {totalKits > 0 && (
            <Pagination
              currentPage={safePage}
              totalPages={totalPages}
              onPageChange={(p) => setCurrentPage(p)}
              totalItems={totalKits}
              pageSize={pageSize}
              onPageSizeChange={(sz) => {
                setPageSize(sz);
                setCurrentPage(1);
              }}
              itemName="kits"
            />
          )}
        </div>
      )}
    </div>
  );
}
