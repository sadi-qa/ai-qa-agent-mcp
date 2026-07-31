import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { listTestRunFiles } from "../../src/services/test-run-file-service.js";

describe("listTestRunFiles", () => {
  it("finds supported test-result files inside nested folders", async () => {
    const sampleDataDirectory = resolve(
      process.cwd(),
      "sample-data",
    );

    const files = await listTestRunFiles(
      sampleDataDirectory,
    );

    expect(files).toHaveLength(1);

    expect(files[0]).toMatchObject({
      fileName: "playwright-results.json",
      format: "playwright-json",
    });

    expect(files[0]?.filePath).toContain(
      "sample-data",
    );

    expect(files[0]?.sizeBytes).toBeGreaterThan(0);
    expect(files[0]?.modifiedAt).toBeTruthy();
  });

  it("returns an empty array when no supported files exist", async () => {
    const emptyDirectory = resolve(
      process.cwd(),
      "reports",
    );

    const files = await listTestRunFiles(
      emptyDirectory,
    );

    expect(files).toEqual([]);
  });
});