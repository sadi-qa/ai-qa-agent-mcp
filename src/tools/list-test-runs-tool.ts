import { applicationConfig } from "../config/application-config.js";
import {
  listTestRunFiles,
  type TestRunFile,
} from "../services/test-run-file-service.js";

export interface ListTestRunsResult {
  reportsDirectory: string;
  totalFiles: number;
  files: TestRunFile[];
}

export async function executeListTestRuns(): Promise<ListTestRunsResult> {
  const files = await listTestRunFiles(
    applicationConfig.reportsDirectory,
  );

  return {
    reportsDirectory: applicationConfig.reportsDirectory,
    totalFiles: files.length,
    files,
  };
}