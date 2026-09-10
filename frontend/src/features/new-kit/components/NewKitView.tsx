'use client';

import React from 'react';
import {
  Sparkles,
  Globe,
  FileText,
  Calendar,
  AlertTriangle,
  ArrowRight,
  Minus,
  Plus
} from 'lucide-react';
import { useNewKit } from '../hooks/useNewKit';
import { GenerationStepper } from './GenerationStepper';
import { FailureState } from './FailureState';
import { InputField, TextareaField, Button } from '@/shared/components';

export function NewKitView() {
  const {
    jd,
    setJd,
    companyUrl,
    setCompanyUrl,
    days,
    setDays,
    isGenerating,
    progress,
    error,
    setError,
    handleGenerate,
    isStubJd
  } = useNewKit();

  return (
    <div className="w-full py-2 max-w-4xl mx-auto">

      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-brand-500/25">
          <Sparkles className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Create Interview Prep Kit
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-lg mx-auto leading-relaxed">
          Dynamically crawls the company website, mines public interview discussions, extracts core requirements, and synthesizes a verified preparation plan.
        </p>
      </div>

      {isGenerating ? (
        <div className="py-8">
          <GenerationStepper
            progress={progress || undefined}
            companyName={companyUrl}
          />
        </div>
      ) : error ? (
        <div className="py-8">
          <FailureState
            message={error.message}
            code={error.code}
            onRetry={() => {
              setError(null);
            }}
          />
        </div>
      ) : (
        <form onSubmit={handleGenerate} className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-card space-y-6">

          <InputField
            label="Company Website Address"
            required
            placeholder="https://example.com"
            value={companyUrl}
            onChange={(e) => setCompanyUrl(e.target.value)}
            leftIcon={<Globe className="w-4 h-4 text-brand-600" />}
            helperText="Enter the company's official domain name (e.g., stripe.com or https://stripe.com)"
            inputSize="md"
          />


          <div>
            <TextareaField
              label="Job Description Text"
              required
              rows={8}
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              placeholder="Paste full job description including requirements, responsibilities, and about the company..."
              charCount={jd.length}
            />


            {isStubJd && (
              <div className="mt-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Sparse Job Description:</strong> Your description is under 150 characters. We will strictly extract what is present without hallucinating.
                </span>
              </div>
            )}
          </div>


          <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-brand-600" />
                  <span>Preparation Study Timeline</span>
                </label>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Select your target study duration (1 to 60 days)
                </p>
              </div>


              <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1 shadow-2xs self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setDays(Math.max(1, days - 1))}
                  disabled={days <= 1}
                  title="Decrease days"
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed shadow-2xs transition-all cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-1 px-3 min-w-[84px] justify-center">
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={days}
                    onChange={(e) => {
                      const v = parseInt(e.target.value, 10);
                      if (!isNaN(v)) {
                        setDays(Math.max(1, Math.min(60, v)));
                      } else if (e.target.value === '') {
                        setDays(1);
                      }
                    }}
                    className="w-8 text-center font-extrabold text-sm text-brand-700 bg-transparent outline-none focus:ring-0 focus:border-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="text-xs font-bold text-slate-600 whitespace-nowrap">
                    Day{days > 1 ? 's' : ''}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setDays(Math.min(60, days + 1))}
                  disabled={days >= 60}
                  title="Increase days"
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed shadow-2xs transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>


            <div className="pt-1">
              <input
                type="range"
                min={1}
                max={60}
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="w-full accent-brand-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1.5">
                <span>1 Day</span>
                <span>15 Days</span>
                <span>30 Days</span>
                <span>45 Days</span>
                <span>60 Days</span>
              </div>
            </div>


            <div className="pt-1 flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                Presets:
              </span>
              {[3, 5, 7, 14, 30, 60].map((preset) => {
                const isActive = days === preset;
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setDays(preset)}
                    className={`h-7 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer border ${
                      isActive
                        ? 'bg-brand-600 text-white border-brand-600 shadow-2xs scale-105'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    {preset} Days
                  </button>
                );
              })}
            </div>


            <div className="p-3 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between text-xs flex-wrap gap-2 shadow-2xs">
              <span className="text-slate-600">
                Deterministic curriculum distributes study across exactly <strong className="text-brand-700 font-bold">{days} days</strong>.
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-brand-50 text-brand-700 border border-brand-200/80 font-bold">
                ~{Math.max(12, days * 2)} questions planned
              </span>
            </div>
          </div>


          <div className="pt-4 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={!jd.trim() || !companyUrl.trim()}
              leftIcon={<Sparkles className="w-4 h-4" />}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Generate Prep Kit
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
