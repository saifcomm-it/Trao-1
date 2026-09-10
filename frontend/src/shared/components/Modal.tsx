'use client';

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  icon,
  children,
  footer,
  maxWidth = 'lg',
  className,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);


  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={modalRef}
        className={cn(
          'relative bg-white rounded-3xl border border-slate-200/90 w-full p-6 sm:p-8 shadow-2xl shadow-brand-900/15 overflow-hidden my-8 max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200',
          maxWidthStyles[maxWidth],
          className
        )}
      >

        {(title || icon) && (
          <div className="relative flex items-center justify-between gap-3 pb-4 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-3.5 min-w-0">
              {icon && (
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center shadow-md shadow-brand-500/25 shrink-0">
                  {icon}
                </div>
              )}
              <div className="min-w-0">
                {title && (
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    {title}
                  </h3>
                )}
                {description && (
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{description}</p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-all flex items-center justify-center cursor-pointer shrink-0"
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}


        <div className="relative mt-5 space-y-4 overflow-y-auto pr-1 flex-1 -mr-1">
          {children}
        </div>


        {footer && (
          <div className="relative flex items-center justify-end gap-3 pt-4 mt-4 border-t border-slate-100 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
