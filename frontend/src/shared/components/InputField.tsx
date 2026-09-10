'use client';

import React, { forwardRef, useState } from 'react';
import { AlertCircle, Eye, EyeOff, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string | null;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  clearable?: boolean;
  onClear?: () => void;
  inputSize?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isPassword?: boolean;
  containerClassName?: string;
  leftAccent?: boolean;
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  (
    {
      className,
      containerClassName,
      label,
      helperText,
      error,
      leftIcon,
      rightIcon,
      clearable = false,
      onClear,
      inputSize = 'md',
      fullWidth = true,
      isPassword = false,
      disabled,
      required,
      id,
      type = 'text',
      value,
      onChange,
      leftAccent = false,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    const sizeStyles = {
      sm: 'h-8 text-xs pl-3 pr-3',
      md: 'h-10 text-sm pl-3.5 pr-3.5',
      lg: 'h-12 text-base pl-4 pr-4',
    };

    const hasValue = value !== undefined && value !== null && value !== '';

    return (
      <div className={cn('flex flex-col', fullWidth && 'w-full', containerClassName)}>

        {label && (
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor={inputId}
              className="block text-xs font-semibold text-slate-700 select-none tracking-tight"
            >
              {label}
              {required && <span className="text-rose-500 ml-1">*</span>}
            </label>
          </div>
        )}


        <div className="relative flex items-center w-full">

          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              {leftIcon}
            </div>
          )}


          <input
            ref={ref}
            id={inputId}
            type={isPassword ? (showPassword ? 'text' : 'password') : type}
            disabled={disabled}
            required={required}
            value={value}
            onChange={onChange}
            className={cn(
              'w-full rounded-xl border bg-slate-50/50 text-slate-900 placeholder:text-slate-400',
              'transition-all duration-200 outline-none',
              'focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500',
              'hover:border-slate-300',
              'disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed',
              sizeStyles[inputSize],
              leftIcon && 'pl-10',
              (rightIcon || isPassword || (clearable && hasValue)) && 'pr-10',
              leftAccent && 'border-l-2 border-l-brand-800',
              error
                ? 'border-rose-300 bg-rose-50/30 text-rose-900 focus:border-rose-500 focus:ring-rose-500/20'
                : 'border-slate-200',
              className
            )}
            {...props}
          />


          <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-1.5 text-slate-400">
            {clearable && hasValue && !disabled && (
              <button
                type="button"
                onClick={onClear}
                tabIndex={-1}
                title="Clear input"
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {isPassword && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                title={showPassword ? 'Hide password' : 'Show password'}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            )}

            {!isPassword && rightIcon && <span>{rightIcon}</span>}
          </div>
        </div>


        {error ? (
          <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1 font-medium animate-in fade-in slide-in-from-top-1 duration-150">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p className="mt-1.5 text-xs text-slate-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

InputField.displayName = 'InputField';

export interface TextareaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string | null;
  fullWidth?: boolean;
  containerClassName?: string;
  charCount?: number;
  maxCharCount?: number;
}

export const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  (
    {
      className,
      containerClassName,
      label,
      helperText,
      error,
      fullWidth = true,
      disabled,
      required,
      id,
      value,
      onChange,
      charCount,
      maxCharCount,
      rows = 4,
      ...props
    },
    ref
  ) => {
    const textareaId = id || (label ? `textarea-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
    const count = charCount !== undefined ? charCount : typeof value === 'string' ? value.length : undefined;

    return (
      <div className={cn('flex flex-col', fullWidth && 'w-full', containerClassName)}>
        {label && (
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor={textareaId}
              className="block text-xs font-semibold text-slate-700 select-none tracking-tight"
            >
              {label}
              {required && <span className="text-rose-500 ml-1">*</span>}
            </label>
            {count !== undefined && (
              <span className="text-[11px] font-mono text-slate-400">
                {count} {maxCharCount ? `/ ${maxCharCount}` : 'characters'}
              </span>
            )}
          </div>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          disabled={disabled}
          required={required}
          value={value}
          onChange={onChange}
          className={cn(
            'w-full p-3.5 rounded-xl border bg-slate-50/50 text-slate-900 placeholder:text-slate-400',
            'transition-all duration-200 outline-none leading-relaxed font-sans text-sm',
            'focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500',
            'hover:border-slate-300',
            'disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed',
            error
              ? 'border-rose-300 bg-rose-50/30 text-rose-900 focus:border-rose-500 focus:ring-rose-500/20'
              : 'border-slate-200',
            className
          )}
          {...props}
        />

        {error ? (
          <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1 font-medium animate-in fade-in slide-in-from-top-1 duration-150">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p className="mt-1.5 text-xs text-slate-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

TextareaField.displayName = 'TextareaField';
