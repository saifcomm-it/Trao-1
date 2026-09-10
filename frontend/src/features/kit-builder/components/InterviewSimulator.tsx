'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Send,
  CheckCircle,
  AlertTriangle,
  X,
  Award,
  History,
  Clock,
  AlertCircle
} from 'lucide-react';
import { KitBuilderService } from '../services/kit-builder.service';
import { IInterviewSimulatorProps } from '../interfaces/kit-builder.interface';
import { formatQuestionId } from '@/lib/utils';

interface EvaluationResult {
  score: number;
  strengths: string[];
  gaps: string[];
  feedback: string;
}

interface PreviousAttempt {
  _id: string;
  userAnswer: string;
  score: number;
  feedback: string;
  strengths: string[];
  gaps: string[];
  createdAt: string;
}

export function InterviewSimulator({ question, onClose }: IInterviewSimulatorProps) {
  const [userAnswer, setUserAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [error, setError] = useState<string | null>(null);


  const [previousAttempts, setPreviousAttempts] = useState<PreviousAttempt[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [showHistory, setShowHistory] = useState(false);


  useEffect(() => {
    async function loadHistory() {
      if (!question.id) return;
      setIsLoadingHistory(true);
      try {
        const history = await KitBuilderService.fetchMockHistory(question.id);
        setPreviousAttempts(history);
      } catch {
      } finally {
        setIsLoadingHistory(false);
      }
    }
    loadHistory();
  }, [question.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswer.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await KitBuilderService.evaluateMockAnswer({
        questionPrompt: question.prompt,
        answerOutline: question.answer_outline,
        userAnswer,
        questionId: question.id
      });
      setEvaluation(res);


      setPreviousAttempts((prev) => [
        {
          _id: `local-${Date.now()}`,
          userAnswer,
          score: res.score,
          feedback: res.feedback,
          strengths: res.strengths,
          gaps: res.gaps,
          createdAt: new Date().toISOString()
        },
        ...prev
      ]);
    } catch (err: any) {
      setError(
        err?.message || 'AI evaluation is temporarily unavailable. Please try again in a moment.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    setEvaluation(null);
    setUserAnswer('');
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl border border-slate-200 w-full max-w-2xl shadow-card overflow-hidden my-8">

        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-ivory-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 border border-brand-200 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Interactive Mock Interview Practice
              </h3>
              <p className="text-xs text-slate-500">
                AI evaluation benchmarked against expected answer outline
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {previousAttempts.length > 0 && (
              <button
                onClick={() => setShowHistory(!showHistory)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  showHistory
                    ? 'bg-brand-50 text-brand-700 border border-brand-200'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100 border border-transparent'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>{previousAttempts.length} Previous</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>


        {showHistory && previousAttempts.length > 0 && (
          <div className="border-b border-slate-200 bg-slate-50 p-4 max-h-60 overflow-y-auto">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Previous Attempts
            </h4>
            <div className="space-y-2">
              {previousAttempts.map((attempt) => (
                <div
                  key={attempt._id}
                  className="p-3 rounded-lg bg-white border border-slate-200 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-slate-700 truncate">
                      {attempt.userAnswer.slice(0, 120)}{attempt.userAnswer.length > 120 ? '...' : ''}
                    </p>
                    <span className="text-xs text-slate-400 mt-0.5 block">
                      {new Date(attempt.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <span className={`text-sm font-bold px-2.5 py-1 rounded-full shrink-0 ${
                    attempt.score >= 75
                      ? 'bg-teal-50 text-teal-700 ring-1 ring-inset ring-teal-200'
                      : attempt.score >= 50
                        ? 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200'
                        : 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200'
                  }`}>
                    {attempt.score}/100
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}


        <div className="p-6 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
              {formatQuestionId(question.id)}
            </span>
            <span className="text-xs font-medium px-2 py-0.5 rounded bg-brand-50 text-brand-600 border border-brand-200 capitalize">
              {question.category}
            </span>
            <span className="text-xs text-slate-500">Difficulty Level {question.difficulty}/3</span>
          </div>
          <h4 className="text-base font-semibold text-slate-900">
            {question.prompt}
          </h4>
        </div>

        {evaluation ? (
          <div className="p-6 space-y-5">
            <div className="flex items-center justify-between p-4 rounded-xl bg-brand-50 border border-brand-200">
              <div>
                <span className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                  Answer Score
                </span>
                <p className="text-3xl font-extrabold text-brand-600">
                  {evaluation.score}<span className="text-base font-normal text-slate-500">/100</span>
                </p>
              </div>
              <Award className="w-10 h-10 text-brand-600/30" />
            </div>

            <div>
              <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-teal-600" />
                Key Strengths
              </h5>
              <ul className="space-y-1">
                {evaluation.strengths.map((str, idx) => (
                  <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                    <span className="text-teal-600 font-bold">•</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                Opportunities & Gaps
              </h5>
              <ul className="space-y-1">
                {evaluation.gaps.map((gap, idx) => (
                  <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>{gap}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 text-xs text-slate-700 leading-relaxed border border-slate-200">
              <span className="font-semibold text-slate-900">Coach Feedback: </span>
              {evaluation.feedback}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={handleRetry}
                className="h-10 px-4 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl cursor-pointer"
              >
                Try Answering Again
              </button>
              <button
                onClick={onClose}
                className="h-10 px-5 text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 rounded-xl shadow-sm cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Your Answer (Simulate speaking or typing in an interview)
              </label>
              <textarea
                required
                rows={6}
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Walk through your thought process, architecture decisions, trade-offs, or STAR situation..."
                className="w-full text-sm p-3.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none shadow-xs leading-relaxed"
              />
              <span className="text-xs text-slate-500 mt-1.5 block">
                {userAnswer.trim().split(/\s+/).filter(Boolean).length} words
              </span>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-rose-800">Evaluation Failed</p>
                  <p className="text-xs text-rose-700 mt-0.5">{error}</p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={onClose}
                className="text-sm font-medium text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting || !userAnswer.trim()}
                className="inline-flex items-center gap-2 h-10 px-5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 disabled:opacity-50 shadow-sm hover:shadow transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Evaluating with AI...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit for AI Evaluation</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
