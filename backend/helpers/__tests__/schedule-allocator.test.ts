import { allocateSchedule } from '../pipeline/schedule-allocator';
import { KitQuestion, KitRequirement } from '../../models/types';

describe('Schedule Allocator (Deterministic Arithmetic)', () => {
  const mockRequirements: KitRequirement[] = [
    { id: 'r1', text: '5+ years with React', kind: 'technical', priority: 'must' },
    { id: 'r2', text: 'Distributed systems', kind: 'technical', priority: 'must' },
    { id: 'r3', text: 'Mentorship', kind: 'behavioural', priority: 'must' },
    { id: 'r4', text: 'GraphQL experience', kind: 'technical', priority: 'nice' }
  ];

  const mockQuestions: KitQuestion[] = [
    { id: 'q1', requirement_ids: ['r1'], category: 'technical', prompt: 'React question', answer_outline: 'Outline 1', difficulty: 2 },
    { id: 'q2', requirement_ids: ['r2'], category: 'system-design', prompt: 'Distributed question', answer_outline: 'Outline 2', difficulty: 3 },
    { id: 'q3', requirement_ids: ['r3'], category: 'behavioural', prompt: 'Mentorship question', answer_outline: 'Outline 3', difficulty: 2 },
    { id: 'q4', requirement_ids: ['r4'], category: 'technical', prompt: 'GraphQL question', answer_outline: 'Outline 4', difficulty: 1 }
  ];

  test('allocates exactly N days for varying day inputs', () => {
    const testDayCounts = [1, 3, 5, 14, 30, 60];
    for (const days of testDayCounts) {
      const schedule = allocateSchedule(mockQuestions, mockRequirements, days);
      expect(schedule.days_available).toBe(days);
      expect(schedule.days.length).toBe(days);
      expect(schedule.days[0].day).toBe(1);
      expect(schedule.days[days - 1].day).toBe(days);
    }
  });

  test('every must-have requirement appears somewhere in the schedule', () => {
    const schedule = allocateSchedule(mockQuestions, mockRequirements, 5);
    const scheduledQIds = new Set(schedule.days.flatMap((d) => d.question_ids));

    const scheduledReqIds = new Set<string>();
    mockQuestions.forEach((q) => {
      if (scheduledQIds.has(q.id)) {
        q.requirement_ids.forEach((rId) => scheduledReqIds.add(rId));
      }
    });

    const mustHaves = mockRequirements.filter((r) => r.priority === 'must');
    for (const must of mustHaves) {
      expect(scheduledReqIds.has(must.id)).toBe(true);
    }
  });

  test('durations are always integer minutes, never floats', () => {
    const schedule = allocateSchedule(mockQuestions, mockRequirements, 5);
    for (const day of schedule.days) {
      expect(Number.isInteger(day.minutes)).toBe(true);
      expect(day.minutes).toBeGreaterThan(0);
    }
  });

  test('basic (level 1) questions land on earlier days and harder (level 3) on later days', () => {
    const schedule = allocateSchedule(mockQuestions, mockRequirements, 3);

    expect(schedule.days[0].question_ids).toContain('q4');

    expect(schedule.days[2].question_ids).toContain('q2');
  });

  test('questions within each day are ordered ascending by difficulty', () => {
    const schedule = allocateSchedule(mockQuestions, mockRequirements, 2);
    const qMap = new Map(mockQuestions.map((q) => [q.id, q]));
    for (const day of schedule.days) {
      const diffs = day.question_ids.map((id) => qMap.get(id)?.difficulty || 0);
      for (let i = 1; i < diffs.length; i++) {
        expect(diffs[i]).toBeGreaterThanOrEqual(diffs[i - 1]);
      }
    }
  });

  test('every question_ids entry refers to a question that actually exists', () => {
    const validQIds = new Set(mockQuestions.map((q) => q.id));
    const schedule = allocateSchedule(mockQuestions, mockRequirements, 7);
    for (const day of schedule.days) {
      for (const qId of day.question_ids) {
        expect(validQIds.has(qId)).toBe(true);
      }
    }
  });

  test('no question is ever duplicated across different days in the schedule', () => {
    const schedule = allocateSchedule(mockQuestions, mockRequirements, 4);
    const seenQIds = new Set<string>();
    for (const day of schedule.days) {
      for (const qId of day.question_ids) {
        expect(seenQIds.has(qId)).toBe(false);
        seenQIds.add(qId);
      }
    }
  });
});
