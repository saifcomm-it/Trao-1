import { KitFlashcard, KitRequirement, KitRole } from '../../models/types';
import { llm } from './llm-client';

export async function generateFlashcards(
  role: KitRole,
  companyName: string
): Promise<KitFlashcard[]> {
  const requirements = role?.requirements || [];
  const mustHaves = requirements.filter((r) => r.priority === 'must');
  const targetReqs = mustHaves.length > 0 ? mustHaves : requirements;

  const systemPrompt = `You are an expert Technical Interview Coach creating high-yield active recall flashcards.
Generate 4-8 concise flashcards targeting key technical and behavioural concepts in the requirements.

RULES:
1. "id": "f1", "f2", "f3", etc.
2. "front": direct question, concept test, or trade-off dilemma.
3. "back": crisp, high-signal answer (2-3 sentences max).
4. "requirement_ids": array of requirement IDs it covers (must be chosen from the provided requirement IDs).

Output ONLY valid JSON array:
[
  {
    "id": "f1",
    "front": string,
    "back": string,
    "requirement_ids": ["r1"]
  }
]`;

  const userPrompt = `Role: ${role.title} at ${companyName}
Requirements:
${targetReqs.map((r) => `[${r.id}] ${r.text}`).join('\n')}`;

  try {
    const flashcards = await llm.completeJson<KitFlashcard[]>(userPrompt, {
      systemPrompt,
      temperature: 0.3
    });

    if (Array.isArray(flashcards) && flashcards.length > 0) {
      const valid = flashcards
        .filter((f) => f && f.front && f.back)
        .map((f, i) => ({
          id: `f${i + 1}`,
          front: f.front.trim(),
          back: f.back.trim(),
          requirement_ids: Array.isArray(f.requirement_ids) && f.requirement_ids.length > 0
            ? f.requirement_ids.filter((id) => requirements.some((r) => r.id === id))
            : [targetReqs[0]?.id || 'r1']
        }));
      if (valid.length > 0) return valid;
    }
  } catch (err: any) {
    console.warn('[generateFlashcards] Batch generation notice:', err?.message || err);
  }

  // Dynamic AI per-requirement generation (no hardcoded templates)
  const dynamicCards: KitFlashcard[] = [];
  for (const req of targetReqs.slice(0, 6)) {
    try {
      const card = await llm.completeJson<{ front: string; back: string }>(
        `Generate a high-signal active-recall flashcard for role "${role.title}" at "${companyName}".
Target Requirement: [${req.id}] ${req.text}

Respond ONLY with valid JSON:
{
  "front": string (concise concept, trade-off question, or debugging scenario),
  "back": string (crisp, high-signal technical explanation, 2-3 sentences)
}`,
        {
          systemPrompt: 'You are an expert technical interviewer creating active recall flashcards.',
          temperature: 0.3
        }
      );
      if (card && card.front && card.back) {
        dynamicCards.push({
          id: `f${dynamicCards.length + 1}`,
          front: card.front.trim(),
          back: card.back.trim(),
          requirement_ids: [req.id]
        });
      }
    } catch (innerErr) {
      console.warn(`[generateFlashcards] Dynamic generation failed for requirement ${req.id}:`, innerErr);
    }
  }

  if (dynamicCards.length > 0) {
    return dynamicCards;
  }

  throw new Error('Failed to dynamically generate flashcards via AI.');
}
