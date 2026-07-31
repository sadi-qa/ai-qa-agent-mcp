import { describe, expect, it } from "vitest";

import { executeGenerateBugReport } from "../../src/tools/generate-bug-report-tool.js";

describe("executeGenerateBugReport", () => {
  it("generates a draft bug report for a failed test", async () => {
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

  it("generates a draft bug report for a flaky test", async () => {
    const result = await executeGenerateBugReport({
      reportPath: "json/playwright-results.json",
      testId:
        "tests/checkout/checkout.spec.ts::customer completes checkout::chromium",
    });

    expect(result.bugReport.status).toBe("draft");
    expect(result.bugReport.severity).toBe("medium");
    expect(result.bugReport.priority).toBe("P3");
    expect(result.bugReport.category).toBe("timeout");
    expect(result.bugReport.evidence.testStatus).toBe(
      "flaky",
    );
    expect(result.bugReport.evidence.retry).toBe(1);
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

  it("rejects unsupported report formats", async () => {
    await expect(
      executeGenerateBugReport({
        reportPath: "junit/results.xml",
        testId: "any-test-id",
      }),
    ).rejects.toThrow(
      "Unsupported report format. Only Playwright JSON reports are currently supported.",
    );
  });
});