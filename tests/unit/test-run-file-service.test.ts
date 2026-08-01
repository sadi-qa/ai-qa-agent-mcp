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

    expect(files).toHaveLength(2);

    const playwrightFile = files.find(
      (file) =>
        file.fileName === "playwright-results.json",
    );

    const junitFile = files.find(
      (file) =>
        file.fileName === "junit-results.xml",
    );

    expect(playwrightFile).toMatchObject({
      fileName: "playwright-results.json",
      format: "playwright-json",
    });

    expect(junitFile).toMatchObject({
      fileName: "junit-results.xml",
      format: "junit",
    });

    for (const file of files) {
      expect(file.filePath).toContain(
        "sample-data",
      );

      expect(file.sizeBytes).toBeGreaterThan(0);
      expect(file.modifiedAt).toBeTruthy();
    }

    expect(
      new Date(files[0]!.modifiedAt).getTime(),
    ).toBeGreaterThanOrEqual(
      new Date(files[1]!.modifiedAt).getTime(),
    );
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