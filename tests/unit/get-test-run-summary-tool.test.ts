import { describe, expect, it } from "vitest";

import { executeGetTestRunSummary } from "../../src/tools/get-test-run-summary-tool.js";

describe("executeGetTestRunSummary", () => {
  it("returns summary metrics for a Playwright JSON report", async () => {
    const result = await executeGetTestRunSummary({
      reportPath: "json/playwright-results.json",
    });

    expect(result.reportPath).toContain(
      "json",
    );

    expect(result.runId).toContain(
      "playwright-results.json",
    );

    expect(result.format).toBe(
      "playwright-json",
    );

    expect(result.startedAt).toBe(
      "2026-07-30T18:30:00.000Z",
    );

    expect(result.summary).toEqual({
      totalTests: 4,
      passedTests: 1,
      failedTests: 1,
      skippedTests: 1,
      timedOutTests: 0,
      flakyTests: 1,
      executedTests: 3,
      successfulTests: 2,
      passRate: 66.67,
      failureRate: 33.33,
      skipRate: 25,
      durationMs: 39050,
    });
  });

  it("returns summary metrics for a JUnit XML report", async () => {
    const result = await executeGetTestRunSummary({
      reportPath: "junit/junit-results.xml",
    });

    expect(result.reportPath).toContain(
      "junit",
    );

    expect(result.runId).toContain(
      "junit-results.xml",
    );

    expect(result.format).toBe("junit");

    expect(result.startedAt).toBe(
      "2026-07-30T18:30:00.000Z",
    );

    expect(result.summary).toEqual({
      totalTests: 4,
      passedTests: 1,
      failedTests: 1,
      skippedTests: 1,
      timedOutTests: 1,
      flakyTests: 0,
      executedTests: 3,
      successfulTests: 1,
      passRate: 33.33,
      failureRate: 66.67,
      skipRate: 25,
      durationMs: 36850,
    });
  });

  it("rejects paths outside the approved directory", async () => {
    await expect(
      executeGetTestRunSummary({
        reportPath: "../package.json",
      }),
    ).rejects.toThrow(
      "Access denied: requested path is outside the approved directory.",
    );
  });
});