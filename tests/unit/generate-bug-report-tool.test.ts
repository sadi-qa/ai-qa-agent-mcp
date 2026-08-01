import { describe, expect, it } from "vitest";

import { executeGenerateBugReport } from "../../src/tools/generate-bug-report-tool.js";

describe("executeGenerateBugReport", () => {
  it("generates a draft bug report for a failed Playwright test", async () => {
    const result = await executeGenerateBugReport({
      reportPath: "json/playwright-results.json",
      testId:
        "tests/auth/login.spec.ts::locked user sees an error message::chromium",
    });

    expect(result.reportPath).toContain("json");
    expect(result.format).toBe("playwright-json");

    expect(result.startedAt).toBe(
      "2026-07-30T18:30:00.000Z",
    );

    expect(result.bugReport.status).toBe("draft");

    expect(result.bugReport.title).toContain(
      "locked user sees an error message",
    );

    expect(result.bugReport.severity).toBe("high");
    expect(result.bugReport.priority).toBe("P2");

    expect(result.bugReport.category).toBe(
      "authentication",
    );

    expect(result.bugReport.actualResult).toContain(
      "Invalid credentials",
    );
  });

  it("generates a draft bug report for a flaky Playwright test", async () => {
    const result = await executeGenerateBugReport({
      reportPath: "json/playwright-results.json",
      testId:
        "tests/checkout/checkout.spec.ts::customer completes checkout::chromium",
    });

    expect(result.bugReport.status).toBe("draft");
    expect(result.bugReport.severity).toBe("medium");
    expect(result.bugReport.priority).toBe("P3");
    expect(result.bugReport.category).toBe("timeout");

    expect(result.bugReport.likelySource).toBe(
      "possible-automation-issue",
    );

    expect(result.bugReport.evidence.testStatus).toBe(
      "flaky",
    );

    expect(result.bugReport.evidence.retry).toBe(1);
  });

  it("generates a draft bug report for a failed JUnit test", async () => {
    const result = await executeGenerateBugReport({
      reportPath: "junit/junit-results.xml",
      testId:
        "tests/auth/login.spec.ts::locked user sees an error message::chromium",
    });

    expect(result.reportPath).toContain("junit");
    expect(result.format).toBe("junit");

    expect(result.startedAt).toBe(
      "2026-07-30T18:30:00.000Z",
    );

    expect(result.bugReport.status).toBe("draft");
    expect(result.bugReport.severity).toBe("high");
    expect(result.bugReport.priority).toBe("P2");

    expect(result.bugReport.category).toBe(
      "authentication",
    );

    expect(result.bugReport.likelySource).toBe(
      "possible-product-defect",
    );

    expect(result.bugReport.evidence.testStatus).toBe(
      "failed",
    );

    expect(result.bugReport.actualResult).toContain(
      "Invalid credentials",
    );
  });

  it("generates a draft bug report for a timed-out JUnit test", async () => {
    const result = await executeGenerateBugReport({
      reportPath: "junit/junit-results.xml",
      testId:
        "tests/checkout/checkout.spec.ts::customer completes checkout::chromium",
    });

    expect(result.format).toBe("junit");
    expect(result.bugReport.status).toBe("draft");
    expect(result.bugReport.severity).toBe("medium");
    expect(result.bugReport.priority).toBe("P3");
    expect(result.bugReport.category).toBe("timeout");

    expect(result.bugReport.likelySource).toBe(
      "requires-investigation",
    );

    expect(result.bugReport.evidence.testStatus).toBe(
      "timedOut",
    );

    expect(result.bugReport.evidence.retry).toBe(0);

    expect(result.bugReport.actualResult).toContain(
      "Test timeout of 30000ms exceeded",
    );
  });

  it("rejects an unknown test ID", async () => {
    await expect(
      executeGenerateBugReport({
        reportPath: "json/playwright-results.json",
        testId: "unknown-test-id",
      }),
    ).rejects.toThrow(
      "Test not found in report: unknown-test-id",
    );
  });

  it("rejects paths outside the approved directory", async () => {
    await expect(
      executeGenerateBugReport({
        reportPath: "../package.json",
        testId: "any-test-id",
      }),
    ).rejects.toThrow(
      "Access denied: requested path is outside the approved directory.",
    );
  });
});