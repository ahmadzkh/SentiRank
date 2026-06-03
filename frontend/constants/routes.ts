export const APP_ROUTES = {
  dashboard: "/dashboard",
  dataset: "/dataset",
  scraping: "/scraping",
  preprocessing: "/preprocessing",
  sentimentAnalysis: "/sentiment-analysis",
  aspectClassification: "/aspect-classification",
  ahpFuzzyAhp: "/ahp-fuzzy-ahp",
  modelEvaluation: "/model-evaluation",
  reports: "/reports",
  settings: "/settings",
} as const;

export type AppRouteKey = keyof typeof APP_ROUTES;
export type AppRoute = (typeof APP_ROUTES)[AppRouteKey];
