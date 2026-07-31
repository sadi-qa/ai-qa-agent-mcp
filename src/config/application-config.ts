import { resolve } from "node:path";

const projectRoot = resolve(process.cwd());

const configuredReportsDirectory =
  process.env.QA_REPORTS_DIRECTORY ?? "sample-data";

export const applicationConfig = {
  projectRoot,
  reportsDirectory: resolve(
    projectRoot,
    configuredReportsDirectory,
  ),
  maximumReportSizeBytes: 5 * 1024 * 1024,
} as const;