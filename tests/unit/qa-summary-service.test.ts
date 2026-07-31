import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { parsePlaywrightJsonReport } from "../../src/parsers/playwright-json-parser.js";
import { createQaExecutionSummary } from "../../src/services/qa-summary-service.js";
import type { TestRun } from "../../src/types/test-result.js";

describe("createQaExecutionSummary", () => {
  it("recommends NO-GO when failures exist", async () => {
    const reportPath = resolve(
      process.cwd(),
      "sample-data",
      "json",
      "playwright-results.json",
    );

    const testRun =
      await parsePlaywrightJsonReport(reportPath);

    const summary = createQaExecutionSummary(
      testRun,
      "json/playwright-results.json",
    );

    expect(summary.releaseRecommendation).toBe(
      "NO-GO",
    );

    expect(summary.metrics).toMatchObject({
      totalTests: 4,
      passedTests: 1,
      failedTests: 1,
      skippedTests: 1,
      flakyTests: 1,
      passRate: 66.67,
    });

    expect(summary.failureAnalysis.totalFailures).toBe(
      2,
    );

    expect(summary.risks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          level: "high",
          title: "Failed test execution",
        }),
        expect.objectContaining({
          level: "medium",
          title: "Flaky test behavior",
        }),
        expect.objectContaining({
          level: "low",
          title: "Skipped test coverage",
        }),
      ]),
    );

    expect(summary.markdown).toContain(
      "# QA Execution Summary",
    );

    expect(summary.markdown).toContain(
      "**NO-GO**",
    );

    expect(summary.disclaimer).toContain(
      "QA engineer must review",
    );
  });

  it("recommends GO when all tests pass", () => {
    const successfulTestRun: TestRun = {
      runId: "successful-run",
      sourceFile: "successful-results.json",
      format: "playwright-json",
      startedAt: "2026-07-31T04:00:00.000Z",
      durationMs: 2500,
      tests: [
        {
          id: "login.spec.ts::valid login::chromium",
          title: "valid login",
          file: "tests/auth/login.spec.ts",
          project: "chromium",
          status: "passed",
          durationMs: 2500,
          retry: 0,
          errors: [],
        },
      ],
    };

    const summary = createQaExecutionSummary(
      successfulTestRun,
      "json/successful-results.json",
    );

    expect(summary.releaseRecommendation).toBe("GO");
    expect(summary.risks).toEqual([]);
    expect(summary.metrics.passRate).toBe(100);
    expect(summary.markdown).toContain("**GO**");
  });

  it("recommends GO WITH RISK when flaky tests exist without blocking failures", () => {
    const riskyTestRun: TestRun = {
      runId: "risky-run",
      sourceFile: "risky-results.json",
      format: "playwright-json",
      durationMs: 6000,
      tests: [
        {
          id: "checkout.spec.ts::complete checkout::chromium",
          title: "complete checkout",
          file: "tests/checkout/checkout.spec.ts",
          project: "chromium",
          status: "flaky",
          durationMs: 6000,
          retry: 1,
          errors: [
            {
              message:
                "Timeout while waiting for checkout confirmation.",
            },
          ],
        },
      ],
    };

    const summary = createQaExecutionSummary(
      riskyTestRun,
      "json/risky-results.json",
    );

    expect(summary.releaseRecommendation).toBe(
      "GO WITH RISK",
    );

    expect(summary.metrics.flakyTests).toBe(1);

    expect(summary.risks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          level: "medium",
          title: "Flaky test behavior",
        }),
      ]),
    );

    expect(summary.markdown).toContain(
      "**GO WITH RISK**",
    );
  });
});