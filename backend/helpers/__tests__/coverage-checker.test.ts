import { checkCoverage } from '../pipeline/coverage-checker';
import { KitQuestion, KitRequirement } from '../../models/types';

describe('Coverage Checker (Deterministic In-Code Gap Detection)', () => {
  const requirements: KitRequirement[] = [
    { id: 'r1', text: 'Go programming', kind: 'technical', priority: 'must' },
    { id: 'r2', text: 'Distributed consensus (Raft)', kind: 'technical', priority: 'must' },
    { id: 'r3', text: 'Cross-functional leadership', kind: 'behavioural', priority: 'must' },
    { id: 'r4', text: 'Docker/Kubernetes', kind: 'technical', priority: 'nice' }
  ];

  test('reports 100% must-have coverage when all must-have IDs are referenced', () => {
    const questions: KitQuestion[] = [
      { id: 'q1', requirement_ids: ['r1'], category: 'technical', prompt: 'P1', answer_outline: 'A1', difficulty: 2 },
      { id: 'q2', requirement_ids: ['r2'], category: 'system-design', prompt: 'P2', answer_outline: 'A2', difficulty: 3 },
      { id: 'q3', requirement_ids: ['r3'], category: 'behavioural', prompt: 'P3', answer_outline: 'A3', difficulty: 2 }
    ];

    const result = checkCoverage(requirements, questions);
    expect(result.isMustHaveCovered).toBe(true);
    expect(result.uncoveredMustHaves.length).toBe(0);
    expect(result.coveredMustHavesCount).toBe(3);
  });

  test('accurately identifies gap when a must-have is uncovered', () => {
    const questions: KitQuestion[] = [
      { id: 'q1', requirement_ids: ['r1'], category: 'technical', prompt: 'P1', answer_outline: 'A1', difficulty: 2 },
      { id: 'q3', requirement_ids: ['r3'], category: 'behavioural', prompt: 'P3', answer_outline: 'A3', difficulty: 2 }
    ];

    const result = checkCoverage(requirements, questions);
    expect(result.isMustHaveCovered).toBe(false);
    expect(result.uncoveredMustHaves.length).toBe(1);
    expect(result.uncoveredMustHaves[0].id).toBe('r2');
    expect(result.uncoveredRequirementIds).toContain('r2');
  });

  test('nice-to-have gaps do not mark must-have coverage as false', () => {
    const questions: KitQuestion[] = [
      { id: 'q1', requirement_ids: ['r1'], category: 'technical', prompt: 'P1', answer_outline: 'A1', difficulty: 2 },
      { id: 'q2', requirement_ids: ['r2'], category: 'system-design', prompt: 'P2', answer_outline: 'A2', difficulty: 3 },
      { id: 'q3', requirement_ids: ['r3'], category: 'behavioural', prompt: 'P3', answer_outline: 'A3', difficulty: 2 }
    ];

    const result = checkCoverage(requirements, questions);
    expect(result.isMustHaveCovered).toBe(true);
    expect(result.uncoveredNiceToHaves.length).toBe(1);
    expect(result.uncoveredNiceToHaves[0].id).toBe('r4');
  });
});
