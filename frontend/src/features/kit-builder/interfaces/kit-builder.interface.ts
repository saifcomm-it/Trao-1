import {
  UIInterviewPrepKit,
  UIQuestion,
  UIFlashcard,
  UICompanyBrief,
  KitRole,
  KitSource,
  KitSchedule,
  KitRequirement,
  QuestionCategory
} from '@/lib/types';

export interface IKitBuilderProps {
  kitId: string;
}

export interface IBriefEditorProps {
  brief: UICompanyBrief;
  source: KitSource;
  onUpdate: (updatedBrief: UICompanyBrief) => void;
  onRegenerate: () => Promise<void>;
  isRegenerating?: boolean;
}

export interface IRoleBreakdownProps {
  role: KitRole;
}

export interface IQuestionCardProps {
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

export interface ICategorySectionProps {
  category: QuestionCategory;
  questions: UIQuestion[];
  requirements: KitRequirement[];
  onUpdateQuestion: (updated: UIQuestion) => void;
  onDeleteQuestion: (id: string) => void;
  onMoveQuestion: (fromIndex: number, toIndex: number, category: QuestionCategory) => void;
  onCategoryChange: (questionId: string, newCategory: QuestionCategory) => void;
  onAddQuestion: (newQuestion: UIQuestion) => void;
  onRegenerateCategory: (category: QuestionCategory) => Promise<void>;
  isRegenerating?: boolean;
  onOpenMock?: (question: UIQuestion) => void;
  kitId?: string;
  roleTitle?: string;
  company?: string;
  isAddingExternal?: boolean;
  onCloseAddExternal?: () => void;
}

export interface IFlashcardEditorProps {
  flashcards: UIFlashcard[];
  requirements: KitRequirement[];
  kitId?: string;
  onUpdateFlashcard: (updated: UIFlashcard) => void;
  onDeleteFlashcard: (id: string) => void;
  onAddFlashcard: (newCard: UIFlashcard) => void;
}

export interface IScheduleTimelineProps {
  schedule: KitSchedule;
  questions: UIQuestion[];
  requirements: KitRequirement[];
  kitId?: string;
  onRecalculateSchedule?: (days: number) => void;
  isRecalculating?: boolean;
}

export interface IInterviewSimulatorProps {
  question: UIQuestion;
  onClose: () => void;
}
