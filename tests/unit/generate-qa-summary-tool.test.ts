import { describe, expect, it } from "vitest";

import { executeGenerateQaSummary } from "../../src/tools/generate-qa-summary-tool.js";

describe("executeGenerateQaSummary", () => {
  it("generates a complete Playwright QA execution summary", async () => {
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
      timedOutTests: 0,
      flakyTests: 1,
      passRate: 66.67,
      failureRate: 33.33,
      skipRate: 25,
      durationMs: 39050,
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

  it("generates a complete JUnit QA execution summary", async () => {
    const result = await executeGenerateQaSummary({
      reportPath: "junit/junit-results.xml",
    });

    expect(result.reportPath).toContain("junit");
    expect(result.format).toBe("junit");

    expect(result.startedAt).toBe(
      "2026-07-30T18:30:00.000Z",
    );

    expect(result.qaSummary.metrics).toEqual({
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
          description:
            "1 failed test and 1 timed-out test require investigation.",
        }),
        expect.objectContaining({
          level: "low",
          title: "Skipped test coverage",
          description:
            "1 skipped test did not provide execution evidence.",
        }),
      ]),
    );

    expect(result.qaSummary.risks).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: "Flaky test behavior",
        }),
      ]),
    );
  });

  it("returns Markdown QA reports for both formats", async () => {
    const playwrightResult =
      await executeGenerateQaSummary({
        reportPath: "json/playwright-results.json",
      });

    const junitResult =
      await executeGenerateQaSummary({
        reportPath: "junit/junit-results.xml",
      });

    expect(
      playwrightResult.qaSummary.markdown,
    ).toContain("# QA Execution Summary");

    expect(
      junitResult.qaSummary.markdown,
    ).toContain("# QA Execution Summary");

    expect(
      playwrightResult.qaSummary.markdown,
    ).toContain("**NO-GO**");

    expect(
      junitResult.qaSummary.markdown,
    ).toContain("**NO-GO**");

    expect(
      junitResult.qaSummary.markdown,
    ).toMatch(
      /Report: junit[\\/]junit-results\.xml/,
    );

    expect(
      junitResult.qaSummary.disclaimer,
    ).toContain("QA engineer must review");
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
});