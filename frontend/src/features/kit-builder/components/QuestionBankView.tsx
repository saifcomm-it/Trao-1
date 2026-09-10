'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Building2,
  Calendar,
  MapPin,
  CheckCircle2,
  Plus,
  Calendar as CalendarIcon,
  BookOpen,
  ArrowRight,
  HelpCircle
} from 'lucide-react';
import { QuestionCategory } from '@/lib/types';
import { cleanText, cleanRoleTitle } from '@/lib/utils';
import { useKitBuilder } from '../hooks/useKitBuilder';
import { CategorySection } from './CategorySection';
import { InterviewSimulator } from './InterviewSimulator';
import { KitBuilderSkeleton } from '@/components/skeletons/KitBuilderSkeleton';
import { DataNotFoundState } from '@/components/DataNotFoundState';
import { Badge, Button, Dropdown } from '@/shared/components';

interface IQuestionBankViewProps {
  kitId: string;
}

const CATEGORY_OPTIONS: { key: QuestionCategory; label: string }[] = [
  { key: 'technical', label: 'Technical Deep-Dives' },
  { key: 'system-design', label: 'System Design & Scalability' },
  { key: 'behavioural', label: 'Behavioural & Leadership' },
  { key: 'company-fit', label: 'Company Fit & Culture' },
];

export function QuestionBankView({ kitId }: IQuestionBankViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<QuestionCategory>('technical');
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);

  const {
    kit,
    isLoading,
    error,
    regeneratingSection,
    activeMockQuestion,
    setActiveMockQuestion,
    handleUpdateQuestion,
    handleDeleteQuestion,
    handleAddQuestion,
    handleMoveQuestion,
    handleCategoryChange,
    handleRegenerateCategory,
  } = useKitBuilder(kitId);

  if (isLoading) {
    return <KitBuilderSkeleton />;
  }

  if (error || !kit) {
    return (
      <div className="py-10 sm:py-16">
        <DataNotFoundState
          title="Kit Not Found"
          description={error || 'This interview preparation kit does not exist in your database or was recently deleted.'}
          primaryAction={{
            label: 'Return to Dashboard',
            href: '/dashboard'
          }}
          secondaryAction={{
            label: 'Create New Kit',
            href: '/new'
          }}
        />
      </div>
    );
  }

  const dropdownCategoryOptions = CATEGORY_OPTIONS.map((opt) => {
    const count = (kit.questions || []).filter((q) => q.category === opt.key).length;
    return {
      value: opt.key,
      label: `${opt.label} (${count})`,
    };
  });

  const categoryQuestions = (kit.questions || []).filter((q) => q.category === selectedCategory);

  return (
    <div className="space-y-6 sm:space-y-8 py-2">

      <div className="flex items-center justify-between gap-4 pb-1">
        <Link
          href={`/kit/${kit.id || kitId}`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-brand-600 transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Kit Builder</span>
        </Link>
      </div>


      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <Badge tone="brand" icon={<Building2 className="w-3 h-3" />}>
                {cleanText(kit.source?.company, 'Company')}
              </Badge>
              {kit.source?.location && kit.source.location !== 'Not Specified' && kit.source.location !== 'Remote / Unspecified' && (
                <Badge tone="neutral" icon={<MapPin className="w-3 h-3 text-slate-400" />}>
                  {cleanText(kit.source.location)}
                </Badge>
              )}
              <Badge tone="neutral" icon={<Calendar className="w-3 h-3 text-slate-400" />}>
                Researched {new Date(kit.source?.researched_at || Date.now()).toLocaleDateString()}
              </Badge>
              <Badge tone="success" icon={<CheckCircle2 className="w-3 h-3" />}>
                Verified Kit
              </Badge>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 break-words">
              {cleanRoleTitle(kit.role?.title, 'Job Title')} Question Bank
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Curated questions mapped to role requirements across technical, system architecture, leadership, and culture dimensions.
            </p>
          </div>
        </div>
      </div>


      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
          <div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
              Categorized Question Bank
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Edit inline, reorder, and customize questions without losing manual edits.
            </p>
          </div>


          <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
            <div className="w-64">
              <Dropdown
                options={dropdownCategoryOptions}
                value={selectedCategory}
                onChange={(val) => setSelectedCategory(val as QuestionCategory)}
                size="sm"
              />
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAddingQuestion(true)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Add Question
            </Button>
          </div>
        </div>


        <CategorySection
          key={selectedCategory}
          category={selectedCategory}
          questions={categoryQuestions}
          requirements={kit.role?.requirements || []}
          kitId={kit.id || kitId}
          roleTitle={kit.role?.title}
          company={kit.source?.company}
          onUpdateQuestion={handleUpdateQuestion}
          onDeleteQuestion={handleDeleteQuestion}
          onMoveQuestion={handleMoveQuestion}
          onCategoryChange={(qId, newCat) => {
            handleCategoryChange(qId, newCat);
            setSelectedCategory(newCat);
          }}
          onAddQuestion={handleAddQuestion}
          onRegenerateCategory={handleRegenerateCategory}
          isRegenerating={regeneratingSection === `cat-${selectedCategory}`}
          onOpenMock={(q) => setActiveMockQuestion(q)}
          isAddingExternal={isAddingQuestion}
          onCloseAddExternal={() => setIsAddingQuestion(false)}
        />
      </div>


      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <Link
          href={`/kit/${kit.id || kitId}/schedule`}
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-amber-300 shadow-card hover:shadow-pop transition-all group flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                {kit.schedule?.days_available || kit.schedule?.days?.length || 5}-Day Preparation Schedule
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                View day-by-day roadmap and progressive questions
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
        </Link>

        <Link
          href={`/kit/${kit.id || kitId}/practice`}
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 shadow-card hover:shadow-pop transition-all group flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                Practice Mode ({kit.flashcards?.length || 0} Cards)
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Interactive active recall player with self-scoring
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
        </Link>
      </div>


      {activeMockQuestion && (
        <InterviewSimulator
          question={activeMockQuestion}
          onClose={() => setActiveMockQuestion(null)}
        />
      )}
    </div>
  );
}
