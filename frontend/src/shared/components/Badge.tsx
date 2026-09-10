'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export type BadgeTone =
  | 'brand'
  | 'neutral'
  | 'success'
  | 'warning'
  | 'danger'
  | 'purple'
  | 'outline';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  dotColor?: string;
  icon?: React.ReactNode;
  size?: 'sm' | 'md';
}

export function Badge({
  className,
  tone = 'neutral',
  dotColor,
  icon,
  size = 'md',
  children,
  ...props
}: BadgeProps) {
  const toneStyles: Record<BadgeTone, string> = {
    brand: 'bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-200/80',
    neutral: 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200',
    success: 'bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-200',
    warning: 'bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200',
    danger: 'bg-rose-50 text-rose-800 ring-1 ring-inset ring-rose-200',
    purple: 'bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-200',
    outline: 'bg-white text-slate-700 border border-slate-200 shadow-2xs',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-0.5 gap-1.5',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-semibold select-none whitespace-nowrap transition-colors',
        sizeStyles[size],
        toneStyles[tone],
        className
      )}
      {...props}
    >
      {dotColor && <span className={cn('w-1.5 h-1.5 rounded-full shrink-0 shadow-2xs', dotColor)} />}
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}
