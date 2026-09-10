import { KitQuestion, KitRole, KitRequirement, QuestionCategory } from '../../models/types';
import { CompanyResearch } from '../crawler/researcher';
import { llm } from './llm-client';

export function formatSeniorityGuidance(seniority: string): string {
  const s = (seniority || '').toLowerCase();
  if (s.includes('junior') || s.includes('entry') || s.includes('0-2') || s.includes('intern')) {
    return `TARGET CANDIDATE LEVEL: JUNIOR / EARLY CAREER (0-2 years experience).
- Focus strictly on: Core language fundamentals, essential syntax, standard libraries, basic HTTP/REST principles, simple data structures, primary framework APIs, debugging common errors (e.g. NullReferenceException), and writing clean, maintainable code.
- DO NOT ask complex distributed systems, multi-region database sharding, microservice choreography, or staff/architect-level challenges.
- Difficulty Levels for Junior:
  * Level 1: Foundational syntax, basic OOP/data types, and fundamental framework concepts.
  * Level 2: Everyday practical tasks, creating REST endpoints, basic dependency injection, and simple database CRUD.
  * Level 3: Junior stretch topics like async/await basics, simple middleware understanding, or basic unit testing.`;
  }
  if (s.includes('mid') || s.includes('2-5')) {
    return `TARGET CANDIDATE LEVEL: MID-LEVEL (2-5 years experience).
- Focus on: Applied architecture, design patterns, database querying/indexing (EF Core/SQL), practical concurrency, clean API contracts, caching, integration testing, and error handling.
- Difficulty Levels:
  * Level 1: Solid everyday framework knowledge and design patterns.
  * Level 2: Practical database optimization, API resilience, and concurrency handling.
  * Level 3: System trade-offs, caching strategies, and refactoring legacy code.`;
  }
  if (s.includes('lead') || s.includes('staff') || s.includes('principal') || s.includes('architect')) {
    return `TARGET CANDIDATE LEVEL: LEAD / STAFF / PRINCIPAL (8+ years experience).
- Focus on: High-scale distributed architecture, event-driven topology, consensus, cross-service reliability, technical vision, and organizational engineering excellence.`;
  }
  return `TARGET CANDIDATE LEVEL: SENIOR (5+ years experience).
- Focus on: Deep framework internals, performance profiling, high-concurrency bottlenecks, distributed caching, resilience patterns, and architectural trade-offs.`;
}

export function sanitizePromptToTwoLines(prompt: string): string {
  if (!prompt) return '';
  let clean = prompt.trim();

  const sentences = clean.match(/[^.!?]+[.!?]+(\s|$)/g);
  if (sentences && sentences.length > 2) {
    clean = (sentences[0].trim() + ' ' + sentences[1].trim()).trim();
  }
  if (clean.length > 220) {
    const cut = clean.substring(0, 200);
    const lastPunct = Math.max(cut.lastIndexOf('?'), cut.lastIndexOf('.'));
    if (lastPunct > 50) {
      clean = cut.substring(0, lastPunct + 1).trim();
    }
  }
  return clean;
}

export async function generateCategorizedQuestions(
  role: KitRole,
  research: CompanyResearch,
  startQuestionIndex: number = 1,
  targetDays: number = 5,
  candidateSeniority?: string
): Promise<KitQuestion[]> {
  const allQuestions: KitQuestion[] = [];
  let currentIdIndex = startQuestionIndex;
  const effectiveSeniority = candidateSeniority || role.seniority || 'Junior';
  const seniorityGuidance = formatSeniorityGuidance(effectiveSeniority);

  const technicalReqs = role.requirements.filter((r) => r.kind === 'technical');
  const behaviouralReqs = role.requirements.filter((r) => r.kind === 'behavioural');
  const domainOrOtherReqs = role.requirements.filter((r) => r.kind === 'domain' || !r.kind);


  const totalQuestionsNeeded = Math.max(12, targetDays * 2);
  const techCount = Math.max(3, Math.ceil(totalQuestionsNeeded * 0.4));

  const designCount = Math.max(2, Math.ceil(totalQuestionsNeeded * 0.25));
  const behavCount = Math.max(2, Math.ceil(totalQuestionsNeeded * 0.2));
  const fitCount = Math.max(2, Math.ceil(totalQuestionsNeeded * 0.15));


  async function generateCategory(
    category: QuestionCategory,
    categoryRequirements: KitRequirement[],
    categoryInstructions: string,
    targetCount: number = 3
  ): Promise<KitQuestion[]> {
    if (categoryRequirements.length === 0) return [];

    const categoryQuestions: KitQuestion[] = [];
    const batchSize = 8;
    const numBatches = Math.ceil(targetCount / batchSize);

    for (let b = 1; b <= numBatches; b++) {
      const currentBatchCount = Math.min(batchSize, targetCount - (b - 1) * batchSize);

      const systemPrompt = `You are an elite Engineering Interviewer and Hiring Committee Lead.
Generate targeted, high-signal interview questions for the category "${category}".

CRITICAL FORMATTING & SENIORITY RULES:
1. MAXIMUM TWO LINES (STRICT): The "prompt" field MUST be AT MOST TWO LINES (strictly 1 to 2 concise sentences, 15 to 30 words maximum).
   NEVER write sprawling scenario paragraphs, backstories, or essays (e.g. NEVER begin with "Imagine we have a high-traffic endpoint... Upon investigation you find... Additionally when two users... Walk me through..."). State the interview question directly and crisply!
2. CALIBRATE TO SENIORITY:
${seniorityGuidance}
3. Generate exactly ${currentBatchCount} distinct questions for this category.
4. Every question MUST directly map to one or more requirement IDs provided in the list.
5. NEVER use formulaic phrasing like "In the context of [Role], describe your experience with [Requirement]".
6. Structure:
   - "id": string, e.g. "q${currentIdIndex}", "q${currentIdIndex + 1}"
   - "requirement_ids": array of requirement IDs it covers (e.g. ["r1"])
   - "category": "${category}"
   - "prompt": concise, direct interview question (MAXIMUM TWO LINES / 1-2 sentences).
   - "answer_outline": cohesive, 5-sentence technical model answer paragraph.
   - "difficulty": integer 1, 2, or 3 calibrated to ${effectiveSeniority}.
7. ${categoryInstructions}

Respond ONLY with valid JSON array of ${currentBatchCount} objects:
[
  {
    "id": "q1",
    "requirement_ids": ["r1"],
    "category": "${category}",
    "prompt": string,
    "answer_outline": string,
    "difficulty": 1|2|3
  }
]`;

      const interviewNotes = research.publicDiscussion ? `Hiring/Interview Notes: ${research.publicDiscussion}` : '';
      const userPrompt = `Target Role: ${role.title} (${effectiveSeniority})
Company: ${research.companyName}
${interviewNotes}

Requirements to assess:
${categoryRequirements.map((r) => `[${r.id}] (${r.priority.toUpperCase()}): ${r.text}`).join('\n')}

Generate ${currentBatchCount} distinct interview questions for category "${category}".
REMEMBER: The "prompt" field MUST be maximum 2 lines (1-2 sentences) and strictly calibrated for a ${effectiveSeniority} candidate.`;

      try {
        const questions = await llm.completeJson<KitQuestion[]>(userPrompt, {
          systemPrompt,
          temperature: 0.35,
          timeout: 60000
        });

        if (Array.isArray(questions) && questions.length > 0) {
          questions.forEach((q) => {
            categoryQuestions.push({
              ...q,
              id: `q${currentIdIndex++}`,
              category,
              prompt: sanitizePromptToTwoLines(q.prompt),
              difficulty: [1, 2, 3].includes(q.difficulty) ? (q.difficulty as 1 | 2 | 3) : 2,
              requirement_ids: Array.isArray(q.requirement_ids) && q.requirement_ids.length > 0
                ? q.requirement_ids.filter((id) => role.requirements.some((r) => r.id === id))
                : [categoryRequirements[0]?.id || 'r1']
            });
          });
        }
      } catch (err: any) {
        console.warn(`[generateQuestions] Batch ${b} generation notice for ${category}:`, err?.message || err);
      }
    }

    if (categoryQuestions.length > 0) {
      return categoryQuestions;
    }

    // Dynamic AI generation per requirement fallback (no hardcoded templates)
    const dynamicQuestions: KitQuestion[] = [];
    for (const req of categoryRequirements) {
      try {
        const singlePrompt = `Generate a concise interview question for role "${role.title}" (${effectiveSeniority}) at "${research.companyName}".
Category: ${category}
Requirement to assess: [${req.id}] (${req.priority}) ${req.text}
${categoryInstructions}
${seniorityGuidance}

CONSTRAINT: The "prompt" MUST be MAXIMUM TWO LINES (1-2 sentences, max 30 words).

Respond ONLY with valid JSON:
{
  "prompt": string,
  "answer_outline": string,
  "difficulty": 1|2|3
}`;
        const singleQ = await llm.completeJson<{
          prompt: string;
          answer_outline: string;
          difficulty: number;
        }>(singlePrompt, {
          systemPrompt: `You are a Technical Interviewer creating authentic, concise (max 2 lines) interview questions calibrated for a ${effectiveSeniority} engineer.`,
          temperature: 0.3,
          timeout: 60000
        });

        if (singleQ && singleQ.prompt && singleQ.answer_outline) {
          dynamicQuestions.push({
            id: `q${currentIdIndex++}`,
            requirement_ids: [req.id],
            category,
            prompt: sanitizePromptToTwoLines(singleQ.prompt),
            answer_outline: singleQ.answer_outline,
            difficulty: [1, 2, 3].includes(singleQ.difficulty) ? (singleQ.difficulty as 1 | 2 | 3) : (req.priority === 'must' ? 3 : 2)
          });
        }
      } catch (innerErr) {
        console.warn(`[generateQuestions] Dynamic generation failed for requirement ${req.id}:`, innerErr);
      }
    }

    if (dynamicQuestions.length > 0) {
      return dynamicQuestions;
    }

    throw new Error(`Failed to dynamically generate ${category} interview questions via AI.`);
  }

  // Call 1: Technical Questions
  const techQuestions = await generateCategory(
    'technical',
    technicalReqs.length > 0 ? technicalReqs : role.requirements.slice(0, 3),
    'Focus on language idioms, core framework internals, state management, asynchronous patterns, and debugging.',
    techCount
  );
  allQuestions.push(...techQuestions);

  // Call 2: System Design Questions
  const designReqs = technicalReqs.filter((r) => r.priority === 'must');
  const designTarget = designReqs.length > 0 ? designReqs : (technicalReqs.length > 0 ? technicalReqs.slice(0, 2) : role.requirements.slice(0, 2));
  if (designTarget.length > 0) {
    const designQuestions = await generateCategory(
      'system-design',
      designTarget.slice(0, 5),
      'Focus on component architecture, security/auth patterns, state flows, API contracts, caching, performance, and failure isolation.',
      designCount
    );
    allQuestions.push(...designQuestions);
  }

  // Call 3: Behavioural Questions
  const behavTarget = behaviouralReqs.length > 0 ? behaviouralReqs : role.requirements.slice(0, 2);
  if (behavTarget.length > 0) {
    const behavQuestions = await generateCategory(
      'behavioural',
      behavTarget,
      'Focus on technical conflict resolution, cross-functional collaboration, mentorship, code reviews, and ambiguous technical challenges using STAR.',
      behavCount
    );
    allQuestions.push(...behavQuestions);
  }

  // Call 4: Company Fit / Domain Questions
  const domainTarget = domainOrOtherReqs.length > 0 ? domainOrOtherReqs : role.requirements.slice(0, 2);
  if (domainTarget.length > 0) {
    const fitQuestions = await generateCategory(
      'company-fit',
      domainTarget,
      `Align questions with ${research.companyName}'s domain, enterprise scale, engineering values, and technical challenges.`,
      fitCount
    );
    allQuestions.push(...fitQuestions);
  }

  return allQuestions;
}
