import { stat } from "node:fs/promises";
import { relative } from "node:path";

import { applicationConfig } from "../config/application-config.js";
import { createQaExecutionSummary } from "../services/qa-summary-service.js";
import { resolveSafePath } from "../services/safe-path-service.js";
import { parseTestRunReport } from "../services/test-run-parser-service.js";
import type { QaExecutionSummary } from "../types/qa-summary.js";
import type { TestRun } from "../types/test-result.js";

export interface GenerateQaSummaryInput {
  reportPath: string;
}

export interface GenerateQaSummaryResult {
  reportPath: string;
  runId: string;
  format: TestRun["format"];
  startedAt?: string;
  qaSummary: QaExecutionSummary;
}

export async function executeGenerateQaSummary(
  input: GenerateQaSummaryInput,
): Promise<GenerateQaSummaryResult> {
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

  const normalizedReportPath = relative(
    applicationConfig.reportsDirectory,
    safeReportPath,
  );

  const qaSummary = createQaExecutionSummary(
    testRun,
    normalizedReportPath,
  );

  return {
    reportPath: normalizedReportPath,
    runId: testRun.runId,
    format: testRun.format,
    ...(testRun.startedAt
      ? { startedAt: testRun.startedAt }
      : {}),
    qaSummary,
  };
}