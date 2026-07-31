import { analyzeFailures } from "./failure-analysis-service.js";

import type {
  BugPriority,
  BugReportDraft,
  BugSeverity,
} from "../types/bug-report.js";
import type {
  FailureCategory,
  AnalyzedFailure,
} from "../types/failure-analysis.js";
import type {
  NormalizedTestResult,
  TestRun,
} from "../types/test-result.js";

function determineSeverity(
  category: FailureCategory,
  status: NormalizedTestResult["status"],
): BugSeverity {
  if (status === "flaky") {
    return "medium";
  }

  switch (category) {
    case "authentication":
    case "api-response":
      return "high";

    case "assertion":
    case "timeout":
    case "network":
    case "environment":
      return "medium";

    case "locator":
    case "test-data":
    case "unknown":
      return "low";
  }
}

function determinePriority(
  severity: BugSeverity,
): BugPriority {
  switch (severity) {
    case "critical":
      return "P1";
    case "high":
      return "P2";
    case "medium":
      return "P3";
    case "low":
      return "P4";
  }
}

function findAnalyzedFailure(
  test: NormalizedTestResult,
): AnalyzedFailure {
  const analysis = analyzeFailures([test]);

  const analyzedFailure = analysis.categories
    .flatMap((group) => group.failures)
    .find((failure) => failure.testId === test.id);

  if (!analyzedFailure) {
    throw new Error(
      "The selected test does not contain an analyzable failure.",
    );
  }

  return analyzedFailure;
}

export function createBugReportDraft(
  testRun: TestRun,
  reportPath: string,
  testId: string,
): BugReportDraft {
  const test = testRun.tests.find(
    (candidate) => candidate.id === testId,
  );

  if (!test) {
    throw new Error(
      `Test not found in report: ${testId}`,
    );
  }

  if (
    test.status !== "failed" &&
    test.status !== "timedOut" &&
    test.status !== "flaky"
  ) {
    throw new Error(
      "Bug reports can only be generated for failed, timed-out, or flaky tests.",
    );
  }

  const analyzedFailure = findAnalyzedFailure(test);
  const severity = determineSeverity(
    analyzedFailure.category,
    test.status,
  );
  const priority = determinePriority(severity);
  const primaryError = test.errors[0];

  return {
    status: "draft",
    title:
      `[${analyzedFailure.category}] ` +
      `${test.title} failed in ${test.project}`,
    severity,
    priority,
    category: analyzedFailure.category,
    likelySource: analyzedFailure.likelySource,
    description:
      `The automated test "${test.title}" produced a ` +
      `${test.status} result in the ${test.project} project.`,
    environment: {
      project: test.project,
      reportPath,
      ...(testRun.startedAt
        ? { startedAt: testRun.startedAt }
        : {}),
    },
    reproductionSteps: [
      `Open the automated test file: ${test.file}`,
      `Run the test: ${test.title}`,
      `Execute it using the project: ${test.project}`,
      "Observe the reported failure and captured evidence.",
    ],
    expectedResult:
      "The automated test should complete successfully and satisfy its expected validation.",
    actualResult:
      primaryError?.message ??
      "The test failed without providing an error message.",
    evidence: {
      testId: test.id,
      testTitle: test.title,
      testFile: test.file,
      testStatus: test.status,
      retry: test.retry,
      durationMs: test.durationMs,
      errorMessage:
        primaryError?.message ??
        "No failure message was provided.",
      ...(primaryError?.stack
        ? { stackTrace: primaryError.stack }
        : {}),
    },
    reviewNotes: [
      "Confirm that the failure is reproducible outside the automated test.",
      "Review screenshots, traces, logs, and network evidence when available.",
      "Verify severity and priority with the product and engineering teams.",
      "Check whether the failure is caused by test automation, test data, or the application.",
    ],
    disclaimer:
      "This is an automatically generated draft. A QA engineer must review and approve it before submission.",
  };
}