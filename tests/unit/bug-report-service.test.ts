import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { parsePlaywrightJsonReport } from "../../src/parsers/playwright-json-parser.js";
import { createBugReportDraft } from "../../src/services/bug-report-service.js";

describe("createBugReportDraft", () => {
  it("generates a draft bug report for a failed test", async () => {
    const reportPath = resolve(
      process.cwd(),
      "sample-data",
      "json",
      "playwright-results.json",
    );

    const testRun =
      await parsePlaywrightJsonReport(reportPath);

    const failedTest = testRun.tests.find(
      (test) => test.status === "failed",
    );

    expect(failedTest).toBeDefined();

    const bugReport = createBugReportDraft(
      testRun,
      "json/playwright-results.json",
      failedTest!.id,
    );

    expect(bugReport.status).toBe("draft");
    expect(bugReport.title).toContain(
      "locked user sees an error message",
    );
    expect(bugReport.severity).toBe("high");
    expect(bugReport.priority).toBe("P2");
    expect(bugReport.category).toBe(
      "authentication",
    );
    expect(bugReport.likelySource).toBe(
      "possible-product-defect",
    );
    expect(bugReport.actualResult).toContain(
      "Invalid credentials",
    );
    expect(bugReport.evidence.testStatus).toBe(
      "failed",
    );
    expect(bugReport.disclaimer).toContain(
      "QA engineer must review",
    );
  });

  it("generates a medium-priority draft for a flaky test", async () => {
    const reportPath = resolve(
      process.cwd(),
      "sample-data",
      "json",
      "playwright-results.json",
    );

    const testRun =
      await parsePlaywrightJsonReport(reportPath);

    const flakyTest = testRun.tests.find(
      (test) => test.status === "flaky",
    );

    expect(flakyTest).toBeDefined();

    const bugReport = createBugReportDraft(
      testRun,
      "json/playwright-results.json",
      flakyTest!.id,
    );

    expect(bugReport.severity).toBe("medium");
    expect(bugReport.priority).toBe("P3");
    expect(bugReport.category).toBe("timeout");
    expect(bugReport.evidence.testStatus).toBe(
      "flaky",
    );
    expect(bugReport.evidence.retry).toBe(1);
  });

  it("rejects an unknown test ID", async () => {
    const reportPath = resolve(
      process.cwd(),
      "sample-data",
      "json",
      "playwright-results.json",
    );

    const testRun =
      await parsePlaywrightJsonReport(reportPath);

    expect(() =>
      createBugReportDraft(
        testRun,
        "json/playwright-results.json",
        "unknown-test-id",
      ),
    ).toThrow(
      "Test not found in report: unknown-test-id",
    );
  });

  it("rejects passed tests", async () => {
    const reportPath = resolve(
      process.cwd(),
      "sample-data",
      "json",
      "playwright-results.json",
    );

    const testRun =
      await parsePlaywrightJsonReport(reportPath);

    const passedTest = testRun.tests.find(
      (test) => test.status === "passed",
    );

    expect(passedTest).toBeDefined();

    expect(() =>
      createBugReportDraft(
        testRun,
        "json/playwright-results.json",
        passedTest!.id,
      ),
    ).toThrow(
      "Bug reports can only be generated for failed, timed-out, or flaky tests.",
    );
  });
});