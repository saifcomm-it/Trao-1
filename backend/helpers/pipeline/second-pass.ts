import { KitRequirement, KitQuestion, KitCoverage } from '../../models/types';
import { checkCoverage } from './coverage-checker';
import { llm } from './llm-client';
import { formatSeniorityGuidance, sanitizePromptToTwoLines } from './generate-questions';

export interface SecondPassResult {
  questions: KitQuestion[];
  coverage: KitCoverage;
}

export async function executeCoverageLoop(
  requirements: KitRequirement[],
  initialQuestions: KitQuestion[],
  companyName: string,
  roleTitle: string,
  maxPasses: number = 2,
  seniority?: string
): Promise<SecondPassResult> {
  let questions = [...initialQuestions];
  let passes = 1;
  const effectiveSeniority = seniority || 'Junior';
  const seniorityGuidance = formatSeniorityGuidance(effectiveSeniority);

  let coverage = checkCoverage(requirements, questions);


  while (!coverage.isMustHaveCovered && passes < maxPasses + 1) {
    passes++;
    console.log(`[CoverageLoop] Pass ${passes}: Found ${coverage.uncoveredMustHaves.length} uncovered must-haves (${coverage.uncoveredMustHaves.map((r) => r.id).join(', ')}). Generating missing questions...`);

    const missingReqs = coverage.uncoveredMustHaves;
    const nextQId = questions.length + 1;

    const systemPrompt = `You are a Technical Interview Gap Resolver.
Your job is to generate questions specifically targeting uncovered MUST-HAVE job requirements.

CRITICAL RULES:
1. MAXIMUM TWO LINES (STRICT): Every question "prompt" MUST be AT MOST TWO LINES (1 to 2 sentences, 15 to 30 words maximum). NEVER write long scenario paragraphs or backstories.
2. CALIBRATE TO SENIORITY:
${seniorityGuidance}
3. Every question MUST target at least one requirement from the provided missing list.
4. Output concise prompt, difficulty (1, 2, or 3 calibrated to ${effectiveSeniority}), and 5-sentence model answer outline.
5. Classify category appropriately:
   - "technical" for coding, frameworks, algorithms
   - "system-design" for architecture, scalability
   - "behavioural" for leadership, teamwork
   - "company-fit" for mission, values

Output ONLY a valid JSON array:
[
  {
    "id": "q...",
    "requirement_ids": ["r..."],
    "category": "technical"|"system-design"|"behavioural"|"company-fit",
    "prompt": string,
    "answer_outline": string,
    "difficulty": 1|2|3
  }
]`;

    const userPrompt = `Role: ${roleTitle} at ${companyName}

Uncovered Requirements to Target:
${missingReqs.map((r) => `[${r.id}] (${r.kind}): ${r.text}`).join('\n')}`;

    try {
      const generated = await llm.completeJson<KitQuestion[]>(userPrompt, {
        systemPrompt,
        temperature: 0.2
      });

      if (Array.isArray(generated) && generated.length > 0) {
        let idCounter = nextQId;
        const formatted = generated
          .filter((q) => q && q.prompt && q.answer_outline)
          .map((q) => ({
            ...q,
            id: `q${idCounter++}`,
            prompt: sanitizePromptToTwoLines(q.prompt),
            difficulty: [1, 2, 3].includes(q.difficulty) ? (q.difficulty as 1 | 2 | 3) : 2,
            requirement_ids: Array.isArray(q.requirement_ids) && q.requirement_ids.length > 0
              ? q.requirement_ids.filter((id) => requirements.some((r) => r.id === id))
              : [missingReqs[0]?.id || 'r1']
          }));
        questions.push(...formatted);
      }
    } catch (err) {
      console.warn('[CoverageLoop] Batch gap generation notice, attempting per-requirement dynamic AI generation:', err);
      // Dynamic single-requirement AI generation (no hardcoded templates)
      let idCounter = nextQId;
      for (const r of missingReqs) {
        const cat = r.kind === 'behavioural' ? 'behavioural' : r.kind === 'domain' ? 'company-fit' : 'technical';
        try {
          const single = await llm.completeJson<{
            prompt: string;
            answer_outline: string;
            difficulty: number;
          }>(
            `Generate a concise interview question for role "${roleTitle}" (${effectiveSeniority}) at "${companyName}".
Must-Have Requirement: [${r.id}] ${r.text}
Category: ${cat}
CONSTRAINT: Maximum two lines (1-2 sentences, max 30 words).

Respond ONLY with valid JSON:
{
  "prompt": string,
  "answer_outline": string,
  "difficulty": 2|3
}`,
            {
              systemPrompt: `You are a Technical Interviewer resolving interview coverage gaps for a ${effectiveSeniority} candidate with concise (max 2 line) questions.`,
              temperature: 0.2
            }
          );
          if (single && single.prompt && single.answer_outline) {
            questions.push({
              id: `q${idCounter++}`,
              requirement_ids: [r.id],
              category: cat,
              prompt: sanitizePromptToTwoLines(single.prompt),
              answer_outline: single.answer_outline,
              difficulty: [1, 2, 3].includes(single.difficulty) ? (single.difficulty as 1 | 2 | 3) : 2
            });
          }
        } catch (innerErr) {
          console.warn(`[CoverageLoop] Dynamic AI generation failed for missing requirement ${r.id}:`, innerErr);
        }
      }
    }

    // Re-run deterministic coverage check
    coverage = checkCoverage(requirements, questions);
  }

  return {
    questions,
    coverage: {
      uncovered_requirement_ids: coverage.uncoveredRequirementIds,
      passes
    }
  };
}
