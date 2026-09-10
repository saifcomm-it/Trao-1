'use client';

import React, { useState } from 'react';
import { Globe, Check, Edit3, ExternalLink, FileText, Layers } from 'lucide-react';
import { IBriefEditorProps } from '../interfaces/kit-builder.interface';
import { cleanText } from '@/lib/utils';
import { Badge, TextareaField, Button } from '@/shared/components';

export function BriefEditor({
  brief,
  source,
  onUpdate,
  onRegenerate,
  isRegenerating = false
}: IBriefEditorProps) {
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
    <section className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-card transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <span className="h-5 w-1.5 rounded-full bg-brand-800 shrink-0" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-brand-900">
                {cleanText(source.company, 'Company')} Brief
              </h2>
              {brief.isEdited ? (
                <Badge tone="warning">Customized</Badge>
              ) : (
                <Badge tone="brand">Verified Research</Badge>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
              <a
                href={source.company_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-medium text-brand-700 hover:text-brand-900 hover:underline transition-colors"
              >
                <Globe className="w-3 h-3" />
                <span>{source.company_url}</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
              <span>•</span>
              <span>Researched {new Date(source.researched_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isEditing ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSave}
                leftIcon={<Check className="w-4 h-4" />}
              >
                Save Changes
              </Button>
            </>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsEditing(true)}
              leftIcon={<Edit3 className="w-3.5 h-3.5" />}
            >
              Edit Brief
            </Button>
          )}
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {isEditing ? (
          <div className="space-y-4">
            <TextareaField
              label="Company Summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={3}
            />
            <TextareaField
              label="What They Do & Engineering Focus"
              value={whatTheyDo}
              onChange={(e) => setWhatTheyDo(e.target.value)}
              rows={3}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 shadow-2xs">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <FileText className="w-3.5 h-3.5 text-brand-600" />
                <span>Summary</span>
              </h4>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-normal">
                {cleanText(brief.summary, 'No summary available.')}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 shadow-2xs">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <Layers className="w-3.5 h-3.5 text-teal-700" />
                <span>What They Do</span>
              </h4>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-normal">
                {cleanText(brief.what_they_do, 'No domain details extracted.')}
              </p>
            </div>
          </div>
        )}

        {brief.sources && brief.sources.length > 0 && (
          <div className="pt-3 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Verified Sources & Pages Crawled ({brief.sources.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {brief.sources.map((url, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-brand-600 font-medium hover:text-slate-900 bg-brand-50/80 hover:bg-brand-100 px-2.5 py-1 rounded-lg border border-brand-200/80 flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <Globe className="w-3 h-3 text-brand-600" />
                  <span className="max-w-[280px] truncate">{url}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
