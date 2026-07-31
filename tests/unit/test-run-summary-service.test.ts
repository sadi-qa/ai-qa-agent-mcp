import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { parsePlaywrightJsonReport } from "../../src/parsers/playwright-json-parser.js";
import { createTestRunSummary } from "../../src/services/test-run-summary-service.js";
import type { TestRun } from "../../src/types/test-result.js";

describe("createTestRunSummary", () => {
  it("calculates summary metrics from a Playwright test run", async () => {
    const reportPath = resolve(
      process.cwd(),
      "sample-data",
      "json",
      "playwright-results.json",
    );

    const testRun = await parsePlaywrightJsonReport(reportPath);
    const summary = createTestRunSummary(testRun);

    expect(summary).toEqual({
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

  it("returns zero percentages for an empty test run", () => {
    const emptyTestRun: TestRun = {
      runId: "empty-run",
      sourceFile: "empty.json",
      format: "playwright-json",
      durationMs: 0,
      tests: [],
    };

    const summary = createTestRunSummary(emptyTestRun);

    expect(summary.totalTests).toBe(0);
    expect(summary.executedTests).toBe(0);
    expect(summary.passRate).toBe(0);
    expect(summary.failureRate).toBe(0);
    expect(summary.skipRate).toBe(0);
  });
});