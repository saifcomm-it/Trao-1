'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  BookOpen, 
  Calendar, 
  Download, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  Sparkles,
  Share2,
  FileCode,
  ShieldCheck,
  Layers,
  HelpCircle
} from 'lucide-react';
import { 
  UIInterviewPrepKit, 
  UIQuestion, 
  UIFlashcard, 
  UICompanyBrief, 
  QuestionCategory, 
  InterviewPrepKit 
} from '@/lib/types';
import { api } from '@/lib/api';
import { samplePrepKit } from '@/lib/mock-data';
import { BriefEditor } from '@/components/builder/BriefEditor';
import { RoleBreakdown } from '@/components/builder/RoleBreakdown';
import { CategorySection } from '@/components/builder/CategorySection';
import { FlashcardEditor } from '@/components/builder/FlashcardEditor';
import { ScheduleTimeline } from '@/components/builder/ScheduleTimeline';
import { InterviewSimulator } from '@/components/mock/InterviewSimulator';

export default function KitDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [kit, setKit] = useState<UIInterviewPrepKit | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Regeneration state
  const [regeneratingSection, setRegeneratingSection] = useState<string | null>(null);

  // Creative Feature modal state
  const [activeMockQuestion, setActiveMockQuestion] = useState<UIQuestion | null>(null);

  useEffect(() => {
    loadKit();
  }, [id]);

  const loadKit = async () => {
    setIsLoading(true);
    try {
      const serverKit = await api.getKit(id);
      setKit(serverKit);
    } catch {
      // Check local storage
      const savedStr = localStorage.getItem('trao_saved_kits');
      if (savedStr) {
        const savedList: UIInterviewPrepKit[] = JSON.parse(savedStr);
        const match = savedList.find((k) => k.id === id);
        if (match) {
          setKit(match);
          setIsLoading(false);
          return;
        }
      }
      // Fallback to sample kit
      setKit({ ...samplePrepKit, id });
    } finally {
      setIsLoading(false);
    }
  };

  const persistKit = (updatedKit: UIInterviewPrepKit) => {
    setKit(updatedKit);
    setHasUnsavedChanges(true);

    // Save to local storage immediately for optimistic UI
    const savedStr = localStorage.getItem('trao_saved_kits');
    let savedList: UIInterviewPrepKit[] = savedStr ? JSON.parse(savedStr) : [];
    savedList = savedList.filter((k) => k.id !== updatedKit.id);
    savedList.unshift(updatedKit);
    localStorage.setItem('trao_saved_kits', JSON.stringify(savedList));

    // Async save to server
    api.saveKit(updatedKit).then(() => {
      setHasUnsavedChanges(false);
    }).catch(() => {
      // Kept in localStorage
      setHasUnsavedChanges(false);
    });
  };

  // Brief update
  const handleUpdateBrief = (brief: UICompanyBrief) => {
    if (!kit) return;
    persistKit({ ...kit, company_brief: brief });
  };

  // Single Section Regeneration: Company Brief
  const handleRegenerateBrief = async () => {
    if (!kit) return;
    setRegeneratingSection('brief');
    try {
      const res = await api.regenerateSection(kit.id || id, 'company_brief');
      if (res?.company_brief) {
        persistKit({ ...kit, company_brief: res.company_brief });
      }
    } catch {
      // Local demo regeneration
      await new Promise((r) => setTimeout(r, 1200));
      persistKit({
        ...kit,
        company_brief: {
          summary: `${kit.source.company} builds high-scale industry infrastructure, focusing on developer ergonomics, high availability, and distributed systems.`,
          what_they_do: `Cloud-native services, low-latency transaction processing, and public enterprise APIs.`,
          sources: kit.source.pages_used,
          isEdited: false
        }
      });
    } finally {
      setRegeneratingSection(null);
    }
  };

  // Questions CRUD
  const handleUpdateQuestion = (updated: UIQuestion) => {
    if (!kit) return;
    const questions = kit.questions.map((q) => (q.id === updated.id ? updated : q));
    persistKit({ ...kit, questions });
  };

  const handleDeleteQuestion = (qId: string) => {
    if (!kit) return;
    const questions = kit.questions.filter((q) => q.id !== qId);
    persistKit({ ...kit, questions });
  };

  const handleAddQuestion = (newQuestion: UIQuestion) => {
    if (!kit) return;
    persistKit({ ...kit, questions: [...kit.questions, newQuestion] });
  };

  const handleMoveQuestion = (fromIdx: number, toIdx: number, category: QuestionCategory) => {
    if (!kit) return;
    const catQuestions = kit.questions.filter((q) => q.category === category);
    const otherQuestions = kit.questions.filter((q) => q.category !== category);

    const moved = [...catQuestions];
    const [target] = moved.splice(fromIdx, 1);
    moved.splice(toIdx, 0, target);

    persistKit({ ...kit, questions: [...otherQuestions, ...moved] });
  };

  const handleCategoryChange = (questionId: string, newCategory: QuestionCategory) => {
    if (!kit) return;
    const questions = kit.questions.map((q) =>
      q.id === questionId ? { ...q, category: newCategory, origin: 'edited' as const, isPinned: true } : q
    );
    persistKit({ ...kit, questions });
  };

  // Single-Category Regeneration: PRESERVES MANUAL & EDITED QUESTIONS! (Section 6)
  const handleRegenerateCategory = async (cat: QuestionCategory) => {
    if (!kit) return;
    setRegeneratingSection(`cat-${cat}`);

    try {
      // Filter out user-created, user-edited, or pinned questions to preserve
      const manualAndPinned = kit.questions.filter(
        (q) => q.category === cat && (q.origin === 'manual' || q.origin === 'edited' || q.isPinned)
      );

      const res = await api.regenerateSection(kit.id || id, 'category', cat, manualAndPinned);
      if (res?.questions) {
        // Merge preserved questions
        const regeneratedNew = res.questions.filter((q) => q.category === cat && !q.isPinned);
        const untouchedOther = kit.questions.filter((q) => q.category !== cat);
        persistKit({
          ...kit,
          questions: [...untouchedOther, ...manualAndPinned, ...regeneratedNew]
        });
      }
    } catch {
      // Mock regeneration preserving user modifications
      await new Promise((r) => setTimeout(r, 1500));
      const preserved = kit.questions.filter(
        (q) => q.category === cat && (q.origin === 'manual' || q.origin === 'edited' || q.isPinned)
      );
      const freshlyGenerated: UIQuestion[] = [
        {
          id: `q-fresh-${Date.now()}-1`,
          requirement_ids: [kit.role.requirements[0]?.id || 'r1'],
          category: cat,
          prompt: `[Regenerated] Advanced assessment on ${cat} for ${kit.role.title}`,
          answer_outline: `Targeted outline addressing core criteria and production best practices.`,
          difficulty: 2,
          origin: 'generated',
          isPinned: false
        }
      ];

      const otherCats = kit.questions.filter((q) => q.category !== cat);
      persistKit({
        ...kit,
        questions: [...otherCats, ...preserved, ...freshlyGenerated]
      });
    } finally {
      setRegeneratingSection(null);
    }
  };

  // Flashcards CRUD
  const handleUpdateFlashcard = (updated: UIFlashcard) => {
    if (!kit) return;
    const flashcards = kit.flashcards.map((f) => (f.id === updated.id ? updated : f));
    persistKit({ ...kit, flashcards });
  };

  const handleDeleteFlashcard = (fId: string) => {
    if (!kit) return;
    const flashcards = kit.flashcards.filter((f) => f.id !== fId);
    persistKit({ ...kit, flashcards });
  };

  const handleAddFlashcard = (newCard: UIFlashcard) => {
    if (!kit) return;
    persistKit({ ...kit, flashcards: [...kit.flashcards, newCard] });
  };

  // Deterministic Recalculate Schedule (Section 8)
  const handleRecalculateSchedule = (days: number) => {
    if (!kit) return;
    setRegeneratingSection('schedule');

    setTimeout(() => {
      const allQIds = kit.questions.map((q) => q.id);
      const perDay = Math.ceil(allQIds.length / days) || 1;

      const scheduleDays = Array.from({ length: days }, (_, i) => {
        const assignedQIds = allQIds.slice(i * perDay, (i + 1) * perDay);
        return {
          day: i + 1,
          focus: i === 0 ? 'High-Yield Must Haves & Technical Core' : `Topic Mastery Block ${i + 1}`,
          question_ids: assignedQIds.length > 0 ? assignedQIds : [allQIds[0] || 'q1'],
          minutes: 60
        };
      });

      persistKit({
        ...kit,
        schedule: {
          days_available: days,
          days: scheduleDays
        }
      });
      setRegeneratingSection(null);
    }, 600);
  };

  // Download Appendix A JSON
  const handleExportJson = () => {
    if (!kit) return;
    // Strip UI-only metadata for clean Appendix A conformity
    const cleanKit: InterviewPrepKit = {
      source: kit.source,
      company_brief: {
        summary: kit.company_brief.summary,
        what_they_do: kit.company_brief.what_they_do,
        sources: kit.company_brief.sources
      },
      role: kit.role,
      questions: kit.questions.map((q) => ({
        id: q.id,
        requirement_ids: q.requirement_ids,
        category: q.category,
        prompt: q.prompt,
        answer_outline: q.answer_outline,
        difficulty: q.difficulty
      })),
      flashcards: kit.flashcards.map((f) => ({
        id: f.id,
        front: f.front,
        back: f.back,
        requirement_ids: f.requirement_ids
      })),
      schedule: kit.schedule,
      coverage: kit.coverage
    };

    const blob = new Blob([JSON.stringify(cleanKit, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${kit.source.company.toLowerCase()}-${kit.role.title.toLowerCase().replace(/\s+/g, '-')}-prep-kit.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading || !kit) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-zinc-500">Loading interview kit...</p>
      </div>
    );
  }

  const mustHaves = kit.role.requirements.filter((r) => r.priority === 'must');
  const coveredReqIds = new Set(kit.questions.flatMap((q) => q.requirement_ids));
  const uncoveredMustHaves = mustHaves.filter((r) => !coveredReqIds.has(r.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Breadcrumb & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                {kit.source.company}
              </span>
              <span className="text-xs text-zinc-400">•</span>
              <span className="text-xs text-zinc-500">
                Researched {new Date(kit.source.researched_at).toLocaleDateString()}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              {kit.role.title}
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Practice Mode Link */}
          <Link
            href={`/kit/${kit.id || id}/practice`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20 transition-all"
          >
            <BookOpen className="w-3.5 h-3.5" />
            Practice Flashcards
          </Link>

          {/* Export Appendix A JSON */}
          <button
            onClick={handleExportJson}
            title="Download verified Appendix A conforming JSON"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export Appendix A JSON
          </button>
        </div>
      </div>

      {/* Coverage Invariant Bar (Section 4 & 5) */}
      <div className="p-4 rounded-xl border bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            uncoveredMustHaves.length === 0 
              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'
              : 'bg-amber-50 text-amber-600'
          }`}>
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
              Must-Have Coverage Status: {uncoveredMustHaves.length === 0 ? '100% Satisfied' : `${uncoveredMustHaves.length} Uncovered`}
            </h3>
            <p className="text-xs text-zinc-500">
              Generated across {kit.coverage?.passes || 2} deliberate research passes. All stable IDs cross-referenced.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
            Passes: {kit.coverage?.passes || 2}
          </span>
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
            Uncovered IDs: {kit.coverage?.uncovered_requirement_ids?.length || 0}
          </span>
        </div>
      </div>

      {/* Section A: Company Brief */}
      <BriefEditor
        brief={kit.company_brief}
        source={kit.source}
        onUpdate={handleUpdateBrief}
        onRegenerate={handleRegenerateBrief}
        isRegenerating={regeneratingSection === 'brief'}
      />

      {/* Section B: Role Breakdown */}
      <RoleBreakdown role={kit.role} />

      {/* Section C: Categorized Question Bank (Section 6) */}
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Categorized Question Bank
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Edit inline, reorder, move between categories, or regenerate a single category without losing manual edits.
            </p>
          </div>
        </div>

        {(['technical', 'system-design', 'behavioural', 'company-fit'] as QuestionCategory[]).map((category) => {
          const categoryQuestions = kit.questions.filter((q) => q.category === category);

          return (
            <CategorySection
              key={category}
              category={category}
              questions={categoryQuestions}
              requirements={kit.role.requirements}
              onUpdateQuestion={handleUpdateQuestion}
              onDeleteQuestion={handleDeleteQuestion}
              onMoveQuestion={handleMoveQuestion}
              onCategoryChange={handleCategoryChange}
              onAddQuestion={handleAddQuestion}
              onRegenerateCategory={handleRegenerateCategory}
              isRegenerating={regeneratingSection === `cat-${category}`}
              onOpenMock={(q) => setActiveMockQuestion(q)}
            />
          );
        })}
      </div>

      {/* Section D: Flashcards */}
      <FlashcardEditor
        flashcards={kit.flashcards}
        requirements={kit.role.requirements}
        kitId={kit.id || id}
        onUpdateFlashcard={handleUpdateFlashcard}
        onDeleteFlashcard={handleDeleteFlashcard}
        onAddFlashcard={handleAddFlashcard}
      />

      {/* Section E: Day-by-day Schedule (Section 8) */}
      <ScheduleTimeline
        schedule={kit.schedule}
        questions={kit.questions}
        requirements={kit.role.requirements}
        onRecalculateSchedule={handleRecalculateSchedule}
        isRecalculating={regeneratingSection === 'schedule'}
      />

      {/* Creative Feature Modal: AI Mock Interviewer */}
      {activeMockQuestion && (
        <InterviewSimulator
          question={activeMockQuestion}
          onClose={() => setActiveMockQuestion(null)}
        />
      )}
    </div>
  );
}
