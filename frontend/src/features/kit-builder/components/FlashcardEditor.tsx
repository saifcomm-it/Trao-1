'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Layers, Plus, Trash2, Edit2, X, ArrowRight } from 'lucide-react';
import { UIFlashcard } from '@/lib/types';
import { IFlashcardEditorProps } from '../interfaces/kit-builder.interface';
import { formatRequirementId } from '@/lib/utils';
import { Button } from '@/shared/components';

export function FlashcardEditor({
  flashcards,
  requirements,
  kitId,
  onUpdateFlashcard,
  onDeleteFlashcard,
  onAddFlashcard
}: IFlashcardEditorProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFront, setEditFront] = useState('');
  const [editBack, setEditBack] = useState('');

  const [isAdding, setIsAdding] = useState(false);
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [selectedReqId, setSelectedReqId] = useState<string>(requirements[0]?.id || 'r1');

  const startEdit = (card: UIFlashcard) => {
    setEditingId(card.id);
    setEditFront(card.front);
    setEditBack(card.back);
  };

  const saveEdit = (card: UIFlashcard) => {
    onUpdateFlashcard({
      ...card,
      front: editFront,
      back: editBack,
      origin: card.origin === 'manual' ? 'manual' : 'edited',
      isPinned: true
    });
    setEditingId(null);
  };

  const handleAddCard = () => {
    if (!newFront.trim() || !newBack.trim()) return;

    const newCard: UIFlashcard = {
      id: `f-custom-${Date.now()}`,
      front: newFront.trim(),
      back: newBack.trim(),
      requirement_ids: [selectedReqId],
      origin: 'manual',
      isPinned: true,
      confidence: 'unreviewed'
    };

    onAddFlashcard(newCard);
    setIsAdding(false);
    setNewFront('');
    setNewBack('');
  };

  return (
    <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-card hover:shadow-pop transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 border border-brand-200 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Flashcard Deck
              </h2>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {flashcards.length} cards
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              High-yield concept checks mapped to core job requirements
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {kitId && (
            <Link
              href={`/kit/${kitId}/practice`}
              className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-semibold rounded-lg text-white bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 shadow-xs transition-all cursor-pointer"
            >
              <span>Enter Practice Mode</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}

          <Button
            size="sm"
            variant="secondary"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsAdding(true)}
          >
            Add Flashcard
          </Button>
        </div>
      </div>

      {isAdding && (
        <div className="mt-4 p-4 rounded-xl border border-brand-200 bg-slate-50/70 shadow-card">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <h4 className="text-xs font-semibold text-slate-900">
              Create New Flashcard
            </h4>
            <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Front (Concept / Question)
              </label>
              <textarea
                value={newFront}
                onChange={(e) => setNewFront(e.target.value)}
                rows={2}
                placeholder="e.g. What is PACELC theorem?"
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Back (Concise Answer)
              </label>
              <textarea
                value={newBack}
                onChange={(e) => setNewBack(e.target.value)}
                rows={2}
                placeholder="Key technical explanation..."
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-500 font-medium">Maps to:</label>
              <select
                value={selectedReqId}
                onChange={(e) => setSelectedReqId(e.target.value)}
                className="text-xs bg-white border border-slate-300 rounded py-1 px-2 text-slate-800 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none"
              >
                {requirements.map((r) => (
                  <option key={r.id} value={r.id}>
                    [{r.id}] {r.text.substring(0, 40)}...
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <Button
                size="xs"
                variant="ghost"
                onClick={() => setIsAdding(false)}
              >
                Cancel
              </Button>
              <Button
                size="xs"
                variant="primary"
                onClick={handleAddCard}
              >
                Save Flashcard
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {flashcards.map((card) => {
          const isEdit = editingId === card.id;

          return (
            <div
              key={card.id}
              className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 shadow-card hover:shadow-pop transition-all flex flex-col justify-between"
            >
              {isEdit ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Front
                    </label>
                    <textarea
                      value={editFront}
                      onChange={(e) => setEditFront(e.target.value)}
                      rows={2}
                      className="w-full text-sm p-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Back
                    </label>
                    <textarea
                      value={editBack}
                      onChange={(e) => setEditBack(e.target.value)}
                      rows={2}
                      className="w-full text-sm p-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="xs"
                      variant="primary"
                      onClick={() => saveEdit(card)}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 leading-snug">
                        {card.front}
                      </h4>
                      <p className="mt-2.5 text-sm text-slate-800 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-xs">
                        {card.back}
                      </p>
                    </div>
                  </div>

                  {card.confidence && card.confidence !== 'unreviewed' && (
                    <div className="mt-3.5 pt-2.5 border-t border-slate-200 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Practice status:</span>
                      <span
                        className={`font-bold text-xs uppercase tracking-wider px-3 py-1 rounded-full ${
                          card.confidence === 'high'
                            ? 'bg-teal-50 text-teal-800 ring-1 ring-inset ring-teal-300'
                            : card.confidence === 'medium'
                            ? 'bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-300'
                            : 'bg-rose-50 text-rose-800 ring-1 ring-inset ring-rose-300'
                        }`}
                      >
                        {card.confidence === 'high'
                          ? 'Mastered'
                          : card.confidence === 'medium'
                          ? 'Hesitant'
                          : 'Needs Review'}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
