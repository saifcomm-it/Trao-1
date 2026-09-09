import { UIFlashcard } from './types';

/**
 * Spaced-Repetition / Confidence-Weighted Review Queue
 * Section 7 Requirement: "Order the next session by what they were least confident about"
 * 
 * Algorithm:
 * - Each card has a confidence score: 'low' (Needs Review), 'medium' (Hesitant), 'high' (Mastered), or 'unreviewed'.
 * - Priority weight:
 *   - 'low': 100 (highest urgency)
 *   - 'unreviewed': 75 (needs initial baseline)
 *   - 'medium': 50 (moderate urgency)
 *   - 'high': 10 (mastered, lowest urgency)
 * - Ties are broken by least recently practiced timestamp (LRU).
 */

export function sortFlashcardsForPractice(cards: UIFlashcard[]): UIFlashcard[] {
  const getWeight = (c: UIFlashcard): number => {
    switch (c.confidence) {
      case 'low':
        return 100;
      case 'unreviewed':
      case undefined:
        return 75;
      case 'medium':
        return 50;
      case 'high':
        return 10;
      default:
        return 50;
    }
  };

  return [...cards].sort((a, b) => {
    const weightDiff = getWeight(b) - getWeight(a);
    if (weightDiff !== 0) return weightDiff;

    // Secondary sort: timestamp (oldest practiced first)
    const timeA = a.lastPracticedAt ? new Date(a.lastPracticedAt).getTime() : 0;
    const timeB = b.lastPracticedAt ? new Date(b.lastPracticedAt).getTime() : 0;
    return timeA - timeB;
  });
}
