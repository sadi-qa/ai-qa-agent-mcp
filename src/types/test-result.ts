export type TestStatus =
  | "passed"
  | "failed"
  | "skipped"
  | "timedOut"
  | "flaky";

export interface TestError {
  message: string;
  stack?: string;
}

export interface NormalizedTestResult {
  id: string;
  title: string;
  file: string;
  project: string;
  status: TestStatus;
  durationMs: number;
  retry: number;
  errors: TestError[];
}

export interface TestRun {
  runId: string;
  sourceFile: string;
  format: "playwright-json" | "junit";
  startedAt?: string;
  durationMs: number;
  tests: NormalizedTestResult[];
}