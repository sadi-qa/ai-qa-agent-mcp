import { stat } from "node:fs/promises";
import { relative } from "node:path";

import { applicationConfig } from "../config/application-config.js";
import { resolveSafePath } from "../services/safe-path-service.js";
import { parseTestRunReport } from "../services/test-run-parser-service.js";
import { createTestRunSummary } from "../services/test-run-summary-service.js";
import type { TestRun } from "../types/test-result.js";
import type { TestRunSummary } from "../types/test-run-summary.js";

export interface GetTestRunSummaryInput {
  reportPath: string;
}

export interface GetTestRunSummaryResult {
  reportPath: string;
  runId: string;
  format: TestRun["format"];
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
    await parseTestRunReport(safeReportPath);

  const summary = createTestRunSummary(testRun);

  return {
    reportPath: relative(
      applicationConfig.reportsDirectory,
      safeReportPath,
    ),
    runId: testRun.runId,
    format: testRun.format,
    ...(testRun.startedAt
      ? { startedAt: testRun.startedAt }
      : {}),
    summary,
  };
}