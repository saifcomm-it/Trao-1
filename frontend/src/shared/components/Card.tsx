'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export const Card = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { hoverable?: boolean }>(
  ({ className, hoverable = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-2xl border border-slate-200/90 bg-white shadow-card text-slate-800 transition-all duration-200',
        hoverable && 'hover:shadow-pop hover:border-slate-300',
        className
      )}
      {...props}
    />
  )
);
Card.displayName = 'Card';

export const CardHeader = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { withTick?: boolean }
>(({ className, withTick = false, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center justify-between gap-4 p-5 sm:p-6 pb-3 border-b border-slate-100', className)}
    {...props}
  >
    {withTick ? (
      <div className="flex items-center gap-3 min-w-0">
        <span className="h-4 w-1 rounded-full bg-brand-800 shrink-0" />
        <div className="min-w-0">{children}</div>
      </div>
    ) : (
      children
    )}
  </div>
));
CardHeader.displayName = 'CardHeader';

export const CardTitle = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-base sm:text-lg font-bold text-slate-900 tracking-tight', className)}
      {...props}
    />
  )
);
CardTitle.displayName = 'CardTitle';

export const CardDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-xs sm:text-sm text-slate-500 mt-0.5 leading-relaxed', className)}
      {...props}
    />
  )
);
CardDescription.displayName = 'CardDescription';

export const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-5 sm:p-6', className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';

export const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center justify-between gap-4 p-5 sm:p-6 pt-3 border-t border-slate-100', className)}
      {...props}
    />
  )
);
CardFooter.displayName = 'CardFooter';
