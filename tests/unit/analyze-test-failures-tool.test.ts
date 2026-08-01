import { describe, expect, it } from "vitest";

import { executeAnalyzeTestFailures } from "../../src/tools/analyze-test-failures-tool.js";

describe("executeAnalyzeTestFailures", () => {
  it("returns failure analysis for a Playwright JSON report", async () => {
    const result = await executeAnalyzeTestFailures({
      reportPath: "json/playwright-results.json",
    });

    expect(result.reportPath).toContain("json");
    expect(result.format).toBe("playwright-json");

    expect(result.startedAt).toBe(
      "2026-07-30T18:30:00.000Z",
    );

    expect(result.analysis.totalFailures).toBe(2);
    expect(result.analysis.affectedTests).toBe(2);
    expect(result.analysis.categories).toHaveLength(2);

    expect(result.disclaimer).toContain(
      "A QA engineer must review",
    );
  });

  it("returns authentication and timeout groups for Playwright", async () => {
    const result = await executeAnalyzeTestFailures({
      reportPath: "json/playwright-results.json",
    });

    const authenticationGroup =
      result.analysis.categories.find(
        (group) =>
          group.category === "authentication",
      );

    expect(authenticationGroup).toMatchObject({
      category: "authentication",
      likelySource: "possible-product-defect",
      count: 1,
    });

    const timeoutGroup =
      result.analysis.categories.find(
        (group) => group.category === "timeout",
      );

    expect(timeoutGroup).toMatchObject({
      category: "timeout",
      likelySource: "possible-automation-issue",
      count: 1,
    });
  });

  it("returns failure analysis for a JUnit XML report", async () => {
    const result = await executeAnalyzeTestFailures({
      reportPath: "junit/junit-results.xml",
    });

    expect(result.reportPath).toContain("junit");
    expect(result.format).toBe("junit");

    expect(result.startedAt).toBe(
      "2026-07-30T18:30:00.000Z",
    );

    expect(result.analysis.totalFailures).toBe(2);
    expect(result.analysis.affectedTests).toBe(2);

    expect(result.analysis.categories).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          category: "authentication",
          likelySource: "possible-product-defect",
          count: 1,
        }),
        expect.objectContaining({
          category: "timeout",
          likelySource: "requires-investigation",
          count: 1,
        }),
      ]),
    );

    expect(result.disclaimer).toContain(
      "A QA engineer must review",
    );
  });

  it("rejects paths outside the approved directory", async () => {
    await expect(
      executeAnalyzeTestFailures({
        reportPath: "../package.json",
      }),
    ).rejects.toThrow(
      "Access denied: requested path is outside the approved directory.",
    );
  });
});