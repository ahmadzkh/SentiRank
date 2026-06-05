"use client";

import { useState } from "react";
import {
  calculateAhp,
  compareAhpFuzzyAhp,
  getAhpCriteria,
} from "@/services/ahp-service";
import { calculateFuzzyAhp } from "@/services/fuzzy-ahp-service";
import type {
  GatewayAhpCalculateResponse,
  GatewayCriterion,
  GatewayFuzzyAhpCalculateResponse,
  GatewayRankingComparisonResponse,
} from "@/types";

const SAMPLE_RUN_LABEL = "sample_development_only";
const SAMPLE_WARNING =
  "Hasil ini menggunakan sample development judgement dan belum merupakan hasil final expert judgement.";

const SAMPLE_AHP_COMPARISONS = [
  { criterion_a: "C1", criterion_b: "C2", value_a_over_b: 1 / 3 },
  { criterion_a: "C1", criterion_b: "C3", value_a_over_b: 3 },
  { criterion_a: "C1", criterion_b: "C4", value_a_over_b: 1 },
  { criterion_a: "C1", criterion_b: "C5", value_a_over_b: 3 },
  { criterion_a: "C2", criterion_b: "C3", value_a_over_b: 9 },
  { criterion_a: "C2", criterion_b: "C4", value_a_over_b: 3 },
  { criterion_a: "C2", criterion_b: "C5", value_a_over_b: 9 },
  { criterion_a: "C3", criterion_b: "C4", value_a_over_b: 1 / 3 },
  { criterion_a: "C3", criterion_b: "C5", value_a_over_b: 1 },
  { criterion_a: "C4", criterion_b: "C5", value_a_over_b: 3 },
].map((comparison) => ({
  ...comparison,
  justification: "Sample development only.",
}));

const SAMPLE_FUZZY_COMPARISONS = [
  {
    criterion_a: "C1",
    criterion_b: "C2",
    fuzzy_value_a_over_b: { l: 0.25, m: 1 / 3, u: 0.5 },
    linguistic_scale: "moderate_reciprocal",
  },
  {
    criterion_a: "C1",
    criterion_b: "C3",
    fuzzy_value_a_over_b: { l: 2, m: 3, u: 4 },
    linguistic_scale: "moderate",
  },
  {
    criterion_a: "C1",
    criterion_b: "C4",
    fuzzy_value_a_over_b: { l: 1, m: 1, u: 1 },
    linguistic_scale: "equal",
  },
  {
    criterion_a: "C1",
    criterion_b: "C5",
    fuzzy_value_a_over_b: { l: 2, m: 3, u: 4 },
    linguistic_scale: "moderate",
  },
  {
    criterion_a: "C2",
    criterion_b: "C3",
    fuzzy_value_a_over_b: { l: 8, m: 9, u: 9 },
    linguistic_scale: "extreme",
  },
  {
    criterion_a: "C2",
    criterion_b: "C4",
    fuzzy_value_a_over_b: { l: 2, m: 3, u: 4 },
    linguistic_scale: "moderate",
  },
  {
    criterion_a: "C2",
    criterion_b: "C5",
    fuzzy_value_a_over_b: { l: 8, m: 9, u: 9 },
    linguistic_scale: "extreme",
  },
  {
    criterion_a: "C3",
    criterion_b: "C4",
    fuzzy_value_a_over_b: { l: 0.25, m: 1 / 3, u: 0.5 },
    linguistic_scale: "moderate_reciprocal",
  },
  {
    criterion_a: "C3",
    criterion_b: "C5",
    fuzzy_value_a_over_b: { l: 1, m: 1, u: 1 },
    linguistic_scale: "equal",
  },
  {
    criterion_a: "C4",
    criterion_b: "C5",
    fuzzy_value_a_over_b: { l: 2, m: 3, u: 4 },
    linguistic_scale: "moderate",
  },
].map((comparison) => ({
  ...comparison,
  justification: "Sample development only.",
}));

type DemoStatus = "idle" | "loading" | "success" | "error";

interface DemoState {
  status: DemoStatus;
  criteria: GatewayCriterion[];
  ahpResult: GatewayAhpCalculateResponse | null;
  fuzzyResult: GatewayFuzzyAhpCalculateResponse | null;
  comparisonResult: GatewayRankingComparisonResponse | null;
  errorMessage: string | null;
}

const initialState: DemoState = {
  status: "idle",
  criteria: [],
  ahpResult: null,
  fuzzyResult: null,
  comparisonResult: null,
  errorMessage: null,
};

function formatPercent(value: number) {
  return `${(value * 100).toFixed(2)}%`;
}

function topAhpLabel(result: GatewayAhpCalculateResponse | null) {
  return result?.weights.find((item) => item.rank === 1)?.criterion_name ?? "-";
}

function topFuzzyLabel(result: GatewayFuzzyAhpCalculateResponse | null) {
  return result?.weights.find((item) => item.rank === 1)?.criterion_name ?? "-";
}

export function AhpGatewayDemoPanel() {
  const [state, setState] = useState<DemoState>(initialState);

  async function runGatewayDemo() {
    setState({ ...initialState, status: "loading" });

    try {
      const criteria = await getAhpCriteria();
      const ahpResult = await calculateAhp({
        run_label: SAMPLE_RUN_LABEL,
        criteria,
        comparisons: SAMPLE_AHP_COMPARISONS,
      });
      const fuzzyResult = await calculateFuzzyAhp({
        run_label: SAMPLE_RUN_LABEL,
        criteria,
        comparisons: SAMPLE_FUZZY_COMPARISONS,
        defuzzification_method: "centroid",
      });
      const comparisonResult = await compareAhpFuzzyAhp({
        run_label: SAMPLE_RUN_LABEL,
        ahp_weights: ahpResult.weights,
        fuzzy_ahp_weights: fuzzyResult.weights,
      });

      setState({
        status: "success",
        criteria,
        ahpResult,
        fuzzyResult,
        comparisonResult,
        errorMessage: null,
      });
    } catch (error) {
      setState({
        ...initialState,
        status: "error",
        errorMessage: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const isLoading = state.status === "loading";

  return (
    <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            Demo Integrasi API Gateway
          </h3>
          <p className="mt-1 text-sm leading-5 text-muted-foreground">
            Panel ini mengirim judgement sample ke API Gateway dan menampilkan
            hasil yang dikembalikan backend.
          </p>
        </div>
        <button
          className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isLoading}
          onClick={runGatewayDemo}
          type="button"
        >
          {isLoading ? "Memproses..." : "Jalankan Demo Gateway"}
        </button>
      </div>

      <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
        {SAMPLE_WARNING}
      </p>

      {state.status === "error" ? (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
          {state.errorMessage}
        </div>
      ) : null}

      {state.status === "success" ? (
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-md border border-border bg-background px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
              Kriteria Gateway
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {state.criteria.length}
            </p>
          </div>
          <div className="rounded-md border border-border bg-background px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
              AHP CR
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {formatPercent(state.ahpResult?.consistency_ratio ?? 0)}
            </p>
          </div>
          <div className="rounded-md border border-border bg-background px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
              Top AHP
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {topAhpLabel(state.ahpResult)}
            </p>
          </div>
          <div className="rounded-md border border-border bg-background px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
              Top Fuzzy
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {topFuzzyLabel(state.fuzzyResult)}
            </p>
          </div>
          <div className="rounded-md border border-border bg-background px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
              Rank Berubah
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {state.comparisonResult?.summary.changed_rank_count ?? 0}
            </p>
          </div>
        </div>
      ) : null}
    </section>
  );
}

