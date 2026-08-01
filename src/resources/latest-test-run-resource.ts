import { relative } from "node:path";

import type { ReadResourceResult } from "@modelcontextprotocol/sdk/types.js";

import { applicationConfig } from "../config/application-config.js";
import { listTestRunFiles } from "../services/test-run-file-service.js";
import { parseTestRunReport } from "../services/test-run-parser-service.js";

export const latestTestRunResourceUri =
  "test-run://latest";

export async function readLatestTestRunResource(
  requestedUri: string = latestTestRunResourceUri,
): Promise<ReadResourceResult> {
  const files = await listTestRunFiles(
    applicationConfig.reportsDirectory,
  );

  const latestSupportedFile = files[0];

  if (!latestSupportedFile) {
    throw new Error(
      "No supported Playwright JSON or JUnit XML test runs were found in the approved reports directory.",
    );
  }

  if (
    latestSupportedFile.sizeBytes >
    applicationConfig.maximumReportSizeBytes
  ) {
    throw new Error(
      "The latest report exceeds the maximum allowed file size.",
    );
  }

  const testRun = await parseTestRunReport(
    latestSupportedFile.filePath,
  );

  const reportPath = relative(
    applicationConfig.reportsDirectory,
    latestSupportedFile.filePath,
  );

  const resourceData = {
    reportPath,
    modifiedAt: latestSupportedFile.modifiedAt,
    sizeBytes: latestSupportedFile.sizeBytes,
    runId: testRun.runId,
    format: testRun.format,
    ...(testRun.startedAt
      ? { startedAt: testRun.startedAt }
      : {}),
    durationMs: testRun.durationMs,
    tests: testRun.tests,
  };

  return {
    contents: [
      {
        uri: requestedUri,
        mimeType: "application/json",
        text: JSON.stringify(resourceData, null, 2),
      },
    ],
  };
}