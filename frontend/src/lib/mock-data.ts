import { UIInterviewPrepKit } from './types';

export const samplePrepKit: UIInterviewPrepKit = {
  id: 'sample-kit-01',
  userId: 'user-default',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  source: {
    company: 'Stripe',
    company_url: 'https://stripe.com',
    role: 'Staff Infrastructure Engineer',
    location: 'Remote / US',
    jd_chars: 2450,
    researched_at: new Date().toISOString(),
    pages_used: [
      'https://stripe.com/about',
      'https://stripe.com/jobs/infrastructure-engineer',
      'https://stripe.com/blog/engineering-principles'
    ]
  },
  company_brief: {
    summary: 'Stripe builds financial infrastructure for the internet, powering payments, subscriptions, fraud detection (Radar), and global money movement for millions of businesses.',
    what_they_do: 'Global economic infrastructure, real-time transaction processing, banking APIs, and high-reliability distributed systems operating at 99.999% uptime.',
    sources: [
      'https://stripe.com/about',
      'https://stripe.com/blog/engineering-principles'
    ]
  },
  role: {
    title: 'Staff Infrastructure Engineer',
    seniority: 'Staff',
    responsibilities: [
      'Architect highly available ledger and transaction pipelines capable of handling 50k+ QPS.',
      'Lead incident response for critical tier-0 payment rails.',
      'Mentor senior engineers and influence cross-organizational technical strategy.'
    ],
    requirements: [
      {
        id: 'r1',
        text: '8+ years of distributed systems engineering (Kafka, Raft/Paxos, Dynamo-style stores)',
        kind: 'technical',
        priority: 'must'
      },
      {
        id: 'r2',
        text: 'Deep understanding of database consistency models, distributed transactions, and two-phase commit',
        kind: 'technical',
        priority: 'must'
      },
      {
        id: 'r3',
        text: 'Experience driving cross-team architectural alignment and technical strategy',
        kind: 'behavioural',
        priority: 'must'
      },
      {
        id: 'r4',
        text: 'Mentorship of staff and senior engineers',
        kind: 'behavioural',
        priority: 'must'
      },
      {
        id: 'r5',
        text: 'Familiarity with financial compliance, PCI-DSS, or banking APIs',
        kind: 'domain',
        priority: 'nice'
      }
    ]
  },
  questions: [
    {
      id: 'q1',
      requirement_ids: ['r1', 'r2'],
      category: 'system-design',
      prompt: 'Design an idempotent payment processing pipeline that guarantees exactly-once billing even during network partitions.',
      answer_outline: 'Discuss idempotency keys, distributed locks (e.g. Redis with Redlock or Postgres unique constraint), write-ahead logging (WAL), two-phase commits vs saga patterns, and handling late-arriving webhooks.',
      difficulty: 3,
      origin: 'generated',
      isPinned: false
    },
    {
      id: 'q2',
      requirement_ids: ['r1'],
      category: 'technical',
      prompt: 'How would you detect and remediate split-brain in a multi-region Raft cluster?',
      answer_outline: 'Explain quorum calculation (N/2 + 1), term numbers, leader lease timeouts, fencing tokens, and how partitioned nodes fail to commit log entries.',
      difficulty: 3,
      origin: 'generated',
      isPinned: false
    },
    {
      id: 'q3',
      requirement_ids: ['r3'],
      category: 'behavioural',
      prompt: 'Tell me about a time you proposed a significant architectural change that faced resistance from senior stakeholders. How did you build consensus?',
      answer_outline: 'Use STAR format. Detail the technical trade-offs, how you gathered quantitative benchmark data, authored an RFC, ran proof-of-concept tests, and aligned conflicting priorities.',
      difficulty: 2,
      origin: 'generated',
      isPinned: false
    },
    {
      id: 'q4',
      requirement_ids: ['r4'],
      category: 'behavioural',
      prompt: 'How do you structure mentorship for an engineer on the verge of promotion to Senior vs one struggling with velocity?',
      answer_outline: 'Differentiate between strategic sponsorship/delegation vs root-cause diagnosis, pairing, creating low-risk environments, and actionable feedback loops.',
      difficulty: 2,
      origin: 'generated',
      isPinned: false
    },
    {
      id: 'q5',
      requirement_ids: ['r5'],
      category: 'company-fit',
      prompt: 'Why Stripe, and how do you align with our operating principle of "Users First" when engineering low-level infrastructure?',
      answer_outline: 'Connect infrastructure reliability and latency directly to end-user business survival during Black Friday/Cyber Monday peaks.',
      difficulty: 1,
      origin: 'generated',
      isPinned: false
    }
  ],
  flashcards: [
    {
      id: 'f1',
      front: 'What is the PACELC theorem and how does it extend CAP?',
      back: 'If Partition (P), choose Availability (A) or Consistency (C); Else (E), choose Latency (L) or Consistency (C). Explains trade-offs in normal operating conditions.',
      requirement_ids: ['r1'],
      confidence: 'unreviewed'
    },
    {
      id: 'f2',
      front: 'Explain the difference between Saga (Orchestration vs Choreography) in distributed transactions.',
      back: 'Orchestration uses a centralized coordinator to dispatch commands; Choreography uses event-driven pub/sub where services react to peer domain events. Orchestration prevents circular dependencies; Choreography reduces single-point bottlenecks.',
      requirement_ids: ['r2'],
      confidence: 'unreviewed'
    },
    {
      id: 'f3',
      front: 'What is a Fencing Token and why is it required with distributed locks?',
      back: 'A monotonically increasing number generated by the lock server. If a client pauses (e.g. GC pause) and its lock expires, the storage layer rejects writes bearing an outdated fencing token.',
      requirement_ids: ['r2'],
      confidence: 'unreviewed'
    },
    {
      id: 'f4',
      front: 'How do Stripe Idempotency Keys function at the API Gateway level?',
      back: 'A unique client-provided UUID cached with request params and the first executed response. Subsequent identical requests return the cached response without re-executing state mutation.',
      requirement_ids: ['r1', 'r5'],
      confidence: 'unreviewed'
    }
  ],
  schedule: {
    days_available: 3,
    days: [
      {
        day: 1,
        focus: 'Distributed Systems Core & Consistency Models (Must-haves)',
        question_ids: ['q1', 'q2'],
        minutes: 90
      },
      {
        day: 2,
        focus: 'Staff-Level Leadership, Cross-team Alignment & Mentorship',
        question_ids: ['q3', 'q4'],
        minutes: 60
      },
      {
        day: 3,
        focus: 'Stripe Operating Principles & High-Yield Flashcard Review',
        question_ids: ['q5'],
        minutes: 45
      }
    ]
  },
  coverage: {
    uncovered_requirement_ids: [],
    passes: 2
  }
};
