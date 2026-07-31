import type { TestRun } from "../types/test-result.js";
import type { TestRunSummary } from "../types/test-run-summary.js";

function calculatePercentage(
  value: number,
  total: number,
): number {
  if (total === 0) {
    return 0;
  }

  return Number(((value / total) * 100).toFixed(2));
}

export function createTestRunSummary(
  testRun: TestRun,
): TestRunSummary {
  const passedTests = testRun.tests.filter(
    (test) => test.status === "passed",
  ).length;

  const failedTests = testRun.tests.filter(
    (test) => test.status === "failed",
  ).length;

  const skippedTests = testRun.tests.filter(
    (test) => test.status === "skipped",
  ).length;

  const timedOutTests = testRun.tests.filter(
    (test) => test.status === "timedOut",
  ).length;

  const flakyTests = testRun.tests.filter(
    (test) => test.status === "flaky",
  ).length;

  const totalTests = testRun.tests.length;
  const executedTests = totalTests - skippedTests;
  const successfulTests = passedTests + flakyTests;
  const unsuccessfulTests = failedTests + timedOutTests;

  return {
    totalTests,
    passedTests,
    failedTests,
    skippedTests,
    timedOutTests,
    flakyTests,
    executedTests,
    successfulTests,
    passRate: calculatePercentage(
      successfulTests,
      executedTests,
    ),
    failureRate: calculatePercentage(
      unsuccessfulTests,
      executedTests,
    ),
    skipRate: calculatePercentage(
      skippedTests,
      totalTests,
    ),
    durationMs: testRun.durationMs,
  };
}