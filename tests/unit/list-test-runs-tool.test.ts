import { describe, expect, it } from "vitest";

import { executeListTestRuns } from "../../src/tools/list-test-runs-tool.js";

describe("executeListTestRuns", () => {
  it("returns available test-result files", async () => {
    const result = await executeListTestRuns();

    expect(result.totalFiles).toBe(1);
    expect(result.files).toHaveLength(1);

    expect(result.files[0]).toMatchObject({
      fileName: "playwright-results.json",
      format: "playwright-json",
    });

    expect(result.reportsDirectory).toContain(
      "sample-data",
    );
  });
});