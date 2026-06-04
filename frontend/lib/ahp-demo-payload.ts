import {
  AHP_DEMO_RUN_LABEL,
  type BackendAhpCalculateRequest,
  type BackendAhpCriterion,
  type BackendAhpPairwiseComparison,
  type BackendFuzzyAhpCalculateRequest,
  type BackendFuzzyAhpPairwiseComparison,
} from "@/types";

const SAMPLE_DEVELOPMENT_JUSTIFICATION =
  "Sample development only, not final expert judgement.";

const REQUIRED_CRITERION_IDS = ["C1", "C2", "C3", "C4", "C5"] as const;

const sampleAhpComparisons = [
  ["C1", "C2", 0.3333333333333333],
  ["C1", "C3", 2],
  ["C1", "C4", 0.5],
  ["C1", "C5", 3],
  ["C2", "C3", 9],
  ["C2", "C4", 2],
  ["C2", "C5", 9],
  ["C3", "C4", 0.3333333333333333],
  ["C3", "C5", 0.5],
  ["C4", "C5", 2],
] as const;

const sampleFuzzyAhpComparisons = [
  ["C1", "C2", "moderate", 0.25, 0.3333333333333333, 0.5],
  ["C1", "C3", "slight", 1, 2, 3],
  ["C1", "C4", "slightly_less", 0.3333333333333333, 0.5, 1],
  ["C1", "C5", "moderate", 2, 3, 4],
  ["C2", "C3", "extreme", 8, 9, 9],
  ["C2", "C4", "slight", 1, 2, 3],
  ["C2", "C5", "extreme", 8, 9, 9],
  ["C3", "C4", "moderate", 0.25, 0.3333333333333333, 0.5],
  ["C3", "C5", "slightly_less", 0.3333333333333333, 0.5, 1],
  ["C4", "C5", "slight", 1, 2, 3],
] as const;

function selectDemoCriteria(criteria: readonly BackendAhpCriterion[]) {
  if (criteria.length !== REQUIRED_CRITERION_IDS.length) {
    throw new Error(
      "Demo API FE-13 membutuhkan tepat 5 kriteria sample development.",
    );
  }

  const criteriaById = new Map(criteria.map((criterion) => [criterion.id, criterion]));
  const selectedCriteria = REQUIRED_CRITERION_IDS.map((criterionId) => {
    const criterion = criteriaById.get(criterionId);

    if (!criterion) {
      throw new Error(
        `Kriteria sample development tidak lengkap. Kriteria ${criterionId} tidak ditemukan.`,
      );
    }

    return criterion;
  });

  return selectedCriteria;
}

export function buildAhpDemoPayload(
  criteria: readonly BackendAhpCriterion[],
): BackendAhpCalculateRequest {
  const selectedCriteria = selectDemoCriteria(criteria);
  const comparisons: BackendAhpPairwiseComparison[] = sampleAhpComparisons.map(
    ([criterionA, criterionB, value]) => ({
      criterion_a: criterionA,
      criterion_b: criterionB,
      justification: SAMPLE_DEVELOPMENT_JUSTIFICATION,
      value_a_over_b: value,
    }),
  );

  return {
    comparisons,
    consistency_threshold: 0.1,
    criteria: selectedCriteria,
    run_label: AHP_DEMO_RUN_LABEL,
  };
}

export function buildFuzzyAhpDemoPayload(
  criteria: readonly BackendAhpCriterion[],
): BackendFuzzyAhpCalculateRequest {
  const selectedCriteria = selectDemoCriteria(criteria);
  const comparisons: BackendFuzzyAhpPairwiseComparison[] =
    sampleFuzzyAhpComparisons.map(
      ([criterionA, criterionB, linguisticScale, lower, middle, upper]) => ({
        criterion_a: criterionA,
        criterion_b: criterionB,
        fuzzy_value_a_over_b: {
          l: lower,
          m: middle,
          u: upper,
        },
        justification: SAMPLE_DEVELOPMENT_JUSTIFICATION,
        linguistic_scale: linguisticScale,
      }),
    );

  return {
    comparisons,
    consistency_threshold: 0.1,
    criteria: selectedCriteria,
    defuzzification_method: "centroid",
    run_label: AHP_DEMO_RUN_LABEL,
  };
}

export const AHP_DEMO_LABELS = [
  "sample_development_only",
  "not_final_expert_judgement",
] as const;
