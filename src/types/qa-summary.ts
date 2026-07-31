import type { FailureAnalysis } from "./failure-analysis.js";
import type { TestRunSummary } from "./test-run-summary.js";

export type ReleaseRecommendation =
  | "GO"
  | "GO WITH RISK"
  | "NO-GO";

export interface QualityRisk {
  level: "high" | "medium" | "low";
  title: string;
  description: string;
}

export interface QaExecutionSummary {
  reportPath: string;
  runId: string;
  startedAt?: string;
  metrics: TestRunSummary;
  failureAnalysis: FailureAnalysis;
  risks: QualityRisk[];
  releaseRecommendation: ReleaseRecommendation;
  recommendationReason: string;
  markdown: string;
  disclaimer: string;
}