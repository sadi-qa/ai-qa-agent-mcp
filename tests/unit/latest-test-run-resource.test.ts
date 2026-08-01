import { relative } from "node:path";

import type { ReadResourceResult } from "@modelcontextprotocol/sdk/types.js";
import { describe, expect, it } from "vitest";

import { applicationConfig } from "../../src/config/application-config.js";
import {
  latestTestRunResourceUri,
  readLatestTestRunResource,
} from "../../src/resources/latest-test-run-resource.js";
import { listTestRunFiles } from "../../src/services/test-run-file-service.js";

function getTextResourceContent(
  result: ReadResourceResult,
): Extract<
  ReadResourceResult["contents"][number],
  { text: string }
> {
  const content = result.contents[0];

  if (!content) {
    throw new Error(
      "Expected the resource response to contain one item.",
    );
  }

  if (!("text" in content)) {
    throw new Error(
      "Expected the resource response to contain text content.",
    );
  }

  return content;
}

describe("readLatestTestRunResource", () => {
  it("returns the latest normalized supported test run", async () => {
    const availableFiles = await listTestRunFiles(
      applicationConfig.reportsDirectory,
    );

    const latestFile = availableFiles[0];

    if (!latestFile) {
      throw new Error(
        "Expected at least one supported test report.",
      );
    }

    const result =
      await readLatestTestRunResource();

    expect(result.contents).toHaveLength(1);

    const content = getTextResourceContent(result);

    expect(content.uri).toBe(
      latestTestRunResourceUri,
    );

    expect(content.mimeType).toBe(
      "application/json",
    );

    const resourceData = JSON.parse(
      content.text,
    ) as {
      reportPath: string;
      modifiedAt: string;
      sizeBytes: number;
      runId: string;
      format: "playwright-json" | "junit";
      startedAt?: string;
      durationMs: number;
      tests: Array<{
        id: string;
        status: string;
      }>;
    };

    const expectedReportPath = relative(
      applicationConfig.reportsDirectory,
      latestFile.filePath,
    );

    expect(resourceData.reportPath).toBe(
      expectedReportPath,
    );

    expect(resourceData.modifiedAt).toBe(
      latestFile.modifiedAt,
    );

    expect(resourceData.sizeBytes).toBe(
      latestFile.sizeBytes,
    );

    expect(resourceData.runId).toContain(
      latestFile.fileName,
    );

    expect(resourceData.format).toBe(
      latestFile.format,
    );

    expect(resourceData.startedAt).toBe(
      "2026-07-30T18:30:00.000Z",
    );

    expect(resourceData.tests).toHaveLength(4);

    const testStatuses = resourceData.tests.map(
      (test) => test.status,
    );

    if (resourceData.format === "junit") {
      expect(resourceData.durationMs).toBe(36850);

      expect(testStatuses).toEqual([
        "passed",
        "failed",
        "skipped",
        "timedOut",
      ]);
    } else {
      expect(resourceData.durationMs).toBe(39050);

      expect(testStatuses).toEqual([
        "passed",
        "failed",
        "skipped",
        "flaky",
      ]);
    }

    expect(resourceData.tests).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "tests/auth/login.spec.ts::locked user sees an error message::chromium",
          status: "failed",
        }),
        expect.objectContaining({
          id: "tests/checkout/checkout.spec.ts::customer completes checkout::chromium",
        }),
      ]),
    );
  });

  it("uses the requested URI in the resource response", async () => {
    const requestedUri = "test-run://latest";

    const result =
      await readLatestTestRunResource(requestedUri);

    const content = getTextResourceContent(result);

    expect(content.uri).toBe(requestedUri);
  });
});