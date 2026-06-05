export const API_ENDPOINTS = {
  reviews: {
    base: "/reviews",
    random: "/reviews/random",
    latestNegative: "/reviews/latest-negative",
  },
  dataset: {
    base: "/dataset",
    summary: "/dataset/summary",
  },
  scraping: {
    base: "/scraping",
    summary: "/scraping/summary",
  },
  preprocessing: {
    base: "/preprocessing",
    summary: "/preprocessing/summary",
  },
  sentiment: {
    base: "/sentiment",
    predict: "/sentiment/predict",
    summary: "/sentiment/summary",
    evaluation: "/sentiment/evaluation",
  },
  aspects: {
    base: "/aspects",
    classify: "/aspects/classify",
    summary: "/aspects/summary",
    evaluation: "/aspects/evaluation",
  },
  ahp: {
    base: "/ahp",
    criteria: "/ahp/criteria",
    calculate: "/ahp/calculate",
    fuzzyCalculate: "/ahp/fuzzy-calculate",
    compare: "/ahp/compare",
  },
  fuzzyAhp: {
    base: "/ahp",
    calculate: "/ahp/fuzzy-calculate",
  },
  evaluation: {
    base: "/evaluation",
    summary: "/evaluation/summary",
  },
  reports: {
    base: "/reports",
    summary: "/reports/summary",
    rankingComparison: "/reports/ranking-comparison",
  },
  health: {
    base: "/health",
    service: "/health",
    services: "/health/services",
  },
} as const;

export type ApiEndpointGroup = keyof typeof API_ENDPOINTS;
