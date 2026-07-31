import { analyzeFailures } from "./failure-analysis-service.js";
import { createTestRunSummary } from "./test-run-summary-service.js";

import type {
  QaExecutionSummary,
  QualityRisk,
  ReleaseRecommendation,
} from "../types/qa-summary.js";
import type { TestRun } from "../types/test-result.js";
import type { TestRunSummary } from "../types/test-run-summary.js";

function identifyRisks(
  summary: TestRunSummary,
): QualityRisk[] {
  const risks: QualityRisk[] = [];

  if (
    summary.failedTests > 0 ||
    summary.timedOutTests > 0
  ) {
    risks.push({
      level: "high",
      title: "Failed test execution",
      description:
        `${summary.failedTests} failed and ` +
        `${summary.timedOutTests} timed-out tests require investigation.`,
    });
  }

  if (summary.flakyTests > 0) {
    risks.push({
      level: "medium",
      title: "Flaky test behavior",
      description:
        `${summary.flakyTests} tests passed only after retry or showed unstable behavior.`,
    });
  }

  if (summary.skippedTests > 0) {
    risks.push({
      level: "low",
      title: "Skipped test coverage",
      description:
        `${summary.skippedTests} tests were skipped and did not provide execution evidence.`,
    });
  }

  if (summary.totalTests === 0) {
    risks.push({
      level: "high",
      title: "No test evidence",
      description:
        "The report contains no tests, so release quality cannot be evaluated.",
    });
  }

  return risks;
}

function determineReleaseRecommendation(
  summary: TestRunSummary,
): ReleaseRecommendation {
  if (
    summary.totalTests === 0 ||
    summary.failedTests > 0 ||
    summary.timedOutTests > 0
  ) {
    return "NO-GO";
  }

  if (
    summary.flakyTests > 0 ||
    summary.skippedTests > 0
  ) {
    return "GO WITH RISK";
  }

  return "GO";
}

function createRecommendationReason(
  summary: TestRunSummary,
  recommendation: ReleaseRecommendation,
): string {
  if (recommendation === "NO-GO") {
    if (summary.totalTests === 0) {
      return "No test execution evidence is available.";
    }

    return (
      "The test run contains failed or timed-out tests that must be investigated before release."
    );
  }

  if (recommendation === "GO WITH RISK") {
    return (
      "No blocking failures were detected, but flaky or skipped tests create remaining quality risk."
    );
  }

  return (
    "All executed tests passed without failures, timeouts, flaky results, or skipped coverage."
  );
}

function createMarkdownReport(
  reportPath: string,
  testRun: TestRun,
  summary: TestRunSummary,
  risks: QualityRisk[],
  recommendation: ReleaseRecommendation,
  recommendationReason: string,
): string {
  const riskLines =
    risks.length > 0
      ? risks
          .map(
            (risk) =>
              `- **${risk.level.toUpperCase()}**: ` +
              `${risk.title} - ${risk.description}`,
          )
          .join("\n")
      : "- No significant quality risks identified.";

  return `# QA Execution Summary

## Test Run

- Report: ${reportPath}
- Run ID: ${testRun.runId}
- Started: ${testRun.startedAt ?? "Not provided"}
- Duration: ${summary.durationMs} ms

## Metrics

- Total tests: ${summary.totalTests}
- Passed: ${summary.passedTests}
- Failed: ${summary.failedTests}
- Timed out: ${summary.timedOutTests}
- Flaky: ${summary.flakyTests}
- Skipped: ${summary.skippedTests}
- Pass rate: ${summary.passRate}%
- Failure rate: ${summary.failureRate}%
- Skip rate: ${summary.skipRate}%

## Quality Risks

${riskLines}

## Release Recommendation

**${recommendation}**

${recommendationReason}

## Review Requirement

This report is automatically generated and must be reviewed by a QA engineer before making a release decision.
`;
}

export function createQaExecutionSummary(
  testRun: TestRun,
  reportPath: string,
): QaExecutionSummary {
  const metrics = createTestRunSummary(testRun);
  const failureAnalysis = analyzeFailures(
    testRun.tests,
  );
  const risks = identifyRisks(metrics);
  const releaseRecommendation =
    determineReleaseRecommendation(metrics);

  const recommendationReason =
    createRecommendationReason(
      metrics,
      releaseRecommendation,
    );

  return {
    reportPath,
    runId: testRun.runId,
    ...(testRun.startedAt
      ? { startedAt: testRun.startedAt }
      : {}),
    metrics,
    failureAnalysis,
    risks,
    releaseRecommendation,
    recommendationReason,
    markdown: createMarkdownReport(
      reportPath,
      testRun,
      metrics,
      risks,
      releaseRecommendation,
      recommendationReason,
    ),
    disclaimer:
      "This automated quality summary is advisory. A QA engineer must review the evidence before making a release decision.",
  };
}