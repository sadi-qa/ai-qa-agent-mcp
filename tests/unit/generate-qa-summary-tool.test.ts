import { describe, expect, it } from "vitest";

import { executeGenerateQaSummary } from "../../src/tools/generate-qa-summary-tool.js";

describe("executeGenerateQaSummary", () => {
  it("generates a complete QA execution summary", async () => {
    const result = await executeGenerateQaSummary({
      reportPath: "json/playwright-results.json",
    });

    expect(result.reportPath).toContain("json");
    expect(result.format).toBe("playwright-json");
    expect(result.startedAt).toBe(
      "2026-07-30T18:30:00.000Z",
    );

    expect(result.qaSummary.metrics).toMatchObject({
      totalTests: 4,
      passedTests: 1,
      failedTests: 1,
      skippedTests: 1,
      flakyTests: 1,
      passRate: 66.67,
    });

    expect(
      result.qaSummary.releaseRecommendation,
    ).toBe("NO-GO");

    expect(
      result.qaSummary.failureAnalysis.totalFailures,
    ).toBe(2);

    expect(result.qaSummary.risks).toEqual(
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
  });

  it("returns a Markdown QA report", async () => {
    const result = await executeGenerateQaSummary({
      reportPath: "json/playwright-results.json",
    });

    expect(result.qaSummary.markdown).toContain(
      "# QA Execution Summary",
    );

    expect(result.qaSummary.markdown).toContain(
      "**NO-GO**",
    );

    expect(result.qaSummary.disclaimer).toContain(
      "QA engineer must review",
    );
  });

  it("rejects paths outside the approved directory", async () => {
    await expect(
      executeGenerateQaSummary({
        reportPath: "../package.json",
      }),
    ).rejects.toThrow(
      "Access denied: requested path is outside the approved directory.",
    );
  });

  it("rejects unsupported report formats", async () => {
    await expect(
      executeGenerateQaSummary({
        reportPath: "junit/results.xml",
      }),
    ).rejects.toThrow(
      "Unsupported report format. Only Playwright JSON reports are currently supported.",
    );
  });
});