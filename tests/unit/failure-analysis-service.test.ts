import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { parsePlaywrightJsonReport } from "../../src/parsers/playwright-json-parser.js";
import { analyzeFailures } from "../../src/services/failure-analysis-service.js";
import type { NormalizedTestResult } from "../../src/types/test-result.js";

describe("analyzeFailures", () => {
  it("analyzes failed and flaky tests from a Playwright report", async () => {
    const reportPath = resolve(
      process.cwd(),
      "sample-data",
      "json",
      "playwright-results.json",
    );

    const testRun =
      await parsePlaywrightJsonReport(reportPath);

    const analysis = analyzeFailures(testRun.tests);

    expect(analysis.totalFailures).toBe(2);
    expect(analysis.affectedTests).toBe(2);
    expect(analysis.categories).toHaveLength(2);

    const authenticationGroup =
      analysis.categories.find(
        (group) =>
          group.category === "authentication",
      );

    expect(authenticationGroup).toBeDefined();
    expect(
      authenticationGroup?.likelySource,
    ).toBe("possible-product-defect");
    expect(authenticationGroup?.count).toBe(1);

    const timeoutGroup = analysis.categories.find(
      (group) => group.category === "timeout",
    );

    expect(timeoutGroup).toBeDefined();
    expect(timeoutGroup?.likelySource).toBe(
      "possible-automation-issue",
    );
    expect(timeoutGroup?.count).toBe(1);
  });

  it("classifies locator failures as possible automation issues", () => {
    const locatorFailure: NormalizedTestResult = {
      id: "inventory.spec.ts::product is visible::chromium",
      title: "product is visible",
      file: "tests/inventory/inventory.spec.ts",
      project: "chromium",
      status: "failed",
      durationMs: 5000,
      retry: 0,
      errors: [
        {
          message:
            "Locator element not found for product card.",
          stack:
            "Error: locator.click failed at inventory.spec.ts:20:10",
        },
      ],
    };

    const analysis = analyzeFailures([
      locatorFailure,
    ]);

    expect(analysis.totalFailures).toBe(1);
    expect(analysis.categories[0]).toMatchObject({
      category: "locator",
      likelySource: "possible-automation-issue",
      count: 1,
    });
  });

  it("returns an empty analysis when no tests failed", () => {
    const passedTest: NormalizedTestResult = {
      id: "login.spec.ts::valid login::chromium",
      title: "valid login",
      file: "tests/auth/login.spec.ts",
      project: "chromium",
      status: "passed",
      durationMs: 1200,
      retry: 0,
      errors: [],
    };

    const analysis = analyzeFailures([passedTest]);

    expect(analysis).toEqual({
      totalFailures: 0,
      affectedTests: 0,
      categories: [],
    });
  });
});