import { readFile } from "node:fs/promises";
import { basename } from "node:path";

import type {
  PlaywrightJsonReport,
  PlaywrightSpec,
  PlaywrightSuite,
  PlaywrightTest,
} from "../types/playwright-report.js";
import type {
  NormalizedTestResult,
  TestError,
  TestRun,
  TestStatus,
} from "../types/test-result.js";

function mapTestStatus(test: PlaywrightTest): TestStatus {
  if (test.status === "flaky") {
    return "flaky";
  }

  const latestAttempt = test.results.at(-1);

  if (!latestAttempt) {
    return "skipped";
  }

  switch (latestAttempt.status) {
    case "passed":
      return "passed";
    case "failed":
      return "failed";
    case "skipped":
      return "skipped";
    case "timedOut":
      return "timedOut";
    default:
      return "failed";
  }
}

function collectErrors(test: PlaywrightTest): TestError[] {
  return test.results.flatMap((attempt) =>
    attempt.errors.map((error) => ({
      message: error.message,
      ...(error.stack ? { stack: error.stack } : {}),
    })),
  );
}

function calculateDuration(test: PlaywrightTest): number {
  return test.results.reduce(
    (total, attempt) => total + attempt.duration,
    0,
  );
}

function createNormalizedResult(
  suite: PlaywrightSuite,
  spec: PlaywrightSpec,
  test: PlaywrightTest,
): NormalizedTestResult {
  const latestAttempt = test.results.at(-1);
  const project = test.projectName ?? test.projectId;

  return {
    id: `${suite.file}::${spec.title}::${project}`,
    title: spec.title,
    file: suite.file,
    project,
    status: mapTestStatus(test),
    durationMs: calculateDuration(test),
    retry: latestAttempt?.retry ?? 0,
    errors: collectErrors(test),
  };
}

function parseSuite(suite: PlaywrightSuite): NormalizedTestResult[] {
  const currentSuiteResults = suite.specs.flatMap((spec) =>
    spec.tests.map((test) =>
      createNormalizedResult(suite, spec, test),
    ),
  );

  const nestedSuiteResults =
    suite.suites?.flatMap((nestedSuite) =>
      parseSuite(nestedSuite),
    ) ?? [];

  return [...currentSuiteResults, ...nestedSuiteResults];
}

export async function parsePlaywrightJsonReport(
  filePath: string,
): Promise<TestRun> {
  const fileContent = await readFile(filePath, "utf8");
  const report = JSON.parse(fileContent) as PlaywrightJsonReport;

  const tests = report.suites.flatMap((suite) =>
    parseSuite(suite),
  );

  return {
    runId: `${basename(filePath)}-${report.stats.startTime}`,
    sourceFile: filePath,
    format: "playwright-json",
    startedAt: report.stats.startTime,
    durationMs: report.stats.duration,
    tests,
  };
}