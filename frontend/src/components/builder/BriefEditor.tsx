'use client';

import React, { useState } from 'react';
import { Building2, Globe, RefreshCw, Check, Edit3, ExternalLink, Sparkles } from 'lucide-react';
import { UICompanyBrief, KitSource } from '@/lib/types';

interface BriefEditorProps {
  brief: UICompanyBrief;
  source: KitSource;
  onUpdate: (updatedBrief: UICompanyBrief) => void;
  onRegenerate: () => Promise<void>;
  isRegenerating?: boolean;
}

export function BriefEditor({
  brief,
  source,
  onUpdate,
  onRegenerate,
  isRegenerating = false
}: BriefEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [summary, setSummary] = useState(brief.summary);
  const [whatTheyDo, setWhatTheyDo] = useState(brief.what_they_do);

  const handleSave = () => {
    onUpdate({
      ...brief,
      summary,
      what_they_do: whatTheyDo,
      isEdited: true
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setSummary(brief.summary);
    setWhatTheyDo(brief.what_they_do);
    setIsEditing(false);
  };

  return (
    <section className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
              {source.company} Brief
              {brief.isEdited && (
                <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
                  Customized
                </span>
              )}
            </h2>
            <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              <a 
                href={source.company_url} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                <Globe className="w-3 h-3" />
                {source.company_url}
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
              <span>•</span>
              <span>Researched {new Date(source.researched_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="px-3 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                Save Changes
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit Brief
              </button>
              <button
                onClick={onRegenerate}
                disabled={isRegenerating}
                title="Regenerate only this company brief without affecting question edits"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
                Regenerate Brief
              </button>
            </>
          )}
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Company Summary
              </label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={3}
                className="w-full text-sm p-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                What They Do & Engineering Focus
              </label>
              <textarea
                value={whatTheyDo}
                onChange={(e) => setWhatTheyDo(e.target.value)}
                rows={3}
                className="w-full text-sm p-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Summary
              </h4>
              <p className="mt-1 text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed">
                {brief.summary || 'No summary available.'}
              </p>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                What They Do
              </h4>
              <p className="mt-1 text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed">
                {brief.what_they_do || 'No domain details extracted.'}
              </p>
            </div>
          </div>
        )}

        {brief.sources && brief.sources.length > 0 && (
          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <h4 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
              Verified Sources & Pages Crawled ({brief.sources.length})
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {brief.sources.map((url, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline bg-indigo-50/50 dark:bg-indigo-950/30 px-2 py-0.5 rounded border border-indigo-100 dark:border-indigo-900 flex items-center gap-1"
                >
                  <Globe className="w-2.5 h-2.5" />
                  <span className="max-w-[240px] truncate">{url}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
