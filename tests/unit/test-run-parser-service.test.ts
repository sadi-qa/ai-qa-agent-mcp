import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { parseTestRunReport } from "../../src/services/test-run-parser-service.js";

describe("parseTestRunReport", () => {
  it("parses a Playwright JSON report", async () => {
    const reportPath = resolve(
      process.cwd(),
      "sample-data",
      "json",
      "playwright-results.json",
    );

    const testRun =
      await parseTestRunReport(reportPath);

    expect(testRun.format).toBe(
      "playwright-json",
    );

    expect(testRun.runId).toBe(
      "playwright-results.json-2026-07-30T18:30:00.000Z",
    );

    expect(testRun.startedAt).toBe(
      "2026-07-30T18:30:00.000Z",
    );

    expect(testRun.durationMs).toBe(39050);
    expect(testRun.tests).toHaveLength(4);
  });

  it("parses a JUnit XML report", async () => {
    const reportPath = resolve(
      process.cwd(),
      "sample-data",
      "junit",
      "junit-results.xml",
    );

    const testRun =
      await parseTestRunReport(reportPath);

    expect(testRun.format).toBe("junit");

    expect(testRun.runId).toBe(
      "junit-results.xml-2026-07-30T18:30:00.000Z",
    );

    expect(testRun.startedAt).toBe(
      "2026-07-30T18:30:00.000Z",
    );

    expect(testRun.durationMs).toBe(36850);
    expect(testRun.tests).toHaveLength(4);

    expect(
      testRun.tests.map((test) => test.status),
    ).toEqual([
      "passed",
      "failed",
      "skipped",
      "timedOut",
    ]);
  });

  it("rejects unsupported report formats", async () => {
    const reportPath = resolve(
      process.cwd(),
      "unsupported-report.txt",
    );

    await expect(
      parseTestRunReport(reportPath),
    ).rejects.toThrow(
      "Unsupported report format. Supported formats are Playwright JSON and JUnit XML.",
    );
  });
});