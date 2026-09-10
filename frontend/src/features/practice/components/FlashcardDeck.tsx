'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  RotateCw,
  Check,
  HelpCircle,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Trophy,
  Repeat,
  BookOpen,
  Eye,
  CheckCircle2,
  RotateCcw,
  PenLine,
  Volume2,
  VolumeX,
  Shuffle,
  Plus,
  Trash2,
  Search,
  Play,
  Layers,
  X,
  SlidersHorizontal,
  Sparkles,
  Loader2
} from 'lucide-react';
import { usePractice } from '../hooks/usePractice';
import { cleanText } from '@/lib/utils';
import { UIFlashcard } from '@/lib/types';
import { api } from '@/lib/api';
import { Button } from '@/shared/components';

export function FlashcardDeck({ kitId }: { kitId: string }) {
  const {
    cards,
    currentCard,
    currentIndex,
    setCurrentIndex,
    isFlipped,
    setIsFlipped,
    isFinished,
    handleRate,
    saveUserAnswer,
    handleRestartSmartSession,
    handleAddCard,
    handleDeleteCard,
    handleShuffleCards,
    jumpToCard,
    highCount,
    medCount,
    lowCount,
    sessionPercent
  } = usePractice(kitId);


  const [viewMode, setViewMode] = useState<'player' | 'deck'>('player');


  const [draftAnswers, setDraftAnswers] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);


  const [evaluations, setEvaluations] = useState<Record<string, {
    score: number;
    strengths: string[];
    gaps: string[];
    feedback: string;
  }>>({});
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalError, setEvalError] = useState<string | null>(null);


  const [statusFilter, setStatusFilter] = useState<'all' | 'high' | 'medium' | 'low' | 'unreviewed'>('all');
  const [searchQuery, setSearchQuery] = useState('');


  const [showAddModal, setShowAddModal] = useState(false);
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);


  const [isSpeaking, setIsSpeaking] = useState(false);


  useEffect(() => {
    if (cards && cards.length > 0) {
      setDraftAnswers((prev) => {
        const next = { ...prev };
        cards.forEach((c) => {
          if (c.userAnswer && next[c.id] === undefined) {
            next[c.id] = c.userAnswer;
          }
        });
        return next;
      });
    }
  }, [cards]);


  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    if (isSpeaking) {
      setIsSpeaking(false);
      return;
    }
    const clean = cleanText(text);
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleEvaluateAnswer = async () => {
    if (!currentCard) return;
    const draft = (draftAnswers[currentCard.id] || '').trim();
    if (!draft) {
      handleViewAnswer();
      return;
    }

    setIsEvaluating(true);
    setEvalError(null);
    setIsFlipped(true);

    try {
      await saveUserAnswer(currentCard.id, draft);
      const res = await api.evaluateAnswer({
        questionPrompt: currentCard.front,
        answerOutline: currentCard.back,
        userAnswer: draft,
        questionId: currentCard.id
      });

      if (res && typeof res.score === 'number') {
        setEvaluations((prev) => ({
          ...prev,
          [currentCard.id]: {
            score: Math.round(res.score),
            strengths: res.strengths || [],
            gaps: res.gaps || [],
            feedback: res.feedback || ''
          }
        }));
      }
    } catch (err: any) {
      console.error('Answer evaluation failed:', err);
      setEvalError(err?.message || 'Could not calculate AI match percentage. You can still compare manually.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleViewAnswer = async () => {
    if (currentCard) {
      const draft = (draftAnswers[currentCard.id] || '').trim();
      setIsSaving(true);
      try {
        await saveUserAnswer(currentCard.id, draft);
      } finally {
        setIsSaving(false);
      }


      if (draft && !evaluations[currentCard.id]) {
        handleEvaluateAnswer();
        return;
      }
    }
    setIsFlipped(true);
  };

  const handleCreateNewCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFront.trim() || !newBack.trim()) return;
    setIsSubmitting(true);
    try {
      await handleAddCard(newFront.trim(), newBack.trim());
      setNewFront('');
      setNewBack('');
      setShowAddModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cards.length === 0) {
    return (
      <div className="p-12 text-center bg-white rounded-xl border border-dashed border-slate-300 max-w-xl mx-auto">
        <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 border border-brand-200 flex items-center justify-center mx-auto mb-3">
          <BookOpen className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-800">No flashcards yet in this deck</h3>
        <p className="text-xs text-slate-500 mt-1">Create your first custom card to start practicing active recall.</p>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          onClick={() => setShowAddModal(true)}
          className="mt-4"
        >
          Add First Card
        </Button>
      </div>
    );
  }


  const unreviewedCount = cards.filter((c) => !c.confidence || c.confidence === 'unreviewed').length;
  const filteredDeckCards = cards.filter((card) => {
    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'unreviewed'
        ? (!card.confidence || card.confidence === 'unreviewed')
        : card.confidence === statusFilter;

    const query = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !query ||
      card.front.toLowerCase().includes(query) ||
      card.back.toLowerCase().includes(query);

    return matchesStatus && matchesQuery;
  });

  const renderAnswerContent = (text: string) => {
    const cleaned = cleanText(text);
    const lines = cleaned.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length > 1) {
      return (
        <ul className="space-y-2 text-left">
          {lines.map((line, idx) => {
            const cleanLine = line.replace(/^[-•*]\s*/, '').replace(/^\d+\.\s*/, '');
            return (
              <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-2 shrink-0" />
                <span>{cleanLine}</span>
              </li>
            );
          })}
        </ul>
      );
    }
    return <p className="text-xs sm:text-sm text-slate-700 leading-relaxed text-left">{cleaned}</p>;
  };

  const currentDraft = (currentCard ? draftAnswers[currentCard.id] : '') || '';

  const handleDraftChange = (value: string) => {
    if (!currentCard) return;
    setDraftAnswers((prev) => ({ ...prev, [currentCard.id]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/80 w-fit">
          <button
            onClick={() => setViewMode('player')}
            className={`inline-flex items-center gap-2 h-8 px-3.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              viewMode === 'player'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Play className="w-3.5 h-3.5 text-brand-600" />
            <span>Practice Player</span>
          </button>

          <button
            onClick={() => setViewMode('deck')}
            className={`inline-flex items-center gap-2 h-8 px-3.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              viewMode === 'deck'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-brand-600" />
            <span>Browse & Manage Deck ({cards.length})</span>
          </button>
        </div>


        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {viewMode === 'player' && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              leftIcon={<Shuffle className="w-3.5 h-3.5 text-slate-500" />}
              onClick={handleShuffleCards}
              title="Shuffle card order"
            >
              Shuffle
            </Button>
          )}

          <Button
            type="button"
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setShowAddModal(true)}
          >
            Add Flashcard
          </Button>
        </div>
      </div>




      {viewMode === 'player' && (
        <div className="max-w-2xl mx-auto">
          {isFinished ? (
            <div className="max-w-lg mx-auto mt-6 p-6 sm:p-7 bg-white/95 rounded-2xl border border-slate-200/90 text-center shadow-pop relative overflow-hidden backdrop-blur-sm">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center mb-3 shadow-glow">
                <Trophy className="w-6 h-6 animate-pulse" />
              </div>

              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Practice Session Complete!
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                You have reviewed all {cards.length} flashcards in this deck.
              </p>


              <div className="mt-5 grid grid-cols-3 gap-2.5">
                <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-200">
                  <span className="block text-xl font-bold text-teal-700">{highCount}</span>
                  <span className="text-xs font-semibold text-teal-800">Mastered</span>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                  <span className="block text-xl font-bold text-amber-700">{medCount}</span>
                  <span className="text-xs font-semibold text-amber-800">Hesitant</span>
                </div>
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200">
                  <span className="block text-xl font-bold text-rose-700">{lowCount}</span>
                  <span className="text-xs font-semibold text-rose-800">Needs Review</span>
                </div>
              </div>


              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-2">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  leftIcon={<Repeat className="w-3.5 h-3.5" />}
                  onClick={handleRestartSmartSession}
                  className="w-full sm:w-auto"
                >
                  Next Session (Least Confident First)
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  leftIcon={<Layers className="w-3.5 h-3.5" />}
                  onClick={() => setViewMode('deck')}
                  className="w-full sm:w-auto"
                >
                  View All Cards
                </Button>
              </div>
            </div>
          ) : (
            <>

              <div className="mb-5">
                <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">
                      Card {currentIndex + 1} of {cards.length}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
                      {sessionPercent}%
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="text-teal-700 font-medium">
                      <span className="font-bold">{highCount}</span> Mastered
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-amber-700 font-medium">
                      <span className="font-bold">{medCount}</span> Hesitant
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-rose-700 font-medium">
                      <span className="font-bold">{lowCount}</span> Review
                    </span>
                  </div>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-brand-600 to-brand-700 transition-all duration-300 rounded-full"
                    style={{ width: `${sessionPercent}%` }}
                  />
                </div>
              </div>


              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card hover:shadow-pop transition-all p-5 sm:p-6 flex flex-col justify-between">

                <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-bold border border-slate-200">
                      {currentCard?.id?.toUpperCase()}
                    </span>


                    <button
                      onClick={() => speakText(currentCard?.front || '')}
                      title={isSpeaking ? "Stop speech" : "Listen to question"}
                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                        isSpeaking
                          ? 'bg-brand-50 text-brand-700 border-brand-300 animate-pulse'
                          : 'bg-white text-slate-500 border-slate-200 hover:text-brand-600 hover:bg-slate-50'
                      }`}
                    >
                      {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <button
                    onClick={isFlipped ? () => setIsFlipped(false) : handleViewAnswer}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors cursor-pointer"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>{isFlipped ? 'Answer Revealed' : 'View Answer'}</span>
                  </button>
                </div>


                <div className="py-4">
                  {!isFlipped ? (
                    <div>

                      <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                        {cleanText(currentCard?.front)}
                      </h3>


                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                            <PenLine className="w-3.5 h-3.5 text-brand-600" />
                            <span>Your Answer (Self-Check before revealing)</span>
                          </label>
                          <span className="text-[11px] text-slate-400">Ctrl + Enter to reveal</span>
                        </div>
                        <textarea
                          value={currentDraft}
                          onChange={(e) => handleDraftChange(e.target.value)}
                          onKeyDown={(e) => {
                            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                              e.preventDefault();
                              handleViewAnswer();
                            }
                          }}
                          placeholder="Draft your answer points here to test yourself before flipping..."
                          rows={3}
                          className="w-full p-3 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-slate-800 placeholder:text-slate-400 transition-all resize-none outline-none"
                        />
                      </div>


                      <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                        {currentDraft.trim() ? (
                          <>
                            <Button
                              type="button"
                              variant="primary"
                              size="md"
                              onClick={handleEvaluateAnswer}
                              disabled={isEvaluating}
                              isLoading={isEvaluating}
                              leftIcon={<Sparkles className="w-3.5 h-3.5" />}
                              className="w-full sm:w-auto"
                            >
                              Match with AI Answer & Score %
                            </Button>

                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={handleViewAnswer}
                            >
                              View Answer without AI
                            </Button>
                          </>
                        ) : (
                          <Button
                            type="button"
                            variant="primary"
                            size="sm"
                            leftIcon={<Eye className="w-3.5 h-3.5" />}
                            onClick={handleViewAnswer}
                          >
                            View Answer
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="animate-in fade-in duration-200">

                      <div className="pb-3 mb-3 border-b border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                          Question
                        </span>
                        <p className="text-xs sm:text-sm font-semibold text-slate-800">
                          {cleanText(currentCard?.front)}
                        </p>
                      </div>


                      {currentCard && (isEvaluating || evaluations[currentCard.id]) && (
                        <div className="mb-4 p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-card animate-in fade-in duration-200">
                          {isEvaluating ? (
                            <div className="flex items-center gap-3.5 py-2">
                              <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 border border-brand-200 flex items-center justify-center shrink-0 shadow-xs">
                                <Sparkles className="w-5 h-5 animate-spin text-brand-600" />
                              </div>
                              <div>
                                <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                                  <span>Comparing Your Answer with AI Model Answer...</span>
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 font-extrabold uppercase">
                                    AI Matching
                                  </span>
                                </h4>
                                <p className="text-xs text-slate-500 mt-0.5">
                                  Analyzing semantic coverage, key technical terms, and calculating match percentage.
                                </p>
                              </div>
                            </div>
                          ) : evaluations[currentCard.id] && (
                            <div className="space-y-3.5">

                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                                <div className="flex items-center gap-3.5">
                                  <div
                                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-base shrink-0 shadow-sm border ${
                                      evaluations[currentCard.id].score >= 80
                                        ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                                        : evaluations[currentCard.id].score >= 50
                                        ? 'bg-amber-50 border-amber-300 text-amber-700'
                                        : 'bg-rose-50 border-rose-300 text-rose-700'
                                    }`}
                                  >
                                    {evaluations[currentCard.id].score}%
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <h4 className="text-sm font-bold text-slate-900">
                                        AI Answer Match: {evaluations[currentCard.id].score}%
                                      </h4>
                                      <span
                                        className={`text-[10px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-full border ${
                                          evaluations[currentCard.id].score >= 80
                                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                            : evaluations[currentCard.id].score >= 50
                                            ? 'bg-amber-100 text-amber-800 border-amber-200'
                                            : 'bg-rose-100 text-rose-800 border-rose-200'
                                        }`}
                                      >
                                        {evaluations[currentCard.id].score >= 80
                                          ? 'Strong Match'
                                          : evaluations[currentCard.id].score >= 50
                                          ? 'Moderate Match'
                                          : 'Needs Review'}
                                      </span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                      {evaluations[currentCard.id].score >= 80
                                        ? 'Strong technical answer! You covered the core principles and expected criteria.'
                                        : evaluations[currentCard.id].score >= 50
                                        ? 'Good foundation. You hit several key points but missed some technical depth.'
                                        : 'Several key points were missed. Review the model answer and retry for deeper mastery.'}
                                    </p>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={handleEvaluateAnswer}
                                  disabled={isEvaluating}
                                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer self-start sm:self-auto shrink-0"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                  <span>Re-Check %</span>
                                </button>
                              </div>


                              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden border border-slate-200/60">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    evaluations[currentCard.id].score >= 80
                                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                                      : evaluations[currentCard.id].score >= 50
                                      ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                                      : 'bg-gradient-to-r from-rose-500 to-red-500'
                                  }`}
                                  style={{ width: `${Math.max(6, evaluations[currentCard.id].score)}%` }}
                                />
                              </div>


                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                                {evaluations[currentCard.id].strengths.length > 0 && (
                                  <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
                                    <span className="font-bold text-emerald-900 flex items-center gap-1.5 mb-1.5">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                      <span>What You Covered Well:</span>
                                    </span>
                                    <ul className="space-y-1 text-emerald-800 leading-relaxed">
                                      {evaluations[currentCard.id].strengths.map((s, idx) => (
                                        <li key={idx} className="flex items-start gap-1.5">
                                          <span className="text-emerald-500 font-bold">•</span>
                                          <span>{s}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {evaluations[currentCard.id].gaps.length > 0 && (
                                  <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80">
                                    <span className="font-bold text-amber-900 flex items-center gap-1.5 mb-1.5">
                                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                      <span>Key Points Missed:</span>
                                    </span>
                                    <ul className="space-y-1 text-amber-800 leading-relaxed">
                                      {evaluations[currentCard.id].gaps.map((g, idx) => (
                                        <li key={idx} className="flex items-start gap-1.5">
                                          <span className="text-amber-500 font-bold">•</span>
                                          <span>{g}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>


                              {evaluations[currentCard.id].feedback && (
                                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                                  <strong className="text-slate-900">💡 Coaching Tip: </strong>
                                  {evaluations[currentCard.id].feedback}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}


                      {currentDraft.trim() ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                            <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
                              <div className="flex items-center gap-1.5">
                                <PenLine className="w-3.5 h-3.5 text-slate-500" />
                                <span>Your Answer</span>
                              </div>
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-teal-600 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
                                <Check className="w-3 h-3" />
                                <span>Saved</span>
                              </span>
                            </div>
                            <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                              {currentDraft}
                            </p>
                          </div>
                          <div className="p-3.5 rounded-xl bg-brand-50/40 border border-brand-200/60">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-brand-700 mb-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" />
                              <span>Model Answer & Key Points</span>
                            </div>
                            {renderAnswerContent(currentCard?.back || '')}
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 rounded-xl bg-brand-50/40 border border-brand-200/60 mb-3">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-brand-700 mb-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" />
                            <span>Model Answer & Key Points</span>
                          </div>
                          {renderAnswerContent(currentCard?.back || '')}
                        </div>
                      )}


                      <div className="text-center">
                        <button
                          onClick={() => setIsFlipped(false)}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Re-check question</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>


              {isFlipped && (
                <div className="mt-4 animate-in fade-in duration-200">
                  {currentCard && evaluations[currentCard.id] ? (
                    <div className="mb-2 text-center">
                      <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-200 inline-flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-brand-600" />
                        <span>
                          AI Recommended Rating:{' '}
                          <strong>
                            {evaluations[currentCard.id].score >= 80
                              ? 'Mastered (3)'
                              : evaluations[currentCard.id].score >= 50
                              ? 'Hesitant (2)'
                              : 'Needs Review (1)'}
                          </strong>
                        </span>
                      </span>
                    </div>
                  ) : (
                    <p className="text-center text-xs font-semibold text-slate-500 mb-2.5">
                      How confident did you feel? (Press 1, 2, or 3)
                    </p>
                  )}

                  <div className="grid grid-cols-3 gap-2.5">
                    <button
                      onClick={() => handleRate('low', currentDraft)}
                      className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer shadow-xs group ${
                        currentCard && evaluations[currentCard.id]?.score < 50
                          ? 'border-rose-400 bg-rose-100/90 text-rose-900 ring-2 ring-rose-400/40 shadow-sm'
                          : 'border-rose-200 bg-rose-50/80 hover:bg-rose-100 text-rose-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span className="text-xs font-bold text-left">Needs Review</span>
                      </div>
                      <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-white text-rose-700 border border-rose-200 font-mono text-[10px]">
                        1
                      </kbd>
                    </button>

                    <button
                      onClick={() => handleRate('medium', currentDraft)}
                      className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer shadow-xs group ${
                        currentCard && evaluations[currentCard.id] && evaluations[currentCard.id].score >= 50 && evaluations[currentCard.id].score < 80
                          ? 'border-amber-400 bg-amber-100/90 text-amber-900 ring-2 ring-amber-400/40 shadow-sm'
                          : 'border-amber-200 bg-amber-50/80 hover:bg-amber-100 text-amber-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span className="text-xs font-bold text-left">Hesitant</span>
                      </div>
                      <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-white text-amber-700 border border-amber-200 font-mono text-[10px]">
                        2
                      </kbd>
                    </button>

                    <button
                      onClick={() => handleRate('high', currentDraft)}
                      className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer shadow-xs group ${
                        currentCard && evaluations[currentCard.id] && evaluations[currentCard.id].score >= 80
                          ? 'border-teal-400 bg-teal-100/90 text-teal-900 ring-2 ring-teal-400/40 shadow-sm'
                          : 'border-teal-200 bg-teal-50/80 hover:bg-teal-100 text-teal-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-teal-600 shrink-0" />
                        <span className="text-xs font-bold text-left">Mastered</span>
                      </div>
                      <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-white text-teal-700 border border-teal-200 font-mono text-[10px]">
                        3
                      </kbd>
                    </button>
                  </div>
                </div>
              )}


              <div className="mt-6 flex items-center justify-between pt-3 border-t border-slate-200">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
                  onClick={() => {
                    if (currentIndex > 0) {
                      setCurrentIndex(currentIndex - 1);
                      setIsFlipped(false);
                    }
                  }}
                  disabled={currentIndex === 0}
                >
                  Previous
                </Button>

                <span className="text-xs font-mono font-bold text-slate-600 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200">
                  {currentIndex + 1} / {cards.length}
                </span>

                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  onClick={() => {
                    if (currentIndex < cards.length - 1) {
                      setCurrentIndex(currentIndex + 1);
                      setIsFlipped(false);
                    }
                  }}
                  disabled={currentIndex === cards.length - 1}
                >
                  Next
                </Button>
              </div>
            </>
          )}
        </div>
      )}




      {viewMode === 'deck' && (
        <div className="space-y-4 animate-in fade-in duration-200">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white rounded-xl border border-slate-200 shadow-xs">

            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setStatusFilter('all')}
                className={`h-7 px-2.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-slate-900 text-white font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All ({cards.length})
              </button>

              <button
                onClick={() => setStatusFilter('low')}
                className={`h-7 px-2.5 text-xs font-semibold rounded-lg transition-all cursor-pointer border ${
                  statusFilter === 'low'
                    ? 'bg-rose-600 text-white border-rose-600 font-bold'
                    : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                }`}
              >
                Needs Review ({lowCount})
              </button>

              <button
                onClick={() => setStatusFilter('medium')}
                className={`h-7 px-2.5 text-xs font-semibold rounded-lg transition-all cursor-pointer border ${
                  statusFilter === 'medium'
                    ? 'bg-amber-600 text-white border-amber-600 font-bold'
                    : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                }`}
              >
                Hesitant ({medCount})
              </button>

              <button
                onClick={() => setStatusFilter('high')}
                className={`h-7 px-2.5 text-xs font-semibold rounded-lg transition-all cursor-pointer border ${
                  statusFilter === 'high'
                    ? 'bg-teal-600 text-white border-teal-600 font-bold'
                    : 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100'
                }`}
              >
                Mastered ({highCount})
              </button>

              {unreviewedCount > 0 && (
                <button
                  onClick={() => setStatusFilter('unreviewed')}
                  className={`h-7 px-2.5 text-xs font-semibold rounded-lg transition-all cursor-pointer border ${
                    statusFilter === 'unreviewed'
                      ? 'bg-slate-700 text-white border-slate-700 font-bold'
                      : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  Unreviewed ({unreviewedCount})
                </button>
              )}
            </div>


            <div className="relative w-full sm:w-64 shrink-0">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search flashcards..."
                className="w-full h-8 pl-8 pr-3 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-slate-800 placeholder:text-slate-400 transition-all outline-none"
              />
            </div>
          </div>


          {filteredDeckCards.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
              <p className="text-xs text-slate-500">No flashcards match the selected filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredDeckCards.map((card) => {
                const cardIndex = cards.findIndex((c) => c.id === card.id);
                const statusBadge =
                  card.confidence === 'high' ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                      Mastered
                    </span>
                  ) : card.confidence === 'medium' ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      Hesitant
                    </span>
                  ) : card.confidence === 'low' ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                      Needs Review
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                      Unreviewed
                    </span>
                  );

                return (
                  <div
                    key={card.id}
                    className="p-4 rounded-xl bg-white border border-slate-200 hover:border-brand-300 shadow-xs hover:shadow-card transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-slate-100">
                        <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {card.id.toUpperCase()}
                        </span>
                        <div className="flex items-center gap-2">
                          {statusBadge}
                          <button
                            onClick={() => handleDeleteCard(card.id)}
                            title="Delete card"
                            className="text-slate-400 hover:text-rose-600 p-1 rounded-md hover:bg-rose-50 transition-colors cursor-pointer opacity-70 group-hover:opacity-100"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>


                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug mb-2">
                        {cleanText(card.front)}
                      </h4>


                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-600 line-clamp-3 leading-relaxed">
                        {cleanText(card.back)}
                      </div>
                    </div>


                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">
                        {card.userAnswer ? 'Draft answer recorded' : 'No draft answer'}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="xs"
                        leftIcon={<Play className="w-3 h-3" />}
                        onClick={() => {
                          jumpToCard(cardIndex);
                          setViewMode('player');
                        }}
                      >
                        Practice This Card
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}





      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative bg-white rounded-3xl border border-slate-200/90 max-w-lg w-full p-6 sm:p-7 shadow-2xl shadow-brand-900/10 overflow-hidden transform transition-all">

            <div className="absolute -top-20 -right-20 w-44 h-44 bg-gradient-to-br from-brand-400/20 to-brand-600/5 rounded-full blur-2xl pointer-events-none" />


            <div className="relative flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-md shadow-brand-500/25 flex items-center justify-center shrink-0">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">Add Custom Flashcard</h3>
                  <p className="text-xs text-slate-500">Create an active recall concept check for this role</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-all flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewCard} className="relative space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-800">
                    Question / Front Prompt:
                  </label>
                  <span className="text-[10px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-100">
                    Front Side
                  </span>
                </div>
                <textarea
                  value={newFront}
                  onChange={(e) => setNewFront(e.target.value)}
                  placeholder="e.g. How does React reconcile virtual DOM changes efficiently?"
                  rows={2}
                  required
                  className="w-full p-3.5 text-xs sm:text-sm rounded-2xl border border-slate-200 bg-slate-50/60 focus:bg-white text-slate-900 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all placeholder:text-slate-400 leading-relaxed font-sans"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-800">
                    Model Answer / Back Key Points:
                  </label>
                  <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
                    Back Side
                  </span>
                </div>
                <textarea
                  value={newBack}
                  onChange={(e) => setNewBack(e.target.value)}
                  placeholder="e.g. React uses a heuristic O(n) diffing algorithm comparing element types and unique keys..."
                  rows={4}
                  required
                  className="w-full p-3.5 text-xs sm:text-sm rounded-2xl border border-slate-200 bg-slate-50/60 focus:bg-white text-slate-900 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all placeholder:text-slate-400 leading-relaxed font-sans"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-slate-100">
                <span className="text-[11px] text-slate-400 font-medium order-2 sm:order-1">
                  {!newFront.trim() || !newBack.trim()
                    ? 'Both front question and model answer are required.'
                    : 'Ready to add to your practice deck.'}
                </span>

                <div className="flex items-center justify-end gap-3 order-1 sm:order-2 shrink-0">
                  <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    onClick={() => {
                      setShowAddModal(false);
                      setNewFront('');
                      setNewBack('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    disabled={isSubmitting || !newFront.trim() || !newBack.trim()}
                    isLoading={isSubmitting}
                    leftIcon={<Plus className="w-4 h-4" />}
                  >
                    Add Flashcard
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
