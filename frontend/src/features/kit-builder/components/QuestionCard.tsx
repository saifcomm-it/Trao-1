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
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { QuestionCategory } from '@/lib/types';
import { IQuestionCardProps } from '../interfaces/kit-builder.interface';
import { cleanText, formatQuestionId } from '@/lib/utils';
import { Badge, Button } from '@/shared/components';

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
}: IQuestionCardProps) {
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
      isPinned: true
    });
    setIsEditing(false);
  };

  const handleTogglePin = () => {
    onUpdate({
      ...question,
      isPinned: !question.isPinned
    });
  };

  const getDifficultyTone = (diff: number) => {
    switch (diff) {
      case 1:
        return 'success';
      case 2:
        return 'warning';
      case 3:
        return 'danger';
      default:
        return 'neutral';
    }
  };

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 ${
        question.isPinned
          ? 'border-brand-300 bg-brand-50/40 shadow-card hover:shadow-pop'
          : 'border-slate-200 bg-white hover:border-slate-300 shadow-card hover:shadow-pop'
      }`}
    >
      <div className="p-4 sm:p-4.5 flex items-start justify-between gap-3 border-b border-slate-100">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200/80">
            {formatQuestionId(question.id)}
          </span>

          <Badge tone={getDifficultyTone(question.difficulty)}>
            {question.difficulty === 1 ? 'Easy' : question.difficulty === 3 ? 'Hard' : 'Medium'}
          </Badge>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={handleTogglePin}
            title={question.isPinned ? 'Pinned: Protected against category regeneration' : 'Pin to lock against regeneration'}
            className={`p-1.5 rounded-xl text-xs transition-all cursor-pointer ${
              question.isPinned
                ? 'bg-brand-100 text-brand-700 shadow-2xs'
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}
          >
            {question.isPinned ? <Pin className="w-3.5 h-3.5 fill-current text-brand-600" /> : <PinOff className="w-3.5 h-3.5" />}
          </button>

          {onMoveUp && (
            <button
              onClick={onMoveUp}
              disabled={index === 0}
              title="Move question up"
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 transition-colors cursor-pointer"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          )}
          {onMoveDown && (
            <button
              onClick={onMoveDown}
              disabled={index === totalInCat - 1}
              title="Move question down"
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 transition-colors cursor-pointer"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
          )}

          <select
            value={question.category}
            onChange={(e) => onCategoryChange(e.target.value as QuestionCategory)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl py-1 px-2.5 text-slate-700 cursor-pointer focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none"
            title="Move question to another category"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.key} value={cat.key}>
                Move to {cat.label}
              </option>
            ))}
          </select>

          <button
            onClick={() => onDelete(question.id)}
            title="Delete this question"
            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        {isEditing ? (
          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Question Prompt
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={2}
                className="w-full text-xs sm:text-sm p-3 rounded-2xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none transition-all font-sans leading-relaxed shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Expected Answer Outline & Scoring Key
              </label>
              <textarea
                value={answerOutline}
                onChange={(e) => setAnswerOutline(e.target.value)}
                rows={3}
                className="w-full text-xs sm:text-sm p-3 rounded-2xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none transition-all font-sans leading-relaxed shadow-2xs"
              />
            </div>

            <div className="flex items-center justify-between pt-2 flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-semibold">Difficulty:</span>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(Number(e.target.value) as 1 | 2 | 3)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-xl py-1 px-2.5 text-slate-800 font-semibold cursor-pointer focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none transition-all"
                >
                  <option value={1}>Easy</option>
                  <option value={2}>Medium</option>
                  <option value={3}>Hard</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSave}
                  leftIcon={<Check className="w-4 h-4" />}
                >
                  Save & Lock
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-start justify-between gap-4">
              <p className="text-sm sm:text-base font-semibold text-slate-900 leading-snug">
                {cleanText(question.prompt)}
              </p>
              <button
                onClick={() => setIsEditing(true)}
                className="text-slate-400 hover:text-brand-600 p-2 rounded-xl hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
                title="Edit prompt and outline"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-3.5 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
              >
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                <span>Key Answer Points & Evaluation Criteria</span>
              </button>

              {isExpanded && (
                <div className="mt-2.5 text-xs sm:text-sm text-slate-800 bg-slate-50/70 p-4 rounded-2xl leading-relaxed border border-slate-200/80">
                  {cleanText(question.answer_outline)}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
