import type { ReadResourceResult } from "@modelcontextprotocol/sdk/types.js";
import { describe, expect, it } from "vitest";

import {
  latestTestRunResourceUri,
  readLatestTestRunResource,
} from "../../src/resources/latest-test-run-resource.js";

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
  it("returns the latest normalized Playwright test run", async () => {
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
      format: string;
      startedAt?: string;
      durationMs: number;
      tests: Array<{
        id: string;
        status: string;
      }>;
    };

    expect(resourceData.reportPath).toMatch(
      /json[\\/]playwright-results\.json/,
    );

    expect(resourceData.modifiedAt).toBeTruthy();
    expect(resourceData.sizeBytes).toBeGreaterThan(0);

    expect(resourceData.runId).toBe(
      "playwright-results.json-2026-07-30T18:30:00.000Z",
    );

    expect(resourceData.format).toBe(
      "playwright-json",
    );

    expect(resourceData.startedAt).toBe(
      "2026-07-30T18:30:00.000Z",
    );

    expect(resourceData.durationMs).toBe(39050);
    expect(resourceData.tests).toHaveLength(4);

    expect(
      resourceData.tests.map((test) => test.status),
    ).toEqual([
      "passed",
      "failed",
      "skipped",
      "flaky",
    ]);

    expect(resourceData.tests).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "tests/auth/login.spec.ts::locked user sees an error message::chromium",
          status: "failed",
        }),
        expect.objectContaining({
          id: "tests/checkout/checkout.spec.ts::customer completes checkout::chromium",
          status: "flaky",
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