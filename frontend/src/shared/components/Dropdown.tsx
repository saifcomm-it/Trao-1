'use client';

import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { ChevronDown, Check, X, Search, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DropdownOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  dotColor?: string;
  badge?: string;
  disabled?: boolean;
}

export interface DropdownProps {
  options: DropdownOption[];
  value?: string | string[];
  onChange?: (value: string) => void;
  onMultiChange?: (values: string[]) => void;
  label?: string;
  placeholder?: string;
  helperText?: string;
  error?: string | null;
  searchable?: boolean;
  clearable?: boolean;
  multiple?: boolean;
  disabled?: boolean;
  native?: boolean;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
  containerClassName?: string;
}

export const Dropdown = forwardRef<HTMLDivElement, DropdownProps>(
  (
    {
      options,
      value,
      onChange,
      onMultiChange,
      label,
      placeholder = 'Select an option...',
      helperText,
      error,
      searchable = false,
      clearable = false,
      multiple = false,
      disabled = false,
      native = false,
      size = 'md',
      fullWidth = true,
      className,
      containerClassName,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);


    useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false);
          setSearchQuery('');
        }
      }
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);


    useEffect(() => {
      if (isOpen && searchable && searchInputRef.current) {
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
    }, [isOpen, searchable]);


    const filteredOptions = searchable && searchQuery.trim()
      ? options.filter((opt) =>
          opt.label.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
          opt.description?.toLowerCase().includes(searchQuery.toLowerCase().trim())
        )
      : options;

    const selectedValues = Array.isArray(value) ? value : value ? [value] : [];
    const selectedOptions = options.filter((opt) => selectedValues.includes(opt.value));

    const handleSelect = (optValue: string, e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (multiple) {
        const next = selectedValues.includes(optValue)
          ? selectedValues.filter((v) => v !== optValue)
          : [...selectedValues, optValue];
        onMultiChange?.(next);
      } else {
        onChange?.(optValue);
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (multiple) {
        onMultiChange?.([]);
      } else {
        onChange?.('');
      }
    };

    const sizeStyles = {
      sm: 'h-8 text-xs px-2.5 rounded-lg',
      md: 'h-10 text-sm px-3.5 rounded-xl',
      lg: 'h-12 text-base px-4 rounded-xl',
    };


    if (native) {
      return (
        <div className={cn('flex flex-col', fullWidth && 'w-full', containerClassName)}>
          {label && (
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 select-none tracking-tight">
              {label}
            </label>
          )}
          <div className="relative flex items-center">
            <select
              disabled={disabled}
              value={Array.isArray(value) ? value[0] : value || ''}
              onChange={(e) => onChange?.(e.target.value)}
              className={cn(
                'w-full appearance-none border bg-slate-50/50 text-slate-900',
                'transition-all duration-200 outline-none pr-9 cursor-pointer',
                'focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500',
                'hover:border-slate-300',
                'disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed',
                sizeStyles[size],
                error ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200',
                className
              )}
            >
              <option value="" disabled>
                {placeholder}
              </option>
              {options.map((opt) => (
                <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
          </div>
          {error && (
            <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1 font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </p>
          )}
        </div>
      );
    }


    return (
      <div
        ref={ref || dropdownRef}
        className={cn('relative flex flex-col', fullWidth && 'w-full', containerClassName)}
      >
        {label && (
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 select-none tracking-tight">
            {label}
          </label>
        )}


        <div className="relative w-full">

          <button
            type="button"
            disabled={disabled}
            onClick={() => setIsOpen((prev) => !prev)}
            className={cn(
              'w-full flex items-center justify-between border bg-slate-50/50 text-left transition-all duration-200 cursor-pointer outline-none select-none',
              'hover:border-slate-300 hover:bg-white',
              'disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed',
              sizeStyles[size],
              isOpen ? 'border-brand-500 ring-2 ring-brand-500/20 bg-white' : 'border-slate-200',
              error && 'border-rose-300 bg-rose-50/30 ring-rose-500/20',
              className
            )}
          >
          <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
            {selectedOptions.length === 0 ? (
              <span className="text-slate-400 truncate">{placeholder}</span>
            ) : multiple ? (
              <div className="flex items-center gap-1.5 flex-wrap overflow-hidden py-0.5">
                {selectedOptions.map((opt) => (
                  <span
                    key={opt.value}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-brand-50 text-brand-700 border border-brand-200/80"
                  >
                    {opt.dotColor && (
                      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', opt.dotColor)} />
                    )}
                    <span className="truncate max-w-[120px]">{opt.label}</span>
                    <button
                      type="button"
                      onClick={(e) => handleSelect(opt.value, e)}
                      className="hover:text-brand-900 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 min-w-0">
                {selectedOptions[0].dotColor && (
                  <span
                    className={cn(
                      'w-2 h-2 rounded-full shrink-0 shadow-2xs',
                      selectedOptions[0].dotColor
                    )}
                  />
                )}
                {selectedOptions[0].icon && (
                  <span className="text-slate-500 shrink-0">{selectedOptions[0].icon}</span>
                )}
                <span className="font-semibold text-slate-800 truncate">
                  {selectedOptions[0].label}
                </span>
                {selectedOptions[0].badge && (
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                    {selectedOptions[0].badge}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0 ml-2">
            {clearable && selectedOptions.length > 0 && !disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                title="Clear selection"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <ChevronDown
              className={cn(
                'w-4 h-4 text-slate-400 transition-transform duration-200',
                isOpen && 'rotate-180 text-brand-600'
              )}
            />
          </div>
        </button>


        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-900/10 p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-150">

            {searchable && (
              <div className="relative mb-1 px-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Type to filter..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-8 pl-8 pr-3 text-xs bg-slate-50 rounded-xl border border-slate-200 outline-none focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            )}


            <div className="max-h-56 overflow-y-auto space-y-0.5 pr-0.5">
              {filteredOptions.length === 0 ? (
                <div className="p-3 text-center text-xs text-slate-400 italic">
                  No matching options found
                </div>
              ) : (
                filteredOptions.map((opt) => {
                  const isSelected = selectedValues.includes(opt.value);
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      disabled={opt.disabled}
                      onClick={(e) => handleSelect(opt.value, e)}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all cursor-pointer select-none',
                        opt.disabled
                          ? 'opacity-40 cursor-not-allowed'
                          : isSelected
                          ? 'bg-brand-50 text-brand-900 font-semibold border border-brand-200/80 shadow-2xs'
                          : 'hover:bg-slate-50 text-slate-700 border border-transparent'
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        {opt.dotColor && (
                          <span
                            className={cn('w-2 h-2 rounded-full shrink-0 shadow-2xs', opt.dotColor)}
                          />
                        )}
                        {opt.icon && <span className="text-slate-400 shrink-0">{opt.icon}</span>}
                        <div className="min-w-0">
                          <p className="text-xs truncate">{opt.label}</p>
                          {opt.description && (
                            <p className="text-[11px] text-slate-400 truncate font-normal">
                              {opt.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-brand-600 stroke-[2.5] shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
        </div>


        {error ? (
          <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1 font-medium">
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

Dropdown.displayName = 'Dropdown';

export default Dropdown;
