import { stat } from "node:fs/promises";
import { extname, relative } from "node:path";

import { applicationConfig } from "../config/application-config.js";
import { parsePlaywrightJsonReport } from "../parsers/playwright-json-parser.js";
import { resolveSafePath } from "../services/safe-path-service.js";
import { createTestRunSummary } from "../services/test-run-summary-service.js";
import type { TestRunSummary } from "../types/test-run-summary.js";

export interface GetTestRunSummaryInput {
  reportPath: string;
}

export interface GetTestRunSummaryResult {
  reportPath: string;
  runId: string;
  format: "playwright-json";
  startedAt?: string;
  summary: TestRunSummary;
}

export async function executeGetTestRunSummary(
  input: GetTestRunSummaryInput,
): Promise<GetTestRunSummaryResult> {
  const safeReportPath = resolveSafePath(
    applicationConfig.reportsDirectory,
    input.reportPath,
  );

  const extension = extname(safeReportPath).toLowerCase();

  if (extension !== ".json") {
    throw new Error(
      "Unsupported report format. Only Playwright JSON reports are currently supported.",
    );
  }

  const fileStats = await stat(safeReportPath);

  if (!fileStats.isFile()) {
    throw new Error(
      "The requested report path does not point to a file.",
    );
  }

  if (
    fileStats.size >
    applicationConfig.maximumReportSizeBytes
  ) {
    throw new Error(
      "The requested report exceeds the maximum allowed file size.",
    );
  }

  const testRun =
    await parsePlaywrightJsonReport(safeReportPath);

  const summary = createTestRunSummary(testRun);

  return {
    reportPath: relative(
      applicationConfig.reportsDirectory,
      safeReportPath,
    ),
    runId: testRun.runId,
    format: "playwright-json",
    ...(testRun.startedAt
      ? { startedAt: testRun.startedAt }
      : {}),
    summary,
  };
}