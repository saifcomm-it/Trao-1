import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Sparkles,
  LayoutDashboard,
  Sliders,
  BookOpen,
  Calendar,
  ChevronRight,
  LogOut,
  LogIn,
  PanelLeftClose,
  PanelLeftOpen,
  User,
  HelpCircle,
  X
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useKitsQuery } from '@/lib/queries';

interface ISidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ isOpen, onToggle }: ISidebarProps) {
  const pathname = usePathname() || '';
  const router = useRouter();
  const { user, logout } = useAuth();
  const { data: kits = [] } = useKitsQuery();


  const pathKitMatch = pathname.match(/\/kit\/([^/]+)/);
  const pathKitId = pathKitMatch && pathKitMatch[1] !== 'new' ? pathKitMatch[1] : null;

  const [activeKitId, setActiveKitId] = useState<string | null>(pathKitId);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const handleKitSelected = (e: any) => {
      const selectedId = e.detail;
      if (selectedId) {
        setActiveKitId(selectedId);
        try {
          localStorage.setItem('trao_last_kit_id', selectedId);
        } catch {}
      }
    };
    const handleKitDeleted = (e: any) => {
      const deletedId = e.detail;
      if (activeKitId === deletedId) {
        const remaining = kits.filter((k) => (k.id || (k as any)._id) !== deletedId);
        const nextId = remaining.length > 0 ? (remaining[0].id || (remaining[0] as any)._id) : null;
        setActiveKitId(nextId);
        if (nextId) {
          try {
            localStorage.setItem('trao_last_kit_id', nextId);
          } catch {}
        } else {
          try {
            localStorage.removeItem('trao_last_kit_id');
          } catch {}
        }
      }
    };

    window.addEventListener('trao_kit_selected', handleKitSelected);
    window.addEventListener('trao_kit_deleted', handleKitDeleted);
    return () => {
      window.removeEventListener('trao_kit_selected', handleKitSelected);
      window.removeEventListener('trao_kit_deleted', handleKitDeleted);
    };
  }, [activeKitId, kits]);

  useEffect(() => {
    if (pathKitId) {
      setActiveKitId(pathKitId);
      try {
        localStorage.setItem('trao_last_kit_id', pathKitId);
      } catch {}
    } else if (isMounted) {
      try {
        const storedId = localStorage.getItem('trao_last_kit_id');
        if (storedId) {
          setActiveKitId(storedId);
        } else if (kits.length > 0) {
          const firstId = kits[0].id || (kits[0] as any)._id;
          if (firstId) {
            setActiveKitId(firstId);
            localStorage.setItem('trao_last_kit_id', firstId);
          }
        }
      } catch {}
    }
  }, [pathname, pathKitId, isMounted, kits]);

  const handleLogout = () => {
    logout();
    router.push('/signup');
  };

  const getTargetKitId = () => {
    if (activeKitId) return activeKitId;
    if (typeof window !== 'undefined') {
      try {
        const last = localStorage.getItem('trao_last_kit_id');
        if (last) return last;
      } catch {}
    }
    return kits.length > 0 ? (kits[0].id || (kits[0] as any)._id) : null;
  };


  const currentTargetId = isMounted ? (activeKitId || (kits.length > 0 ? (kits[0].id || (kits[0] as any)._id) : null)) : pathKitId;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      iconColor: 'text-blue-600',
      softBg: 'bg-blue-50/90 text-blue-600 hover:bg-blue-100',
    },
    {
      id: 'kit-builder',
      label: 'Kit Builder',
      href: currentTargetId ? `/kit/${currentTargetId}` : '/dashboard',
      onClick: (e: React.MouseEvent) => {
        const id = getTargetKitId();
        e.preventDefault();
        router.push(id ? `/kit/${id}` : '/dashboard');
      },
      icon: Sliders,
      iconColor: 'text-violet-600',
      softBg: 'bg-violet-50/90 text-violet-600 hover:bg-violet-100',
    },
    {
      id: 'question-bank',
      label: 'Question Bank',
      href: currentTargetId ? `/kit/${currentTargetId}/question-bank` : '/dashboard',
      onClick: (e: React.MouseEvent) => {
        const id = getTargetKitId();
        e.preventDefault();
        router.push(id ? `/kit/${id}/question-bank` : '/dashboard');
      },
      icon: HelpCircle,
      iconColor: 'text-indigo-600',
      softBg: 'bg-indigo-50/90 text-indigo-600 hover:bg-indigo-100',
    },
    {
      id: 'schedule',
      label: 'Schedule',
      href: currentTargetId ? `/kit/${currentTargetId}/schedule` : '/dashboard',
      onClick: (e: React.MouseEvent) => {
        const id = getTargetKitId();
        e.preventDefault();
        router.push(id ? `/kit/${id}/schedule` : '/dashboard');
      },
      icon: Calendar,
      iconColor: 'text-amber-600',
      softBg: 'bg-amber-50/90 text-amber-600 hover:bg-amber-100',
    },
    {
      id: 'practice',
      label: 'Practice Mode',
      href: currentTargetId ? `/kit/${currentTargetId}/practice` : '/dashboard',
      onClick: (e: React.MouseEvent) => {
        const id = getTargetKitId();
        e.preventDefault();
        router.push(id ? `/kit/${id}/practice` : '/dashboard');
      },
      icon: BookOpen,
      iconColor: 'text-emerald-600',
      softBg: 'bg-emerald-50/90 text-emerald-600 hover:bg-emerald-100',
    }
  ];

  return (
    <aside
      className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col justify-between bg-slate-100 border-r border-slate-200 transition-all duration-300 print:hidden ${
        isOpen
          ? 'translate-x-0 w-64 md:w-48 shadow-2xl md:shadow-none'
          : '-translate-x-full md:translate-x-0 md:w-14'
      }`}
    >

      <div>
        <div className={`h-14 flex items-center ${isOpen ? 'justify-between px-3' : 'justify-center'} border-b border-slate-200`}>
          {isOpen ? (
            <>
              <Link
                href="/dashboard"
                onClick={() => {
                  if (typeof window !== 'undefined' && window.innerWidth < 768) {
                    onToggle();
                  }
                }}
                className="flex items-center gap-2 group min-w-0"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white shadow-glow shrink-0">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold text-sm tracking-tight text-slate-900">
                  Trao
                </span>
              </Link>

              <button
                onClick={onToggle}
                title="Collapse sidebar"
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors cursor-pointer shrink-0"
              >
                <PanelLeftClose className="w-3.5 h-3.5 hidden md:block" />
                <X className="w-4 h-4 md:hidden" />
              </button>
            </>
          ) : (
            <button
              onClick={onToggle}
              title="Expand sidebar"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-brand-600 bg-brand-50 hover:bg-brand-100 transition-all cursor-pointer shadow-xs"
            >
              <PanelLeftOpen className="w-3.5 h-3.5" />
            </button>
          )}
        </div>


        <div className="p-2 space-y-1">
          {isOpen && (
            <div className="px-2.5 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Navigation
            </div>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.id === 'kit-builder'
                ? pathname.startsWith('/kit/') &&
                  !pathname.includes('/practice') &&
                  !pathname.includes('/schedule') &&
                  !pathname.includes('/day') &&
                  !pathname.includes('/question-bank') &&
                  !pathname.includes('/questionbank')
                : item.id === 'question-bank'
                ? pathname.includes('/question-bank') || pathname.includes('/questionbank')
                : item.id === 'schedule'
                ? pathname.includes('/schedule') || pathname.includes('/day')
                : item.id === 'practice'
                ? pathname.includes('/practice')
                : pathname === item.href;

            if (isOpen) {
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={(e) => {
                    if (typeof window !== 'undefined' && window.innerWidth < 768) {
                      onToggle();
                    }
                    if (item.onClick) {
                      item.onClick(e);
                    }
                  }}
                  title={item.label}
                  className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm transition-all duration-150 group relative ${
                    isActive
                      ? 'bg-gradient-to-r from-brand-700 to-brand-800 font-semibold text-white shadow-sm shadow-brand-700/25'
                      : 'text-slate-700 font-medium hover:bg-white hover:text-slate-900 hover:shadow-2xs'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-transform ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : `${item.softBg} shadow-2xs group-hover:scale-105`
                  }`}>
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                  </div>

                  <span className="whitespace-nowrap font-medium text-sm">{item.label}</span>
                </Link>
              );
            }


            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={(e) => {
                  if (typeof window !== 'undefined' && window.innerWidth < 768) {
                    onToggle();
                  }
                  if (item.onClick) {
                    item.onClick(e);
                  }
                }}
                title={item.label}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150 group mx-auto cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-br from-brand-600 to-brand-700 text-white shadow-sm shadow-brand-500/30 ring-2 ring-brand-400/40'
                    : `${item.softBg} shadow-2xs hover:scale-105 hover:shadow-xs`
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : item.iconColor}`} />
              </Link>
            );
          })}
        </div>
      </div>


      <div className="p-2 border-t border-slate-200">
        {user ? (
          isOpen ? (
            <div className="flex items-center justify-between gap-1.5 p-1.5 rounded-xl bg-white/80 hover:bg-white border border-slate-200/80 transition-colors">
              <Link
                href="/profile"
                onClick={() => {
                  if (typeof window !== 'undefined' && window.innerWidth < 768) {
                    onToggle();
                  }
                }}
                className="flex items-center gap-2 flex-1 min-w-0 group cursor-pointer"
                title="Edit Profile"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:shadow-glow transition-all">
                  <User className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-800 truncate group-hover:text-brand-600 transition-colors">
                    {user.name || user.email}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate leading-tight">
                    {user.targetRole || 'Edit profile'}
                  </p>
                </div>
              </Link>
              <button
                onClick={handleLogout}
                title="Sign Out"
                className="w-6 h-6 rounded-lg flex items-center justify-center text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-1">

              <Link
                href="/profile"
                onClick={() => {
                  if (typeof window !== 'undefined' && window.innerWidth < 768) {
                    onToggle();
                  }
                }}
                title={`Edit Profile (${user.name || user.email})`}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white bg-gradient-to-br from-brand-500 to-brand-700 shadow-sm cursor-pointer hover:shadow-glow hover:scale-105 transition-all mx-auto"
              >
                <User className="w-4 h-4" />
              </Link>


              <button
                onClick={handleLogout}
                title="Sign Out"
                className="w-9 h-9 rounded-xl flex items-center justify-center text-rose-600 bg-rose-50 hover:bg-rose-100 hover:text-rose-700 shadow-2xs hover:scale-105 transition-all cursor-pointer mx-auto"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )
        ) : (
          isOpen ? (
            <Link
              href="/login"
              onClick={() => {
                if (typeof window !== 'undefined' && window.innerWidth < 768) {
                  onToggle();
                }
              }}
              className="block w-full text-center text-xs py-2 px-2.5 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white rounded-xl font-semibold shadow-glow transition-all cursor-pointer"
            >
              Sign In
            </Link>
          ) : (
            <div className="flex justify-center">
              <Link
                href="/login"
                onClick={() => {
                  if (typeof window !== 'undefined' && window.innerWidth < 768) {
                    onToggle();
                  }
                }}
                title="Sign In"
                className="w-9 h-9 rounded-xl flex items-center justify-center text-brand-600 bg-brand-50 hover:bg-brand-100 shadow-2xs transition-all cursor-pointer hover:scale-105"
              >
                <LogIn className="w-4 h-4" />
              </Link>
            </div>
          )
        )}
      </div>
    </aside>
  );
}
