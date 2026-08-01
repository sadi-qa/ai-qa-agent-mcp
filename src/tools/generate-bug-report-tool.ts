import { stat } from "node:fs/promises";
import { relative } from "node:path";

import { applicationConfig } from "../config/application-config.js";
import { createBugReportDraft } from "../services/bug-report-service.js";
import { resolveSafePath } from "../services/safe-path-service.js";
import { parseTestRunReport } from "../services/test-run-parser-service.js";
import type { BugReportDraft } from "../types/bug-report.js";
import type { TestRun } from "../types/test-result.js";

export interface GenerateBugReportInput {
  reportPath: string;
  testId: string;
}

export interface GenerateBugReportResult {
  reportPath: string;
  runId: string;
  format: TestRun["format"];
  startedAt?: string;
  bugReport: BugReportDraft;
}

export async function executeGenerateBugReport(
  input: GenerateBugReportInput,
): Promise<GenerateBugReportResult> {
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

  const bugReport = createBugReportDraft(
    testRun,
    normalizedReportPath,
    input.testId,
  );

  return {
    reportPath: normalizedReportPath,
    runId: testRun.runId,
    format: testRun.format,
    ...(testRun.startedAt
      ? { startedAt: testRun.startedAt }
      : {}),
    bugReport,
  };
}