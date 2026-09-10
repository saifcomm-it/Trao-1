'use client';

import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger'
  | 'success'
  | 'subtle-success'
  | 'subtle-danger';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      children,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center select-none font-medium whitespace-nowrap ' +
      'transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 ' +
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none cursor-pointer';

    const variantStyles: Record<ButtonVariant, string> = {
      primary:
        'bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 ' +
        'text-white shadow-sm shadow-brand-500/20 active:scale-[0.98] border border-transparent',
      secondary:
        'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 ' +
        'shadow-xs active:scale-[0.98]',
      outline:
        'bg-transparent hover:bg-brand-50/60 text-brand-700 border border-brand-200 hover:border-brand-300 ' +
        'active:scale-[0.98]',
      ghost:
        'bg-transparent hover:bg-slate-100/80 text-slate-600 hover:text-slate-900 active:scale-[0.98]',
      danger:
        'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 ' +
        'text-white shadow-sm shadow-rose-500/20 active:scale-[0.98] border border-transparent',
      success:
        'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 ' +
        'text-white shadow-sm shadow-emerald-500/20 active:scale-[0.98] border border-transparent',
      'subtle-success':
        'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100/80 active:scale-[0.98]',
      'subtle-danger':
        'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100/80 active:scale-[0.98]',
    };

    const sizeStyles: Record<ButtonSize, string> = {
      xs: 'h-7 px-2.5 text-xs font-semibold rounded-lg gap-1.5',
      sm: 'h-8 px-3 text-xs font-semibold rounded-lg gap-1.5',
      md: 'h-10 px-4 text-sm font-semibold rounded-xl gap-2',
      lg: 'h-11 px-5 text-sm sm:text-base font-bold rounded-xl gap-2.5',
      icon: 'w-9 h-9 p-0 rounded-xl justify-center shrink-0',
      'icon-sm': 'w-8 h-8 p-0 rounded-lg justify-center shrink-0',
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            {children && <span>{children}</span>}
          </>
        ) : (
          <>
            {leftIcon && <span className="shrink-0 flex items-center">{leftIcon}</span>}
            {children && <span>{children}</span>}
            {rightIcon && <span className="shrink-0 flex items-center">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
