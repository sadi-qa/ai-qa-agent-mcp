export interface TestRunSummary {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  timedOutTests: number;
  flakyTests: number;
  executedTests: number;
  successfulTests: number;
  passRate: number;
  failureRate: number;
  skipRate: number;
  durationMs: number;
}