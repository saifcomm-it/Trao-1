'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';

interface IHeaderProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export function Header({ onToggleSidebar, isSidebarOpen }: IHeaderProps) {
  const pathname = usePathname() || '';

  const getBreadcrumb = () => {
    if (pathname === '/dashboard') return { title: 'Dashboard', sub: 'Candidate Overview' };
    if (pathname === '/profile') return { title: 'Profile Settings', sub: 'Personal Details & Security' };
    if (pathname === '/new') return { title: 'New Prep Kit', sub: 'Automated Crawl & Generation' };
    if (pathname.includes('/schedule')) return { title: 'Preparation Schedule', sub: 'Curriculum Timeline' };
    if (pathname.includes('/day')) return { title: 'Daily Questions', sub: 'Focus & Outlines' };
    if (pathname.includes('/practice')) return { title: 'Practice Mode', sub: 'Active Recall Session' };
    if (pathname.includes('/question-bank') || pathname.includes('/questionbank')) return { title: 'Question Bank', sub: 'Categorized Technical & Culture Questions' };
    if (pathname.startsWith('/kit/')) return { title: 'Kit Builder', sub: 'Inspect & Reshape' };
    return { title: 'Home', sub: 'Trao PrepKit' };
  };

  const breadcrumb = getBreadcrumb();

  return (
    <header className="h-14 bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-20 flex items-center justify-between px-3 sm:px-6 print:hidden shadow-2xs">
      <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
          className="md:hidden p-1.5 -ml-1 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors cursor-pointer shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="text-sm font-bold tracking-tight text-slate-900 shrink-0">
          {breadcrumb.title}
        </span>
        <span className="text-slate-300 shrink-0">/</span>
        <span className="text-xs font-semibold text-slate-400 hidden sm:inline truncate">
          {breadcrumb.sub}
        </span>
      </div>

    </header>
  );
}
