import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { parsePlaywrightJsonReport } from "../../src/parsers/playwright-json-parser.js";

describe("parsePlaywrightJsonReport", () => {
  it("converts a Playwright JSON report into a normalized test run", async () => {
    const reportPath = resolve(
      process.cwd(),
      "sample-data",
      "json",
      "playwright-results.json",
    );

    const testRun = await parsePlaywrightJsonReport(reportPath);

    expect(testRun.format).toBe("playwright-json");
    expect(testRun.startedAt).toBe("2026-07-30T18:30:00.000Z");
    expect(testRun.durationMs).toBe(39050);
    expect(testRun.tests).toHaveLength(4);

    expect(testRun.tests.map((test) => test.status)).toEqual([
      "passed",
      "failed",
      "skipped",
      "flaky",
    ]);
  });

  it("preserves failure details", async () => {
    const reportPath = resolve(
      process.cwd(),
      "sample-data",
      "json",
      "playwright-results.json",
    );

    const testRun = await parsePlaywrightJsonReport(reportPath);

    const failedTest = testRun.tests.find(
      (test) => test.status === "failed",
    );

    expect(failedTest).toBeDefined();
    expect(failedTest?.title).toBe(
      "locked user sees an error message",
    );
    expect(failedTest?.durationMs).toBe(2180);
    expect(failedTest?.errors).toHaveLength(1);
    expect(failedTest?.errors[0]?.message).toContain(
      "Invalid credentials",
    );
  });

  it("combines all attempts for a flaky test", async () => {
    const reportPath = resolve(
      process.cwd(),
      "sample-data",
      "json",
      "playwright-results.json",
    );

    const testRun = await parsePlaywrightJsonReport(reportPath);

    const flakyTest = testRun.tests.find(
      (test) => test.status === "flaky",
    );

    expect(flakyTest).toBeDefined();
    expect(flakyTest?.retry).toBe(1);
    expect(flakyTest?.durationMs).toBe(33420);
    expect(flakyTest?.errors).toHaveLength(1);
  });
});