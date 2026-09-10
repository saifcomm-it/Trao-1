import { KitRequirement, KitQuestion } from '../../models/types';

export interface CoverageResult {
  uncoveredMustHaves: KitRequirement[];
  uncoveredNiceToHaves: KitRequirement[];
  uncoveredRequirementIds: string[];
  isMustHaveCovered: boolean;
  totalMustHaves: number;
  coveredMustHavesCount: number;
}


export function checkCoverage(
  requirements: KitRequirement[],
  questions: KitQuestion[]
): CoverageResult {
  const coveredIds = new Set<string>();
  for (const q of questions) {
    if (Array.isArray(q.requirement_ids)) {
      for (const id of q.requirement_ids) {
        coveredIds.add(id);
      }
    }
  }

  const uncoveredMustHaves = requirements.filter(
    (r) => r.priority === 'must' && !coveredIds.has(r.id)
  );

  const uncoveredNiceToHaves = requirements.filter(
    (r) => r.priority === 'nice' && !coveredIds.has(r.id)
  );

  const uncoveredRequirementIds = requirements
    .filter((r) => !coveredIds.has(r.id))
    .map((r) => r.id);

  const totalMustHaves = requirements.filter((r) => r.priority === 'must').length;
  const coveredMustHavesCount = totalMustHaves - uncoveredMustHaves.length;

  return {
    uncoveredMustHaves,
    uncoveredNiceToHaves,
    uncoveredRequirementIds,
    isMustHaveCovered: uncoveredMustHaves.length === 0,
    totalMustHaves,
    coveredMustHavesCount
  };
}
