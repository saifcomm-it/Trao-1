'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Sparkles } from 'lucide-react';
import { UIInterviewPrepKit, UIFlashcard } from '@/lib/types';
import { api } from '@/lib/api';
import { samplePrepKit } from '@/lib/mock-data';
import { FlashcardDeck } from '@/components/practice/FlashcardDeck';

export default function PracticePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [kit, setKit] = useState<UIInterviewPrepKit | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadKit();
  }, [id]);

  const loadKit = async () => {
    setIsLoading(true);
    try {
      const serverKit = await api.getKit(id);
      setKit(serverKit);
    } catch {
      const savedStr = localStorage.getItem('trao_saved_kits');
      if (savedStr) {
        const list: UIInterviewPrepKit[] = JSON.parse(savedStr);
        const match = list.find((k) => k.id === id);
        if (match) {
          setKit(match);
          setIsLoading(false);
          return;
        }
      }
      setKit({ ...samplePrepKit, id });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProgress = (updatedCards: UIFlashcard[]) => {
    if (!kit) return;
    const updatedKit: UIInterviewPrepKit = {
      ...kit,
      flashcards: updatedCards
    };
    setKit(updatedKit);

    // Save to local storage
    const savedStr = localStorage.getItem('trao_saved_kits');
    let list: UIInterviewPrepKit[] = savedStr ? JSON.parse(savedStr) : [];
    list = list.filter((k) => k.id !== kit.id);
    list.unshift(updatedKit);
    localStorage.setItem('trao_saved_kits', JSON.stringify(list));

    api.saveKit(updatedKit).catch(() => {});
  };

  if (isLoading || !kit) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-zinc-500">Loading practice deck...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-6 mb-8 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <Link
            href={`/kit/${kit.id || id}`}
            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              {kit.source.company} • Practice Mode
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              {kit.role.title} Flashcards
            </h1>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-500 bg-zinc-100 dark:bg-zinc-800/60 px-3 py-1.5 rounded-lg">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>Hotkeys: Space (Flip), 1/2/3 (Confidence)</span>
        </div>
      </div>

      {/* Flashcard Player */}
      <FlashcardDeck
        kitId={kit.id || id}
        initialCards={kit.flashcards}
        onSaveProgress={handleSaveProgress}
      />
    </div>
  );
}
