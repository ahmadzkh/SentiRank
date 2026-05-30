export type ModelTask = "sentiment" | "aspect";

export type MetricFormat = "percentage" | "decimal" | "count";

export interface ModelMetric {
  id: string;
  task: ModelTask;
  label: string;
  value: number;
  format: MetricFormat;
  description: string;
}

export interface ConfusionMatrixRow {
  actualLabel: string;
  predictedCounts: Record<string, number>;
  support: number;
}

export interface ConfusionMatrix {
  id: string;
  task: ModelTask;
  labels: string[];
  rows: ConfusionMatrixRow[];
}

export interface EvaluationModelSummary {
  task: ModelTask;
  modelName: string;
  modelVersion: string;
  sampleCount: number;
  metrics: ModelMetric[];
  confusionMatrix: ConfusionMatrix;
  notes: string[];
}

export interface EvaluationSummary {
  generatedAt: string;
  models: EvaluationModelSummary[];
  overallNotes: string[];
}
