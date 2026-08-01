import { describe, expect, it } from "vitest";

import { executeListTestRuns } from "../../src/tools/list-test-runs-tool.js";

describe("executeListTestRuns", () => {
  it("returns available Playwright and JUnit test-result files", async () => {
    const result = await executeListTestRuns();

    expect(result.totalFiles).toBe(2);
    expect(result.files).toHaveLength(2);

    expect(result.files).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          fileName: "playwright-results.json",
          format: "playwright-json",
        }),
        expect.objectContaining({
          fileName: "junit-results.xml",
          format: "junit",
        }),
      ]),
    );

    expect(result.reportsDirectory).toContain(
      "sample-data",
    );
  });
});