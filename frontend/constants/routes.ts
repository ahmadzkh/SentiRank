export const APP_ROUTES = {
  dashboard: "/dashboard",
  inference: "/inference",
  dataset: "/dataset",
  scraping: "/scraping",
  preprocessing: "/preprocessing",
  sentimentAnalysis: "/sentiment-analysis",
  aspectClassification: "/aspect-classification",
  ahpFuzzyAhp: "/ahp-fuzzy-ahp",
  modelEvaluation: "/model-evaluation",
  settings: "/settings",
} as const;

export type AppRouteKey = keyof typeof APP_ROUTES;
export type AppRoute = (typeof APP_ROUTES)[AppRouteKey];
