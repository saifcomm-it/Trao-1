'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { DbStatusBanner } from './DbStatusBanner';

import { useAuth } from '@/lib/auth-context';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname() || '';
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, [pathname]);

  const isAuthPage =
    pathname === '/' ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password');

  if (isAuthPage || !user || isLoading) {
    return (
      <main className="min-h-screen w-full flex flex-col">
        <DbStatusBanner />
        {children}
      </main>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-800 relative">

      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-30 md:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ml-0 ${
          isSidebarOpen ? 'md:ml-48' : 'md:ml-14'
        }`}
      >
        <DbStatusBanner />
        <Header
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
        />
        <main className="flex-1 px-4 sm:px-6 md:px-[30px] py-4 sm:py-6 w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
