import { InterviewPrepKitSchema, InterviewPrepKit } from '../../models/types';

describe('Appendix A Structure Validation (Zod Schema)', () => {
  const validKit: InterviewPrepKit = {
    source: {
      company: 'Acme Corp',
      company_url: 'https://acme.example.com',
      role: 'Staff Engineer',
      location: 'Remote',
      jd_chars: 1200,
      researched_at: new Date().toISOString(),
      pages_used: ['https://acme.example.com/about']
    },
    company_brief: {
      summary: 'Acme builds enterprise logistics software.',
      what_they_do: 'Distributed tracking pipelines and fleet optimization.',
      sources: ['https://acme.example.com/about']
    },
    role: {
      title: 'Staff Engineer',
      seniority: 'Staff',
      responsibilities: ['Architect high throughput ingestion pipelines'],
      requirements: [
        { id: 'r1', text: '5+ years distributed systems', kind: 'technical', priority: 'must' }
      ]
    },
    questions: [
      {
        id: 'q1',
        requirement_ids: ['r1'],
        category: 'technical',
        prompt: 'Explain Raft consensus.',
        answer_outline: 'Quorum, leader election, log replication.',
        difficulty: 3
      }
    ],
    flashcards: [
      {
        id: 'f1',
        front: 'What is CAP theorem?',
        back: 'Consistency, Availability, Partition tolerance.',
        requirement_ids: ['r1']
      }
    ],
    schedule: {
      days_available: 1,
      days: [
        {
          day: 1,
          focus: 'Distributed Systems Core',
          question_ids: ['q1'],
          minutes: 45
        }
      ]
    },
    coverage: {
      uncovered_requirement_ids: [],
      passes: 2
    }
  };

  test('valid kit parses successfully without error', () => {
    expect(() => InterviewPrepKitSchema.parse(validKit)).not.toThrow();
  });

  test('rejects kit if schedule references unknown question ID', () => {
    const invalidKit = {
      ...validKit,
      schedule: {
        days_available: 1,
        days: [
          {
            day: 1,
            focus: 'Core',
            question_ids: ['q999'],
            minutes: 45
          }
        ]
      }
    };
    expect(() => InterviewPrepKitSchema.parse(invalidKit)).toThrow();
  });

  test('rejects kit if difficulty is out of range (1-3)', () => {
    const invalidKit = {
      ...validKit,
      questions: [
        {
          ...validKit.questions[0],
          difficulty: 5
        }
      ]
    };
    expect(() => InterviewPrepKitSchema.parse(invalidKit)).toThrow();
  });

  test('rejects kit if schedule minutes is float', () => {
    const invalidKit = {
      ...validKit,
      schedule: {
        days_available: 1,
        days: [
          {
            day: 1,
            focus: 'Core',
            question_ids: ['q1'],
            minutes: 45.5
          }
        ]
      }
    };
    expect(() => InterviewPrepKitSchema.parse(invalidKit)).toThrow();
  });
});
