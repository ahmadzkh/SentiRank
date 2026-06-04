export const API_ENDPOINTS = {
  reviews: {
    base: "/api/reviews",
    list: "/api/reviews",
  },
  dataset: {
    base: "/api/dataset",
    summary: "/api/dataset/summary",
  },
  scraping: {
    base: "/api/scraping",
    summary: "/api/scraping/summary",
  },
  preprocessing: {
    base: "/api/preprocessing",
    summary: "/api/preprocessing/summary",
  },
  sentiment: {
    base: "/api/sentiment",
    predict: "/api/sentiment/predict",
    summary: "/api/sentiment/summary",
  },
  aspects: {
    base: "/api/aspects",
    classify: "/api/aspects/classify",
    summary: "/api/aspects/summary",
  },
  ahp: {
    base: "/ahp",
    criteria: "/ahp/criteria",
    calculate: "/ahp/calculate",
    fuzzyCalculate: "/ahp/fuzzy-calculate",
    compare: "/ahp/compare",
  },
  fuzzyAhp: {
    base: "/api/fuzzy-ahp",
    calculate: "/api/fuzzy-ahp/calculate",
  },
  evaluation: {
    base: "/api/evaluation",
    summary: "/api/evaluation/summary",
  },
  reports: {
    base: "/api/reports",
    summary: "/api/reports/summary",
  },
} as const;

export type ApiEndpointGroup = keyof typeof API_ENDPOINTS;
