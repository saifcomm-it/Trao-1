'use client';

import React, { useState } from 'react';
import { Layers, Plus, Trash2, Edit2, Check, X, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { UIFlashcard, KitRequirement } from '@/lib/types';

interface FlashcardEditorProps {
  flashcards: UIFlashcard[];
  requirements: KitRequirement[];
  kitId?: string;
  onUpdateFlashcard: (updated: UIFlashcard) => void;
  onDeleteFlashcard: (id: string) => void;
  onAddFlashcard: (newCard: UIFlashcard) => void;
}

export function FlashcardEditor({
  flashcards,
  requirements,
  kitId,
  onUpdateFlashcard,
  onDeleteFlashcard,
  onAddFlashcard
}: FlashcardEditorProps) {
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
    <section className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                Flashcard Deck
              </h2>
              <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                {flashcards.length} cards
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              High-yield concept checks mapped to core job requirements
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {kitId && (
            <Link
              href={`/kit/${kitId}/practice`}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors"
            >
              Enter Practice Mode
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}

          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Flashcard
          </button>
        </div>
      </div>

      {/* Add Flashcard Inline */}
      {isAdding && (
        <div className="mt-4 p-4 rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/20 dark:bg-indigo-950/10">
          <div className="flex items-center justify-between pb-2 border-b border-indigo-100 dark:border-indigo-900/50">
            <h4 className="text-xs font-semibold text-indigo-900 dark:text-indigo-300">
              Create New Flashcard
            </h4>
            <button onClick={() => setIsAdding(false)} className="text-zinc-400 hover:text-zinc-600">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Front (Concept / Question)
              </label>
              <textarea
                value={newFront}
                onChange={(e) => setNewFront(e.target.value)}
                rows={2}
                placeholder="e.g. What is PACELC theorem?"
                className="w-full text-xs p-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Back (Concise Answer)
              </label>
              <textarea
                value={newBack}
                onChange={(e) => setNewBack(e.target.value)}
                rows={2}
                placeholder="Key technical explanation..."
                className="w-full text-xs p-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="text-xs text-zinc-500 font-medium">Maps to:</label>
              <select
                value={selectedReqId}
                onChange={(e) => setSelectedReqId(e.target.value)}
                className="text-xs bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded py-1 px-2"
              >
                {requirements.map((r) => (
                  <option key={r.id} value={r.id}>
                    [{r.id}] {r.text.substring(0, 40)}...
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setIsAdding(false)}
                className="text-xs px-2.5 py-1 text-zinc-500 hover:text-zinc-800"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCard}
                className="text-xs px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-medium shadow-sm"
              >
                Save Flashcard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Flashcards Grid */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        {flashcards.map((card) => {
          const isEdit = editingId === card.id;

          return (
            <div
              key={card.id}
              className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-all flex flex-col justify-between"
            >
              {isEdit ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase">
                      Front
                    </label>
                    <textarea
                      value={editFront}
                      onChange={(e) => setEditFront(e.target.value)}
                      rows={2}
                      className="w-full text-xs p-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase">
                      Back
                    </label>
                    <textarea
                      value={editBack}
                      onChange={(e) => setEditBack(e.target.value)}
                      rows={2}
                      className="w-full text-xs p-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-xs px-2 py-1 text-zinc-500"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => saveEdit(card)}
                      className="text-xs px-2.5 py-1 bg-indigo-600 text-white rounded"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800/80">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold">
                          {card.id}
                        </span>
                        {card.requirement_ids.map((r) => (
                          <span
                            key={r}
                            className="text-[10px] font-mono px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                          >
                            covers:{r}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => startEdit(card)}
                          className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                          title="Edit card"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => onDeleteFlashcard(card.id)}
                          className="p-1 text-zinc-400 hover:text-red-600"
                          title="Delete card"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-2.5">
                      <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">
                        {card.front}
                      </h4>
                      <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed bg-white dark:bg-zinc-800/60 p-2.5 rounded-lg border border-zinc-100 dark:border-zinc-800">
                        {card.back}
                      </p>
                    </div>
                  </div>

                  {card.confidence && card.confidence !== 'unreviewed' && (
                    <div className="mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between text-[11px]">
                      <span className="text-zinc-400">Practice status:</span>
                      <span
                        className={`font-medium px-2 py-0.5 rounded-full ${
                          card.confidence === 'high'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : card.confidence === 'medium'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
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
