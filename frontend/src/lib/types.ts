export type RequirementKind = 'technical' | 'behavioural' | 'domain';
export type RequirementPriority = 'must' | 'nice';

export interface KitRequirement {
  id: string;
  text: string;
  kind: RequirementKind;
  priority: RequirementPriority;
}

export interface KitSource {
  company: string;
  company_url: string;
  role: string;
  location: string;
  jd_chars: number;
  researched_at: string;
  pages_used: string[];
}

export interface CompanyBrief {
  summary: string;
  what_they_do: string;
  sources: string[];
}

export interface KitRole {
  title: string;
  seniority: string;
  responsibilities: string[];
  requirements: KitRequirement[];
}

export type QuestionCategory = 'technical' | 'behavioural' | 'system-design' | 'company-fit';

export interface KitQuestion {
  id: string;
  requirement_ids: string[];
  category: QuestionCategory;
  prompt: string;
  answer_outline: string;
  difficulty: 1 | 2 | 3;
}

export interface KitFlashcard {
  id: string;
  front: string;
  back: string;
  requirement_ids: string[];
  userAnswer?: string;
}

export interface ScheduleDay {
  day: number;
  focus: string;
  question_ids: string[];
  minutes: number;
}

export interface KitSchedule {
  days_available: number;
  days: ScheduleDay[];
}

export interface KitCoverage {
  uncovered_requirement_ids: string[];
  passes: number;
}


export interface InterviewPrepKit {
  id?: string;
  _id?: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
  source: KitSource;
  company_brief: CompanyBrief;
  role: KitRole;
  questions: KitQuestion[];
  flashcards: KitFlashcard[];
  schedule: KitSchedule;
  coverage: KitCoverage;
}


export type ItemOrigin = 'generated' | 'edited' | 'manual';

export interface UIQuestion extends KitQuestion {
  origin?: ItemOrigin;
  isPinned?: boolean;
}

export interface UIFlashcard extends KitFlashcard {
  origin?: ItemOrigin;
  isPinned?: boolean;
  confidence?: 'unreviewed' | 'low' | 'medium' | 'high';
  lastPracticedAt?: string;
  userAnswer?: string;
}

export interface UICompanyBrief extends CompanyBrief {
  isEdited?: boolean;
}

export interface UIInterviewPrepKit extends InterviewPrepKit {
  questions: UIQuestion[];
  flashcards: UIFlashcard[];
  company_brief: UICompanyBrief;
}


export interface BatchCaseInput {
  id: string;
  jd: string;
  company_url: string;
  days: number;
}

export interface BatchCaseResult {
  id: string;
  status: 'ok' | 'failed';
  kit: InterviewPrepKit | null;
  error: {
    code: string;
    message: string;
  } | null;
}

export interface BatchEvaluationOutput {
  version: '1.0';
  generated_at: string;
  kits: BatchCaseResult[];
}


export type GenerationPhase =
  | 'idle'
  | 'fetching_company'
  | 'crawling_hiring_pages'
  | 'searching_discussions'
  | 'extracting_requirements'
  | 'generating_questions_pass_1'
  | 'checking_coverage'
  | 'closing_gaps_pass_2'
  | 'building_schedule'
  | 'complete'
  | 'failed';

export interface GenerationProgress {
  phase: GenerationPhase;
  step: number;
  totalSteps: number;
  message: string;
  warnings?: string[];
}
