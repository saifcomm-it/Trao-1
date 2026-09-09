'use client';

import React, { useState, useEffect } from 'react';
import { 
  RotateCw, 
  Check, 
  HelpCircle, 
  AlertCircle, 
  ArrowLeft, 
  ArrowRight, 
  Sparkles,
  Trophy,
  Repeat
} from 'lucide-react';
import Link from 'next/link';
import { UIFlashcard } from '@/lib/types';
import { sortFlashcardsForPractice } from '@/lib/srs';

interface FlashcardDeckProps {
  kitId: string;
  initialCards: UIFlashcard[];
  onSaveProgress: (updatedCards: UIFlashcard[]) => void;
}

export function FlashcardDeck({ kitId, initialCards, onSaveProgress }: FlashcardDeckProps) {
  const [cards, setCards] = useState<UIFlashcard[]>(() => sortFlashcardsForPractice(initialCards));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const currentCard = cards[currentIndex];

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFinished) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (isFlipped) {
        if (e.key === '1') {
          handleRate('low');
        } else if (e.key === '2') {
          handleRate('medium');
        } else if (e.key === '3') {
          handleRate('high');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFlipped, isFinished, currentIndex, cards]);

  const handleRate = (confidence: 'low' | 'medium' | 'high') => {
    const updatedCards = [...cards];
    updatedCards[currentIndex] = {
      ...updatedCards[currentIndex],
      confidence,
      lastPracticedAt: new Date().toISOString()
    };

    setCards(updatedCards);
    onSaveProgress(updatedCards);

    setIsFlipped(false);
    if (currentIndex < cards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  const handleRestartSmartSession = () => {
    const nextQueue = sortFlashcardsForPractice(cards);
    setCards(nextQueue);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsFinished(false);
  };

  // Stats
  const coveredCount = cards.filter((c) => c.confidence && c.confidence !== 'unreviewed').length;
  const highCount = cards.filter((c) => c.confidence === 'high').length;
  const medCount = cards.filter((c) => c.confidence === 'medium').length;
  const lowCount = cards.filter((c) => c.confidence === 'low').length;
  const progressPercent = Math.round((coveredCount / cards.length) * 100) || 0;

  if (isFinished) {
    return (
      <div className="max-w-xl mx-auto mt-8 p-8 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-center shadow-xl">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
          <Trophy className="w-7 h-7" />
        </div>

        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
          Practice Session Complete!
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          You have reviewed all {cards.length} flashcards in this deck.
        </p>

        {/* Breakdown */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900">
            <span className="block text-xl font-bold text-emerald-700 dark:text-emerald-400">
              {highCount}
            </span>
            <span className="text-[11px] font-medium text-emerald-800 dark:text-emerald-300">
              Mastered
            </span>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900">
            <span className="block text-xl font-bold text-amber-700 dark:text-amber-400">
              {medCount}
            </span>
            <span className="text-[11px] font-medium text-amber-800 dark:text-amber-300">
              Hesitant
            </span>
          </div>
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900">
            <span className="block text-xl font-bold text-rose-700 dark:text-rose-400">
              {lowCount}
            </span>
            <span className="text-[11px] font-medium text-rose-800 dark:text-rose-300">
              Needs Review
            </span>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleRestartSmartSession}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20 transition-all"
          >
            <Repeat className="w-4 h-4" />
            Next Session (Least Confident First)
          </button>
          <Link
            href={`/kit/${kitId}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Kit Builder
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header & Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs text-zinc-500 mb-2">
          <span className="font-medium">
            Card {currentIndex + 1} of {cards.length}
          </span>
          <span>{progressPercent}% Deck Covered</span>
        </div>
        <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
          <div
            className="h-full bg-indigo-600 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Flashcard View */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="min-h-[280px] sm:min-h-[320px] p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl cursor-pointer flex flex-col justify-between select-none relative hover:border-indigo-300 dark:hover:border-indigo-800 transition-all"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
            {currentCard?.id}
          </span>
          <span className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
            <RotateCw className="w-3 h-3" />
            {isFlipped ? 'Answer Revealed' : 'Click or press Space to reveal'}
          </span>
        </div>

        <div className="my-auto py-6 text-center">
          {!isFlipped ? (
            <div>
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
                Prompt / Concept
              </span>
              <h3 className="text-lg sm:text-xl font-semibold text-zinc-900 dark:text-white leading-relaxed">
                {currentCard?.front}
              </h3>
            </div>
          ) : (
            <div className="animate-in fade-in zoom-in-95 duration-150">
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block mb-2">
                Key Answer Points
              </span>
              <p className="text-base sm:text-lg text-zinc-800 dark:text-zinc-200 leading-relaxed max-w-xl mx-auto">
                {currentCard?.back}
              </p>
            </div>
          )}
        </div>

        <div className="text-center">
          <span className="text-[11px] text-zinc-400">
            Covers requirement: {currentCard?.requirement_ids.join(', ')}
          </span>
        </div>
      </div>

      {/* Confidence Rating Controls (Section 7) */}
      <div className="mt-6">
        {isFlipped ? (
          <div className="animate-in fade-in duration-200">
            <p className="text-center text-xs font-medium text-zinc-500 mb-3">
              How confident did you feel? (Press 1, 2, or 3)
            </p>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handleRate('low')}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/30 hover:bg-rose-100 text-rose-800 dark:text-rose-300 transition-colors"
              >
                <AlertCircle className="w-5 h-5 mb-1 text-rose-600" />
                <span className="text-xs font-bold">Needs Review</span>
                <span className="text-[10px] opacity-70">Key [1]</span>
              </button>

              <button
                onClick={() => handleRate('medium')}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/30 hover:bg-amber-100 text-amber-800 dark:text-amber-300 transition-colors"
              >
                <HelpCircle className="w-5 h-5 mb-1 text-amber-600" />
                <span className="text-xs font-bold">Hesitant</span>
                <span className="text-[10px] opacity-70">Key [2]</span>
              </button>

              <button
                onClick={() => handleRate('high')}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/70 dark:bg-emerald-950/30 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 transition-colors"
              >
                <Check className="w-5 h-5 mb-1 text-emerald-600" />
                <span className="text-xs font-bold">Mastered</span>
                <span className="text-[10px] opacity-70">Key [3]</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <button
              onClick={() => setIsFlipped(true)}
              className="px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-colors"
            >
              Reveal Answer [Space]
            </button>
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="mt-8 pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
        <Link
          href={`/kit/${kitId}`}
          className="inline-flex items-center gap-1.5 hover:text-zinc-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Exit to Kit
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (currentIndex > 0) {
                setCurrentIndex((prev) => prev - 1);
                setIsFlipped(false);
              }
            }}
            disabled={currentIndex === 0}
            className="p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span>
            {currentIndex + 1} / {cards.length}
          </span>
          <button
            onClick={() => {
              if (currentIndex < cards.length - 1) {
                setCurrentIndex((prev) => prev + 1);
                setIsFlipped(false);
              }
            }}
            disabled={currentIndex === cards.length - 1}
            className="p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
