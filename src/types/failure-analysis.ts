export type FailureCategory =
  | "assertion"
  | "timeout"
  | "locator"
  | "network"
  | "authentication"
  | "api-response"
  | "test-data"
  | "environment"
  | "unknown";

export type FailureSource =
  | "possible-product-defect"
  | "possible-automation-issue"
  | "requires-investigation";

export interface AnalyzedFailure {
  testId: string;
  testTitle: string;
  file: string;
  project: string;
  status: "failed" | "timedOut" | "flaky";
  category: FailureCategory;
  likelySource: FailureSource;
  message: string;
  retry: number;
  durationMs: number;
}

export interface FailureGroup {
  category: FailureCategory;
  likelySource: FailureSource;
  count: number;
  failures: AnalyzedFailure[];
}

export interface FailureAnalysis {
  totalFailures: number;
  affectedTests: number;
  categories: FailureGroup[];
}