'use client';

import React, { useState } from 'react';
import {
  Code2,
  Users,
  Cpu,
  Compass,
  RefreshCw,
  Plus,
  Check,
  HelpCircle,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { UIQuestion, QuestionCategory } from '@/lib/types';
import { ICategorySectionProps } from '../interfaces/kit-builder.interface';
import { QuestionCard } from './QuestionCard';
import { api } from '@/lib/api';
import {
  Modal,
  InputField,
  TextareaField,
  Badge,
  Button,
  Dropdown
} from '@/shared/components';

const DIFFICULTY_OPTIONS = [
  { value: '1', label: 'Easy', dotColor: 'bg-emerald-500' },
  { value: '2', label: 'Medium', dotColor: 'bg-amber-500' },
  { value: '3', label: 'Hard', dotColor: 'bg-rose-500' },
];

const CATEGORY_META: Record<QuestionCategory, { label: string; desc: string; icon: any }> = {
  technical: {
    label: 'Technical Deep-Dives',
    desc: 'Core architecture, coding patterns, distributed protocols, and frameworks',
    icon: Code2,
  },
  behavioural: {
    label: 'Behavioural & Leadership',
    desc: 'Conflict resolution, leadership, mentorship, and STAR method delivery',
    icon: Users,
  },
  'system-design': {
    label: 'System Design & Scalability',
    desc: 'High-availability trade-offs, capacity planning, and component topology',
    icon: Cpu,
  },
  'company-fit': {
    label: 'Company Fit & Culture',
    desc: 'Mission alignment, operating values, and company-specific initiatives',
    icon: Compass,
  }
};

export function CategorySection({
  category,
  questions,
  requirements,
  onUpdateQuestion,
  onDeleteQuestion,
  onMoveQuestion,
  onCategoryChange,
  onAddQuestion,
  onRegenerateCategory,
  isRegenerating = false,
  onOpenMock,
  kitId,
  roleTitle,
  company,
  isAddingExternal,
  onCloseAddExternal
}: ICategorySectionProps) {
  const meta = CATEGORY_META[category];
  const Icon = meta.icon;

  const [isAddingInternal, setIsAddingInternal] = useState(false);
  const isAdding = isAddingExternal !== undefined ? isAddingExternal : isAddingInternal;
  const setIsAdding = (val: boolean) => {
    setIsAddingInternal(val);
    if (!val && onCloseAddExternal) {
      onCloseAddExternal();
    }
  };
  const [newPrompt, setNewPrompt] = useState('');
  const [newAnswerOutline, setNewAnswerOutline] = useState('');
  const [newDifficulty, setNewDifficulty] = useState<1 | 2 | 3>(2);
  const [selectedReqIds, setSelectedReqIds] = useState<string[]>([]);
  const [isGeneratingAnswer, setIsGeneratingAnswer] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const handleGenerateAnswer = async () => {
    if (!newPrompt.trim()) return;
    setIsGeneratingAnswer(true);
    setGenerationError(null);

    try {
      const mappedReqs = selectedReqIds.length > 0
        ? requirements.filter((r) => selectedReqIds.includes(r.id)).map((r) => r.text)
        : requirements.slice(0, 3).map((r) => r.text);

      const res = await api.generateAnswerOutline({
        prompt: newPrompt.trim(),
        category,
        role: roleTitle,
        company,
        requirements: mappedReqs,
        difficulty: newDifficulty,
        kitId
      });

      if (res.answer_outline) {
        setNewAnswerOutline(res.answer_outline);
        if (res.suggested_difficulty && (res.suggested_difficulty === 1 || res.suggested_difficulty === 2 || res.suggested_difficulty === 3)) {
          setNewDifficulty(res.suggested_difficulty as 1 | 2 | 3);
        }
      }
    } catch (err: any) {
      console.error('Failed to generate answer outline:', err);
      setGenerationError(err.message || 'AI generation failed. Please try again.');
    } finally {
      setIsGeneratingAnswer(false);
    }
  };

  const handleCreateQuestion = async () => {
    if (!newPrompt.trim()) return;
    setIsSubmitting(true);
    setGenerationError(null);

    let finalOutline = newAnswerOutline.trim();


    if (!finalOutline) {
      try {
        setIsGeneratingAnswer(true);
        const mappedReqs = selectedReqIds.length > 0
          ? requirements.filter((r) => selectedReqIds.includes(r.id)).map((r) => r.text)
          : requirements.slice(0, 3).map((r) => r.text);

        const res = await api.generateAnswerOutline({
          prompt: newPrompt.trim(),
          category,
          role: roleTitle,
          company,
          requirements: mappedReqs,
          difficulty: newDifficulty,
          kitId
        });

        if (res?.answer_outline) {
          finalOutline = res.answer_outline;
          setNewAnswerOutline(res.answer_outline);
        }
      } catch (err: any) {
        console.error('Failed to generate answer outline:', err);
        setGenerationError('Could not generate answer outline. Please try again.');
        setIsSubmitting(false);
        setIsGeneratingAnswer(false);
        return;
      } finally {
        setIsGeneratingAnswer(false);
      }
    }

    const newId = `q-custom-${Date.now()}`;
    const question: UIQuestion = {
      id: newId,
      requirement_ids: selectedReqIds.length > 0 ? selectedReqIds : [requirements[0]?.id || 'r1'],
      category,
      prompt: newPrompt.trim(),
      answer_outline: finalOutline,
      difficulty: newDifficulty,
      origin: 'manual',
      isPinned: true
    };

    onAddQuestion(question);
    setIsAdding(false);
    setIsSubmitting(false);
    setNewPrompt('');
    setNewAnswerOutline('');
    setSelectedReqIds([]);
    setGenerationError(null);
  };

  const manualCount = questions.filter((q) => q.origin === 'manual' || q.origin === 'edited' || q.isPinned).length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-card hover:shadow-pop transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 border border-brand-200/80 flex items-center justify-center shrink-0 shadow-2xs">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-slate-900">
                {meta.label}
              </h3>
              <Badge tone="neutral">
                {questions.length} questions
              </Badge>
              {manualCount > 0 && (
                <Badge tone="brand">
                  {manualCount} Protected
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {meta.desc}
            </p>
          </div>
        </div>
      </div>


      <Modal
        isOpen={isAdding}
        onClose={() => {
          setIsAdding(false);
          setGenerationError(null);
        }}
        title="Add Custom Question"
        description={`Add custom question to ${meta.label} — Gemini AI synthesizes high-signal answer outline.`}
        icon={<Sparkles className="w-5 h-5" />}
        maxWidth="2xl"
        footer={
          <div className="flex items-center justify-between w-full">
            <p className="text-xs text-slate-400 hidden sm:flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-600 shrink-0" />
              <span>Question is automatically protected from recalculation</span>
            </p>
            <div className="flex items-center gap-2 ml-auto">
              <Button
                variant="secondary"
                size="md"
                onClick={() => {
                  setIsAdding(false);
                  setGenerationError(null);
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleCreateQuestion}
                disabled={isSubmitting || !newPrompt.trim()}
                isLoading={isSubmitting}
                leftIcon={<Check className="w-4 h-4 stroke-[2.5]" />}
              >
                Add & Protect Question
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-4">

          <div>
            <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
              <label className="block text-xs font-bold text-slate-800">
                Question Prompt <span className="text-rose-500">*</span>
              </label>
              <Button
                variant="outline"
                size="xs"
                onClick={handleGenerateAnswer}
                disabled={isGeneratingAnswer || !newPrompt.trim()}
                isLoading={isGeneratingAnswer}
                leftIcon={<Sparkles className="w-3.5 h-3.5" />}
              >
                Generate 5-Line Answer with AI
              </Button>
            </div>

            <InputField
              placeholder="e.g. What is the difference between value types and reference types in C#, and where are they stored?"
              value={newPrompt}
              onChange={(e) => setNewPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && newPrompt.trim() && !newAnswerOutline) {
                  e.preventDefault();
                  handleGenerateAnswer();
                }
              }}
              leftIcon={<HelpCircle className="w-4 h-4 text-slate-400" />}
            />
          </div>


          <div>
            <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
              <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span>5-Line Model Answer Paragraph</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  ~5 sentences
                </span>
              </label>
              {newAnswerOutline ? (
                <div className="flex items-center gap-2">
                  <Badge tone="success" icon={<CheckCircle2 className="w-3 h-3" />}>
                    AI Answer Generated
                  </Badge>
                  <button
                    type="button"
                    onClick={handleGenerateAnswer}
                    disabled={isGeneratingAnswer}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-800 cursor-pointer transition-colors"
                  >
                    <RefreshCw className={`w-3 h-3 ${isGeneratingAnswer ? 'animate-spin' : ''}`} />
                    Regenerate
                  </button>
                </div>
              ) : (
                <span className="text-xs text-slate-400">
                  Click button above or will auto-generate on save
                </span>
              )}
            </div>

            {isGeneratingAnswer ? (
              <div className="p-4 rounded-2xl border border-brand-200 bg-brand-50/60 flex items-center gap-3.5 animate-pulse">
                <Loader2 className="w-5 h-5 text-brand-600 animate-spin shrink-0" />
                <div>
                  <p className="text-xs font-bold text-brand-950">
                    Gemini AI is crafting a high-signal answer outline...
                  </p>
                  <p className="text-[11px] text-brand-700 mt-0.5">
                    Synthesizing core architecture, key patterns, trade-offs, and scoring benchmarks.
                  </p>
                </div>
              </div>
            ) : (
              <TextareaField
                placeholder="Click &quot;Generate 5-Line Answer with AI&quot; above, or write your own concise answer..."
                value={newAnswerOutline}
                onChange={(e) => setNewAnswerOutline(e.target.value)}
                rows={4}
              />
            )}

            {generationError && (
              <div className="mt-2 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{generationError}</span>
              </div>
            )}
          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 items-start">
            <Dropdown
              label="Difficulty Level"
              options={DIFFICULTY_OPTIONS}
              value={String(newDifficulty)}
              onChange={(val) => setNewDifficulty(Number(val) as 1 | 2 | 3)}
            />

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Map to Job Requirement
                </label>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {selectedReqIds.length} selected
                </span>
              </div>

              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {requirements.length === 0 ? (
                  <p className="text-xs text-slate-400 italic p-3 bg-slate-50 rounded-xl border border-slate-200">
                    No specific requirements listed.
                  </p>
                ) : (
                  requirements.map((r) => {
                    const isSelected = selectedReqIds.includes(r.id);
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => {
                          setSelectedReqIds((prev) =>
                            prev.includes(r.id) ? prev.filter((id) => id !== r.id) : [...prev, r.id]
                          );
                        }}
                        className={`w-full text-left p-2.5 rounded-xl border text-xs flex items-start gap-2.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-brand-50/80 border-brand-300 text-brand-950 font-medium ring-1 ring-brand-500/20 shadow-2xs'
                            : 'bg-slate-50/50 border-slate-200/80 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                        }`}
                      >
                        <div
                          className={`mt-0.5 w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                            isSelected ? 'bg-brand-600 border-brand-600 text-white' : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="inline-block text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-700 border border-slate-200 mr-2">
                            {r.id}
                          </span>
                          <span className="text-xs text-slate-800 leading-relaxed">{r.text}</span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </Modal>


      <div className="mt-4 space-y-3">
        {questions.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-300">
            <p className="text-xs text-slate-500">
              No questions in this category yet. Click &quot;Add Question&quot;.
            </p>
          </div>
        ) : (
          questions.map((q, idx) => (
            <QuestionCard
              key={q.id}
              question={q}
              index={idx}
              totalInCat={questions.length}
              availableRequirements={requirements}
              onUpdate={onUpdateQuestion}
              onDelete={onDeleteQuestion}
              onMoveUp={idx > 0 ? () => onMoveQuestion(idx, idx - 1, category) : undefined}
              onMoveDown={idx < questions.length - 1 ? () => onMoveQuestion(idx, idx + 1, category) : undefined}
              onCategoryChange={(newCat) => onCategoryChange(q.id, newCat)}
              onOpenMock={onOpenMock}
            />
          ))
        )}
      </div>
    </div>
  );
}
