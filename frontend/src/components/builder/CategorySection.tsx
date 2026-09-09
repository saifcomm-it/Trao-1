'use client';

import React, { useState } from 'react';
import { 
  Code2, 
  Users, 
  Cpu, 
  Compass, 
  RefreshCw, 
  Plus, 
  Sparkles, 
  Check, 
  X,
  ShieldCheck
} from 'lucide-react';
import { UIQuestion, QuestionCategory, KitRequirement } from '@/lib/types';
import { QuestionCard } from './QuestionCard';

interface CategorySectionProps {
  category: QuestionCategory;
  questions: UIQuestion[];
  requirements: KitRequirement[];
  onUpdateQuestion: (updated: UIQuestion) => void;
  onDeleteQuestion: (id: string) => void;
  onMoveQuestion: (fromIndex: number, toIndex: number, category: QuestionCategory) => void;
  onCategoryChange: (questionId: string, newCategory: QuestionCategory) => void;
  onAddQuestion: (newQuestion: UIQuestion) => void;
  onRegenerateCategory: (category: QuestionCategory) => Promise<void>;
  isRegenerating?: boolean;
  onOpenMock?: (question: UIQuestion) => void;
}

const CATEGORY_META: Record<QuestionCategory, { label: string; desc: string; icon: any }> = {
  technical: {
    label: 'Technical Deep-Dives',
    desc: 'Core architecture, coding patterns, distributed protocols, and frameworks',
    icon: Code2
  },
  behavioural: {
    label: 'Behavioural & Leadership',
    desc: 'Conflict resolution, leadership, mentorship, and STAR method delivery',
    icon: Users
  },
  'system-design': {
    label: 'System Design & Scalability',
    desc: 'High-availability trade-offs, capacity planning, and component topology',
    icon: Cpu
  },
  'company-fit': {
    label: 'Company Fit & Culture',
    desc: 'Mission alignment, operating values, and company-specific initiatives',
    icon: Compass
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
  onOpenMock
}: CategorySectionProps) {
  const meta = CATEGORY_META[category];
  const Icon = meta.icon;

  const [isAdding, setIsAdding] = useState(false);
  const [newPrompt, setNewPrompt] = useState('');
  const [newAnswerOutline, setNewAnswerOutline] = useState('');
  const [newDifficulty, setNewDifficulty] = useState<1 | 2 | 3>(2);
  const [selectedReqIds, setSelectedReqIds] = useState<string[]>([]);

  const handleCreateQuestion = () => {
    if (!newPrompt.trim()) return;

    const newId = `q-custom-${Date.now()}`;
    const question: UIQuestion = {
      id: newId,
      requirement_ids: selectedReqIds.length > 0 ? selectedReqIds : [requirements[0]?.id || 'r1'],
      category,
      prompt: newPrompt.trim(),
      answer_outline: newAnswerOutline.trim() || 'Comprehensive answer outline to be added.',
      difficulty: newDifficulty,
      origin: 'manual',
      isPinned: true
    };

    onAddQuestion(question);
    setIsAdding(false);
    setNewPrompt('');
    setNewAnswerOutline('');
    setSelectedReqIds([]);
  };

  const manualCount = questions.filter((q) => q.origin === 'manual' || q.origin === 'edited' || q.isPinned).length;

  return (
    <div className="bg-zinc-50/50 dark:bg-zinc-950/40 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 p-5">
      {/* Category Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200/80 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
                {meta.label}
              </h3>
              <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                {questions.length}
              </span>
              {manualCount > 0 && (
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  {manualCount} Protected
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              {meta.desc}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Question
          </button>

          <button
            onClick={() => onRegenerateCategory(category)}
            disabled={isRegenerating}
            title="Regenerates only AI questions in this category. Manual/edited questions are protected!"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
            Regenerate Category
          </button>
        </div>
      </div>

      {/* Add Question Inline Form */}
      {isAdding && (
        <div className="mt-4 p-4 rounded-xl border border-indigo-200 dark:border-indigo-900 bg-white dark:bg-zinc-900 shadow-md">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-white flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-indigo-600" />
              Add Custom Question to {meta.label}
            </h4>
            <button
              onClick={() => setIsAdding(false)}
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Question Prompt *
              </label>
              <input
                type="text"
                placeholder="e.g. How do you implement distributed locking in Redis?"
                value={newPrompt}
                onChange={(e) => setNewPrompt(e.target.value)}
                className="w-full text-sm p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Answer Outline & Key Benchmarks
              </label>
              <textarea
                placeholder="What points should the candidate hit in their response?"
                value={newAnswerOutline}
                onChange={(e) => setNewAnswerOutline(e.target.value)}
                rows={2}
                className="w-full text-sm p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Difficulty Level
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setNewDifficulty(d as 1 | 2 | 3)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium ${
                        newDifficulty === d
                          ? 'bg-indigo-600 text-white'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                      }`}
                    >
                      Level {d}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Map to Job Requirement
                </label>
                <select
                  multiple
                  value={selectedReqIds}
                  onChange={(e) =>
                    setSelectedReqIds(Array.from(e.target.selectedOptions, (opt) => opt.value))
                  }
                  className="w-full text-xs p-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white h-20"
                >
                  {requirements.map((r) => (
                    <option key={r.id} value={r.id}>
                      [{r.id}] {r.text.substring(0, 50)}...
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateQuestion}
                className="inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm"
              >
                <Check className="w-3.5 h-3.5" />
                Add & Protect Question
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Questions List */}
      <div className="mt-4 space-y-3">
        {questions.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-zinc-900/50 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
            <p className="text-xs text-zinc-500">
              No questions in this category yet. Click &quot;Add Question&quot; or &quot;Regenerate Category&quot;.
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
