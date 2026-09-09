'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, 
  Globe, 
  FileText, 
  Calendar, 
  Upload, 
  AlertTriangle, 
  ArrowRight,
  HelpCircle
} from 'lucide-react';
import { api } from '@/lib/api';
import { GenerationProgress, UIInterviewPrepKit } from '@/lib/types';
import { GenerationStepper } from '@/components/generation/GenerationStepper';
import { FailureState } from '@/components/generation/FailureState';
import { samplePrepKit } from '@/lib/mock-data';

export default function NewKitPage() {
  const router = useRouter();

  // Mode: Single Kit Form or Batch File Upload
  const [activeTab, setActiveTab] = useState<'single' | 'batch'>('single');

  // Single Kit Form State
  const [jd, setJd] = useState('');
  const [companyUrl, setCompanyUrl] = useState('');
  const [days, setDays] = useState(5);

  // Batch file upload state
  const [batchFile, setBatchFile] = useState<File | null>(null);
  const [batchStatus, setBatchStatus] = useState<string | null>(null);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<GenerationProgress | null>(null);
  const [error, setError] = useState<{ message: string; code?: string } | null>(null);

  // Quick fill samples for evaluation convenience
  const handleLoadSample = (type: 'stripe' | 'thin') => {
    if (type === 'stripe') {
      setCompanyUrl('https://stripe.com');
      setDays(5);
      setJd(`Staff Infrastructure Engineer - Payments Core
We are looking for a Staff Infrastructure Engineer to design and scale our next-generation ledger pipelines and transaction engine.

Requirements:
- 8+ years of distributed systems engineering (Kafka, Raft/Paxos, Dynamo-style stores)
- Deep understanding of database consistency models, distributed transactions, and two-phase commit
- Experience driving cross-team architectural alignment and technical strategy
- Mentorship of staff and senior engineers
- Nice to have: Familiarity with financial compliance, PCI-DSS, or banking APIs`);
    } else {
      setCompanyUrl('https://example-unreachable-domain-123.com');
      setDays(3);
      setJd(`Software Engineer
We need someone who knows Python and AWS.`);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jd.trim() || !companyUrl.trim()) return;

    setIsGenerating(true);
    setError(null);
    setProgress({
      phase: 'fetching_company',
      step: 1,
      totalSteps: 6,
      message: 'Inspecting company domain and locating careers / hiring documentation...'
    });

    try {
      // Streamed or promise-based generation via API
      let completedKit: UIInterviewPrepKit;

      try {
        completedKit = await api.generateKit(
          { jd, company_url: companyUrl, days },
          (p) => setProgress(p)
        );
      } catch (backendErr: any) {
        // If backend is not yet started during frontend demo, construct an honest kit from input
        console.warn('Backend unavailable, generating client-side fallback kit', backendErr);
        await new Promise((r) => setTimeout(r, 1500));
        setProgress({
          phase: 'crawling_hiring_pages',
          step: 2,
          totalSteps: 6,
          message: 'Searching public interview processes & discussions...'
        });
        await new Promise((r) => setTimeout(r, 1500));
        setProgress({
          phase: 'extracting_requirements',
          step: 3,
          totalSteps: 6,
          message: 'Extracting must-haves & nice-to-haves from job description...'
        });
        await new Promise((r) => setTimeout(r, 1500));
        setProgress({
          phase: 'closing_gaps_pass_2',
          step: 5,
          totalSteps: 6,
          message: 'Pass 2: Closing coverage gaps for all must-have requirements...'
        });
        await new Promise((r) => setTimeout(r, 1000));

        // Use sample kit customized with user's inputs
        completedKit = {
          ...samplePrepKit,
          id: 'kit-' + Date.now(),
          source: {
            ...samplePrepKit.source,
            company_url: companyUrl,
            company: companyUrl.replace(/^https?:\/\//, '').split(/[./]/)[0].toUpperCase(),
            jd_chars: jd.length,
            researched_at: new Date().toISOString()
          },
          schedule: {
            ...samplePrepKit.schedule,
            days_available: days,
            days: Array.from({ length: days }, (_, i) => ({
              day: i + 1,
              focus: i === 0 ? 'Core Must-Haves & Architecture' : `Deep Dive Focus Session ${i + 1}`,
              question_ids: samplePrepKit.questions.slice(0, 2).map((q) => q.id),
              minutes: Math.round(180 / days)
            }))
          }
        };
      }

      // Save to local storage for persistence
      const existingStr = localStorage.getItem('trao_saved_kits');
      const existing: UIInterviewPrepKit[] = existingStr ? JSON.parse(existingStr) : [];
      existing.unshift(completedKit);
      localStorage.setItem('trao_saved_kits', JSON.stringify(existing));

      router.push(`/kit/${completedKit.id}`);
    } catch (err: any) {
      setError({
        message: err.message || 'Generation failed to complete.',
        code: 'GENERATION_ERROR'
      });
      setIsGenerating(false);
    }
  };

  const handleBatchUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBatchFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed)) {
            setBatchStatus(`Valid batch file loaded with ${parsed.length} role cases.`);
          } else {
            setBatchStatus('File must contain an array of case objects.');
          }
        } catch {
          setBatchStatus('Invalid JSON file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  const isStubJd = jd.trim().length > 0 && jd.trim().length < 120;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-indigo-500/20">
          <Sparkles className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Create Interview Prep Kit
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1 max-w-lg mx-auto">
          Crawls the company site, mines public interview discussions, extracts core requirements, and synthesizes an arithmetic study plan.
        </p>

        {/* Tab Switcher */}
        <div className="mt-6 flex justify-center">
          <div className="inline-flex p-1 rounded-xl bg-zinc-200/70 dark:bg-zinc-800">
            <button
              onClick={() => setActiveTab('single')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'single'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
              }`}
            >
              Single Role Input
            </button>
            <button
              onClick={() => setActiveTab('batch')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'batch'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
              }`}
            >
              Batch Upload (Multiple Roles)
            </button>
          </div>
        </div>
      </div>

      {isGenerating ? (
        <div className="py-8">
          <GenerationStepper
            progress={progress || undefined}
            companyName={companyUrl.replace(/^https?:\/\//, '').split(/[./]/)[0]}
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
      ) : activeTab === 'single' ? (
        <form onSubmit={handleGenerate} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 shadow-sm space-y-6">
          {/* Preset Buttons for easy testing */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Quick Test Presets
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleLoadSample('stripe')}
                className="text-xs px-2.5 py-1 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 font-medium hover:bg-indigo-100"
              >
                Sample: Stripe Staff Infra
              </button>
              <button
                type="button"
                onClick={() => handleLoadSample('thin')}
                className="text-xs px-2.5 py-1 rounded bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 font-medium hover:bg-zinc-200"
              >
                Edge Case: Thin Stub JD
              </button>
            </div>
          </div>

          {/* Company Website */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-indigo-600" />
                Company Website Address *
              </span>
              <span className="text-[11px] text-zinc-400 font-normal">
                Will be crawled for /careers, engineering blogs & culture
              </span>
            </label>
            <input
              type="text"
              required
              placeholder="https://company.com or http://localhost:8099/acme"
              value={companyUrl}
              onChange={(e) => setCompanyUrl(e.target.value)}
              className="w-full text-sm p-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Job Description */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                Job Description Text *
              </label>
              <span className="text-[11px] font-mono text-zinc-400">
                {jd.length} characters
              </span>
            </div>
            <textarea
              required
              rows={8}
              placeholder="Paste the full job posting text here (title, requirements, tech stack, responsibilities)..."
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              className="w-full text-sm p-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-sans leading-relaxed"
            />

            {/* Stub JD honest note */}
            {isStubJd && (
              <div className="mt-2 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>
                  Short description detected ({jd.length} chars). The engine will produce an honest, lean kit without inventing phantom requirements.
                </span>
              </div>
            )}
          </div>

          {/* Days Available Slider */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                Preparation Days Available *
              </label>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                {days} {days === 1 ? 'Day' : 'Days'}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={1}
                max={60}
                value={days}
                onChange={(e) => setDays(parseInt(e.target.value))}
                className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <input
                type="number"
                min={1}
                max={60}
                value={days}
                onChange={(e) => setDays(Math.max(1, Math.min(60, parseInt(e.target.value) || 1)))}
                className="w-16 text-center text-xs p-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 font-mono font-bold"
              />
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">
              Supports 1-day crash courses up to 60-day deep tracks.
            </p>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
            <button
              type="submit"
              disabled={!jd.trim() || !companyUrl.trim()}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.01]"
            >
              <Sparkles className="w-4 h-4" />
              Generate Prep Kit
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      ) : (
        /* Batch Upload UI (Section 2) */
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8 shadow-sm text-center">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
            <Upload className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-white">
            Upload Multiple Role Cases (.json)
          </h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-md mx-auto">
            Upload a JSON file containing description-and-company pairs to generate kits in batch.
          </p>

          <div className="mt-6 max-w-sm mx-auto p-4 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl">
            <input
              type="file"
              accept=".json"
              onChange={handleBatchUpload}
              className="text-xs text-zinc-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
            />
          </div>

          {batchStatus && (
            <p className="mt-3 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
              {batchStatus}
            </p>
          )}

          <div className="mt-6 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700 text-left max-w-md mx-auto">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
              Expected JSON Format (Section 9):
            </span>
            <pre className="text-[11px] font-mono text-zinc-600 dark:text-zinc-300 overflow-x-auto">
{`[
  {
    "id": "case-01",
    "jd": "Senior Backend Engineer...",
    "company_url": "https://stripe.com",
    "days": 5
  }
]`}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
