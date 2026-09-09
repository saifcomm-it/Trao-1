/**
 * Data contracts matching Appendix A (Kit Structure) and Appendix B (Batch Specification)
 * from the Trao Engineering Assessment.
 */

export type RequirementKind = 'technical' | 'behavioural' | 'domain';
export type RequirementPriority = 'must' | 'nice';

export interface KitRequirement {
  id: string; // e.g. "r1"
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
  researched_at: string; // ISO 8601 timestamp
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
  id: string; // e.g. "q1"
  requirement_ids: string[];
  category: QuestionCategory;
  prompt: string;
  answer_outline: string;
  difficulty: 1 | 2 | 3;
}

export interface KitFlashcard {
  id: string; // e.g. "f1"
  front: string;
  back: string;
  requirement_ids: string[];
}

export interface ScheduleDay {
  day: number;
  focus: string;
  question_ids: string[];
  minutes: number; // integer minutes
}

export interface KitSchedule {
  days_available: number;
  days: ScheduleDay[];
}

export interface KitCoverage {
  uncovered_requirement_ids: string[];
  passes: number;
}

/**
 * Strict Appendix A Interview Prep Kit Schema
 */
export interface InterviewPrepKit {
  id?: string;
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

/**
 * Builder UI State Layer:
 * To solve the "hardest state problem" (Section 6), each question, flashcard, and brief
 * carries metadata to track whether it's generated, manually added, or edited by the user,
 * plus a pin flag. When a category is regenerated, all user-modified or pinned items survive.
 */
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
}

export interface UICompanyBrief extends CompanyBrief {
  isEdited?: boolean;
}

export interface UIInterviewPrepKit extends InterviewPrepKit {
  questions: UIQuestion[];
  flashcards: UIFlashcard[];
  company_brief: UICompanyBrief;
}

/**
 * Batch case definitions (Appendix B)
 */
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

/**
 * Generation step tracking for real-time progress (Section 12)
 */
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
