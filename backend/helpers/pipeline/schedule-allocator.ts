import { KitQuestion, KitRequirement, KitSchedule, ScheduleDay } from '../../models/types';

export function allocateSchedule(
  questions: KitQuestion[],
  requirements: KitRequirement[],
  daysAvailable: number
): KitSchedule {
  const nDays = Math.max(1, Math.floor(daysAvailable));

  if (questions.length === 0) {
    return {
      days_available: nDays,
      days: Array.from({ length: nDays }, (_, i) => ({
        day: i + 1,
        focus: `Interview Preparation Block ${i + 1}`,
        question_ids: [],
        minutes: 45
      }))
    };
  }

  // 1. Requirement priority lookup
  const mustReqIdSet = new Set(
    requirements.filter((r) => r.priority === 'must').map((r) => r.id)
  );

  // 2. Order questions: Basic (Level 1) -> Intermediate (Level 2) -> Hard (Level 3)
  const sortedQuestions = [...questions].sort((a, b) => {
    // Difficulty ascending: Level 1 (Basic) -> Level 2 (Intermediate) -> Level 3 (Hard)
    const diffDiff = (a.difficulty || 2) - (b.difficulty || 2);
    if (diffDiff !== 0) return diffDiff;

    // Within same difficulty, prioritize must-haves
    const aMust = a.requirement_ids.some((rId) => mustReqIdSet.has(rId));
    const bMust = b.requirement_ids.some((rId) => mustReqIdSet.has(rId));
    if (aMust && !bMust) return -1;
    if (!aMust && bMust) return 1;

    // Foundational categories earlier
    const catOrder: Record<string, number> = {
      'company-fit': 1,
      'behavioural': 2,
      'technical': 3,
      'system-design': 4
    };
    return (catOrder[a.category] || 5) - (catOrder[b.category] || 5);
  });

  const prioritizedQuestionIds = sortedQuestions.map((q) => q.id);

  // Question lookup for minutes calculation
  const qMap = new Map(questions.map((q) => [q.id, q]));

  // 3. Allocate UNIQUE questions with progressive difficulty:
  // Phase 1: Foundational / Easy (Level 1) -> Phase 2: Core / Medium (Level 2) -> Phase 3: Advanced / Hard (Level 3)
  // Strict Guarantee: NO question is ever repeated on multiple days!
  const dayQuestionBuckets: string[][] = Array.from({ length: nDays }, () => []);
  const assignedQIds = new Set<string>();

  const easyQuestions = sortedQuestions.filter((q) => (q.difficulty || 2) === 1);
  const mediumQuestions = sortedQuestions.filter((q) => (q.difficulty || 2) === 2);
  const hardQuestions = sortedQuestions.filter((q) => (q.difficulty || 2) === 3);

  // If fewer questions than days, distribute each question to a distinct day proportionally
  if (sortedQuestions.length < nDays) {
    sortedQuestions.forEach((q, i) => {
      let targetDayIdx = 0;
      if (sortedQuestions.length > 1) {
        targetDayIdx = Math.min(nDays - 1, Math.round((i / (sortedQuestions.length - 1)) * (nDays - 1)));
      }
      dayQuestionBuckets[targetDayIdx].push(q.id);
      assignedQIds.add(q.id);
    });
  } else {
    // We have at least as many questions as days
    const basePerDay = Math.floor(sortedQuestions.length / nDays);
    const remainder = sortedQuestions.length % nDays;

    const p1End = Math.max(1, Math.floor(nDays / 3));
    const p2End = nDays >= 3 ? Math.floor((2 * nDays) / 3) : Math.max(1, nDays - 1);

    const unassignedEasy = [...easyQuestions];
    const unassignedMedium = [...mediumQuestions];
    const unassignedHard = [...hardQuestions];

    const getNextQuestion = (preferredTiers: ('easy' | 'medium' | 'hard')[]) => {
      for (const tier of preferredTiers) {
        if (tier === 'easy' && unassignedEasy.length > 0) return unassignedEasy.shift()!;
        if (tier === 'medium' && unassignedMedium.length > 0) return unassignedMedium.shift()!;
        if (tier === 'hard' && unassignedHard.length > 0) return unassignedHard.shift()!;
      }
      return undefined;
    };

    for (let dayIdx = 0; dayIdx < nDays; dayIdx++) {
      const countForThisDay = basePerDay + (dayIdx < remainder ? 1 : 0);

      let tierPreference: ('easy' | 'medium' | 'hard')[];
      if (dayIdx < p1End) {
        tierPreference = ['easy', 'medium', 'hard'];
      } else if (dayIdx < p2End) {
        tierPreference = ['medium', 'easy', 'hard'];
      } else {
        tierPreference = ['hard', 'medium', 'easy'];
      }

      const bucket: string[] = [];
      for (let c = 0; c < countForThisDay; c++) {
        const nextQ = getNextQuestion(tierPreference);
        if (nextQ && !assignedQIds.has(nextQ.id)) {
          bucket.push(nextQ.id);
          assignedQIds.add(nextQ.id);
        }
      }
      dayQuestionBuckets[dayIdx] = bucket;
    }

    // Any leftover questions go into their respective difficulty phase
    let leftover: KitQuestion | undefined;
    while ((leftover = unassignedHard.shift() || unassignedMedium.shift() || unassignedEasy.shift())) {
      if (!assignedQIds.has(leftover.id)) {
        const targetDay = leftover.difficulty === 1 ? 0 : leftover.difficulty === 2 ? Math.floor(nDays / 2) : nDays - 1;
        dayQuestionBuckets[targetDay].push(leftover.id);
        assignedQIds.add(leftover.id);
      }
    }
  }

  // 4. Ensure must-have requirements are scheduled without creating duplicate IDs
  const scheduledQIds = new Set(dayQuestionBuckets.flat());
  const scheduledReqIds = new Set<string>();
  for (const qId of scheduledQIds) {
    const q = qMap.get(qId);
    if (q) {
      for (const rId of q.requirement_ids) {
        scheduledReqIds.add(rId);
      }
    }
  }

  for (const req of requirements.filter((r) => r.priority === 'must')) {
    if (!scheduledReqIds.has(req.id)) {
      const coveringQ = questions.find((q) => q.requirement_ids.includes(req.id));
      if (coveringQ && !scheduledQIds.has(coveringQ.id)) {
        const targetDayIdx = coveringQ.difficulty === 1 ? 0 : coveringQ.difficulty === 2 ? Math.floor(nDays / 2) : nDays - 1;
        dayQuestionBuckets[targetDayIdx].push(coveringQ.id);
        scheduledReqIds.add(req.id);
        scheduledQIds.add(coveringQ.id);
      }
    }
  }

  // 5. Ensure each day's questions are strictly ordered from Easy to Hard (Level 1 -> 2 -> 3)
  dayQuestionBuckets.forEach((bucket) => {
    bucket.sort((aId, bId) => {
      const qa = qMap.get(aId);
      const qb = qMap.get(bId);
      return (qa?.difficulty || 2) - (qb?.difficulty || 2);
    });
  });

  // 6. Build Final Day Schedule with thematic focus & integer minutes
  const scheduleDays: ScheduleDay[] = dayQuestionBuckets.map((qIds, idx) => {
    const dayNum = idx + 1;

    let minutes = 0;
    for (const qId of qIds) {
      const q = qMap.get(qId);
      const diff = q?.difficulty || 2;
      minutes += diff === 3 ? 10 : diff === 2 ? 7 : 5;
    }
    // Realistic minutes between 30 and 90 mins for 10 questions
    minutes = Math.max(30, Math.min(90, minutes));

    const dayQuestions = qIds.map((id) => qMap.get(id)).filter(Boolean) as KitQuestion[];
    const focus = deriveDynamicDayFocus(dayQuestions, requirements, dayNum, nDays);

    return {
      day: dayNum,
      focus,
      question_ids: qIds,
      minutes
    };
  });

  return {
    days_available: nDays,
    days: scheduleDays
  };
}

function deriveDynamicDayFocus(
  assignedQuestions: KitQuestion[],
  allRequirements: KitRequirement[],
  dayNum: number,
  totalDays: number
): string {
  if (assignedQuestions.length === 0) {
    return `Day ${dayNum}: Target Practice & Synthesis`;
  }

  // Collect unique categories for this day
  const categories = Array.from(new Set(assignedQuestions.map((q) => q.category)));

  // Collect covered requirements for this day
  const reqIdSet = new Set(assignedQuestions.flatMap((q) => q.requirement_ids));
  const coveredReqs = allRequirements.filter((r) => reqIdSet.has(r.id));

  // Extract concise topic keywords from covered requirements (stripping leading verb phrases)
  const topics: string[] = [];
  for (const r of coveredReqs) {
    const clean = r.text
      .replace(/^(Develop and maintain|Experience with|Strong knowledge of|Knowledge of|Proficiency in|Hands-on experience with|Responsible for|Build and deploy|Design and implement|Ability to|Proven track record of)\s+/i, '')
      .replace(/[-*•#`]/g, '')
      .trim();
    const words = clean.split(/\s+/).slice(0, 4).join(' ');
    if (words && !topics.some((t) => t.toLowerCase() === words.toLowerCase())) {
      topics.push(words);
    }
  }

  const categoryName = categories
    .map((c) => {
      switch (c) {
        case 'system-design': return 'Architecture & System Design';
        case 'technical': return 'Technical Deep-Dive';
        case 'behavioural': return 'Leadership & Behavioural';
        case 'company-fit': return 'Domain & Culture Alignment';
        default: return c;
      }
    })
    .slice(0, 2)
    .join(' + ') || 'Core Preparation';

  if (dayNum === 1 && totalDays > 1) {
    const topicSummary = topics.length > 0 ? `: ${topics.slice(0, 2).join(' & ')}` : '';
    return `Foundations & Core Principles (Easy Level)${topicSummary}`;
  }

  if (dayNum === totalDays && totalDays > 1) {
    const topicSummary = topics.length > 0 ? `: ${topics.slice(0, 2).join(' & ')}` : '';
    return `${categoryName}: Advanced Architecture & Mock Drills (Hard Level)${topicSummary}`;
  }

  if (topics.length > 0) {
    const topicSummary = topics.slice(0, 2).join(' & ');
    return `${categoryName} (Medium Level): ${topicSummary}`;
  }

  const snippet = assignedQuestions[0]?.prompt.slice(0, 45).replace(/[?.,;:]+$/, '') || 'Target Practice';
  return `${categoryName} (Medium Level): ${snippet}`;
}
