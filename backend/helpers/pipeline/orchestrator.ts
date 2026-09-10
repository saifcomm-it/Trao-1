import {
  InterviewPrepKit,
  InterviewPrepKitSchema,
  BatchCaseInput,
  KitSource
} from '../../models/types';
import { researchCompany } from '../crawler/researcher';
import { extractRequirements, sanitizeRoleText } from './extract-requirements';
import { generateCompanyBrief } from './generate-brief';
import { generateCategorizedQuestions } from './generate-questions';
import { executeCoverageLoop } from './second-pass';
import { generateFlashcards } from './generate-flashcards';
import { allocateSchedule } from './schedule-allocator';

export type ProgressCallback = (step: number, totalSteps: number, phase: string, message: string) => void;

export async function runPrepKitPipeline(
  input: BatchCaseInput,
  onProgress?: ProgressCallback
): Promise<InterviewPrepKit> {
  const totalSteps = 6;
  const notify = (step: number, phase: string, message: string) => {
    if (onProgress) onProgress(step, totalSteps, phase, message);
  };


  notify(1, 'fetching_company', `Crawling company domain: ${input.company_url}...`);
  const research = await researchCompany(input.company_url);

  // 2. Extract Requirements & Generate Company Brief concurrently
  notify(2, 'extracting_requirements', 'Parsing job description and extracting must vs nice requirements...');
  const [role, companyBrief] = await Promise.all([
    extractRequirements(input.jd, research.companyName),
    generateCompanyBrief(research)
  ]);
  notify(3, 'generating_brief', 'Synthesized company brief and engineering focus...');

  // 4. Pass 1: Categorized Question Generation (scaled dynamically to target schedule days)
  const targetSeniority = (input as any).user_seniority || role.seniority || 'Junior';
  notify(4, 'generating_questions_pass_1', `Pass 1: Generating targeted questions calibrated for ${targetSeniority}...`);
  const initialQuestions = await generateCategorizedQuestions(role, research, 1, input.days, targetSeniority);

  // 5. Pass 2: In-Code Deterministic Coverage Check & Gap Resolution Loop
  notify(5, 'closing_gaps_pass_2', 'Pass 2: Performing deterministic coverage check and resolving must-have gaps...');
  const coverageLoopResult = await executeCoverageLoop(
    role.requirements,
    initialQuestions,
    research.companyName,
    role.title,
    2, // max 2 passes
    targetSeniority
  );

  // 6. Flashcards & Deterministic Arithmetic Schedule
  notify(6, 'building_schedule', `Synthesizing active recall flashcards & allocating ${input.days}-day schedule...`);
  const flashcards = await generateFlashcards(role, research.companyName);
  const schedule = allocateSchedule(coverageLoopResult.questions, role.requirements, input.days);

  const cleanCompanyName = sanitizeRoleText(role.company || research.companyName, research.companyName || role.company || '');
  const cleanRoleTitle = sanitizeRoleText(role.title, role.title || '');
  const cleanLocation = sanitizeRoleText(role.location, role.location || '');

  const source: KitSource = {
    company: cleanCompanyName,
    company_url: research.companyUrl,
    role: cleanRoleTitle,
    location: cleanLocation,
    jd_chars: input.jd.length,
    researched_at: new Date().toISOString(),
    pages_used: research.pagesUsed
  };

  const rawKit: InterviewPrepKit = {
    source,
    company_brief: companyBrief,
    role,
    questions: coverageLoopResult.questions,
    flashcards,
    schedule,
    coverage: coverageLoopResult.coverage
  };

  // 7. Strict Zod Schema Validation (Section 5 & 13)
  const validatedKit = InterviewPrepKitSchema.parse(rawKit);

  return validatedKit;
}
