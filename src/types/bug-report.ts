import type {
  FailureCategory,
  FailureSource,
} from "./failure-analysis.js";

export type BugSeverity =
  | "critical"
  | "high"
  | "medium"
  | "low";

export type BugPriority =
  | "P1"
  | "P2"
  | "P3"
  | "P4";

export interface BugReportEnvironment {
  project: string;
  reportPath: string;
  startedAt?: string;
}

export interface BugReportTestEvidence {
  testId: string;
  testTitle: string;
  testFile: string;
  testStatus: "failed" | "timedOut" | "flaky";
  retry: number;
  durationMs: number;
  errorMessage: string;
  stackTrace?: string;
}

export interface BugReportDraft {
  status: "draft";
  title: string;
  severity: BugSeverity;
  priority: BugPriority;
  category: FailureCategory;
  likelySource: FailureSource;
  description: string;
  environment: BugReportEnvironment;
  reproductionSteps: string[];
  expectedResult: string;
  actualResult: string;
  evidence: BugReportTestEvidence;
  reviewNotes: string[];
  disclaimer: string;
}