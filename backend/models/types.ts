import { z } from 'zod';

export const RequirementKindSchema = z.enum(['technical', 'behavioural', 'domain']);
export type RequirementKind = z.infer<typeof RequirementKindSchema>;

export const RequirementPrioritySchema = z.enum(['must', 'nice']);
export type RequirementPriority = z.infer<typeof RequirementPrioritySchema>;

export const KitRequirementSchema = z.object({
  id: z.string(),
  text: z.string(),
  kind: RequirementKindSchema,
  priority: RequirementPrioritySchema
});
export type KitRequirement = z.infer<typeof KitRequirementSchema>;

export const KitSourceSchema = z.object({
  company: z.string(),
  company_url: z.string(),
  role: z.string(),
  location: z.string(),
  jd_chars: z.number().int(),
  researched_at: z.string(),
  pages_used: z.array(z.string())
});
export type KitSource = z.infer<typeof KitSourceSchema>;

export const CompanyBriefSchema = z.object({
  summary: z.string(),
  what_they_do: z.string(),
  sources: z.array(z.string())
});
export type CompanyBrief = z.infer<typeof CompanyBriefSchema>;

export const KitRoleSchema = z.object({
  title: z.string(),
  seniority: z.string(),
  responsibilities: z.array(z.string()),
  requirements: z.array(KitRequirementSchema)
});
export type KitRole = z.infer<typeof KitRoleSchema>;

export const QuestionCategorySchema = z.enum(['technical', 'behavioural', 'system-design', 'company-fit']);
export type QuestionCategory = z.infer<typeof QuestionCategorySchema>;

export const KitQuestionSchema = z.object({
  id: z.string(),
  requirement_ids: z.array(z.string()),
  category: QuestionCategorySchema,
  prompt: z.string(),
  answer_outline: z.string(),
  difficulty: z.union([z.literal(1), z.literal(2), z.literal(3)])
});
export type KitQuestion = z.infer<typeof KitQuestionSchema>;

export const KitFlashcardSchema = z.object({
  id: z.string(),
  front: z.string(),
  back: z.string(),
  requirement_ids: z.array(z.string()),
  confidence: z.enum(['unreviewed', 'low', 'medium', 'high']).optional(),
  origin: z.enum(['generated', 'edited', 'manual']).optional(),
  isPinned: z.boolean().optional(),
  userAnswer: z.string().optional(),
  lastPracticedAt: z.string().optional()
});
export type KitFlashcard = z.infer<typeof KitFlashcardSchema>;

export const ScheduleDaySchema = z.object({
  day: z.number().int().positive(),
  focus: z.string(),
  question_ids: z.array(z.string()),
  minutes: z.number().int().positive()
});
export type ScheduleDay = z.infer<typeof ScheduleDaySchema>;

export const KitScheduleSchema = z.object({
  days_available: z.number().int().positive(),
  days: z.array(ScheduleDaySchema)
});
export type KitSchedule = z.infer<typeof KitScheduleSchema>;

export const KitCoverageSchema = z.object({
  uncovered_requirement_ids: z.array(z.string()),
  passes: z.number().int().nonnegative()
});
export type KitCoverage = z.infer<typeof KitCoverageSchema>;


export const InterviewPrepKitSchema = z.object({
  source: KitSourceSchema,
  company_brief: CompanyBriefSchema,
  role: KitRoleSchema,
  questions: z.array(KitQuestionSchema),
  flashcards: z.array(KitFlashcardSchema),
  schedule: KitScheduleSchema,
  coverage: KitCoverageSchema
}).superRefine((data, ctx) => {
  const questionIdSet = new Set(data.questions.map((q) => q.id));
  for (const day of data.schedule.days) {
    for (const qId of day.question_ids) {
      if (!questionIdSet.has(qId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Schedule day ${day.day} references unknown question id "${qId}"`,
          path: ['schedule', 'days', day.day - 1, 'question_ids']
        });
      }
    }
  }

  // Integrity check: Every requirement_id referenced in questions must exist in role.requirements
  const reqIdSet = new Set(data.role.requirements.map((r) => r.id));
  for (const q of data.questions) {
    for (const rId of q.requirement_ids) {
      if (!reqIdSet.has(rId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Question "${q.id}" references unknown requirement id "${rId}"`,
          path: ['questions']
        });
      }
    }
  }
});
export type InterviewPrepKit = z.infer<typeof InterviewPrepKitSchema>;

/**
 * Batch case definitions (Appendix B)
 */
export const BatchCaseInputSchema = z.object({
  id: z.string(),
  jd: z.string(),
  company_url: z.string(),
  days: z.number().int().positive(),
  user_seniority: z.string().optional()
});
export type BatchCaseInput = z.infer<typeof BatchCaseInputSchema>;

export const BatchCaseResultSchema = z.object({
  id: z.string(),
  status: z.enum(['ok', 'failed']),
  kit: InterviewPrepKitSchema.nullable(),
  error: z.object({
    code: z.string(),
    message: z.string()
  }).nullable()
});
export type BatchCaseResult = z.infer<typeof BatchCaseResultSchema>;

export const BatchEvaluationOutputSchema = z.object({
  version: z.literal('1.0'),
  generated_at: z.string(),
  kits: z.array(BatchCaseResultSchema)
});
export type BatchEvaluationOutput = z.infer<typeof BatchEvaluationOutputSchema>;
