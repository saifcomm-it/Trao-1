'use client';

import React, { useState } from 'react';
import { 
  Pin, 
  PinOff, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Edit2, 
  Check, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp,
  Sparkles,
  MessageSquare
} from 'lucide-react';
import { UIQuestion, QuestionCategory } from '@/lib/types';

interface QuestionCardProps {
  question: UIQuestion;
  index: number;
  totalInCat: number;
  availableRequirements: Array<{ id: string; text: string }>;
  onUpdate: (updatedQuestion: UIQuestion) => void;
  onDelete: (id: string) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onCategoryChange: (newCategory: QuestionCategory) => void;
  onOpenMock?: (question: UIQuestion) => void;
}

const CATEGORIES: Array<{ key: QuestionCategory; label: string }> = [
  { key: 'technical', label: 'Technical' },
  { key: 'behavioural', label: 'Behavioural' },
  { key: 'system-design', label: 'System Design' },
  { key: 'company-fit', label: 'Company Fit' },
];

export function QuestionCard({
  question,
  index,
  totalInCat,
  availableRequirements,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onCategoryChange,
  onOpenMock
}: QuestionCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [prompt, setPrompt] = useState(question.prompt);
  const [answerOutline, setAnswerOutline] = useState(question.answer_outline);
  const [difficulty, setDifficulty] = useState<1 | 2 | 3>(question.difficulty);
  const [isExpanded, setIsExpanded] = useState(true);

  const handleSave = () => {
    onUpdate({
      ...question,
      prompt,
      answer_outline: answerOutline,
      difficulty,
      origin: question.origin === 'manual' ? 'manual' : 'edited',
      isPinned: true // Auto-pin on edit to guarantee preservation!
    });
    setIsEditing(false);
  };

  const handleTogglePin = () => {
    onUpdate({
      ...question,
      isPinned: !question.isPinned
    });
  };

  const getDifficultyColor = (diff: number) => {
    switch (diff) {
      case 1:
        return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800';
      case 2:
        return 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800';
      case 3:
        return 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800';
      default:
        return 'text-zinc-600 bg-zinc-50 border-zinc-200';
    }
  };

  return (
    <div
      className={`rounded-xl border transition-all ${
        question.isPinned
          ? 'border-indigo-300 dark:border-indigo-800/80 bg-indigo-50/20 dark:bg-indigo-950/10 shadow-sm'
          : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm'
      }`}
    >
      {/* Header Bar */}
      <div className="p-4 flex items-start justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800/60">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
            {question.id}
          </span>

          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded border ${getDifficultyColor(
              question.difficulty
            )}`}
          >
            Level {question.difficulty}
          </span>

          {/* Linked Requirement Pills */}
          {question.requirement_ids.map((rId) => (
            <span
              key={rId}
              title={availableRequirements.find((r) => r.id === rId)?.text || ''}
              className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 cursor-help"
            >
              covers:{rId}
            </span>
          ))}

          {/* Origin Badge */}
          {question.origin === 'manual' ? (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 font-medium">
              Handcrafted
            </span>
          ) : question.origin === 'edited' ? (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 font-medium">
              User Edited
            </span>
          ) : (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
              Generated
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1">
          {/* Pin Button */}
          <button
            onClick={handleTogglePin}
            title={question.isPinned ? 'Pinned: Protected against category regeneration' : 'Pin to lock against regeneration'}
            className={`p-1.5 rounded-md text-xs transition-colors ${
              question.isPinned
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300'
                : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            {question.isPinned ? <Pin className="w-3.5 h-3.5 fill-current" /> : <PinOff className="w-3.5 h-3.5" />}
          </button>

          {/* Move Up / Down */}
          {onMoveUp && (
            <button
              onClick={onMoveUp}
              disabled={index === 0}
              title="Move question up"
              className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 transition-colors"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          )}
          {onMoveDown && (
            <button
              onClick={onMoveDown}
              disabled={index === totalInCat - 1}
              title="Move question down"
              className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 transition-colors"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Category Transfer Dropdown */}
          <select
            value={question.category}
            onChange={(e) => onCategoryChange(e.target.value as QuestionCategory)}
            className="text-xs bg-zinc-100 dark:bg-zinc-800 border-none rounded py-1 px-2 text-zinc-700 dark:text-zinc-300 cursor-pointer focus:ring-1 focus:ring-indigo-500"
            title="Move question to another category"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.key} value={cat.key}>
                Move to {cat.label}
              </option>
            ))}
          </select>

          {/* Delete Button */}
          <button
            onClick={() => onDelete(question.id)}
            title="Delete this question"
            className="p-1.5 rounded-md text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Body: Prompt & Outline */}
      <div className="p-4">
        {isEditing ? (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Question Prompt
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={2}
                className="w-full text-sm p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Expected Answer Outline & Scoring Key
              </label>
              <textarea
                value={answerOutline}
                onChange={(e) => setAnswerOutline(e.target.value)}
                rows={3}
                className="w-full text-sm p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500 font-medium">Difficulty:</span>
                {[1, 2, 3].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d as 1 | 2 | 3)}
                    className={`text-xs px-2.5 py-1 rounded font-medium ${
                      difficulty === d
                        ? 'bg-indigo-600 text-white'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    Level {d}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  Save & Lock
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-start justify-between gap-4">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 leading-snug">
                {question.prompt}
              </p>
              <button
                onClick={() => setIsEditing(true)}
                className="text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex-shrink-0"
                title="Edit prompt and outline"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Answer Outline Collapsible */}
            <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
              >
                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                Key Answer Points & Evaluation Criteria
              </button>

              {isExpanded && (
                <div className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/40 p-3 rounded-lg leading-relaxed border border-zinc-100 dark:border-zinc-800">
                  {question.answer_outline}
                </div>
              )}
            </div>

            {/* Mock Interview Launch Button */}
            {onOpenMock && (
              <div className="mt-3 flex justify-end">
                <button
                  onClick={() => onOpenMock(question)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 hover:underline"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Practice Answering (Mock AI Review)
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
