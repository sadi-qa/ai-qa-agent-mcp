import { stat } from "node:fs/promises";
import { relative } from "node:path";

import { applicationConfig } from "../config/application-config.js";
import { analyzeFailures } from "../services/failure-analysis-service.js";
import { resolveSafePath } from "../services/safe-path-service.js";
import { parseTestRunReport } from "../services/test-run-parser-service.js";
import type { FailureAnalysis } from "../types/failure-analysis.js";
import type { TestRun } from "../types/test-result.js";

export interface AnalyzeTestFailuresInput {
  reportPath: string;
}

export interface AnalyzeTestFailuresResult {
  reportPath: string;
  runId: string;
  format: TestRun["format"];
  startedAt?: string;
  analysis: FailureAnalysis;
  disclaimer: string;
}

export async function executeAnalyzeTestFailures(
  input: AnalyzeTestFailuresInput,
): Promise<AnalyzeTestFailuresResult> {
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

  const analysis = analyzeFailures(testRun.tests);

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
    analysis,
    disclaimer:
      "Failure categories and likely sources are automated suggestions. A QA engineer must review the evidence before creating defects or making release decisions.",
  };
}